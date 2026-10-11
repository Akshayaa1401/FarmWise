package com.farmwise.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;
    private String bookingId;
    private String farmerId;
    private String farmerName;
    private String farmerEmail;
    private String shopId;
    private String shopName;
    private String shopLocation;
    private String inventoryItemId;
    private String productType = "SEED";
    private String productName;
    private String seedVarietyId;
    private String seedVarietyName;
    private String cropType;
    private String varietyCode;
    private String packageSize;
    private Double unitPrice;
    private Integer quantity;
    private Double totalAmount;
    private String status; // CONFIRMED, CANCELLED
    private Instant bookingDate;
    private String sowingRateNote;
    private boolean demonstrationData;

    public Booking() {
        this.bookingDate = Instant.now();
        this.status = "CONFIRMED";
        this.demonstrationData = true;
    }

    public Booking(String bookingId, String farmerId, String farmerName, String farmerEmail,
                   String shopId, String shopName, String shopLocation,
                   String inventoryItemId, String seedVarietyId, String seedVarietyName,
                   String cropType, String varietyCode, String packageSize,
                   Double unitPrice, Integer quantity, Double totalAmount,
                   String sowingRateNote) {
        this.bookingId = bookingId;
        this.farmerId = farmerId;
        this.farmerName = farmerName;
        this.farmerEmail = farmerEmail;
        this.shopId = shopId;
        this.shopName = shopName;
        this.shopLocation = shopLocation;
        this.inventoryItemId = inventoryItemId;
        this.productType = "SEED";
        this.productName = seedVarietyName;
        this.seedVarietyId = seedVarietyId;
        this.seedVarietyName = seedVarietyName;
        this.cropType = cropType;
        this.varietyCode = varietyCode;
        this.packageSize = packageSize;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.totalAmount = totalAmount;
        this.sowingRateNote = sowingRateNote;
        this.status = "CONFIRMED";
        this.bookingDate = Instant.now();
        this.demonstrationData = true;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(String farmerId) {
        this.farmerId = farmerId;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getFarmerEmail() {
        return farmerEmail;
    }

    public void setFarmerEmail(String farmerEmail) {
        this.farmerEmail = farmerEmail;
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

    public String getInventoryItemId() {
        return inventoryItemId;
    }

    public void setInventoryItemId(String inventoryItemId) {
        this.inventoryItemId = inventoryItemId;
    }

    public String getProductType() { return productType == null || productType.isBlank() ? "SEED" : productType; }
    public void setProductType(String productType) { this.productType = productType == null || productType.isBlank() ? "SEED" : productType; }
    public String getProductName() { return productName == null || productName.isBlank() ? seedVarietyName : productName; }
    public void setProductName(String productName) { this.productName = productName; }

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

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(Instant bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getSowingRateNote() {
        return sowingRateNote;
    }

    public void setSowingRateNote(String sowingRateNote) {
        this.sowingRateNote = sowingRateNote;
    }

    public boolean isDemonstrationData() {
        return demonstrationData;
    }

    public void setDemonstrationData(boolean demonstrationData) {
        this.demonstrationData = demonstrationData;
    }
}
