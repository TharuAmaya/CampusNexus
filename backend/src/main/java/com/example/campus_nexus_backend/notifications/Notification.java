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

    // කාටද Notification එක යන්නේ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // පණිවිඩය (උදා: "Your ticket #13 has been resolved")
    @Column(nullable = false)
    private String message;

    // මොකක් ගැනද? (උදා: "TICKET", "BOOKING", "SYSTEM")
    @Column(nullable = false)
    private String type;

    // කියවලද නැද්ද කියලා බලාගන්න (මුලින්ම හදද්දි False)
    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}