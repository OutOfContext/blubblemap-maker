# BubbleMap Backend - Saubere Generics-Architektur

## Überblick: Project<T> Pattern mit konkreten Implementierungen

Die Architektur nutzt **Generics konsequent**, um verschiedene Projekt-Typen sauber zu trennen:

```
Project<T> (@MappedSuperclass, abstrakt)
  ├─ ID (UUID)
  └─ Type (ENUM: BUBBLE_MAP, ...)
       ↓
BubbleMapProject extends Project<BubbleMap> (@Entity)
  ├─ metadata: BubbleMapProjectMetadata (@Embedded)
  ├─ diagrams: List<BubbleMapDiagram> (@OneToMany)
  └─ datasets: List<BubbleMapDataset> (@OneToMany)
       ↓
BubbleMap (reines Daten-Modell, NICHT persistiert!)
  ├─ bubbles: List<BubbleBubble>
  ├─ categories: List<String>
  └─ datasetCount: Integer
```

---

## 1. **Daten-Modelle (DAO Layer)**

### `BubbleMap` - Reines Visualisierungs-Modell
- **NICHT JPA-Entity!** Keine `@Entity`, `@Table` Annotationen
- Wird vom Backend aus Rohdaten (Datasets) aufbereitet
- Im Frontend gerendert
- Enthält strukturierte Bubble-Daten mit Koordinaten, Farben, Werten

```java
@Data
@Builder
public class BubbleMap {
  private String title;
  private List<BubbleBubble> bubbles;  // Die aufbereiteten Bubbles
  private List<String> categories;
  private Integer datasetCount;
  
  @Data
  @Builder
  public static class BubbleBubble {
    private String id;
    private String label;
    private Double value;
    private String category;
    private Double radius;
    private String color;
  }
}
```

### `BubbleMapProject` - JPA-Entity (konkretisiert Project<BubbleMap>)
- **@Entity**, **@Table(name = "bubble_map_projects")**
- Extends `Project<BubbleMap>` - erbt ID + Type
- Speichert Projektmetadaten, Diagramme und Rohdaten

```java
@Entity
@Table(name = "bubble_map_projects")
public class BubbleMapProject extends Project<BubbleMap> {
  @Embedded
  private BubbleMapProjectMetadata metadata;
  
  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
  private List<BubbleMapDiagram> diagrams;
  
  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
  private List<BubbleMapDataset> datasets;  // Rohdaten!
}
```

### `BubbleMapDataset` - Rohdaten für Aufbereitung
- **@Entity**, **@Table(name = "bubble_map_datasets")**
- Speichert raw JSON-Daten, Kategorien, Werte
- Wird vom Backend zu `BubbleMap.BubbleBubble` transformiert

```java
@Entity
@Table(name = "bubble_map_datasets")
public class BubbleMapDataset {
  private UUID id;
  private BubbleMapProject project;  // FK
  private String name;
  private String category;
  private Double value;
  private String rawData;  // JSON
  private LocalDateTime createdAt;
}
```

### `BubbleMapProjectMetadata` - Projekt-Metadaten
- **@Embeddable** - wird als Spalten in `bubble_map_projects` eingebettet
- Enthält: title, description, author, categories, datasets

---

## 2. **Service Orchestration Layer**

### `ProjectService<R, P>` - Generisches Interface
```java
public interface ProjectService<
    R extends CreationRequest<?>, 
    P extends Project<?>> {
  
  ProjectCreator<R, P> projectCreator();
  P saveProject(P project);
  default P createAndSaveProject(R request) {
    P project = projectCreator().create(request);
    return saveProject(project);
  }
}
```

### `BubbleMapProjectService` - Konkrete Implementierung
```java
@Service
public class BubbleMapProjectService implements 
    ProjectService<BubbleMapProjectCreationRequest, BubbleMapProject> {
  
  private final BubbleMapProjectCreator creator;
  private final BubbleMapProjectRepository repository;
  
  @Override
  public BubbleMapProject saveProject(BubbleMapProject project) {
    return repository.save(project);
  }
}
```

