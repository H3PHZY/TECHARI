// mentor-dashboard.js

// Google Calendar API Configuration
const GOOGLE_CALENDAR_CONFIG = {
  apiKey: 'AIzaSyC_UDGoqFu0cGzRTJFtWVa2RwMc8Gzi0RE',
  clientId: '733226770691-3qjcu08bcfh6pav5beqcenicivfr91v2.apps.googleusercontent.com',
  discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
};

let gapi;
let googleCalendarConnected = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeGoogleCalendar();
  setupAuthStateListener();
});

// Initialize Google Calendar API
function initializeGoogleCalendar() {
  if (typeof window.gapi === 'undefined') {
    console.error('Google APIs not loaded');
    return;
  }

  gapi = window.gapi;
  const calendarBtn = document.getElementById('connectGoogleCalendar');
  if (calendarBtn) {
    calendarBtn.onclick = handleGoogleCalendarConnect;
  }
}

// Setup Firebase auth state listener
function setupAuthStateListener() {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const profile = userDoc.data();
      renderProfileInfo(user, profile);
      renderDashboardContent(profile, user.uid);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  });
}

// Render profile information
function renderProfileInfo(user, profile) {
  const profileInfo = document.getElementById('profileInfo');
  if (profileInfo) {
    profileInfo.innerHTML = `
      <p><strong>Name:</strong> ${profile.name || user.email}</p>
      <p><strong>Role:</strong> ${profile.role || ''}</p>
      <p><strong>Bio:</strong> ${profile.bio || ''}</p>
      <p><strong>Skills:</strong> ${(profile.skills || []).join(', ')}</p>
      <p><strong>Interests:</strong> ${profile.interests || ''}</p>
    `;
  }
}

// Render dashboard content based on role
function renderDashboardContent(profile, userId) {
  const dashboard = document.getElementById('dashboardContent');
  if (!dashboard) return;

  if (profile.role === "mentor") {
    dashboard.innerHTML = `
      <h3>Session Requests</h3>
      <div id="sessionRequests"></div>
      <h3>Accepted Sessions</h3>
      <div id="acceptedSessions"></div>
      <p id="message"></p>
      <div id="mentorProfileEdit"></div>
      <div id="mentorAvailability"></div>
      <ul id="availabilityList"></ul>
      <button id="syncCalendarBtn" class="mentor-btn">Sync with Google Calendar</button>
    `;
    
    renderMentorProfileEdit(profile);
    renderMentorAvailability();
    loadSessionRequests();
    loadAcceptedSessions();
    loadAvailabilitySlots();
    
    // Setup calendar sync button
    const syncBtn = document.getElementById('syncCalendarBtn');
    if (syncBtn) {
      syncBtn.addEventListener('click', syncAvailabilityWithCalendar);
    }
  } else if (profile.role === "mentee") {
    dashboard.innerHTML = `
      <h3>Your Session Requests</h3>
      <div id="menteeRequests"></div>
      <h3>Your Progress</h3>
      <div id="progress"></div>
      <p id="message"></p>
    `;
    loadMenteeRequests(userId);
    loadProgress(userId);
  }
}

// Handle Google Calendar connection
async function handleGoogleCalendarConnect() {
  try {
    // First load the client library if not already loaded
    if (!gapi.client) {
      await new Promise((resolve) => {
        gapi.load('client:auth2', resolve);
      });
      await gapi.client.init({
        apiKey: GOOGLE_CALENDAR_CONFIG.apiKey,
        clientId: GOOGLE_CALENDAR_CONFIG.clientId,
        discoveryDocs: [GOOGLE_CALENDAR_CONFIG.discoveryDoc],
        scope: GOOGLE_CALENDAR_CONFIG.scopes
      });
    }

    const authInstance = gapi.auth2.getAuthInstance();
    // Rest of your function...
  } catch (error) {
    console.error('Error connecting to Google Calendar:', error);
  }
}

// Update calendar status and button state
function updateCalendarStatus(message, type) {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = type;
  }
}

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

