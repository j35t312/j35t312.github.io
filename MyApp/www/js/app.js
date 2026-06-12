/**
 * Schedule Viewer - Hybrid Calendar Engine
 * Features: Full Month UI, Smart Sandbox Fallback & Regex Recovery Parsing.
 */

const FILE_NAME = "schedule.ics";

// --- Global App State Management ---
let appState = {
    currentViewDate: new Date(), // Tracks calendar page month
    selectedDate: new Date(),    // Tracks user-clicked target date
    allEvents: []                // Parsed shift entries storage
};

// --- DOM Nodes Cache Map ---
const el = {
    loadFileBtn: document.getElementById('load-file-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    exitBtn: document.getElementById('exit-btn'),
    prevMonthBtn: document.getElementById('prev-month-btn'),
    nextMonthBtn: document.getElementById('next-month-btn'),
    monthLabel: document.getElementById('month-label'),
    calendarGrid: document.getElementById('calendar-grid'),
    dayDetailsTitle: document.getElementById('day-details-title'),
    detailsColumn: document.getElementById('details-column'),
    statusLabel: document.getElementById('status-label')
};

// --- Initialization Lifecycle ---
document.addEventListener('deviceready', onDeviceReady, false);

// Fallback loader if running inside standard desktop browsers
setTimeout(() => {
    if (!window.cordova) {
        updateStatus("Running in browser environment.");
        initAppListeners();
        renderCalendarGrid();
    }
}, 1000);

function onDeviceReady() {
    updateStatus("Cordova initialized. Loading storage...");
    initAppListeners();
    loadIcsFile();
}

/**
 * Attaches operational click handlers
 */
function initAppListeners() {
    // Smart Router Trigger Link
    el.loadFileBtn.addEventListener('click', () => {
        handleFileSelectionRoute();
    });

    el.refreshBtn.addEventListener('click', () => {
        if (window.cordova) {
            loadIcsFile();
        } else {
            updateStatus("File refresh must be triggered manually via picker in browser mode.");
        }
    });

    el.exitBtn.addEventListener('click', () => {
        if (navigator.app && navigator.app.exitApp) {
            navigator.app.exitApp();
        } else {
            showModal("Application Exit", "Exit execution called (Not supported in standard browsers).");
        }
    });

    // Month Navigation Hooks
    el.prevMonthBtn.addEventListener('click', () => {
        appState.currentViewDate.setMonth(appState.currentViewDate.getMonth() - 1);
        renderCalendarGrid();
    });

    el.nextMonthBtn.addEventListener('click', () => {
        appState.currentViewDate.setMonth(appState.currentViewDate.getMonth() + 1);
        renderCalendarGrid();
    });
}

// --- Dynamic File Selection Routing (Option B) ---

function handleFileSelectionRoute() {
    if (window.cordova) {
        pickAndCopyNativeFile();
    } else {
        console.warn("Native runtime missing. Operating web sandbox file selector fallback.");
        launchBrowserFileFallback();
    }
}

function launchBrowserFileFallback() {
    const inputNode = document.createElement('input');
    inputNode.type = 'file';
    inputNode.accept = '.ics';
    inputNode.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        updateStatus(`Loading local text stream: ${file.name}`);
        const reader = new FileReader();
        reader.onload = function() {
            parseIcalData(this.result);
        };
        reader.readAsText(file);
    };
    inputNode.click();
}

function pickAndCopyNativeFile() {
    if (window.plugins && window.plugins.FilePicker) {
        window.plugins.FilePicker.pickFile((uri) => {
            copyPickedFileToAppSpace(uri);
        }, (err) => console.log("User canceled file integration.", err), "text/calendar");
    } else {
        showModal("Plugin Error", "The external FilePicker plugin package is missing or unlinked.");
    }
}

function copyPickedFileToAppSpace(sourceUri) {
    window.resolveLocalFileSystemURL(sourceUri, (fileEntry) => {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (dirEntry) => {
            fileEntry.copyTo(dirEntry, FILE_NAME, () => {
                showModal("Import Complete", "File imported to native storage space successfully.");
                loadIcsFile();
            }, (err) => handleFileError("Storage write failure", err));
        }, (err) => handleFileError("App directory access error", err));
    }, (err) => handleFileError("Source runtime lookup failure", err));
}

