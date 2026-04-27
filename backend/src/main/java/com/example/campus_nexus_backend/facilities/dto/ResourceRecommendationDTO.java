package com.example.campus_nexus_backend.facilities.dto;

import com.example.campus_nexus_backend.facilities.model.ResourcesModel;

import java.time.LocalTime;

public class ResourceRecommendationDTO {
    private Long resourceId;
    private String name;
    private String type;
    private String location;
    private int capacity;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private String imageName;
    private String status;
    private int score;
    private String recommendationReason;

    public static ResourceRecommendationDTO from(ResourcesModel resource, int score, String reason) {
        ResourceRecommendationDTO dto = new ResourceRecommendationDTO();
        dto.setResourceId(resource.getResourceId());
        dto.setName(resource.getName());
        dto.setType(resource.getType() != null ? resource.getType().name() : null);
        dto.setLocation(resource.getLocation());
        dto.setCapacity(resource.getCapacity());
        dto.setAvailableFrom(resource.getAvailableFrom());
        dto.setAvailableTo(resource.getAvailableTo());
        dto.setImageName(resource.getImageName());
        dto.setStatus(resource.getStatus() != null ? resource.getStatus().name() : null);
        dto.setScore(score);
        dto.setRecommendationReason(reason);
        return dto;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }

    public void setAvailableTo(LocalTime availableTo) {
        this.availableTo = availableTo;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getRecommendationReason() {
        return recommendationReason;
    }

    public void setRecommendationReason(String recommendationReason) {
        this.recommendationReason = recommendationReason;
    }
}
