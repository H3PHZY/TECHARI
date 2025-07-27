document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    // Load mentee profile info
    const userDoc = await db.collection('users').doc(user.uid).get();
    const profile = userDoc.data();
    document.getElementById('profileInfo').innerHTML = `
      <h3>${profile.name || ''}</h3>
      <p>${profile.bio || ''}</p>
      <p><strong>Interests:</strong> ${profile.interests || ''}</p>
    `;

    // Load dashboard content
    renderMenteeDashboard(user.uid);
  });
});

function renderMenteeDashboard(menteeUid) {
  document.getElementById('dashboardContent').innerHTML = `
    <button id="newSessionBtn" class="mentee-btn">Request New Session</button>
    <div id="newSessionFormContainer" style="display:none;"></div>
    <h3>Your Session Requests</h3>
    <div id="menteeRequests"></div>
    <h3>Your Progress</h3>
    <div id="progress"></div>
    <p id="message"></p>
  `;

  loadMenteeRequests(menteeUid);
  loadMenteeProgress(menteeUid);

  document.getElementById('newSessionBtn').onclick = function() {
    showNewSessionForm(menteeUid);
    this.style.display = "none";
  };
}

// Load session requests
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
            <p><strong>Mentor:</strong> ${req.mentorName || req.mentorId}</p>
            <p><strong>Topic:</strong> ${req.topic || 'N/A'}</p>
            <p><strong>Date/Time:</strong> ${req.date || ''} ${req.time || ''}</p>
            <p>Status: ${req.status}</p>
            <p><strong>Message:</strong> ${req.message || ''}</p>
          </div>
        `;
      });
    });
}

// Show new session request form
function showNewSessionForm(menteeUid) {
  const formContainer = document.getElementById('newSessionFormContainer');
  formContainer.style.display = "block";
  db.collection('users').where('role', '==', 'mentor').get().then(snapshot => {
    let mentorOptions = '';
    snapshot.forEach(doc => {
      const mentor = doc.data();
      mentorOptions += `<option value="${doc.id}">${mentor.name || mentor.email}</option>`;
    });
    formContainer.innerHTML = `
      <h4>Request a Session</h4>
      <form id="newSessionForm">
        <label>Mentor:
          <select id="mentorSelect" required>
            <option value="">Select Mentor</option>
            ${mentorOptions}
          </select>
        </label><br>
        <label>Topic: <input type="text" id="sessionTopic" required></label><br>
        <label>Date: <input type="date" id="sessionDate" required></label><br>
        <label>Time: <input type="time" id="sessionTime" required></label><br>
        <label>Message: <textarea id="sessionMessage" required></textarea></label><br>
        <button type="submit" class="mentee-btn">Send Request</button>
        <p id="sessionRequestMsg"></p>
      </form>
    `;
    document.getElementById('newSessionForm').onsubmit = function(e) {
      e.preventDefault();
      sendSessionRequest(menteeUid);
    };
  });
}

function sendSessionRequest(menteeUid) {
  const mentorId = document.getElementById('mentorSelect').value;
  const topic = document.getElementById('sessionTopic').value;
  const date = document.getElementById('sessionDate').value;
  const time = document.getElementById('sessionTime').value;
  const message = document.getElementById('sessionMessage').value;

  db.collection('sessions').add({
    mentorId,
    menteeId: menteeUid,
    topic,
    date,
    time,
    message,
    status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById('sessionRequestMsg').innerText = "Session request sent!";
    setTimeout(() => {
      document.getElementById('newSessionFormContainer').style.display = "none";
      document.getElementById('newSessionBtn').style.display = "inline-block";
      loadMenteeRequests(menteeUid);
    }, 1500);
  }).catch(error => {
    document.getElementById('sessionRequestMsg').innerText = error.message;
  });
}

// Load progress (completed sessions)
function loadMenteeProgress(menteeUid) {
  db.collection('sessions')
    .where('menteeId', '==', menteeUid)
    .where('status', '==', 'completed')
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
          <div class="completed-session">
            <p><strong>Mentor:</strong> ${session.mentorName || session.mentorId}</p>
            <p><strong>Topic:</strong> ${session.topic || 'N/A'}</p>
            <p><strong>Date/Time:</strong> ${session.date || ''} ${session.time || ''}</p>
            <p><strong>Notes:</strong> ${session.notes || ''}</p>
          </div>
        `;
      });
    });
}

// Logout function
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}

// Mentor pages mapping
const mentorPages = {
    "Kwame Mensah": "mentor1.html",
    "Zainab Yusuf": "mentor2.html",
    "Munya Dube": "mentor3.html",
    "Amina Bello": "mentor4.html",
    "Thulani Moyo": "mentor5.html",
    "Fatou Diop": "mentor6.html"
};

// Render mentor list
function renderMentorList(mentors) {
  const container = document.getElementById('mentorList');
  container.innerHTML = '';
  mentors.forEach(mentor => {
    const page = mentorPages[mentor.name];
    const link = page ? page : '#';
    const disabled = page ? '' : 'disabled';
    container.innerHTML += `
      <div class="mentor-card">
        <h3>${mentor.name}</h3>
        <a href="${link}" class="view-profile-btn" ${disabled}>View Profile</a>
      </div>
    `;
  });
}

// Example usage
const mentors = [
  { name: "Kwame Mensah" },
  { name: "Zainab Yusuf" },
  { name: "Munya Dube" },
  { name: "Amina Bello" },
  { name: "Thulani Moyo" },
  { name: "Fatou Diop" },
  { name: "Unknown Mentor" }
];
renderMentorList(mentors);