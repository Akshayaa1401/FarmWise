package com.farmwise.controllers;

import com.farmwise.dto.ApiResponse;
import com.farmwise.dto.SeedComparisonRequestDTO;
import com.farmwise.dto.SeedComparisonResponseDTO;
import com.farmwise.models.SeedVariety;
import com.farmwise.security.UserPrincipal;
import com.farmwise.services.SeedCatalogService;
import com.farmwise.services.SeedComparisonService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/seeds")
public class SeedComparisonController {

    @Autowired
    private SeedComparisonService seedComparisonService;

    @Autowired
    private SeedCatalogService seedCatalogService;

    @GetMapping("/catalog")
    public ResponseEntity<ApiResponse<List<SeedVariety>>> getSeedCatalog(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String cropType,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String soilType,
            @RequestParam(required = false) String waterReq,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) Double maxPrice) {

        List<SeedVariety> catalog = seedCatalogService.searchAndFilter(query, cropType, season, soilType, waterReq, sortBy, maxDuration, maxPrice);
        return ResponseEntity.ok(new ApiResponse<>(true, "Retrieved " + catalog.size() + " seed varieties", catalog));
    }

    @GetMapping("/catalog/{id}")
    public ResponseEntity<ApiResponse<SeedVariety>> getSeedById(@PathVariable String id) {
        Optional<SeedVariety> seedOpt = seedCatalogService.getSeedById(id);
        if (seedOpt.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Seed variety retrieved", seedOpt.get()));
        } else {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "Seed variety not found with ID: " + id, null));
        }
    }

    @PostMapping("/compare")
    public ResponseEntity<ApiResponse<SeedComparisonResponseDTO>> compareSeeds(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SeedComparisonRequestDTO request) {
        String farmerId = (userPrincipal != null) ? userPrincipal.getId() : null;
        SeedComparisonResponseDTO response = seedComparisonService.compareSeeds(farmerId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Seeds compared successfully", response));
    }
}
