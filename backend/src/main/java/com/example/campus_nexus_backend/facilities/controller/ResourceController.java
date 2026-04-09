package com.example.campus_nexus_backend.facilities.controller;

import com.example.campus_nexus_backend.facilities.model.ResourcesModel;
import com.example.campus_nexus_backend.facilities.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

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

        try{
            File uploadDir = new File(folder);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            file.transferTo(Paths.get(folder+resourceImg));
            }catch (IOException e) {
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
}
