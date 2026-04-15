package com.example.campus_nexus_backend.facilities.controller;

import com.example.campus_nexus_backend.facilities.dto.ResourceDropdownDTO;
import com.example.campus_nexus_backend.facilities.exception.BadRequestException;
import com.example.campus_nexus_backend.facilities.exception.ResourceNotFoundException;
import com.example.campus_nexus_backend.facilities.model.ResourcesModel;
import com.example.campus_nexus_backend.facilities.model.enums.ResourceType;
import com.example.campus_nexus_backend.facilities.model.enums.Status;
import com.example.campus_nexus_backend.facilities.repository.ResourceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
public class ResourceController {
    @Autowired
    private ResourceRepository resourceRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder()
            .addModule(new JavaTimeModule())
            .build();

    @PostMapping("/resources")
    public ResourcesModel newResourceModel(@RequestBody ResourcesModel newResourceModel) {
        validateResourceMetadata(newResourceModel);
        return resourceRepository.save(newResourceModel);
    }

    @PostMapping("/resources/resourceImg")
    public ResponseEntity<String> resourceImg(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is required.");
        }

        Path uploadDirPath = resolveUploadDirectory();
        String folder = uploadDirPath.toString() + File.separator;
        String originalFilename = file.getOriginalFilename();
        String original = StringUtils.cleanPath(originalFilename == null ? "resource_upload" : originalFilename);
        String resourceImg = System.currentTimeMillis() + "_" + original.replace(" ", "_");

