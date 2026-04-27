package com.example.campus_nexus_backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // find the user by emil in DB
    Optional<User> findByEmail(String email);

    // count by role
    long countByRole(String role);

    // take only technician in Assign workflow 
    List<User> findByRole(String role);

}