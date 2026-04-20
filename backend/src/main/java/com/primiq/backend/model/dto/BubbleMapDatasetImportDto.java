package com.primiq.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO für einzelnen Dataset bei Import.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BubbleMapDatasetImportDto {

  private String name;
  private String category;
  private Double value;
  private String description;
  private String rawData; // Optional JSON data
}

