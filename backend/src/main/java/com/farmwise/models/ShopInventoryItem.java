package com.farmwise.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "shop_inventories")
public class ShopInventoryItem {

    @Id
    private String id;
    private String shopId;
    private String shopName;
    private String shopLocation;
    private String productType = "SEED";
    private String productName;
    private String description;
    private String recommendedFor;
    private String seedVarietyId;
    private String seedVarietyName;
    private String cropType;
    private String varietyCode;
    private String packageSize;
    private Double price;
    private Integer currentStock;
    private boolean demonstrationData;
    private Instant lastUpdated;

    public ShopInventoryItem() {
        this.lastUpdated = Instant.now();
        this.demonstrationData = true;
    }

    public ShopInventoryItem(String id, String shopId, String shopName, String shopLocation,
                             String seedVarietyId, String seedVarietyName, String cropType,
                             String varietyCode, String packageSize, Double price,
                             Integer currentStock, boolean demonstrationData) {
        this.id = id;
        this.shopId = shopId;
        this.shopName = shopName;
        this.shopLocation = shopLocation;
        this.productType = "SEED";
        this.productName = seedVarietyName;
        this.seedVarietyId = seedVarietyId;
        this.seedVarietyName = seedVarietyName;
        this.cropType = cropType;
        this.varietyCode = varietyCode;
        this.packageSize = packageSize;
        this.price = price;
        this.currentStock = currentStock;
        this.demonstrationData = demonstrationData;
        this.lastUpdated = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getShopId() {
        return shopId;
    }

    public void setShopId(String shopId) {
        this.shopId = shopId;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getShopLocation() {
        return shopLocation;
    }

    public void setShopLocation(String shopLocation) {
        this.shopLocation = shopLocation;
    }


    public String getProductType() { return productType == null || productType.isBlank() ? "SEED" : productType; }
    public void setProductType(String productType) { this.productType = productType == null || productType.isBlank() ? "SEED" : productType.trim().toUpperCase(java.util.Locale.ROOT); }
    public String getProductName() { return productName == null || productName.isBlank() ? seedVarietyName : productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRecommendedFor() { return recommendedFor; }
    public void setRecommendedFor(String recommendedFor) { this.recommendedFor = recommendedFor; }

    public String getSeedVarietyId() {
        return seedVarietyId;
    }

    public void setSeedVarietyId(String seedVarietyId) {
        this.seedVarietyId = seedVarietyId;
    }

    public String getSeedVarietyName() {
        return seedVarietyName;
    }

    public void setSeedVarietyName(String seedVarietyName) {
        this.seedVarietyName = seedVarietyName;
    }

    public String getCropType() {
        return cropType;
    }

    public void setCropType(String cropType) {
        this.cropType = cropType;
    }

    public String getVarietyCode() {
        return varietyCode;
    }

    public void setVarietyCode(String varietyCode) {
        this.varietyCode = varietyCode;
    }

    public String getPackageSize() {
        return packageSize;
    }

    public void setPackageSize(String packageSize) {
        this.packageSize = packageSize;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public boolean isDemonstrationData() {
        return demonstrationData;
    }

    public void setDemonstrationData(boolean demonstrationData) {
        this.demonstrationData = demonstrationData;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
