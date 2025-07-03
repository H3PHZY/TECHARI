// This file initializes Firebase and sets up global event listeners.

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Set up event listeners for login and registration buttons
    document.getElementById('loginButton').addEventListener('click', login);
    document.getElementById('registerButton').addEventListener('click', register);
});

// Function to handle user login
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "role-selection.html";
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
      window.location.href = "role-selection.html";
    })
    .catch(error => {
      document.getElementById('message').innerText = error.message;
    });
}