package com.example.campus_nexus_backend.facilities.controller;

import com.example.campus_nexus_backend.facilities.exception.ResourceNotFoundException;
import com.example.campus_nexus_backend.facilities.model.ResourcesModel;
import com.example.campus_nexus_backend.facilities.repository.ResourceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

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
    public ResponseEntity<String> resourceImg(@RequestParam("file") MultipartFile file) {
        Path uploadDirPath = resolveUploadDirectory();
        String folder = uploadDirPath.toString() + File.separator;
        String resourceImg = file.getOriginalFilename();

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
    public List<ResourcesModel> getAllResources() {
    return resourceRepository.findAll();
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

        ObjectMapper mapper = new ObjectMapper();
        ResourcesModel newResource;

        try {
            newResource = mapper.readValue(resourceDetails, ResourcesModel.class);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing resourceDetails", e);
        }

        return resourceRepository.findById(id).map(existingResource -> {

            existingResource.setName(newResource.getName());
            existingResource.setType(newResource.getType());
            existingResource.setCapacity(newResource.getCapacity());
            existingResource.setLocation(newResource.getLocation());
            existingResource.setStatus(newResource.getStatus());

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
}
