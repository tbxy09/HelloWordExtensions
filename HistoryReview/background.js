chrome.webNavigation.onCompleted.addListener(function (details) {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, function (tab) {
      const visit = {
        url: details.url,
        title: tab.title,
        timestamp: new Date().getTime()
      };
      console.log("webNavigation.onCompleted.addListener", visit);
      saveVisit(visit);
    });
  }
});

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