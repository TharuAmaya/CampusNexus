package com.example.campus_nexus_backend.facilities.controller;

import com.example.campus_nexus_backend.facilities.dto.AvailabilityBlockResponse;
import com.example.campus_nexus_backend.facilities.dto.CreateAvailabilityBlockRequest;
import com.example.campus_nexus_backend.facilities.exception.BadRequestException;
import com.example.campus_nexus_backend.facilities.exception.ResourceNotFoundException;
import com.example.campus_nexus_backend.facilities.model.ResourceAvailabilityBlock;
import com.example.campus_nexus_backend.facilities.model.ResourcesModel;
import com.example.campus_nexus_backend.facilities.repository.ResourceAvailabilityBlockRepository;
import com.example.campus_nexus_backend.facilities.repository.ResourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/resources/{resourceId}/availability-blocks")
public class ResourceAvailabilityController {

    private final ResourceRepository resourceRepository;
    private final ResourceAvailabilityBlockRepository blockRepository;

    public ResourceAvailabilityController(ResourceRepository resourceRepository, ResourceAvailabilityBlockRepository blockRepository) {
        this.resourceRepository = resourceRepository;
        this.blockRepository = blockRepository;
    }

    @GetMapping
    public ResponseEntity<List<AvailabilityBlockResponse>> getBlocks(
            @PathVariable Long resourceId,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to
    ) {
        ensureResourceExists(resourceId);

        List<ResourceAvailabilityBlock> blocks;
        if (from != null && to != null) {
            if (!from.isBefore(to)) {
                throw new BadRequestException("Invalid range: 'from' must be before 'to'.");
            }
            blocks = blockRepository.findByResourceResourceIdAndEndAtGreaterThanEqualAndStartAtLessThanEqualOrderByStartAtAsc(resourceId, from, to);
        } else if (from == null && to == null) {
            blocks = blockRepository.findByResourceResourceIdOrderByStartAtAsc(resourceId);
        } else {
            throw new BadRequestException("Both 'from' and 'to' must be provided together.");
        }

        List<AvailabilityBlockResponse> response = blocks.stream()
                .map(AvailabilityBlockResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AvailabilityBlockResponse> createBlock(
            @PathVariable Long resourceId,
            @RequestBody CreateAvailabilityBlockRequest request
    ) {
        ResourcesModel resource = ensureResourceExists(resourceId);
        validateCreateOrUpdateRequest(request);
        ensureNoOverlap(resourceId, null, request.getStartAt(), request.getEndAt());

        ResourceAvailabilityBlock block = new ResourceAvailabilityBlock();
        block.setResource(resource);
        block.setStartAt(request.getStartAt());
        block.setEndAt(request.getEndAt());
        block.setType(request.getType());
        block.setNote(request.getNote() == null ? null : request.getNote().trim());

        ResourceAvailabilityBlock saved = blockRepository.save(block);
        return ResponseEntity.status(HttpStatus.CREATED).body(AvailabilityBlockResponse.fromEntity(saved));
    }

    @PutMapping("/{blockId}")
    public ResponseEntity<AvailabilityBlockResponse> updateBlock(
            @PathVariable Long resourceId,
            @PathVariable Long blockId,
            @RequestBody CreateAvailabilityBlockRequest request
    ) {
        ensureResourceExists(resourceId);
        validateCreateOrUpdateRequest(request);

        ResourceAvailabilityBlock existing = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Availability block not found for id " + blockId));

        if (!existing.getResource().getResourceId().equals(resourceId)) {
            throw new BadRequestException("Block does not belong to the given resource.");
        }

        ensureNoOverlap(resourceId, blockId, request.getStartAt(), request.getEndAt());

        existing.setStartAt(request.getStartAt());
        existing.setEndAt(request.getEndAt());
        existing.setType(request.getType());
        existing.setNote(request.getNote() == null ? null : request.getNote().trim());

        ResourceAvailabilityBlock saved = blockRepository.save(existing);
        return ResponseEntity.ok(AvailabilityBlockResponse.fromEntity(saved));
    }

    @DeleteMapping("/{blockId}")
    public ResponseEntity<Void> deleteBlock(@PathVariable Long resourceId, @PathVariable Long blockId) {
        ensureResourceExists(resourceId);

        ResourceAvailabilityBlock block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("Availability block not found for id " + blockId));

        if (!block.getResource().getResourceId().equals(resourceId)) {
            throw new BadRequestException("Block does not belong to the given resource.");
        }

        blockRepository.delete(block);
        return ResponseEntity.noContent().build();
    }

    private ResourcesModel ensureResourceExists(Long resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found for id " + resourceId));
    }

    private void validateCreateOrUpdateRequest(CreateAvailabilityBlockRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }
        if (request.getType() == null) {
            throw new BadRequestException("Block type is required.");
        }
        if (request.getStartAt() == null || request.getEndAt() == null) {
            throw new BadRequestException("startAt and endAt are required.");
        }
        if (!request.getStartAt().isBefore(request.getEndAt())) {
            throw new BadRequestException("Invalid block: startAt must be before endAt.");
        }

        LocalDateTime nowMinusGrace = LocalDateTime.now().minusMinutes(1);
        if (request.getEndAt().isBefore(nowMinusGrace)) {
            throw new BadRequestException("Block endAt cannot be in the past.");
        }

        if (request.getNote() != null && request.getNote().length() > 500) {
            throw new BadRequestException("Note must be 500 characters or less.");
        }
    }

    private void ensureNoOverlap(Long resourceId, Long excludedBlockId, LocalDateTime startAt, LocalDateTime endAt) {
        List<ResourceAvailabilityBlock> overlaps;

        if (excludedBlockId == null) {
            overlaps = blockRepository.findByResourceResourceIdAndEndAtGreaterThanEqualAndStartAtLessThanEqualOrderByStartAtAsc(
                    resourceId,
                    startAt,
                    endAt
            );
        } else {
            overlaps = blockRepository.findByResourceResourceIdAndIdNotAndEndAtGreaterThanEqualAndStartAtLessThanEqualOrderByStartAtAsc(
                    resourceId,
                    excludedBlockId,
                    startAt,
                    endAt
            );
        }

        if (!overlaps.isEmpty()) {
            throw new BadRequestException("Availability block overlaps with an existing block.");
        }
    }
}
