console.log("popup.js");
document.getElementById('groupedView').addEventListener('click', function () {
  focusOrCreateTab('history.html?view=grouped');
});

document.getElementById('timelineView').addEventListener('click', function () {
  focusOrCreateTab('history.html?view=timeline');
});

document.getElementById('exportData').addEventListener('click', function () {
  const startDate = new Date(document.getElementById('startDate').value).getTime();
  const endDate = new Date(document.getElementById('endDate').value).getTime();
  exportHistory(startDate, endDate);
});

function focusOrCreateTab(urlPattern) {
  const queryPattern = `chrome-extension://${chrome.runtime.id}/history.html?view=*`;

  chrome.tabs.query({ url: queryPattern }, function (tabs) {
    const matchingTab = tabs.find(tab => tab.url.includes(queryPattern.replace('*', '')));
    if (matchingTab) {
      chrome.windows.update(matchingTab.windowId, { focused: true }, function () {
        chrome.tabs.update(matchingTab.id, { active: true, url: urlPattern });
      });
    } else {
      chrome.tabs.create({ url: urlPattern });
    }
  });
}

function exportHistory(startDate, endDate) {
  chrome.storage.local.get('history', function (data) {
    const history = data.history || [];
    const filteredHistory = history.filter(visit => visit.timestamp >= startDate && visit.timestamp <= endDate);
    const exportData = JSON.stringify(filteredHistory, null, 2);
    copyToClipboard(exportData);
    alert('History data copied to clipboard!');
  });
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}