package com.farmwise.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class FarmProfileDTO {

    private String id;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Farm area in acres is required")
    @Positive(message = "Farm area must be greater than zero")
    private Double farmAreaAcres;

    @NotBlank(message = "Soil type is required")
    private String soilType;

    @NotNull(message = "Soil pH is required")
    @DecimalMin(value = "3.0", message = "Soil pH must be at least 3.0")
    @DecimalMax(value = "10.0", message = "Soil pH cannot exceed 10.0")
    private Double soilPh;

    @NotBlank(message = "Irrigation method is required")
    private String irrigationMethod;

    @NotBlank(message = "Water availability is required")
    private String waterAvailability;

    @NotBlank(message = "Preferred crop is required")
    private String preferredCrop;

    @NotBlank(message = "Growing season is required")
    private String growingSeason;

    public FarmProfileDTO() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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
}
