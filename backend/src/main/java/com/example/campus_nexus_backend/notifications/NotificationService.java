package com.example.campus_nexus_backend.notifications;

import com.example.campus_nexus_backend.auth.User;
import com.example.campus_nexus_backend.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    
    // 1. Method to send a new notification 
    public void sendNotification(String recipientEmail, String message, String type) {
        User recipient = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setType(type); // "TICKET" or "BOOKING"
        
        notificationRepository.save(notification);
    }

    // 2. Method to get all notifications for a user by their email
    public List<Notification> getUserNotifications(String email) {
        return notificationRepository.findByRecipient_EmailOrderByCreatedAtDesc(email);
    }

    // 3. Method to mark a notification as read
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found!"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }
}