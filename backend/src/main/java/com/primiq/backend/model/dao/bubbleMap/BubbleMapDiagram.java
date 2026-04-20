package com.primiq.backend.model.dao.bubbleMap;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import com.primiq.backend.model.dao.Diagram;

@Data
@Entity
@Table(name = "bubble_map_diagrams")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BubbleMapDiagram extends Diagram<BubbleMap> {

  private String name;
  private String description;
  private Double radius;

  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private BubbleMapProject project;
}


