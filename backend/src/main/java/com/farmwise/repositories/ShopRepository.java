package com.farmwise.repositories;

import com.farmwise.models.Shop;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopRepository extends MongoRepository<Shop, String> {

    List<Shop> findByNameContainingIgnoreCase(String name);

    List<Shop> findByLocationContainingIgnoreCase(String location);
}
