import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBubbleMap } from '../api/projectApi';
import type { BubbleMap } from '../types';
import BubbleChart from '../components/BubbleChart';
import './BubbleMapPage.css';

export default function BubbleMapPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<BubbleMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    getBubbleMap(projectId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="bubblemap-page">
      <div className="page-bg">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
      </div>

      <div className="bubblemap-container">
        <div className="step-indicator">
          <div className="step done">
            <span>✓</span>
            <label>Projekt</label>
          </div>
          <div className="step-line active" />
          <div className="step done">
            <span>✓</span>
            <label>Daten</label>
          </div>
          <div className="step-line active" />
          <div className="step active">
            <span>3</span>
            <label>Visualisierung</label>
          </div>
        </div>

        {loading && (
          <div className="loading-card">
            <div className="big-spinner" />
            <p>Bubble-Map wird generiert...</p>
          </div>
        )}

        {error && (
          <div className="error-card">
            <div className="error-icon">⚠</div>
            <h2>Fehler beim Laden</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Zurück zur Startseite
            </button>
          </div>
        )}

        {data && (
          <>
            <div className="bubblemap-header">
              <div>
                <h1>{data.title}</h1>
                <p>
                  <span className="stat-pill">{data.datasetCount} Datensätze</span>
                  {data.categories.map((cat) => (
                    <span className="stat-pill cat" key={cat}>{cat}</span>
                  ))}
                </p>
              </div>
              <div className="header-actions">
                <button className="btn-secondary" onClick={() => navigate(`/import/${projectId}`)}>
                  + Mehr Daten
                </button>
                <button className="btn-primary" onClick={() => navigate('/')}>
                  Neues Projekt
                </button>
              </div>
            </div>

            <div className="chart-wrapper">
              <BubbleChart bubbles={data.bubbles} title={data.title} />
            </div>

            <div className="legend">
              {data.bubbles.map((b) => (
                <div className="legend-item" key={b.id}>
                  <span className="legend-dot" style={{ background: b.color }} />
                  <span className="legend-label">{b.label}</span>
                  <span className="legend-value">{b.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

