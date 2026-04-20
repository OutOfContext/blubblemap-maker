package com.primiq.backend.repository;

import com.primiq.backend.model.dao.bubbleMap.BubbleMapProject;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BubbleMapProjectRepository extends JpaRepository<BubbleMapProject, UUID> {
}

