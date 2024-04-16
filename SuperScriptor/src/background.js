// Fetch the Monaco Editor script and sample script
async function fetchScripts() {
  const monacoEditorScriptResponse = await fetch('https://unpkg.com/monaco-editor@latest/min/vs/loader.js');
  const monacoEditorScript = await monacoEditorScriptResponse.text();

  const sampleScriptResponse = await fetch('sample-script.js');
  const sampleScript = await sampleScriptResponse.text();

  return { monacoEditorScript, sampleScript };
}
function inject(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: async () => {
      const { monacoEditorScript, sampleScript } = await fetchScripts();
      eval(monacoEditorScript);
    }
  });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['main.js']
  });
}
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'editor.html' });
  // console.log("test")
  // inject(tab);
});


//  execute main.js
// chrome.tabs.query({ url: "extensions://*/editor.html" }, function (tabs) {
//   chrome.tabs.executeScript(tabs[0].id, { file: 'main.js' });
// });
// Listen for messages from the frontend
// chrome.tabs.query({}, function (tabs) {
//   // chrome.tabs.executeScript(tabs[0].id, { file: 'main.js' });
//   chrome.scripting.executeScript({
//     files: ['main.js'],
//     target: { tabId: tabs[0].id },
//   });
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getScripts') {
    fetchScripts().then((scripts) => {
      sendResponse(scripts);
    });
    return true; // Required to use sendResponse asynchronously
  }
});

// Listen for messages from the frontend
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'runBackgroundScript') {
    eval(message.snippet);
  }
});