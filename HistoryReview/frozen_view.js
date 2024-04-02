// frozen_view.js



// Function to render the frozen view items
function renderFrozenView(visits) {
    // add a dom load event
    const frozenViewContainer = document.getElementById('frozenViewContainer');
    frozenViewContainer.innerHTML = '';
    // create debug code to check the visits if empty in html no need open dev tool
    if (visits.length === 0) {
        const visitElement = document.createElement('div');
        visitElement.innerHTML = `
      <p>No visits found</p>
    `;
        frozenViewContainer.appendChild(visitElement);
    }
    timelineView('frozenViewContainer').render(visits);
}
function getFilterCriteriaFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');

    if (filterParam) {
        try {
            return JSON.parse(decodeURIComponent(filterParam));
        } catch (error) {
            console.error('Error parsing filter criteria from URL:', error);
        }
    }
}
// Function to fetch filtered visits from background script
function fetchFilteredVisits() {
    const filterCriteria = getFilterCriteriaFromUrl(); // Extract filter criteria from URL (if present)

    chrome.runtime.sendMessage({ action: 'getFilteredVisits', filterCriteria: filterCriteria }, function (response) {
        if (response && response.visits) {
            renderFrozenView(response.visits); // Render the received visits
        } else {
            // Handle error or empty response
        }
    });
}
// add a lister dom load
document.addEventListener('DOMContentLoaded', function () {
    fetchFilteredVisits();
});
