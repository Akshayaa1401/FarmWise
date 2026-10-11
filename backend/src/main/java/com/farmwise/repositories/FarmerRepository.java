package com.farmwise.repositories;

import com.farmwise.models.Farmer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRepository extends MongoRepository<Farmer, String> {

    Optional<Farmer> findByEmail(String email);

    boolean existsByEmail(String email);
}
