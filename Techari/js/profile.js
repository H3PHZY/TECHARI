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