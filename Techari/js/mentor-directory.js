// This file retrieves and displays the list of available mentors for mentees to browse.

document.addEventListener('DOMContentLoaded', function() {
    const mentorList = document.getElementById('mentor-list');

    // Function to fetch mentors from the database
    function fetchMentors() {
        // Simulated fetch from a database or API
        const mentors = [
            { id: 1, name: 'John Doe', expertise: 'Web Development' },
            { id: 2, name: 'Jane Smith', expertise: 'Data Science' },
            { id: 3, name: 'Emily Johnson', expertise: 'Graphic Design' }
        ];

        displayMentors(mentors);
    }

    // Function to display mentors in the HTML
    function displayMentors(mentors) {
        mentorList.innerHTML = ''; // Clear existing list
        mentors.forEach(mentor => {
            const mentorItem = document.createElement('div');
            mentorItem.classList.add('mentor-item');
            mentorItem.innerHTML = `
                <h3>${mentor.name}</h3>
                <p>Expertise: ${mentor.expertise}</p>
                <button onclick="requestSession(${mentor.id})">Request Session</button>
            `;
            mentorList.appendChild(mentorItem);
        });
    }

    // Function to handle session request
    window.requestSession = function(mentorId) {
        alert(`Session requested with mentor ID: ${mentorId}`);
        // Here you would typically send a request to the server
    };

    // Fetch mentors on page load
    fetchMentors();
});