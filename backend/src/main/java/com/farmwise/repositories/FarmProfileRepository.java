package com.farmwise.repositories;

import com.farmwise.models.FarmProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmProfileRepository extends MongoRepository<FarmProfile, String> {

    Optional<FarmProfile> findByFarmerId(String farmerId);

    boolean existsByFarmerId(String farmerId);
}
