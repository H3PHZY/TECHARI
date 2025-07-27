// Authentication handler with role-based routing (Fixed)
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();

    let isLoginMode = true;
    let isLoading = false;
    let userClickedLogin = false; // Track if user intentionally clicked login

    // Make functions globally accessible
    window.togglePassword = togglePassword;
    window.login = login;
    window.register = register;
    window.googleSignIn = googleSignIn;
    window.toggleMode = toggleMode;

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

    // Function to check user role and redirect accordingly
    async function redirectBasedOnRole(user) {
        try {
            const userProfile = await db.collection('profiles').doc(user.uid).get();
            
            if (userProfile.exists) {
                const userData = userProfile.data();
                const userRole = userData.role;
                
                console.log('User role:', userRole);
                
                if (userRole === 'mentor') {
                    window.location.href = "mentor-dashboard.html";
                } else if (userRole === 'mentee') {
                    window.location.href = "mentee-dashboard.html";
                } else {
                    // If role is not set, redirect to role selection
                    window.location.href = "profile-setup.html";
                }
            } else {
                // If no profile exists, redirect to profile setup
                console.log('No profile found, redirecting to setup');
                window.location.href = "profile-setup.html";
            }
        } catch (error) {
            console.error('Error checking user role:', error);
            // Fallback to profile setup if there's an error
            window.location.href = "profile-setup.html";
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
        
        userClickedLogin = true; // User intentionally wants to login
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showMessage('Please fill in all fields');
            userClickedLogin = false;
            return;
        }

        if (!email.includes('@')) {
            showMessage('Please enter a valid email address');
            userClickedLogin = false;
            return;
        }

        setLoading(true, 'loginBtn');

        auth.signInWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                showMessage('Login successful! Redirecting...', 'success');
                
                // Wait a moment then redirect based on role
                setTimeout(async () => {
                    await redirectBasedOnRole(user);
                }, 1000);
            })
            .catch((error) => {
                setLoading(false, 'loginBtn');
                userClickedLogin = false;
                
                let errorMessage = 'Login failed. ';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage += 'No account found with this email.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage += 'Incorrect password.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage += 'Invalid email address.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage += 'Too many failed attempts. Try again later.';
                        break;
                    default:
                        errorMessage += error.message;
                }
                
                showMessage(errorMessage);
            });
    }

    function register() {
        if (isLoading) return;

        const name = document.getElementById('name').value;
        const role = document.getElementById('role').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!name || !role || !email || !password) {
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

                // Save profile to Firestore
                db.collection('profiles').doc(user.uid).set({
                    name: name,
                    email: email,
                    role: role,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    showMessage('Registration successful! Redirecting to setup...', 'success');

                    setTimeout(() => {
                        window.location.href = "profile-setup.html";
                    }, 1500);
                }).catch((error) => {
                    setLoading(false, 'registerBtn');
                    showMessage("Error saving profile: " + error.message);
                });
            })
            .catch((error) => {
                setLoading(false, 'registerBtn');
                let errorMessage = 'Registration failed. ';

                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage += 'An account with this email already exists.';
                        break;
                    case 'auth/weak-password':
                        errorMessage += 'Password should be at least 6 characters.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage += 'Invalid email address.';
                        break;
                    default:
                        errorMessage += error.message;
                }

                showMessage(errorMessage);
            });
    }

    // Set mentee name dynamically after login
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const db = firebase.firestore();
            db.collection("profiles").doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    const displayName = data.name || "Mentee";
                    const nameElement = document.getElementById("menteeNameDisplay");
                    if (nameElement) {
                        nameElement.textContent = displayName;
                    }
                } else {
                    console.log("No profile found for this user.");
                }
            }).catch((error) => {
                console.error("Error getting profile:", error);
            });
        }
    });


    function googleSignIn() {
        if (isLoading) return;
        
        userClickedLogin = true; // User intentionally wants to sign in
        
        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
            .then(async (result) => {
                const user = result.user;
                const isNewUser = result.additionalUserInfo.isNewUser;
                
                showMessage('Google sign in successful! Redirecting...', 'success');
                
                setTimeout(async () => {
                    if (isNewUser) {
                        // New user - redirect to profile setup
                        window.location.href = "profile-setup.html";
                    } else {
                        // Existing user - check role and redirect accordingly
                        await redirectBasedOnRole(user);
                    }
                }, 1500);
            })
            .catch((error) => {
                userClickedLogin = false;
                
                let errorMessage = 'Google sign in failed. ';
                
                switch (error.code) {
                    case 'auth/popup-closed-by-user':
                        errorMessage += 'Sign in was cancelled.';
                        break;
                    case 'auth/popup-blocked':
                        errorMessage += 'Popup was blocked. Please allow popups and try again.';
                        break;
                    default:
                        errorMessage += error.message;
                }
                
                showMessage(errorMessage);
            });
    }

    // Add logout function for testing
    function logout() {
        auth.signOut().then(() => {
            showMessage('Logged out successfully', 'success');
            userClickedLogin = false;
            // Clear form fields
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
        }).catch((error) => {
            showMessage('Error logging out: ' + error.message);
        });
    }

    // Make logout available globally for testing
    window.logout = logout;

    // Add ripple effect to buttons
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
                showMessage('Error sending reset email: ' + error.message);
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

    // FIXED: Check auth state but don't auto-redirect unless user clicked login
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log('User is already signed in:', user.email);
            
            // Only show a message, don't auto-redirect
            if (!userClickedLogin) {
                showMessage(`Already signed in as ${user.email}. Click "Sign In" to go to your dashboard.`, 'info');
            }
        } else {
            console.log('No user is currently signed in');
            userClickedLogin = false;
        }
    });
});