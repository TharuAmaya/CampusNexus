package com.example.campus_nexus_backend.announcements;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    // 1. create a new announcement
    public Announcement createAnnouncement(AnnouncementRequestDTO dto, String createdBy) {
        Announcement announcement = new Announcement();
        announcement.setTitle(dto.getTitle());
        announcement.setContent(dto.getContent());
        announcement.setTargetAudience(dto.getTargetAudience());
        announcement.setCreatedBy(createdBy);
        return announcementRepository.save(announcement);
    }

    // 2. see announcements as role wise
    public List<Announcement> getAnnouncementsForRole(String role) {
        if ("ROLE_ADMIN".equals(role)) {
            // admin can see all announcements
            return announcementRepository.findAllByOrderByCreatedAtDesc();
        } else if ("ROLE_STUDENT".equals(role)) {
            // Student can see STUDENT and ALL announcements
            return announcementRepository.findForUserRole(TargetAudience.STUDENT);
        } else if ("ROLE_TECHNICIAN".equals(role)) {
            // Technician can see TECHNICIAN and ALL announcements
            return announcementRepository.findForUserRole(TargetAudience.TECHNICIAN);
        }
        return List.of();
    }

    public Announcement updateAnnouncement(Long id, AnnouncementRequestDTO dto) {//error exceptions
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new AnnouncementNotFoundException("Announcement with ID " + id + " was not found!")); // 
        
        announcement.setTitle(dto.getTitle());
        announcement.setContent(dto.getContent());
        announcement.setTargetAudience(dto.getTargetAudience());
        
        return announcementRepository.save(announcement);
    }

    // 4. delete an announcement
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }



    
}