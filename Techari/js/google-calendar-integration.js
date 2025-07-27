// Google Calendar Integration for Mentor Dashboard

// Google Calendar API Configuration
const GOOGLE_CALENDAR_CONFIG = {
    apiKey: 'AIzaSyC_UDGoqFu0cGzRTJFtWVa2RwMc8Gzi0RE',
    clientId: '733226770691-3qjcu08bcfh6pav5beqcenicivfr91v2.apps.googleusercontent.com',
    discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
};

let gapi;
let googleCalendarConnected = false;

// Initialize Google Calendar API when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGoogleCalendar();
    
    // Add sync button to availability section if it exists
    const availabilitySection = document.getElementById('mentorAvailability');
    if (availabilitySection) {
        const syncButton = document.createElement('button');
        syncButton.textContent = 'Sync with Google Calendar';
        syncButton.className = 'mentor-btn sync-btn';
        syncButton.onclick = syncAvailabilityWithCalendar;
        availabilitySection.appendChild(syncButton);
    }
});

// Initialize Google Calendar API
function initializeGoogleCalendar() {
    if (typeof window.gapi === 'undefined') {
        console.error('Google APIs not loaded');
        updateCalendarStatus('Google API library not loaded', 'error');
        return;
    }

    gapi = window.gapi;
    gapi.load('client:auth2', initializeGapiClient);
}

// Initialize the Google API client
async function initializeGapiClient() {
    try {
        await gapi.client.init({
            apiKey: GOOGLE_CALENDAR_CONFIG.apiKey,
            clientId: GOOGLE_CALENDAR_CONFIG.clientId,
            discoveryDocs: [GOOGLE_CALENDAR_CONFIG.discoveryDoc],
            scope: GOOGLE_CALENDAR_CONFIG.scopes
        });

        // Check if user is already signed in
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance.isSignedIn.get()) {
            googleCalendarConnected = true;
            updateCalendarStatus('Connected to Google Calendar', 'success');
            loadCalendarEvents();
        } else {
            updateCalendarStatus('Not connected to Google Calendar', 'info');
        }

        // Set up the connect button if it exists
        const connectButton = document.getElementById('connectGoogleCalendar');
        if (connectButton) {
            connectButton.addEventListener('click', handleGoogleCalendarConnect);
            updateConnectButtonState();
        }
        
    } catch (error) {
        console.error('Error initializing Google API:', error);
        updateCalendarStatus('Error initializing Google Calendar', 'error');
    }
}

// Handle Google Calendar connection
async function handleGoogleCalendarConnect() {
    try {
        const authInstance = gapi.auth2.getAuthInstance();
        
        if (authInstance.isSignedIn.get()) {
            // User is already signed in, disconnect
            await authInstance.signOut();
            googleCalendarConnected = false;
            updateCalendarStatus('Disconnected from Google Calendar', 'info');
            clearCalendarEvents();
        } else {
            // User needs to sign in
            await authInstance.signIn();
            googleCalendarConnected = true;
            updateCalendarStatus('Connected to Google Calendar', 'success');
            loadCalendarEvents();
        }
        
        updateConnectButtonState();
    } catch (error) {
        console.error('Error connecting to Google Calendar:', error);
        updateCalendarStatus('Error connecting to Google Calendar: ' + error.message, 'error');
    }
}

// Update connect button state
function updateConnectButtonState() {
    const connectButton = document.getElementById('connectGoogleCalendar');
    if (!connectButton) return;
    
    if (googleCalendarConnected) {
        connectButton.textContent = 'Disconnect Google Calendar';
        connectButton.classList.add('connected');
    } else {
        connectButton.textContent = 'Connect Google Calendar';
        connectButton.classList.remove('connected');
    }
}

// Load calendar events
async function loadCalendarEvents() {
    if (!googleCalendarConnected) return;

    try {
        const response = await gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
        });

        const events = response.result.items;
        displayCalendarEvents(events);
    } catch (error) {
        console.error('Error loading calendar events:', error);
        updateCalendarStatus('Error loading calendar events', 'error');
    }
}

