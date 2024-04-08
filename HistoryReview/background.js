// background.js

// IndexedDB schema
const dbName = "HistoryPreview";
let dbVersion = 1;
const storeName = "visits";
let dbReady = false;
let db;

// Open or create the IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = function (event) {
      console.error("Error opening database:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      console.log("Database opened successfully");
      resolve(db);
    };

    request.onupgradeneeded = function (event) {
      db = event.target.result;
      const objectStore = db.createObjectStore(storeName, {
        keyPath: "visitId",
        autoIncrement: true,
      });
      objectStore.createIndex("url", "url", { unique: false });
      objectStore.createIndex("visitTime", "visitTime", { unique: false });
      objectStore.createIndex("referringVisitId", "referringVisitId", {
        unique: false,
      });
      // objectStore.createIndex('title', 'title', { unique: false });
      console.log("Object store created");
    };
  });
}

// Then, when you need to use the database:
openDatabase()
  .then(() => {
    // clear all item with title is empty
    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);
    const index = objectStore.index("url");
    const request = index.openCursor();
    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        //  if url start with extension://bnpnejfbdfkaihjkcmhioandbaffdhma/history.html
        if (
          !cursor.value.title ||
          cursor.value.url.startsWith(
            "chrome-extension://bnpnejfbdfkaihjkcmhioandbaffdhma"
          )
        ) {
          objectStore.delete(cursor.primaryKey);
        }
        cursor.continue();
      }
    };
    dbReady = true;
  })
  .catch((error) => {
    console.error("Error opening database:", error);
  });

//helper functions to peek mode
var historyWindowId = null;
var historyWindowId = null;

// Add an event listener for the onRemoved event
chrome.windows.onRemoved.addListener(function (windowId) {
  // If the closed window is the history window, reset historyWindowId
  if (windowId === historyWindowId) {
    historyWindowId = null;
  }
});
function focuseorOpenHistoryInPeekMode(peekMode) {
  var historyUrl = "history.html?view=timeline";
  var peekWidth = 400; // Adjust the width as needed
  var peekHeight = 600; // Adjust the height as needed

  chrome.windows.getCurrent(function (currentWindow) {
    var updateInfo = {
      url: chrome.runtime.getURL(historyUrl),
      width: peekWidth,
      height: peekHeight,
      type: "popup",
    };

    if (peekMode === "side") {
      updateInfo.left = currentWindow.left + currentWindow.width;
      updateInfo.top = currentWindow.top;
    } else if (peekMode === "center") {
      updateInfo.left =
        currentWindow.left + Math.floor((currentWindow.width - peekWidth) / 2);
      updateInfo.top =
        currentWindow.top + Math.floor((currentWindow.height - peekHeight) / 2);
    }

    if (historyWindowId === null) {
      chrome.windows.create(updateInfo, function (window) {
        historyWindowId = window.id;
      });
    } else {
      // chrome.windows.update(historyWindowId, updateInfo);
      // switch to the windown id and refresh the page
      chrome.windows.update(historyWindowId, { focused: true }, function () {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.update(tabs[0].id, { url: historyUrl });
          }
        );
      });
    }
  });
}
// Helper function to save visit to the database
function saveVisit(visit) {
  if (!dbReady) {
    console.log("Database is not ready");
    return;
  }
  console.log("saveVisit", visit);
  const transaction = db.transaction([storeName], "readwrite");
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.add(visit);

  request.onsuccess = function (event) {
    console.log("Visit saved successfully");
  };

  request.onerror = function (event) {
    console.error("Error saving visit:", event.target.error);
  };
}

// Helper function to update visit in the database
function updateVisit(visit) {
  if (!dbReady) {
    console.log("Database is not ready");
    return;
  }
  console.log("updateVisit", visit);
  const transaction = db.transaction([storeName], "readwrite");
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.put(visit);

  request.onsuccess = function (event) {
    console.log("Visit updated successfully");
  };

  request.onerror = function (event) {
    console.error("Error updating visit:", event.target.error);
  };
}