---

## 3. **Creator/Mapper (Business Logic)**

### `ProjectCreator<R, P>` - Generisches Interface
```java
public interface ProjectCreator<
    R extends CreationRequest<?>, 
    P extends Project<?>> {
  P create(R request);
}
```

### `BubbleMapProjectCreator` - DTO → Entity Mapping
```java
@Component
public class BubbleMapProjectCreator implements 
    ProjectCreator<BubbleMapProjectCreationRequest, BubbleMapProject> {
  
  @Override
  public BubbleMapProject create(BubbleMapProjectCreationRequest request) {
    BubbleMapProject project = new BubbleMapProject();
    project.setType(ProjectType.BUBBLE_MAP);
    project.setMetadata(request.getMetadata());
    return project;  // Noch nicht persistiert!
  }
}
```

---

## 4. **Data Access Layer (Repositories)**

### `BubbleMapProjectRepository`
```java
public interface BubbleMapProjectRepository 
    extends JpaRepository<BubbleMapProject, UUID> {
}
```

### `BubbleMapDatasetRepository`
```java
public interface BubbleMapDatasetRepository 
    extends JpaRepository<BubbleMapDataset, UUID> {
  List<BubbleMapDataset> findByProjectId(UUID projectId);
}
```

---

## 5. **Request/Response DTOs**

### `BubbleMapProjectCreationRequest`
```java
@Data
public class BubbleMapProjectCreationRequest 
    extends CreationRequest<BubbleMap> {
  
  private BubbleMapProjectMetadata metadata;
}
```

### `ProjectResponse`
```java
@Data
@Builder
public class ProjectResponse {
  private UUID id;
  private ProjectType type;
  private String title;
  private String description;
  private String author;
  private String message;
}
```

---

## 6. **HTTP Controller Layer**

### `ProjectController`
```java
@RestController
@RequestMapping("/api/projects")
public class ProjectController {
  
  private final BubbleMapProjectService service;
  
  @PostMapping("/create/bubblemap")
  public ResponseEntity<ProjectResponse> createProject(
      @RequestBody BubbleMapProjectCreationRequest request) {
    
    // 1. Create + Save
    BubbleMapProject createdProject = 
        service.createAndSaveProject(request);
    
    // 2. Map zu Response
    ProjectResponse response = ProjectResponse.builder()
        .id(createdProject.getId())
        .type(createdProject.getType())
        .title(createdProject.getMetadata().getTitle())
        .message("Project created successfully")
        .build();
    
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
}
```

---

## Request Flow (End-to-End)

```
POST /api/projects/create/bubblemap
{
  "type": "BUBBLE_MAP",
  "metadata": {
    "title": "Sales Q1 2024",
    "description": "Quarterly sales by region",
    "author": "John Doe",
    "categories": 5,
    "datasets": 3
  }
}
         ↓
   ProjectController.createProject()
         ↓
   BubbleMapProjectService.createAndSaveProject()
         ↓
   BubbleMapProjectCreator.create()
         ↓
   BubbleMapProject(id=null, type=BUBBLE_MAP, metadata=...) [In Memory]
         ↓
   BubbleMapProjectRepository.save()
         ↓
   PostgreSQL INSERT bubble_map_projects
         ↓
   BubbleMapProject(id=uuid-123, type=BUBBLE_MAP, ...) [Persistiert]
         ↓
   Response: 201 Created
{
  "id": "uuid-123",
  "type": "BUBBLE_MAP",
  "title": "Sales Q1 2024",
  "message": "Project created successfully"
}
```

---

## Datenbankschema

### Tabelle: `bubble_map_projects`
```sql
CREATE TABLE bubble_map_projects (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,  -- ENUM as String
  title VARCHAR(255),
  description TEXT,
  author VARCHAR(100),
  categories INTEGER,
  datasets INTEGER
);
```

