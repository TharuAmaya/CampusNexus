package com.example.campus_nexus_backend.auth;

import jakarta.persistence.*;
import lombok.Data; // Lombok ගෙනාවා
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data // <-- මේකෙන් Getters, Setters, Constructors ඔක්කොම Auto හැදෙනවා!
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(nullable = false)
    private String role; 

    private String provider;

    @Column(name = "provider_id", unique = true)
    private String providerId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }


    // --- Profile සඳහා අලුතින් එකතු කළ කොටස ---
    
    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "student_or_emp_id")
    private String studentOrEmpId;

    @Column(name = "department")
    private String department;

    @Column(columnDefinition = "TEXT") // Bio එක ටිකක් දිග වෙන්න පුළුවන් නිසා TEXT දැම්මා
    private String bio;

    
    
    // මීට පස්සේ මෙතනින් පල්ලෙහාට මුකුත් ලියන්න ඕනේ නෑ! සුපිරි නේද?
}