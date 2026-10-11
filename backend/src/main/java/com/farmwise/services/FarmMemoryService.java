package com.farmwise.services;

import com.farmwise.models.FarmMemoryLog;
import com.farmwise.repositories.FarmMemoryLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FarmMemoryService {
    private final FarmMemoryLogRepository repository;

    public FarmMemoryService(FarmMemoryLogRepository repository) { this.repository = repository; }

    /** Stores selected farmer memory events; transient system events are intentionally ignored. */
    public void logEvent(String farmerId, String actionType, String title, String summary, Map<String, Object> snapshotData) {
        if ("HARVEST_EXPERIENCE".equalsIgnoreCase(actionType)
                || "CROP_PROBLEM".equalsIgnoreCase(actionType)
                || "TREATMENT_OUTCOME".equalsIgnoreCase(actionType)) {
            repository.save(new FarmMemoryLog(farmerId, actionType.toUpperCase(java.util.Locale.ROOT), title, summary, snapshotData));
        }
    }

    public FarmMemoryLog saveHarvestExperience(String farmerId, Map<String, Object> details) {
        String seedName = String.valueOf(details.getOrDefault("seedName", "Paddy seed"));
        String outcome = String.valueOf(details.getOrDefault("harvestOutcome", "MODERATE"));
        String season = String.valueOf(details.getOrDefault("season", "season not specified"));
        String summary = seedName + " — " + outcome.toLowerCase() + " harvest in " + season;
        return repository.save(new FarmMemoryLog(farmerId, "HARVEST_EXPERIENCE", "Harvest Experience", summary, details));
    }

    public FarmMemoryLog saveCropProblem(String farmerId, Map<String, Object> details) {
        String crop = String.valueOf(details.getOrDefault("crop", "Crop"));
        String problem = String.valueOf(details.getOrDefault("problem", "Crop problem"));
        String symptoms = String.valueOf(details.getOrDefault("symptoms", ""));
        String label = switch (problem.toUpperCase(java.util.Locale.ROOT)) {
            case "PESTS" -> "Pest infestation";
            case "DISEASE" -> "Suspected disease";
            case "YELLOW_LEAVES" -> "Yellow leaves";
            case "POOR_GROWTH" -> "Poor growth";
            default -> problem;
        };
        return repository.save(new FarmMemoryLog(farmerId, "CROP_PROBLEM", crop + " — " + label, symptoms, details));
    }

    public FarmMemoryLog updateCropProblemOutcome(String farmerId, String recordId, String treatment, String outcome) {
        FarmMemoryLog record = repository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Crop problem record not found."));
        if (!farmerId.equals(record.getFarmerId()) || !"CROP_PROBLEM".equalsIgnoreCase(record.getActionType())) {
            throw new IllegalArgumentException("You can update only your own crop problem records.");
        }
        Map<String, Object> details = record.getSnapshotData() == null ? new java.util.LinkedHashMap<>() : new java.util.LinkedHashMap<>(record.getSnapshotData());
        details.put("treatment", treatment == null ? "" : treatment.trim());
        details.put("outcome", outcome == null ? "NOT_YET_KNOWN" : outcome.trim().toUpperCase(java.util.Locale.ROOT));
        details.put("outcomeUpdatedAt", java.time.Instant.now().toString());
        record.setSnapshotData(details);
        record.setSummary("Symptoms: " + String.valueOf(details.getOrDefault("symptoms", ""))
                + " | Treatment: " + String.valueOf(details.getOrDefault("treatment", "Not recorded"))
                + " | Outcome: " + String.valueOf(details.getOrDefault("outcome", "NOT_YET_KNOWN")));
        return repository.save(record);
    }

    public List<FarmMemoryLog> getFarmerHistory(String farmerId) {
        return repository.findByFarmerIdOrderByTimestampDesc(farmerId);
    }

    public List<FarmMemoryLog> getFarmerHistoryByType(String farmerId, String actionType) {
        if (actionType == null || actionType.isBlank()) return getFarmerHistory(farmerId);
        return repository.findByFarmerIdAndActionTypeOrderByTimestampDesc(farmerId, actionType.toUpperCase(java.util.Locale.ROOT));
    }
}
