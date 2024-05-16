// ==UserScript==
// @name         Selective Tab Navigation
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Navigate among multiple tabs with the same root URL.
// @author       Your Name
// @match        *://*/*
// @grant        GM_openInTab
// ==/UserScript==

(function () {
    'use strict';
    const extensionId = "ihplbpkbbdflgnnedhhidbbnkbahdjik"; // Replace with your actual extension ID

    // URL to navigate
    var myURLs = ["https://chatgpt.com", "https://poe.com", "https://github.com"];

    // Create a button
    var btn = document.createElement("button");
    btn.innerHTML = 'Select Site Tab';
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = "1000";
    btn.style.padding = "10px 20px";
    btn.style.fontSize = "16px";
    btn.style.background = "#007BFF";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
    document.body.appendChild(btn);

    // Dropdown menu for selecting tabs
    var dropdown = document.createElement("select");
    dropdown.style.position = "fixed";
    dropdown.style.bottom = "50px";
    dropdown.style.right = "20px";
    dropdown.style.zIndex = "1001";
    dropdown.style.padding = "5px 10px";
    dropdown.style.fontSize = "16px";
    dropdown.style.display = "none"; // initially hidden
    document.body.appendChild(dropdown);

    // Check and navigate
    btn.onclick = function () {
        chrome.runtime.sendMessage(extensionId, { action: "getTabs" }, function (response) {
            const tabs = response.tabs;
            let matchingTabs = tabs.filter(tab => myURLs.includes(new URL(tab.url).origin));

            dropdown.innerHTML = ''; // Clear previous entries

            if (matchingTabs.length > 0) {
                // Populate dropdown with matching tabs

                // Add a default "Select..." option
                let defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Select...";
                dropdown.appendChild(defaultOption);

                matchingTabs.forEach(tab => {
                    let option = document.createElement("option");
                    option.value = tab.id;
                    option.textContent = tab.title; // Show title in dropdown

                    // Add favicon to option
                    let icon = document.createElement("img");
                    icon.src = tab.favIconUrl;
                    icon.style.width = "16px";
                    icon.style.height = "16px";
                    icon.style.marginRight = "5px";
                    option.prepend(icon);

                    dropdown.appendChild(option);
                });

                // Get the origins of the matching tabs
                let matchingOrigins = matchingTabs.map(tab => new URL(tab.url).origin);

                // Get the URLs that don't have a matching tab
                let nonMatchingURLs = myURLs.filter(url => !matchingOrigins.includes(url));

                // Provide an option to open a new tab for each non-matching URL
                nonMatchingURLs.forEach(url => {
                    let option = document.createElement("option");
                    option.value = url;
                    option.textContent = `Open new tab at ${url}`; // Show URL in dropdown

                    // Add default icon to option
                    let icon = document.createElement("img");
                    icon.src = "https://via.placeholder.com/16"; // Replace with your default icon URL
                    icon.style.width = "16px";
                    icon.style.height = "16px";
                    icon.style.marginRight = "5px";
                    option.prepend(icon);

                    dropdown.appendChild(option);
                });
            }
            else {
                // If no tab matches, provide an option to open a new tab for each URL

                // Add a default "Select..." option
                let defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Open new tab...";
                dropdown.appendChild(defaultOption);

                myURLs.forEach(url => {
                    let option = document.createElement("option");
                    option.value = url;
                    option.textContent = `Open latest visisted at ${url}`; // Show URL in dropdown

                    // Add default icon to option
                    let icon = document.createElement("img");
                    icon.src = "https://via.placeholder.com/16"; // Replace with your default icon URL
                    icon.style.width = "16px";
                    icon.style.height = "16px";
                    icon.style.marginRight = "5px";
                    option.prepend(icon);

                    dropdown.appendChild(option);
                });
            }

            dropdown.style.display = "block"; // Show dropdown
            dropdown.onchange = function () {
                if (this.value) { // Only send message if a tab is selected or a URL is chosen
                    if (myURLs.includes(this.value)) {
                        // If the selected value is a URL, open a new tab
                        chrome.runtime.sendMessage(extensionId, { action: "openLatestVisited", query: this.value });
                    } else {
                        // If the selected value is a tab ID, update the tab
                        chrome.runtime.sendMessage(extensionId, { action: "updateTab", tabId: this.value });
                    }
                    dropdown.style.display = "none"; // Hide dropdown
                }
            }
        });
    }

    // Keybindings for additional functionality
    document.addEventListener('keydown', function (e) {
        if (e.altKey && e.key === 'b') { // Alt+B to toggle button visibility
            btn.style.display = btn.style.display === 'none' ? 'block' : 'none';
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.altKey && e.key === 'e') { // Alt+E to edit URL
            var newURL = prompt("Enter new URL:", myURL);
            if (newURL) myURL = newURL;
        }
    });
})();
