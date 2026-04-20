package com.primiq.backend.service;

import com.primiq.backend.model.dao.Project;
import com.primiq.backend.model.dto.CreationRequest;

public interface ProjectService<R extends CreationRequest<?>, P extends Project<?>> {

  ProjectCreator<R, P> projectCreator();

  P saveProject(P project);

  default P createAndSaveProject(R request) {
    P project = projectCreator().create(request);
    return saveProject(project);
  }
}
