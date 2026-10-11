package com.farmwise.security;

import com.farmwise.models.Farmer;
import com.farmwise.repositories.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private FarmerRepository farmerRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Farmer not found with email: " + email));

        return UserPrincipal.create(farmer);
    }

    public UserDetails loadUserById(String id) {
        Farmer farmer = farmerRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Farmer not found with id: " + id));

        return UserPrincipal.create(farmer);
    }
}
