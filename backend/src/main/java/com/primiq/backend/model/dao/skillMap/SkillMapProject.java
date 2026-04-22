package com.primiq.backend.model.dao.skillMap;

import com.primiq.backend.model.dao.Project;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "skill_map_projects")
@EqualsAndHashCode(callSuper = true)
public class SkillMapProject extends Project<SkillMap> {

  @Embedded
  private SkillMapProjectMetadata metadata;

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<SkillMapPerson> persons = new ArrayList<>();

  public void addPerson(SkillMapPerson person) {
    person.setProject(this);
    this.persons.add(person);
  }
}

