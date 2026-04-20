import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="landing-content">
        <div className="badge">✦ Datenvisualisierung leicht gemacht</div>
        <h1 className="landing-title">
          <span className="gradient-text">BubbleMap</span>
          <br />
          Maker
        </h1>
        <p className="landing-subtitle">
          Verwandle deine Rohdaten in atemberaubende interaktive Bubble-Maps.
          In nur drei Schritten zur perfekten Visualisierung.
        </p>

        <div className="steps-preview">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon">📋</div>
            <h3>Projekt erstellen</h3>
            <p>Gib deinem Projekt einen Titel, Beschreibung und Author.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon">📊</div>
            <h3>Daten importieren</h3>
            <p>Lade deine Daten via JSON-Eingabe oder CSV-Upload hoch.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon">🫧</div>
            <h3>Visualisierung</h3>
            <p>Erlebe deine Daten als dynamische, farbige Bubble-Map.</p>
          </div>
        </div>

        <button className="cta-btn" onClick={() => navigate('/create')}>
          <span>Jetzt starten</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

