# Architektur-Übersicht: BubbleMap Generics-Struktur

## Klassen-Hierarchie

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DTO/Request Layer                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  CreationRequest<T>  ◄─────┬───────────────────────────────┐         │
│  (abstract, Generic) │     │                               │         │
│    ↑                 │     │                               │         │
│    │                 │     │                               │         │
│    └─────────────────┴─────┴───────┐                       │         │
│                              │     │                       │         │
│              BubbleMapProjectCreationRequest               │         │
│              - type: ProjectType.BUBBLE_MAP               │         │
│              - metadata: BubbleMapProjectMetadata         │         │
│                                                            │         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Request Body
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      HTTP Controller Layer                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  @RestController                                                     │
│  ProjectController                                                   │
│  - POST /api/projects/create/bubblemap                             │
│    └─► BubbleMapProjectService.createAndSaveProject()             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Service Orchestration Layer                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ProjectService<R extends CreationRequest<?>,                       │
│                 P extends Project<?>>                               │
│  (Generic Interface)                                                │
│    ▲                                                                │
│    │ implements                                                     │
│    │                                                                │
│  BubbleMapProjectService                                           │
│  <BubbleMapProjectCreationRequest, BubbleMapProject>              │
│                                                                       │
│  + projectCreator(): ProjectCreator<R, P>                         │
│  + saveProject(P): P                                               │
│  + createAndSaveProject(R): P  (default)                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                   │                              │
        1. create()│                              │ 2. save()
                   ▼                              ▼
     ┌────────────────────┐          ┌──────────────────────┐
     │     Creator        │          │    Repository        │
     │     Layer          │          │    Layer             │
     │                    │          │                      │
     │ ProjectCreator     │          │ BubbleMapProject     │
     │ <R, P>             │          │ Repository           │
     │ (Generic)          │          │ extends              │
     │   ▲                │          │ JpaRepository        │
     │   │                │          │ <BubbleMapProject,   │
     │   │ implements     │          │  UUID>               │
     │   │                │          │                      │
     │ BubbleMap          │          │ + save(project)      │
     │ ProjectCreator     │          │ + findById(id)       │
     │ <BubbleMapProject  │          │ + delete(project)    │
     │  CreationRequest>  │          │                      │
     │                    │          │                      │
     │ + create(request)  │          │                      │
     │   → BubbleMapProject          │                      │
     └────────────────────┘          └──────────────────────┘
             │                                   │
             │ DTO → Entity Mapping             │ JPA Persistence
             │                                   │
             ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Domain Model Layer (DAO)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Project<T>                                                          │
│  (@MappedSuperclass, abstract)                                      │
│  - id: UUID (PK)                                                    │
│  - type: ProjectType (ENUM)                                         │
│    ▲                                                                │
│    │ extends                                                        │
│    │                                                                │
│  BubbleMapProject (@Entity)                                        │
│  - metadata: BubbleMapProjectMetadata (@Embedded)                 │
│  - diagrams: List<BubbleMapDiagram> (@OneToMany)                 │
│  - datasets: List<BubbleMapDataset> (@OneToMany)                 │
│                                                                       │
│  ├─► BubbleMapProjectMetadata (@Embeddable)                       │
│  │   - title: String                                               │
│  │   - description: String                                         │
│  │   - author: String                                              │
│  │   - categories: Integer                                         │
│  │   - datasets: Integer                                           │
│  │                                                                  │
│  ├─► BubbleMapDiagram (@Entity)                                   │
│  │   extends Diagram<BubbleMap>                                   │
│  │   - name: String                                               │
│  │   - description: String                                        │
│  │   - radius: Double                                             │
│  │                                                                  │
│  └─► BubbleMapDataset (@Entity)                                   │
│      - name: String                                                │
│      - category: String                                            │
│      - value: Double                                               │
│      - rawData: String (JSON)                                      │
│      - createdAt: LocalDateTime                                    │
│                                                                       │
│  BubbleMap (NICHT persistiert!)                                   │
│  - title: String                                                   │
│  - bubbles: List<BubbleBubble>                                    │
│  - categories: List<String>                                        │
│  - datasetCount: Integer                                           │
│    └─► BubbleMap.BubbleBubble                                     │
│        - id: String                                                │
│        - label: String                                             │
│        - value: Double                                             │
│        - category: String                                          │
│        - radius: Double                                            │
│        - color: String                                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ SQL
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PostgreSQL Database                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  TABLE bubble_map_projects (extends Project)                       │
│  ├─ id (UUID, PK)                                                  │
│  ├─ type (VARCHAR, ENUM)                                           │
│  ├─ title (VARCHAR) [embedded]                                     │
│  ├─ description (TEXT) [embedded]                                  │
│  ├─ author (VARCHAR) [embedded]                                    │
│  ├─ categories (INTEGER) [embedded]                                │
│  └─ datasets (INTEGER) [embedded]                                  │
│                                                                       │
│  TABLE bubble_map_diagrams                                         │
│  ├─ id (UUID, PK)                                                  │
│  ├─ project_id (UUID, FK)                                          │
│  ├─ name (VARCHAR)                                                 │
│  ├─ description (TEXT)                                             │
│  └─ radius (FLOAT)                                                 │
│                                                                       │
│  TABLE bubble_map_datasets                                         │
│  ├─ id (UUID, PK)                                                  │
│  ├─ project_id (UUID, FK)                                          │
│  ├─ name (VARCHAR)                                                 │
│  ├─ category (VARCHAR)                                             │
│  ├─ value (FLOAT)                                                  │
│  ├─ raw_data (JSONB)                                               │
│  ├─ created_at (TIMESTAMP)                                         │
│  └─ updated_at (TIMESTAMP)                                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Request → Response

