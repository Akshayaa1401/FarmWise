package com.farmwise.dto;

import com.farmwise.models.SeedVariety;

import java.util.List;
import java.util.Map;

public class SeedComparisonResponseDTO {

    private List<SeedVariety> comparedSeeds;
    private String bestChoiceId;
    private String bestChoiceName;
    private String bestChoiceExplanation;
    private List<String> tradeoffs;
    private List<String> meaningfulDifferences;
    private boolean tieOrInsufficientEvidence;
    private String tieOrEvidenceExplanation;
    private Map<String, Object> farmProfileContext;

    public SeedComparisonResponseDTO() {}

    public SeedComparisonResponseDTO(List<SeedVariety> comparedSeeds, String bestChoiceId, String bestChoiceName,
                                   String bestChoiceExplanation, List<String> tradeoffs,
                                   List<String> meaningfulDifferences, boolean tieOrInsufficientEvidence,
                                   String tieOrEvidenceExplanation, Map<String, Object> farmProfileContext) {
        this.comparedSeeds = comparedSeeds;
        this.bestChoiceId = bestChoiceId;
        this.bestChoiceName = bestChoiceName;
        this.bestChoiceExplanation = bestChoiceExplanation;
        this.tradeoffs = tradeoffs;
        this.meaningfulDifferences = meaningfulDifferences;
        this.tieOrInsufficientEvidence = tieOrInsufficientEvidence;
        this.tieOrEvidenceExplanation = tieOrEvidenceExplanation;
        this.farmProfileContext = farmProfileContext;
    }

    public List<SeedVariety> getComparedSeeds() {
        return comparedSeeds;
    }

    public void setComparedSeeds(List<SeedVariety> comparedSeeds) {
        this.comparedSeeds = comparedSeeds;
    }

    public String getBestChoiceId() {
        return bestChoiceId;
    }

    public void setBestChoiceId(String bestChoiceId) {
        this.bestChoiceId = bestChoiceId;
    }

    public String getBestChoiceName() {
        return bestChoiceName;
    }

    public void setBestChoiceName(String bestChoiceName) {
        this.bestChoiceName = bestChoiceName;
    }

    public String getBestChoiceExplanation() {
        return bestChoiceExplanation;
    }

    public void setBestChoiceExplanation(String bestChoiceExplanation) {
        this.bestChoiceExplanation = bestChoiceExplanation;
    }

    public List<String> getTradeoffs() {
        return tradeoffs;
    }

    public void setTradeoffs(List<String> tradeoffs) {
        this.tradeoffs = tradeoffs;
    }

    public List<String> getMeaningfulDifferences() {
        return meaningfulDifferences;
    }

    public void setMeaningfulDifferences(List<String> meaningfulDifferences) {
        this.meaningfulDifferences = meaningfulDifferences;
    }

    public boolean isTieOrInsufficientEvidence() {
        return tieOrInsufficientEvidence;
    }

    public void setTieOrInsufficientEvidence(boolean tieOrInsufficientEvidence) {
        this.tieOrInsufficientEvidence = tieOrInsufficientEvidence;
    }

    public String getTieOrEvidenceExplanation() {
        return tieOrEvidenceExplanation;
    }

    public void setTieOrEvidenceExplanation(String tieOrEvidenceExplanation) {
        this.tieOrEvidenceExplanation = tieOrEvidenceExplanation;
    }

    public Map<String, Object> getFarmProfileContext() {
        return farmProfileContext;
    }

    public void setFarmProfileContext(Map<String, Object> farmProfileContext) {
        this.farmProfileContext = farmProfileContext;
    }
}
