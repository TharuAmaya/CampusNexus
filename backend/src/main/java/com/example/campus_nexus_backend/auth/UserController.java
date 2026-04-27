package com.example.campus_nexus_backend.auth; // ඔයාගේ package නම හරියටම දෙන්න

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173") //allow react requests
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 1.see profile details (GET API)
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        // fetch email from token who logged in
        String email = authentication.getName(); 
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        
        return ResponseEntity.ok(user); // get all details of the user, send to frontend
    }

    // 2.Update profile details
    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(Authentication authentication, @RequestBody User updatedData) {
        String email = authentication.getName();
        User existingUser = userRepository.findByEmail(email).orElse(null);

        if (existingUser == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        
        //Update only particular details
        existingUser.setFullName(updatedData.getFullName());
        existingUser.setPhoneNumber(updatedData.getPhoneNumber());
        existingUser.setStudentOrEmpId(updatedData.getStudentOrEmpId());
        existingUser.setDepartment(updatedData.getDepartment());
        existingUser.setBio(updatedData.getBio());

        // Update the user in the DB
        userRepository.save(existingUser);

        return ResponseEntity.ok("Profile updated successfully!");
    }
}