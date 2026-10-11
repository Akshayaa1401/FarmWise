package com.farmwise.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "shops")
public class Shop {

    @Id
    private String id;
    private String name;
    private String location;
    private String district;
    private String state;
    private String contactPhone;
    private boolean demonstrationData;
    private Instant lastUpdated;
    private String verificationStatus = "PENDING";
    private String dealerLicenseNumber;
    private String ownerFarmerId;
    private String verificationNotes;

    public Shop() {
        this.lastUpdated = Instant.now();
        this.demonstrationData = true;
        this.verificationStatus = "PENDING";
    }

    public Shop(String id, String name, String location, String district, String state, String contactPhone, boolean demonstrationData) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.district = district;
        this.state = state;
        this.contactPhone = contactPhone;
        this.demonstrationData = demonstrationData;
        this.verificationStatus = demonstrationData ? "DEMO" : "PENDING";
        this.lastUpdated = Instant.now();
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

    public boolean isDemonstrationData() {
        return demonstrationData;
    }

    public void setDemonstrationData(boolean demonstrationData) {
        this.demonstrationData = demonstrationData;
    }

    public String getVerificationStatus() { return verificationStatus == null ? "PENDING" : verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus == null ? "PENDING" : verificationStatus.trim().toUpperCase(java.util.Locale.ROOT); }
    public String getDealerLicenseNumber() { return dealerLicenseNumber; }
    public void setDealerLicenseNumber(String dealerLicenseNumber) { this.dealerLicenseNumber = dealerLicenseNumber; }
    public String getOwnerFarmerId() { return ownerFarmerId; }
    public void setOwnerFarmerId(String ownerFarmerId) { this.ownerFarmerId = ownerFarmerId; }
    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
