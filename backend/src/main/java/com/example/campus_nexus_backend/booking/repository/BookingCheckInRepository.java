package com.example.campus_nexus_backend.booking.repository;

import com.example.campus_nexus_backend.booking.entity.BookingCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingCheckInRepository extends JpaRepository<BookingCheckIn, Long> {
    List<BookingCheckIn> findByBookingIdOrderByCheckInTimeDesc(Long bookingId);
}
