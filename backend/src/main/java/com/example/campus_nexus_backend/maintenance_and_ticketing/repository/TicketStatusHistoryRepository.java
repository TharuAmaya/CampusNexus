package com.example.campus_nexus_backend.maintenance_and_ticketing.repository;

import com.example.campus_nexus_backend.maintenance_and_ticketing.model.entity.TicketStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketStatusHistoryRepository extends JpaRepository<TicketStatusHistory, Long> {
    List<TicketStatusHistory> findByTicket_TicketIdOrderByChangedAtAsc(Long ticketId);
}
