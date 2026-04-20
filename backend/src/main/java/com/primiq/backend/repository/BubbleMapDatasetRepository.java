package com.primiq.backend.repository;

import com.primiq.backend.model.dao.bubbleMap.BubbleMapDataset;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BubbleMapDatasetRepository extends JpaRepository<BubbleMapDataset, UUID> {

  List<BubbleMapDataset> findByProjectId(UUID projectId);
}

