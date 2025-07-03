// This file tracks and displays the mentees' completed sessions and overall progress.

document.addEventListener('DOMContentLoaded', function() {
    const progressContainer = document.getElementById('progress-container');
    const progressData = JSON.parse(localStorage.getItem('progressData')) || [];

    function displayProgress() {
        progressContainer.innerHTML = '';
        if (progressData.length === 0) {
            progressContainer.innerHTML = '<p>No progress recorded yet.</p>';
            return;
        }

        progressData.forEach(session => {
            const sessionElement = document.createElement('div');
            sessionElement.classList.add('session-progress');
            sessionElement.innerHTML = `
                <h3>${session.title}</h3>
                <p>Date Completed: ${session.date}</p>
                <p>Duration: ${session.duration} hours</p>
                <p>Notes: ${session.notes}</p>
            `;
            progressContainer.appendChild(sessionElement);
        });
    }

    function addSessionProgress(title, date, duration, notes) {
        const newSession = { title, date, duration, notes };
        progressData.push(newSession);
        localStorage.setItem('progressData', JSON.stringify(progressData));
        displayProgress();
    }

    // Example usage: Add a session progress (this can be triggered by a form submission or button click)
    // addSessionProgress('Session Title', '2023-10-01', 2, 'Learned about JavaScript basics.');

    displayProgress();
});