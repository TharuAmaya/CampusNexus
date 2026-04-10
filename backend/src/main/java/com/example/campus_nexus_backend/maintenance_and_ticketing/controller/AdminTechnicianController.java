package com.example.campus_nexus_backend.maintenance_and_ticketing.controller;

import com.example.campus_nexus_backend.maintenance_and_ticketing.dto.ticket.TechnicianListItemDTO;
import com.example.campus_nexus_backend.maintenance_and_ticketing.service.AdminTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminTechnicianController {

    @Autowired
    private AdminTicketService adminTicketService;

    @GetMapping("/technicians")
    public ResponseEntity<List<TechnicianListItemDTO>> getAllTechnicians() {
        return ResponseEntity.ok(adminTicketService.getAllTechnicians());
    }
}