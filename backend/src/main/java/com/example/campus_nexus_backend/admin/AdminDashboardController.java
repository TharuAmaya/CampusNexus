package com.example.campus_nexus_backend.admin;

import com.example.campus_nexus_backend.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        
        // 1. මුළු පරිශීලකයින් ගණන
        stats.put("totalUsers", userRepository.count());
        
        // 2. අදාළ Roles වල ගණන්
        stats.put("totalStudents", userRepository.countByRole("ROLE_STUDENT"));
        stats.put("totalTechnicians", userRepository.countByRole("ROLE_TECHNICIAN"));
        stats.put("totalAdmins", userRepository.countByRole("ROLE_ADMIN"));
        
        // (ඉස්සරහට ඔයා Tickets හැදුවම, මෙතනට stats.put("pendingTickets", ticketRepo.countByStatus("PENDING")); වගේ දාන්න පුළුවන්)

        return ResponseEntity.ok(stats);
    }
}