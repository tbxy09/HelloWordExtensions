// background.js

// IndexedDB schema
const dbName = 'BrowsingHistory';
const dbVersion = 1;
const storeName = 'visits';

let db;

// Open or create the IndexedDB database
const request = indexedDB.open(dbName, dbVersion);

request.onerror = function (event) {
  console.error('Error opening database:', event.target.error);
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log('Database opened successfully');
};

request.onupgradeneeded = function (event) {
  db = event.target.result;
  const objectStore = db.createObjectStore(storeName, { keyPath: 'visitId', autoIncrement: true });
  objectStore.createIndex('url', 'url', { unique: false });
  objectStore.createIndex('visitTime', 'visitTime', { unique: false });
  objectStore.createIndex('referringVisitId', 'referringVisitId', { unique: false });
  console.log('Object store created');
};

// Helper function to save visit to the database
function saveVisit(visit) {
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

// Helper function to update visit in the database
function updateVisit(visit) {
  const transaction = db.transaction([storeName], 'readwrite');
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.put(visit);

  request.onsuccess = function (event) {
    console.log('Visit updated successfully');
  };

  request.onerror = function (event) {
    console.error('Error updating visit:', event.target.error);
  };
}

// Helper function to get the last visit for a tab
function getLastVisitForTab(tabId, callback) {
  const transaction = db.transaction([storeName], 'readonly');
  const objectStore = transaction.objectStore(storeName);
  const index = objectStore.index('visitTime');
  const range = IDBKeyRange.upperBound(Date.now());
  const request = index.openCursor(range, 'prev');

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor && cursor.value.tabId === tabId) {
      callback(cursor.value);
    } else {
      callback(null);
    }
  };

  request.onerror = function (event) {
    console.error('Error getting last visit:', event.target.error);
    callback(null);
  };
}

// Helper function to check if a URL is already open in a tab
function isUrlOpenInTab(url, callback) {
  chrome.tabs.query({}, function (tabs) {
    const matchingTab = tabs.find(tab => tab.url === url);
    callback(matchingTab);
  });
}

// Tab created event handler
chrome.tabs.onCreated.addListener(function (tab) {
  isUrlOpenInTab(tab.url, function (matchingTab) {
    if (matchingTab) {
      // Close the newly created tab if a matching tab exists
      chrome.tabs.remove(tab.id, function () {
        console.log('Duplicate tab closed');
      });
    } else {
      // Create a new visit record if no matching tab exists
      const visit = {
        url: tab.url,
        title: tab.title,
        visitTime: Date.now(),
        referringVisitId: null,
        status: 'open',
        tabId: tab.id
      };
      saveVisit(visit);
    }
  });
});

// Tab updated event handler
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    getLastVisitForTab(tabId, function (lastVisit) {
      if (lastVisit) {
        const isSameSite = new URL(lastVisit.url).hostname === new URL(tab.url).hostname;
        if (isSameSite) {
          // Update existing visit record
          const updatedVisit = {
            visitId: lastVisit.visitId,
            url: tab.url,
            title: tab.title,
            visitTime: Date.now(),
            referringVisitId: lastVisit.visitId,
            status: 'open',
            tabId: tabId
          };
          updateVisit(updatedVisit);
        } else {
          // Create new visit record for different site
          const newVisit = {
            url: tab.url,
            title: tab.title,
            visitTime: Date.now(),
            referringVisitId: lastVisit.visitId,
            status: 'open',
            tabId: tabId
          };
          saveVisit(newVisit);
        }
      } else {
        // Create new visit record for new tab
        const newVisit = {
          url: tab.url,
          title: tab.title,
          visitTime: Date.now(),
          referringVisitId: null,
          status: 'open',
          tabId: tabId
        };
        saveVisit(newVisit);
      }
    });
  }
});

// Tab removed event handler
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  getLastVisitForTab(tabId, function (lastVisit) {
    if (lastVisit) {
      // Update visit status to closed
      const updatedVisit = {
        visitId: lastVisit.visitId,
        url: lastVisit.url,
        title: lastVisit.title,
        visitTime: lastVisit.visitTime,
        referringVisitId: lastVisit.referringVisitId,
        status: 'closed',
        tabId: tabId
      };
      updateVisit(updatedVisit);
    }
  });
});

// Message listener for filter views
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getFilteredVisits') {
    const { filter } = request;
    getFilteredVisits(filter, function (visits) {
      sendResponse({ visits: visits });
    });
    return true; // Required to use sendResponse asynchronously
  }
});

// Helper function to get filtered visits based on the selected filter
function getFilteredVisits(filter, callback) {
  const transaction = db.transaction([storeName], 'readonly');
  const objectStore = transaction.objectStore(storeName);
  const index = objectStore.index('visitTime');
  let range;

  if (filter === 'latest2Days') {
    const startTime = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago
    range = IDBKeyRange.lowerBound(startTime);
  } else if (filter === 'lastWeek') {
    const startTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
    range = IDBKeyRange.lowerBound(startTime);
  } else if (filter === 'fromWebsite') {
    // Implement logic to get visits from a specific website
    // You can use the 'url' index to filter visits based on the website URL
    // range = IDBKeyRange.only(websiteUrl);
  }

  const visits = [];
  const request = index.openCursor(range);

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      visits.push(cursor.value);
      cursor.continue();
    } else {
      callback(visits);
    }
  };

  request.onerror = function (event) {
    console.error('Error getting filtered visits:', event.target.error);
    callback([]);
  };
}