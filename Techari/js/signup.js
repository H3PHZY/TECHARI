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

    console.log("Found role buttons:", roleButtons.length); // DEBUG: Should be 2

    // Fix: Role Selection Logic
    roleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const selectedRole = this.getAttribute('data-role');

            // Clear active from others
            roleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Set hidden input value
            roleInput.value = selectedRole;
            console.log("Selected role:", selectedRole); // DEBUG
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

        if (!formData.role) {
            showMessage("Please select a role (Mentor or Mentee)", "error");
            return;
        }

        if (!formData.name || !formData.email || !formData.password || !formData.availability) {
            showMessage("Please fill in all required fields.", "error");
            return;
        }

        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password);
            const user = userCredential.user;

            const profileData = {
                ...formData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: user.uid
            };

            const photoFile = photoInput.files[0];
            if (photoFile) {
                const allowedTypes = ['image/jpeg', 'image/png'];
                if (!allowedTypes.includes(photoFile.type)) {
                    showMessage("Photo must be JPEG or PNG.", "error");
                    return;
                }

                const photoRef = storage.ref(`profile_photos/${user.uid}`);
                await photoRef.put(photoFile);
                profileData.photo = await photoRef.getDownloadURL();
            }

            await db.collection('profiles').doc(user.uid).set(profileData);

            showMessage("Account created successfully!", "success");
            console.log("Redirecting to:", formData.role);

            setTimeout(() => {
                if (formData.role === "mentor") {
                    window.location.href = "mentor-dashboard.html";
                } else if (formData.role === "mentee") {
                    window.location.href = "mentee-dashboard.html";
                }
            }, 1500);
        } catch (error) {
            console.error("Error creating account:", error);
            showMessage("Error creating account: " + error.message, "error");
        }
    });


    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        setTimeout(() => {
            messageDiv.textContent = "";
            messageDiv.className = "message";
        }, 4000);
    }
});
