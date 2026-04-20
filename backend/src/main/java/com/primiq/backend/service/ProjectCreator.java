package com.primiq.backend.service;

import com.primiq.backend.model.dao.Project;
import com.primiq.backend.model.dto.CreationRequest;

public interface ProjectCreator<R extends CreationRequest<?>, P extends Project<?>> {

  P create(R request);
}
