package com.example.campus_nexus_backend.auth; // ඔයාගේ package නම හරියටම දෙන්න

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173") // React එකෙන් එන Requests වලට ඉඩ දෙනවා
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 1. Profile විස්තර බලාගන්න (GET API)
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        // Token එකෙන් ලොග් වෙලා ඉන්න කෙනාගේ Email එක ගන්නවා (මේක මාර Secure!)
        String email = authentication.getName(); 
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        
        return ResponseEntity.ok(user); // සම්පූර්ණ විස්තර ටික React එකට යවනවා
    }

    // 2. Profile විස්තර වෙනස් කරන්න (PUT API)
    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(Authentication authentication, @RequestBody User updatedData) {
        String email = authentication.getName();
        User existingUser = userRepository.findByEmail(email).orElse(null);

        if (existingUser == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        // ආරක්ෂාව: අපි වෙනස් කරන්න දෙන්නේ මේ අලුත් විස්තර ටික සහ නම විතරයි.
        // (Email එක, Role එක, Provider වගේ දේවල් වෙනස් කරන්න දෙන්නේ නෑ!)
        existingUser.setFullName(updatedData.getFullName());
        existingUser.setPhoneNumber(updatedData.getPhoneNumber());
        existingUser.setStudentOrEmpId(updatedData.getStudentOrEmpId());
        existingUser.setDepartment(updatedData.getDepartment());
        existingUser.setBio(updatedData.getBio());

        // Update කරපු විස්තර ටික Database එකේ Save කරනවා
        userRepository.save(existingUser);

        return ResponseEntity.ok("Profile updated successfully!");
    }
}