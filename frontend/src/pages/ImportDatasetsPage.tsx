import { useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { importDatasets, importCsv } from '../api/projectApi';
import type { DatasetImportItem } from '../types';
import './FormPage.css';

type Tab = 'json' | 'csv';

export default function ImportDatasetsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const project = (location.state as { project?: { title: string } })?.project;

  const [tab, setTab] = useState<Tab>('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // JSON editor state
  const [rows, setRows] = useState<DatasetImportItem[]>([
    { name: '', category: '', value: 0, description: '' },
  ]);

  const addRow = () =>
    setRows([...rows, { name: '', category: '', value: 0, description: '' }]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, key: keyof DatasetImportItem, val: string | number) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  const handleSubmitJson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    const valid = rows.filter((r) => r.name && r.category && r.value);
    if (valid.length === 0) {
      setError('Bitte mindestens einen gültigen Datensatz eingeben.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await importDatasets(projectId, { datasets: valid });
      setSuccess(`✅ ${res.successCount} von ${res.totalImported} Datensätze importiert!`);
      setTimeout(() => navigate(`/view/${projectId}`), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Import');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !csvFile) return;
    setLoading(true);
    setError('');
    try {
      const res = await importCsv(projectId, csvFile);
      setSuccess(`✅ ${res.successCount} von ${res.totalImported} Datensätze importiert!`);
      setTimeout(() => navigate(`/view/${projectId}`), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim CSV-Import');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) setCsvFile(file);
  };

  return (
    <div className="page-wrapper">
      <div className="page-bg">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
      </div>

      <div className="form-container">
        <div className="step-indicator">
          <div className="step done">
            <span>✓</span>
            <label>Projekt</label>
          </div>
          <div className="step-line active" />
          <div className="step active">
            <span>2</span>
            <label>Daten</label>
          </div>
          <div className="step-line" />
          <div className="step">
            <span>3</span>
            <label>Visualisierung</label>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <div>
              <h1>Daten importieren</h1>
              <p>
                {project?.title ? (
                  <>Projekt: <strong>{project.title}</strong></>
                ) : (
                  'Importiere deine Datensätze via JSON oder CSV.'
                )}
              </p>
            </div>
          </div>

          <div className="tab-bar">
            <button
              className={`tab ${tab === 'json' ? 'active' : ''}`}
              onClick={() => setTab('json')}
            >
              JSON-Eingabe
            </button>
            <button
              className={`tab ${tab === 'csv' ? 'active' : ''}`}
              onClick={() => setTab('csv')}
            >
              CSV-Upload
            </button>
          </div>

          {tab === 'json' && (
            <form onSubmit={handleSubmitJson}>
              <div className="dataset-table">
                <div className="dataset-header">
                  <span>Name *</span>
                  <span>Kategorie *</span>
                  <span>Wert *</span>
                  <span>Beschreibung</span>
                  <span></span>
                </div>
                {rows.map((row, i) => (
                  <div className="dataset-row" key={i}>
                    <input
                      placeholder="Europe"
                      value={row.name}
                      onChange={(e) => updateRow(i, 'name', e.target.value)}
                    />
                    <input
                      placeholder="Sales"
                      value={row.category}
                      onChange={(e) => updateRow(i, 'category', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="15000"
                      value={row.value || ''}
                      onChange={(e) => updateRow(i, 'value', parseFloat(e.target.value) || 0)}
                    />
                    <input
                      placeholder="Optional..."
                      value={row.description ?? ''}
                      onChange={(e) => updateRow(i, 'description', e.target.value)}
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeRow(i)}
                      disabled={rows.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="add-row-btn" onClick={addRow}>
                + Zeile hinzufügen
              </button>

              {error && <div className="error-box">⚠ {error}</div>}
              {success && <div className="success-box">{success}</div>}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                  ← Zurück
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Importiere...</> : 'Importieren & Visualisieren →'}
                </button>
              </div>
            </form>
          )}

          {tab === 'csv' && (
            <form onSubmit={handleSubmitCsv}>
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''} ${csvFile ? 'has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                />
                {csvFile ? (
                  <>
                    <div className="drop-icon">✅</div>
                    <p className="drop-filename">{csvFile.name}</p>
                    <p className="drop-hint">Klicken um zu wechseln</p>
                  </>
                ) : (
                  <>
                    <div className="drop-icon">📂</div>
                    <p>CSV-Datei hierher ziehen oder klicken</p>
                    <p className="drop-hint">Format: name, category, value, description</p>
                  </>
                )}
              </div>

              <div className="csv-format-hint">
                <strong>Erwartetes CSV-Format:</strong>
                <pre>{`name,category,value,description\nEurope,Sales,15000,European sales\nAsia,Sales,22000,Asian sales`}</pre>
              </div>

              {error && <div className="error-box">⚠ {error}</div>}
              {success && <div className="success-box">{success}</div>}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                  ← Zurück
                </button>
                <button type="submit" className="btn-primary" disabled={loading || !csvFile}>
                  {loading ? <><span className="spinner" /> Importiere...</> : 'CSV importieren →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

