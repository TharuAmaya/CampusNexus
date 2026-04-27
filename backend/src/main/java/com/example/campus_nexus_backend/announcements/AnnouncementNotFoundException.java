package com.example.campus_nexus_backend.announcements;

public class AnnouncementNotFoundException extends RuntimeException {
    public AnnouncementNotFoundException(String message) {
        super(message);
    }
}