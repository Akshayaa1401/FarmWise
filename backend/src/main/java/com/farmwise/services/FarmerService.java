package com.farmwise.services;

import com.farmwise.dto.AuthResponse;
import com.farmwise.dto.LoginRequest;
import com.farmwise.dto.RegisterRequest;
import com.farmwise.models.Farmer;
import com.farmwise.repositories.FarmerRepository;
import com.farmwise.security.JwtTokenProvider;
import com.farmwise.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class FarmerService {

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse registerFarmer(RegisterRequest request) {
        if (farmerRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new IllegalArgumentException("Email address is already registered: " + request.getEmail());
        }

        Farmer farmer = new Farmer();
        farmer.setName(request.getName().trim());
        farmer.setEmail(request.getEmail().toLowerCase().trim());
        farmer.setPassword(passwordEncoder.encode(request.getPassword()));

        Farmer savedFarmer = farmerRepository.save(farmer);

        // Do not authenticate or issue a JWT during registration. The farmer must sign in explicitly.
        return new AuthResponse(null, savedFarmer.getId(), savedFarmer.getName(), savedFarmer.getEmail());
    }

    public AuthResponse loginFarmer(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return new AuthResponse(jwt, userPrincipal.getId(), userPrincipal.getName(), userPrincipal.getEmail());
    }

    public Farmer getFarmerById(String id) {
        return farmerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found with ID: " + id));
    }
}
