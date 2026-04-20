package com.primiq.backend.service;

import com.primiq.backend.model.dao.bubbleMap.BubbleMap;
import com.primiq.backend.model.dao.bubbleMap.BubbleMapDataset;
import com.primiq.backend.model.dao.bubbleMap.BubbleMapProject;
import com.primiq.backend.repository.BubbleMapDatasetRepository;
import com.primiq.backend.repository.BubbleMapProjectRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * BubbleMapProcessingService verarbeitet rohe Datasets in aufbereitete BubbleMap-Visualisierungs-Daten.
 *
 * Diese Service transformiert die in der Datenbank gespeicherten BubbleMapDatasets
 * zu einem BubbleMap-Objekt, das zum Frontend gesendet und dort gerendert wird.
 */
@Service
@RequiredArgsConstructor
public class BubbleMapProcessingService {

  private final BubbleMapProjectRepository projectRepository;
  private final BubbleMapDatasetRepository datasetRepository;

  /**
   * Verarbeitet alle Datasets eines BubbleMap-Projekts zu einem aufbereiteten BubbleMap-Daten-Modell.
   *
   * @param projectId Die UUID des BubbleMap-Projekts
   * @return BubbleMap mit aufbereiteten Bubble-Daten oder null wenn Projekt nicht existiert
   */
  public BubbleMap processToBubbleMap(UUID projectId) {
    BubbleMapProject project = projectRepository.findById(projectId)
        .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

    List<BubbleMapDataset> datasets = datasetRepository.findByProjectId(projectId);

    // Transformiere Datasets zu Bubbles
    List<BubbleMap.BubbleBubble> bubbles = datasets.stream()
        .map(this::datasetToBubble)
        .toList();

    // Extrahiere eindeutige Kategorien
    List<String> categories = datasets.stream()
        .map(BubbleMapDataset::getCategory)
        .distinct()
        .toList();

    return BubbleMap.builder()
        .title(project.getMetadata().getTitle())
        .bubbles(bubbles)
        .categories(categories)
        .datasetCount(datasets.size())
        .build();
  }

  /**
   * Transformiert einen BubbleMapDataset zu einem BubbleBubble Visualisierungs-Objekt.
   *
   * @param dataset Der Rohdaten-Dataset
   * @return BubbleBubble mit berechneten Eigenschaften (Radius, Farbe, etc.)
   */
  private BubbleMap.BubbleBubble datasetToBubble(BubbleMapDataset dataset) {
    return BubbleMap.BubbleBubble.builder()
        .id(dataset.getId().toString())
        .label(dataset.getName())
        .value(dataset.getValue())
        .category(dataset.getCategory())
        .radius(calculateRadius(dataset.getValue()))
        .color(calculateColor(dataset.getCategory()))
        .build();
  }

  /**
   * Berechnet den Radius einer Bubble basierend auf ihrem Wert.
   * Nutzt die Quadratwurzel, um Fläche proportional zum Wert zu halten.
   *
   * @param value Der numerische Wert (z.B. Verkaufsmenge)
   * @return Der berechnete Radius in Pixeln
   */
  private Double calculateRadius(Double value) {
    if (value == null || value <= 0) {
      return 10.0; // Minimum Radius
    }
    // Radius = sqrt(value) * Skalierungsfaktor
    return Math.sqrt(value) * 2.0;
  }

  /**
   * Weist einer Kategorie eine Farbe zu.
   * Nutzt deterministische Farbzuordnung für konsistente Visualisierung.
   *
   * @param category Die Kategorie (z.B. "Europe", "Asia", "North America")
   * @return Hex-Farb-Code
   */
  private String calculateColor(String category) {
    // Deterministische Farbzuordnung basierend auf Hash
    int hash = category.hashCode() & 0xFFFFFF; // 24-bit hash
    return String.format("#%06X", hash);
  }
}

