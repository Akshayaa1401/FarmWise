package com.farmwise.controllers;

import com.farmwise.dto.ApiResponse;
import com.farmwise.dto.FarmProfileDTO;
import com.farmwise.models.FarmMemoryLog;
import com.farmwise.security.UserPrincipal;
import com.farmwise.services.FarmMemoryService;
import com.farmwise.services.FarmProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/api/farm-memory")
public class FarmMemoryController {
    private final FarmMemoryService farmMemoryService;
    private final FarmProfileService farmProfileService;

    public FarmMemoryController(FarmMemoryService farmMemoryService, FarmProfileService farmProfileService) {
        this.farmMemoryService = farmMemoryService;
        this.farmProfileService = farmProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFarmMemory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        Map<String, Object> memory = new LinkedHashMap<>();
        Optional<FarmProfileDTO> profile = farmProfileService.getProfileByFarmerId(userPrincipal.getId());
        memory.put("currentProfile", profile.orElse(null));
        memory.put("profileExists", profile.isPresent());
        List<FarmMemoryLog> history = farmMemoryService.getFarmerHistory(userPrincipal.getId());
        memory.put("history", history);
        memory.put("totalEvents", history.size());
        return ResponseEntity.ok(new ApiResponse<>(true, "Farm memory retrieved", memory));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<FarmMemoryLog>>> getHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        List<FarmMemoryLog> logs = farmMemoryService.getFarmerHistory(userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Retrieved " + logs.size() + " farm memory records", logs));
    }

    @PostMapping("/harvest")
    public ResponseEntity<ApiResponse<FarmMemoryLog>> recordHarvest(
            @AuthenticationPrincipal UserPrincipal userPrincipal, @RequestBody Map<String, Object> request) {
        if (userPrincipal == null) return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        if (request == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Harvest details are required.", null));
        }
        String seedName = stringValue(request.get("seedName"));
        String season = stringValue(request.get("season"));
        String outcome = stringValue(request.get("harvestOutcome")).toUpperCase(Locale.ROOT);
        if (seedName.isBlank() || season.isBlank() || !List.of("GOOD", "MODERATE", "LOW").contains(outcome)) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Seed name, season, and a GOOD/MODERATE/LOW harvest outcome are required.", null));
        }
        Double area = numberValue(request.get("cultivatedAreaAcres"));
        Double yield = numberValue(request.get("yieldQuintalPerAcre"));
        if (area == null || !Double.isFinite(area) || area <= 0
                || yield == null || !Double.isFinite(yield) || yield < 0) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Cultivated area must be a finite positive number and yield must be a finite number zero or greater.", null));
        }
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("seedName", seedName);
        details.put("season", season);
        details.put("cultivatedAreaAcres", area);
        details.put("yieldQuintalPerAcre", yield);
        details.put("harvestOutcome", outcome);
        details.put("profitLevel", stringValue(request.get("profitLevel")));
        details.put("notes", stringValue(request.get("notes")));
        // Snapshot the farm conditions at harvest time so future comparisons use relevant history only.
        farmProfileService.getProfileByFarmerId(userPrincipal.getId()).ifPresent(profile -> {
            details.put("location", profile.getLocation());
            details.put("soilType", profile.getSoilType());
            details.put("soilPh", profile.getSoilPh());
            details.put("waterAvailability", profile.getWaterAvailability());
            details.put("irrigationMethod", profile.getIrrigationMethod());
            details.put("growingSeason", profile.getGrowingSeason());
        });
        FarmMemoryLog saved = farmMemoryService.saveHarvestExperience(userPrincipal.getId(), details);
        return ResponseEntity.ok(new ApiResponse<>(true, "Harvest experience saved", saved));
    }

    @PostMapping("/crop-problem")
    public ResponseEntity<ApiResponse<FarmMemoryLog>> recordCropProblem(
            @AuthenticationPrincipal UserPrincipal userPrincipal, @RequestBody(required = false) Map<String, Object> request) {
        if (userPrincipal == null) return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        if (request == null) return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Crop problem details are required.", null));
        String crop = stringValue(request.get("crop"));
        String problem = stringValue(request.get("problem"));
        String symptoms = stringValue(request.get("symptoms"));
        String treatment = stringValue(request.get("treatment"));
        String outcome = stringValue(request.get("outcome"));
        if (crop.isBlank() || problem.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Crop and problem category are required.", null));
        }
        if (!List.of("PESTS", "DISEASE", "YELLOW_LEAVES", "POOR_GROWTH").contains(problem.toUpperCase(Locale.ROOT))) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Choose a supported crop problem category.", null));
        }
        if (!outcome.isBlank() && !List.of("NOT_YET_KNOWN", "IMPROVED", "NO_CHANGE", "WORSENED").contains(outcome.toUpperCase(Locale.ROOT))) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Choose a supported treatment outcome.", null));
        }
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("crop", crop);
        details.put("problem", problem);
        details.put("symptoms", symptoms);
        details.put("treatment", treatment);
        details.put("outcome", outcome);
        details.put("recordedAt", java.time.Instant.now().toString());
        FarmMemoryLog saved = farmMemoryService.saveCropProblem(userPrincipal.getId(), details);
        return ResponseEntity.ok(new ApiResponse<>(true, "Crop problem saved to Farm Memory", saved));
    }

    @PutMapping("/crop-problem/{id}/outcome")
    public ResponseEntity<ApiResponse<FarmMemoryLog>> updateCropProblemOutcome(
            @AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> request) {
        if (userPrincipal == null) return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        if (request == null) return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Treatment outcome details are required.", null));
        String treatment = stringValue(request.get("treatment"));
        String outcome = stringValue(request.get("outcome")).toUpperCase(Locale.ROOT);
        if (!List.of("NOT_YET_KNOWN", "IMPROVED", "NO_CHANGE", "WORSENED").contains(outcome)) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Choose a supported treatment outcome.", null));
        }
        try {
            FarmMemoryLog saved = farmMemoryService.updateCropProblemOutcome(userPrincipal.getId(), id, treatment, outcome);
            return ResponseEntity.ok(new ApiResponse<>(true, "Treatment outcome updated in Farm Memory", saved));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, ex.getMessage(), null));
        }
    }

    private String stringValue(Object value) { return value == null ? "" : value.toString().trim(); }
    private Double numberValue(Object value) {
        if (value instanceof Number number) return number.doubleValue();
        try { return value == null ? null : Double.parseDouble(value.toString()); }
        catch (NumberFormatException ignored) { return null; }
    }
}
