import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAggregatedSkillMap } from '../api/projectApi';
import type { SkillMap, SkillBubble } from '../types';
import SkillBubbleChart from '../components/SkillBubbleChart';
import './SkillMapPage.css';

export default function SkillSearchPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [skillMap, setSkillMap] = useState<SkillMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBubble, setSelectedBubble] = useState<SkillBubble | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (!projectId) return;
    getAggregatedSkillMap(projectId)
      .then(setSkillMap)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  const filteredBubbles = skillMap?.bubbles.filter((b) => {
    const matchSearch = !search || b.label.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || b.category === categoryFilter;
    return matchSearch && matchCat;
  }) ?? [];

  return (
    <div className="skillmap-page">
      <div className="skillmap-bg" />

      <div className="skillmap-header">
        <button className="back-link" onClick={() => navigate(`/skillmap/${projectId}/upload`)}>
          ← Zurück zu Profilen
        </button>
        <div className="skillmap-title-row">
          <h1>{skillMap?.title ?? 'Skill-Übersicht'}</h1>
          <button className="btn-outline" onClick={() => navigate('/projects')}>← Zur Übersicht</button>
        </div>
        {skillMap && (
          <div className="skillmap-stats">
            <span>👥 {skillMap.personCount} Personen</span>
            <span>🧩 {skillMap.skillCount} einzigartige Skills</span>
            <span>🏷 {skillMap.categories.length} Kategorien</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      {skillMap && (
        <div className="filter-bar">
          <input
            className="search-input"
            placeholder="🔍 Skill suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Alle Kategorien</option>
            {skillMap.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {loading && <div className="skillmap-loading"><div className="spinner-large" /><p>Berechne SkillMap...</p></div>}
      {error && <div className="error-box">⚠ {error}</div>}

      {skillMap && (
        <div className="skillmap-main">
          {/* Chart */}
          <div className={`skillmap-chart-wrapper ${selectedBubble ? 'with-sidebar' : ''}`}>
            {skillMap && (
              <>
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
                <SkillBubbleChart
                  bubbles={filteredBubbles}
                  title={skillMap.title}
                  onBubbleClick={setSelectedBubble}
                  selectedBubbleId={selectedBubble?.id}
                />
              </>
            )}
          </div>

          {/* Sidebar */}
          {selectedBubble && (
            <div className="persons-sidebar">
              <div className="sidebar-header">
                <div>
                  <h3>{selectedBubble.label}</h3>
                  <p>{selectedBubble.category}{selectedBubble.subcategory ? ` › ${selectedBubble.subcategory}` : ''}</p>
                </div>
                <button className="sidebar-close" onClick={() => setSelectedBubble(null)}>✕</button>
              </div>
              <div className="sidebar-stat">
                <span className="stat-num">{selectedBubble.personNames?.length ?? 0}</span>
                <span className="stat-label">Personen mit diesem Skill</span>
              </div>
              <div className="persons-sidebar-list">
                {selectedBubble.personNames?.map((name, i) => (
                  <div key={i} className="sidebar-person">{name}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

