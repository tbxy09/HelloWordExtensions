// frozen_view.js

// Function to render the frozen view items
function renderFrozenView(visits) {
    const frozenViewContainer = document.getElementById('frozenViewContainer');
    frozenViewContainer.innerHTML = '';

    visits.forEach(function (visit) {
        const visitElement = document.createElement('div');
        visitElement.innerHTML = `
      <p>${visit.title}</p>
      <p>${visit.url}</p>
      <p>Status: ${visit.status}</p>
      <!-- Add connection and opened indicators -->
    `;
        frozenViewContainer.appendChild(visitElement);
    });
} // Add this closing curly brace
