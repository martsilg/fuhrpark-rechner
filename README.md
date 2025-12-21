# E-Firmenwagen Rechner 🚗⚡

Interaktive Kostenanalyse für Elektro-Firmenwagen – berechnet die effektiven Kosten für Arbeitgeber und zeigt die Vorteile für Arbeitnehmer.

## Features

- **Interaktive Eingaben**: Alle Parameter wie Leasingrate, Laufzeit, Mitarbeiteranzahl etc. anpassbar
- **Live-Berechnung**: Ergebnisse aktualisieren sich sofort
- **Skalierungseffekt**: Graph zeigt Kosten von 20 bis 400 Mitarbeitern
- **Steuerminderung**: Berücksichtigt den Grenzsteuersatz (GmbH & Co. KG)
- **AN-Vorteile**: Vergleich mit selbst finanziertem Verbrenner

## Deployment auf Vercel

### Option 1: Via Vercel CLI

```bash
# Vercel CLI installieren
npm i -g vercel

# Im Projektordner deployen
cd fuhrpark-rechner
vercel
```

### Option 2: Via GitHub

1. Repository auf GitHub erstellen
2. Code pushen:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/DEIN-USERNAME/fuhrpark-rechner.git
   git push -u origin main
   ```
3. Auf [vercel.com](https://vercel.com) einloggen
4. "Add New Project" → GitHub Repository auswählen
5. "Deploy" klicken

### Option 3: Drag & Drop

1. `npm run build` ausführen
2. Den `dist` Ordner auf [vercel.com/new](https://vercel.com/new) ziehen

## Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build
```

## Anpassungen

Die Standardwerte basieren auf:
- VW ID.3 Pure (222€ netto/Monat)
- GmbH & Co. KG in NRW (45% Grenzsteuersatz)
- 20 Mitarbeiter

Alle Werte können in der App angepasst werden.

## Lizenz

MIT
