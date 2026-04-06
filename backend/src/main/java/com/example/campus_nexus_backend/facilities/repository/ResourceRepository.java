package com.example.campus_nexus_backend.facilities.repository;

import com.example.campus_nexus_backend.facilities.model.ResourcesModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<ResourcesModel, Long> {
}
