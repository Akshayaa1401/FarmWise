package com.farmwise.repositories;

import com.farmwise.models.RecommendationHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationHistoryRepository extends MongoRepository<RecommendationHistory, String> {

    List<RecommendationHistory> findByFarmerIdOrderByTimestampDesc(String farmerId);
}
