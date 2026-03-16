# Website
Backend: Node.js (ES-Modules), Express 5

Real-time: Socket.io, WebSockets (ws)

APIs: Twitch API Specialist (Twurple SDK: API, Auth, Chat, EventSub)

Databases: PostgreSQL (Relational), Redis (In-Memory/Caching)

DevOps/Infra: Nginx Reverse Proxy, SSL (Certbot), Image Processing (Sharp)

Scaletta - High Performance Twitch Alert System
Scaletta ist eine skalierbare Fullstack-Lösung für Twitch-Streamer, die Echtzeit-Alerts, Chat-Interaktionen und ein sicheres Dashboard zur Verwaltung bietet. Das Projekt legt einen besonderen Fokus auf Sicherheit (Privacy-by-Design) und Echtzeit-Performance.

🚀 Scaletta - High Performance Twitch Alert System
Scaletta ist eine skalierbare Fullstack-Lösung für Twitch-Streamer, die Echtzeit-Alerts, Chat-Interaktionen und ein sicheres Dashboard zur Verwaltung bietet. Das Projekt legt einen besonderen Fokus auf Sicherheit (Privacy-by-Design) und Echtzeit-Performance.

🛠 Tech Stack
Bereich	Technologien
Backend	Node.js (ES-Modules), Express 5 (Beta)
Echtzeit	Socket.io, WebSockets (ws)
APIs	Twurple (API, Auth, Chat, EventSub HTTP/WS)
Datenbank	PostgreSQL (Persistence), Redis (Caching/Performance)
Processing	Sharp (Image Processing), Multer (File Uploads)
Infrastruktur	Nginx (Reverse Proxy), Let's Encrypt (SSL)

✨ Key Features & Implementierung
1. Sicherheit & Privacy-First
Signierte Overlay-Keys: Overlay-URLs sind durch 64-Zeichen lange, kryptografisch signierte Hashes geschützt. Dies verhindert den unbefugten Zugriff auf Stream-Overlays.

Privacy-Dashboard: Sensible Daten (wie API-Keys) werden im Dashboard standardmäßig geblurrt und nur durch bewusste Nutzerinteraktion (Click-to-Unblur) sichtbar gemacht.

Secure Infrastructure: Die PostgreSQL-Datenbank und der Redis-Cache sind so konfiguriert, dass sie nur auf localhost lauschen und durch die Nginx-Firewall von außen isoliert sind.

2. Echtzeit-Architektur
Event-Pipeline: Integration der Twitch EventSub API. Eingehende Events (Follows, Subs, etc.) werden validiert und über eine robuste Queue-Logik in Millisekunden an die Client-Overlays verteilt.

Socket-Isolierung: Jeder Streamer erhält einen isolierten Socket-Raum, um Datensicherheit und Performance bei mehreren gleichzeitigen Nutzern zu gewährleisten.

3. Media & Performance
Dynamische Bildverarbeitung: Einsatz von sharp zur Optimierung von User-Uploads, um Ladezeiten in den Overlays zu minimieren.

Redis-Caching: Nutzung von Redis zur Reduzierung von Datenbank-Abfragen bei hochfrequenten Events.

⚙️ Infrastruktur (Nginx Setup)
Das System läuft hinter einem optimierten Nginx Reverse-Proxy.

WebSocket-Support: Spezielle Konfiguration der Upgrade- und Connection-Header für unterbrechungsfreie Streams.

Webhook-Forwarding: Gezielte Weiterleitung von Twitch-spezifischen Headern (X-Twitch-Eventsub-...) zur Validierung der API-Integrität.

📝 Kontakt
Name: zlKxZukii

Projekt: Scaletta.live

Status: Aktiv in Entwicklung für den produktiven Einsatz.