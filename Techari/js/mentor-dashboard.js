// This file manages the session dashboard, enabling mentors to accept or reject session requests from mentees.

document.addEventListener('DOMContentLoaded', function() {
    const sessionRequestsContainer = document.getElementById('sessionRequests');
    const messageElement = document.getElementById('message');

    // Fetch session requests from the database
    function fetchSessionRequests() {
        // Simulated fetch from a database
        const sessionRequests = [
            { id: 1, mentee: 'John Doe', status: 'pending' },
            { id: 2, mentee: 'Jane Smith', status: 'pending' }
        ];

        displaySessionRequests(sessionRequests);
    }

    // Display session requests in the dashboard
    function displaySessionRequests(requests) {
        sessionRequestsContainer.innerHTML = '';
        requests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.classList.add('request');
            requestElement.innerHTML = `
                <p>Mentee: ${request.mentee}</p>
                <button onclick="acceptRequest(${request.id})">Accept</button>
                <button onclick="rejectRequest(${request.id})">Reject</button>
            `;
            sessionRequestsContainer.appendChild(requestElement);
        });
    }

    // Accept a session request
    window.acceptRequest = function(requestId) {
        // Simulated acceptance logic
        messageElement.textContent = `Session request ${requestId} accepted.`;
        // Here you would typically update the database
    };

    // Reject a session request
    window.rejectRequest = function(requestId) {
        // Simulated rejection logic
        messageElement.textContent = `Session request ${requestId} rejected.`;
        // Here you would typically update the database
    };

    // Initial fetch of session requests
    fetchSessionRequests();

    const calendarBtn = document.getElementById('connectGoogleCalendar');
    if (calendarBtn) {
      calendarBtn.onclick = function() {
        gapi.load('client:auth2', initClient);
      };
    }
});

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Fetch user profile
  const userDoc = await db.collection('users').doc(user.uid).get();
  const profile = userDoc.data();
  document.getElementById('profileInfo').innerHTML = `
    <p><strong>Name:</strong> ${user.email}</p>
    <p><strong>Role:</strong> ${profile.role || ''}</p>
    <p><strong>Bio:</strong> ${profile.bio || ''}</p>
    <p><strong>Skills:</strong> ${(profile.skills || []).join(', ')}</p>
    <p><strong>Interests:</strong> ${profile.interests || ''}</p>
  `;

  if (profile.role === "mentor") {
    // Mentor dashboard
    document.getElementById('dashboardContent').innerHTML = `
      <h3>Session Requests</h3>
      <div id="sessionRequests"></div>
      <h3>Accepted Sessions</h3>
      <div id="acceptedSessions"></div>
      <p id="message"></p>
      <div id="mentorProfileEdit"></div>
      <div id="mentorAvailability"></div>
    `;
    loadMentorRequests(user.uid);
    loadMentorAcceptedSessions(user.uid);
    renderMentorProfileEdit(profile); // NEW
    renderMentorAvailability();
  } else if (profile.role === "mentee") {
    // Mentee dashboard
    document.getElementById('dashboardContent').innerHTML = `
      <h3>Your Session Requests</h3>
      <div id="menteeRequests"></div>
      <h3>Your Progress</h3>
      <div id="progress"></div>
      <p id="message"></p>
    `;
    loadMenteeRequests(user.uid);
    loadProgress(user.uid);
  }
});

function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

// Mentor: Load session requests from Firestore
function loadMentorRequests(mentorUid) {
  db.collection('sessions')
    .where('mentorId', '==', mentorUid)
    .where('status', '==', 'pending')
    .get()
    .then(snapshot => {
      const container = document.getElementById('sessionRequests');
      if (snapshot.empty) {
        container.innerHTML = "<p>No session requests yet.</p>";
        return;
      }
      container.innerHTML = '';
      snapshot.forEach(doc => {
        const req = doc.data();
        const div = document.createElement('div');
        div.className = 'request';
        div.innerHTML = `
          <p><strong>Mentee:</strong> ${req.menteeName || req.menteeId}</p>
          <p><strong>Topic:</strong> ${req.topic || 'N/A'}</p>
          <p><strong>Message:</strong> ${req.message || ''}</p>
          <button onclick="acceptRequest('${doc.id}')">Accept</button>
          <button onclick="rejectRequest('${doc.id}')">Reject</button>
        `;
        container.appendChild(div);
      });
    });
}

// Mentee: Load their own session requests
function loadMenteeRequests(menteeUid) {
  db.collection('sessions')
    .where('menteeId', '==', menteeUid)
    .get()
    .then(snapshot => {
      const container = document.getElementById('menteeRequests');
      if (snapshot.empty) {
        container.innerHTML = "<p>You have not requested any sessions yet.</p>";
        return;
      }
      container.innerHTML = '';
      snapshot.forEach(doc => {
        const req = doc.data();
        container.innerHTML += `
          <div class="request">
            <p><strong>Mentor:</strong> ${req.mentorName || req.mentorEmail}</p>
            <p>Status: ${req.status}</p>
          </div>
        `;
      });
    });
}