// Display calendar events
function displayCalendarEvents(events) {
    const calendarStatus = document.getElementById('calendarStatus');
    if (!calendarStatus) return;
    
    // Clear existing events display
    const existingEvents = calendarStatus.querySelector('.calendar-events');
    if (existingEvents) {
        existingEvents.remove();
    }

    if (!events || events.length === 0) {
        calendarStatus.insertAdjacentHTML('beforeend', '<div class="calendar-events"><h4>No upcoming events</h4></div>');
        return;
    }

    let eventsHtml = '<div class="calendar-events"><h4>Upcoming Events</h4><ul>';
    
    events.forEach(event => {
        const start = event.start.dateTime || event.start.date;
        const startDate = new Date(start);
        const formattedDate = startDate.toLocaleDateString();
        const formattedTime = event.start.dateTime ? startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'All day';
        
        eventsHtml += `
            <li class="calendar-event">
                <strong>${event.summary || 'No title'}</strong><br>
                <span class="event-time">${formattedDate} at ${formattedTime}</span>
            </li>
        `;
    });
    
    eventsHtml += '</ul></div>';
    calendarStatus.insertAdjacentHTML('beforeend', eventsHtml);
}

// Create calendar event for mentoring session
async function createCalendarEvent(sessionData) {
    if (!googleCalendarConnected) {
        console.warn('Google Calendar not connected');
        throw new Error('Google Calendar not connected');
    }

    if (!sessionData || !sessionData.startTime || !sessionData.endTime) {
        throw new Error('Invalid session data');
    }

    try {
        const event = {
            summary: `Mentoring Session with ${sessionData.menteeName || 'Mentee'}`,
            description: `Mentoring session scheduled through Techari platform.\n\nMentee: ${sessionData.menteeName || 'Not specified'}\nTopic: ${sessionData.topic || 'General mentoring'}\nSession ID: ${sessionData.sessionId || 'N/A'}`,
            start: {
                dateTime: sessionData.startTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
                dateTime: sessionData.endTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            attendees: sessionData.menteeEmail ? [
                { email: sessionData.menteeEmail }
            ] : [],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 24 hours
                    { method: 'popup', minutes: 30 }       // 30 minutes
                ]
            }
        };

        const response = await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event
        });

        return response.result;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
}

// Update calendar status display
function updateCalendarStatus(message, type) {
    const statusDiv = document.getElementById('calendarStatus');
    if (!statusDiv) return;
    
    // Keep existing events display if it exists
    const eventsDiv = statusDiv.querySelector('.calendar-events');
    
    statusDiv.innerHTML = `<div class="calendar-status ${type}">${message}</div>`;
    
    if (eventsDiv) {
        statusDiv.appendChild(eventsDiv);
    }
}

// Clear calendar events display
function clearCalendarEvents() {
    const calendarStatus = document.getElementById('calendarStatus');
    if (!calendarStatus) return;
    
    const eventsDiv = calendarStatus.querySelector('.calendar-events');
    if (eventsDiv) {
        eventsDiv.remove();
    }
}

// Check for scheduling conflicts
async function checkCalendarConflicts(startTime, endTime) {
    if (!googleCalendarConnected) return false;

    if (!startTime || !endTime) {
        console.warn('Invalid time range provided for conflict check');
        return false;
    }

    try {
        const response = await gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: startTime,
            timeMax: endTime,
            singleEvents: true,
            showDeleted: false
        });

        // Filter out declined events and transparent events
        const conflictingEvents = response.result.items.filter(event => {
            return event.transparency !== 'transparent' && 
                   !event.attendees?.some(attendee => attendee.self && attendee.responseStatus === 'declined');
        });

        return conflictingEvents.length > 0;
    } catch (error) {
        console.error('Error checking calendar conflicts:', error);
        return false;
    }
}

