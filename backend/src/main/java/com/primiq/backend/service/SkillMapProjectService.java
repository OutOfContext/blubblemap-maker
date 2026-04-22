package com.primiq.backend.service;

import com.primiq.backend.model.dao.skillMap.SkillMapProject;
import com.primiq.backend.model.dto.SkillMapProjectCreationRequest;
import com.primiq.backend.repository.SkillMapPersonRepository;
import com.primiq.backend.repository.SkillMapProjectRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SkillMapProjectService implements ProjectService<SkillMapProjectCreationRequest, SkillMapProject> {

  private final SkillMapProjectCreator skillMapProjectCreator;
  private final SkillMapProjectRepository repository;
  private final SkillMapPersonRepository personRepository;

  @Override
  public ProjectCreator<SkillMapProjectCreationRequest, SkillMapProject> projectCreator() {
    return skillMapProjectCreator;
  }

  @Override
  public SkillMapProject saveProject(SkillMapProject project) {
    return repository.save(project);
  }

  public SkillMapProject getProject(UUID projectId) {
    return repository.findById(projectId)
        .orElseThrow(() -> new IllegalArgumentException("SkillMapProject not found: " + projectId));
  }

  public void deletePerson(UUID projectId, UUID personId) {
    var person = personRepository.findById(personId)
        .orElseThrow(() -> new IllegalArgumentException("Person not found: " + personId));
    if (!person.getProject().getId().equals(projectId)) {
      throw new IllegalArgumentException("Person does not belong to project");
    }
    personRepository.delete(person);
  }
}

