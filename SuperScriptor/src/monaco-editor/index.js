// Request the Monaco Editor script and sample script from the background script
chrome.runtime.sendMessage({ action: 'getScripts' }, (response) => {
  if (response.monacoEditorScript && response.sampleScript) {
    // Create script elements and append the Monaco Editor script and sample script
    const monacoEditorScriptElement = document.createElement('script');
    monacoEditorScriptElement.textContent = response.monacoEditorScript;
    document.head.appendChild(monacoEditorScriptElement);

    // Initialize Monaco Editor
    monacoEditorScriptElement.onload = function () {
      // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      //   noSemanticValidation: true,
      //   noSyntaxValidation: false,
      // });
      const editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'typescript',
      });
      editor.focus();
      // Import the sample script into the editor
      document.getElementById('importSampleScript').addEventListener('click', () => {
        editor.setValue(response.sampleScript);
      });

      // Run the snippet
      document.getElementById('runSnippet').addEventListener('click', () => {
        const snippet = editor.getValue();
        chrome.tabs.query({}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'runSnippet', snippet: snippet });
        });
      });
    }
  }
});