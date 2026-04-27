package com.example.campus_nexus_backend.auth;

import jakarta.persistence.*;
import lombok.Data; 
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data // create all gettes/setters/constructors with Lombok
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


    // --- for profile part ---
    
    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "student_or_emp_id")
    private String studentOrEmpId;

    @Column(name = "department")
    private String department;

    @Column(columnDefinition = "TEXT") // add TEXT for bio because it can be long
    private String bio;

    
    
    
}