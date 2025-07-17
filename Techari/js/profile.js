// This file manages the profile setup and editing functionalities, allowing users to input their bio, skills, and areas of interest.

document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profile-form');
    const bioInput = document.getElementById('bio');
    const skillsInput = document.getElementById('skills');
    const interestsInput = document.getElementById('interests');
    const messageElement = document.getElementById('message');

    // Load existing profile data if available
    loadProfileData();

    profileForm.addEventListener('submit', function(event) {
        event.preventDefault();
        saveProfileData();
    });

    function loadProfileData() {
        const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        bioInput.value = userProfile.bio || '';
        skillsInput.value = userProfile.skills || '';
        interestsInput.value = userProfile.interests || '';
    }

    function saveProfileData() {
        const userProfile = {
            bio: bioInput.value,
            skills: skillsInput.value,
            interests: interestsInput.value
        };

        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        messageElement.textContent = 'Profile saved successfully!';
        messageElement.style.color = 'green';
    }
});

// profile.js
// Handles profile setup, including photo upload to Firebase Storage and saving profile to Firestore

document.addEventListener('DOMContentLoaded', function() {
  // Remove localStorage logic and use only Firestore

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const storage = firebase.storage();

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      document.getElementById('email').value = user.email;
    } else {
      window.location.href = "index.html";
    }
  });

  document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;

    const role = document.getElementById('role').value;
    const name = document.getElementById('name').value;
    const interests = document.getElementById('interests').value;
    const bio = document.getElementById('bio').value;
    const availability = document.getElementById('availability').value;
    const photoFile = document.getElementById('photo').files[0];
    let photoURL = "";

    // Upload photo if selected
    if (photoFile) {
      const allowedTypes = ['image/png', 'image/jpeg'];
      if (!allowedTypes.includes(photoFile.type)) {
        document.getElementById('profileMessage').innerText = "Photo must be PNG or JPEG.";
        return;
      }
      const storageRef = storage.ref(`profile_photos/${user.uid}`);
      try {
        await storageRef.put(photoFile);
        photoURL = await storageRef.getDownloadURL();
      } catch (err) {
        document.getElementById('profileMessage').innerText = "Photo upload failed: " + err.message;
        return;
      }
    }

    const profileData = {
      role,
      name,
      email: user.email,
      photo: photoURL,
      interests,
      bio,
      availability
    };

    try {
      await db.collection('users').doc(user.uid).set(profileData, { merge: true });
      document.getElementById('profileMessage').innerText = "Profile saved!";
      // Redirect to dashboard based on role
      if (role === "mentor") {
        window.location.href = "mentor-dashboard.html";
      } else {
        window.location.href = "mentee-dashboard.html";
      }
    } catch (error) {
      document.getElementById('profileMessage').innerText = "Profile could not be saved. Please register again. Error: " + error.message;
      // Sign out and redirect to registration/login page
      await firebase.auth().signOut();
      setTimeout(function() {
        window.location.href = "index.html";
      }, 2500);
    }
  });
});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in, populate email field
        document.getElementById('email').value = user.email;
        
        // Check if user already has a profile
        checkExistingProfile(user.uid);
    } else {
        // User is not signed in, redirect to login
        window.location.href = 'login.html';
    }
});

// Check if user already has a profile
function checkExistingProfile(userId) {
    firebase.firestore().collection('profiles').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const profileData = doc.data();
                // User already has a profile, redirect to appropriate dashboard
                redirectToDashboard(profileData.role);
            }
        })
        .catch(error => {
            console.error('Error checking existing profile:', error);
        });
}

// Handle form submission
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) {
        showMessage('Please log in first', 'error');
        return;
    }
    
    // Get form data
    const profileData = {
        role: document.getElementById('role').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        photo: document.getElementById('photo').value,
        interests: document.getElementById('interests').value,
        bio: document.getElementById('bio').value,
        availability: document.getElementById('availability').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        userId: user.uid
    };
    
    // Validate required fields
    if (!profileData.role || !profileData.name) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading message
    showMessage('Saving profile...', 'info');
    
    // Save profile to Firestore
    firebase.firestore().collection('profiles').doc(user.uid).set(profileData)
        .then(() => {
            showMessage('Profile saved successfully!', 'success');
            
            // Redirect based on role after a short delay
            setTimeout(() => {
                redirectToDashboard(profileData.role);
            }, 1500);
        })
        .catch(error => {
            console.error('Error saving profile:', error);
            showMessage('Error saving profile: ' + error.message, 'error');
        });
});

// Function to redirect to appropriate dashboard
function redirectToDashboard(role) {
    if (role === 'mentor') {
        window.location.href = 'mentor-dashboard.html';
    } else if (role === 'mentee') {
        window.location.href = 'mentee-dashboard.html';
    } else {
        console.error('Unknown role:', role);
        showMessage('Error: Unknown role selected', 'error');
    }
}

// Function to show messages to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('profileMessage');
    messageDiv.textContent = message;
    messageDiv.className = type; // 'success', 'error', or 'info'
    
    // Clear message after 3 seconds (except for loading messages)
    if (type !== 'info') {
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }, 3000);
    }
}

// Optional: Add real-time validation for role selection
document.getElementById('role').addEventListener('change', function() {
    const selectedRole = this.value;
    if (selectedRole) {
        // You can add role-specific field modifications here if needed
        console.log('Selected role:', selectedRole);
    }
});

// Optional: Add form validation
function validateForm() {
    const role = document.getElementById('role').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    if (!role) {
        showMessage('Please select a role', 'error');
        return false;
    }
    
    if (!name.trim()) {
        showMessage('Please enter your name', 'error');
        return false;
    }
    
    if (!email.trim()) {
        showMessage('Email is required', 'error');
        return false;
    }
    
    return true;
}