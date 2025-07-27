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
  initializeTabNavigation();
  initializeInteractiveFeatures();
});

// Tab navigation functionality
function initializeTabNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const sectionId = this.textContent.toLowerCase().replace(' ', '');
      showSection(sectionId === 'mysessions' ? 'sessions' : sectionId);
    });
  });
}

// Navigation functionality
function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Remove active class from all nav tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Add active class to corresponding nav tab
  const activeTab = Array.from(navTabs).find(tab => {
    const tabText = tab.textContent.toLowerCase().replace(' ', '');
    return (sectionId === 'sessions' && tabText === 'mysessions') || tabText === sectionId;
  });
  
  if (activeTab) {
    activeTab.classList.add('active');
  }
}

// Initialize interactive features
function initializeInteractiveFeatures() {
  // Add click handlers for time slots
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach(slot => {
    slot.addEventListener('click', function() {
      this.classList.toggle('available');
      if (this.classList.contains('available')) {
        this.style.background = '#d4edda';
        this.style.color = '#155724';
      } else {
        this.style.background = '#f8f9fa';
        this.style.color = '#666';
      }
    });
  });

  // Add hover effects for cards
  const cards = document.querySelectorAll('.stat-card, .request-card, .session-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
      this.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)';
      this.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
  });
}

// Request handling functions
function acceptRequest(mentee) {
  // Show confirmation dialog
  if (confirm(`Accept mentorship request from ${mentee}?`)) {
    // In a real application, this would update the database
    showNotification(`Mentorship request from ${mentee} has been accepted! A confirmation email will be sent.`, 'success');
    updatePendingRequestsCount(-1);
    
    // Remove the request card from UI
    removeRequestCard(mentee);
    
    // Add to active mentees
    updateActiveMenteesCount(1);
  }
}

function declineRequest(mentee) {
  // Show confirmation dialog
  if (confirm(`Decline mentorship request from ${mentee}?`)) {
    showNotification(`Mentorship request from ${mentee} has been declined.`, 'info');
    updatePendingRequestsCount(-1);
    
    // Remove the request card from UI
    removeRequestCard(mentee);
  }
}

function removeRequestCard(mentee) {
  const requestCards = document.querySelectorAll('.request-card');
  requestCards.forEach(card => {
    const nameElement = card.querySelector('h4');
    if (nameElement && nameElement.textContent === mentee) {
      card.style.transition = 'opacity 0.3s ease';
      card.style.opacity = '0';
      setTimeout(() => {
        card.remove();
      }, 300);
    }
  });
}

function updatePendingRequestsCount(change) {
  const pendingElement = document.querySelector('.stat-card:first-child .stat-value');
  if (pendingElement) {
    const currentCount = parseInt(pendingElement.textContent);
    pendingElement.textContent = Math.max(0, currentCount + change);
  }
}

function updateActiveMenteesCount(change) {
  const menteesElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
  if (menteesElement) {
    const currentCount = parseInt(menteesElement.textContent);
    menteesElement.textContent = Math.max(0, currentCount + change);
  }
}

