package com.primiq.backend.controller;

import com.primiq.backend.model.dao.bubbleMap.BubbleMap;
import com.primiq.backend.model.dao.bubbleMap.BubbleMapProject;
import com.primiq.backend.model.dto.BubbleMapDatasetBulkImportRequest;
import com.primiq.backend.model.dto.BubbleMapProjectCreationRequest;
import com.primiq.backend.model.dto.DatasetImportResponse;
import com.primiq.backend.model.dto.ProjectResponse;
import com.primiq.backend.service.BubbleMapDatasetImportService;
import com.primiq.backend.service.BubbleMapProcessingService;
import com.primiq.backend.service.BubbleMapProjectService;
import com.primiq.backend.service.CsvDatasetParserService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/projects")
@Slf4j
@RequiredArgsConstructor
public class ProjectController {

  private final BubbleMapProjectService bubbleMapProjectService;
  private final BubbleMapProcessingService bubbleMapProcessingService;
  private final BubbleMapDatasetImportService datasetImportService;
  private final CsvDatasetParserService csvParserService;

  @PostMapping("/create/bubblemap")
  public ResponseEntity<ProjectResponse> createProject(@RequestBody BubbleMapProjectCreationRequest request) {
    log.info("Received BubbleMap project creation request: Type={}, Title={}",
        request.getType(), request.getMetadata().getTitle());

    try {
      BubbleMapProject createdProject = bubbleMapProjectService.createAndSaveProject(request);

      ProjectResponse response = ProjectResponse.builder()
          .id(createdProject.getId())
          .type(createdProject.getType())
          .title(createdProject.getMetadata().getTitle())
          .description(createdProject.getMetadata().getDescription())
          .author(createdProject.getMetadata().getAuthor())
          .message("Project created successfully")
          .build();

      log.info("BubbleMap project created with ID: {}", createdProject.getId());
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (Exception e) {
      log.error("Error creating BubbleMap project", e);
      ProjectResponse errorResponse = ProjectResponse.builder()
          .message("Error creating project: " + e.getMessage())
          .build();
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
  }

  @PostMapping("/{projectId}/datasets")
  public ResponseEntity<DatasetImportResponse> importDatasetsJson(
      @PathVariable UUID projectId,
      @RequestBody BubbleMapDatasetBulkImportRequest request) {
    log.info("Importing {} datasets via JSON for project: {}",
        request.getDatasets().size(), projectId);

    try {
      DatasetImportResponse response = datasetImportService.importDatasets(
          projectId, request.getDatasets());

      log.info("JSON dataset import completed for project: {}", projectId);
      return ResponseEntity.ok(response);
    } catch (IllegalArgumentException e) {
      log.warn("Project not found: {}", projectId);
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      log.error("Error importing datasets for project: {}", projectId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
          DatasetImportResponse.builder()
              .message("Error importing datasets: " + e.getMessage())
              .build());
    }
  }

  @PostMapping("/{projectId}/datasets/csv")
  public ResponseEntity<DatasetImportResponse> importDatasetsCsv(
      @PathVariable UUID projectId,
      @RequestParam("file") MultipartFile csvFile) {
    log.info("Importing CSV file: {} for project: {}", csvFile.getOriginalFilename(), projectId);

    try {
      if (csvFile.isEmpty()) {
        return ResponseEntity.badRequest().body(
            DatasetImportResponse.builder()
                .message("CSV file is empty")
                .build());
      }

      // Parse CSV
      var datasets = csvParserService.parseFile(csvFile);

      if (datasets.isEmpty()) {
        return ResponseEntity.badRequest().body(
            DatasetImportResponse.builder()
                .message("No valid datasets found in CSV file")
                .build());
      }

      // Import Datasets
      DatasetImportResponse response = datasetImportService.importDatasets(projectId, datasets);

      log.info("CSV dataset import completed for project: {}", projectId);
      return ResponseEntity.ok(response);

    } catch (IllegalArgumentException e) {
      log.warn("Project not found: {}", projectId);
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      log.error("Error importing CSV datasets for project: {}", projectId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
          DatasetImportResponse.builder()
              .message("Error importing CSV: " + e.getMessage())
              .build());
    }
  }

  @GetMapping("/{projectId}/bubblemap")
  public ResponseEntity<BubbleMap> getBubbleMapData(@PathVariable UUID projectId) {
    log.info("Fetching BubbleMap data for project: {}", projectId);

    try {
      BubbleMap bubbleMapData = bubbleMapProcessingService.processToBubbleMap(projectId);

      log.info("BubbleMap data retrieved successfully for project: {}", projectId);
      return ResponseEntity.ok(bubbleMapData);
    } catch (IllegalArgumentException e) {
      log.warn("Project not found: {}", projectId);
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      log.error("Error retrieving BubbleMap data for project: {}", projectId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