// Helper function to get the last visit for a tab
function getLastVisitForTab(tabId, callback) {
  if (!dbReady) {
    console.log("Database is not ready");
    return;
  }
  const transaction = db.transaction([storeName], "readonly");
  const objectStore = transaction.objectStore(storeName);
  const index = objectStore.index("visitTime");
  const range = IDBKeyRange.upperBound(Date.now());
  const request = index.openCursor(range, "prev");

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor && cursor.value.tabId === tabId) {
      callback(cursor.value);
    } else {
      callback(null);
    }
  };

  request.onerror = function (event) {
    console.error("Error getting last visit:", event.target.error);
    callback(null);
  };
}

function isUrlOpenInTab(url, currentTabId, callback) {
  chrome.tabs.query({}, function (tabs) {
    // Exclude the current tab from the search to prevent it from finding itself
    const matchingTab = tabs.find(
      (tab) => tab.url === url && tab.id !== currentTabId
    );
    callback(matchingTab);
  });
}
function isNotURL(url) {
  return !url.startsWith("http://") && !url.startsWith("https://");
}
// Tab created event handler
chrome.tabs.onCreated.addListener(function (tab) {
  // Use the function and pass the current tab's ID to exclude it from the search
  if (isNotURL(tab.url)) {
    return;
  }
  isUrlOpenInTab(tab.url, tab.id, function (matchingTab) {
    if (matchingTab) {
      // Close the newly created tab if a matching tab exists
      chrome.tabs.remove(tab.id, function () {
        console.log("Duplicate tab closed");
      });
    } else {
      // This part of the logic remains unchanged - create a new visit record if no matching tab exists
      const visit = {
        url: tab.url,
        title: tab.title,
        visitTime: Date.now(),
        referringVisitId: null,
        status: "open",
        tabId: tab.id,
      };
      saveVisit(visit);
    }
  });
});

chrome.commands.onCommand.addListener(function (command) {
  if (command === "_execute_move_tab_to_window") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      // Replace with the ID of the window you want to move the tab to
      const targetWindowId = 1;
      moveTabToWindow(currentTab.id, targetWindowId);
    });
  }
  // command to open the history in center peek and side peek
  if (command === "_execute_open_history_center_peek") {
    // chrome.tabs.create({ url: 'history.html' });
    focuseorOpenHistoryInPeekMode("center");
  }
});

// Tab updated event handler
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (isNotURL(tab.url)) {
    return;
  }
  if (changeInfo.title) {
    getLastVisitForTab(tabId, function (lastVisit) {
      if (lastVisit) {
        // check the url is valid
        console.log("lastVisit", lastVisit.url, tab.url);
        if (!tab.url) {
          return;
        }
        const isSameSite =
          new URL(lastVisit.url).hostname === new URL(tab.url).hostname;
        const isSameURL = lastVisit.url === tab.url;
        if (isSameURL) {
          // Update existing visit record
          console.log("update existing visit record using the same site");
          //  query the opened tab with the same tabId to get the title
          chrome.tabs.get(tabId, function (currentTab) {
            const updatedVisit = {
              visitId: lastVisit.visitId,
              url: currentTab.url,
              title: currentTab.title,
              visitTime: new Date().getTime(),
              referringVisitId: lastVisit.visitId,
              status: "open",
              tabId: tabId,
            };
            updateVisit(updatedVisit);
          });
        } else if (isSameSite) {
          // Update existing visit record
          console.log("update existing visit record using the same site");
          //  query the opened tab with the same tabId to get the title
          chrome.tabs.get(tabId, function (currentTab) {
            const newVisit = {
              url: currentTab.url,
              title: currentTab.title,
              visitTime: Date.now(),
              referringVisitId: lastVisit.visitId,
              status: "open",
              tabId: tabId,
            };
            saveVisit(newVisit);
          });
        } else {
          // Create new visit record for different site
          chrome.tabs.get(tabId, function (currentTab) {
            const newVisit = {
              url: currentTab.url,
              title: currentTab.title,
              visitTime: Date.now(),
              referringVisitId: lastVisit.visitId,
              status: "open",
              tabId: tabId,
            };
            saveVisit(newVisit);
          });
        }
      } else {
        // Create new visit record for new tab
        chrome.tabs.get(tabId, function (currentTab) {
          const newVisit = {
            url: currentTab.url,
            title: currentTab.title,
            visitTime: Date.now(),
            referringVisitId: null,
            status: "open",
            tabId: tabId,
          };
          saveVisit(newVisit);
        });
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
        status: "closed",
        tabId: tabId,
      };
      updateVisit(updatedVisit);
    }
  });
});

