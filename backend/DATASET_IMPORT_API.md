# 🚀 BubbleMap Backend - Dataset Import API

## Workflow: Projekt → Datasets → BubbleMap

```
1. POST /api/projects/create/bubblemap
   ├─ Erstelle leeres Projekt
   └─ Returns: Project ID

2. POST /api/projects/{projectId}/datasets
   └─ oder: POST /api/projects/{projectId}/datasets/csv
   ├─ Importiere Datasets
   └─ Returns: Import Success Count

3. GET /api/projects/{projectId}/bubblemap
   ├─ Lade Datasets + Transformiere zu BubbleMap
   └─ Returns: Aufbereitete Visualisierungs-Daten
```

---

## API Endpoints (Komplett)

### 1️⃣ **Projekt erstellen**

```http
POST /api/projects/create/bubblemap
Content-Type: application/json

{
  "type": "BUBBLE_MAP",
  "metadata": {
    "title": "Q1 Sales Report",
    "description": "Sales data for Q1 2024",
    "author": "John Doe",
    "categories": 5,
    "datasets": 0
  }
}

Response: 201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "BUBBLE_MAP",
  "title": "Q1 Sales Report",
  "description": "Sales data for Q1 2024",
  "author": "John Doe",
  "message": "Project created successfully"
}
```

---

### 2️⃣ **Datasets via JSON importieren**

```http
POST /api/projects/{projectId}/datasets
Content-Type: application/json

{
  "datasets": [
    {
      "name": "Europe",
      "category": "Sales",
      "value": 15000.50,
      "description": "European region sales"
    },
    {
      "name": "Asia",
      "category": "Sales",
      "value": 22000.75,
      "description": "Asian region sales"
    },
    {
      "name": "North America",
      "category": "Sales",
      "value": 18500.00,
      "description": "North American region sales"
    }
  ]
}

Response: 200 OK
{
  "totalImported": 3,
  "successCount": 3,
  "errorCount": 0,
  "message": "Imported 3/3 datasets"
}
```

**Felder pro Dataset:**
- `name` (String) - Name des Datensatzes (erforderlich)
- `category` (String) - Kategorie/Klassifikation (erforderlich)
- `value` (Double) - Numerischer Wert für die Bubble-Größe (erforderlich)
- `description` (String, optional) - Beschreibung
- `rawData` (String, optional) - JSON für zusätzliche Daten

---

### 3️⃣ **Datasets via CSV importieren**

```http
POST /api/projects/{projectId}/datasets/csv
Content-Type: multipart/form-data

file=<CSV-Datei>
```

**CSV Format:**
```csv
name,category,value,description
Europe,Sales,15000.50,European region sales
Asia,Sales,22000.75,Asian region sales
North America,Sales,18500.00,North American region sales
```

**CSV Spalten:**
- Spalte 1: `name` (erforderlich)
- Spalte 2: `category` (erforderlich)
- Spalte 3: `value` (erforderlich, numerisch)
- Spalte 4: `description` (optional)

**Response:**
```json
{
  "totalImported": 3,
  "successCount": 3,
  "errorCount": 0,
  "message": "Imported 3/3 datasets"
}
```

**Error-Handling:**
```json
{
  "totalImported": 0,
  "successCount": 0,
  "errorCount": 0,
  "message": "CSV file is empty"
}
```

---

### 4️⃣ **BubbleMap Daten abrufen (Rendering)**

```http
GET /api/projects/{projectId}/bubblemap

Response: 200 OK
{
  "title": "Q1 Sales Report",
  "bubbles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "label": "Europe",
      "value": 15000.50,
      "category": "Sales",
      "radius": 122.47,
      "color": "#A3D977"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "label": "Asia",
      "value": 22000.75,
      "category": "Sales",
      "radius": 148.32,
      "color": "#5EC1D8"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "label": "North America",
      "value": 18500.00,
      "category": "Sales",
      "radius": 136.02,
      "color": "#F08080"
    }
  ],
  "categories": ["Sales"],
  "datasetCount": 3
}
```

---

## HTTP Status Codes

| Code | Bedeutung | Beispiel |
|------|-----------|----------|
| `200 OK` | Erfolgreich | Dataset-Import, BubbleMap abrufen |
| `201 Created` | Ressource erstellt | Projekt erstellen |
| `400 Bad Request` | Ungültige Eingabe | Leere CSV-Datei, fehlerhafte JSON |
| `404 Not Found` | Projekt nicht gefunden | Ungültige Project ID |
| `500 Internal Server Error` | Server-Fehler | Datenbankfehler |

---

## CSV Parser - Robustheit

Der CSV Parser hat folgende Features:

✅ **Automatisches Überspringen des Headers**
- Erste Zeile wird ignoriert

✅ **Flexible Spaltenanzahl**
- Mindestens 3 Spalten erforderlich
- Optional 4. Spalte für Beschreibung

✅ **Fehlertoleranz**
- Leere Zeilen werden übersprungen
- Ungültige Werte werden geloggt, Import setzt sich fort
- Leerzeichen werden automatisch trimmt

✅ **Fehlerbehandlung**
- Ungültige Dezimalzahlen → Zeile übersprungen
- Zu wenige Spalten → Zeile übersprungen
- Dateilesefehler → IOException mit aussagekräftige Meldung

---

## Verwendungsbeispiel (Frontend)

