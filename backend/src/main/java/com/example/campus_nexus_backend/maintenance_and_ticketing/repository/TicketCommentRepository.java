package com.example.campus_nexus_backend.maintenance_and_ticketing.repository;

import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    // Fetches all comments for a specific ticket, ordered by oldest to newest
    List<TicketComment> findByTicket_TicketIdOrderByCreatedAtAsc(Long ticketId);
}