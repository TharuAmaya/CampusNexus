package com.example.campus_nexus_backend.maintenance_and_ticketing.exception;

import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.AdminTechnicianController;
import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.AdminTicketController;
import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.TechnicianTicketController;
import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.TicketCommentController;
import com.example.campus_nexus_backend.maintenance_and_ticketing.controller.TicketController;
import org.springframework.http.HttpStatus;
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

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage() == null ? "Request failed" : ex.getMessage();
        String lowered = message.toLowerCase();

        if (lowered.contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);
        }

        if (lowered.contains("unauthorized") || lowered.contains("only")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(message);
        }

        if (lowered.contains("denied")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        String message = ex.getMessage() == null ? "Unexpected server error" : ex.getMessage();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(message);
    }
}
