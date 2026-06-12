/**
 * Schedule Viewer - Cordova App Logic
 */

// --- Constants & Configuration ---
const FILE_NAME = "schedule.ics";

// --- Global App State ---
let appState = {
    selectedDate: null, // Date object
    allEvents: []       // Parsed event objects
};

// --- DOM Elements ---
const el = {
    loadFileBtn: document.getElementById('load-file-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    exitBtn: document.getElementById('exit-btn'),
    selectDateBtn: document.getElementById('select-date-btn'),
    dateInput: document.getElementById('hidden-date-input'),
    statusLabel: document.getElementById('status-label'),
    dateHeader: document.getElementById('date-header'),
    detailsColumn: document.getElementById('details-column')
};

// --- Initialization ---
document.addEventListener('deviceready', onDeviceReady, false);

// Fallback initialization if running outside of Cordova (e.g., standard browser testing)
setTimeout(() => {
    if (!window.cordova) {
        updateStatus("Running in browser environment.");
        initAppListeners();
        // Fallback mock loader for layout testing
        el.loadFileBtn.addEventListener('click', handleBrowserFileSelect);
    }
}, 1000);

function onDeviceReady() {
    updateStatus("Cordova initialized. Loading storage...");
    initAppListeners();
    
    // Automatically try to load the file on startup
    loadIcsFile();
}

/**
 * Binds DOM event listeners
 */
function initAppListeners() {
    // Top Bar Controls
    el.loadFileBtn.addEventListener('click', () => {
        if (window.cordova) {
            pickAndCopyLocalFile();
        } else {
            showModal("Feature Notice", "File system picker requires running on a mobile device or simulator.");
        }
    });

    el.refreshBtn.addEventListener('click', () => {
        loadIcsFile();
    });

    el.exitBtn.addEventListener('click', () => {
        if (navigator.app && navigator.app.exitApp) {
            navigator.app.exitApp();
        } else {
            showModal("Application Exit", "Exit execution called (Not supported in standard browsers).");
        }
    });

    // Date Picker Controls
    el.selectDateBtn.addEventListener('click', () => {
        el.dateInput.showPicker ? el.dateInput.showPicker() : el.dateInput.click();
    });

    el.dateInput.addEventListener('change', (e) => {
        if (e.target.value) {
            // Fix timezone shifting issue with input[type="date"]
            const [year, month, day] = e.target.value.split('-').map(Number);
            appState.selectedDate = new Date(year, month - 1, day);
            
            renderScheduleForSelectedDate();
        }
    });
}

// --- Data Operations & Processing ---

/**
 * Loads and processes the targeted schedule.ics file using Cordova File Plugin APIs
 */
function loadIcsFile() {
    if (!window.cordova) {
        updateStatus("Ready (No file loaded)");
        return;
    }

    updateStatus("Locating schedule file...");
    
    // Target Application Data Directory (Private but persistent)
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (dirEntry) => {
        dirEntry.getFile(FILE_NAME, { create: false }, (fileEntry) => {
            fileEntry.file((file) => {
                const reader = new FileReader();
                reader.onloadend = function() {
                    parseIcalData(this.result);
                };
                reader.readAsText(file);
            }, (err) => handleFileError("Error reading target file source", err));
        }, (err) => {
            updateStatus(`No active '${FILE_NAME}' found. Use the folder icon to import one.`);
        });
    }, (err) => handleFileError("Error accessing local directory storage", err));
}

/**
 * Uses ical.js to map raw .ics format data into standard UI structures
 */
function parseIcalData(rawText) {
    try {
        updateStatus("Parsing calendar contents...");
        const jcalData = ICAL.parse(rawText);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        appState.allEvents = vevents.map(vevent => {
            const event = new ICAL.Event(vevent);
            return {
                summary: event.summary || "Unnamed Shift / Event",
                location: event.location || "No location specified",
                // Get JavaScript native dates
                startDate: event.startDate.toJSDate(),
                endDate: event.endDate.toJSDate()
            };
        });

        updateStatus(`Successfully imported ${appState.allEvents.length} events.`);
        
        // Refresh view UI if a date was already selected
        if (appState.selectedDate) {
            renderScheduleForSelectedDate();
        } else {
            // Default select current day if within bounds
            appState.selectedDate = new Date();
            renderScheduleForSelectedDate();
        }

    } catch (e) {
        console.error(e);
        showModal("Parsing Failure", "The chosen file isn't a valid iCalendar format standard.");
        updateStatus("Parsing error encountered.");
    }
}

