package com.farmwise.controllers;

import com.farmwise.dto.ApiResponse;
import com.farmwise.dto.FarmProfileDTO;
import com.farmwise.security.UserPrincipal;
import com.farmwise.services.FarmProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class FarmProfileController {

    @Autowired
    private FarmProfileService farmProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<FarmProfileDTO>> getFarmProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        }

        Optional<FarmProfileDTO> profileOpt = farmProfileService.getProfileByFarmerId(userPrincipal.getId());
        if (profileOpt.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Farm profile retrieved successfully", profileOpt.get()));
        } else {
            return ResponseEntity.ok(new ApiResponse<>(false, "No farm profile found. Please set up your farm profile.", null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FarmProfileDTO>> saveFarmProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody FarmProfileDTO dto) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        }

        FarmProfileDTO saved = farmProfileService.saveOrUpdateProfile(userPrincipal.getId(), dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Farm profile saved successfully!", saved));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<FarmProfileDTO>> updateFarmProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody FarmProfileDTO dto) {
        return saveFarmProfile(userPrincipal, dto);
    }
}
