package com.farmwise.repositories;

import com.farmwise.models.ShopInventoryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopInventoryRepository extends MongoRepository<ShopInventoryItem, String> {

    List<ShopInventoryItem> findByShopId(String shopId);

    List<ShopInventoryItem> findBySeedVarietyId(String seedVarietyId);

    List<ShopInventoryItem> findByCropTypeIgnoreCase(String cropType);
}
