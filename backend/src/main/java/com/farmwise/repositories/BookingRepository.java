package com.farmwise.repositories;

import com.farmwise.models.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByFarmerIdOrderByBookingDateDesc(String farmerId);

    Optional<Booking> findByBookingId(String bookingId);
}
