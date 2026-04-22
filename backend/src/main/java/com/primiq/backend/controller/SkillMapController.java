package com.primiq.backend.controller;

import com.primiq.backend.model.dao.skillMap.SkillMap;
import com.primiq.backend.model.dao.skillMap.SkillMapPerson;
import com.primiq.backend.model.dao.skillMap.SkillMapProject;
import com.primiq.backend.model.dto.ProjectResponse;
import com.primiq.backend.model.dto.SkillMapProjectCreationRequest;
import com.primiq.backend.service.CvExtractionService;
import com.primiq.backend.service.SkillMapProcessingService;
import com.primiq.backend.service.SkillMapProjectService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/skillmap")
@Slf4j
@RequiredArgsConstructor
public class SkillMapController {

  private final SkillMapProjectService skillMapProjectService;
  private final SkillMapProcessingService skillMapProcessingService;
  private final CvExtractionService cvExtractionService;

  // ── Project Creation ────────────────────────────────────────────────────────

  @PostMapping("/projects/create")
  public ResponseEntity<ProjectResponse> createProject(@RequestBody SkillMapProjectCreationRequest request) {
    log.info("Creating SkillMap project: {}", request.getMetadata().getTitle());
    try {
      SkillMapProject project = skillMapProjectService.createAndSaveProject(request);
      ProjectResponse response = ProjectResponse.builder()
          .id(project.getId())
          .type(project.getType())
          .title(project.getMetadata().getTitle())
          .description(project.getMetadata().getDescription())
          .author(project.getMetadata().getAuthor())
          .message("SkillMap project created successfully")
          .build();
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (Exception e) {
      log.error("Error creating SkillMap project", e);
      return ResponseEntity.badRequest().body(ProjectResponse.builder()
          .message("Error: " + e.getMessage()).build());
    }
  }

  // ── CV / Profile Extraction ─────────────────────────────────────────────────

  @PostMapping("/projects/{projectId}/persons/extract/cv")
  public ResponseEntity<PersonResponse> extractFromCv(
      @PathVariable UUID projectId,
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "name", required = false) String name) {
    log.info("Extracting skills from CV for project: {}", projectId);
    try {
      SkillMapPerson person = cvExtractionService.extractFromCv(projectId, file, name);
      return ResponseEntity.ok(PersonResponse.from(person));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      log.error("CV extraction failed", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(PersonResponse.error(e.getMessage()));
    }
  }

  @PostMapping("/projects/{projectId}/persons/extract/profile")
  public ResponseEntity<PersonResponse> extractFromProfile(
      @PathVariable UUID projectId,
      @RequestBody ProfileExtractionRequest request) {
    log.info("Extracting skills from profile for project: {}", projectId);
    try {
      SkillMapPerson person = cvExtractionService.extractFromProfile(
          projectId, request.url(), request.text(), request.name());
      return ResponseEntity.ok(PersonResponse.from(person));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      log.error("Profile extraction failed", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(PersonResponse.error(e.getMessage()));
    }
  }

  // ── Visualization ───────────────────────────────────────────────────────────

  @GetMapping("/projects/{projectId}/person/{personId}/skillmap")
  public ResponseEntity<SkillMap> getPersonSkillMap(
      @PathVariable UUID projectId,
      @PathVariable UUID personId) {
    log.info("Fetching SkillMap for person: {} in project: {}", personId, projectId);
    try {
      return ResponseEntity.ok(skillMapProcessingService.processPersonSkills(projectId, personId));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      log.error("Error generating person SkillMap", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @GetMapping("/projects/{projectId}/aggregate")
  public ResponseEntity<SkillMap> getAggregatedSkillMap(@PathVariable UUID projectId) {
    log.info("Fetching aggregated SkillMap for project: {}", projectId);
    try {
      return ResponseEntity.ok(skillMapProcessingService.processAggregatedSkills(projectId));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      log.error("Error generating aggregated SkillMap", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @GetMapping("/projects/{projectId}/persons")
  public ResponseEntity<List<PersonResponse>> getPersons(@PathVariable UUID projectId) {
    log.info("Fetching persons for SkillMap project: {}", projectId);
    try {
      SkillMapProject project = skillMapProjectService.getProject(projectId);
      List<PersonResponse> persons = project.getPersons().stream()
          .map(PersonResponse::from).toList();
      return ResponseEntity.ok(persons);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  @DeleteMapping("/projects/{projectId}/persons/{personId}")
  public ResponseEntity<Void> deletePerson(
      @PathVariable UUID projectId,
      @PathVariable UUID personId) {
    try {
      skillMapProjectService.deletePerson(projectId, personId);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  // ── Inner DTOs ──────────────────────────────────────────────────────────────

  public record ProfileExtractionRequest(String name, String url, String text) {}

  public record PersonResponse(UUID id, String name, String sourceType, String sourceUrl, int skillCount, String error) {
    static PersonResponse from(SkillMapPerson p) {
      return new PersonResponse(p.getId(), p.getName(), p.getSourceType(), p.getSourceUrl(),
          p.getSkills().size(), null);
    }
    static PersonResponse error(String msg) {
      return new PersonResponse(null, null, null, null, 0, msg);
    }
  }
}

