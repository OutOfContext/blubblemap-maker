package com.primiq.backend.service;

import com.primiq.backend.model.dao.bubbleMap.BubbleMapProject;
import com.primiq.backend.model.dto.BubbleMapProjectCreationRequest;
import com.primiq.backend.repository.BubbleMapProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * BubbleMapProjectService orchestriert den Use-Case zur Erstellung und Verwaltung von BubbleMap-Projekten.
 *
 * Service konkretisiert das generische {@link ProjectService}-Interface für BubbleMap-Projekte.
 */
@Service
@RequiredArgsConstructor
public class BubbleMapProjectService implements ProjectService<BubbleMapProjectCreationRequest, BubbleMapProject> {

  private final BubbleMapProjectCreator bubbleMapProjectCreator;
  private final BubbleMapProjectRepository repository;

  @Override
  public ProjectCreator<BubbleMapProjectCreationRequest, BubbleMapProject> projectCreator() {
    return bubbleMapProjectCreator;
  }

  @Override
  public BubbleMapProject saveProject(BubbleMapProject project) {
    return repository.save(project);
  }
}
