package com.primiq.backend.service;

import com.primiq.backend.model.dao.ProjectType;
import com.primiq.backend.model.dao.skillMap.SkillMapProject;
import com.primiq.backend.model.dto.SkillMapProjectCreationRequest;
import org.springframework.stereotype.Component;

@Component
public class SkillMapProjectCreator implements ProjectCreator<SkillMapProjectCreationRequest, SkillMapProject> {

  @Override
  public SkillMapProject create(SkillMapProjectCreationRequest request) {
    SkillMapProject project = new SkillMapProject();
    project.setType(ProjectType.SKILL_MAP);
    project.setMetadata(request.getMetadata());
    return project;
  }
}

