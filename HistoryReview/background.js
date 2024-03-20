chrome.webNavigation.onCompleted.addListener(function (details) {
  if (details.frameId === 0) {
    chrome.history.getVisits({ url: details.url }, function (visits) {
      const visit = {
        url: details.url,
        title: visits[0].title,
        timestamp: visits[0].visitTime,
        referrer: visits[0].referringVisitId
      };
      saveVisit(visit);
    });
  }
});

function saveVisit(visit) {
  chrome.storage.local.get('history', function (data) {
    const history = data.history || [];
    history.push(visit);
    chrome.storage.local.set({ history: history });
  });
}