function loadIcsFile() {
    if (!window.cordova) return;
    updateStatus("Locating schedule file...");
    
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (dirEntry) => {
        dirEntry.getFile(FILE_NAME, { create: false }, (fileEntry) => {
            fileEntry.file((file) => {
                const reader = new FileReader();
                reader.onloadend = function() { parseIcalData(this.result); };
                reader.readAsText(file);
            }, (err) => handleFileError("File reading access loss", err));
        }, () => updateStatus(`No active '${FILE_NAME}' found. Use directory folder to select.`));
    }, (err) => handleFileError("Native filesystem connection drops", err));
}

// --- Highly Tolerant Sanitizing Parser Engine ---

function parseIcalData(rawText) {
    try {
        updateStatus("Sanitizing calendar formatting...");

        if (!rawText || typeof rawText !== 'string') {
            throw new Error("Payload text stream parsed empty.");
        }

        // 1. Wipe hidden Byte Order Marks (BOM)
        let processedText = rawText.replace(/^\uFEFF/, '').trim();

        // 2. Format uneven newline array markers
        processedText = processedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // 3. Catch structural HTML document hijack downloads
        if (processedText.includes("<html") || processedText.includes("<!DOCTYPE")) {
            showModal("Incorrect File Type", "The selected file is an HTML webpage, not a raw calendar document. Try downloading the file directly instead of saving a web preview.");
            updateStatus("Aborted: HTML payload detected.");
            return;
        }

        // 4. Wrap structural boundaries dynamically if missed
        if (!processedText.startsWith("BEGIN:VCALENDAR")) {
            console.warn("Structural anomalies found. Appending VCALENDAR headers...");
            processedText = "BEGIN:VCALENDAR\nVERSION:2.0\n" + processedText;
        }
        if (!processedText.endsWith("END:VCALENDAR")) {
            console.warn("Structural anomalies found. Appending VCALENDAR footers...");
            processedText = processedText + "\nEND:VCALENDAR";
        }

        // 5. Execute ical.js framework parser pass
        const jcalData = ICAL.parse(processedText);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        appState.allEvents = vevents.map(vevent => {
            const event = new ICAL.Event(vevent);
            return {
                summary: event.summary || "Unnamed Shift",
                location: event.location || "No location specified",
                startDate: event.startDate.toJSDate(),
                endDate: event.endDate.toJSDate()
            };
        });

        updateStatus(`Imported ${appState.allEvents.length} events successfully.`);
        renderCalendarGrid();

    } catch (e) {
        console.error("Primary framework failure tracker:", e);
        // Execute the extreme text scanner fallback if ical.js drops the object entirely
        attemptRegExFallback(rawText);
    }
}

/**
 * THE RECOVERY ENGINE: Manually rips parameters straight out of text strings using Regular Expressions
 */
function attemptRegExFallback(rawText) {
    try {
        updateStatus("Using internal regex data-recovery fallback mode...");
        
        const eventBlocks = rawText.split(/BEGIN:VEVENT/i);
        eventBlocks.shift(); // Drop preceding initialization chunks

        if (eventBlocks.length === 0) throw new Error("No readable event rows available.");

        const recoveredEvents = [];

        eventBlocks.forEach(block => {
            const summaryMatch = block.match(/SUMMARY:(.*)/i);
            const locationMatch = block.match(/LOCATION:(.*)/i);
            const dtStartMatch = block.match(/DTSTART[:;](.*)/i);
            const dtEndMatch = block.match(/DTEND[:;](.*)/i);

            if (dtStartMatch) {
                const summary = summaryMatch ? summaryMatch[1].trim() : "Recovered Shift Entry";
                const location = locationMatch ? locationMatch[1].trim() : "No location specified";
                
                // Keep strictly numbers and time dividers
                const rawStart = dtStartMatch[1].replace(/[^0-9T]/gi, ''); 
                
                const year = parseInt(rawStart.substring(0, 4));
                const month = parseInt(rawStart.substring(4, 6)) - 1;
                const day = parseInt(rawStart.substring(6, 8));
                
                let hour = 0, minute = 0;
                if (rawStart.includes('T')) {
                    const tIndex = rawStart.indexOf('T');
                    hour = parseInt(rawStart.substring(tIndex + 1, tIndex + 3)) || 0;
                    minute = parseInt(rawStart.substring(tIndex + 3, tIndex + 5)) || 0;
                }

                const startDate = new Date(year, month, day, hour, minute);
                let endDate = new Date(startDate.getTime() + (8 * 60 * 60 * 1000)); // Default fallback window

                if (dtEndMatch) {
                    const rawEnd = dtEndMatch[1].replace(/[^0-9T]/gi, '');
                    const eYear = parseInt(rawEnd.substring(0, 4));
                    const eMonth = parseInt(rawEnd.substring(4, 6)) - 1;
                    const eDay = parseInt(rawEnd.substring(6, 8));
                    let eHour = hour + 8, eMinute = minute;
                    if (rawEnd.includes('T')) {
                        const etIndex = rawEnd.indexOf('T');
                        eHour = parseInt(rawEnd.substring(etIndex + 1, etIndex + 3)) || 0;
                        eMinute = parseInt(rawEnd.substring(etIndex + 3, etIndex + 5)) || 0;
                    }
                    endDate = new Date(eYear, eMonth, eDay, eHour, eMinute);
                }

                recoveredEvents.push({ summary, location, startDate, endDate });
            }
        });

        if (recoveredEvents.length === 0) throw new Error("Zero matches extracted.");

        appState.allEvents = recoveredEvents;
        updateStatus(`Recovered ${appState.allEvents.length} items via secondary scanner.`);
        renderCalendarGrid();

    } catch (fallbackErr) {
        console.error("Secondary recovery engine crash:", fallbackErr);
        showModal("Unreadable File Structure", "The file is highly fragmented or invalid. Ensure you are uploading a valid .ics file extension document.");
        updateStatus("Critical read termination.");
    }
}

