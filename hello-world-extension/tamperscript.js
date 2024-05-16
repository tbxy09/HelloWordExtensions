// ==UserScript==
// @name         Selective Tab Navigation
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Navigate among multiple tabs with the same root URL.
// @author       Your Name
// @match        *://*/*
// @grant        GM_openInTab
// ==/UserScript==

(function () {
    'use strict';
    const extensionId = "ihplbpkbbdflgnnedhhidbbnkbahdjik"; // Replace with your actual extension ID

    // URLs to navigate
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
    btn.style.background = "#FF5733";
    btn.style.color = "black";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
    btn.title = "Click to select a site tab";
    document.body.appendChild(btn);

    // Custom dropdown menu
    var dropdownHTML = `
        <div id="dropdown" style="position: fixed; bottom: 20px; right: 20px; z-index: 1001; display: none;">
            <div class="dropdown-options" style="display: none;">
                <!-- Options will be dynamically added here -->
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', dropdownHTML);

    // Get references to the dropdown elements
    const dropdown = document.getElementById('dropdown');
    const dropdownOptions = dropdown.querySelector('.dropdown-options');


    // Check and navigate
    btn.onclick = function () {
        dropdownOptions.style.display = dropdownOptions.style.display === 'none' ? 'block' : 'none';
        chrome.runtime.sendMessage(extensionId, { action: "getTabs" }, function (response) {
            const tabs = response.tabs;
            let matchingTabs = tabs.filter(tab => myURLs.includes(new URL(tab.url).origin));

            dropdownOptions.innerHTML = ''; // Clear previous entries

            if (matchingTabs.length > 0) {
                // Populate dropdown with matching tabs
                matchingTabs.forEach(tab => {
                    let option = document.createElement("div");
                    option.className = "dropdown-option";

                    // Add favicon to option
                    let icon = document.createElement("img");
                    icon.src = tab.favIconUrl;
                    icon.style.width = "16px";
                    icon.style.height = "16px";
                    icon.style.marginRight = "5px";
                    option.appendChild(icon);

                    let text = document.createTextNode(tab.title);
                    option.appendChild(text);

                    option.onclick = function () {
                        chrome.runtime.sendMessage(extensionId, { action: "updateTab", tabId: tab.id });
                        dropdownOptions.style.display = 'none'; // Hide the options after selection
                    };
                    dropdownOptions.appendChild(option);
                });

                // Get the origins of the matching tabs
                let matchingOrigins = matchingTabs.map(tab => new URL(tab.url).origin);

                // Get the URLs that don't have a matching tab
                let nonMatchingURLs = myURLs.filter(url => !matchingOrigins.includes(url));

                // Provide an option to open a new tab for each non-matching URL
                nonMatchingURLs.forEach(url => {
                    let option = document.createElement("div");
                    option.className = "dropdown-option";

                    // Add default icon to option
                    let icon = document.createElement("img");
                    icon.src = `https://www.google.com/s2/favicons?domain_url=${url}`; // Use Google's favicon service
                    icon.style.width = "16px";
                    icon.style.height = "16px";
                    icon.style.marginRight = "5px";
                    option.appendChild(icon);

                    let text = document.createTextNode(`Open new tab at ${url}`);
                    option.appendChild(text);

                    option.onclick = function () {
                        chrome.runtime.sendMessage(extensionId, { action: "openLatestVisited", query: url });
                        dropdownOptions.style.display = 'none'; // Hide the options after selection
                    };
                    dropdownOptions.appendChild(option);
                });
            }
            else {
                // If no tab matches, provide an option to open a new tab for each URL
                myURLs.forEach(url => {
                    let option = document.createElement("div");
                    option.className = "dropdown-option";

                    // Add default icon to option
                    let icon = document.createElement("img");
                    icon.src = `https://www.google.com/s2/favicons?domain_url=${url}`; // Use Google's favicon service
                    icon.style.width = "16px";
                    icon.style.height = "16px";
                    icon.style.marginRight = "5px";
                    option.appendChild(icon);

                    let text = document.createTextNode(`Open latest visited at ${url}`);
                    option.appendChild(text);

                    option.onclick = function () {
                        chrome.runtime.sendMessage(extensionId, { action: "openLatestVisited", query: url });
                        dropdownOptions.style.display = 'none'; // Hide the options after selection
                    };
                    dropdownOptions.appendChild(option);
                });
            }

            dropdown.style.display = "block"; // Show dropdown
        });
    }

    // Keybindings for additional functionality
    document.addEventListener('keydown', function (e) {
        if (e.altKey && e.key === 'b') { // Alt+B to toggle button visibility
            btn.style.display = btn.style.display === 'none' ? 'block' : 'none';
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.altKey && e.key === 'e') { // Alt+E to edit URLs
            var newURLs = prompt("Enter new URLs (comma-separated):", myURLs.join(", "));
            if (newURLs) myURLs = newURLs.split(",").map(url => url.trim());
        }
    });

    // Add hover effect to the button
    btn.addEventListener('mouseover', function () {
        this.style.background = "#0056b3";
        this.style.transform = "scale(1.05)";
    });

    btn.addEventListener('mouseout', function () {
        this.style.background = "#FF5733";
        this.style.transform = "scale(1)";
    });

    // CSS styles for the custom dropdown
    var style = document.createElement('style');
    style.innerHTML = `
        .dropdown-options {
            display: none;
            background: white;
            position: fixed;
            bottom: 60px;
            right: 20px;
            z-index: 1001;
            border: 1px solid #e0e0e0;
            border-radius: 5px; 
            padding: 5px;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .dropdown-option {
            padding: 5px;
            cursor: pointer;
            display: flex;
            align-items:center;}
          .dropdown-option:hover {
        background: #f9f9f9;
    }`;
    document.head.appendChild(style);
})();