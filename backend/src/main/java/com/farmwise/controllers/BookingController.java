package com.farmwise.controllers;

import com.farmwise.dto.ApiResponse;
import com.farmwise.dto.BookingRequestDTO;
import com.farmwise.models.Booking;
import com.farmwise.security.UserPrincipal;
import com.farmwise.services.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody BookingRequestDTO request) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Farmer authentication required to reserve a product.", null));
        }
        if (request == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Booking details are required.", null));
        }

        try {
            Booking booking = bookingService.createBooking(
                    userPrincipal.getId(),
                    userPrincipal.getName(),
                    userPrincipal.getUsername(),
                    request
            );
            return ResponseEntity.ok(new ApiResponse<>(true, "Product reservation confirmed successfully!", booking));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Booking>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        }

        List<Booking> bookings = bookingService.getBookingsForFarmer(userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Retrieved " + bookings.size() + " bookings", bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String id) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        }

        Optional<Booking> bookingOpt = bookingService.getBookingById(id);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            if (!booking.getFarmerId().equals(userPrincipal.getId())) {
                return ResponseEntity.status(403).body(new ApiResponse<>(false, "Access denied to this booking", null));
            }
            return ResponseEntity.ok(new ApiResponse<>(true, "Booking found", booking));
        } else {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, "Booking not found", null));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String id) {

        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthenticated", null));
        }

        try {
            Booking cancelled = bookingService.cancelBooking(userPrincipal.getId(), id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Reservation cancelled and store stock restored.", cancelled));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
