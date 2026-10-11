package com.farmwise.repositories;

import com.farmwise.models.SeedVariety;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeedVarietyRepository extends MongoRepository<SeedVariety, String> {

    List<SeedVariety> findByCropTypeIgnoreCase(String cropType);

    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<SeedVariety> findByNameContainingIgnoreCase(String keyword);

    List<SeedVariety> findByWaterRequirementsIgnoreCase(String waterRequirements);

    List<SeedVariety> findByGrowingSeasonsContainingIgnoreCase(String season);

    List<SeedVariety> findBySuitableSoilTypesContainingIgnoreCase(String soilType);
}
