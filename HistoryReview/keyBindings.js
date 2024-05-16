// keyBindings.js
// import key from 'keymaster'; // Assuming you're using the keymaster library

// using iffie to avoid global scope, define keybindings named
// alt+r to reload the extension

// (function reloadExtension() {
//     key('alt+r', async function () {
//         chrome.runtime.sendMessage({ action: 'reloadExtension' });
//     });
// })();


function reloadExtension() {
    key('alt+r', async function () {
        // chrome.runtime.sendMessage({ action: 'reloadExtension' });
        chrome.runtime.reload();
    });
}