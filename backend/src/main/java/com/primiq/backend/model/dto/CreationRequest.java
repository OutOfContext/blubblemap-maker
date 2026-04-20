package com.primiq.backend.model.dto;

import com.primiq.backend.model.dao.ProjectType;
import lombok.Data;

@Data
public abstract class CreationRequest<T> {

  private ProjectType type;


}