// Mentee: Load progress (completed sessions)
function loadProgress(menteeUid) {
  db.collection('sessions')
    .where('menteeId', '==', menteeUid)
    .where('status', '==', 'accepted')
    .get()
    .then(snapshot => {
      const container = document.getElementById('progress');
      if (snapshot.empty) {
        container.innerHTML = "<p>No completed sessions yet.</p>";
        return;
      }
      container.innerHTML = '';
      snapshot.forEach(doc => {
        const session = doc.data();
        container.innerHTML += `
          <div class="progress-item">
            <p><strong>Mentor:</strong> ${session.mentorName || session.mentorEmail}</p>
            <p>Session completed!</p>
          </div>
        `;
      });
    });
}

// Mentor: Accept/Reject session requests
window.acceptRequest = function(sessionId) {
  db.collection('sessions').doc(sessionId).update({ status: 'accepted' })
    .then(() => {
      document.getElementById('message').innerText = "Session accepted!";
      loadMentorRequests(auth.currentUser.uid);
      loadMentorAcceptedSessions(auth.currentUser.uid);
    });
};

window.rejectRequest = function(sessionId) {
  db.collection('sessions').doc(sessionId).update({ status: 'rejected' })
    .then(() => {
      document.getElementById('message').innerText = "Session rejected.";
      loadMentorRequests(auth.currentUser.uid);
      loadMentorAcceptedSessions(auth.currentUser.uid);
    });
};

// Show accepted/upcoming sessions
function loadMentorAcceptedSessions(mentorUid) {
  db.collection('sessions')
    .where('mentorId', '==', mentorUid)
    .where('status', '==', 'accepted')
    .get()
    .then(snapshot => {
      const container = document.getElementById('acceptedSessions');
      if (snapshot.empty) {
        container.innerHTML = "<p>No accepted sessions yet.</p>";
        return;
      }
      container.innerHTML = '';
      snapshot.forEach(doc => {
        const session = doc.data();
        container.innerHTML += `
          <div class="accepted-session">
            <p><strong>Mentee:</strong> ${session.menteeName || session.menteeId}</p>
            <p><strong>Topic:</strong> ${session.topic || 'N/A'}</p>
            <p><strong>Status:</strong> Accepted</p>
            <form onsubmit="saveSessionNotes(event, '${doc.id}')">
              <label for="notes-${doc.id}">Session Notes:</label>
              <textarea id="notes-${doc.id}" rows="2">${session.notes || ''}</textarea>
              <button type="submit" class="mentor-btn">Save Notes</button>
            </form>
            <button onclick="completeSession('${doc.id}')">Mark as Completed</button>
          </div>
        `;
      });
    });
}

window.completeSession = function(sessionId) {
  db.collection('sessions').doc(sessionId).update({ status: 'completed' })
    .then(() => {
      document.getElementById('message').innerText = "Session marked as completed!";
      loadMentorAcceptedSessions(firebase.auth().currentUser.uid);
    });
};

// Render mentor profile edit section
function renderMentorProfileEdit(profile) {
  const container = document.getElementById('mentorProfileEdit');
  // Show only the button by default
  container.innerHTML = `
    <button id="showEditProfileBtn" class="mentor-btn" style="margin-bottom:1em;">Edit Profile</button>
    <div id="mentorProfileFormContainer" style="display:none;"></div>
  `;

  document.getElementById('showEditProfileBtn').addEventListener('click', function() {
    showMentorProfileForm(profile);
    this.style.display = "none";
  });
}

function showMentorProfileForm(profile) {
  const formContainer = document.getElementById('mentorProfileFormContainer');
  formContainer.style.display = "block";
  formContainer.innerHTML = `
    <h3>Edit Your Profile</h3>
    <form id="mentorProfileForm">
      <label for="mentorName">Name:</label>
      <input type="text" id="mentorName" value="${profile.name || ''}" required>
      <label for="mentorBio">Bio:</label>
      <textarea id="mentorBio" rows="3" required>${profile.bio || ''}</textarea>
      <label for="mentorSkills">Skills (comma separated):</label>
      <input type="text" id="mentorSkills" value="${(profile.skills || []).join(', ')}" required>
      <label for="mentorInterests">Interests:</label>
      <input type="text" id="mentorInterests" value="${profile.interests || ''}" required>
      <button type="submit" class="mentor-btn">Save Profile</button>
      <p id="mentorProfileMsg"></p>
    </form>
  `;

  document.getElementById('mentorProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('mentorName').value;
    const bio = document.getElementById('mentorBio').value;
    const skills = document.getElementById('mentorSkills').value.split(',').map(s => s.trim());
    const interests = document.getElementById('mentorInterests').value;
    db.collection('users').doc(firebase.auth().currentUser.uid).set({
      name: name,
      bio: bio,
      skills: skills,
      interests: interests
    }, { merge: true })
      .then(() => {
        formContainer.innerHTML = `<p style="color:green;">Profile updated successfully!</p>`;
        // Show the edit button again after a short delay
        setTimeout(() => {
          renderMentorProfileEdit({ name, bio, skills, interests });
        }, 1500);
      })
      .catch(error => {
        document.getElementById('mentorProfileMsg').innerText = error.message;
      });
  });
}

