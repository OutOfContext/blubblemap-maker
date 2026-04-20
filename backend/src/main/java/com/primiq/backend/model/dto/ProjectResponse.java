package com.primiq.backend.model.dto;

import com.primiq.backend.model.dao.ProjectType;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

  private UUID id;
  private ProjectType type;
  private String title;
  private String description;
  private String author;
  private String message;
}

