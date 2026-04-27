package com.example.campus_nexus_backend.facilities.dto;

import com.example.campus_nexus_backend.facilities.model.ResourceAvailabilityBlock;

import java.time.LocalDateTime;

public class AvailabilityBlockResponse {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private String type;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String note;

    public static AvailabilityBlockResponse fromEntity(ResourceAvailabilityBlock block) {
        AvailabilityBlockResponse response = new AvailabilityBlockResponse();
        response.setId(block.getId());
        response.setResourceId(block.getResource().getResourceId());
        response.setResourceName(block.getResource().getName());
        response.setType(block.getType().name());
        response.setStartAt(block.getStartAt());
        response.setEndAt(block.getEndAt());
        response.setNote(block.getNote());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

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

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
