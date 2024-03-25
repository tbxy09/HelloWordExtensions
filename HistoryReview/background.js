chrome.webNavigation.onCompleted.addListener(function (details) {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, function (tab) {
      const visit = {
        url: details.url,
        title: tab.title,
        timestamp: new Date().getTime()
      };
      console.log("webNavigation.onCompleted.addListener", visit.title, details.tabId)
      // saveVisit(visit);
    });
  }
});

// graph LR
//     Browser --> |Tab created| OnCreated[chrome.tabs.onCreated]
//     OnCreated --> OpenedTab[openedTab]
//     OpenedTab --> UpdateOpenedTabs[Update openedTabs]
//     OpenedTab --> AddCloseRecord[addCloseRedord]
//     OpenedTab --> UpdateOpenerJson[Update openerJson]
//     OpenedTab --> VisitTab[visitTab]

//     Browser --> |Tab updated| OnUpdated[chrome.tabs.onUpdated]
//     OnUpdated --> UpdatedTab[updatedTab]
//     UpdatedTab --> UpdateTabUrlJson[Update tabUrlJson]
//     UpdatedTab --> UpdateTabUrl0Json[Update tabUrl0Json]
//     UpdatedTab --> VisitTab[visitTab]

//     Browser --> |Tab removed| OnRemoved[chrome.tabs.onRemoved]
//     OnRemoved --> ClosedTab[closedTab]
//     ClosedTab --> RemoveFromOpenedTabs[Remove from openedTabs]
//     ClosedTab --> AddCloseRecord[addCloseRedord]
//     ClosedTab --> RemoveFromRecentTabs[Remove from recentTabs]

//     Browser --> |Tab activated| OnActivated[chrome.tabs.onActivated]
//     OnActivated --> UpdateRecentTabs[Update recentTabs]

chrome.tabs.onCreated.addListener(function (tab) {
  // get the tab url then to visitid
  chrome.history.getVisits({ url: tab.url }, function (visits) {
    if (visits.length > 0) {
      const visit = {
        url: tab.url,
        title: visits[0].title,
        visitId: visits[0].visitId,
        refered: visits[0].referringVisitId,
        timestamp: new Date().getTime()
      };
      console.log("tabs.onCreated.addListener", visit.title, tab.title);
      // saveVisit(visit);
    }
  })
  // const visit = {
  //   url: tab.url,
  //   title: tab.title,
  //   timestamp: new Date().getTime()
  // };
  // console.log("tabs.onCreated.addListener", visit);
  // saveVisit(visit);
});
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  console.log("tabs.onRemoved.addListener", tabId, removeInfo);
})
chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log("tabs.onActivated.addListener activeinfo", activeInfo);

  if (activeInfo.tabId) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
      const url = tab.url;
      const title = tab.title;
      const timestamp = new Date().getTime();

      console.log("tabs.onActivated.addListener tabget", title, url);

      chrome.history.getVisits({ url: url }, function (visits) {
        if (visits.length > 0) {
          const visit = {
            url: url,
            title: title,
            timestamp: timestamp,
            visitId: visits[0].visitId,
            referer: visits[0].referringVisitId
          };

          console.log("tabs.onActivated.addListener getVisits", visit);
          // saveVisit(visit);
        }
      });
    });
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // console.log("tabs.onUpdated.addListener", tabId)
  console.log("tabs.onUpdated.addListener", changeInfo.status)
  // console.log("tabs.onUpdated.addListener", tab.url, tab.title, tab.status)
  if (changeInfo.status === 'loading') {
    chrome.history.getVisits({ url: tab.url }, function (visits) {
      if (visits.length > 0) {
        const visit = {
          url: tab.url,
          title: tab.title,
          visitId: visits[0].visitId,
          refered: visits[0].referringVisitId,
          timestamp: new Date().getTime()
        };
        console.log(`tabs.onUpdated loading!! visit title: ${visit.title}, tab title: ${tab.title}`);
        // saveVisit(visit);
      }
    })
  }
  else if (changeInfo.status === 'complete') {
    chrome.history.getVisits({ url: tab.url }, function (visits) {
      if (visits.length > 0) {
        const visit = {
          url: tab.url,
          title: tab.title,
          visitId: visits[0].visitId,
          refered: visits[0].referringVisitId,
          timestamp: new Date().getTime()
        };
        console.log(`tabs.onUpdated complete!! visit title: ${visit.title}, tab title: ${tab.title}`);
        // saveVisit(visit);
      }
    })
  }
  else {
    console.log(`tabs.onUpdated other status ${changeInfo.status}, tab title: ${tab.title}, tab url: ${tab.url}`);
  }
})

chrome.commands.onCommand.addListener(function (command) {
  if (command === "open_dev_tools") {
    // Logic to open Developer Tools
    // Note: Directly opening DevTools from an extension is not supported by Chrome APIs.
    // You might need to focus a specific tab or send a message to a content script.
    console.log("open_dev_tools")
    chrome.runtime.sendMessage({ action: "open_dev_tools" });
  }
});

// Open or create the IndexedDB database 
let db;
const dbName = 'BrowsingHistory';
const dbVersion = 1;
const storeName = 'visits';
const request = indexedDB.open(dbName, dbVersion);

request.onerror = function (event) {
  console.error('Error opening IndexedDB', event.target.error);
}
request.onsuccess = function (event) {
  db = event.target.result;
  console.log('IndexedDB opened successfully');
}
request.onupgradeneeded = function (event) {
  db = event.target.result;
  // const objectStore = db.createObjectStore(storeName, { keyPath: 'timestamp' });
  // console.log('IndexedDB upgrade complete');
}


function saveVisit2db(visit) {
  const transaction = db.transaction([storeName], 'readwrite');
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.add(visit);

  request.onsuccess = function (event) {
    console.log('Visit saved successfully');
  };

  request.onerror = function (event) {
    console.error('Error saving visit:', event.target.error);
  };
}
// // listen to the new tab created event
// chrome.tabs.onCreated.addListener(function (tab) {
//   const visit = {
//     url: tab.url,
//     title: tab.title,
//     timestamp: new Date().getTime()
//   };
//   console.log("tabs.onCreated.addListener", visit);
//   saveVisit(visit);
// });
// // listen to the tab updated event
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   if (changeInfo.status === 'loading') {
//     const visit = {
//       url: tab.url,
//       title: tab.title,
//       timestamp: new Date().getTime()
//     };
//     console.log("tabs.onUpdated.addListener", visit);
//     saveVisit(visit);
//   }
// });
function saveVisit(visit) {
  chrome.storage.local.get('history', function (data) {
    const history = data.history || [];
    history.push(visit);
    chrome.storage.local.set({ history: history });
  });
}