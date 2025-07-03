// This file manages the session dashboard, enabling mentors to accept or reject session requests from mentees.

document.addEventListener('DOMContentLoaded', function() {
    const sessionRequestsContainer = document.getElementById('session-requests');
    const messageElement = document.getElementById('message');

    // Fetch session requests from the database
    function fetchSessionRequests() {
        // Simulated fetch from a database
        const sessionRequests = [
            { id: 1, mentee: 'John Doe', status: 'pending' },
            { id: 2, mentee: 'Jane Smith', status: 'pending' }
        ];

        displaySessionRequests(sessionRequests);
    }

    // Display session requests in the dashboard
    function displaySessionRequests(requests) {
        sessionRequestsContainer.innerHTML = '';
        requests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.classList.add('request');
            requestElement.innerHTML = `
                <p>Mentee: ${request.mentee}</p>
                <button onclick="acceptRequest(${request.id})">Accept</button>
                <button onclick="rejectRequest(${request.id})">Reject</button>
            `;
            sessionRequestsContainer.appendChild(requestElement);
        });
    }

    // Accept a session request
    window.acceptRequest = function(requestId) {
        // Simulated acceptance logic
        messageElement.textContent = `Session request ${requestId} accepted.`;
        // Here you would typically update the database
    };

    // Reject a session request
    window.rejectRequest = function(requestId) {
        // Simulated rejection logic
        messageElement.textContent = `Session request ${requestId} rejected.`;
        // Here you would typically update the database
    };

    // Initial fetch of session requests
    fetchSessionRequests();
});