// Mentor profile edit functions (same as before)
function renderMentorProfileEdit(profile) {
  const container = document.getElementById('mentorProfileEdit');
  if (!container) return;
  
  container.innerHTML = `
    <button id="showEditProfileBtn" class="mentor-btn">Edit Profile</button>
    <div id="mentorProfileFormContainer" style="display:none;"></div>
  `;
  
  const editBtn = document.getElementById('showEditProfileBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      showMentorProfileForm(profile);
      editBtn.style.display = 'none';
    });
  }
}

function showMentorProfileForm(profile) {
  const formContainer = document.getElementById('mentorProfileFormContainer');
  if (!formContainer) return;
  
  formContainer.style.display = 'block';
  formContainer.innerHTML = `
    <h3>Edit Your Profile</h3>
    <form id="mentorProfileForm">
      <label>Name:</label><input type="text" id="mentorName" value="${profile.name || ''}" required>
      <label>Bio:</label><textarea id="mentorBio" rows="3">${profile.bio || ''}</textarea>
      <label>Skills:</label><input type="text" id="mentorSkills" value="${(profile.skills || []).join(', ')}">
      <label>Interests:</label><input type="text" id="mentorInterests" value="${profile.interests || ''}">
      <button type="submit" class="mentor-btn">Save</button>
      <p id="mentorProfileMsg"></p>
    </form>
  `;
  
  const form = document.getElementById('mentorProfileForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      updateMentorProfile();
    });
  }
}

async function updateMentorProfile() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const formContainer = document.getElementById('mentorProfileFormContainer');
  const msgElement = document.getElementById('mentorProfileMsg');
  
  try {
    const data = {
      name: document.getElementById('mentorName').value,
      bio: document.getElementById('mentorBio').value,
      skills: document.getElementById('mentorSkills').value.split(',').map(s => s.trim()),
      interests: document.getElementById('mentorInterests').value
    };
    
    await db.collection('users').doc(user.uid).set(data, { merge: true });
    
    if (formContainer) {
      formContainer.innerHTML = `<p style='color:green;'>Profile updated!</p>`;
      setTimeout(() => renderMentorProfileEdit(data), 1500);
    }
  } catch (err) {
    if (msgElement) {
      msgElement.textContent = 'Error: ' + err.message;
    }
  }
}

// Mentor Availability functions (same as before)
function renderMentorAvailability() {
  const container = document.getElementById('mentorAvailability');
  if (!container) return;
  
  container.innerHTML = `
    <h3>Add Availability</h3>
    <form id="availabilityForm">
      <input type="date" id="availableDate" required>
      <input type="time" id="availableTime" required>
      <button type="submit" class="mentor-btn">Add Slot</button>
      <p id="availabilityMsg"></p>
    </form>
  `;

  const form = document.getElementById('availabilityForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const date = document.getElementById('availableDate').value;
      const time = document.getElementById('availableTime').value;
      saveAvailability(date, time);
    });
  }
}

