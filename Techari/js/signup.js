document.addEventListener('DOMContentLoaded', function () {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const storage = firebase.storage();

    const roleInput = document.getElementById('role');
    const roleButtons = document.querySelectorAll('.role-btn');
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');

    // Handle role selection
    roleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            roleButtons.forEach(b => b.classList.remove('selected')); // Optional highlight
            this.classList.add('selected');
            roleInput.value = this.dataset.role;
        });
    });

    // Check authentication and populate email
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            document.getElementById('email').value = user.email;
            checkExistingProfile(user.uid);
        } else {
            window.location.href = "index.html";
        }
    });

    // Form submit
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const user = firebase.auth().currentUser;
        if (!user) {
            showMessage("User not authenticated", "error");
            return;
        }

        const profileData = {
            role: roleInput.value,
            name: document.getElementById('name').value.trim(),
            email: user.email,
            interests: document.getElementById('interests').value.trim(),
            bio: document.getElementById('bio').value.trim(),
            availability: document.getElementById('availability').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            userId: user.uid
        };

        // Validate required fields
        if (!profileData.role || !profileData.name || !profileData.availability) {
            showMessage("Please fill in all required fields.", "error");
            return;
        }

        // Handle photo upload
        const photoFile = document.getElementById('photo').files[0];
        if (photoFile) {
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(photoFile.type)) {
                showMessage("Photo must be JPEG or PNG.", "error");
                return;
            }
            try {
                const photoRef = storage.ref(`profile_photos/${user.uid}`);
                await photoRef.put(photoFile);
                profileData.photo = await photoRef.getDownloadURL();
            } catch (err) {
                showMessage("Photo upload failed: " + err.message, "error");
                return;
            }
        }

        try {
            await db.collection('profiles').doc(user.uid).set(profileData, { merge: true });
            showMessage("Profile saved successfully!", "success");

            // Redirect after short delay
            setTimeout(() => {
                if (profileData.role === "mentor") {
                    window.location.href = "mentor-dashboard.html";
                } else {
                    window.location.href = "mentee-dashboard.html";
                }
            }, 1500);
        } catch (err) {
            console.error("Error saving profile:", err);
            showMessage("Error saving profile: " + err.message, "error");
        }
    });

    function checkExistingProfile(uid) {
        db.collection('profiles').doc(uid).get().then(doc => {
            if (doc.exists) {
                const role = doc.data().role;
                if (role === "mentor") {
                    window.location.href = "mentor-dashboard.html";
                } else if (role === "mentee") {
                    window.location.href = "mentee-dashboard.html";
                }
            }
        });
    }

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = type; // success, error, etc.
        setTimeout(() => {
            messageDiv.textContent = "";
            messageDiv.className = "";
        }, 4000);
    }
});

document.addEventListener("DOMContentLoaded", function () {
  const roleButtons = document.querySelectorAll(".role-btn");
  const roleInput = document.getElementById("role");

  roleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      roleButtons.forEach((b) => b.classList.remove("selected")); // Clear all
      this.classList.add("selected"); // Highlight selected
      roleInput.value = this.getAttribute("data-role"); // Set hidden field
    });
  });
});

// Role button selection
const roleButtons = document.querySelectorAll('.role-btn');
const roleInput = document.getElementById('role');

roleButtons.forEach(button => {
  button.addEventListener('click', () => {
    roleButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    roleInput.value = button.getAttribute('data-role');
  });
});


document.getElementById('signupForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const availability = document.getElementById('availability').value;
  const bio = document.getElementById('bio').value;
  const interests = document.getElementById('interests').value;

  if (!role) {
    document.getElementById('message').textContent = "Please select a role (Mentor or Mentee)";
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;

      return firebase.firestore().collection('users').doc(user.uid).set({
        name,
        email,
        role,
        availability,
        bio,
        interests
      }).then(() => {
        // Redirect based on role
        if (role === "mentor") {
          window.location.href = "mentor-dashboard.html";
        } else {
          window.location.href = "mentee-dashboard.html";
        }
      });
    })
    .catch(error => {
      document.getElementById('message').textContent = error.message;
    });
});
