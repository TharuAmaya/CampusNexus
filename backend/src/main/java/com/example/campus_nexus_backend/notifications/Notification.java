package com.example.campus_nexus_backend.notifications;

import com.example.campus_nexus_backend.auth.User;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // to who want to send notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // the message (e.g., "Your ticket #13 has been resolved")
    @Column(nullable = false)
    private String message;

    // about what - ticket/ booking...
    @Column(nullable = false)
    private String type;

    // check whether read it or not(default false)
    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}