package com.primiq.backend.model.dao.skillMap;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * SkillMapDataset speichert einen einzelnen extrahierten Skill einer Person.
 * clusterAngle wird von der KI vergeben und steuert die initiale Position in der BubbleMap.
 */
@Data
@Entity
@Table(name = "skill_map_datasets")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillMapDataset {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "person_id", nullable = false)
  private SkillMapPerson person;

  @Column(nullable = false)
  private String name; // z.B. "MySQL"

  @Column(nullable = false)
  private String category; // z.B. "Databases"

  @Column
  private String subcategory; // z.B. "SQL" or "NoSQL"

  @Column(name = "proficiency_level")
  private Integer proficiencyLevel; // 0–100

  @Column(name = "cluster_angle")
  private Double clusterAngle; // 0–360, von KI vergeben für Positionierung
}

