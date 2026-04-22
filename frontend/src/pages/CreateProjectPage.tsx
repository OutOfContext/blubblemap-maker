import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../api/projectApi';
import './FormPage.css';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    categories: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await createProject({
        type: 'BUBBLE_MAP',
        metadata: {
          title: form.title,
          description: form.description,
          author: form.author,
          categories: form.categories,
          datasets: 0,
        },
      });
      navigate(`/import/${res.id}`, { state: { project: res } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-bg">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
      </div>

      <div className="form-container">
        <div className="step-indicator">
          <div className="step active">
            <span>1</span>
            <label>Projekt</label>
          </div>
          <div className="step-line" />
          <div className="step">
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
            <div className="card-icon">📋</div>
            <div>
              <h1>Projekt erstellen</h1>
              <p>Gib deinem BubbleMap-Projekt einen Namen und weitere Details.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Projekttitel *</label>
              <input
                type="text"
                placeholder="z.B. Q1 Sales Report 2024"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Beschreibung</label>
              <textarea
                placeholder="Beschreibe kurz, was diese BubbleMap zeigt..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  placeholder="Dein Name"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Anzahl Kategorien</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.categories}
                  onChange={(e) => setForm({ ...form, categories: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/projects')}>
                ← Zurück
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <><span className="spinner" /> Erstelle Projekt...</>
                ) : (
                  <>Weiter zu Datenimport →</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

