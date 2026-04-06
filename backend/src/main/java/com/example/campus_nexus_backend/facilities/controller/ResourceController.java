package com.example.campus_nexus_backend.facilities.controller;

import com.example.campus_nexus_backend.facilities.dto.ResourceDropdownDTO;
import com.example.campus_nexus_backend.facilities.model.ResourcesModel;
import com.example.campus_nexus_backend.facilities.model.enums.ResourceType;
import com.example.campus_nexus_backend.facilities.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
public class ResourceController {
    @Autowired
    private ResourceRepository resourceRepository;

    @PostMapping("/resources")
    public ResourcesModel newResourceModel(@RequestBody ResourcesModel newResourceModel) {
        return resourceRepository.save(newResourceModel);
    }

    @PostMapping("/resources/resourceImg")
    public String resourceImg(@RequestParam("file") MultipartFile file) {
        String folder = "src/main/uploads/";
        String resourceImg = file.getOriginalFilename();

        try{
            File uploadDir = new File(folder);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }
            file.transferTo(Paths.get(folder+resourceImg));
            }catch (IOException e) {
            e.printStackTrace();
            return "Error uploading file; " + resourceImg;
        }
        return resourceImg;
    }

    @GetMapping("/api/resources/types")
    public ResponseEntity<List<String>> getResourceTypes() {
        List<ResourceType> types = resourceRepository.findDistinctTypes();
        List<String> typeStrings = types.stream()
                .map(ResourceType::toString)
                .collect(Collectors.toList());
        return ResponseEntity.ok(typeStrings);
    }

    @GetMapping("/api/resources/names")
    public ResponseEntity<List<ResourceDropdownDTO>> getResourceNamesByType(@RequestParam String type) {
        try {
            List<ResourcesModel> resources = resourceRepository.findAll();
            ResourceType resourceType = ResourceType.valueOf(type.toUpperCase());
            resources = resources.stream()
                    .filter(resource -> resource.getType() == resourceType)
                    .toList();

            List<ResourceDropdownDTO> dropdownItems = resources.stream()
                    .sorted(Comparator.comparing(ResourcesModel::getName, String.CASE_INSENSITIVE_ORDER))
                    .map(resource -> new ResourceDropdownDTO(
                            resource.getResourceId(),
                            resource.getName(),
                            resource.getType() != null ? resource.getType().name() : null
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dropdownItems);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/api/resources/{id}")
    public ResponseEntity<ResourceDropdownDTO> getResourceById(@PathVariable Long id) {
        return resourceRepository.findById(id)
                .map(resource -> ResponseEntity.ok(new ResourceDropdownDTO(
                        resource.getResourceId(),
                        resource.getName(),
                        resource.getType() != null ? resource.getType().name() : null
                )))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
