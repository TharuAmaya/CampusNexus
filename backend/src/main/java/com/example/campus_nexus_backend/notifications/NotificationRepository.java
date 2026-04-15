package com.example.campus_nexus_backend.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // කෙනෙක්ගේ Email එකට අදාළ ඔක්කොම Notifications ටික අලුත්ම එකේ ඉඳන් පරණ එකට ගේනවා
    List<Notification> findByRecipient_EmailOrderByCreatedAtDesc(String email);
    
    // තාම කියවලා නැති (Unread) Notifications ගාණ හොයනවා
    long countByRecipient_EmailAndIsReadFalse(String email);
}