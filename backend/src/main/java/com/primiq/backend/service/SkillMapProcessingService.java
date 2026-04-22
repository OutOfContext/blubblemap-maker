package com.primiq.backend.service;

import com.primiq.backend.model.dao.skillMap.SkillMap;
import com.primiq.backend.model.dao.skillMap.SkillMap.SkillBubble;
import com.primiq.backend.model.dao.skillMap.SkillMapDataset;
import com.primiq.backend.model.dao.skillMap.SkillMapPerson;
import com.primiq.backend.model.dao.skillMap.SkillMapProject;
import com.primiq.backend.repository.SkillMapPersonRepository;
import com.primiq.backend.repository.SkillMapProjectRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SkillMapProcessingService {

  private final SkillMapProjectRepository projectRepository;
  private final SkillMapPersonRepository personRepository;

  // Palette für Kategorien
  private static final String[] CATEGORY_COLORS = {
      "#6366f1", "#f59e0b", "#10b981", "#ef4444",
      "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
      "#f97316", "#84cc16"
  };

  /**
   * Einzelansicht: Skills einer Person als BubbleMap.
   * Radius = proficiencyLevel, Farbe = Kategorie, Position = clusterAngle.
   */
  @Transactional(readOnly = true)
  public SkillMap processPersonSkills(UUID projectId, UUID personId) {
    SkillMapProject project = projectRepository.findById(projectId)
        .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
    SkillMapPerson person = personRepository.findById(personId)
        .orElseThrow(() -> new IllegalArgumentException("Person not found: " + personId));

    List<String> categories = person.getSkills().stream()
        .map(SkillMapDataset::getCategory)
        .distinct()
        .sorted()
        .toList();

    Map<String, String> categoryColorMap = buildColorMap(categories);

    List<SkillBubble> bubbles = person.getSkills().stream()
        .map(skill -> SkillBubble.builder()
            .id(skill.getId().toString())
            .label(skill.getName())
            .value((double) (skill.getProficiencyLevel() != null ? skill.getProficiencyLevel() : 50))
            .category(skill.getCategory())
            .subcategory(skill.getSubcategory())
            .radius(calcRadius(skill.getProficiencyLevel() != null ? skill.getProficiencyLevel() : 50))
            .color(categoryColorMap.getOrDefault(skill.getCategory(), "#6366f1"))
            .clusterAngle(skill.getClusterAngle())
            .personNames(null)
            .build())
        .toList();

    return SkillMap.builder()
        .title(person.getName() + " – Skills")
        .bubbles(bubbles)
        .categories(categories)
        .personCount(1)
        .skillCount(bubbles.size())
        .build();
  }

  /**
   * Aggregierte Ansicht: Alle Skills aller Personen.
   * Radius = Anzahl Personen mit diesem Skill, personNames = Liste der Namen.
   */
  @Transactional(readOnly = true)
  public SkillMap processAggregatedSkills(UUID projectId) {
    SkillMapProject project = projectRepository.findById(projectId)
        .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

    List<SkillMapPerson> persons = personRepository.findAllByProjectId(projectId);

    // Aggregieren: Skill-Name → {category, subcategory, angle, persons, totalProficiency}
    Map<String, AggEntry> aggregated = new HashMap<>();

    for (SkillMapPerson person : persons) {
      for (SkillMapDataset skill : person.getSkills()) {
        String key = skill.getName().toLowerCase();
        aggregated.computeIfAbsent(key, k -> new AggEntry(skill)).addPerson(
            person.getName(), skill.getProficiencyLevel());
      }
    }

    List<String> categories = aggregated.values().stream()
        .map(e -> e.category)
        .distinct()
        .sorted()
        .toList();

    Map<String, String> colorMap = buildColorMap(categories);

    List<SkillBubble> bubbles = aggregated.values().stream()
        .map(e -> SkillBubble.builder()
            .id(e.name)
            .label(e.name)
            .value((double) e.personNames.size())
            .category(e.category)
            .subcategory(e.subcategory)
            .radius(calcRadius(e.personNames.size() * 15 + 20))
            .color(colorMap.getOrDefault(e.category, "#6366f1"))
            .clusterAngle(e.clusterAngle)
            .personNames(e.personNames)
            .build())
        .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
        .toList();

    return SkillMap.builder()
        .title(project.getMetadata().getTitle() + " – Alle Skills")
        .bubbles(bubbles)
        .categories(categories)
        .personCount(persons.size())
        .skillCount(bubbles.size())
        .build();
  }

  private double calcRadius(int level) {
    return 20 + (level / 100.0) * 80;
  }

  private Map<String, String> buildColorMap(List<String> categories) {
    Map<String, String> map = new HashMap<>();
    for (int i = 0; i < categories.size(); i++) {
      map.put(categories.get(i), CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
    }
    return map;
  }

  private static class AggEntry {
    String name;
    String category;
    String subcategory;
    Double clusterAngle;
    List<String> personNames = new ArrayList<>();
    int totalProficiency = 0;

    AggEntry(SkillMapDataset skill) {
      this.name = skill.getName();
      this.category = skill.getCategory();
      this.subcategory = skill.getSubcategory();
      this.clusterAngle = skill.getClusterAngle();
    }

    void addPerson(String name, Integer proficiency) {
      if (!personNames.contains(name)) personNames.add(name);
      totalProficiency += proficiency != null ? proficiency : 50;
    }
  }
}

