console.log('Background script running');
chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {
    if (request.action === "getTabs") {
      chrome.tabs.query({}, function (tabs) {
        sendResponse({ tabs: tabs });
      });
      return true; // Will respond asynchronously.
    } else if (request.action === "getBookmarks") {
      chrome.bookmarks.getTree(function (bookmarkTree) {
        sendResponse({ bookmarks: bookmarkTree });
      });
      return true; // Will respond asynchronously.
    }
    else if (request.action === "openLatestVisited") {
      chrome.history.search({ text: "", maxResults: 1000 }, function (history) {
        // Filter the history to only include root sites that match the query
        let filteredHistory = history.filter(item => {
          let url = new URL(item.url);
          let queryURL = new URL(request.query);
          return url.hostname.includes(queryURL.hostname);
        });

        if (filteredHistory.length > 0) {
          chrome.tabs.create({ url: filteredHistory[0].url });
        }

        sendResponse({ history: filteredHistory });
      });

      return true; // Will respond asynchronously.
    } else if (request.action === "updateTab" && request.tabId) {
      let tabId = parseInt(request.tabId);
      if (!isNaN(tabId)) {
        chrome.tabs.get(tabId, function (tab) {
          if (chrome.runtime.lastError) {
            console.error("Error finding tab:", chrome.runtime.lastError);
            sendResponse({ status: "error", message: chrome.runtime.lastError.message });
            return;
          }
          // Update the window first to bring it to focus
          chrome.windows.update(tab.windowId, { focused: true }, function () {
            if (chrome.runtime.lastError) {
              console.error("Error focusing window:", chrome.runtime.lastError);
              sendResponse({ status: "error", message: chrome.runtime.lastError.message });
              return;
            }
            // Once the window is focused, then switch to the tab
            chrome.tabs.update(tabId, { active: true }, function () {
              if (chrome.runtime.lastError) {
                console.error("Failed to update tab: ", chrome.runtime.lastError);
                sendResponse({ status: "error", message: chrome.runtime.lastError.message });
              } else {
                sendResponse({ status: "success", message: "Tab and window updated" });
              }
            });
          });
        });
        return true; // Indicates that you wish to send a response asynchronously
      } else {
        sendResponse({ status: "error", message: "Invalid tab ID" });
      }
    }
  }
);