import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, deleteProject } from '../api/projectApi';
import type { ProjectSummary } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import './ProjectOverviewPage.css';

export default function ProjectOverviewPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<ProjectSummary | null>(null);

  useEffect(() => {
    getAllProjects()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProject(toDelete.id);
      setProjects((prev) => prev.filter((p) => p.id !== toDelete.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen');
    } finally {
      setToDelete(null);
    }
  };

  const openProject = (p: ProjectSummary) => {
    if (p.type === 'SKILL_MAP') navigate(`/skillmap/${p.id}/search`);
    else navigate(`/view/${p.id}`);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="overview-page">
      <div className="overview-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="overview-content">
        {/* Header */}
        <div className="overview-header">
          <button className="back-link" onClick={() => navigate('/')}>← Startseite</button>
          <h1>Meine Projekte</h1>
          <p className="overview-subtitle">Erstelle ein neues Projekt oder öffne ein bestehendes.</p>
        </div>

        {/* New Project Cards */}
        <div className="new-project-grid">
          <div className="new-project-card bubble-card" onClick={() => navigate('/create')}>
            <div className="np-icon">🫧</div>
            <div className="np-body">
              <h3>BubbleMap</h3>
              <p>Visualisiere beliebige Datensätze als farbige, interaktive Bubble-Map.</p>
            </div>
            <div className="np-cta">Neu erstellen →</div>
          </div>

          <div className="new-project-card skill-card" onClick={() => navigate('/skillmap/create')}>
            <div className="np-icon">🧠</div>
            <div className="np-body">
              <h3>SkillMap</h3>
              <p>Lade CVs hoch und lass KI die Skills extrahieren & visualisieren.</p>
            </div>
            <div className="np-cta">Neu erstellen →</div>
          </div>
        </div>

        {/* Project List */}
        <div className="projects-section">
          <h2>Bestehende Projekte</h2>

          {loading && (
            <div className="projects-empty">
              <div className="spinner-large" />
              <p>Lade Projekte...</p>
            </div>
          )}

          {!loading && error && (
            <div className="error-box">⚠ {error}</div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="projects-empty">
              <div className="empty-icon">📭</div>
              <h3>Noch keine Projekte</h3>
              <p>Erstelle dein erstes Projekt mit einer der Karten oben.</p>
            </div>
          )}

          {!loading && projects.length > 0 && (
            <div className="projects-grid">
              {projects.map((p) => (
                <div key={p.id} className="project-card" onClick={() => openProject(p)}>
                  <div className="project-card-header">
                    <span className={`type-badge ${p.type === 'SKILL_MAP' ? 'badge-skill' : 'badge-bubble'}`}>
                      {p.type === 'SKILL_MAP' ? '🧠 SkillMap' : '🫧 BubbleMap'}
                    </span>
                    <button
                      className="delete-btn"
                      title="Projekt löschen"
                      onClick={(e) => { e.stopPropagation(); setToDelete(p); }}
                    >
                      🗑
                    </button>
                  </div>
                  <h3 className="project-title">{p.title}</h3>
                  {p.description && <p className="project-desc">{p.description}</p>}
                  <div className="project-meta">
                    {p.author && <span>👤 {p.author}</span>}
                    {p.createdAt && <span>📅 {formatDate(p.createdAt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Projekt löschen?"
          message={`„${toDelete.title}" wird unwiderruflich gelöscht.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

