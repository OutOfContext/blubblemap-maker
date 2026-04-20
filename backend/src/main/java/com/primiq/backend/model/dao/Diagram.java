package com.primiq.backend.model.dao;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.util.UUID;
import lombok.Data;

@Data
@MappedSuperclass
public abstract class Diagram<T> {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

}
