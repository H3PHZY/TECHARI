window.addEventListener('load', function () {
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    const storage = firebase.storage();

    const roleInput = document.getElementById('role');
    const roleButtons = document.querySelectorAll('.role-btn');
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');

    console.log("Found role buttons:", roleButtons.length);

    // Role Selection Logic
    roleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const selectedRole = this.getAttribute('data-role');

            // Clear active from others
            roleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Set hidden input value
            roleInput.value = selectedRole;
            console.log("Selected role:", selectedRole);
        });
    });

    // Update file label on change
    const photoInput = document.getElementById('photo');
    const photoLabel = document.getElementById('photoLabel');
    if (photoInput && photoLabel) {
        photoInput.addEventListener('change', function () {
            const fileName = this.files[0] ? this.files[0].name : 'Click to upload profile photo';
            photoLabel.querySelector('.file-upload-text').textContent = fileName;
        });
    }

    // Form Submission
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            role: roleInput.value,
            interests: document.getElementById('interests').value.trim(),
            bio: document.getElementById('bio').value.trim(),
            availability: document.getElementById('availability').value
        };

        // Validation
        if (!formData.role) {
            showMessage("Please select a role (Mentor or Mentee)", "error");
            return;
        }

        if (!formData.name || !formData.email || !formData.password || !formData.availability) {
            showMessage("Please fill in all required fields.", "error");
            return;
        }

        // Disable form during submission
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Creating Account...';

        try {
            console.log("Creating user account...");
            showMessage("Creating your account...", "info");
            
            // Create user account first
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password);
            const user = userCredential.user;
            
            console.log("User created successfully:", user.uid);
            showMessage("Account created! Setting up profile...", "info");

            // Prepare profile data (without photo for now)
            const profileData = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                interests: formData.interests,
                bio: formData.bio,
                availability: formData.availability,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: user.uid,
                hasPhoto: false // Flag to track if user has uploaded photo
            };

            // Check if photo was selected
            const photoFile = photoInput.files[0];
            if (photoFile) {
                console.log("Photo selected but skipping upload due to CORS issues in local development");
                showMessage("Account created! Photo upload will be available after deployment. Setting up profile...", "warning");
                // Store photo info for later upload
                profileData.pendingPhotoUpload = true;
                profileData.photoFileName = photoFile.name;
                profileData.photoSize = photoFile.size;
            }

            // Save profile data to Firestore
            console.log("Saving profile data to Firestore...");
            await db.collection('profiles').doc(user.uid).set(profileData);
            
            console.log("Profile saved successfully");
            showMessage("Account created successfully! Redirecting to your dashboard...", "success");

            // Redirect based on role after a short delay
            setTimeout(() => {
                if (formData.role === "mentor") {
                    console.log("Redirecting to mentor dashboard");
                    window.location.href = "mentor-dashboard.html";
                } else if (formData.role === "mentee") {
                    console.log("Redirecting to mentee dashboard");
                    window.location.href = "mentee-dashboard.html";
                } else {
                    console.log("Role not recognized, redirecting to home");
                    window.location.href = "index.html";
                }
            }, 2000);

        } catch (error) {
            console.error("Error creating account:", error);
            
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            // Handle specific Firebase errors
            let errorMessage = "Error creating account: ";
            
            if (error.code) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = "This email is already registered. Please try signing in instead.";
                        break;
                    case 'auth/weak-password':
                        errorMessage = "Password should be at least 6 characters long.";
                        break;
                    case 'auth/invalid-email':
                        errorMessage = "Please enter a valid email address.";
                        break;
                    case 'permission-denied':
                        errorMessage = "Permission denied. Please check Firebase configuration.";
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = "Network error. Please check your internet connection.";
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = "Email/password authentication is not enabled in Firebase.";
                        break;
                    default:
                        errorMessage += error.message;
                }
            } else {
                errorMessage += error.message || "Unknown error occurred.";
            }
            
            showMessage(errorMessage, "error");
        }
    });

    function showMessage(message, type = 'info') {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide message after 7 seconds (except for info messages during processing)
        if (type !== 'info' || message.includes('Redirecting')) {
            setTimeout(() => {
                if (messageDiv.textContent === message) {
                    messageDiv.textContent = "";
                    messageDiv.className = "message";
                    messageDiv.style.display = 'none';
                }
            }, 7000);
        }
    }
});