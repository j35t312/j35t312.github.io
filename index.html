<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Schedule Viewer</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/ical.js@1.5.0/build/ical.min.js"></script>
    <style>
        :root {
            --grey-600: #757575;
            --blue-accent: #448AFF;
            --red-accent: #FF5252;
            --green-800: #2E7D32;
            --grey-800: #424242;
            --blue-50: #E3F2FD;
            --blue-100: #BBDEFB;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 110px 10px 10px 10px;
            overflow-y: auto;
            background-color: #ffffff;
            color: #212121;
            min-height: 100vh;
        }

        #app {
            max-width: 600px;
            margin: 0 auto;
        }

        .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .header-title {
            font-size: 14px;
            font-weight: 600;
        }

        .header-actions {
            display: flex;
            gap: 4px;
        }

        .icon-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: none;
            background: transparent;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.2s;
            padding: 0;
        }

        .icon-btn:hover {
            background-color: rgba(0, 0, 0, 0.08);
        }

        .icon-btn .material-icons {
            font-size: 20px;
        }

        .icon-btn.refresh-btn .material-icons {
            color: var(--blue-accent);
        }

        .icon-btn.exit-btn .material-icons {
            color: var(--red-accent);
        }

        .select-date-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border: 1px solid #e0e0e0;
            background: #ffffff;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-family: inherit;
            transition: background-color 0.2s, box-shadow 0.2s;
            margin-bottom: 8px;
        }

        .select-date-btn:hover {
            background-color: #f5f5f5;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }

        .select-date-btn .material-icons {
            font-size: 18px;
            color: #616161;
        }

        #hidden-date-input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
            width: 0;
            height: 0;
        }

        .status-label {
            font-size: 12px;
            font-style: italic;
            color: var(--grey-600);
            margin-bottom: 8px;
        }

        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 10px 0;
            border: none;
        }

        .date-header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
        }

        .details-column {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
        }

        .shift-card {
            padding: 12px;
            background-color: var(--blue-50);
            border-radius: 8px;
            border: 1px solid var(--blue-100);
        }

        .shift-card .shift-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .shift-card .shift-time {
            font-size: 13px;
            color: var(--green-800);
            margin-bottom: 4px;
        }

        .shift-card .shift-location {
            font-size: 12px;
            color: var(--grey-800);
        }

        .no-shifts {
            padding: 10px;
            font-size: 13px;
            font-style: italic;
            color: #757575;
        }

        /* Alert Dialog / Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal-dialog {
            background: #ffffff;
            border-radius: 8px;
            padding: 24px;
            min-width: 280px;
            max-width: 400px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .modal-dialog .modal-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
        }

        .modal-dialog .modal-content {
            font-size: 12px;
            margin-bottom: 20px;
            color: #424242;
        }

        .modal-dialog .modal-actions {
            display: flex;
            justify-content: flex-end;
        }

        .modal-dialog .modal-ok-btn {
            padding: 8px 16px;
            border: none;
            background: transparent;
            color: #1976D2;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border-radius: 4px;
            text-transform: uppercase;
            font-family: inherit;
        }

        .modal-dialog .modal-ok-btn:hover {
            background-color: rgba(25, 118, 210, 0.08);
        }
    </style>
</head>
<body>
    <div id="app">
        <div class="header-row" id="header-row">
            <span class="header-title">Schedule Navigation</span>
            <div class="header-actions" id="header-actions">
                <button class="icon-btn refresh-btn" id="refresh-btn" title="Refresh Schedule">
                    <span class="material-icons">refresh</span>
                </button>
                <button class="icon-btn exit-btn" id="exit-btn" title="Exit Application">
                    <span class="material-icons">close</span>
                </button>
            </div>
        </div>
        <button class="select-date-btn" id="select-date-btn">
            <span class="material-icons">date_range</span>
            &#x1F4C5; Choose Date
        </button>
        <input type="date" id="hidden-date-input" min="2025-01-01" max="2030-12-31">
        <div class="status-label" id="status-label">Ready</div>
        <hr class="divider">
        <div class="date-header" id="date-header">Select a date</div>
        <div class="details-column" id="details-column"></div>
    </div>

    <script>
        // ---- 1. Configuration & Data Loading ----
        let CONFIG_ICS_URL = null;
        let CONFIG_TIMEZONE = 'America/Edmonton'; // Fallback default

        function getNativeIcsPath() {
            if (window.cordova) {
                // Persistent application storage sandbox path for Cordova
                return cordova.file.dataDirectory + 'myschedule.ics';
            } else if (window.Capacitor) {
                // Name handle for Capacitor filesystems
                return 'myschedule.ics'; 
            }
            // Standard relative path web fallback
            return './assets/data/myschedule.ics';
        }

        async function loadConfiguration() {
            try {
                // Automatically assign targeted calendar structure path
                CONFIG_ICS_URL = getNativeIcsPath();

                // Dynamic timezone extraction based on native system regional settings
                if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
                    CONFIG_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
                }
            } catch (e) {
                console.log('Error initializing environment security paths: ' + e.message);
            }
        }

        // ---- ICS Calendar wrapper ----
        class Calendar {
            constructor(icsText) {
                this.events = [];
                this._parse(icsText);
            }

            _parse(icsText) {
                const jcalData = ICAL.parse(icsText);
                const component = new ICAL.Component(jcalData);
                const vevents = component.getAllSubcomponents('vevent');

                for (const vevent of vevents) {
                    const icalEvent = new ICAL.Event(vevent);
                    this.events.push({
                        begin: { datetime: icalEvent.startDate.toJSDate() },
                        end: { datetime: icalEvent.endDate.toJSDate() },
                        name: icalEvent.summary || '',
                        location: icalEvent.location || ''
                    });
                }
            }
        }

        // ---- 2. Application UI and Logic ----
        class CalendarApp {
            constructor(urlAddress, timezone) {
                this.icsUrl = urlAddress;
                this.eventsByDate = {};
                this.localTz = timezone || 'America/Edmonton';

                this.loadingLock = false;

                this.page = {
                    title: 'Schedule Viewer',
                    themeMode: 'LIGHT',
                    padding: { left: 10, top: 110, right: 10, bottom: 10 },
                    scroll: 'AUTO',
                    update: () => {}
                };

                document.title = this.page.title;
                this.createWidgets();
            }

            createWidgets() {
                this.datePicker = document.getElementById('hidden-date-input');
                this.datePicker.addEventListener('change', (e) => this.onDateSelected(e));

                this.selectDateBtn = document.getElementById('select-date-btn');
                this.selectDateBtn.addEventListener('click', () => this.openDatePicker());

                this.statusLabel = document.getElementById('status-label');

                this.refreshBtn = document.getElementById('refresh-btn');
                this.refreshBtn.addEventListener('click', (e) => this.triggerRefresh(e));

                this.exitBtn = document.getElementById('exit-btn');
                this.exitBtn.addEventListener('click', (e) => this.exitApplication(e));

                this.dateHeader = document.getElementById('date-header');
                this.detailsColumn = document.getElementById('details-column');
            }

            openDatePicker() {
                if (typeof this.datePicker.showPicker === 'function') {
                    this.datePicker.showPicker();
                } else {
                    this.datePicker.focus();
                    this.datePicker.click();
                }
            }

            exitApplication(e) {
                if (typeof window.close === 'function') {
                    window.close();
                }
            }

            initializeLoad() {
                if (this.icsUrl) {
                    this.statusLabel.textContent = 'Connecting...';
                    this.fetchCalendarData();
                } else {
                    this.statusLabel.textContent = 'Error: No calendar path configured.';
                }
            }

            triggerRefresh(e) {
                if (!this.loadingLock && this.icsUrl) {
                    this.statusLabel.textContent = 'Refreshing...';
                    this.detailsColumn.innerHTML = '';
                    this.fetchCalendarData();
                }
            }

            async fetchCalendarData() {
                if (this.loadingLock) {
                    return;
                }

                try {
                    this.loadingLock = true;
                    this.statusLabel.textContent = 'Authenticating...';

                    // Step 1: Force User Biometric Check via OS Hooks
                    const isAuthenticated = await this._authenticateUserMobile();
                    if (!isAuthenticated) {
                        throw new Error('Authentication failed or dismissed by user.');
                    }

                    this.statusLabel.textContent = 'Reading storage...';
                    let icsText = '';

                    // Step 2: Handle Native file systems vs browser fallbacks
                    if (window.cordova) {
                        icsText = await this._readLocalFileCordova(this.icsUrl);
                    } else if (window.Capacitor) {
                        icsText = await this._readLocalFileCapacitor(this.icsUrl);
                    } else {
                        // Web fallback for development/testing
                        const response = await fetch(this.icsUrl);
                        if (!response.ok) {
                            throw new Error('HTTP error! Status: ' + response.status);
                        }
                        icsText = await response.text();
                    }

                    icsText = icsText.trim();

                    if (!icsText.startsWith('BEGIN:VCALENDAR')) {
                        throw new Error('The target file is not a valid iCalendar feed.');
                    }

                    const calendar = new Calendar(icsText);
                    const temporaryEvents = {};

                    for (const event of calendar.events) {
                        const localBegin = event.begin.datetime; 
                        const dateStr = this._formatDateInTimezone(localBegin, this.localTz);
                        if (!temporaryEvents[dateStr]) {
                            temporaryEvents[dateStr] = [];
                        }
                        temporaryEvents[dateStr].push(event);
                    }

                    this.eventsByDate = temporaryEvents;
                    this.statusLabel.textContent = 'Loaded ' + calendar.events.length + ' shifts.';
                    this.loadingLock = false;

                    this.displayShiftsForDate(new Date(), false);

                } catch (err) {
                    this.loadingLock = false;
                    this.statusLabel.textContent = 'Access Denied.';
                    this.showErrorDialog('Security & Access Error', String(err).replace('Error: ', ''));
                }
            }

            onDateSelected(e) {
                if (this.loadingLock) {
                    return;
                }

                let selectedValue = e.target ? e.target.value : this.datePicker.value;
                if (!selectedValue) {
                    return;
                }

                if (typeof selectedValue === 'string') {
                    try {
                        const parts = selectedValue.split('-');
                        if (parts.length === 3) {
                            selectedValue = new Date(
                                parseInt(parts[0]),
                                parseInt(parts[1]) - 1,
                                parseInt(parts[2])
                            );
                        } else {
                            const isoStr = selectedValue.replace('Z', '+00:00');
                            selectedValue = new Date(isoStr);
                        }
                    } catch (parseErr) {
                        return;
                    }
                }

                this.displayShiftsForDate(selectedValue, true);
            }

            displayShiftsForDate(targetDate, explicitUpdate) {
                const dateKey = this._formatDateInTimezone(targetDate, this.localTz);
                this.dateHeader.textContent = this._formatDateHeader(targetDate, this.localTz);
                this.detailsColumn.innerHTML = '';

                if (dateKey in this.eventsByDate) {
                    const dayEvents = [...this.eventsByDate[dateKey]].sort(
                        (a, b) => a.begin.datetime - b.begin.datetime
                    );

                    for (const ev of dayEvents) {
                        const localBegin = ev.begin.datetime;
                        const localEnd = ev.end.datetime;

                        const startTime = this._formatTimeInTimezone(localBegin, this.localTz);
                        const endTime = this._formatTimeInTimezone(localEnd, this.localTz);
                        const location = ev.location ? ev.location : 'Not Specified';

                        const shiftCard = document.createElement('div');
                        shiftCard.className = 'shift-card';
                        shiftCard.innerHTML =
                            '<div class="shift-name">&#x1F4BC; ' + this._escapeHtml(ev.name) + '</div>' +
                            '<div class="shift-time">&#x23F0; ' + this._escapeHtml(startTime) + ' - ' + this._escapeHtml(endTime) + '</div>' +
                            '<div class="shift-location">&#x1F4CD; Location: ' + this._escapeHtml(location) + '</div>';

                        this.detailsColumn.appendChild(shiftCard);
                    }
                } else {
                    const noShiftsDiv = document.createElement('div');
                    noShiftsDiv.className = 'no-shifts';
                    noShiftsDiv.textContent = 'No shifts scheduled for this day.';
                    this.detailsColumn.appendChild(noShiftsDiv);
                }
            }

            showErrorDialog(title, message) {
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';

                const dialog = document.createElement('div');
                dialog.className = 'modal-dialog';
                dialog.innerHTML =
                    '<div class="modal-title">' + this._escapeHtml(title) + '</div>' +
                    '<div class="modal-content">' + this._escapeHtml(message) + '</div>' +
                    '<div class="modal-actions">' +
                    '<button class="modal-ok-btn" id="modal-ok-btn">OK</button>' +
                    '</div>';

                overlay.appendChild(dialog);
                document.body.appendChild(overlay);

                const closeDialog = () => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                };

                dialog.querySelector('#modal-ok-btn').addEventListener('click', closeDialog);
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        closeDialog();
                    }
                });
            }

            _formatDateInTimezone(date, timezone) {
                const formatter = new Intl.DateTimeFormat('en-CA', {
                    timeZone: timezone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                return formatter.format(date);
            }

            _formatDateHeader(date, timezone) {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: timezone,
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                return formatter.format(date);
            }

            _formatTimeInTimezone(date, timezone) {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: timezone,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                return formatter.format(date);
            }

            _escapeHtml(str) {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            }

            // ---- Native Platform Core Helpers ----

            // Dispatches Biometric Validation Requests across Android and iOS 
            _authenticateUserMobile() {
                return new Promise((resolve) => {
                    // Capacitor Implementation
                    if (window.Capacitor && window.Capacitor.Plugins.BiometricAuth) {
                        window.Capacitor.Plugins.BiometricAuth.verifyBiometric({
                            reason: "Verify your identity to access your schedule files",
                            title: "Identity Verification Required"
                        }).then(() => resolve(true)).catch(() => resolve(false));
                    } 
                    // Cordova Implementation
                    else if (window.Fingerprint) {
                        window.Fingerprint.show({
                            title: 'Identity Verification Required',
                            description: 'Verify your identity to access your schedule files',
                            disableBackup: false
                        }, 
                        () => resolve(true), 
                        () => resolve(false));
                    } 
                    // Fallback for general web testing environment 
                    else {
                        console.warn("Biometrics context not found in desktop web environment.");
                        resolve(true); 
                    }
                });
            }

            // Reads files safely out of Cordova filesystem mappings
            _readLocalFileCordova(filePath) {
                return new Promise((resolve, reject) => {
                    window.resolveLocalFileSystemURL(filePath, (fileEntry) => {
                        fileEntry.file((file) => {
                            const reader = new FileReader();
                            reader.onloadend = function() {
                                resolve(this.result);
                            };
                            reader.onerror = reject;
                            reader.readAsText(file);
                        }, reject);
                    }, reject);
                });
            }

            // Reads files safely via Capacitor Filesystem API
            async _readLocalFileCapacitor(fileName) {
                const { Filesystem, Directory } = window.Capacitor.Plugins;
                const contents = await Filesystem.readFile({
                    path: fileName,
                    directory: Directory.Data, // Secure Application Sandbox
                    encoding: 'utf8'
                });
                return contents.data;
            }
        }

        // ---- 3. Execution ----
        async function main() {
            await loadConfiguration();
            const app = new CalendarApp(CONFIG_ICS_URL, CONFIG_TIMEZONE);
            app.initializeLoad();
        }

        document.addEventListener('DOMContentLoaded', function() {
            main();
        });
    </script>
</body>
</html>
