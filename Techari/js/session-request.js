// This file handles the session request system, allowing mentees to send requests to mentors for 1:1 sessions.

document.addEventListener('DOMContentLoaded', function() {
    const requestForm = document.getElementById('session-request-form');
    const messageElement = document.getElementById('message');

    requestForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const mentorId = document.getElementById('mentor-id').value;
        const menteeId = getCurrentUserId(); // Function to get the current user's ID
        const sessionDate = document.getElementById('session-date').value;
        const sessionTime = document.getElementById('session-time').value;

        if (!mentorId || !sessionDate || !sessionTime) {
            messageElement.textContent = 'Please fill in all fields.';
            return;
        }

        const sessionRequest = {
            mentorId: mentorId,
            menteeId: menteeId,
            date: sessionDate,
            time: sessionTime,
            status: 'pending'
        };

        sendSessionRequest(sessionRequest)
            .then(() => {
                messageElement.textContent = 'Session request sent successfully!';
                requestForm.reset();
            })
            .catch(error => {
                messageElement.textContent = 'Error sending request: ' + error.message;
            });
    });
});

function getCurrentUserId() {
    // Placeholder function to get the current user's ID
    // This should be replaced with actual logic to retrieve the user's ID
    return 'currentUserId';
}

function sendSessionRequest(request) {
    // Placeholder function to send the session request to the server
    // This should be replaced with actual logic to send the request
    return new Promise((resolve, reject) => {
        // Simulate a successful request
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}