package com.farmwise.repositories;

import com.farmwise.models.FarmMemoryLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmMemoryLogRepository extends MongoRepository<FarmMemoryLog, String> {

    List<FarmMemoryLog> findByFarmerIdOrderByTimestampDesc(String farmerId);

    List<FarmMemoryLog> findByFarmerIdAndActionTypeOrderByTimestampDesc(String farmerId, String actionType);
}
