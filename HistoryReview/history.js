// import { TimelineView } from './timeline_view.js';
const urlParam = new URLSearchParams(window.location.search);
const view = urlParam.get('view');


// Function to render the history items
function renderHistory(visits) {
  const historyContainer = document.getElementById('historyContainer');
  historyContainer.innerHTML = '';
  // displayTimelineHistory(visits);
  timeline = timelineView('historyContainer');
  timeline.render(visits);
}

// Function to handle filter tab switching
function handleFilterTabSwitch(event) {
  const filter = event.target.dataset.filter;
  chrome.runtime.sendMessage({
    action: 'getFilteredVisits',
    filterCriteria: {
      dateRange: filter, // 'latest2Days' or 'latestWeek' or 'latestMonth' or 'allTime'
      website: ''//optional
    }
  }, function (response) {
    renderHistory(response.visits);
  });
}

// Function to handle editing and freezing a filter view
function handleEditFilter() {
  const editFilterModal = document.getElementById('editFilterModal');
  editFilterModal.style.display = 'block';
}

// Function to handle applying the edited filter
function handleApplyFilter() {
  // default value for startDate and endDate for 1 week ago
  const startDate = document.getElementById('startDate').value || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = document.getElementById('endDate').value || new Date().toISOString();
  const website = document.getElementById('website').value;

  const filterCriteria = {
    startDate: startDate,
    endDate: endDate,
    website: website
  };

  chrome.runtime.sendMessage({ action: 'createFrozenFilterView', filterCriteria: filterCriteria }, function (response) {
    const frozenViewTabId = response.tabId;
    console.log('Frozen filter view created in tab:', frozenViewTabId);
    closeEditFilterModal();
  });
}

// Function to close the edit filter modal
function closeEditFilterModal() {
  const editFilterModal = document.getElementById('editFilterModal');
  editFilterModal.style.display = 'none';
}

// Event listeners for filter tab switching and editing
const filterTabs = document.querySelectorAll('#tabSwitch button');
filterTabs.forEach(function (tab) {
  tab.addEventListener('click', handleFilterTabSwitch);
});

const editFilterButton = document.getElementById('editFilter');
editFilterButton.addEventListener('click', handleEditFilter);

const applyFilterButton = document.getElementById('applyFilterButton');
applyFilterButton.addEventListener('click', handleApplyFilter);

const closeModalButton = document.getElementById('closeModalButton');
closeModalButton.addEventListener('click', closeEditFilterModal);

// Function to populate the window select dropdown
function populateWindowSelect() {
  const windowList = document.getElementById('windowList');
  windowList.innerHTML = '';

  chrome.windows.getAll({ populate: true }, function (windows) {
    windows.forEach(function (window) {
      const option = document.createElement('option');
      option.value = window.id;
      option.text = `Window ${window.id}`;
      windowList.appendChild(option);
    });
  });
}

// Function to handle moving a tab to a different window
function handleMoveTab() {
  const windowList = document.getElementById('windowList');
  const selectedWindowId = parseInt(windowList.value);

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    chrome.runtime.sendMessage({ action: 'moveTabToWindow', tabId: currentTab.id, windowId: selectedWindowId });
  });
}

// Event listener for the "Move Tab" button
const moveTabButton = document.getElementById('moveTabButton');
moveTabButton.addEventListener('click', handleMoveTab);

// Initial population of the window select dropdown
populateWindowSelect();

// Initial rendering of the history
// chrome.runtime.sendMessage({
//   action: 'getFilteredVisits',
//   filterCriteria: {
//     dateRange: 'latest2Days', // 'latest2Days' or 'latestWeek' or 'latestMonth' or 'allTime'
//     website: ''//optional
//   }
// }, function (response) {
//   renderHistory(response.visits);
// });

function displayGroupedHistory(history) {
  const groupedHistory = {};
  history.forEach(visit => {
    const domain = new URL(visit.url).hostname;
    if (!groupedHistory[domain]) {
      groupedHistory[domain] = [];
    }
    groupedHistory[domain].push(visit);
  });

  const historyView = document.getElementById('historyContainer');
  Object.keys(groupedHistory).forEach(domain => {
    const domainSection = document.createElement('div');
    domainSection.innerHTML = `<h2>${domain}</h2>`;
    const visitsList = document.createElement('ul');
    groupedHistory[domain].forEach(visit => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = visit.url;
      link.textContent = visit.title;
      link.addEventListener('click', function (event) {
        event.preventDefault();
        focusOrCreateTab(visit.url);
      });
      listItem.appendChild(link);
      listItem.appendChild(document.createTextNode(` - ${new Date(visit.timestamp).toLocaleString()}`));
      visitsList.appendChild(listItem);
    });
    domainSection.appendChild(visitsList);
    historyView.appendChild(domainSection);
  });
}

