package com.primiq.backend.controller;

import com.primiq.backend.model.dao.ProjectType;
import com.primiq.backend.model.dao.bubbleMap.BubbleMapProjectMetadata;
import com.primiq.backend.model.dto.BubbleMapProjectCreationRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ProjectControllerTest {

  private BubbleMapProjectCreationRequest createRequest;

  @BeforeEach
  void setUp() {
    BubbleMapProjectMetadata metadata = new BubbleMapProjectMetadata();
    metadata.setTitle("Test Project");
    metadata.setDescription("A test bubble map project");
    metadata.setAuthor("Test Author");
    metadata.setCategories(5);
    metadata.setDatasets(3);

    createRequest = new BubbleMapProjectCreationRequest();
    createRequest.setType(ProjectType.BUBBLE_MAP);
    createRequest.setMetadata(metadata);
  }

  @Test
  void testRequestObjectCreation() {
    assertThat(createRequest).isNotNull();
    assertThat(createRequest.getType()).isEqualTo(ProjectType.BUBBLE_MAP);
    assertThat(createRequest.getMetadata().getTitle()).isEqualTo("Test Project");
  }
}

