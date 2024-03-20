const urlParams = new URLSearchParams(window.location.search);
const view = urlParams.get('view');

chrome.storage.local.get('history', function (data) {
  const history = data.history || [];
  if (view === 'grouped') {
    displayGroupedHistory(history);
  } else if (view === 'timeline') {
    displayTimelineHistory(history);
  }
});

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
    domainSection.innerHTML = '<h2>' + domain + '</h2>';
    const visitsList = document.createElement('ul');
    groupedHistory[domain].forEach(visit => {
      const listItem = document.createElement('li');
      listItem.innerHTML = '<a href="' + visit.url + '" target="_blank">' + visit.title + '</a> - ' + new Date(visit.timestamp).toLocaleString();
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
    listItem.innerHTML = '<a href="' + visit.url + '" target="_blank">' + visit.title + '</a> - ' + new Date(visit.timestamp).toLocaleString();
    timelineList.appendChild(listItem);
  });
  historyView.appendChild(timelineList);
}