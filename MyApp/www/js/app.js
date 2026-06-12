// ---- 1. Configuration & Data Loading ----
let CONFIG_ICS_URL = null;
let CONFIG_TIMEZONE = 'America/Edmonton'; 

function getNativeIcsPath() {
    if (window.cordova) {
        // App sandbox fallback path for automatic startup load
        return cordova.file.dataDirectory + 'myschedule.ics';
    } else if (window.Capacitor) {
        return 'myschedule.ics'; 
    }
    return './assets/data/myschedule.ics';
}

async function loadConfiguration() {
    try {
        CONFIG_ICS_URL = getNativeIcsPath();
        if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
            CONFIG_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
    } catch (e) {
        console.log('Error initializing configuration environment: ' + e.message);
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
            themeMode: 'LIGHT'
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

        this.loadFileBtn = document.getElementById('load-file-btn');
        this.loadFileBtn.addEventListener('click', () => this.chooseLocalFile());

        this.dateHeader = document.getElementById('date-header');
        this.detailsColumn = document.getElementById('details-column');
    }

    // Flexible Picker: Works across Internal Storage, SD Cards, Downloads, and Cloud Drives
    chooseLocalFile() {
        if (this.loadingLock) return;

        if (!window.cordova || !window.saf) {
            this.showErrorDialog("Environment Error", "Flexible Document Selector requires execution inside a native mobile bundle wrapper.");
            return;
        }

        this.statusLabel.textContent = 'Opening Storage Picker...';

        window.saf.openDocumentPicker({
            "mimeType": "text/calendar", 
            "multiple": false
        }, async (uri) => {
            try {
                this.statusLabel.textContent = 'Authenticating identity...';
                
                const isAuthenticated = await this._authenticateUserMobile();
                if (!isAuthenticated) {
                    throw new Error('Authentication failed or dismissed by user.');
                }

                this.statusLabel.textContent = 'Reading storage stream...';

                // Reads data directly via safe content stream stream identifiers
                window.saf.readDocument(uri, (fileContentText) => {
                    this.statusLabel.textContent = 'Parsing data...';
                    this.loadCalendarFromText(fileContentText);
                }, (readError) => {
                    this.showErrorDialog("Storage Access Error", "System access rules denied reading from this file location location.");
                    this.statusLabel.textContent = 'Ready';
                });

            } catch (authError) {
                this.statusLabel.textContent = 'Access Denied.';
                this.showErrorDialog('Security Check Failed', String(authError).replace('Error: ', ''));
            }

        }, (pickerError) => {
            this.statusLabel.textContent = 'Ready';
            console.log("User closed picking dialog workflow: " + pickerError);
        });
    }

    // Unified Calendar Text Parser
    loadCalendarFromText(icsText) {
        try {
            icsText = icsText.trim();

            if (!icsText.startsWith('BEGIN:VCALENDAR')) {
                throw new Error('The selected document data layout is not a valid iCalendar stream file structure.');
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
            this.displayShiftsForDate(new Date(), false);

        } catch (err) {
            this.showErrorDialog('Parsing Error', err.message);
            this.statusLabel.textContent = 'Processing error.';
        }
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

    // Handles default application sandbox initialization logic 
    async fetchCalendarData() {
        if (this.loadingLock) return;

        try {
            this.loadingLock = true;
            this.statusLabel.textContent = 'Checking sandbox access...';

            const isAuthenticated = await this._authenticateUserMobile();
            if (!isAuthenticated) throw new Error('Authentication failed.');

            let icsText = '';
            if (window.cordova) {
                icsText = await this._readLocalFileCordova(this.icsUrl);
            } else {
                const response = await fetch(this.icsUrl);
                icsText = await response.text();
            }

            this.loadingLock = false;
            this.loadCalendarFromText(icsText);

        } catch (err) {
            this.loadingLock = false;
            this.statusLabel.textContent = 'Ready';
            console.log("No initial sandbox schedule discovered. Awaiting user picker choices: " + err.message);
        }
    }

    onDateSelected(e) {
        if (this.loadingLock) return;

        let selectedValue = e.target ? e.target.value : this.datePicker.value;
        if (!selectedValue) return;

        if (typeof selectedValue === 'string') {
            try {
                const parts = selectedValue.split('-');
                if (parts.length === 3) {
                    // Timezone Shift Safe Parsing Implementation Logic
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
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };

        dialog.querySelector('#modal-ok-btn').addEventListener('click', closeDialog);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeDialog();
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

    _authenticateUserMobile() {
        return new Promise((resolve) => {
            if (window.Capacitor && window.Capacitor.Plugins.BiometricAuth) {
                window.Capacitor.Plugins.BiometricAuth.verifyBiometric({
                    reason: "Verify identity to access schedule data",
                    title: "Verification Required"
                }).then(() => resolve(true)).catch(() => resolve(false));
            } 
            else if (window.Fingerprint) {
                window.Fingerprint.show({
                    title: 'Verification Required',
                    description: 'Verify identity to access schedule data',
                    disableBackup: false
                }, () => resolve(true), () => resolve(false));
            } 
            else {
                console.warn("Biometrics context bypassed in desktop platform layout context.");
                resolve(true); 
            }
        });
    }

    _readLocalFileCordova(filePath) {
        return new Promise((resolve, reject) => {
            let standardizedPath = filePath;
            if (!standardizedPath.startsWith('file://')) {
                standardizedPath = 'file://' + standardizedPath;
            }

            window.resolveLocalFileSystemURL(standardizedPath, (fileEntry) => {
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

    async _readLocalFileCapacitor(fileName) {
        const { Filesystem, Directory } = window.Capacitor.Plugins;
        const contents = await Filesystem.readFile({
            path: fileName,
            directory: Directory.Data,
            encoding: 'utf8'
        });
        return contents.data;
    }
}

// ---- 3. Execution Lifecycle Initialization Loop ----
async function main() {
    await loadConfiguration();
    const app = new CalendarApp(CONFIG_ICS_URL, CONFIG_TIMEZONE);
    app.initializeLoad();
}

if (window.cordova) {
    document.addEventListener('deviceready', main, false);
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}