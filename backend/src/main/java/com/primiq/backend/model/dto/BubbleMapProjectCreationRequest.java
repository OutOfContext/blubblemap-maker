package com.primiq.backend.model.dto;

import com.primiq.backend.model.dao.bubbleMap.BubbleMap;
import com.primiq.backend.model.dao.bubbleMap.BubbleMapProjectMetadata;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class BubbleMapProjectCreationRequest extends CreationRequest<BubbleMap> {

  private BubbleMapProjectMetadata metadata;

}