### Tabelle: `bubble_map_diagrams`
```sql
CREATE TABLE bubble_map_diagrams (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES bubble_map_projects(id),
  name VARCHAR(255),
  description TEXT,
  radius DOUBLE PRECISION
);
```

### Tabelle: `bubble_map_datasets`
```sql
CREATE TABLE bubble_map_datasets (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES bubble_map_projects(id),
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  value DOUBLE PRECISION,
  raw_data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Zukünftige Funktionalität: Daten-Aufbereitung

### Backend-Service: Datasets → BubbleMap

```java
@Service
public class BubbleMapProcessingService {
  
  private final BubbleMapDatasetRepository datasetRepo;
  
  public BubbleMap processToBubbleMap(UUID projectId) {
    BubbleMapProject project = repo.findById(projectId);
    List<BubbleMapDataset> datasets = datasetRepo.findByProjectId(projectId);
    
    // Transform Datasets zu Bubbles
    List<BubbleMap.BubbleBubble> bubbles = datasets.stream()
        .map(dataset -> BubbleMap.BubbleBubble.builder()
            .id(dataset.getId().toString())
            .label(dataset.getName())
            .value(dataset.getValue())
            .category(dataset.getCategory())
            .radius(calculateRadius(dataset.getValue()))
            .color(assignColor(dataset.getCategory()))
            .build())
        .collect(Collectors.toList());
    
    return BubbleMap.builder()
        .title(project.getMetadata().getTitle())
        .bubbles(bubbles)
        .categories(extractCategories(datasets))
        .datasetCount(datasets.size())
        .build();
  }
  
  private Double calculateRadius(Double value) {
    // Logik für Bubble-Größe basierend auf Wert
    return Math.sqrt(value) * 2;
  }
  
  private String assignColor(String category) {
    // Logik für Farb-Zuordnung pro Kategorie
    return categoryColorMap.getOrDefault(category, "#999999");
  }
}
```

### Frontend: Rendering

```typescript
// React Component
const BubbleMapViewer: React.FC<{projectId: string}> = ({projectId}) => {
  const [bubbleData, setBubbleData] = useState<BubbleMap | null>(null);
  
  useEffect(() => {
    // Daten vom Backend abrufen
    fetch(`/api/projects/${projectId}/bubblemap`)
      .then(r => r.json())
      .then(data => setBubbleData(data));
  }, [projectId]);
  
  return (
    <BubbleChartComponent data={bubbleData} />
  );
};
```

---

## Erweiterbarkeit für weitere Projekt-Typen

Für einen neuen Projekt-Typ (z.B. `LineDiagram`):

1. **Daten-Modell:** `LineDiagram` (reines Modell)
2. **Entity:** `LineDiagramProject extends Project<LineDiagram>`
3. **Metadata:** `LineDiagramProjectMetadata extends Metadata<LineDiagram>`
4. **Dataset:** `LineDiagramDataset` für Rohdaten
5. **Creator:** `LineDiagramProjectCreator implements ProjectCreator<...>`
6. **Service:** `LineDiagramProjectService implements ProjectService<...>`
7. **Repository:** `LineDiagramProjectRepository extends JpaRepository<...>`
8. **Controller:** `POST /api/projects/create/linediagram`

**Keine Änderungen an bestehenden Klassen nötig!** (Open-Closed-Principle)

---

## Zusammenfassung: Warum dieses Design?

| Aspekt | Vorteil |
|--------|---------|
| **Generics konsequent** | `Project<T>` ermöglicht typsichere Implementierungen |
| **Klare Separation** | BubbleMap ≠ BubbleMapProject (Rendering ≠ Persistierung) |
| **Datasets separat** | Rohdaten können transformiert werden zu Visualisierungs-Modellen |
| **Erweiterbar** | Neue Projekt-Typen ohne Änderungen am bestehenden Code |
| **Testbar** | Klare Grenzen zwischen Schichten ermöglichen Unit/Integration Tests |
| **Frontend-ready** | BubbleMap JSON kann direkt zu Frontend gesendet werden |

