# iCalendar Scheduler Viewer

A lightweight, high-performance **Progressive Web App (PWA)** designed to parse and view `.ics` (iCalendar) schedule files. It features an elegant inline calendar view, offline capability via a custom Service Worker, timezone-aware scheduling (defaulted to `America/Edmonton`), and robust asset management. Additionally, the project includes configurations for packaging or extending via the **Flet** Python framework.

## 🚀 Key Features

- **Local iCalendar (.ics) Parsing:** Securely reads and displays calendar schedules locally using `ical.js` without uploading sensitive data to an external server.
- **Interactive Inline Calendar:** Seamless monthly grid navigation complete with visual day indicators (dots) representing active shifts or events.
- **PWA Ready & Offline First:** Fully functional offline after initial load, powered by a customized, cache-first Service Worker (`sw.js`). Includes an embedded web app manifest for a native-like desktop and mobile app experience.
- **Automatic Asset Sync & Version Management:** Built-in client-to-service-worker communication channels that trigger explicit app updates when version mismatches are found.
- **Cross-Platform Potential:** Includes setup files (`pyproject.toml`) configured for **Flet**, paving the way for multi-platform desktop/mobile wrapping.

## 📂 Project Architecture

```bash
├── index.html          # Core frontend view, inline CSS styles, and application logic
├── manifest.json       # PWA Manifest providing identity, themes, and application icons
├── sw.js               # Cache-first Service Worker facilitating offline access and updates
└── pyproject.toml      # Project configuration and dependency profiles for Python Flet
```

### Components Deep-Dive

1. **`index.html`**:
   - Implements a modern single-page UI styled with clean material guidelines.
   - Houses the core encapsulation classes: `Calendar` (wrapper around `ical.js`) and `CalendarApp` (handles views, event handling, dates, and timezone formatting).
   - Dynamically group events by local timezone boundaries (`en-CA` formatting rules).
2. **`manifest.json`**:
   - Provisions parameters like orientation (`portrait`), display mode (`standalone`), and theme metrics (`#448AFF`).
   - Identifies authorship under **Roel Rivera** (`j35t312`).
3. **`sw.js`**:
   - Manages an independent lifecycle (`install`, `activate`, `fetch`) pre-caching core local assets and external resources like Material Fonts and CDN scripts.
   - Exposes an advanced message handler (`FORCE_UPDATE`) to invalidate outdated caching mechanisms upon user request.
4. **`pyproject.toml`**:
   - Configures packaging variables for the Python package pipeline (`flet` framework) to cross-compile or extend the engine.

## 🛠️ Getting Started

### 1. Web / PWA Deployment (Recommended)
Simply host the root folder containing `index.html`, `manifest.json`, and `sw.js` on any static provider (GitHub Pages, Vercel, Netlify, or a local server).

To spin up a local instance:
```bash
# Using Python's built-in HTTP server
python -m http.server 8000
```
Open your browser and navigate to `http://localhost:8000`.

### 2. Python / Flet Environment Setup
If you are developing or wrapping the viewer using the Python cross-platform bundle setup:

```bash
# Ensure you are using Python >= 3.10
# Install dependencies using your preferred package manager (e.g., pip, pdm, or poetry)
pip install flet

# Run or bundle the app via Flet CLI tools if desired
flet run
```

## 📋 Usage Instructions

1. **Upload Schedule:** Click **"Upload ICS"** and choose your valid `.ics` calendar profile.
2. **Date Navigation:** Click individual numbers on the interactive grid calendar to view corresponding shifts. Days holding scheduled events contain a green dot indicator.
3. **Reset State:** Click the **Refresh** icon to snap your view grid directly back to the current date.
4. **Purge Cache & Reset:** Click the **Close/Exit** icon to completely clear internal state data, detach cached models, and return to an initial fresh initialization context.
5. **App Version Upgrades:** When an upgrade arrives, a specialized system update notification trigger highlights. Click to pull fresh remote assets directly to your device storage.

## ⚖️ License & Credits

- Developed by **Roel Rivera** ([j35t312](https://github.com/j35t312/j35t312.github.io)).
- Utilizes the [ical.js](https://github.com/mozilla-comm/ical.js) library for robust calendar parsing.
- Built using Google Material Design language guidelines.