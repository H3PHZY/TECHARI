// This file initializes Firebase and sets up global event listeners.

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
});

// Expose login and register to global scope for HTML onclick
window.login = login;
window.register = register;

// Function to handle user login
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "mentor-dashboard.html"; // Go to dashboard after login
    })
    .catch(error => {
      document.getElementById('message').innerText = error.message;
    });
}

// Function to handle user registration
function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "profile-setup.html"; // Go to profile setup after registration
    })
    .catch(error => {
      document.getElementById('message').innerText = error.message;
    });
}

document.getElementById('forgotPasswordLink').addEventListener('click', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  if (!email) {
    document.getElementById('message').innerText = "Please enter your email above first.";
    return;
  }
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      document.getElementById('message').innerText = "Password reset email sent! Check your inbox.";
    })
    .catch(error => {
      document.getElementById('message').innerText = error.message;
    });
});

firebase.auth().onAuthStateChanged(async user => {
  if (user) {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const profile = userDoc.data();
    if (profile.role === "mentor") {
      window.location.href = "mentor-dashboard.html";
    } else if (profile.role === "mentee") {
      window.location.href = "mentee-dashboard.html";
    }
  }
});