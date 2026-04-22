package com.primiq.backend.model.dao.skillMap;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * SkillMapPerson repräsentiert eine Person deren Skills aus einem CV oder
 * einem externen Profil (LinkedIn, Fiverr etc.) extrahiert wurden.
 */
@Data
@Entity
@Table(name = "skill_map_persons")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillMapPerson {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private SkillMapProject project;

  @Column(nullable = false)
  private String name;

  @Column(name = "source_url")
  private String sourceUrl;

  @Column(name = "source_type")
  private String sourceType; // CV, LINKEDIN, FIVERR, MANUAL

  @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<SkillMapDataset> skills = new ArrayList<>();

  public void addSkill(SkillMapDataset skill) {
    skill.setPerson(this);
    this.skills.add(skill);
  }
}

