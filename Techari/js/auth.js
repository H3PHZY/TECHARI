// This file handles user authentication, including login, registration, and logout functionalities using Firebase Auth.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Firebase configuration
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
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();

        let isLoginMode = true;
        let isLoading = false;

        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleButton = document.querySelector('.password-toggle');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleButton.textContent = 'Hide';
            } else {
                passwordInput.type = 'password';
                toggleButton.textContent = 'Show';
            }
        }

        function showMessage(message, type = 'error') {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }

        function setLoading(loading, buttonId) {
            isLoading = loading;
            const button = document.getElementById(buttonId);
            
            if (loading) {
                const originalText = button.textContent;
                button.innerHTML = '<span class="loading"></span>' + (buttonId === 'loginBtn' ? 'Signing In...' : 'Creating Account...');
                button.disabled = true;
                button.dataset.originalText = originalText;
            } else {
                button.innerHTML = button.dataset.originalText || (buttonId === 'loginBtn' ? 'Sign In' : 'Create Account');
                button.disabled = false;
            }
        }

        function toggleMode() {
            isLoginMode = !isLoginMode;
            
            const welcomeTitle = document.getElementById('welcomeTitle');
            const welcomeSubtitle = document.getElementById('welcomeSubtitle');
            const loginBtn = document.getElementById('loginBtn');
            const registerBtn = document.getElementById('registerBtn');
            const loginOptions = document.getElementById('loginOptions');
            const modeToggle = document.getElementById('modeToggle');
            
            if (isLoginMode) {
                welcomeTitle.textContent = 'Welcome back!';
                welcomeSubtitle.textContent = 'Sign in to continue your mentorship journey';
                loginBtn.style.display = 'block';
                registerBtn.style.display = 'none';
                loginOptions.style.display = 'flex';
                modeToggle.textContent = "Don't have an account? Sign up here";
            } else {
                welcomeTitle.textContent = 'Create your account';
                welcomeSubtitle.textContent = 'Join Techari and start your mentorship journey';
                loginBtn.style.display = 'none';
                registerBtn.style.display = 'block';
                loginOptions.style.display = 'none';
                modeToggle.textContent = 'Already have an account? Sign in here';
            }
            
            // Clear any existing messages
            document.getElementById('message').style.display = 'none';
        }

        function login() {
            if (isLoading) return;
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showMessage('Please fill in all fields');
                return;
            }

            if (!email.includes('@')) {
                showMessage('Please enter a valid email address');
                return;
            }

            setLoading(true, 'loginBtn');

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = "role-selection.html";
                    }, 1500);
                })
                .catch((error) => {
                    setLoading(false, 'loginBtn');
                    const errorMessage = error.message;
                    showMessage(errorMessage);
                });
        }

        function register() {
            if (isLoading) return;
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showMessage('Please fill in all fields');
                return;
            }

            if (!email.includes('@')) {
                showMessage('Please enter a valid email address');
                return;
            }

            if (password.length < 6) {
                showMessage('Password must be at least 6 characters long');
                return;
            }

            setLoading(true, 'registerBtn');

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    showMessage('Registration successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = "role-selection.html";
                    }, 1500);
                })
                .catch((error) => {
                    setLoading(false, 'registerBtn');
                    const errorMessage = error.message;
                    showMessage(errorMessage);
                });
        }

        function googleSignIn() {
            if (isLoading) return;
            
            const provider = new firebase.auth.GoogleAuthProvider();
            
            auth.signInWithPopup(provider)
                .then((result) => {
                    const user = result.user;
                    showMessage('Google sign in successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = "role-selection.html";
                    }, 1500);
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    showMessage(errorMessage);
                });
        }

        // Add ripple effect to buttons
        document.addEventListener('DOMContentLoaded', function() {
            const buttons = document.querySelectorAll('.auth-button, .google-button');
            
            buttons.forEach(button => {
                button.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';
                    ripple.style.position = 'absolute';
                    ripple.style.borderRadius = '50%';
                    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
                    ripple.style.transform = 'scale(0)';
                    ripple.style.animation = 'ripple 0.6s linear';
                    ripple.style.pointerEvents = 'none';
                    
                    this.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                });
            });
        });

        // Handle forgot password
        document.getElementById('forgotPasswordLink').addEventListener('click', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            
            if (!email) {
                showMessage('Please enter your email address first');
                return;
            }
            
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    showMessage('Password reset email sent! Check your inbox.', 'success');
                })
                .catch((error) => {
                    showMessage(error.message);
                });
        });

        // Handle Enter key press
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (isLoginMode) {
                    login();
                } else {
                    register();
                }
            }
        });