// Enhanced session acceptance with calendar integration
async function acceptSessionWithCalendar(sessionId, sessionData) {
    if (!sessionId || !sessionData) {
        throw new Error('Missing session ID or data');
    }

    try {
        // Check for calendar conflicts first
        const hasConflict = await checkCalendarConflicts(sessionData.startTime, sessionData.endTime);
        
        if (hasConflict) {
            const userConfirm = confirm('You have a calendar conflict at this time. Do you want to accept anyway?');
            if (!userConfirm) {
                return { success: false, message: 'Session not accepted due to calendar conflict' };
            }
        }

        // Accept the session in your system
        // Replace this with your actual session acceptance logic
        const acceptResult = await acceptSession(sessionId);
        
        // Create calendar event if connected
        if (googleCalendarConnected) {
            try {
                const calendarEvent = await createCalendarEvent({
                    sessionId: sessionId,
                    menteeName: sessionData.menteeName,
                    menteeEmail: sessionData.menteeEmail,
                    topic: sessionData.topic,
                    startTime: sessionData.startTime,
                    endTime: sessionData.endTime
                });

                // Store calendar event ID with session for future reference
                // Replace this with your actual database update logic
                await updateSessionWithCalendarEvent(sessionId, calendarEvent.id);

                return { 
                    success: true, 
                    message: 'Session accepted and added to Google Calendar',
                    calendarEvent: calendarEvent
                };
            } catch (calendarError) {
                console.error('Error adding to calendar:', calendarError);
                return { 
                    success: true, 
                    message: 'Session accepted but failed to add to calendar',
                    warning: calendarError.message 
                };
            }
        }
        
        return { success: true, message: 'Session accepted' };
    } catch (error) {
        console.error('Error accepting session:', error);
        throw error;
    }
}

// Sync availability with Google Calendar
async function syncAvailabilityWithCalendar() {
    if (!googleCalendarConnected) {
        alert('Please connect to Google Calendar first');
        return;
    }

    const availabilityList = document.getElementById('availabilityList');
    if (!availabilityList) {
        console.warn('Availability list not found');
        return;
    }

    const slots = availabilityList.children;
    if (slots.length === 0) {
        console.log('No availability slots to sync');
        return;
    }

    try {
        // Show loading state
        const originalButtonText = this.textContent;
        this.textContent = 'Syncing...';
        this.disabled = true;

        for (let slot of slots) {
            const slotData = slot.dataset;
            if (!slotData.datetime) continue;

            const startTime = new Date(slotData.datetime).toISOString();
            const endTime = new Date(new Date(slotData.datetime).getTime() + 60 * 60 * 1000).toISOString();

            // Check if this slot conflicts with existing events
            const hasConflict = await checkCalendarConflicts(startTime, endTime);
            
            if (hasConflict) {
                slot.classList.add('conflict');
                let conflictIndicator = slot.querySelector('.conflict-indicator');
                if (!conflictIndicator) {
                    conflictIndicator = document.createElement('span');
                    conflictIndicator.className = 'conflict-indicator';
                    conflictIndicator.textContent = '⚠️ Calendar conflict';
                    slot.appendChild(conflictIndicator);
                }
            } else {
                slot.classList.remove('conflict');
                const conflictIndicator = slot.querySelector('.conflict-indicator');
                if (conflictIndicator) conflictIndicator.remove();
            }
        }
    } catch (error) {
        console.error('Error syncing availability:', error);
        alert('Error syncing availability with Google Calendar');
    } finally {
        // Restore button state
        this.textContent = originalButtonText;
        this.disabled = false;
    }
}

// Placeholder functions - replace these with your actual implementations
async function acceptSession(sessionId) {
    // Replace with your actual session acceptance logic
    console.log(`Accepting session ${sessionId}`);
    return { success: true };
}

async function updateSessionWithCalendarEvent(sessionId, eventId) {
    // Replace with your actual database update logic
    console.log(`Updating session ${sessionId} with calendar event ${eventId}`);
    return { success: true };
}

// Export functions for use in other scripts
window.googleCalendarIntegration = {
    createCalendarEvent,
    checkCalendarConflicts,
    acceptSessionWithCalendar,
    syncAvailabilityWithCalendar,
    isConnected: () => googleCalendarConnected
};