package com.example.campus_nexus_backend.announcements;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    // 1. අලුත් නිවේදනයක් සෑදීම
    public Announcement createAnnouncement(AnnouncementRequestDTO dto, String createdBy) {
        Announcement announcement = new Announcement();
        announcement.setTitle(dto.getTitle());
        announcement.setContent(dto.getContent());
        announcement.setTargetAudience(dto.getTargetAudience());
        announcement.setCreatedBy(createdBy);
        return announcementRepository.save(announcement);
    }

    // 2. Role එක අනුව නිවේදන බැලීම
    public List<Announcement> getAnnouncementsForRole(String role) {
        if ("ROLE_ADMIN".equals(role)) {
            // Admin ට ඔක්කොම පේනවා (Edit/Delete කරන්න ලේසි වෙන්න)
            return announcementRepository.findAllByOrderByCreatedAtDesc();
        } else if ("ROLE_STUDENT".equals(role)) {
            // Student ට STUDENT සහ ALL ඒවා පේනවා
            return announcementRepository.findForUserRole(TargetAudience.STUDENT);
        } else if ("ROLE_TECHNICIAN".equals(role)) {
            // Technician ට TECHNICIAN සහ ALL ඒවා පේනවා
            return announcementRepository.findForUserRole(TargetAudience.TECHNICIAN);
        }
        return List.of();
    }

    public Announcement updateAnnouncement(Long id, AnnouncementRequestDTO dto) {//error exceptions
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new AnnouncementNotFoundException("Announcement with ID " + id + " was not found!")); // මෙතන වෙනස් කළා
        
        announcement.setTitle(dto.getTitle());
        announcement.setContent(dto.getContent());
        announcement.setTargetAudience(dto.getTargetAudience());
        
        return announcementRepository.save(announcement);
    }

    // 4. නිවේදනයක් මැකීම (Delete)
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }



    
}