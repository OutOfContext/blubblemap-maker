package com.primiq.backend.model.dao.bubbleMap;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * BubbleMapDataset speichert die Rohdaten für ein BubbleMap-Projekt.
 *
 * Die Rohdaten können vom Backend aufbereitet werden zu {@link BubbleMap}-Visualisierungs-Objekten,
 * die im Frontend gerendert werden.
 */
@Data
@Entity
@Table(name = "bubble_map_datasets")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BubbleMapDataset {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private BubbleMapProject project;

  @Column(nullable = false)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "JSONB")
  private String rawData; // JSON-formatierte Rohdaten

  @Column(nullable = false)
  private String category;

  private Double value;

  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();

  private LocalDateTime updatedAt;
}

