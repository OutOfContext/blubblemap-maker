package com.primiq.backend.repository;

import com.primiq.backend.model.dao.skillMap.SkillMapPerson;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillMapPersonRepository extends JpaRepository<SkillMapPerson, UUID> {

  List<SkillMapPerson> findAllByProjectId(UUID projectId);
}