// Notification system
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    z-index: 1000;
    font-weight: 500;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Add slide-in animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 5000);
  
  // Add slide-out animation
  style.textContent += `
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
}

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
  // Check if Firebase is available
  if (typeof firebase === 'undefined') {
    console.log('Firebase not loaded - running in demo mode');
    setupDemoMode();
    return;
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      // In demo mode, don't redirect
      if (typeof firebase !== 'undefined') {
        window.location.href = "index.html";
      }
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

// Setup demo mode when Firebase is not available
function setupDemoMode() {
  const demoProfile = {
    name: 'Dr. Amina Komaiya',
    role: 'mentor',
    bio: 'Senior Software Engineer with 10+ years of experience in full-stack development',
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning'],
    interests: 'Mentoring women in tech, AI/ML applications, sustainable technology'
  };
  
  renderDashboardContent(demoProfile, 'demo-user');
  console.log('Running in demo mode');
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
  if (profile.role === "mentor" || !profile.role) {
    setupMentorDashboard(profile, userId);
  } else if (profile.role === "mentee") {
    setupMenteeDashboard(userId);
  }
}

function setupMentorDashboard(profile, userId) {
  // Load mentor-specific data
  loadSessionRequests();
  loadAcceptedSessions();
  loadAvailabilitySlots();
  
  // Setup profile edit functionality
  setupProfileEdit(profile);
  
  // Setup availability management
  setupAvailabilityManagement();
  
  console.log('Mentor dashboard loaded for:', profile.name);
}

function setupMenteeDashboard(userId) {
  const dashboard = document.getElementById('dashboardContent');
  if (!dashboard) return;

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

// Profile management
function setupProfileEdit(profile) {
  // This would set up profile editing functionality
  console.log('Profile edit setup for:', profile.name);
}

// Availability management
function setupAvailabilityManagement() {
  // This would set up availability management
  console.log('Availability management setup');
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
    
    if (googleCalendarConnected) {
      // Disconnect
      await authInstance.signOut();
      googleCalendarConnected = false;
      updateCalendarStatus('Google Calendar disconnected', 'info');
    } else {
      // Connect
      await authInstance.signIn();
      googleCalendarConnected = true;
      updateCalendarStatus('Google Calendar connected successfully!', 'success');
      await syncAvailabilityWithCalendar();
    }
    
    updateConnectButtonState();
  } catch (error) {
    console.error('Error connecting to Google Calendar:', error);
    updateCalendarStatus('Error connecting to Google Calendar', 'error');
  }
}

// Calendar sync functionality
async function syncAvailabilityWithCalendar() {
  if (!googleCalendarConnected) {
    showNotification('Please connect to Google Calendar first', 'error');
    return;
  }

  try {
    showNotification('Syncing with Google Calendar...', 'info');
    
    // Get calendar events for the next 30 days
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.result.items || [];
    
    // Process events and update availability
    processCalendarEvents(events);
    
    showNotification('Calendar sync completed!', 'success');
  } catch (error) {
    console.error('Error syncing calendar:', error);
    showNotification('Error syncing with calendar', 'error');
  }
}

function processCalendarEvents(events) {
  // This would process calendar events and update availability slots
  console.log('Processing', events.length, 'calendar events');
  
  // Update availability display
  loadAvailabilitySlots();
}

// Update calendar status and button state
function updateCalendarStatus(message, type) {
  showNotification(message, type);
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

// Session management functions
async function loadSessionRequests() {
  // In a real app, this would load from Firebase
  console.log('Loading session requests...');
  
  // Demo data is already in the HTML
  const requestCards = document.querySelectorAll('.request-card');
  requestCards.forEach((card, index) => {
    // Add animation delay
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

async function loadAcceptedSessions() {
  console.log('Loading accepted sessions...');
  
  // Demo data is already in the HTML
  const sessionCards = document.querySelectorAll('.session-card');
  sessionCards.forEach((card, index) => {
    // Add animation delay
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

async function loadAvailabilitySlots() {
  console.log('Loading availability slots...');
  
  // Demo functionality - time slots are already interactive in HTML
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach(slot => {
    if (slot.classList.contains('available')) {
      slot.style.background = '#d4edda';
      slot.style.color = '#155724';
    }
  });
}

async function loadMenteeRequests(userId) {
  console.log('Loading mentee requests for user:', userId);
  // Implementation for mentee dashboard
}

async function loadProgress(userId) {
  console.log('Loading progress for user:', userId);
  // Implementation for mentee progress tracking
}

// Mentor profile edit functions
function renderMentorProfileEdit(profile) {
  const container = document.getElementById('mentorProfileEdit');
  if (!container) return;
  
  container.innerHTML = `
    <button id="showEditProfileBtn" class="action-btn">Edit Profile</button>
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
      <label>Name:</label>
      <input type="text" id="mentorName" value="${profile.name || ''}" required>
      
      <label>Bio:</label>
      <textarea id="mentorBio" rows="3">${profile.bio || ''}</textarea>
      
      <label>Skills (comma-separated):</label>
      <input type="text" id="mentorSkills" value="${(profile.skills || []).join(', ')}">
      
      <label>Interests:</label>
      <input type="text" id="mentorInterests" value="${profile.interests || ''}">
      
      <button type="submit" class="action-btn">Save Changes</button>
      <button type="button" class="action-btn" onclick="cancelProfileEdit()">Cancel</button>
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

