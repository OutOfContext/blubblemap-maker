package com.primiq.backend.model.dao.bubbleMap;

import com.primiq.backend.model.dao.Project;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * BubbleMapProject ist die JPA-Entity für BubbleMap-Projekte.
 *
 * Sie konkretisiert das generische {@link Project<T>} mit dem Daten-Modell {@link BubbleMap}.
 * Diese Klasse verwaltet:
 * - Projekt-Metadaten (Titel, Beschreibung, Autor, etc.)
 * - Diagramme (visuelle Darstellungen)
 * - Datasets (Rohdaten für die Verarbeitung zu BubbleMap-Daten)
 *
 * Die Persistierung erfolgt über {@link BubbleMapProjectRepository}.
 */
@Data
@Entity
@Table(name = "bubble_map_projects")
@EqualsAndHashCode(callSuper = true)
public class BubbleMapProject extends Project<BubbleMap> {

  @Embedded
  private BubbleMapProjectMetadata metadata;

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<BubbleMapDiagram> diagrams = new ArrayList<>();

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<BubbleMapDataset> datasets = new ArrayList<>();

  public void addDiagram(BubbleMapDiagram diagram) {
    diagram.setProject(this);
    this.diagrams.add(diagram);
  }

  public void addDataset(BubbleMapDataset dataset) {
    dataset.setProject(this);
    this.datasets.add(dataset);
  }
}