// Render mentor availability section after profile edit
function renderMentorAvailability() {
  const container = document.getElementById('mentorAvailability');
  loadMentorAvailability();

  document.getElementById('availabilityForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('availableDate').value;
    const time = document.getElementById('availableTime').value;
    const slot = { date, time };

    // Save slot to Firestore under users/{uid}/availability
    db.collection('users').doc(firebase.auth().currentUser.uid)
      .collection('availability').add(slot)
      .then(() => {
        document.getElementById('availabilityMsg').innerText = "Slot added!";
        loadMentorAvailability();
      })
      .catch(error => {
        document.getElementById('availabilityMsg').innerText = error.message;
      });
  });
}

// Load and display mentor's available slots
function loadMentorAvailability() {
  const list = document.getElementById('availabilityList');
  list.innerHTML = '';
  db.collection('users').doc(firebase.auth().currentUser.uid)
    .collection('availability').get()
    .then(snapshot => {
      if (snapshot.empty) {
        list.innerHTML = "<li>No available slots yet.</li>";
        return;
      }
      snapshot.forEach(doc => {
        const slot = doc.data();
        const li = document.createElement('li');
        li.textContent = `${slot.date} at ${slot.time}`;        // In loadMentorRequests and loadMentorAcceptedSessions, add more fields:
        div.innerHTML = `
          <p><strong>Mentee:</strong> ${req.menteeName || req.menteeId}</p>
          <p><strong>Topic:</strong> ${req.topic || 'N/A'}</p>
          <p><strong>Message:</strong> ${req.message || ''}</p>
          <button onclick="acceptRequest('${doc.id}')">Accept</button>
          <button onclick="rejectRequest('${doc.id}')">Reject</button>
        `;
        list.appendChild(li);
      });
    });
}

window.saveSessionNotes = function(event, sessionId) {
  event.preventDefault();
  const notes = document.getElementById(`notes-${sessionId}`).value;
  db.collection('sessions').doc(sessionId).update({ notes: notes })
    .then(() => {
      document.getElementById('message').innerText = "Session notes saved!";
    })
    .catch(error => {
      document.getElementById('message').innerText = error.message;
    });
};

// Replace with your own client ID from Google Cloud Console
const CLIENT_ID = '859355606739-l3rh70n05cbn3dldoe8fph1hvgj2qqc1.apps.googleusercontent.coma';
const API_KEY = 'AIzaSyB1jMemuHL99Ac9Xtk18D34v8in0fzQOZ8';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(() => {
    // Sign in and show status
    gapi.auth2.getAuthInstance().signIn().then(() => {
      document.getElementById('calendarStatus').innerText = "Google Calendar connected!";
      showAddEventForm();
    });
  });
}

function showAddEventForm() {
  // Simple form for demo; you can improve this UI
  document.getElementById('calendarStatus').innerHTML += `
    <form id="addEventForm" style="margin-top:1em;">
      <label>Event Title: <input type="text" id="eventTitle" required></label><br>
      <label>Date: <input type="date" id="eventDate" required></label><br>
      <label>Time: <input type="time" id="eventTime" required></label><br>
      <button type="submit" class="mentor-btn">Add to Google Calendar</button>
    </form>
    <div id="eventResult"></div>
  `;
  document.getElementById('addEventForm').onsubmit = function(e) {
    e.preventDefault();
    addEventToGoogleCalendar();
  };
}

function addEventToGoogleCalendar() {
  const title = document.getElementById('eventTitle').value;
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;
  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60*60*1000); // 1 hour

  const event = {
    summary: title,
    start: { dateTime: startDateTime.toISOString() },
    end: { dateTime: endDateTime.toISOString() },
    conferenceData: {
      createRequest: { requestId: Math.random().toString(36).substring(2) }
    }
  };

  gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1
  }).then(response => {
    const meetLink = response.result.hangoutLink || "No Meet link generated";
    document.getElementById('eventResult').innerHTML = `
      <p style="color:green;">Event created! Google Meet link: <a href="${meetLink}" target="_blank">${meetLink}</a></p>
    `;
  }, err => {
    document.getElementById('eventResult').innerText = "Error: " + err.result.error.message;
  });
}