// --- Dynamic Rendering Logic ---

/**
 * Filters the compiled state data arrays and draws UI elements dynamically
 */
function renderScheduleForSelectedDate() {
    const d = appState.selectedDate;
    if (!d) return;

    // Standard long localized format
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    el.dateHeader.textContent = d.toLocaleDateString(undefined, options);

    // Clear old container data nodes safely
    el.detailsColumn.innerHTML = '';

    // Filter elements matching calendar target date metrics
    const targetedShifts = appState.allEvents.filter(event => {
        return event.startDate.getFullYear() === d.getFullYear() &&
               event.startDate.getMonth() === d.getMonth() &&
               event.startDate.getDate() === d.getDate();
    });

    // Handle Empty Arrays
    if (targetedShifts.length === 0) {
        const fallbackNode = document.createElement('div');
        fallbackNode.className = 'no-shifts';
        fallbackNode.textContent = "No shifts scheduled for this day.";
        el.detailsColumn.appendChild(fallbackNode);
        return;
    }

    // Sort sequential array timelines chronologically
    targetedShifts.sort((a, b) => a.startDate - b.startDate);

    // Iterate structural card attachments
    targetedShifts.forEach(shift => {
        const timeStr = `${formatTime(shift.startDate)} - ${formatTime(shift.endDate)}`;
        
        const cardNode = document.createElement('div');
        cardNode.className = 'shift-card';
        
        cardNode.innerHTML = `
            <div class="shift-name">${escapeHTML(shift.summary)}</div>
            <div class="shift-time">${timeStr}</div>
            <div class="shift-location">${escapeHTML(shift.location)}</div>
        `;
        
        el.detailsColumn.appendChild(cardNode);
    });
}

// --- Device File Picker Utilities ---

/**
 * Handles picking an external .ics file and copying it to the local working path
 */
function pickAndCopyLocalFile() {
    // Checks standard ecosystem plugins for actions safely
    if (window.plugins && window.plugins.FilePicker) {
        window.plugins.FilePicker.pickFile((uri) => {
            copyPickedFileToAppSpace(uri);
        }, (err) => {
            console.log("User aborted picking file action", err);
        }, "text/calendar");
    } else {
        showModal("System Limitation", "External file picker plugin is missing or unlinked.");
    }
}

function copyPickedFileToAppSpace(sourceUri) {
    window.resolveLocalFileSystemURL(sourceUri, (fileEntry) => {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (dirEntry) => {
            fileEntry.copyTo(dirEntry, FILE_NAME, (copiedEntry) => {
                showModal("Import Complete", "File imported into application workspace successfully.");
                loadIcsFile();
            }, (err) => handleFileError("Error copying file to app storage", err));
        }, (err) => handleFileError("Destination workspace missing", err));
    }, (err) => handleFileError("Target source file resolution failure", err));
}

// --- Fallbacks & Helper Functions ---

function handleBrowserFileSelect() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function() {
            parseIcalData(this.result);
        };
        reader.readAsText(file);
    };
    input.click();
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function updateStatus(msg) {
    el.statusLabel.textContent = msg;
}

function handleFileError(context, error) {
    console.error(`${context}: `, error);
    updateStatus(`Error executing filesystem actions.`);
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/**
 * Custom application alert overlay builder matching application layout
 */
function showModal(title, text) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    overlay.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-title">${escapeHTML(title)}</div>
            <div class="modal-content">${escapeHTML(text)}</div>
            <div class="modal-actions">
                <button class="modal-ok-btn">OK</button>
            </div>
        </div>
    `;
    
    overlay.querySelector('.modal-ok-btn').addEventListener('click', () => {
        overlay.remove();
    });
    
    document.body.appendChild(overlay);
}