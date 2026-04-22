import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPersonSkillMap } from '../api/projectApi';
import type { SkillMap } from '../types';
import SkillBubbleChart from '../components/SkillBubbleChart';
import './SkillMapPage.css';

export default function PersonSkillPage() {
  const { projectId, personId } = useParams<{ projectId: string; personId: string }>();
  const navigate = useNavigate();
  const [skillMap, setSkillMap] = useState<SkillMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId || !personId) return;
    getPersonSkillMap(projectId, personId)
      .then(setSkillMap)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId, personId]);

  return (
    <div className="skillmap-page">
      <div className="skillmap-bg" />
      <div className="skillmap-header">
        <button className="back-link" onClick={() => navigate(`/skillmap/${projectId}/upload`)}>
          ← Zurück zu Profilen
        </button>
        <div className="skillmap-title-row">
          <h1>{skillMap?.title ?? 'Skills'}</h1>
          <button className="btn-outline" onClick={() => navigate(`/skillmap/${projectId}/search`)}>
            🗺 Gesamt-SkillMap
          </button>
        </div>
        {skillMap && (
          <div className="skillmap-stats">
            <span>🧩 {skillMap.skillCount} Skills</span>
            <span>🏷 {skillMap.categories.length} Kategorien</span>
          </div>
        )}
      </div>

      {loading && <div className="skillmap-loading"><div className="spinner-large" /><p>Lade Skills...</p></div>}
      {error && <div className="error-box">⚠ {error}</div>}

      {skillMap && (
        <>
          {/* Category Legend */}
          <div className="category-legend">
            {skillMap.categories.map((cat) => {
              const bubble = skillMap.bubbles.find((b) => b.category === cat);
              return (
                <div key={cat} className="legend-item">
                  <span className="legend-dot" style={{ background: bubble?.color ?? '#6366f1' }} />
                  <span>{cat}</span>
                </div>
              );
            })}
          </div>
          <div className="skillmap-chart-wrapper">
            <SkillBubbleChart bubbles={skillMap.bubbles} title={skillMap.title} />
          </div>
        </>
      )}
    </div>
  );
}