async function saveAvailability(date, time) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  try {
    await db.collection('availability').add({
      date,
      time,
      mentorId: user.uid,
      available: true,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    const msgElement = document.getElementById('availabilityMsg');
    if (msgElement) {
      msgElement.textContent = 'Slot added!';
      msgElement.style.color = 'green';
    }
    
    loadAvailabilitySlots();
  } catch (err) {
    const msgElement = document.getElementById('availabilityMsg');
    if (msgElement) {
      msgElement.textContent = 'Error: ' + err.message;
      msgElement.style.color = 'red';
    }
  }
}

async function loadAvailabilitySlots() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const list = document.getElementById('availabilityList');
  if (!list) return;

  try {
    const snapshot = await db.collection('availability')
      .where('mentorId', '==', user.uid)
      .where('available', '==', true)
      .orderBy('timestamp', 'desc')
      .get();

    list.innerHTML = '';
    
    if (snapshot.empty) {
      list.innerHTML = '<li>No availability slots yet.</li>';
      return;
    }

    snapshot.forEach(doc => {
      const slot = doc.data();
      const li = document.createElement('li');
      li.dataset.datetime = `${slot.date}T${slot.time}`;
      li.innerHTML = `
        ${slot.date} at ${slot.time} 
        <button onclick="removeAvailability('${doc.id}')" class="mentor-btn small-btn">Remove</button>
      `;
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading availability slots:', error);
  }
}

async function removeAvailability(slotId) {
  try {
    await db.collection('availability').doc(slotId).update({ available: false });
    loadAvailabilitySlots();
  } catch (error) {
    console.error('Error removing availability slot:', error);
    const msgElement = document.getElementById('availabilityMsg');
    if (msgElement) {
      msgElement.textContent = 'Error removing slot';
      msgElement.style.color = 'red';
    }
  }
}

// Session management functions
async function loadSessionRequests() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const container = document.getElementById('sessionRequests');
  if (!container) return;

  try {
    const snapshot = await db.collection('sessions')
      .where('mentorId', '==', user.uid)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    container.innerHTML = '';
    
    if (snapshot.empty) {
      container.innerHTML = '<p>No session requests.</p>';
      return;
    }

    snapshot.forEach(doc => {
      const session = doc.data();
      const div = document.createElement('div');
      div.className = 'session-request';
      div.innerHTML = `
        <h4>${session.menteeName}</h4>
        <p>Topic: ${session.topic}</p>
        <p>Date: ${session.date}</p>
        <p>Time: ${session.time}</p>
        <p>${session.message || ''}</p>
        <button onclick="acceptSessionWithCalendar('${doc.id}', ${escapeJsonForHtml(session)})" class="mentor-btn">
          Accept
        </button>
        <button onclick="rejectSession('${doc.id}')" class="mentor-btn reject-btn">
          Reject
        </button>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading session requests:', error);
    container.innerHTML = '<p>Error loading requests.</p>';
  }
}

function escapeJsonForHtml(obj) {
  return JSON.stringify(obj).replace(/"/g, '&quot;');
}

async function loadAcceptedSessions() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const container = document.getElementById('acceptedSessions');
  if (!container) return;

  try {
    const snapshot = await db.collection('sessions')
      .where('mentorId', '==', user.uid)
      .where('status', '==', 'accepted')
      .orderBy('date')
      .orderBy('time')
      .get();

    container.innerHTML = '';
    
    if (snapshot.empty) {
      container.innerHTML = '<p>No accepted sessions.</p>';
      return;
    }

    snapshot.forEach(doc => {
      const session = doc.data();
      const div = document.createElement('div');
      div.className = 'accepted-session';
      div.innerHTML = `
        <h4>Session with ${session.menteeName}</h4>
        <p>Topic: ${session.topic}</p>
        <p>${session.date} at ${session.time}</p>
        <p>Email: ${session.menteeEmail}</p>
        ${session.calendarEventId ? `<p>Added to Google Calendar</p>` : ''}
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading accepted sessions:', error);
    container.innerHTML = '<p>Error loading sessions.</p>';
  }
}

async function acceptSessionWithCalendar(sessionId, sessionData) {
  if (!googleCalendarConnected) {
    return acceptSession(sessionId);
  }

  try {
    // Check for calendar conflicts first
    const startTime = new Date(`${sessionData.date}T${sessionData.time}`).toISOString();
    const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(); // 1 hour session
    
    const hasConflict = await checkCalendarConflicts(startTime, endTime);
    
    if (hasConflict) {
      const userConfirm = confirm('You have a calendar conflict at this time. Do you want to accept anyway?');
      if (!userConfirm) {
        updateCalendarStatus('Session not accepted due to calendar conflict', 'warning');
        return;
      }
    }

    // Accept the session
    await acceptSession(sessionId);

    // Create calendar event
    try {
      const calendarEvent = await createCalendarEvent({
        sessionId: sessionId,
        menteeName: sessionData.menteeName,
        menteeEmail: sessionData.menteeEmail,
        topic: sessionData.topic,
        startTime: startTime,
        endTime: endTime
      });

      // Store calendar event ID with session
      await db.collection('sessions').doc(sessionId).update({
        calendarEventId: calendarEvent.id
      });

      updateCalendarStatus('Session accepted and added to Google Calendar', 'success');
    } catch (calendarError) {
      console.error('Error adding to calendar:', calendarError);
      updateCalendarStatus('Session accepted but failed to add to calendar', 'warning');
    }
  } catch (error) {
    console.error('Error accepting session:', error);
    updateCalendarStatus('Error accepting session', 'error');
  }
}

async function acceptSession(sessionId) {
  try {
    await db.collection('sessions').doc(sessionId).update({ status: 'accepted' });
    loadSessionRequests();
    loadAcceptedSessions();
  } catch (error) {
    console.error('Error accepting session:', error);
    throw error;
  }
}

async function rejectSession(sessionId) {
  try {
    await db.collection('sessions').doc(sessionId).update({ status: 'rejected' });
    loadSessionRequests();
    updateCalendarStatus('Session rejected', 'info');
  } catch (error) {
    console.error('Error rejecting session:', error);
    updateCalendarStatus('Error rejecting session', 'error');
  }
}

// Google Calendar functions
async function createCalendarEvent(sessionData) {
  if (!googleCalendarConnected) {
    throw new Error('Google Calendar not connected');
  }

  try {
    const event = {
      summary: `Mentoring Session with ${sessionData.menteeName || 'Mentee'}`,
      description: `Mentoring session scheduled through platform.\n\nMentee: ${sessionData.menteeName || 'Not specified'}\nTopic: ${sessionData.topic || 'General mentoring'}\nSession ID: ${sessionData.sessionId || 'N/A'}`,
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

async function checkCalendarConflicts(startTime, endTime) {
  if (!googleCalendarConnected) return false;

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

// Sync availability with Google Calendar
async function syncAvailabilityWithCalendar() {
  if (!googleCalendarConnected) {
    alert('Please connect to Google Calendar first');
    return;
  }

  const availabilityList = document.getElementById('availabilityList');
  if (!availabilityList) return;

  const slots = availabilityList.children;
  if (slots.length === 0) return;

  const syncBtn = document.getElementById('syncCalendarBtn');
  const originalText = syncBtn?.textContent;
  
  if (syncBtn) {
    syncBtn.textContent = 'Syncing...';
    syncBtn.disabled = true;
  }

  try {
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
    updateCalendarStatus('Error syncing with Google Calendar', 'error');
  } finally {
    if (syncBtn) {
      syncBtn.textContent = originalText;
      syncBtn.disabled = false;
    }
  }
}

// Mentee functions
function loadMenteeRequests(uid) {
  const container = document.getElementById('menteeRequests');
  if (!container) return;

  db.collection('sessions').where('menteeId', '==', uid).get()
    .then(snapshot => {
      container.innerHTML = '';
      if (snapshot.empty) {
        container.innerHTML = '<p>No requests.</p>';
        return;
      }
      
      snapshot.forEach(doc => {
        const s = doc.data();
        container.innerHTML += `
          <div class="mentee-request">
            <p><strong>Mentor:</strong> ${s.mentorName}</p>
            <p><strong>Status:</strong> <span class="status-${s.status}">${s.status}</span></p>
            <p><strong>Topic:</strong> ${s.topic}</p>
          </div>
        `;
      });
    })
    .catch(error => {
      console.error('Error loading mentee requests:', error);
      container.innerHTML = '<p>Error loading requests.</p>';
    });
}

function loadProgress(uid) {
  const container = document.getElementById('progress');
  if (!container) return;

  db.collection('sessions')
    .where('menteeId', '==', uid)
    .where('status', '==', 'accepted')
    .get()
    .then(snapshot => {
      container.innerHTML = '';
      if (snapshot.empty) {
        container.innerHTML = '<p>No progress yet.</p>';
        return;
      }
      
      snapshot.forEach(doc => {
        const s = doc.data();
        container.innerHTML += `
          <div class="progress-item">
            <p><strong>Mentor:</strong> ${s.mentorName}</p>
            <p><strong>Completed:</strong> ${s.date}</p>
          </div>
        `;
      });
    })
    .catch(error => {
      console.error('Error loading progress:', error);
      container.innerHTML = '<p>Error loading progress.</p>';
    });
}

// Logout function
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}

// Make functions available globally
window.acceptSessionWithCalendar = acceptSessionWithCalendar;
window.acceptSession = acceptSession;
window.rejectSession = rejectSession;
window.removeAvailability = removeAvailability;
window.logout = logout;