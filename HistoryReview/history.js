console.log("history.js");
const urlParams = new URLSearchParams(window.location.search);
const view = urlParams.get('view');

// chrome.storage.local.get('history', function (data) {
//   const history = data.history || [];
//   if (view === 'grouped') {
//     displayGroupedHistory(history);
//   } else if (view === 'timeline') {
//     displayTimelineHistory(history);
//   }
// });

// history.js

// Function to render the history items
function renderHistory(visits) {
  const historyContainer = document.getElementById('historyContainer');
  historyContainer.innerHTML = '';
  if (visits.length === 0) {
    historyContainer.innerHTML = '<p>No history found</p>';
    return;
  }
  view = "some"
  if (view === 'grouped') {
    displayGroupedHistory(visits);
  } else if (view === 'timeline') {
    displayTimelineHistory(visits);
  } else {
    visits.forEach(function (visit) {
      const visitElement = document.createElement('div');
      visitElement.innerHTML = `
        <p>${visit.title}</p>
        <p>${visit.url}</p>
        <p>Status: ${visit.status}</p>
        <!-- Add connection and opened indicators -->
      `;
      historyContainer.appendChild(visitElement);
    });
  }


  // visits.forEach(function (visit) {
  //   const visitElement = document.createElement('div');
  //   visitElement.innerHTML = `
  //     <p>${visit.title}</p>
  //     <p>${visit.url}</p>
  //     <p>Status: ${visit.status}</p>
  //     <!-- Add connection and opened indicators -->
  //   `;
  //   historyContainer.appendChild(visitElement);
  // });
}

// Function to handle filter tab switching
function handleFilterTabSwitch(event) {
  const filter = event.target.dataset.filter;
  chrome.runtime.sendMessage({ action: 'getFilteredVisits', filter: filter }, function (response) {
    renderHistory(response.visits);
  });
}

// Function to handle editing and freezing a filter view
function handleEditFilter() {
  // Implement the logic to edit and freeze a filter view
  // You can prompt the user for filter criteria and create a new tab with the frozen filter view
}

// Event listeners for filter tab switching and editing
const filterTabs = document.querySelectorAll('#tabSwitch button');
filterTabs.forEach(function (tab) {
  tab.addEventListener('click', handleFilterTabSwitch);
});

const editFilterButton = document.getElementById('editFilter');
editFilterButton.addEventListener('click', handleEditFilter);


function displayGroupedHistory(history) {
  const groupedHistory = {};
  history.forEach(visit => {
    const domain = new URL(visit.url).hostname;
    if (!groupedHistory[domain]) {
      groupedHistory[domain] = [];
    }
    groupedHistory[domain].push(visit);
  });

  const historyView = document.getElementById('historyView');
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
  const historyView = document.getElementById('historyView');
  const timelineList = document.createElement('ul');
  history.forEach(visit => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    console.log("show visit", visit.title, visit.url);
    link.href = visit.url;
    link.textContent = visit.title;
    link.addEventListener('click', function (event) {
      event.preventDefault();
      focusOrCreateTab(visit.url);
    });
    listItem.appendChild(link);
    listItem.appendChild(document.createTextNode(` - ${new Date(visit.timestamp).toLocaleString()}`));
    timelineList.appendChild(listItem);
  });
  historyView.appendChild(timelineList);
}
// chrome.runtime.onMessage.addListener(
//   function (request, sender, sendResponse) {
//     if (request.action === "open_dev_tools") {
//       console.log("open_dev_tools")
//       // sendResponse({ action: "open_dev_tools" });
//     }
//   }
// );
function focusOrCreateTab(url) {
  chrome.tabs.query({ url: url }, function (tabs) {
    if (tabs.length > 0) {
      chrome.windows.update(tabs[0].windowId, { focused: true }, function () {
        chrome.tabs.update(tabs[0].id, { active: true });
      });
    } else {
      chrome.tabs.create({ url: url });
    }
  });
}