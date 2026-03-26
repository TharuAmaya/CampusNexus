package com.example.campus_nexus_backend.booking.service.impl;

import com.example.campus_nexus_backend.booking.dto.*;
import com.example.campus_nexus_backend.booking.entity.Booking;
import com.example.campus_nexus_backend.booking.entity.BookingStatusHistory;
import com.example.campus_nexus_backend.booking.enums.BookingStatus;
import com.example.campus_nexus_backend.booking.exception.BookingConflictException;
import com.example.campus_nexus_backend.booking.exception.BookingNotFoundException;
import com.example.campus_nexus_backend.booking.exception.InvalidBookingStateException;
import com.example.campus_nexus_backend.booking.repository.BookingRepository;
import com.example.campus_nexus_backend.booking.repository.BookingStatusHistoryRepository;
import com.example.campus_nexus_backend.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository historyRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        log.info("Creating new booking for user {} on resource {}", request.getUserId(), request.getResourceId());
        
        validateBookingRules(request.getBookingDate(), request.getStartTime(), request.getEndTime());
        checkForConflicts(request.getResourceId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(), null);

        Booking booking = Booking.builder()
                .bookingCode(generateUniqueCode())
                .resourceId(request.getResourceId())
                .userId(request.getUserId())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        recordHistory(saved.getId(), null, BookingStatus.PENDING, request.getUserId(), "Initial creation");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(String bookingCode, UpdateBookingRequest request) {
        log.info("Updating booking {}", bookingCode);
        Booking booking = getBookingEntity(bookingCode);
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Only PENDING bookings can be updated.");
        }

        validateBookingRules(request.getBookingDate(), request.getStartTime(), request.getEndTime());
        checkForConflicts(request.getResourceId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(), booking.getId());

        booking.setResourceId(request.getResourceId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        Booking saved = bookingRepository.save(booking);
        recordHistory(saved.getId(), BookingStatus.PENDING, BookingStatus.PENDING, booking.getUserId(), "User updated booking details");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String bookingCode, String cancelledBy) {
        log.info("Cancelling booking {}", bookingCode);
        Booking booking = getBookingEntity(bookingCode);
        
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Only APPROVED or PENDING bookings can be cancelled.");
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledBy(cancelledBy);
        booking.setCancelledAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        recordHistory(saved.getId(), oldStatus, BookingStatus.CANCELLED, cancelledBy, "User cancelled booking");

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        return mapToResponse(getBookingEntity(bookingCode));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingQrResponse getBookingQrToken(String bookingCode) {
        Booking booking = getBookingEntity(bookingCode);
        if (booking.getStatus() != BookingStatus.APPROVED || booking.getQrToken() == null) {
            throw new InvalidBookingStateException("QR token is not available. Booking must be APPROVED.");
        }
        
        String qrBase64 = generateQRCodeImageBase64(booking.getQrToken());
        
        return BookingQrResponse.builder()
                .bookingCode(bookingCode)
                .qrToken(qrBase64)
                .build();
    }

    private String generateQRCodeImageBase64(String token) {
        try {
            int width = 300, height = 300;
            com.google.zxing.qrcode.QRCodeWriter qrCodeWriter = new com.google.zxing.qrcode.QRCodeWriter();
            com.google.zxing.common.BitMatrix bitMatrix = qrCodeWriter.encode(
                    "CHECKIN_TOKEN:" + token, 
                    com.google.zxing.BarcodeFormat.QR_CODE, width, height);

            java.io.ByteArrayOutputStream pngOutputStream = new java.io.ByteArrayOutputStream();
            com.google.zxing.client.j2se.MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            log.error("Failed to generate QR Code image", e);
            return token; // fallback to raw string
        }
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

    private Booking getBookingEntity(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new BookingNotFoundException("Booking specific code not found: " + bookingCode));
    }

    private void validateBookingRules(LocalDate date, java.time.LocalTime start, java.time.LocalTime end) {
        if (date.isBefore(LocalDate.now())) {
            throw new InvalidBookingStateException("Booking date cannot be in the past.");
        }
        if (!end.isAfter(start)) {
            throw new InvalidBookingStateException("End time must be after start time.");
        }
    }

    private void checkForConflicts(String resourceId, LocalDate date, java.time.LocalTime start, java.time.LocalTime end, Long excludeId) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resourceId, date, start, end, BookingStatus.APPROVED, excludeId);
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("The selected time slot conflicts with an existing approved booking.");
        }
    }

    private String generateUniqueCode() {
        return "BKG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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
    
    private BookingSummaryResponse mapToSummaryResponse(Booking b) {
        return BookingSummaryResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .resourceId(b.getResourceId())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .hasConflict(false) // Never checked externally for raw generic user lists to save DB loads
                .build();
    }
}
