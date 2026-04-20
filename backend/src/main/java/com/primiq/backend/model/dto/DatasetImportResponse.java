package com.primiq.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO für Antwort nach Dataset-Import.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetImportResponse {

  private Integer totalImported;
  private Integer successCount;
  private Integer errorCount;
  private String message;
}

