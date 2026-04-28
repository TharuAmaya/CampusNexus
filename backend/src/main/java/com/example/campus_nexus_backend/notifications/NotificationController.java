
package com.example.campus_nexus_backend.notifications;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // 1. send notification who already looged in
    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        String email = authentication.getName();
        List<Notification> rawNotifications = notificationService.getUserNotifications(email);

        // mapping data to sent frontend
        List<Map<String, Object>> responseList = rawNotifications.stream().map(notif -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", notif.getId());
            map.put("message", notif.getMessage());
            map.put("type", notif.getType());
            map.put("isRead", notif.isRead());
            map.put("createdAt", notif.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    // 2. After reading notification, update as READ
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok("{\"message\": \"Marked as read\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"Error marking as read\"}");
        }
    }
}