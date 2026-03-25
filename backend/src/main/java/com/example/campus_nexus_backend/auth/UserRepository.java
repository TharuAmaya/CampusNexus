package com.example.campus_nexus_backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Email එක දීලා Database එකෙන් User ව හොයාගන්න function එක
    Optional<User> findByEmail(String email);

    // මෙන්න මේ පේළිය අලුතින් එකතු කරන්න! (Role එක අනුව ගාණ හොයනවා)
    long countByRole(String role);

}