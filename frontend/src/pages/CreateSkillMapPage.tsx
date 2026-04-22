import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSkillMapProject } from '../api/projectApi';
import './FormPage.css';

export default function CreateSkillMapPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', author: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await createSkillMapProject({
        type: 'SKILL_MAP',
        metadata: { title: form.title, description: form.description, author: form.author },
      });
      navigate(`/skillmap/${res.id}/upload`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-bg"><div className="orb orb-a" /><div className="orb orb-b" /></div>
      <div className="form-container">
        <div className="step-indicator">
          <div className="step active"><span>1</span><label>Projekt</label></div>
          <div className="step-line" />
          <div className="step"><span>2</span><label>Profile</label></div>
          <div className="step-line" />
          <div className="step"><span>3</span><label>SkillMap</label></div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🧠</div>
            <div>
              <h1>SkillMap erstellen</h1>
              <p>Erstelle ein Projekt um Skills aus CVs und Profilen zu extrahieren und zu visualisieren.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Projekttitel *</label>
              <input type="text" placeholder="z.B. Entwickler-Team Q2 2026" required
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Beschreibung</label>
              <textarea placeholder="Wofür wird diese SkillMap verwendet?" rows={3}
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input type="text" placeholder="Dein Name"
                value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            {error && <div className="error-box">⚠ {error}</div>}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/projects')}>← Zurück</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Erstelle...</> : <>Weiter zu Profilen →</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

