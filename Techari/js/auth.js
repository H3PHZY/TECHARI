// This file handles user authentication, including login, registration, and logout functionalities using Firebase Auth.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_3g_CgehkFH-Wp0BL2LH1SVoDXlSIn-E",
  authDomain: "techari-be4ba.firebaseapp.com",
  projectId: "techari-be4ba",
  storageBucket: "techari-be4ba.firebasestorage.app",
  messagingSenderId: "859355606739",
  appId: "1:859355606739:web:abfa0a666f241724932e26",
  measurementId: "G-NJYGLKFBTF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = firebase.auth();

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            document.getElementById('message').innerText = "Login successful!";
            // Redirect to role selection or dashboard
            window.location.href = "role-selection.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById('message').innerText = errorMessage;
        });
}

function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            document.getElementById('message').innerText = "Registration successful!";
            // Redirect to role selection
            window.location.href = "role-selection.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById('message').innerText = errorMessage;
        });
}

function logout() {
    auth.signOut().then(() => {
        document.getElementById('message').innerText = "Logged out successfully!";
        // Redirect to login page
        window.location.href = "index.html";
    }).catch((error) => {
        document.getElementById('message').innerText = error.message;
    });
}


