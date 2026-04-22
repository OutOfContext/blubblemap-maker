package com.primiq.backend.model.dao.skillMap;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SkillMap ist das Visualisierungs-Datenmodell für SkillMap-Projekte.
 * Nicht persistiert – wird zur Laufzeit aus SkillMapDataset-Einträgen berechnet.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillMap {

  private String title;
  private List<SkillBubble> bubbles;
  private List<String> categories;
  private Integer personCount;
  private Integer skillCount;

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SkillBubble {
    private String id;
    private String label;
    private Double value;          // proficiencyLevel (single) or personCount (aggregated)
    private String category;
    private String subcategory;
    private Double radius;
    private String color;
    private Double clusterAngle;   // 0–360, von KI vergeben
    private List<String> personNames; // gefüllt bei aggregierter Ansicht
  }
}

