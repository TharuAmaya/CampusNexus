package com.example.campus_nexus_backend.facilities.repository;

import com.example.campus_nexus_backend.facilities.model.ResourcesModel;
import com.example.campus_nexus_backend.facilities.model.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<ResourcesModel, Long> {
    
    @Query("SELECT DISTINCT r.type FROM ResourcesModel r ORDER BY r.type")
    List<ResourceType> findDistinctTypes();
    
    @Query("SELECT r.name FROM ResourcesModel r WHERE r.type = :type ORDER BY r.name")
    List<String> findNamesByType(@Param("type") ResourceType type);
}
