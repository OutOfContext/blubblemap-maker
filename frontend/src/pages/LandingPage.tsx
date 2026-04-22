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
          Verwandle deine Rohdaten in atemberaubende interaktive Bubble-Maps –
          oder extrahiere Skills aus CVs mit KI.
        </p>

        <div className="steps-preview">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon">🫧</div>
            <h3>BubbleMap</h3>
            <p>Visualisiere beliebige Datensätze als farbige, interaktive Bubble-Maps.</p>
          </div>
          <div className="step-arrow">·</div>
          <div className="step-card step-card-highlight">
            <div className="step-num">02</div>
            <div className="step-icon">🧠</div>
            <h3>SkillMap <span className="badge-new">Neu</span></h3>
            <p>Lade CVs hoch – KI extrahiert und clustert Skills automatisch.</p>
          </div>
          <div className="step-arrow">·</div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon">🔍</div>
            <h3>Team-Übersicht</h3>
            <p>Aggregiere Skills mehrerer Personen in einer riesigen interaktiven Map.</p>
          </div>
        </div>

        <button className="cta-btn" onClick={() => navigate('/projects')}>
          <span>Zu meinen Projekten</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
