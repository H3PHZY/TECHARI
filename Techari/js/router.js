// This file handles secure routing, ensuring that users cannot access certain pages unless they are logged in.

const router = (function() {
    const routes = {
        '/': 'index.html',
        '/role-selection': 'role-selection.html',
        '/profile-setup': 'profile-setup.html',
        '/mentor-directory': 'mentor-directory.html',
        '/session-request': 'session-request.html',
        '/dashboard': 'mentor-dashboard.html',
        '/progress': 'progress.html',
        '/resources': 'resources.html',
    };

    function isAuthenticated() {
        // Check if the user is authenticated (this should be replaced with actual authentication logic)
        return !!localStorage.getItem('user'); // Example: check local storage for user data
    }

    function navigateTo(path) {
        if (routes[path]) {
            if (path === '/dashboard' || path === '/mentor-directory' || path === '/session-request' || path === '/progress' || path === '/resources') {
                if (!isAuthenticated()) {
                    alert('You must be logged in to access this page.');
                    window.location.href = '/'; // Redirect to login page
                    return;
                }
            }
            window.location.href = routes[path];
        } else {
            console.error('Route not found:', path);
        }
    }

    return {
        navigateTo,
    };
})();

// Example usage: router.navigateTo('/dashboard');