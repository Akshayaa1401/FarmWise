package com.farmwise.dto;

import com.farmwise.models.SeedVariety;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class RecommendationResponseDTO {

    private String status;
    private String message;
    private String historyId;
    private Instant calculatedAt;
    private Map<String, Object> profileConditions;
    private List<RecommendedSeedItem> recommendations;

    public RecommendationResponseDTO() {
        this.calculatedAt = Instant.now();
    }

    public RecommendationResponseDTO(String status, String message, List<RecommendedSeedItem> recommendations) {
        this.status = status;
        this.message = message;
        this.recommendations = recommendations;
        this.calculatedAt = Instant.now();
    }

    public RecommendationResponseDTO(String status, String message, String historyId,
                                   Map<String, Object> profileConditions,
                                   List<RecommendedSeedItem> recommendations) {
        this.status = status;
        this.message = message;
        this.historyId = historyId;
        this.profileConditions = profileConditions;
        this.recommendations = recommendations;
        this.calculatedAt = Instant.now();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getHistoryId() {
        return historyId;
    }

    public void setHistoryId(String historyId) {
        this.historyId = historyId;
    }

    public Instant getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(Instant calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public Map<String, Object> getProfileConditions() {
        return profileConditions;
    }

    public void setProfileConditions(Map<String, Object> profileConditions) {
        this.profileConditions = profileConditions;
    }

    public List<RecommendedSeedItem> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<RecommendedSeedItem> recommendations) {
        this.recommendations = recommendations;
    }

    public static class RecommendedSeedItem {
        private SeedVariety seed;
        private int matchScore; // Relative suitability ranking score (0 - 100)
        private String scoreExplanation;
        private List<String> matchReasons;
        private List<String> mismatches;
        private String soilSuitability;
        private String waterSuitability;
        private Integer maturityDays;
        private List<String> limitations;

        public RecommendedSeedItem() {}

        public RecommendedSeedItem(SeedVariety seed, int matchScore, String scoreExplanation,
                                   List<String> matchReasons, List<String> mismatches,
                                   String soilSuitability, String waterSuitability,
                                   Integer maturityDays, List<String> limitations) {
            this.seed = seed;
            this.matchScore = matchScore;
            this.scoreExplanation = scoreExplanation;
            this.matchReasons = matchReasons;
            this.mismatches = mismatches;
            this.soilSuitability = soilSuitability;
            this.waterSuitability = waterSuitability;
            this.maturityDays = maturityDays;
            this.limitations = limitations;
        }

        public SeedVariety getSeed() {
            return seed;
        }

        public void setSeed(SeedVariety seed) {
            this.seed = seed;
        }

        public int getMatchScore() {
            return matchScore;
        }

        public void setMatchScore(int matchScore) {
            this.matchScore = matchScore;
        }

        public String getScoreExplanation() {
            return scoreExplanation;
        }

        public void setScoreExplanation(String scoreExplanation) {
            this.scoreExplanation = scoreExplanation;
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

        public List<String> getLimitations() {
            return limitations;
        }

        public void setLimitations(List<String> limitations) {
            this.limitations = limitations;
        }
    }
}
