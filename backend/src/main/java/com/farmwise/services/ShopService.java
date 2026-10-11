package com.farmwise.services;

import com.farmwise.dto.ShopDetailDTO;
import com.farmwise.models.Shop;
import com.farmwise.models.SeedVariety;
import com.farmwise.models.ShopInventoryItem;
import com.farmwise.repositories.ShopInventoryRepository;
import com.farmwise.repositories.ShopRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ShopInventoryRepository shopInventoryRepository;

    @Autowired
    private SeedCatalogService seedCatalogService;

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Avoid creating demo shops and inventory during application startup.
     *
     * Existing shop and inventory records in MongoDB are preserved.
     * This reduces the number of sequential database operations during
     * Render startup and may help prevent deployment timeouts.
     */
    @PostConstruct
    public void initDefaultShopsAndInventory() {
        // Demo shops and inventory are no longer seeded automatically.
        // Existing MongoDB records remain available.
    }

    /**
     * Creates demo shops and inventory when explicitly needed.
     *
     * This method is intentionally not called automatically during startup.
     * Demo records are clearly labelled and must not be represented as
     * verified real businesses or live prices.
     */
    private void seedDemoShopsAndInventoryIfMissing() {
        String[][] districts = {
                {"Adilabad", "Adilabad"},
                {"Bhadradri Kothagudem", "Kothagudem"},
                {"Hanumakonda", "Hanumakonda"},
                {"Hyderabad", "Hyderabad"},
                {"Jagtial", "Jagtial"},
                {"Jangaon", "Jangaon"},
                {"Jayashankar Bhupalpally", "Bhupalpally"},
                {"Jogulamba Gadwal", "Gadwal"},
                {"Kamareddy", "Kamareddy"},
                {"Karimnagar", "Karimnagar"},
                {"Khammam", "Khammam"},
                {"Kumuram Bheem Asifabad", "Asifabad"},
                {"Mahabubabad", "Mahabubabad"},
                {"Mahabubnagar", "Mahabubnagar"},
                {"Mancherial", "Mancherial"},
                {"Medak", "Medak"},
                {"Medchal-Malkajgiri", "Medchal"},
                {"Mulugu", "Mulugu"},
                {"Nagarkurnool", "Nagarkurnool"},
                {"Nalgonda", "Nalgonda"},
                {"Narayanpet", "Narayanpet"},
                {"Nirmal", "Nirmal"},
                {"Nizamabad", "Nizamabad"},
                {"Peddapalli", "Peddapalli"},
                {"Rajanna Sircilla", "Sircilla"},
                {"Rangareddy", "Rangareddy"},
                {"Sangareddy", "Sangareddy"},
                {"Siddipet", "Siddipet"},
                {"Suryapet", "Suryapet"},
                {"Vikarabad", "Vikarabad"},
                {"Wanaparthy", "Wanaparthy"},
                {"Warangal", "Warangal"},
                {"Yadadri Bhuvanagiri", "Bhongir"}
        };

        String[][] shopSuffixes = {
                {"Bhongir", "0.94"},
                {"Alair", "1.00"},
                {"Choutuppal", "1.06"}
        };

        String[][] shopNames = {
                {
                        "Sri Lakshmi Seeds & Fertilizers",
                        "Venkateswara Agro Traders",
                        "Sai Manikanta Seeds & Pesticides"
                }
        };

        List<SeedVariety> seeds = seedCatalogService.getAllSeeds();
        Instant now = Instant.now();

        for (String[] district : districts) {
            String districtName = district[0];

            String districtSlug = districtName
                    .toLowerCase(Locale.ROOT)
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("^-|-$", "");

            for (int shopIndex = 0;
                 shopIndex < shopSuffixes.length;
                 shopIndex++) {

                String shopSlug = districtSlug + "-sample-" + (shopIndex + 1);
                String shopId = "farmwise-demo-shop-" + shopSlug;

                String locality = shopIndex == 0
                        ? district[1]
                        : shopSuffixes[shopIndex][0];

                String location = locality + ", "
                        + districtName + ", Telangana";

                String shopName = shopNames[0][shopIndex];

                Shop shop = shopRepository.findById(shopId)
                        .orElseGet(() -> shopRepository.save(
                                new Shop(
                                        shopId,
                                        shopName,
                                        location,
                                        districtName,
                                        "Telangana",
                                        "",
                                        true
                                )
                        ));

                // Update only FarmWise-generated demo records.
                // Never overwrite dealer records.
                if (shop.isDemonstrationData()
                        && shop.getId() != null
                        && shop.getId().startsWith("farmwise-demo-shop-")) {

                    shop.setName(shopName);
                    shop.setLocation(location);
                    shop.setDistrict(districtName);
                    shop.setState("Telangana");
                    shop.setContactPhone("");

                    shopRepository.save(shop);
                }

                for (int seedIndex = 0;
                     seedIndex < seeds.size();
                     seedIndex++) {

                    SeedVariety seed = seeds.get(seedIndex);

                    if (seed.getId() == null) {
                        continue;
                    }

                    String inventoryId =
                            "farmwise-demo-inv-" + shopSlug + "-" + seed.getId();

                    if (shopInventoryRepository.existsById(inventoryId)) {
                        continue;
                    }

                    String seedName =
                            seed.getName() == null || seed.getName().isBlank()
                                    ? seed.getVarietyCode()
                                    : seed.getName();

                    double basePrice =
                            seed.getPrice() != null && seed.getPrice() > 0
                                    ? seed.getPrice()
                                    : 700.0 + (seedIndex % 5) * 50.0;

                    double multiplier =
                            Double.parseDouble(shopSuffixes[shopIndex][1]);

                    double samplePrice =
                            Math.round(basePrice * multiplier * 100.0) / 100.0;

                    String packageSize =
                            seed.getPackageSize() == null
                                    || seed.getPackageSize().isBlank()
                                    ? "5 kg bag"
                                    : seed.getPackageSize();

                    ShopInventoryItem item = new ShopInventoryItem(
                            inventoryId,
                            shop.getId(),
                            shop.getName(),
                            shop.getLocation(),
                            seed.getId(),
                            seedName,
                            seed.getCropType(),
                            seed.getVarietyCode(),
                            packageSize,
                            samplePrice,
                            20,
                            true
                    );

                    item.setProductName(seedName);

                    item.setDescription(
                            "DEMO SAMPLE ONLY: shop, stock, and price are "
                                    + "illustrative, not verified local business "
                                    + "data. Confirm with a real dealer before "
                                    + "travelling or purchasing."
                    );

                    item.setRecommendedFor(
                            "Sample inventory for testing FarmWise shop "
                                    + "discovery and reservation."
                    );

                    item.setLastUpdated(now);

                    shopInventoryRepository.save(item);
                }
            }
        }
    }

    public Shop submitDealerApplication(Shop application, String farmerId) {
        if (application == null) {
            throw new IllegalArgumentException("Dealer details are required.");
        }

        if (blank(application.getName())
                || blank(application.getLocation())
                || blank(application.getDistrict())
                || blank(application.getContactPhone())
                || blank(application.getDealerLicenseNumber())) {

            throw new IllegalArgumentException(
                    "Shop name, location, district, phone, and dealer licence number are required."
            );
        }

        if (!application.getContactPhone()
                .replaceAll("\\D", "")
                .matches("[0-9]{10,13}")) {

            throw new IllegalArgumentException(
                    "Enter a valid contact phone number."
            );
        }

        application.setId(null);
        application.setState("Telangana");
        application.setDemonstrationData(false);
        application.setOwnerFarmerId(farmerId);
        application.setVerificationStatus("PENDING");

        application.setVerificationNotes(
                "Awaiting administrator verification of dealer licence and business details."
        );

        application.setLastUpdated(Instant.now());

        return shopRepository.save(application);
    }

    private boolean blank(String value) {
        return value == null || value.trim().isEmpty();
    }

    /**
     * Explicitly labelled demo records may be shown for prototype/testing.
     * Non-demo dealer records must pass verification before they appear
     * in farmer-facing results.
     */
    private boolean isVisibleInMarketplace(Shop shop) {
        return shop != null
                && (shop.isDemonstrationData()
                || "VERIFIED".equalsIgnoreCase(shop.getVerificationStatus()));
    }

    public List<ShopDetailDTO> getShopsWithFilters(
            String query,
            String cropType,
            String seedId,
            Boolean inStockOnly,
            String sortBy,
            String farmerLocation,
            String productType) {

        List<Shop> allShops = shopRepository.findAll();
        List<ShopInventoryItem> allInventories =
                shopInventoryRepository.findAll();

        Map<String, List<ShopInventoryItem>> inventoryByShopId =
                allInventories.stream()
                        .collect(Collectors.groupingBy(
                                ShopInventoryItem::getShopId
                        ));

        List<ShopDetailDTO> shopDTOs = new ArrayList<>();

        for (Shop shop : allShops) {

            if (!isVisibleInMarketplace(shop)) {
                continue;
            }

            // Enforce the farmer's saved location.
            if (!ShopLocationMatcher.matches(farmerLocation, shop)) {
                continue;
            }

            List<ShopInventoryItem> items =
                    inventoryByShopId.getOrDefault(
                            shop.getId(),
                            new ArrayList<>()
                    );

            if (productType != null
                    && !productType.isBlank()
                    && !productType.equalsIgnoreCase("ALL")) {

                items = items.stream()
                        .filter(i -> normalizedProductType(i)
                                .equalsIgnoreCase(productType.trim()))
                        .collect(Collectors.toList());
            }

            // The shop page focuses on paddy seeds by default.
            if (productType == null
                    || productType.isBlank()
                    || productType.equalsIgnoreCase("SEED")) {

                items = items.stream()
                        .filter(i -> normalizedProductType(i).equals("SEED")
                                && isPaddyInventory(i))
                        .collect(Collectors.toList());
            }

            if (cropType != null
                    && !cropType.trim().isEmpty()
                    && !cropType.equalsIgnoreCase("All")) {

                items = items.stream()
                        .filter(i -> i.getCropType() != null
                                && i.getCropType().equalsIgnoreCase(cropType.trim()))
                        .collect(Collectors.toList());
            }

            if (seedId != null && !seedId.trim().isEmpty()) {
                items = items.stream()
                        .filter(i -> i.getSeedVarietyId() != null
                                && i.getSeedVarietyId().equals(seedId.trim()))
                        .collect(Collectors.toList());
            }

            if (Boolean.TRUE.equals(inStockOnly)) {
                items = items.stream()
                        .filter(i -> i.getCurrentStock() != null
                                && i.getCurrentStock() > 0)
                        .collect(Collectors.toList());
            }

            boolean hasSeedFilter =
                    (cropType != null
                            && !cropType.isBlank()
                            && !cropType.equalsIgnoreCase("All"))
                            || (seedId != null && !seedId.isBlank())
                            || Boolean.TRUE.equals(inStockOnly)
                            || (productType != null
                            && !productType.isBlank()
                            && !productType.equalsIgnoreCase("All"));

            if (hasSeedFilter && items.isEmpty()) {
                continue;
            }

            // Search shop name, location, district, state, or products.
            if (query != null && !query.trim().isEmpty()) {

                String q = query.trim().toLowerCase(Locale.ROOT);

                boolean matchesShop =
                        (shop.getName() != null
                                && shop.getName().toLowerCase(Locale.ROOT).contains(q))
                                || (shop.getLocation() != null
                                && shop.getLocation().toLowerCase(Locale.ROOT).contains(q))
                                || (shop.getDistrict() != null
                                && shop.getDistrict().toLowerCase(Locale.ROOT).contains(q))
                                || (shop.getState() != null
                                && shop.getState().toLowerCase(Locale.ROOT).contains(q));

                java.util.function.Predicate<ShopInventoryItem> productMatches = i ->
                        (i.getProductName() != null
                                && i.getProductName().toLowerCase(Locale.ROOT).contains(q))
                                || (i.getSeedVarietyName() != null
                                && i.getSeedVarietyName().toLowerCase(Locale.ROOT).contains(q))
                                || (i.getCropType() != null
                                && i.getCropType().toLowerCase(Locale.ROOT).contains(q))
                                || (i.getVarietyCode() != null
                                && i.getVarietyCode().toLowerCase(Locale.ROOT).contains(q))
                                || (i.getProductType() != null
                                && i.getProductType().toLowerCase(Locale.ROOT).contains(q));

                boolean matchesProducts = items.stream().anyMatch(productMatches);

                if (!matchesShop && !matchesProducts) {
                    continue;
                }

                if (!matchesShop && matchesProducts) {
                    items = items.stream()
                            .filter(productMatches)
                            .collect(Collectors.toList());
                }
            }

            // Keep the default inventory list short.
            if ((seedId == null || seedId.isBlank()) && items.size() > 5) {
                items = items.stream()
                        .limit(5)
                        .collect(Collectors.toList());
            }

            String distanceInfo = calculateDistanceInfo(shop, farmerLocation);

            shopDTOs.add(new ShopDetailDTO(shop, distanceInfo, items));
        }

        if (sortBy == null || sortBy.trim().isEmpty()) {

            Map<String, Shop> matchedShopsById = allShops.stream()
                    .filter(shop -> shop.getId() != null)
                    .collect(Collectors.toMap(
                            Shop::getId,
                            shop -> shop,
                            (first, second) -> first
                    ));

            shopDTOs.sort(
                    Comparator.comparingInt(
                                    (ShopDetailDTO dto) ->
                                            ShopLocationMatcher.matchScore(
                                                    farmerLocation,
                                                    matchedShopsById.get(dto.getId())
                                            )
                            )
                            .reversed()
                            .thenComparing(
                                    ShopDetailDTO::getName,
                                    Comparator.nullsLast(
                                            String.CASE_INSENSITIVE_ORDER
                                    )
                            )
            );

        } else {

            switch (sortBy.toLowerCase(Locale.ROOT)) {

                case "price_asc":
                    shopDTOs.sort(
                            Comparator.comparing(
                                    dto -> getMinPrice(dto.getInventoryItems())
                            )
                    );
                    break;

                case "price_desc":
                    shopDTOs.sort(
                            Comparator.comparing(
                                    (ShopDetailDTO dto) ->
                                            getMaxPrice(dto.getInventoryItems())
                            ).reversed()
                    );
                    break;

                case "name":
                    shopDTOs.sort(
                            Comparator.comparing(
                                    ShopDetailDTO::getName,
                                    Comparator.nullsLast(
                                            String.CASE_INSENSITIVE_ORDER
                                    )
                            )
                    );
                    break;

                case "location":
                    shopDTOs.sort(
                            Comparator.comparing(
                                    ShopDetailDTO::getLocation,
                                    Comparator.nullsLast(
                                            String.CASE_INSENSITIVE_ORDER
                                    )
                            )
                    );
                    break;

                default:
                    break;
            }
        }

        return shopDTOs;
    }

    public Optional<ShopDetailDTO> getShopById(
            String shopId,
            String farmerLocation) {

        return shopRepository.findById(shopId)
                .filter(this::isVisibleInMarketplace)
                .filter(shop ->
                        ShopLocationMatcher.matches(farmerLocation, shop))
                .map(shop -> {

                    List<ShopInventoryItem> items =
                            shopInventoryRepository.findByShopId(shop.getId())
                                    .stream()
                                    .collect(Collectors.toList());

                    String distanceInfo =
                            calculateDistanceInfo(shop, farmerLocation);

                    return new ShopDetailDTO(shop, distanceInfo, items);
                });
    }

    public List<ShopInventoryItem> getAllInventoryItems(
            String seedId,
            String cropType,
            Boolean inStockOnly,
            String sortBy,
            String productType,
            String farmerLocation) {

        Map<String, Shop> shopsById = shopRepository.findAll()
                .stream()
                .filter(this::isVisibleInMarketplace)
                .filter(shop -> shop.getId() != null)
                .filter(shop ->
                        ShopLocationMatcher.matches(farmerLocation, shop))
                .collect(Collectors.toMap(
                        Shop::getId,
                        shop -> shop,
                        (first, second) -> first
                ));

        List<ShopInventoryItem> items =
                new ArrayList<>(
                        shopInventoryRepository.findAll()
                                .stream()
                                .filter(item -> item.getShopId() != null
                                        && shopsById.containsKey(item.getShopId()))
                                .collect(Collectors.toList())
                );

        if (productType != null
                && !productType.isBlank()
                && !productType.equalsIgnoreCase("ALL")) {

            items = items.stream()
                    .filter(i -> normalizedProductType(i)
                            .equalsIgnoreCase(productType.trim()))
                    .collect(Collectors.toList());
        }

        if (seedId != null && !seedId.trim().isEmpty()) {
            items = items.stream()
                    .filter(i -> normalizedProductType(i).equals("SEED")
                            && seedId.equals(i.getSeedVarietyId()))
                    .collect(Collectors.toList());
        }

        if (cropType != null
                && !cropType.trim().isEmpty()
                && !cropType.equalsIgnoreCase("All")) {

            items = items.stream()
                    .filter(i -> cropType.equalsIgnoreCase(i.getCropType()))
                    .collect(Collectors.toList());
        }

        if (Boolean.TRUE.equals(inStockOnly)) {
            items = items.stream()
                    .filter(i -> i.getCurrentStock() != null
                            && i.getCurrentStock() > 0)
                    .collect(Collectors.toList());
        }

        if ("price_asc".equalsIgnoreCase(sortBy)) {

            items.sort(
                    Comparator.comparing(
                            i -> i.getPrice() != null
                                    ? i.getPrice()
                                    : Double.MAX_VALUE
                    )
            );

        } else if ("price_desc".equalsIgnoreCase(sortBy)) {

            items.sort(
                    Comparator.comparing(
                            (ShopInventoryItem i) ->
                                    i.getPrice() != null ? i.getPrice() : 0.0
                    ).reversed()
            );

        } else if ("stock_desc".equalsIgnoreCase(sortBy)) {

            items.sort(
                    Comparator.comparing(
                            (ShopInventoryItem i) ->
                                    i.getCurrentStock() != null
                                            ? i.getCurrentStock()
                                            : 0
                    ).reversed()
            );
        }

        return items;
    }

    public ShopInventoryItem updateInventoryStock(
            String inventoryId,
            int newStock) {

        if (newStock < 0) {
            throw new IllegalArgumentException(
                    "Inventory stock cannot be negative. Provided: " + newStock
            );
        }

        ShopInventoryItem item = shopInventoryRepository.findById(inventoryId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Inventory item not found with ID: " + inventoryId
                        ));

        item.setCurrentStock(newStock);
        item.setLastUpdated(Instant.now());

        return shopInventoryRepository.save(item);
    }

    /**
     * Atomically reserves stock and prevents negative inventory.
     */
    public ShopInventoryItem reserveStockAtomic(
            String inventoryId,
            int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Reservation quantity must be greater than zero. Provided: "
                            + quantity
            );
        }

        Query query = new Query(
                Criteria.where("id").is(inventoryId)
                        .and("currentStock").gte(quantity)
        );

        Update update = new Update()
                .inc("currentStock", -quantity)
                .set("lastUpdated", Instant.now());

        ShopInventoryItem updated = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                ShopInventoryItem.class
        );

        if (updated == null) {
            throw new IllegalStateException(
                    "Cannot reserve " + quantity
                            + " units: Insufficient stock available or item does not exist."
            );
        }

        return updated;
    }

    private String normalizedProductType(ShopInventoryItem item) {
        String type = item == null ? null : item.getProductType();

        return type == null || type.isBlank()
                ? "SEED"
                : type.trim().toUpperCase(Locale.ROOT);
    }

    private boolean isPaddyInventory(ShopInventoryItem item) {
        if (item == null || item.getCropType() == null) {
            return false;
        }

        String crop = item.getCropType().trim();

        return crop.equalsIgnoreCase("Rice/Paddy")
                || crop.equalsIgnoreCase("Rice")
                || crop.equalsIgnoreCase("Paddy");
    }

    private double getMinPrice(List<ShopInventoryItem> items) {
        return items.stream()
                .map(ShopInventoryItem::getPrice)
                .filter(Objects::nonNull)
                .min(Double::compareTo)
                .orElse(Double.MAX_VALUE);
    }

    private double getMaxPrice(List<ShopInventoryItem> items) {
        return items.stream()
                .map(ShopInventoryItem::getPrice)
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(0.0);
    }

    private String calculateDistanceInfo(
            Shop shop,
            String farmerLocation) {

        if (farmerLocation == null || farmerLocation.trim().isEmpty()) {
            return "GPS distance unavailable (Profile location not set)";
        }

        String farmLoc = farmerLocation.trim().toLowerCase(Locale.ROOT);

        String shopDist = shop.getDistrict() != null
                ? shop.getDistrict().toLowerCase(Locale.ROOT)
                : "";

        int locationMatchScore =
                ShopLocationMatcher.matchScore(farmerLocation, shop);

        if (locationMatchScore >= 3) {
            return "Location text matches this area "
                    + "(exact road distance unavailable)";

        } else if (locationMatchScore == 2) {
            return "Nearby locality/district match based on text "
                    + "(exact road distance unavailable)";

        } else if (!shopDist.isBlank() && farmLoc.contains(shopDist)) {
            return "Location text appears to match this area "
                    + "(exact road distance unavailable)";

        } else if (shop.getState() != null
                && !shop.getState().isBlank()
                && farmLoc.contains(
                        shop.getState().toLowerCase(Locale.ROOT))) {

            return "Same state based on location text "
                    + "(exact road distance unavailable)";

        } else {
            return "Inter-district store "
                    + "(distance unverified; road transit required)";
        }
    }
}
