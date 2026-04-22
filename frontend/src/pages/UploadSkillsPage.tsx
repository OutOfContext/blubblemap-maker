import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { extractCv, extractProfile, getSkillMapPersons, deletePerson } from '../api/projectApi';
import type { SkillMapPerson } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import './UploadSkillsPage.css';

type Tab = 'cv' | 'profile';

export default function UploadSkillsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>('cv');
  const [persons, setPersons] = useState<SkillMapPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<SkillMapPerson | null>(null);

  // CV form
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvName, setCvName] = useState('');

  // Profile form
  const [profileName, setProfileName] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [profileText, setProfileText] = useState('');

  useEffect(() => {
    if (!projectId) return;
    getSkillMapPersons(projectId)
      .then(setPersons)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleCvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile || !projectId) return;
    setExtracting(true); setError('');
    try {
      const person = await extractCv(projectId, cvFile, cvName);
      setPersons((prev) => [...prev, person]);
      setCvFile(null); setCvName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Extraktion fehlgeschlagen');
    } finally {
      setExtracting(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || (!profileUrl && !profileText)) return;
    setExtracting(true); setError('');
    try {
      const person = await extractProfile(projectId, {
        name: profileName,
        url: profileUrl,
        text: profileText,
      });
      setPersons((prev) => [...prev, person]);
      setProfileName(''); setProfileUrl(''); setProfileText('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Extraktion fehlgeschlagen');
    } finally {
      setExtracting(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete || !projectId) return;
    try {
      await deletePerson(projectId, toDelete.id);
      setPersons((prev) => prev.filter((p) => p.id !== toDelete.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    } finally {
      setToDelete(null);
    }
  };

  const sourceLabel: Record<string, string> = { CV: '📄 CV', LINKEDIN: '💼 LinkedIn', FIVERR: '🟢 Fiverr', MANUAL: '✏️ Manuell' };

  return (
    <div className="upload-page">
      <div className="upload-bg"><div className="orb orb-a" /><div className="orb orb-b" /></div>

      <div className="upload-content">
        {/* Step Indicator */}
        <div className="step-indicator">
          <div className="step done"><span>✓</span><label>Projekt</label></div>
          <div className="step-line active" />
          <div className="step active"><span>2</span><label>Profile</label></div>
          <div className="step-line" />
          <div className="step"><span>3</span><label>SkillMap</label></div>
        </div>

        <div className="upload-grid">
          {/* Left: Upload Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">📥</div>
              <div>
                <h2>Profil hinzufügen</h2>
                <p>Lade ein CV hoch oder füge Profiltext ein. Die KI extrahiert automatisch die Skills.</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="tab-bar">
              <button className={tab === 'cv' ? 'tab active' : 'tab'} onClick={() => setTab('cv')}>📄 CV hochladen</button>
              <button className={tab === 'profile' ? 'tab active' : 'tab'} onClick={() => setTab('profile')}>✏️ Text einfügen</button>
            </div>

            {tab === 'cv' && (
              <form onSubmit={handleCvSubmit} className="upload-form">
                <div className="form-group">
                  <label>CV-Datei (PDF oder DOCX) *</label>
                  <div
                    className={`drop-zone ${cvFile ? 'has-file' : ''}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setCvFile(f); }}
                  >
                    {cvFile ? (
                      <><span className="file-icon">📄</span><span className="file-name">{cvFile.name}</span></>
                    ) : (
                      <><span className="drop-icon">⬆️</span><span>Datei hierher ziehen oder klicken</span><span className="drop-hint">PDF, DOCX – max. 20 MB</span></>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.docx" hidden onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="form-group">
                  <label>Name der Person (optional)</label>
                  <input type="text" placeholder="Wird aus dem CV erkannt wenn leer" value={cvName} onChange={(e) => setCvName(e.target.value)} />
                </div>
                {error && <div className="error-box">⚠ {error}</div>}
                <button type="submit" className="btn-primary" disabled={!cvFile || extracting}>
                  {extracting ? <><span className="spinner" /> KI analysiert CV...</> : <>🧠 Skills extrahieren</>}
                </button>
              </form>
            )}

            {tab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="upload-form">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" placeholder="Name der Person" required value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Profil-URL (optional)</label>
                  <input type="url" placeholder="https://linkedin.com/in/..." value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Profiltext *</label>
                  <textarea
                    placeholder="Füge den kopierten Text des LinkedIn/Fiverr-Profils oder eines anderen Profils hier ein..."
                    rows={7}
                    required
                    value={profileText}
                    onChange={(e) => setProfileText(e.target.value)}
                  />
                </div>
                {error && <div className="error-box">⚠ {error}</div>}
                <button type="submit" className="btn-primary" disabled={extracting}>
                  {extracting ? <><span className="spinner" /> KI analysiert Profil...</> : <>🧠 Skills extrahieren</>}
                </button>
              </form>
            )}
          </div>

          {/* Right: Persons List */}
          <div className="card persons-card">
            <div className="card-header">
              <div className="card-icon">👥</div>
              <div>
                <h2>Hinzugefügte Personen</h2>
                <p>{persons.length} {persons.length === 1 ? 'Person' : 'Personen'} im Projekt</p>
              </div>
            </div>

            {loading && <div className="persons-loading"><div className="spinner" /></div>}

            {!loading && persons.length === 0 && (
              <div className="persons-empty">
                <p>Noch keine Profile hinzugefügt.</p>
              </div>
            )}

            <div className="persons-list">
              {persons.map((p) => (
                <div key={p.id} className="person-item">
                  <div className="person-info">
                    <span className="person-name">{p.name}</span>
                    <span className="person-meta">
                      {sourceLabel[p.sourceType] ?? p.sourceType} · {p.skillCount} Skills
                    </span>
                  </div>
                  <div className="person-actions">
                    <button className="person-view-btn" onClick={() => navigate(`/skillmap/${projectId}/person/${p.id}`)}>
                      Ansehen →
                    </button>
                    <button className="person-delete-btn" onClick={() => setToDelete(p)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {persons.length > 0 && (
              <div className="persons-footer">
                <button className="btn-primary" onClick={() => navigate(`/skillmap/${projectId}/search`)}>
                  🗺 Zur Gesamt-SkillMap →
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="upload-nav">
          <button className="btn-secondary" onClick={() => navigate('/projects')}>← Zur Übersicht</button>
          {persons.length > 0 && (
            <button className="btn-primary" onClick={() => navigate(`/skillmap/${projectId}/search`)}>
              Zur SkillMap →
            </button>
          )}
        </div>
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Person entfernen?"
          message={`„${toDelete.name}" und alle extrahierten Skills werden gelöscht.`}
          confirmLabel="Entfernen"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

