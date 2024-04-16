// Request the Monaco Editor script and sample script from the background script
// chrome.runtime.sendMessage({ action: 'getScripts' }, (response) => {
//     if (response.monacoEditorScript && response.sampleScript) {
//         // get current tab if editor.html, then post the message to the content script
//         chrome.tabs.query({ active: true, url: 'chrome-extension://*/editor.html' }, (tabs) => {
//             if (tabs.length > 0) {
//                 // postmessage to content script
//                 tabs[0].contentWindow.postMessage({
//                     action: 'loadScripts',
//                     monacoEditorScript: response.monacoEditorScript,
//                     sampleScript: response.sampleScript
//                 }, '*');
//             }
//         });
//     }
// });
// const editorScript = document.getElementById('editorScript').textConten