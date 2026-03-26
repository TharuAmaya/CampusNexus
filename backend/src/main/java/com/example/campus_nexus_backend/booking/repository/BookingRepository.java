package com.example.campus_nexus_backend.booking.repository;

import com.example.campus_nexus_backend.booking.entity.Booking;
import com.example.campus_nexus_backend.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceIdAndBookingDateAndStatus(String resourceId, LocalDate bookingDate, BookingStatus status);
    
    Optional<Booking> findByQrToken(String qrToken);

    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.bookingDate = :bookingDate " +
           "AND b.status = :status " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime " +
           "AND (:excludeId IS NULL OR b.id != :excludeId)")
    List<Booking> findConflictingBookings(@Param("resourceId") String resourceId,
                                          @Param("bookingDate") LocalDate bookingDate,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("status") BookingStatus status,
                                          @Param("excludeId") Long excludeId);
}
