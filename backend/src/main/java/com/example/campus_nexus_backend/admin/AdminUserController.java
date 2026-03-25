package com.example.campus_nexus_backend.admin; // <-- 1. දැන් මේක තියෙන්නේ admin package එකේ

import com.example.campus_nexus_backend.auth.User;           // <-- 2. User ඉන්නේ auth එකේ නිසා එයාව Import කරගන්නවා
import com.example.campus_nexus_backend.auth.UserRepository; // <-- 3. UserRepository ඉන්නෙත් auth එකේ නිසා එයාවත් Import කරගන්නවා

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    // 1. READ: System එකේ ඉන්න ඔක්කොම Users ලව බලන්න (GET)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 2. CREATE: අලුත් User කෙනෙක්ව එකතු කරන්න (POST)
    @PostMapping
    public ResponseEntity<?> addUser(@RequestBody User newUser) {
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("{\"message\": \"Error: Email already exists!\"}");
        }
        userRepository.save(newUser);
        return ResponseEntity.ok("{\"message\": \"User added successfully!\"}");
    }

    // 3. UPDATE: User ගේ විස්තර වෙනස් කරන්න (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updateData) {
        Optional<User> existingUser = userRepository.findById(id);
        
        if (existingUser.isEmpty()) {
            return ResponseEntity.status(404).body("{\"message\": \"User not found!\"}");
        }

        User user = existingUser.get();
        user.setRole(updateData.getRole()); 
        user.setDepartment(updateData.getDepartment());
        user.setStudentOrEmpId(updateData.getStudentOrEmpId());
        
        userRepository.save(user);
        return ResponseEntity.ok("{\"message\": \"User updated successfully!\"}");
    }

    // 4. DELETE: User කෙනෙක්ව System එකෙන් අයින් කරන්න (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body("{\"message\": \"User not found!\"}");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("{\"message\": \"User deleted successfully!\"}");
    }
}