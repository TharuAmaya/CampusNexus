package com.example.campus_nexus_backend.maintenance_and_ticketing.repository;

import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Fetches all tickets created by a specific student using their email
    List<Ticket> findByCreatedBy_EmailOrderByCreatedAtDesc(String email);
}