### 1. Projekt erstellen
```javascript
const createProject = async () => {
  const response = await fetch('/api/projects/create/bubblemap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'BUBBLE_MAP',
      metadata: {
        title: 'Q1 Sales',
        description: 'Sales report',
        author: 'Jane Doe',
        categories: 1,
        datasets: 0
      }
    })
  });
  const project = await response.json();
  return project.id; // speichere Project ID
};
```

### 2. Datasets importieren (JSON)
```javascript
const importDatasets = async (projectId, datasets) => {
  const response = await fetch(`/api/projects/${projectId}/datasets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datasets })
  });
  const result = await response.json();
  console.log(`Imported ${result.successCount}/${result.totalImported}`);
};
```

### 3. Datasets importieren (CSV)
```javascript
const importCsv = async (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `/api/projects/${projectId}/datasets/csv`,
    { method: 'POST', body: formData }
  );
  const result = await response.json();
  console.log(`Imported ${result.successCount}/${result.totalImported}`);
};
```

### 4. BubbleMap rendern
```javascript
const renderBubbleMap = async (projectId) => {
  const response = await fetch(`/api/projects/${projectId}/bubblemap`);
  const bubbleData = await response.json();
  
  // D3.js oder Bubble Chart Bibliothek
  renderBubbleChart('#chart', bubbleData.bubbles);
};
```

---

## Datenfluss in Backend

```
┌─────────────────────────────────────────────────┐
│ 1. POST /datasets (JSON) oder /datasets/csv     │
│    → BubbleMapDatasetImportService              │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ CsvDatasetParser    │ (nur für CSV)
         │ oder JSON Parser    │
         └──────────┬──────────┘
                    │
                    ▼
         ┌──────────────────────────────┐
         │ BubbleMapDatasetImportDto[]  │
         └──────────┬───────────────────┘
                    │
                    ▼
      ┌─────────────────────────────────┐
      │ BubbleMapDataset Entities       │
      │ speichern in bubble_map_datasets│
      └──────────┬──────────────────────┘
                 │
                 ▼
      ┌──────────────────────────────┐
      │ Response: Import Success     │
      │ {successCount, errorCount}   │
      └──────────────────────────────┘
                 ↓
      ┌──────────────────────────────┐
      │ 4. GET /bubblemap            │
      │    BubbleMapProcessingService│
      └──────────┬───────────────────┘
                 │
                 ▼
      ┌──────────────────────────┐
      │ Lade BubbleMapDataset[]  │
      │ aus DB                   │
      └────────────┬─────────────┘
                   │
                   ▼
      ┌──────────────────────────┐
      │ Transform → BubbleMap:   │
      │ - Radius: sqrt(value)*2  │
      │ - Color: hash-basiert    │
      │ - Categories: distinct   │
      └────────────┬─────────────┘
                   │
                   ▼
      ┌──────────────────────────┐
      │ Response: BubbleMap JSON │
      │ Fertig zum Rendern!      │
      └──────────────────────────┘
```

---

## Services im Detail

### `BubbleMapDatasetImportService`
- **Methode:** `importDatasets(projectId, datasets)`
- **Aufgabe:** Speichert BubbleMapDatasetImportDto → BubbleMapDataset
- **Fehlerbehandlung:** Transaktional, einzelne Fehler blockieren nicht
- **Return:** `DatasetImportResponse` mit Statistik

### `CsvDatasetParserService`
- **Methode:** `parseFile(multipartFile)`
- **Aufgabe:** CSV → List<BubbleMapDatasetImportDto>
- **Features:** Header-Skip, Fehlertoleranz, Logging
- **Return:** Liste der geparsten Datasets

### `BubbleMapProcessingService`
- **Methode:** `processToBubbleMap(projectId)`
- **Aufgabe:** BubbleMapDataset[] → BubbleMap (aufbereitet)
- **Berechnung:** Radius, Farbe, Kategorien
- **Return:** Visualisierungs-Modell für Frontend

---

## SQL Datenbank-Struktur

### Neue Tabelle: `bubble_map_datasets`
```sql
CREATE TABLE bubble_map_datasets (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES bubble_map_projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  value DOUBLE PRECISION,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX idx_bubble_map_datasets_project_id 
  ON bubble_map_datasets(project_id);
```

---

## Fehlerszenarien & Handling

### Szenario 1: Projekt existiert nicht
```
POST /api/projects/invalid-id/datasets
→ 404 Not Found
```

### Szenario 2: CSV-Datei leer
```
POST /api/projects/{projectId}/datasets/csv
→ 400 Bad Request
→ "CSV file is empty"
```

### Szenario 3: Ungültiger CSV Format
```
Header: name,category,value
Row 1: Europe,Sales,15000
Row 2: Asia,Sales,invalid_number
→ 200 OK
→ {"successCount": 1, "errorCount": 1}
```

### Szenario 4: JSON Parsing Error
```
POST /api/projects/{projectId}/datasets
Body: {"datasets": "invalid"}
→ 400 Bad Request
→ Invalid JSON
```

---

## Performance-Tipps

- **Batch-Import:** Max 1000 Datasets pro Request empfohlen
- **CSV Format:** Effizienter als JSON für große Mengen
- **Indexing:** `bubble_map_datasets.project_id` ist indexiert

---

**Status:** ✅ Vollständig implementiert und getestet!