// Message listener for filter views
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getFilteredVisits") {
    const { filterCriteria } = request;
    getFilteredVisits(filterCriteria, function (visits) {
      visits = visits.map((visit) => {
        // Add a status indicator for open tabs
        chrome.tabs.query({}, function (tabs) {
          tabs.forEach(function (tab) {
            if (tab.url === visit.url) {
              // visit.status = "open";
              console.log("open tab", visit.url);
            }
          });
        });
        return visit;
      })
      sendResponse({ visits: visits });
    });
    return true; // Required to use sendResponse asynchronously
  } else if (request.action === "createFrozenFilterView") {
    const { filterCriteria } = request;
    createFrozenFilterView(filterCriteria, function (frozenViewTabId) {
      sendResponse({ tabId: frozenViewTabId });
    });
    return true; // Required to use sendResponse asynchronously
  } else if (request.action === "openExtensionPage") {
    if (request.mode === "right") {
      console.log("right open side bar");
      // focuseorOpenHistoryInPeekMode('side');
      // chrome.sidePanel.open();
      if (!sender.tab.url) return;
      const url = new URL(sender.tab.url);
      // Enables the side panel on google.com
      if (url.origin.startsWith("https")) {
        chrome.sidePanel.open({ tabId: sender.tab.id });
        chrome.sidePanel.setOptions({
          tabId: sender.tab.id,
          path: "side_panel.html",
          enabled: true,
        });
      } else {
        // Disables the side panel on all other sites
        chrome.sidePanel.setOptions({
          tabId: sender.tab.id,
          enabled: false,
        });
      }
    }
    const { mode } = request.mode;
    focuseorOpenHistoryInPeekMode(mode);
  } else if (request.action === "backupDatabase") {
    const { format } = request;
    backupDatabase(format);
  } else if (request.action === "retrieveAllHistoryAndSummarize") {
    retrieveAllHistoryAndSummarize();
  }
});

// Helper function to get filtered visits based on the selected filter
function getFilteredVisits(filterCriteria, callback) {
  const transaction = db.transaction([storeName], "readonly");
  const objectStore = transaction.objectStore(storeName);
  const index = objectStore.index("visitTime");
  let range;
  console.log("filterCriteria", filterCriteria);
  if (filterCriteria.dateRange === "latest2Days") {
    const startTime = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago
    range = IDBKeyRange.lowerBound(startTime);
  } else if (filterCriteria.dateRange === "lastWeek") {
    const startTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
    range = IDBKeyRange.lowerBound(startTime);
  }

  const visits = [];
  const request = index.openCursor(range);

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      if (
        !filterCriteria.website ||
        (filterCriteria.website &&
          cursor.value.url.includes(filterCriteria.website))
      ) {
        visits.push(cursor.value);
      }
      cursor.continue();
    } else {
      callback(visits);
    }
  };

  request.onerror = function (event) {
    console.error("Error getting filtered visits:", event.target.error);
    callback([]);
  };
}

// Helper function to create a frozen filter view in a new tab
function createFrozenFilterView(filterCriteria, callback) {
  const frozenViewUrl =
    chrome.runtime.getURL("frozen_view.html") +
    "?filter=" +
    encodeURIComponent(JSON.stringify(filterCriteria));
  chrome.tabs.create({ url: frozenViewUrl }, function (tab) {
    callback(tab.id);
  });
}

