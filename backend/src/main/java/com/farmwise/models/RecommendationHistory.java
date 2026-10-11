package com.farmwise.models;

import com.farmwise.dto.FarmProfileDTO;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "recommendation_history")
public class RecommendationHistory {

    @Id
    private String id;
    private String farmerId;
    private Instant timestamp;
    private Map<String, Object> profileConditions;
    private List<SavedRecommendationItem> recommendedVarieties;

    public RecommendationHistory() {
        this.timestamp = Instant.now();
    }

    public RecommendationHistory(String farmerId, Map<String, Object> profileConditions, List<SavedRecommendationItem> recommendedVarieties) {
        this.farmerId = farmerId;
        this.timestamp = Instant.now();
        this.profileConditions = profileConditions;
        this.recommendedVarieties = recommendedVarieties;
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

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getProfileConditions() {
        return profileConditions;
    }

    public void setProfileConditions(Map<String, Object> profileConditions) {
        this.profileConditions = profileConditions;
    }

    public List<SavedRecommendationItem> getRecommendedVarieties() {
        return recommendedVarieties;
    }

    public void setRecommendedVarieties(List<SavedRecommendationItem> recommendedVarieties) {
        this.recommendedVarieties = recommendedVarieties;
    }

    public static class SavedRecommendationItem {
        private String seedId;
        private String seedName;
        private String cropType;
        private String varietyCode;
        private int matchScore;
        private List<String> matchReasons;
        private List<String> mismatches;
        private String soilSuitability;
        private String waterSuitability;
        private Integer maturityDays;
        private Double yieldPotential;
        private List<String> limitations;
        private String agronomicSource;
        private boolean demonstrationData;

        public SavedRecommendationItem() {}

        public SavedRecommendationItem(String seedId, String seedName, String cropType, String varietyCode,
                                       int matchScore, List<String> matchReasons, List<String> mismatches,
                                       String soilSuitability, String waterSuitability, Integer maturityDays,
                                       Double yieldPotential, List<String> limitations, String agronomicSource,
                                       boolean demonstrationData) {
            this.seedId = seedId;
            this.seedName = seedName;
            this.cropType = cropType;
            this.varietyCode = varietyCode;
            this.matchScore = matchScore;
            this.matchReasons = matchReasons;
            this.mismatches = mismatches;
            this.soilSuitability = soilSuitability;
            this.waterSuitability = waterSuitability;
            this.maturityDays = maturityDays;
            this.yieldPotential = yieldPotential;
            this.limitations = limitations;
            this.agronomicSource = agronomicSource;
            this.demonstrationData = demonstrationData;
        }

        public String getSeedId() {
            return seedId;
        }

        public void setSeedId(String seedId) {
            this.seedId = seedId;
        }

        public String getSeedName() {
            return seedName;
        }

        public void setSeedName(String seedName) {
            this.seedName = seedName;
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

        public int getMatchScore() {
            return matchScore;
        }

        public void setMatchScore(int matchScore) {
            this.matchScore = matchScore;
        }

        public List<String> getMatchReasons() {
            return matchReasons;
        }

        public void setMatchReasons(List<String> matchReasons) {
            this.matchReasons = matchReasons;
        }

        public List<String> getMismatches() {
            return mismatches;
        }

        public void setMismatches(List<String> mismatches) {
            this.mismatches = mismatches;
        }

        public String getSoilSuitability() {
            return soilSuitability;
        }

        public void setSoilSuitability(String soilSuitability) {
            this.soilSuitability = soilSuitability;
        }

        public String getWaterSuitability() {
            return waterSuitability;
        }

        public void setWaterSuitability(String waterSuitability) {
            this.waterSuitability = waterSuitability;
        }

        public Integer getMaturityDays() {
            return maturityDays;
        }

        public void setMaturityDays(Integer maturityDays) {
            this.maturityDays = maturityDays;
        }

        public Double getYieldPotential() {
            return yieldPotential;
        }

        public void setYieldPotential(Double yieldPotential) {
            this.yieldPotential = yieldPotential;
        }

        public List<String> getLimitations() {
            return limitations;
        }

        public void setLimitations(List<String> limitations) {
            this.limitations = limitations;
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
    }
}
