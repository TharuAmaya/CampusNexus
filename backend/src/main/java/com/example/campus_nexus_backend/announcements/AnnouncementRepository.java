package com.example.campus_nexus_backend.announcements;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    
    //to see all announcement for admin
    List<Announcement> findAllByOrderByCreatedAtDesc();

    // see student ann/tech ann seperately
    @Query("SELECT a FROM Announcement a WHERE a.targetAudience = :audience OR a.targetAudience = 'ALL' ORDER BY a.createdAt DESC")
    List<Announcement> findForUserRole(@Param("audience") TargetAudience audience);
}