// --- Monthly Grid Layout Generators ---

function renderCalendarGrid() {
    const viewDate = appState.currentViewDate;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    el.monthLabel.textContent = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    el.calendarGrid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Fill preceding empty space boxes
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        el.calendarGrid.appendChild(emptyCell);
    }

    // Build operational calendar days cells
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const loopDate = new Date(year, month, day);
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        if (loopDate.toDateString() === today.toDateString()) {
            dayCell.classList.add('today');
        }

        if (appState.selectedDate && loopDate.toDateString() === appState.selectedDate.toDateString()) {
            dayCell.classList.add('selected');
        }

        // Mark dot tracking highlights
        const dayShifts = appState.allEvents.filter(event => {
            return event.startDate.getFullYear() === year &&
                   event.startDate.getMonth() === month &&
                   event.startDate.getDate() === day;
        });

        if (dayShifts.length > 0) {
            const dot = document.createElement('div');
            dot.className = 'shift-indicator';
            dayCell.appendChild(dot);
        }

        dayCell.addEventListener('click', () => {
            appState.selectedDate = loopDate;
            document.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('selected'));
            dayCell.classList.add('selected');
            renderShiftsForSelectedDate();
        });

        el.calendarGrid.appendChild(dayCell);
    }

    renderShiftsForSelectedDate();
}

function renderShiftsForSelectedDate() {
    const d = appState.selectedDate;
    if (!d) {
        el.dayDetailsTitle.textContent = "No Target Active Selected";
        el.detailsColumn.innerHTML = `<div class="no-shifts">Tap any day in the monthly calendar grid view above.</div>`;
        return;
    }

    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    el.dayDetailsTitle.textContent = `Agenda for ${d.toLocaleDateString(undefined, options)}`;
    el.detailsColumn.innerHTML = '';

    const matchingShifts = appState.allEvents.filter(event => {
        return event.startDate.getFullYear() === d.getFullYear() &&
               event.startDate.getMonth() === d.getMonth() &&
               event.startDate.getDate() === d.getDate();
    });

    if (matchingShifts.length === 0) {
        el.detailsColumn.innerHTML = `<div class="no-shifts">No shifts scheduled for this day.</div>`;
        return;
    }

    matchingShifts.sort((a, b) => a.startDate - b.startDate);

    matchingShifts.forEach(shift => {
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

// --- Universal Helper Methods ---
function formatTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
if (typeof updateStatus !== 'function') { function updateStatus(msg) { el.statusLabel.textContent = msg; } }
function handleFileError(ctx, err) { console.error(`${ctx}:`, err); updateStatus("Native filesystem sandbox handler error."); }
function escapeHTML(str) { return str.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t] || t)); }

function showModal(title, text) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-title">${escapeHTML(title)}</div>
            <div class="modal-content">${escapeHTML(text)}</div>
            <div class="modal-actions"><button class="modal-ok-btn">OK</button></div>
        </div>
    `;
    overlay.querySelector('.modal-ok-btn').addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
}