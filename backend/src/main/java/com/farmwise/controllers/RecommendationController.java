package com.farmwise.controllers;

import com.farmwise.dto.ApiResponse;
import com.farmwise.dto.RecommendationResponseDTO;
import com.farmwise.models.RecommendationHistory;
import com.farmwise.security.UserPrincipal;
import com.farmwise.services.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<RecommendationResponseDTO>> generateRecommendations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        }

        RecommendationResponseDTO response = recommendationService.generateRecommendations(userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, response.getMessage(), response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<RecommendationHistory>>> getRecommendationHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        }

        List<RecommendationHistory> history = recommendationService.getRecommendationHistory(userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Retrieved " + history.size() + " historical recommendation runs", history));
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<ApiResponse<RecommendationHistory>> getHistoryDetail(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String id) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        }

        Optional<RecommendationHistory> historyOpt = recommendationService.getRecommendationHistoryById(id);
        if (historyOpt.isPresent() && historyOpt.get().getFarmerId().equals(userPrincipal.getId())) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Historical recommendation run retrieved", historyOpt.get()));
        } else {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "Historical recommendation run not found", null));
        }
    }
}
