package com.example.campus_nexus_backend.maintenance_and_ticketing.dto.attachment;

import lombok.Data;

@Data
public class AttachmentDTO {
    private Long attachmentId;
    private String fileName;
    private String filePath;
}