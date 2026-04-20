package com.primiq.backend.model.dao.bubbleMap;

import com.primiq.backend.model.dao.Metadata;
import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Embeddable
public class BubbleMapProjectMetadata extends Metadata<BubbleMap> {

  private Integer categories;
  private Integer datasets;

}