```
1. HTTP Request
   ┌──────────────────────────────────────────────────┐
   │ POST /api/projects/create/bubblemap               │
   │ Content-Type: application/json                    │
   │                                                   │
   │ {                                                │
   │   "type": "BUBBLE_MAP",                          │
   │   "metadata": {                                  │
   │     "title": "Q1 Sales",                         │
   │     "description": "...",                        │
   │     "author": "John",                            │
   │     "categories": 5,                             │
   │     "datasets": 3                                │
   │   }                                              │
   │ }                                                │
   └──────────────────────────────────────────────────┘
                        │
                        ▼
2. Controller
   ┌──────────────────────────────────────────────────┐
   │ ProjectController                                │
   │ - Parse DTO                                      │
   │ - Validate Request                               │
   │ - Log                                            │
   └──────────────────────────────────────────────────┘
                        │
                        ▼
3. Service
   ┌──────────────────────────────────────────────────┐
   │ BubbleMapProjectService.createAndSaveProject()   │
   │ - Call Creator                                   │
   │ - Call Repository.save()                         │
   │ - Return persisted entity                        │
   └──────────────────────────────────────────────────┘
                        │
                    ┌───┴───┐
                    │       │
         3a. Create │       │ 3b. Save
                    ▼       ▼
   ┌───────────────────┐ ┌────────────────────┐
   │ Creator           │ │ Repository         │
   │ - Map DTO to      │ │ - Insert in DB     │
   │   Entity          │ │ - Generate UUID    │
   │ - No Persistence  │ │ - Return entity    │
   └───────────────────┘ └────────────────────┘
                    │       │
                    └───┬───┘
                        │
                        ▼
4. Entity (BubbleMapProject)
   ┌──────────────────────────────────────────────────┐
   │ - id: uuid-123 (Generated)                       │
   │ - type: BUBBLE_MAP                               │
   │ - metadata: BubbleMapProjectMetadata              │
   │ - diagrams: [] (empty)                           │
   │ - datasets: [] (empty)                           │
   └──────────────────────────────────────────────────┘
                        │
                        ▼
5. Database
   ┌──────────────────────────────────────────────────┐
   │ INSERT INTO bubble_map_projects (                │
   │   id, type, title, description, ...             │
   │ ) VALUES (                                       │
   │   'uuid-123', 'BUBBLE_MAP', 'Q1 Sales', ...    │
   │ );                                               │
   └──────────────────────────────────────────────────┘
                        │
                        ▼
6. Response
   ┌──────────────────────────────────────────────────┐
   │ HTTP 201 Created                                 │
   │ Content-Type: application/json                   │
   │                                                   │
   │ {                                                │
   │   "id": "uuid-123",                              │
   │   "type": "BUBBLE_MAP",                          │
   │   "title": "Q1 Sales",                           │
   │   "description": "...",                          │
   │   "author": "John",                              │
   │   "message": "Project created successfully"      │
   │ }                                                │
   └──────────────────────────────────────────────────┘
```

---

## Verwendung der Generics

### Warum `Project<T>`?

```java
// Project<BubbleMap> bedeutet:
// "Ein Projekt, dessen Visualisierungs-Daten-Typ BubbleMap ist"

Project<BubbleMap>      // ← BubbleMapProject
Project<LineDiagram>    // ← LineDiagramProject (zukünftig)
Project<PieChart>       // ← PieChartProject (zukünftig)
```

### Typsicherheit in Action

```java
// Service mit generischem Typ-Parameter
ProjectService<
    BubbleMapProjectCreationRequest,  // Request-Typ
    BubbleMapProject                  // Entity-Typ
>

// Creator mit generischem Typ-Parameter
ProjectCreator<
    BubbleMapProjectCreationRequest,  // Input: DTO
    BubbleMapProject                  // Output: Entity
>

// Diese Zuordnung ist typsicher zur Compile-Zeit!
```

---

## Separation of Concerns

| Klasse | Verantwortung | Beispiel |
|--------|---------------|---------|
| `ProjectController` | HTTP-API | Parse Request, Return Response |
| `BubbleMapProjectService` | Use-Case | Orchestrieren des Create-Flows |
| `BubbleMapProjectCreator` | Business Logic | DTO → Entity Mapping |
| `BubbleMapProjectRepository` | Data Access | Database CRUD |
| `BubbleMapProject` | Domain Entity | Persistable Object |
| `BubbleMap` | Data Model | Rendering Data (kein DB) |
| `BubbleMapDataset` | Raw Data | Eingabe-Daten für Aufbereitung |

---

## Zukünftige Erweiterung: Datasets Processing

```
BubbleMapDataset          BubbleMapDataset         BubbleMapDataset
├─ category: "Europe"     ├─ category: "Asia"      ├─ category: "NA"
├─ value: 15000.00        ├─ value: 22000.00       ├─ value: 18500.00
└─ rawData: {...}         └─ rawData: {...}        └─ rawData: {...}
     │                          │                         │
     └──────────────────────────┼─────────────────────────┘
                                │
                    BubbleMapProcessingService
                    .processToBubbleMap()
                                │
                                ▼
                    BubbleMap (aufbereitet)
                    ├─ bubbles:
                    │  ├─ BubbleBubble(label="Europe", value=15000, radius=122.5, color="#FF5733")
                    │  ├─ BubbleBubble(label="Asia", value=22000, radius=148.3, color="#33FF57")
                    │  └─ BubbleBubble(label="NA", value=18500, radius=136.0, color="#3357FF")
                    ├─ categories: ["Europe", "Asia", "NA"]
                    └─ datasetCount: 3
                                │
                                ▼
                    Frontend JSON (REST API)
                    ├─ GET /api/projects/{id}/bubblemap
                    └─ Renders in React/D3.js
```

