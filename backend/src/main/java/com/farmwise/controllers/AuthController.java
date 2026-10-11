package com.farmwise.controllers;

import com.farmwise.dto.ApiResponse;
import com.farmwise.dto.AuthResponse;
import com.farmwise.dto.LoginRequest;
import com.farmwise.dto.RegisterRequest;
import com.farmwise.models.Farmer;
import com.farmwise.security.UserPrincipal;
import com.farmwise.services.FarmerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private FarmerService farmerService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerFarmer(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = farmerService.registerFarmer(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Farmer registered successfully!", response));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, ex.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginFarmer(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = farmerService.loginFarmer(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful!", response));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Invalid email or password", null));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Farmer>> getCurrentFarmer(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Unauthenticated", null));
        }
        Farmer farmer = farmerService.getFarmerById(userPrincipal.getId());
        farmer.setPassword(null); // Hide hashed password
        return ResponseEntity.ok(new ApiResponse<>(true, "Current farmer retrieved", farmer));
    }
}
