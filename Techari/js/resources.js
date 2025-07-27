// This file manages the learning resources page, displaying curated articles, videos, and tools for users.

document.addEventListener('DOMContentLoaded', function() {
    const resourcesContainer = document.getElementById('resources-container');

    const resources = [
        {
            title: 'JavaScript Basics',
            link: 'https://www.example.com/javascript-basics',
            description: 'A comprehensive guide to JavaScript for beginners.'
        },
        {
            title: 'CSS Flexbox Guide',
            link: 'https://www.example.com/css-flexbox',
            description: 'Learn how to use Flexbox for responsive layouts.'
        },
        {
            title: 'HTML5 Introduction',
            link: 'https://www.example.com/html5-introduction',
            description: 'An introduction to the new features of HTML5.'
        },
        {
            title: 'Firebase Authentication',
            link: 'https://firebase.google.com/docs/auth',
            description: 'Official Firebase documentation for authentication.'
        },
        {
            title: 'Web Development Resources',
            link: 'https://www.example.com/web-development-resources',
            description: 'A collection of resources for web developers.'
        }
    ];

    resources.forEach(resource => {
        const resourceElement = document.createElement('div');
        resourceElement.classList.add('resource');

        const titleElement = document.createElement('h3');
        titleElement.textContent = resource.title;

        const linkElement = document.createElement('a');
        linkElement.href = resource.link;
        linkElement.textContent = 'Read more';
        linkElement.target = '_blank';

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = resource.description;

        resourceElement.appendChild(titleElement);
        resourceElement.appendChild(linkElement);
        resourceElement.appendChild(descriptionElement);
        resourcesContainer.appendChild(resourceElement);
    });
});