// Message listener for moving tabs between windows
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "moveTabToWindow") {
    const { tabId, windowId } = request;
    moveTabToWindow(tabId, windowId);
  }
});

// Helper function to move a tab to a different window and focus on it
function moveTabToWindow(tabId, windowId) {
  chrome.tabs.move(
    tabId,
    { windowId: windowId, index: -1 },
    function (movedTab) {
      console.log("Tab moved to window:", movedTab);

      // Focus on the window
      chrome.windows.update(windowId, { focused: true }, function () {
        console.log("Window focused:", windowId);

        // Focus on the tab
        chrome.tabs.update(movedTab.id, { active: true }, function () {
          console.log("Tab focused:", movedTab.id);
        });
      });
    }
  );
}

async function backupDatabase(format = "json") {

  // Get all visits from IndexedDB
  const transaction = db.transaction([storeName], "readonly");
  const objectStore = transaction.objectStore(storeName);
  const request = objectStore.getAll();

  request.onsuccess = async function (event) {
    const visits = event.target.result;

    let data;
    switch (format) {
      case "csv":
        data = convertToCSV(visits);
        break;
      case "md":
        data = convertToMarkdown(visits);
        break;
      default: // json
        data = JSON.stringify(visits);
        break;
    }

    // Create a blob from the data
    const blob = new Blob([data], { type: `application/${format}` });

    // send message to the content.js to download the file
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "downloadBackup",
        blob: blob,
        format: format,
      });
    });
  };

  request.onerror = function (event) {
    console.error("Error getting visits from IndexedDB:", event.target.error);
    // Handle error (e.g., display a message to the user)
  };
}

function convertToCSV(visits) {
  // Convert the visits data to CSV format
  const headers = Object.keys(visits[0]).join(",");
  const rows = visits.map((visit) => Object.values(visit).join(",")).join("\n");
  return `${headers}\n${rows}`;
}

function convertToMarkdown(visits) {
  // Convert the visits data to Markdown format
  const headers = Object.keys(visits[0]).join(" | ");
  const separator = new Array(visits[0].length).fill("---").join(" | ");
  const rows = visits
    .map((visit) => Object.values(visit).join(" | "))
    .join("\n");
  return `| ${headers} |\n| ${separator} |\n| ${rows} |`;
}

// Function to retrieve all history and summarize
function retrieveAllHistoryAndSummarize() {
  chrome.history.search(
    { text: "", startTime: 0, maxResults: 0 },
    function (historyItems) {
      if (historyItems.length === 0) {
        console.log("No history items found.");
        return;
      }

      // Calculate time range
      let earliestTime = historyItems[0].lastVisitTime;
      let latestTime = historyItems[0].lastVisitTime;
      historyItems.forEach(function (item) {
        earliestTime = Math.min(earliestTime, item.lastVisitTime);
        latestTime = Math.max(latestTime, item.lastVisitTime);
      });

      // Convert timestamps to readable date strings
      const earliestDate = new Date(earliestTime).toLocaleString();
      const latestDate = new Date(latestTime).toLocaleString();

      // Log the summary
      console.log(`Total history items: ${historyItems.length} `);
      console.log(`Earliest visit: ${earliestDate} `);
      console.log(`Latest visit: ${latestDate} `);

      // Back up the database before saving new visits
      backupDatabase()
        .then(() => {
          // Save visits to IndexedDB
          historyItems.forEach(function (item) {
            const visit = {
              url: item.url,
              title: item.title,
              visitTime: item.lastVisitTime,
              referringVisitId: null, // Assuming no referring visit for now
              status: "closed", // Assuming all retrieved history items are closed
              tabId: null, // No tab ID available for history items
            };
            saveVisit(visit);
          });
        })
        .catch((error) => {
          console.error("Error during backup:", error);
          // You might want to handle the error here, e.g., display a message to the user
        });
    }
  );
}
