package com.example.campus_nexus_backend.maintenance_and_ticketing.exception;

import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.AdminTechnicianController;
import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.AdminTicketController;
import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.TechnicianTicketController;
import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.TicketCommentController;
import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.TicketController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = {
        TicketController.class,
        TicketCommentController.class,
        TechnicianTicketController.class,
        AdminTicketController.class,
        AdminTechnicianController.class
})
public class MaintenanceandticketExceptionHandler {

    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<String> handleFileStorageException(FileStorageException ex) {
        String message = ex.getMessage() == null ? "File storage operation failed" : ex.getMessage();
        return ResponseEntity.status(500).body(withStatusCode(500, message));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage() == null ? "Request failed" : ex.getMessage();
        String lowered = message.toLowerCase();

        if (lowered.contains("not found")) {
            return ResponseEntity.status(404).body(withStatusCode(404, message));
        }

        if (lowered.contains("unauthorized") || lowered.contains("only")) {
            return ResponseEntity.status(403).body(withStatusCode(403, message));
        }

        if (lowered.contains("denied")) {
            return ResponseEntity.status(409).body(withStatusCode(409, message));
        }

        return ResponseEntity.status(400).body(withStatusCode(400, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        String message = ex.getMessage() == null ? "Unexpected server error" : ex.getMessage();
        return ResponseEntity.status(500).body(withStatusCode(500, message));
    }

    private String withStatusCode(int statusCode, String message) {
        return statusCode + " " + message;
    }
}
