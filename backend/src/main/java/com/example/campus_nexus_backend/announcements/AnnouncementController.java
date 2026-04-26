package com.example.campus_nexus_backend.announcements;

import com.example.campus_nexus_backend.auth.User;
import com.example.campus_nexus_backend.auth.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private UserRepository userRepository;

    // 1. Get announcements based on user role (Available to everyone)
    @GetMapping
    public ResponseEntity<List<Announcement>> getAnnouncements(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Announcement> announcements = announcementService.getAnnouncementsForRole(user.getRole());
        return ResponseEntity.ok(announcements);
    }

    // 2. Create a new announcement (Only Admins)
    @PostMapping
    public ResponseEntity<?> createAnnouncement(@Valid @RequestBody AnnouncementRequestDTO dto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        
        if (!"ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body("{\"message\": \"Only admins can create announcements\"}");
        }
        
        Announcement created = announcementService.createAnnouncement(dto, authentication.getName());
        return ResponseEntity.ok(created);
    }

    // 3. Update an existing announcement (Only Admins)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnnouncement(@PathVariable Long id, @Valid @RequestBody AnnouncementRequestDTO dto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        
        if (!"ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body("{\"message\": \"Only admins can update announcements\"}");
        }
        
        Announcement updated = announcementService.updateAnnouncement(id, dto);
        return ResponseEntity.ok(updated);
    }

    // 4. Delete an announcement (Only Admins)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        
        if (!"ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body("{\"message\": \"Only admins can delete announcements\"}");
        }
        
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok("{\"message\": \"Announcement deleted successfully\"}");
    }

    // --- Local Exception Handler for this Controller ---
    // Catches AnnouncementNotFoundException and returns a formatted JSON error response
    @ExceptionHandler(AnnouncementNotFoundException.class)
    public ResponseEntity<AnnouncementErrorResponse> handleAnnouncementNotFound(AnnouncementNotFoundException ex) {
        AnnouncementErrorResponse errorResponse = new AnnouncementErrorResponse(
                LocalDateTime.now(),
                404, // HTTP Status 404 Not Found
                "NOT_FOUND",
                ex.getMessage()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }
}