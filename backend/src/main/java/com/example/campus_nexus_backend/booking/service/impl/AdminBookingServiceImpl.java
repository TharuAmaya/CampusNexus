package com.example.campus_nexus_backend.booking.service.impl;

import com.example.campus_nexus_backend.booking.dto.*;
import com.example.campus_nexus_backend.booking.entity.Booking;
import com.example.campus_nexus_backend.booking.entity.BookingCheckIn;
import com.example.campus_nexus_backend.booking.entity.BookingStatusHistory;
import com.example.campus_nexus_backend.booking.enums.BookingStatus;
import com.example.campus_nexus_backend.booking.enums.CheckInStatus;
import com.example.campus_nexus_backend.booking.exception.BookingConflictException;
import com.example.campus_nexus_backend.booking.exception.BookingNotFoundException;
import com.example.campus_nexus_backend.booking.exception.InvalidBookingStateException;
import com.example.campus_nexus_backend.booking.repository.BookingCheckInRepository;
import com.example.campus_nexus_backend.booking.repository.BookingRepository;
import com.example.campus_nexus_backend.booking.repository.BookingStatusHistoryRepository;
import com.example.campus_nexus_backend.booking.service.AdminBookingService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminBookingServiceImpl implements AdminBookingService {

    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final BookingCheckInRepository checkInRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> getAllBookings(AdminBookingFilterRequest filter) {
        Specification<Booking> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }
            if (filter.getBookingDate() != null) {
                predicates.add(cb.equal(root.get("bookingDate"), filter.getBookingDate()));
            }
            if (filter.getResourceId() != null && !filter.getResourceId().isBlank()) {
                predicates.add(cb.equal(root.get("resourceId"), filter.getResourceId()));
            }
            if (filter.getUserId() != null && !filter.getUserId().isBlank()) {
                predicates.add(cb.equal(root.get("userId"), filter.getUserId()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        boolean checkConflict = filter.getCheckConflict() != null && filter.getCheckConflict();

        return bookingRepository.findAll(spec).stream()
                .map(b -> mapToSummaryResponse(b, checkConflict))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminBookingReviewResponse getBookingReviewDetails(String bookingCode) {
        Booking booking = getBookingEntity(bookingCode);
        
        List<Booking> approvedForDate = bookingRepository.findByResourceIdAndBookingDateAndStatus(
                booking.getResourceId(), booking.getBookingDate(), BookingStatus.APPROVED);
                
        List<Booking> overlapping = bookingRepository.findConflictingBookings(
                booking.getResourceId(), booking.getBookingDate(), booking.getStartTime(), booking.getEndTime(), BookingStatus.APPROVED, booking.getId());
                
        boolean hasOverlap = !overlapping.isEmpty();
        boolean canApprove = booking.getStatus() == BookingStatus.PENDING && !hasOverlap;
        
        String message = canApprove ? "Booking is valid and can be approved." : 
                         (booking.getStatus() != BookingStatus.PENDING ? "Booking is no longer pending." : "Booking has overlap conflicts and cannot be approved.");

        return AdminBookingReviewResponse.builder()
                .bookingDetails(mapToResponse(booking))
                .resourceSummary("Resource capacity overview placeholder")
                .approvedBookingsForDate(approvedForDate.stream().map(b -> mapToSummaryResponse(b, false)).collect(Collectors.toList()))
                .overlappingBookings(overlapping.stream().map(b -> mapToSummaryResponse(b, false)).collect(Collectors.toList()))
                .canApprove(canApprove)
                .reviewMessage(message)
                .build();
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(String bookingCode, ApproveBookingRequest request) {
        log.info("Approving booking {}", bookingCode);
        Booking booking = getBookingEntity(bookingCode);
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Booking must be in PENDING state to be approved.");
        }
        
        checkForConflicts(booking.getResourceId(), booking.getBookingDate(), booking.getStartTime(), booking.getEndTime(), booking.getId());

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(request.getApprovedBy());
        booking.setApprovedAt(LocalDateTime.now());
        booking.setAdminDecisionReason(request.getAdminDecisionReason());
        booking.setQrToken(UUID.randomUUID().toString()); 

        Booking saved = bookingRepository.save(booking);
        recordHistory(saved.getId(), oldStatus, BookingStatus.APPROVED, request.getApprovedBy(), request.getAdminDecisionReason());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(String bookingCode, RejectBookingRequest request) {
        log.info("Rejecting booking {}", bookingCode);
        Booking booking = getBookingEntity(bookingCode);
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Booking must be in PENDING state to be rejected.");
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectedBy(request.getRejectedBy());
        booking.setRejectedAt(LocalDateTime.now());
        booking.setAdminDecisionReason(request.getAdminDecisionReason());

        Booking saved = bookingRepository.save(booking);
        recordHistory(saved.getId(), oldStatus, BookingStatus.REJECTED, request.getRejectedBy(), request.getAdminDecisionReason());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BookingCheckInResponse verifyQrToken(VerifyBookingQrRequest request) {
        Booking booking = bookingRepository.findByQrToken(request.getQrToken()).orElse(null);
        LocalDateTime now = LocalDateTime.now();

        if (booking == null) {
            // Log failed checkin even if booking is not found (using 0L as placeholder, or just throwing)
            // But we need a bookingId for the table. So we throw 404 directly as it's totally invalid.
            throw new BookingNotFoundException("Invalid or non-existent QR token");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            recordCheckIn(booking.getId(), request.getQrToken(), CheckInStatus.FAILED, "QR token is only valid for APPROVED bookings.");
            throw new InvalidBookingStateException("QR token is only valid for APPROVED bookings.");
        }

        booking.setCheckedInAt(now);
        bookingRepository.save(booking);
        
        BookingCheckIn checkIn = recordCheckIn(booking.getId(), request.getQrToken(), CheckInStatus.SUCCESS, null);
        
        return BookingCheckInResponse.builder()
                .id(checkIn.getId())
                .bookingId(checkIn.getBookingId())
                .qrTokenUsed(checkIn.getQrTokenUsed())
                .status(checkIn.getStatus())
                .failureReason(checkIn.getFailureReason())
                .checkInTime(checkIn.getCheckInTime())
                .build();
    }

    // --- Private Helper Methods ---

    private void recordHistory(Long bookingId, BookingStatus oldStatus, BookingStatus newStatus, String changedBy, String reason) {
        historyRepository.save(BookingStatusHistory.builder()
                .bookingId(bookingId)
                .previousStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .reason(reason)
                .changedAt(LocalDateTime.now())
                .build());
    }

    private BookingCheckIn recordCheckIn(Long bookingId, String token, CheckInStatus status, String failureReason) {
        return checkInRepository.save(BookingCheckIn.builder()
                .bookingId(bookingId)
                .qrTokenUsed(token)
                .status(status)
                .failureReason(failureReason)
                .checkInTime(LocalDateTime.now())
                .build());
    }

    private Booking getBookingEntity(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new BookingNotFoundException("Booking specific code not found: " + bookingCode));
    }

    private void checkForConflicts(String resourceId, LocalDate date, java.time.LocalTime start, java.time.LocalTime end, Long excludeId) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resourceId, date, start, end, BookingStatus.APPROVED, excludeId);
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("The selected time slot conflicts with an existing approved booking.");
        }
    }

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .resourceId(b.getResourceId())
                .userId(b.getUserId())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .expectedAttendees(b.getExpectedAttendees())
                .status(b.getStatus())
                .adminDecisionReason(b.getAdminDecisionReason())
                .qrToken(b.getQrToken())
                .checkedInAt(b.getCheckedInAt())
                .approvedAt(b.getApprovedAt())
                .approvedBy(b.getApprovedBy())
                .rejectedAt(b.getRejectedAt())
                .rejectedBy(b.getRejectedBy())
                .cancelledAt(b.getCancelledAt())
                .cancelledBy(b.getCancelledBy())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
    
    private BookingSummaryResponse mapToSummaryResponse(Booking b, boolean checkConflict) {
        Boolean hasConflict = false;
        if (checkConflict && b.getStatus() == BookingStatus.PENDING) {
            hasConflict = !bookingRepository.findConflictingBookings(
                    b.getResourceId(), b.getBookingDate(), b.getStartTime(), b.getEndTime(), BookingStatus.APPROVED, b.getId()).isEmpty();
        }
        
        return BookingSummaryResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .resourceId(b.getResourceId())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .hasConflict(hasConflict)
                .build();
    }
}
