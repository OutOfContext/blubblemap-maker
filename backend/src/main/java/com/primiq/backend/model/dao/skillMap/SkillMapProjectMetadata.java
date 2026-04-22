package com.primiq.backend.model.dao.skillMap;

import com.primiq.backend.model.dao.Metadata;
import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Embeddable
public class SkillMapProjectMetadata extends Metadata<SkillMap> {
  // Inherits: title, description, author from Metadata
}