function cancelProfileEdit() {
  const formContainer = document.getElementById('mentorProfileFormContainer');
  const editBtn = document.getElementById('showEditProfileBtn');
  
  if (formContainer) {
    formContainer.style.display = 'none';
  }
  if (editBtn) {
    editBtn.style.display = 'block';
  }
}

async function updateMentorProfile() {
  const user = firebase?.auth()?.currentUser;
  if (!user) {
    showNotification('Profile update requires authentication', 'error');
    return;
  }

  const formContainer = document.getElementById('mentorProfileFormContainer');
  const msgElement = document.getElementById('mentorProfileMsg');
  
  try {
    const data = {
      name: document.getElementById('mentorName').value,
      bio: document.getElementById('mentorBio').value,
      skills: document.getElementById('mentorSkills').value.split(',').map(s => s.trim()),
      interests: document.getElementById('mentorInterests').value
    };
    
    // In demo mode, just show success message
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
      showNotification('Profile updated successfully! (Demo mode)', 'success');
      cancelProfileEdit();
      return;
    }
    
    await db.collection('users').doc(user.uid).set(data, { merge: true });
    
    showNotification('Profile updated successfully!', 'success');
    cancelProfileEdit();
    
  } catch (err) {
    console.error('Error updating profile:', err);
    if (msgElement) {
      msgElement.textContent = 'Error: ' + err.message;
      msgElement.style.color = 'red';
    }
  }
}

// Mentor Availability functions
function renderMentorAvailability() {
  const container = document.getElementById('mentorAvailability');
  if (!container) return;
  
  container.innerHTML = `
    <h3>Add Availability Slot</h3>
    <form id="availabilityForm" style="display: flex; gap: 1rem; align-items: end; flex-wrap: wrap;">
      <div>
        <label>Date:</label>
        <input type="date" id="availableDate" required>
      </div>
      <div>
        <label>Time:</label>
        <input type="time" id="availableTime" required>
      </div>
      <button type="submit" class="action-btn">Add Slot</button>
    </form>
    <p id="availabilityMsg"></p>
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
  const user = firebase?.auth()?.currentUser;
  
  try {
    // In demo mode, just show success message
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
      showNotification(`Availability slot added: ${date} at ${time} (Demo mode)`, 'success');
      loadAvailabilitySlots();
      return;
    }
    
    if (!user) {
      showNotification('Authentication required to save availability', 'error');
      return;
    }

    await db.collection('availability').add({
      date,
      time,
      mentorId: user.uid,
      available: true,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showNotification('Availability slot added successfully!', 'success');
    loadAvailabilitySlots();
    
    // Clear form
    document.getElementById('availableDate').value = '';
    document.getElementById('availableTime').value = '';
    
  } catch (err) {
    console.error('Error saving availability:', err);
    showNotification('Error saving availability slot', 'error');
  }
}

async function removeAvailability(slotId) {
  try {
    // In demo mode, just show success message
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
      showNotification('Availability slot removed (Demo mode)', 'success');
      return;
    }
    
    await db.collection('availability').doc(slotId).update({ available: false });
    showNotification('Availability slot removed', 'success');
    loadAvailabilitySlots();
  } catch (error) {
    console.error('Error removing availability slot:', error);
    showNotification('Error removing availability slot', 'error');
  }
}

// Utility functions
function formatDate(dateString) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options);
}

// Export functions for global use
window.showSection = showSection;
window.acceptRequest = acceptRequest;
window.declineRequest = declineRequest;
window.removeAvailability = removeAvailability;
window.cancelProfileEdit = cancelProfileEdit;

console.log('Mentor dashboard JavaScript loaded successfully');