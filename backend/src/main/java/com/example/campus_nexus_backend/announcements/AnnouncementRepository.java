package com.example.campus_nexus_backend.announcements;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    
    // Admin ට ඔක්කොම ටික බලන්න (අලුත්ම එක උඩින් එන්න)
    List<Announcement> findAllByOrderByCreatedAtDesc();

    // Student ට හෝ Technician ට අදාළ ඒවා විතරක් බලන්න (උදා: STUDENT කියලා දුන්නම STUDENT සහ ALL කියන දෙකම එනවා)
    @Query("SELECT a FROM Announcement a WHERE a.targetAudience = :audience OR a.targetAudience = 'ALL' ORDER BY a.createdAt DESC")
    List<Announcement> findForUserRole(@Param("audience") TargetAudience audience);
}