package com.primiq.backend.model.dto;

import com.primiq.backend.model.dao.skillMap.SkillMap;
import com.primiq.backend.model.dao.skillMap.SkillMapProjectMetadata;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SkillMapProjectCreationRequest extends CreationRequest<SkillMap> {

  private SkillMapProjectMetadata metadata;
}

