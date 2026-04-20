package com.primiq.backend.service;

import com.primiq.backend.model.dao.ProjectType;
import com.primiq.backend.model.dao.bubbleMap.BubbleMap;
import com.primiq.backend.model.dao.bubbleMap.BubbleMapProject;
import com.primiq.backend.model.dto.BubbleMapProjectCreationRequest;
import org.springframework.stereotype.Component;

/**
 * BubbleMapProjectCreator ist verantwortlich für das Mapping von
 * {@link BubbleMapProjectCreationRequest} DTOs zu {@link BubbleMapProject} Entities.
 *
 * Dieser Creator konkretisiert das generische {@link ProjectCreator}-Interface
 * für den BubbleMap-Projekt-Typ.
 */
@Component
public class BubbleMapProjectCreator implements ProjectCreator<BubbleMapProjectCreationRequest, BubbleMapProject> {

  @Override
  public BubbleMapProject create(BubbleMapProjectCreationRequest request) {
    BubbleMapProject project = new BubbleMapProject();
    project.setType(ProjectType.BUBBLE_MAP);
    project.setMetadata(request.getMetadata());
    return project;
  }
}


