package com.example.campus_nexus_backend.facilities.repository;

import com.example.campus_nexus_backend.facilities.model.ResourceAvailabilityBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ResourceAvailabilityBlockRepository extends JpaRepository<ResourceAvailabilityBlock, Long> {

    List<ResourceAvailabilityBlock> findByResourceResourceIdOrderByStartAtAsc(Long resourceId);

    List<ResourceAvailabilityBlock> findByResourceResourceIdAndEndAtGreaterThanEqualAndStartAtLessThanEqualOrderByStartAtAsc(
            Long resourceId,
            LocalDateTime from,
            LocalDateTime to
    );

        List<ResourceAvailabilityBlock> findByResourceResourceIdAndIdNotAndEndAtGreaterThanEqualAndStartAtLessThanEqualOrderByStartAtAsc(
            Long resourceId,
            Long excludedBlockId,
            LocalDateTime from,
            LocalDateTime to
        );
}
