package com.farmwise.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "farm_profiles")
public class FarmProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String farmerId;

    private String location;
    private Double farmAreaAcres;
    private String soilType;
    private Double soilPh;
    private String irrigationMethod;
    private String waterAvailability;
    private String preferredCrop;
    private String growingSeason;

    private Instant updatedAt = Instant.now();

    public FarmProfile() {}

    public FarmProfile(String farmerId, String location, Double farmAreaAcres, String soilType,
                       Double soilPh, String irrigationMethod, String waterAvailability,
                       String preferredCrop, String growingSeason) {
        this.farmerId = farmerId;
        this.location = location;
        this.farmAreaAcres = farmAreaAcres;
        this.soilType = soilType;
        this.soilPh = soilPh;
        this.irrigationMethod = irrigationMethod;
        this.waterAvailability = waterAvailability;
        this.preferredCrop = preferredCrop;
        this.growingSeason = growingSeason;
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(String farmerId) {
        this.farmerId = farmerId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getFarmAreaAcres() {
        return farmAreaAcres;
    }

    public void setFarmAreaAcres(Double farmAreaAcres) {
        this.farmAreaAcres = farmAreaAcres;
    }

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }

    public Double getSoilPh() {
        return soilPh;
    }

    public void setSoilPh(Double soilPh) {
        this.soilPh = soilPh;
    }

    public String getIrrigationMethod() {
        return irrigationMethod;
    }

    public void setIrrigationMethod(String irrigationMethod) {
        this.irrigationMethod = irrigationMethod;
    }

    public String getWaterAvailability() {
        return waterAvailability;
    }

    public void setWaterAvailability(String waterAvailability) {
        this.waterAvailability = waterAvailability;
    }

    public String getPreferredCrop() {
        return preferredCrop;
    }

    public void setPreferredCrop(String preferredCrop) {
        this.preferredCrop = preferredCrop;
    }

    public String getGrowingSeason() {
        return growingSeason;
    }

    public void setGrowingSeason(String growingSeason) {
        this.growingSeason = growingSeason;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
