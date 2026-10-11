package com.farmwise.controllers;

import com.farmwise.dto.ApiResponse;
import com.farmwise.dto.FarmProfileDTO;
import com.farmwise.dto.WeatherResponseDTO;
import com.farmwise.security.UserPrincipal;
import com.farmwise.services.FarmProfileService;
import com.farmwise.services.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {
    private final WeatherService weatherService;
    private final FarmProfileService farmProfileService;

    public WeatherController(WeatherService weatherService, FarmProfileService farmProfileService) {
        this.weatherService = weatherService;
        this.farmProfileService = farmProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<WeatherResponseDTO>> getWeather(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Please sign in to view weather for your farm.", null));
        }
        Optional<FarmProfileDTO> profile = farmProfileService.getProfileByFarmerId(userPrincipal.getId());
        if (profile.isEmpty() || profile.get().getLocation() == null || profile.get().getLocation().isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Save your farm location in Farm Profile to view local weather.", null));
        }
        WeatherResponseDTO weather = weatherService.getWeatherForLocation(profile.get().getLocation());
        if (weather == null) {
            return ResponseEntity.status(503).body(new ApiResponse<>(false,
                    "Weather is unavailable. Configure OPENWEATHER_API_KEY and verify the saved location/network connection.", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Weather retrieved for " + weather.getLocation(), weather));
    }
}
