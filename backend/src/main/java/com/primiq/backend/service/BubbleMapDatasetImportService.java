package com.primiq.backend.service;

import com.primiq.backend.model.dao.bubbleMap.BubbleMapDataset;
import com.primiq.backend.model.dao.bubbleMap.BubbleMapProject;
import com.primiq.backend.model.dto.BubbleMapDatasetImportDto;
import com.primiq.backend.model.dto.DatasetImportResponse;
import com.primiq.backend.repository.BubbleMapDatasetRepository;
import com.primiq.backend.repository.BubbleMapProjectRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service für das Importieren von BubbleMap-Datasets in ein Projekt.
 *
 * Nimmt eine Liste von BubbleMapDatasetImportDto Objekten und speichert sie
 * als BubbleMapDataset Entities in der Datenbank.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BubbleMapDatasetImportService {

  private final BubbleMapProjectRepository projectRepository;
  private final BubbleMapDatasetRepository datasetRepository;

  /**
   * Importiert eine Liste von Datasets in ein Projekt.
   *
   * @param projectId Die UUID des Ziel-Projekts
   * @param datasetImports Die Liste von zu importierenden Datasets
   * @return DatasetImportResponse mit Erfolgs-/Fehlerstatistik
   * @throws IllegalArgumentException wenn das Projekt nicht existiert
   */
  @Transactional
  public DatasetImportResponse importDatasets(UUID projectId, List<BubbleMapDatasetImportDto> datasetImports) {
    log.info("Starting dataset import for project: {}, count: {}", projectId, datasetImports.size());

    BubbleMapProject project = projectRepository.findById(projectId)
        .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

    int successCount = 0;
    int errorCount = 0;

    for (BubbleMapDatasetImportDto importDto : datasetImports) {
      try {
        BubbleMapDataset dataset = BubbleMapDataset.builder()
            .project(project)
            .name(importDto.getName())
            .category(importDto.getCategory())
            .value(importDto.getValue())
            .description(importDto.getDescription())
            .rawData(importDto.getRawData())
            .createdAt(LocalDateTime.now())
            .build();

        datasetRepository.save(dataset);
        successCount++;
        log.debug("Imported dataset: {}", importDto.getName());

      } catch (Exception e) {
        errorCount++;
        log.warn("Error importing dataset {}: {}", importDto.getName(), e.getMessage());
      }
    }

    log.info("Dataset import completed for project {}. Success: {}, Errors: {}",
        projectId, successCount, errorCount);

    return DatasetImportResponse.builder()
        .totalImported(datasetImports.size())
        .successCount(successCount)
        .errorCount(errorCount)
        .message(String.format("Imported %d/%d datasets", successCount, datasetImports.size()))
        .build();
  }
}

