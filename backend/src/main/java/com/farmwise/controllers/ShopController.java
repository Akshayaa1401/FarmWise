package com.farmwise.controllers;

import com.farmwise.dto.ApiResponse;
import com.farmwise.dto.FarmProfileDTO;
import com.farmwise.dto.ShopDetailDTO;
import com.farmwise.models.ShopInventoryItem;
import com.farmwise.security.UserPrincipal;
import com.farmwise.services.FarmProfileService;
import com.farmwise.services.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    @Autowired
    private ShopService shopService;

    @Autowired
    private FarmProfileService farmProfileService;

    @PostMapping("/dealer-applications")
    public ResponseEntity<ApiResponse<com.farmwise.models.Shop>> submitDealerApplication(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody com.farmwise.models.Shop application) {
        try {
            com.farmwise.models.Shop saved = shopService.submitDealerApplication(application, userPrincipal.getId());
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Application submitted. Your shop will appear to farmers only after administrator verification.", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShopDetailDTO>>> getAllShops(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String cropType,
            @RequestParam(required = false) String seedId,
            @RequestParam(required = false) Boolean inStockOnly,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) String location) {

        String farmerLocation = null;
        if (userPrincipal != null) {
            Optional<FarmProfileDTO> profileOpt = farmProfileService.getProfileByFarmerId(userPrincipal.getId());
            if (profileOpt.isPresent()) {
                farmerLocation = profileOpt.get().getLocation();
            }
        }

        // An explicit location search lets farmers explore another area without changing
        // their saved farm profile. If omitted, use the saved farm location.
        if (location != null && !location.isBlank()) farmerLocation = location.trim();
        List<ShopDetailDTO> shops = shopService.getShopsWithFilters(query, cropType, seedId, inStockOnly, sortBy, farmerLocation, productType);
        return ResponseEntity.ok(new ApiResponse<>(true, "Retrieved " + shops.size() + " shops", shops));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShopDetailDTO>> getShopById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String id) {

        String farmerLocation = null;
        if (userPrincipal != null) {
            Optional<FarmProfileDTO> profileOpt = farmProfileService.getProfileByFarmerId(userPrincipal.getId());
            if (profileOpt.isPresent()) {
                farmerLocation = profileOpt.get().getLocation();
            }
        }

        Optional<ShopDetailDTO> shopOpt = shopService.getShopById(id, farmerLocation);
        if (shopOpt.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Shop retrieved successfully", shopOpt.get()));
        } else {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "Shop not found with ID: " + id, null));
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<ShopInventoryItem>>> getAllInventory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String seedId,
            @RequestParam(required = false) String cropType,
            @RequestParam(required = false) Boolean inStockOnly,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String productType) {

        String farmerLocation = null;
        if (userPrincipal != null) {
            Optional<FarmProfileDTO> profileOpt = farmProfileService.getProfileByFarmerId(userPrincipal.getId());
            if (profileOpt.isPresent()) farmerLocation = profileOpt.get().getLocation();
        }
        List<ShopInventoryItem> items = shopService.getAllInventoryItems(seedId, cropType, inStockOnly, sortBy, productType, farmerLocation);
        return ResponseEntity.ok(new ApiResponse<>(true, "Retrieved " + items.size() + " inventory items", items));
    }

    @PutMapping("/inventory/{id}/stock")
    public ResponseEntity<ApiResponse<ShopInventoryItem>> updateStock(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Integer> request) {

        if (request == null || !request.containsKey("stock") || request.get("stock") == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Field 'stock' is required", null));
        }

        int newStock = request.get("stock");
        try {
            ShopInventoryItem updated = shopService.updateInventoryStock(id, newStock);
            return ResponseEntity.ok(new ApiResponse<>(true, "Inventory stock updated successfully", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/inventory/{id}/reserve")
    public ResponseEntity<ApiResponse<ShopInventoryItem>> reserveStock(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Integer> request) {

        if (request == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Reservation details are required", null));
        }
        int quantity = request.getOrDefault("quantity", 1);
        try {
            ShopInventoryItem reserved = shopService.reserveStockAtomic(id, quantity);
            return ResponseEntity.ok(new ApiResponse<>(true, "Successfully reserved " + quantity + " units", reserved));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
