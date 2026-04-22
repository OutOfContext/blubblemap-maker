# Beispiel-CVs für den BubbleMap SkillMap-Import

Dieses Verzeichnis enthält 5 fiktive Beispiel-CVs zum Testen des KI-gestützten
Skill-Extraktions-Features.

## Personen & Rollen

| Datei | Name | Rolle | Schwerpunkte |
|-------|------|-------|-------------|
| `max_mueller_fullstack.txt` | Max Müller | Senior Full-Stack Developer | Java, Spring Boot, React, PostgreSQL, AWS |
| `sofia_hartmann_ml_engineer.txt` | Sofia Hartmann | ML Engineer / Data Scientist | Python, PyTorch, HuggingFace, MLOps, GCP |
| `lukas_brandt_devops.txt` | Lukas Brandt | DevOps / Platform Engineer | Kubernetes, Terraform, AWS, Prometheus, GitOps |
| `aisha_kowalski_frontend.txt` | Aisha Kowalski | Frontend Developer & UX Engineer | React, Next.js, TypeScript, Tailwind, Framer Motion |
| `jonas_weber_backend.txt` | Jonas Weber | Backend Developer / Java Architect | Java, Spring, SQL + NoSQL DBs, Kafka, DDD |

## Verwendung

1. Starte den BubbleMap Maker (`docker compose up`)
2. Navigiere zu **Meine Projekte → SkillMap → Neu erstellen**
3. Benenne das Projekt z.B. „Entwicklerteam Demo"
4. Lade auf der Upload-Seite die `.txt`-Dateien nacheinander hoch
   (Tab „CV hochladen" – `.txt` wird als Plain-Text verarbeitet)
5. Öffne anschließend die **Gesamt-SkillMap** für die aggregierte Ansicht

## Erwartete Skill-Cluster (nach KI-Extraktion)

Die KI sollte folgende Cluster-Winkel-Bereiche vergeben:

- **~0–45°**: Frontend (React, TypeScript, Vue, Next.js)
- **~90°**: SQL-Datenbanken (PostgreSQL, MySQL, Oracle)
- **~135°**: Cloud / DevOps (AWS, GCP, Kubernetes, Terraform)
- **~180°**: Backend / JVM (Java, Spring Boot, Kotlin)
- **~225°**: ML / AI (PyTorch, scikit-learn, HuggingFace)
- **~270°**: NoSQL-Datenbanken (MongoDB, Redis, Cassandra, Elasticsearch)
- **~315°**: Soft Skills / Methodik (Agile, Leadership, Code Review)

Damit sollten SQL- und NoSQL-Datenbanken auf **gegenüberliegenden Seiten** der Map erscheinen,
genauso wie Frontend (~0°) und Backend (~180°).

