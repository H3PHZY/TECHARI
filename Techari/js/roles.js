// This file manages user role selection during signup and updates user profiles based on their selected roles (Mentor or Mentee).

// Make sure Firebase is initialized via firebase-config.js
auth.onAuthStateChanged(user => {
  console.log("🌟 Auth state changed. Current user:", user);
});

document.getElementById('mentorButton').addEventListener('click', () => {
  saveRole('mentor');
});

document.getElementById('menteeButton').addEventListener('click', () => {
  saveRole('mentee');
});

function saveRole(selectedRole) {
  const user = auth.currentUser;
  console.log("Current user:", user);
  if (!user) {
    document.getElementById('message').innerText = "No user logged in.";
    return;
  }

  db.collection('users').doc(user.uid).set({
    role: selectedRole
  }, { merge: true })
    .then(() => {
      window.location.href = "profile-setup.html";
    })
    .catch((error) => {
      document.getElementById('message').innerText = error.message;
    });
}

// Optional: Protect the page by redirecting if not logged in
auth.onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = "index.html";
  }
});