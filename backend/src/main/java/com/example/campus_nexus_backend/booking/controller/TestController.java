package com.example.campus_nexus_backend.booking.controller;

import com.example.campus_nexus_backend.booking.entity.Booking;
import com.example.campus_nexus_backend.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TestController {
    
    private final BookingRepository repo;
    
    @GetMapping("/test-bookings")
    public List<Booking> testBookings() {
        return repo.findAll();
    }
}
