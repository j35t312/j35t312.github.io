iCalendar Scheduler Viewer
![Version](https://img.shields.io/badge/version-1.0.7-blue.svg)
![Python](https://img.shields.io/badge/python->=3.10-green.svg)
An intuitive, lightweight, and responsive Progressive Web Application (PWA) designed to parse, display, and manage work schedules or events directly from iCalendar (`.ics`) files.
The client-side app offers interactive date jumping, custom time-zone formatting, persistent installation capabilities, and seamless cache-clearing updates.
---
🚀 Features
Interactive Inline Calendar: Effortlessly browse months, highlight the current day, and instantly identify days that have scheduled events.
Shift Details Breakdown: Displays cleanly designed shift cards with event names, parsed execution times, and location data.
Full PWA Support: Installable as a standalone app on desktop and mobile platforms, utilizing an assertive cache-first strategy for instant loading offline.
Intelligent Version Tracking: Features an in-app "Check for App Update" notification badge when asset versions mismatch, clearing obsolete service worker caches on demand.
Privacy Focused: Completely client-side execution; your uploaded `.ics` calendar files are read locally via `FileReader` and never transmitted to an external server.
---
🛠️ Project Structure
The project consists of the following key files:
File Name	Purpose
`index.html`	Core frontend UI layer, inline CSS styles, and application/update controller logic.
`sw.js`	Service Worker handles background pre-caching asset states for offline PWA compliance.
`manifest.json`	Configures native standalone rendering capabilities and maps application icons.
`prototype.toml`	Packaging manifest defining Python dependency scopes (`flet`) for alternative distribution.
---
⚙️ Tech Stack & Dependencies
Frontend Engine: Native HTML5, modern CSS custom properties, and Vanilla ES6 JavaScript Modules.
Calendar Engine: `ical.js` (v1.5.0) via CDN for componentized RFC 5545 specifications string parsing.
Material Design: Material Icon styling vectors pulled remotely from Google Fonts CDN.
System Integrations: Python configuration utilizing the `flet` framework ecosystem for desktop/web bindings.
---
💻 Getting Started
Web / Local Development
Because the application runs an active Service Worker, it requires a secure context (`https://`) or a local loopback server to initialize correctly.
Clone or download the source code files.
Run a simple local development server inside your project root:
```bash
   # Using Python 3
   python -m http.server 8000
   ```
Open `http://localhost:8000` in your browser.
Python / Flet Environment
If you intend to test or develop the application utilizing Python and the `flet` configuration specified in your `prototype.toml`:
Ensure you have Python `>=3.10` installed.
Install the necessary system dependencies:
```bash
   pip install .
   ```
Run the development environment with the Flet CLI:
```bash
   flet run
   ```
---
📖 Usage Guide
Upload File: Click the Upload ICS button on the home screen and select your exported `.ics` format schedule file.
Select Date: Click any date slot inside the calendar grid containing a small green event indicator dot to view detailed shift information.
Reset: Press the Refresh (⟳) action button to instantly snap your focused view back to today's active schedule.
Purge Data: Clicking the Exit (X) action button completely removes loaded schedule metrics from memory and clears the view safely.
---
🧑‍💻 Author & Maintenance
Author: Roel Rivera
GitHub Repository: j35t312.github.io
Contact Email: r2psycho@gmail.com
Copyright: Copyright © 2023-2026 by j35t312