# Techari Project

## Overview
Techari is a web application designed to facilitate mentorship and learning through a structured platform. It allows users to select their roles, set up profiles, browse a mentor directory, request sessions, track progress, and access learning resources.

## Features
- **User Role Selection**: Users can choose between Mentor and Mentee roles during signup.
- **Profile Setup**: Users can create and edit their profiles, including bio, skills, and areas of interest.
- **Mentor Directory**: A searchable directory of available mentors for mentees to browse.
- **Session Request System**: Mentees can send requests to mentors for one-on-one sessions.
- **Session Dashboard**: Mentors can manage their session requests, accepting or rejecting them.
- **Progress Tracking**: Mentees can view their completed sessions and overall progress.
- **Learning Resources Page**: Curated articles, videos, and tools for users to enhance their learning.
- **Secure Routing**: Ensures that users cannot access certain pages unless they are logged in.

## Project Structure
```
Techari
├── css
│   └── style.css
├── js
│   ├── app.js
│   ├── auth.js
│   ├── roles.js
│   ├── profile.js
│   ├── mentor-directory.js
│   ├── session-request.js
│   ├── dashboard.js
│   ├── progress.js
│   ├── resources.js
│   └── router.js
├── index.html
├── role-selection.html
├── profile-setup.html
├── mentor-directory.html
├── session-request.html
├── dashboard.html
├── progress.html
├── resources.html
└── README.md
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the project in your preferred code editor.
3. Ensure you have a local server running to serve the HTML files.
4. Set up Firebase for authentication and configure it in `js/firebase-config.js`.
5. Open `index.html` in your browser to start using the application.

## Technologies Used
- HTML
- CSS
- JavaScript
- Firebase for authentication

## Contribution
Feel free to fork the repository and submit pull requests for any improvements or features you would like to add.