function displayTimelineHistory(history) {
  const historyView = document.getElementById('historyContainer');
  const timelineList = document.createElement('ul');
  history.reverse().forEach(visit => {
    const listItem = document.createElement('li');
    // remote the bullet point from the list
    listItem.style.listStyle = 'none';
    listItem.style.marginBottom = '10px';
    const link = document.createElement('a');
    link.href = visit.url;
    link.textContent = visit.title;
    link.addEventListener('click', function (event) {
      event.preventDefault();
      focusOrCreateTab(visit.url);
    });

    // Add a color marker for open tabs
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (tab.url === visit.url) {
          // link.style.color = 'green';
          // add the status check if the link element already has AdjacentHTML to indicate the link is already open, no need to add the svg again
          if (link.getAttribute('data-status') !== 'open') {
            link.insertAdjacentHTML('afterbegin', `
              <svg height="20" width="10">
                <line x1="5" y1="0" x2="5" y2="20" style="stroke:rgb(255,0,0);stroke-width:2" />
              </svg>
            `);
            // add a status to indicate the link element already has AdjacentHTML
            link.setAttribute('data-status', 'open');
          }
        } else {
          link.style.color = 'gray';
        }
      });
    })

    listItem.appendChild(link);
    listItem.appendChild(document.createTextNode(` - ${new Date(visit.visitTime).toLocaleString()}`));
    timelineList.appendChild(listItem);
  });
  historyView.appendChild(timelineList);
}
// chrome.runtime.onMessage.addListener(
//   function (request, sender, sendResponse) {
//     if (request.action === "backupDatabase") {
//       // create download URL
//       let blob = new Blob([JSON.stringify(request.data)], { type: 'application/json' });
//       let url = URL.createObjectURL(blob);
//       chrome.downloads.download({ url: url, filename: 'history_backup.json' }, function () {
//         if (chrome.runtime.lastError) {
//           console.error(chrome.runtime.lastError);
//         } else {
//           console.log('History backup downloaded successfully.');
//         }
//         // It's important to release the URL once you're done to avoid memory leaks
//         URL.revokeObjectURL(url);
//       });


//       // sendResponse({ action: "open_dev_tools" });
//     }
//   }
// );

function focusOrCreateTab(url) {
  const urlWithoutFragment = url.split('#')[0];
  chrome.tabs.query({ url: urlWithoutFragment + '*' }, function (tabs) {
    if (tabs.length > 0) {
      chrome.windows.update(tabs[0].windowId, { focused: true }, function () {
        chrome.tabs.update(tabs[0].id, { active: true });
      });
    } else {
      chrome.tabs.create({ url: url });
    }
  });
}


// ... existing code ...

// Initialize the Timeline component
function initializeTimeline(visits) {
  const timelineContainer = document.getElementById('timelineContainer');
  const items = visits.map(function (visit) {
    return {
      id: visit.visitId,
      content: visit.title,
      start: new Date(visit.visitTime),
      group: visit.url
    };
  });

  const options = {
    editable: false,
    selectable: true,
    zoomable: true,
    stack: false,
    orientation: 'top',
    timeAxis: { scale: 'day', step: 1 },
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default start date (7 days ago)
    end: new Date() // Default end date (today)
  };

  const timeline = new dashjs.Timeline(timelineContainer, items, options);

  // Handle range selector change event
  timeline.on('rangechanged', function (event) {
    const startTime = event.start.getTime();
    const endTime = event.end.getTime();
    fetchVisitsByTimeRange(startTime, endTime);
  });
}

// Fetch visits by time range
function fetchVisitsByTimeRange(startTime, endTime) {
  chrome.runtime.sendMessage({ action: 'getVisitsByTimeRange', startTime: startTime, endTime: endTime }, function (response) {
    renderHistory(response.visits);
  });
}

// Initial rendering of the history
chrome.runtime.sendMessage({
  action: 'getFilteredVisits',
  filterCriteria: {
    dateRange: 'latest2Days', // 'latest2Days' or 'latestWeek' or 'latestMonth' or 'allTime'
    website: ''//optional
  }
}, function (response) {
  renderHistory(response.visits);
  initializeTimeline(response.visits);
});