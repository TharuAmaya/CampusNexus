package com.example.campus_nexus_backend.facilities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResourceDropdownDTO {
    private Long resourceId;
    private String name;
    private String type;
}
