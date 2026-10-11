package com.farmwise.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "seed_varieties")
public class SeedVariety {

    @Id
    private String id;
    private String name;
    private String cropType;
    private String varietyCode;
    private Double minPh;
    private Double maxPh;
    private List<String> suitableSoilTypes;
    private List<String> suitableIrrigationMethods;
    private List<String> suitableRegions;
    private List<String> growingSeasons;
    private String waterRequirements; // High, Moderate, Low, Seasonal
    private Integer maturityDays;
    private Double yieldPotentialQuintalPerAcre;
    private String droughtTolerance; // High, Medium, Low
    private String pestResistance;  // High, Medium, Low
    private Double price;
    private String packageSize;
    private String agronomicSource;
    private boolean demonstrationData = true;
    private List<String> advantages;
    private List<String> disadvantages;
    private String description;

    public SeedVariety() {}

    public SeedVariety(String id, String name, String cropType, String varietyCode, Double minPh, Double maxPh,
                       List<String> suitableSoilTypes, List<String> suitableIrrigationMethods,
                       List<String> suitableRegions, List<String> growingSeasons, String waterRequirements,
                       Integer maturityDays, Double yieldPotentialQuintalPerAcre, String droughtTolerance,
                       String pestResistance, Double price, String packageSize, String agronomicSource,
                       boolean demonstrationData, List<String> advantages, List<String> disadvantages, String description) {
        this.id = id;
        this.name = name;
        this.cropType = cropType;
        this.varietyCode = varietyCode;
        this.minPh = minPh;
        this.maxPh = maxPh;
        this.suitableSoilTypes = suitableSoilTypes;
        this.suitableIrrigationMethods = suitableIrrigationMethods;
        this.suitableRegions = suitableRegions;
        this.growingSeasons = growingSeasons;
        this.waterRequirements = waterRequirements;
        this.maturityDays = maturityDays;
        this.yieldPotentialQuintalPerAcre = yieldPotentialQuintalPerAcre;
        this.droughtTolerance = droughtTolerance;
        this.pestResistance = pestResistance;
        this.price = price;
        this.packageSize = packageSize;
        this.agronomicSource = agronomicSource;
        this.demonstrationData = demonstrationData;
        this.advantages = advantages;
        this.disadvantages = disadvantages;
        this.description = description;
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

    public Double getMinPh() {
        return minPh;
    }

    public void setMinPh(Double minPh) {
        this.minPh = minPh;
    }

    public Double getMaxPh() {
        return maxPh;
    }

    public void setMaxPh(Double maxPh) {
        this.maxPh = maxPh;
    }

    public List<String> getSuitableSoilTypes() {
        return suitableSoilTypes;
    }

    public void setSuitableSoilTypes(List<String> suitableSoilTypes) {
        this.suitableSoilTypes = suitableSoilTypes;
    }

    public List<String> getSuitableIrrigationMethods() {
        return suitableIrrigationMethods;
    }

    public void setSuitableIrrigationMethods(List<String> suitableIrrigationMethods) {
        this.suitableIrrigationMethods = suitableIrrigationMethods;
    }

    public List<String> getSuitableRegions() {
        return suitableRegions;
    }

    public void setSuitableRegions(List<String> suitableRegions) {
        this.suitableRegions = suitableRegions;
    }

    public List<String> getGrowingSeasons() {
        return growingSeasons;
    }

    public void setGrowingSeasons(List<String> growingSeasons) {
        this.growingSeasons = growingSeasons;
    }

    public String getWaterRequirements() {
        return waterRequirements;
    }

    public void setWaterRequirements(String waterRequirements) {
        this.waterRequirements = waterRequirements;
    }

    public Integer getMaturityDays() {
        return maturityDays;
    }

    public void setMaturityDays(Integer maturityDays) {
        this.maturityDays = maturityDays;
    }

    public Double getYieldPotentialQuintalPerAcre() {
        return yieldPotentialQuintalPerAcre;
    }

    public void setYieldPotentialQuintalPerAcre(Double yieldPotentialQuintalPerAcre) {
        this.yieldPotentialQuintalPerAcre = yieldPotentialQuintalPerAcre;
    }

    public String getDroughtTolerance() {
        return droughtTolerance;
    }

    public void setDroughtTolerance(String droughtTolerance) {
        this.droughtTolerance = droughtTolerance;
    }

    public String getPestResistance() {
        return pestResistance;
    }

    public void setPestResistance(String pestResistance) {
        this.pestResistance = pestResistance;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getPackageSize() {
        return packageSize;
    }

    public void setPackageSize(String packageSize) {
        this.packageSize = packageSize;
    }

    public String getAgronomicSource() {
        return agronomicSource;
    }

    public void setAgronomicSource(String agronomicSource) {
        this.agronomicSource = agronomicSource;
    }

    public boolean isDemonstrationData() {
        return demonstrationData;
    }

    public void setDemonstrationData(boolean demonstrationData) {
        this.demonstrationData = demonstrationData;
    }

    public List<String> getAdvantages() {
        return advantages;
    }

    public void setAdvantages(List<String> advantages) {
        this.advantages = advantages;
    }

    public List<String> getDisadvantages() {
        return disadvantages;
    }

    public void setDisadvantages(List<String> disadvantages) {
        this.disadvantages = disadvantages;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