        try {
            File uploadDir = new File(folder);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            file.transferTo(Paths.get(folder + resourceImg));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file; " + resourceImg);
        }
        return ResponseEntity.ok(resourceImg);
    }

    private Path resolveUploadDirectory() {
        Path backendRelative = Paths.get("backend", "src", "main", "uploads");
        if (backendRelative.toFile().exists() || Paths.get("backend", "src", "main").toFile().exists()) {
            return backendRelative;
        }

        return Paths.get("src", "main", "uploads");
    }

    @GetMapping("/resources")
    public List<ResourcesModel> getAllResources(
            @RequestParam(value = "type", required = false) ResourceType type,
            @RequestParam(value = "status", required = false) Status status,
            @RequestParam(value = "minCapacity", required = false) Integer minCapacity,
            @RequestParam(value = "maxCapacity", required = false) Integer maxCapacity,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "keyword", required = false) String keyword) {

        String normalizedLocation = location == null ? "" : location.toLowerCase(Locale.ROOT);
        String normalizedKeyword = keyword == null ? "" : keyword.toLowerCase(Locale.ROOT);

        return resourceRepository.findAll().stream()
            .filter(r -> type == null || r.getType() == type)
            .filter(r -> status == null || r.getStatus() == status)
            .filter(r -> minCapacity == null || r.getCapacity() >= minCapacity)
            .filter(r -> maxCapacity == null || r.getCapacity() <= maxCapacity)
            .filter(r -> normalizedLocation.isBlank() || (r.getLocation() != null && r.getLocation().toLowerCase(Locale.ROOT).contains(normalizedLocation)))
            .filter(r -> normalizedKeyword.isBlank() ||
                String.valueOf(r.getResourceId()).contains(normalizedKeyword) ||
                (r.getName() != null && r.getName().toLowerCase(Locale.ROOT).contains(normalizedKeyword)) ||
                (r.getType() != null && r.getType().name().toLowerCase(Locale.ROOT).contains(normalizedKeyword)) ||
                (r.getLocation() != null && r.getLocation().toLowerCase(Locale.ROOT).contains(normalizedKeyword)))
            .collect(Collectors.toList());
    }

    @GetMapping("/resources/{id}")
    public ResourcesModel getResourceById(@PathVariable("id") Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<FileSystemResource> getImage(@PathVariable("filename") String filename) {

        Path uploadDirPath = resolveUploadDirectory();
        Path filePath = uploadDirPath.resolve(filename);
        File file = filePath.toFile();

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String probeType = Files.probeContentType(filePath);
            if (probeType != null) {
                mediaType = MediaType.parseMediaType(probeType);
            }
        } catch (IOException ignored) {
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(new FileSystemResource(file));
    }

    @PutMapping("/resources/{id}")
    public ResourcesModel updateResource(
            @RequestPart("resourceDetails") String resourceDetails,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @PathVariable("id") Long id) {
        ResourcesModel newResource;

        try {
            newResource = objectMapper.readValue(resourceDetails, ResourcesModel.class);
        } catch (Exception e) {
            throw new BadRequestException("Error parsing resourceDetails");
        }

        return resourceRepository.findById(id).map(existingResource -> {

            existingResource.setName(newResource.getName());
            existingResource.setType(newResource.getType());
            existingResource.setCapacity(newResource.getCapacity());
            existingResource.setLocation(newResource.getLocation());
            existingResource.setAvailableFrom(newResource.getAvailableFrom());
            existingResource.setAvailableTo(newResource.getAvailableTo());
            existingResource.setStatus(newResource.getStatus());
            validateResourceMetadata(existingResource);

            if (file != null && !file.isEmpty()) {
                Path uploadDirPath = resolveUploadDirectory();
                String fileName = file.getOriginalFilename();

                try {
                    File uploadDir = uploadDirPath.toFile();
                    if (!uploadDir.exists()) {
                        uploadDir.mkdirs();
                    }

                    file.transferTo(uploadDirPath.resolve(fileName));
                    existingResource.setImageName(fileName);
                } catch (IOException e) {
                    throw new RuntimeException("Error saving uploaded file", e);
                }
            }

            return resourceRepository.save(existingResource);

        }).orElseThrow(() -> new ResourceNotFoundException(id));
    }

    @DeleteMapping("/resources/{id}")
    public String deleteResource(@PathVariable Long id) {

        // Check if resource exists
        ResourcesModel resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        // Get image name
        String imageName = resource.getImageName();

        // Delete image from folder
        if (imageName != null && !imageName.isEmpty()) {
            Path uploadDirPath = resolveUploadDirectory();
            File imageFile = uploadDirPath.resolve(imageName).toFile();

            if (imageFile.exists()) {
                if (imageFile.delete()) {
                    System.out.println("Image Deleted");
                } else {
                    System.out.println("Failed to delete image");
                }
            }
        }

        // Delete resource from DB
        resourceRepository.deleteById(id);

        return "Resource with id " + id + " deleted successfully";
    }

    private void validateAvailabilityWindow(LocalTime availableFrom, LocalTime availableTo) {
        if (availableFrom == null || availableTo == null) {
            throw new BadRequestException("Availability window is required (availableFrom and availableTo).");
        }

        if (!availableFrom.isBefore(availableTo)) {
            throw new BadRequestException("Invalid availability window: availableFrom must be before availableTo.");
        }
    }

    private void validateResourceMetadata(ResourcesModel resource) {
        if (resource.getName() == null || resource.getName().trim().isEmpty()) {
            throw new BadRequestException("Name is required.");
        }

        if (resource.getType() == null) {
            throw new BadRequestException("Type is required.");
        }

        if (resource.getStatus() == null) {
            throw new BadRequestException("Status is required.");
        }

        if (resource.getCapacity() < 0) {
            throw new BadRequestException("Capacity/quantity cannot be negative.");
        }

        validateAvailabilityWindow(resource.getAvailableFrom(), resource.getAvailableTo());

        if (resource.getType() == ResourceType.EQUIPMENT) {
            if (resource.getLocation() == null || resource.getLocation().trim().isEmpty()) {
                resource.setLocation("N/A");
            }
            return;
        }

        if (resource.getLocation() == null || resource.getLocation().trim().isEmpty()) {
            throw new BadRequestException("Location is required for this resource type.");
        }
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
    public ResponseEntity<ResourceDropdownDTO> getResourceDropdownById(@PathVariable Long id) {
        return resourceRepository.findById(id)
                .map(resource -> ResponseEntity.ok(new ResourceDropdownDTO(
                        resource.getResourceId(),
                        resource.getName(),
                        resource.getType() != null ? resource.getType().name() : null
                )))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
