package com.example.campus_nexus_backend.facilities.dto;

import com.example.campus_nexus_backend.facilities.model.enums.AvailabilityType;

import java.time.LocalDateTime;

public class CreateAvailabilityBlockRequest {

    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private AvailabilityType type;
    private String note;

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }

    public AvailabilityType getType() {
        return type;
    }

    public void setType(AvailabilityType type) {
        this.type = type;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
