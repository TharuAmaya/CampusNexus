package com.example.campus_nexus_backend.facilities.controller;

import com.example.campus_nexus_backend.facilities.model.ResourcesModel;
import com.example.campus_nexus_backend.facilities.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
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
    public String resourceImg(@RequestParam("file") MultipartFile file) {
        String folder = "src/main/uploads/";
        String resourceImg = file.getOriginalFilename();

        try {
            File uploadDir = new File(folder);
            if (!uploadDir.exists()) {
                uploadDir.mkdir();
            }
            file.transferTo(Paths.get(folder + resourceImg));
        } catch (IOException e) {
            e.printStackTrace();
            return "Error uploading file; " + resourceImg;
        }
        return resourceImg;
    }
}
