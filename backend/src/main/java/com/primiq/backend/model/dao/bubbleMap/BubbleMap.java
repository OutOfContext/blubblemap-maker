package com.primiq.backend.model.dao.bubbleMap;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * BubbleMap ist ein reines Daten-Modell für die Visualisierung.
 * Es enthält die aufbereiteten Daten (Bubbles mit Werten, Kategorien, etc.)
 * die im Frontend gerendert werden.
 *
 * Hinweis: Dies ist NICHT die JPA-Entity. Siehe BubbleMapProject für Persistierung.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BubbleMap {

  private String title;
  private List<BubbleBubble> bubbles;
  private List<String> categories;
  private Integer datasetCount;

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class BubbleBubble {
    private String id;
    private String label;
    private Double value;
    private String category;
    private Double radius;
    private String color;
  }

}
