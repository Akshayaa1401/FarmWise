package com.farmwise.dto;

import com.farmwise.models.Shop;
import com.farmwise.models.ShopInventoryItem;

import java.time.Instant;
import java.util.List;

public class ShopDetailDTO {

    private String id;
    private String name;
    private String location;
    private String district;
    private String state;
    private String contactPhone;
    private String distanceInfo;
    private boolean demonstrationData;
    private Instant lastUpdated;
    private List<ShopInventoryItem> inventoryItems;

    public ShopDetailDTO() {}

    public ShopDetailDTO(Shop shop, String distanceInfo, List<ShopInventoryItem> inventoryItems) {
        this.id = shop.getId();
        this.name = shop.getName();
        this.location = shop.getLocation();
        this.district = shop.getDistrict();
        this.state = shop.getState();
        this.contactPhone = shop.getContactPhone();
        this.demonstrationData = shop.isDemonstrationData();
        this.lastUpdated = shop.getLastUpdated();
        this.distanceInfo = distanceInfo;
        this.inventoryItems = inventoryItems;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getDistanceInfo() {
        return distanceInfo;
    }

    public void setDistanceInfo(String distanceInfo) {
        this.distanceInfo = distanceInfo;
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

    public List<ShopInventoryItem> getInventoryItems() {
        return inventoryItems;
    }

    public void setInventoryItems(List<ShopInventoryItem> inventoryItems) {
        this.inventoryItems = inventoryItems;
    }
}
