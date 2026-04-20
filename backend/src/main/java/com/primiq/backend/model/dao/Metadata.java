package com.primiq.backend.model.dao;

import jakarta.persistence.MappedSuperclass;
import lombok.Data;

@Data
@MappedSuperclass
public abstract class Metadata<T> {

  private String title;
  private String description;
  private String author;

}
