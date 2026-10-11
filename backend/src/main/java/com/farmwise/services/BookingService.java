package com.farmwise.services;

import com.farmwise.dto.BookingRequestDTO;
import com.farmwise.dto.FarmProfileDTO;
import com.farmwise.models.Booking;
import com.farmwise.models.ShopInventoryItem;
import com.farmwise.models.Shop;
import com.farmwise.repositories.BookingRepository;
import com.farmwise.repositories.ShopInventoryRepository;
import com.farmwise.repositories.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShopInventoryRepository shopInventoryRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private FarmProfileService farmProfileService;

    @Autowired
    private FarmMemoryService farmMemoryService;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Booking createBooking(String farmerId, String farmerName, String farmerEmail, BookingRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Booking details are required.");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Reservation quantity must be at least 1 unit. Provided: " + request.getQuantity());
        }

        if (request.getInventoryItemId() == null || request.getInventoryItemId().isBlank()) {
            throw new IllegalArgumentException("Choose a valid product before booking.");
        }
        ShopInventoryItem item = shopInventoryRepository.findById(request.getInventoryItemId())
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found with ID: " + request.getInventoryItemId()));

        // Validate the shop on the server, not only through the farmer-facing listing.
        // Otherwise a caller who guesses an inventory ID could book from a pending dealer
        // or from an inventory record whose shop no longer exists.
        if (item.getShopId() == null || item.getShopId().isBlank()) {
            throw new IllegalArgumentException("This product is not linked to a valid shop.");
        }
        Shop savedShop = shopRepository.findById(item.getShopId())
                .orElseThrow(() -> new IllegalArgumentException("Shop could not be verified. Please refresh the shop listings."));
        boolean demoShop = savedShop.isDemonstrationData();
        boolean verifiedDealer = "VERIFIED".equalsIgnoreCase(savedShop.getVerificationStatus());
        if (!demoShop && !verifiedDealer) {
            throw new IllegalArgumentException("This dealer is not verified yet and cannot accept bookings.");
        }

        Optional<FarmProfileDTO> savedProfile = farmProfileService.getProfileByFarmerId(farmerId);
        if (savedProfile.isPresent() && savedProfile.get().getLocation() != null
                && !savedProfile.get().getLocation().isBlank()) {
            if (!ShopLocationMatcher.matches(savedProfile.get().getLocation(), savedShop)) {
                throw new IllegalArgumentException("This shop is outside your saved farm location. Please choose a local shop.");
            }
        }

        String productType = item.getProductType() == null ? "SEED" : item.getProductType().trim().toUpperCase(Locale.ROOT);
        if (!Set.of("SEED", "FERTILIZER", "PEST_CONTROL", "DISEASE_CONTROL").contains(productType)) {
            throw new IllegalArgumentException("This product category cannot be booked.");
        }
        if ("SEED".equals(productType) && (item.getCropType() == null || !(item.getCropType().equalsIgnoreCase("Rice/Paddy")
                || item.getCropType().equalsIgnoreCase("Rice") || item.getCropType().equalsIgnoreCase("Paddy")))) {
            throw new IllegalArgumentException("Seed booking currently supports paddy/rice seed varieties only.");
        }

        // Enforce the requested 4 bags per acre rule on the server before reserving stock.
        // Inventory quantity represents whole packages/bags, so fractional limits are rounded down.
        String sowingRateNote = "SEED".equals(productType)
                ? calculateSowingRateGuidance(farmerId, item, request.getQuantity())
                : "Product reservation only. Follow the product label and advice from a qualified local agricultural expert; no treatment dosage is provided by FarmWise.";

        if (item.getPrice() == null || !Double.isFinite(item.getPrice()) || item.getPrice() < 0) {
            throw new IllegalArgumentException("This product has no valid price and cannot be booked until the shop updates its listing.");
        }
        if (item.getCurrentStock() == null || item.getCurrentStock() < 0) {
            throw new IllegalArgumentException("This product has invalid stock information and cannot be booked.");
        }
        double unitPrice = item.getPrice();
        double totalAmount = unitPrice * request.getQuantity();
        if (!Double.isFinite(totalAmount)) {
            throw new IllegalArgumentException("The total price is outside the supported range. Please reduce quantity or ask the shop to correct the price.");
        }

        // Safe atomic stock reservation using MongoDB findAndModify
        Query query = new Query(Criteria.where("id").is(item.getId()).and("currentStock").gte(request.getQuantity()));
        Update update = new Update()
                .inc("currentStock", -request.getQuantity())
                .set("lastUpdated", Instant.now());

        ShopInventoryItem reservedItem = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                ShopInventoryItem.class
        );

        if (reservedItem == null) {
            throw new IllegalStateException("Cannot reserve " + request.getQuantity() +
                    " units: Insufficient stock available. Only " + item.getCurrentStock() +
                    " units currently in store inventory.");
        }

        // Snapshot the shop's actual saved address fields; never infer a district or state from a label.
        String bookingShopLocation = item.getShopLocation();
        Optional<Shop> shopRecord = shopRepository.findById(item.getShopId());
        if (shopRecord.isPresent()) {
            Shop shop = shopRecord.get();
            List<String> locationParts = new ArrayList<>();
            if (shop.getLocation() != null && !shop.getLocation().isBlank()) locationParts.add(shop.getLocation().trim());
            if (shop.getDistrict() != null && !shop.getDistrict().isBlank()
                    && locationParts.stream().noneMatch(part -> part.equalsIgnoreCase(shop.getDistrict().trim()))) {
                locationParts.add(shop.getDistrict().trim());
            }
            if (shop.getState() != null && !shop.getState().isBlank()
                    && locationParts.stream().noneMatch(part -> part.equalsIgnoreCase(shop.getState().trim()))) {
                locationParts.add(shop.getState().trim());
            }
            if (!locationParts.isEmpty()) bookingShopLocation = String.join(", ", locationParts);
        }

        // Generate unique booking ID
        String bookingId = "FW-BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Booking booking = new Booking(
                bookingId,
                farmerId,
                farmerName,
                farmerEmail,
                item.getShopId(),
                item.getShopName(),
                bookingShopLocation,
                item.getId(),
                item.getSeedVarietyId(),
                item.getProductName(),
                item.getCropType(),
                item.getVarietyCode(),
                item.getPackageSize(),
                unitPrice,
                request.getQuantity(),
                totalAmount,
                sowingRateNote
        );

        booking.setProductType(productType);
        booking.setProductName(item.getProductName());

        Booking savedBooking;
        try {
            savedBooking = bookingRepository.save(booking);
        } catch (RuntimeException saveError) {
            // If persistence fails after the atomic reservation, restore the reserved stock.
            mongoTemplate.updateFirst(
                    new Query(Criteria.where("id").is(reservedItem.getId())),
                    new Update().inc("currentStock", request.getQuantity()).set("lastUpdated", Instant.now()),
                    ShopInventoryItem.class
            );
            throw saveError;
        }

        // Record in Farm Memory
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("bookingId", savedBooking.getBookingId());
        snapshot.put("shopName", savedBooking.getShopName());
        snapshot.put("shopLocation", savedBooking.getShopLocation());
        snapshot.put("productType", savedBooking.getProductType());
        snapshot.put("productName", savedBooking.getProductName());
        snapshot.put("seedVarietyName", savedBooking.getSeedVarietyName());
        snapshot.put("cropType", savedBooking.getCropType());
        snapshot.put("quantity", savedBooking.getQuantity());
        snapshot.put("packageSize", savedBooking.getPackageSize());
        snapshot.put("totalAmount", savedBooking.getTotalAmount());
        snapshot.put("status", savedBooking.getStatus());

        farmMemoryService.logEvent(
                farmerId,
                "SEED_RESERVED",
                "Product Reservation Confirmed: " + savedBooking.getProductName(),
                "Reserved " + savedBooking.getQuantity() + " units (" + savedBooking.getPackageSize() + ") at " +
                        savedBooking.getShopName() + ". Booking ID: " + savedBooking.getBookingId(),
                snapshot
        );

        return savedBooking;
    }

    public Booking cancelBooking(String farmerId, String bookingIdentifier) {
        Booking current = bookingRepository.findByBookingId(bookingIdentifier)
                .or(() -> bookingRepository.findById(bookingIdentifier))
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingIdentifier));

        if (!current.getFarmerId().equals(farmerId)) {
            throw new IllegalArgumentException("Unauthorized: You do not own this reservation.");
        }

        // Atomically transition CONFIRMED -> CANCELLED so concurrent requests cannot restore stock twice.
        Query bookingQuery = new Query(Criteria.where("bookingId").is(current.getBookingId())
                .and("farmerId").is(farmerId).and("status").is("CONFIRMED"));
        Booking cancelled = mongoTemplate.findAndModify(
                bookingQuery,
                new Update().set("status", "CANCELLED"),
                FindAndModifyOptions.options().returnNew(true),
                Booking.class
        );
        if (cancelled == null) {
            throw new IllegalStateException("Booking is already cancelled or no longer confirmed. Stock can only be restored once.");
        }

        try {
            mongoTemplate.updateFirst(
                    new Query(Criteria.where("id").is(cancelled.getInventoryItemId())),
                    new Update().inc("currentStock", cancelled.getQuantity()).set("lastUpdated", Instant.now()),
                    ShopInventoryItem.class
            );
        } catch (RuntimeException stockError) {
            // Best-effort rollback so the booking does not falsely remain cancelled without restored stock.
            mongoTemplate.updateFirst(
                    new Query(Criteria.where("bookingId").is(cancelled.getBookingId()).and("status").is("CANCELLED")),
                    new Update().set("status", "CONFIRMED"),
                    Booking.class
            );
            throw stockError;
        }
        return cancelled;
    }

    public List<Booking> getBookingsForFarmer(String farmerId) {
        return bookingRepository.findByFarmerIdOrderByBookingDateDesc(farmerId);
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id).or(() -> bookingRepository.findByBookingId(id));
    }

    private String calculateSowingRateGuidance(String farmerId, ShopInventoryItem item, int quantity) {
        FarmProfileDTO profile = farmProfileService.getProfileByFarmerId(farmerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Complete your Farm Profile and save your farm area in acres before booking seeds."));
        Double acres = profile.getFarmAreaAcres();
        if (acres == null || !Double.isFinite(acres) || acres <= 0) {
            throw new IllegalArgumentException(
                    "A valid farm area is required. Update your Farm Profile before booking seeds.");
        }

        int maxBags = SeedBookingLimit.maxBagsForAcres(acres);
        if (maxBags < 1) {
            throw new IllegalArgumentException("Your saved farm area of " + acres
                    + " acre(s) allows fewer than one whole bag under the 4-bags-per-acre booking limit.");
        }
        if (quantity > maxBags) {
            throw new IllegalArgumentException("You can book at most " + maxBags + " seed bag(s) for "
                    + acres + " acre(s) (4 bags per acre). Reduce the quantity to continue.");
        }
        return "Booking quantity checked: maximum " + maxBags + " seed bag(s) for " + acres
                + " acre(s), using the FarmWise limit of 4 bags per acre.";
    }
}
