package com.example.campus_nexus_backend.facilities.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(Long id) {
        super("could not find id " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
