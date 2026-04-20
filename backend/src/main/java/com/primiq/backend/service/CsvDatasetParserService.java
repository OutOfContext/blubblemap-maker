package com.primiq.backend.service;

import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.primiq.backend.model.dto.BubbleMapDatasetImportDto;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service zum Parsen von CSV-Dateien mit BubbleMap-Datasets.
 *
 * Erwartet CSV-Format:
 * name,category,value,description
 * Europe,Sales,15000.50,European sales data
 * Asia,Sales,22000.75,Asian sales data
 */
@Service
@Slf4j
public class CsvDatasetParserService {

  /**
   * Parst eine CSV-Datei und extrahiert BubbleMapDatasetImportDto Objekte.
   *
   * @param file Die hochgeladene CSV-Datei
   * @return Liste von BubbleMapDatasetImportDto Objekten
   * @throws IOException wenn die Datei nicht gelesen werden kann
   * @throws IllegalArgumentException wenn das CSV-Format ungültig ist
   */
  public List<BubbleMapDatasetImportDto> parseFile(MultipartFile file) throws IOException {
    log.info("Parsing CSV file: {}", file.getOriginalFilename());

    List<BubbleMapDatasetImportDto> datasets = new ArrayList<>();

    try (InputStreamReader reader = new InputStreamReader(file.getInputStream());
        CSVReader csvReader = new CSVReaderBuilder(reader)
            .withCSVParser(new CSVParserBuilder()
                .withSeparator(',')
                .withIgnoreLeadingWhiteSpace(true)
                .build())
            .withSkipLines(1) // Skip header
            .build()) {

      String[] nextLine;
      int lineNumber = 2; // Zählstart bei 2 (wegen Header)

      while ((nextLine = csvReader.readNext()) != null) {
        try {
          if (nextLine.length == 0 || (nextLine.length == 1 && nextLine[0].isEmpty())) {
            // Skip empty lines
            lineNumber++;
            continue;
          }

          if (nextLine.length < 3) {
            log.warn("Line {} has fewer than 3 columns, skipping", lineNumber);
            lineNumber++;
            continue;
          }

          String name = nextLine[0].trim();
          String category = nextLine[1].trim();
          Double value = parseDouble(nextLine[2].trim());
          String description = nextLine.length > 3 ? nextLine[3].trim() : "";

          if (value == null) {
            log.warn("Line {} has invalid value: {}", lineNumber, nextLine[2]);
            lineNumber++;
            continue;
          }

          BubbleMapDatasetImportDto dataset = BubbleMapDatasetImportDto.builder()
              .name(name)
              .category(category)
              .value(value)
              .description(description)
              .build();

          datasets.add(dataset);
          log.debug("Parsed dataset from line {}: {}", lineNumber, name);

        } catch (Exception e) {
          log.warn("Error parsing line {}: {}", lineNumber, e.getMessage());
        }
        lineNumber++;
      }
    } catch (Exception e) {
      log.error("Error reading CSV file: {}", e.getMessage());
      throw new IOException("Failed to parse CSV file", e);
    }

    log.info("Successfully parsed {} datasets from CSV", datasets.size());
    return datasets;
  }

  private Double parseDouble(String value) {
    try {
      return Double.parseDouble(value);
    } catch (NumberFormatException e) {
      return null;
    }
  }
}

