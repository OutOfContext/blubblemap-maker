package com.primiq.backend.model.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO für Bulk-Import von Datasets via JSON.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BubbleMapDatasetBulkImportRequest {

  private List<BubbleMapDatasetImportDto> datasets;
}

