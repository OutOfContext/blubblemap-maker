package com.primiq.backend.service;

import com.primiq.backend.model.dao.ProjectType;
import com.primiq.backend.model.dao.bubbleMap.BubbleMapProject;
import com.primiq.backend.model.dao.bubbleMap.BubbleMapProjectMetadata;
import com.primiq.backend.model.dto.BubbleMapProjectCreationRequest;
import com.primiq.backend.repository.BubbleMapProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BubbleMapProjectServiceTest {

  @Mock
  private BubbleMapProjectRepository repository;

  @Mock
  private BubbleMapProjectCreator creator;

  @InjectMocks
  private BubbleMapProjectService service;

  private BubbleMapProjectCreationRequest request;
  private BubbleMapProject bubbleMapProject;

  @BeforeEach
  void setUp() {
    BubbleMapProjectMetadata metadata = new BubbleMapProjectMetadata();
    metadata.setTitle("Test BubbleMap");
    metadata.setDescription("Test Description");
    metadata.setAuthor("Test Author");
    metadata.setCategories(5);
    metadata.setDatasets(3);

    request = new BubbleMapProjectCreationRequest();
    request.setType(ProjectType.BUBBLE_MAP);
    request.setMetadata(metadata);

    bubbleMapProject = new BubbleMapProject();
    bubbleMapProject.setId(UUID.randomUUID());
    bubbleMapProject.setType(ProjectType.BUBBLE_MAP);
    bubbleMapProject.setMetadata(metadata);
  }

  @Test
  void testCreateAndSaveProject() {
    when(creator.create(request)).thenReturn(bubbleMapProject);
    when(repository.save(any(BubbleMapProject.class))).thenReturn(bubbleMapProject);

    BubbleMapProject result = service.createAndSaveProject(request);

    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(bubbleMapProject.getId());
    assertThat(result.getType()).isEqualTo(ProjectType.BUBBLE_MAP);
    assertThat(result.getMetadata().getTitle()).isEqualTo("Test BubbleMap");
  }

  @Test
  void testSaveProject() {
    when(repository.save(any(BubbleMapProject.class))).thenReturn(bubbleMapProject);

    BubbleMapProject result = service.saveProject(bubbleMapProject);

    assertThat(result).isNotNull();
    assertThat(result.getId()).isEqualTo(bubbleMapProject.getId());
  }
}

