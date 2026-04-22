package com.primiq.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.primiq.backend.model.dao.skillMap.SkillMapDataset;
import com.primiq.backend.model.dao.skillMap.SkillMapPerson;
import com.primiq.backend.model.dao.skillMap.SkillMapProject;
import com.primiq.backend.repository.SkillMapPersonRepository;
import com.primiq.backend.repository.SkillMapProjectRepository;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class CvExtractionService {

  private final SkillMapProjectRepository projectRepository;
  private final SkillMapPersonRepository personRepository;
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final HttpClient httpClient = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(30))
      .build();

  @Value("${openai.api.key}")
  private String openAiApiKey;

  @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
  private String openAiApiUrl;

  private static final String SYSTEM_PROMPT = """
      You are a professional skill extractor. Given a CV or profile text, extract all technical and professional skills.
      For each skill, assign:
      - name: the skill name (e.g. "MySQL", "React", "Project Management")
      - category: broad category (e.g. "Databases", "Frontend", "Backend", "Cloud", "DevOps", "Languages", "Soft Skills", "Tools")
      - subcategory: specific subcategory (e.g. for Databases: "SQL" or "NoSQL"; for Languages: "JVM", "Scripting", "Systems" etc.)
      - proficiencyLevel: integer 0-100 based on context clues (years of experience, keywords like "expert", "familiar" etc.)
      - clusterAngle: a float 0-360 degrees for visual clustering. Assign angles so that RELATED skills cluster together
        and OPPOSITE types are placed 180° apart (e.g. SQL DBs at ~90°, NoSQL DBs at ~270°; Frontend at ~0°, Backend at ~180°;
        Cloud/DevOps at ~45°, Soft Skills at ~315°). Be consistent across responses.
      Return ONLY valid JSON: {"personName": "...", "skills": [{"name":"...","category":"...","subcategory":"...","proficiencyLevel":80,"clusterAngle":90.0}]}
      """;

  public SkillMapPerson extractFromCv(UUID projectId, MultipartFile file, String overrideName) throws IOException {
    String text = extractText(file);
    return extractAndSave(projectId, text, overrideName, "CV");
  }

  public SkillMapPerson extractFromProfile(UUID projectId, String profileUrl, String profileText, String personName) {
    return extractAndSave(projectId, profileText, personName, "MANUAL");
  }

  private SkillMapPerson extractAndSave(UUID projectId, String text, String overrideName, String sourceType) {
    SkillMapProject project = projectRepository.findById(projectId)
        .orElseThrow(() -> new IllegalArgumentException("SkillMapProject not found: " + projectId));

    ExtractionResult result = callOpenAi(text);

    SkillMapPerson person = new SkillMapPerson();
    person.setProject(project);
    person.setName(overrideName != null && !overrideName.isBlank() ? overrideName : result.getPersonName());
    person.setSourceType(sourceType);

    for (ExtractedSkill skill : result.getSkills()) {
      SkillMapDataset dataset = SkillMapDataset.builder()
          .person(person)
          .name(skill.getName())
          .category(skill.getCategory())
          .subcategory(skill.getSubcategory())
          .proficiencyLevel(skill.getProficiencyLevel())
          .clusterAngle(skill.getClusterAngle())
          .build();
      person.getSkills().add(dataset);
    }

    return personRepository.save(person);
  }

  private ExtractionResult callOpenAi(String cvText) {
    String truncated = cvText.length() > 12000 ? cvText.substring(0, 12000) : cvText;

    try {
      Map<String, Object> body = Map.of(
          "model", "gpt-4o",
          "response_format", Map.of("type", "json_object"),
          "messages", List.of(
              Map.of("role", "system", "content", SYSTEM_PROMPT),
              Map.of("role", "user", "content", "Extract skills from this CV/profile:\n\n" + truncated)
          )
      );

      String requestBody = objectMapper.writeValueAsString(body);

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(openAiApiUrl))
          .header("Authorization", "Bearer " + openAiApiKey)
          .header("Content-Type", "application/json")
          .timeout(Duration.ofSeconds(90))
          .POST(HttpRequest.BodyPublishers.ofString(requestBody))
          .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() != 200) {
        throw new RuntimeException("OpenAI API error " + response.statusCode() + ": " + response.body());
      }

      var responseMap = objectMapper.readValue(response.body(), Map.class);
      var choices = (List<?>) responseMap.get("choices");
      var message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
      String content = (String) message.get("content");

      return objectMapper.readValue(content, ExtractionResult.class);
    } catch (Exception e) {
      log.error("OpenAI extraction failed", e);
      throw new RuntimeException("Skill extraction failed: " + e.getMessage(), e);
    }
  }

  private String extractText(MultipartFile file) throws IOException {
    String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

    if (filename.endsWith(".pdf")) {
      try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
        return new PDFTextStripper().getText(doc);
      }
    } else if (filename.endsWith(".docx")) {
      try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
        StringBuilder sb = new StringBuilder();
        for (XWPFParagraph p : doc.getParagraphs()) {
          sb.append(p.getText()).append("\n");
        }
        return sb.toString();
      }
    } else {
      // Fallback: treat as plain text
      return new String(file.getBytes());
    }
  }

  // ── Internal DTOs ──────────────────────────────────────────────────────────

  @Data
  @JsonIgnoreProperties(ignoreUnknown = true)
  static class ExtractionResult {
    private String personName;
    private List<ExtractedSkill> skills;
  }

  @Data
  @JsonIgnoreProperties(ignoreUnknown = true)
  static class ExtractedSkill {
    private String name;
    private String category;
    private String subcategory;
    private Integer proficiencyLevel;
    private Double clusterAngle;
  }
}

