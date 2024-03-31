//helper functions to peek mode
if (typeof key == 'function') {
    // Define a function to run when "Shift + A" is pressed
    key('shift+a', function () {
        chrome.runtime.sendMessage({ action: 'openExtensionPage', mode: 'center' });
    });
    key('shift+c', function () {
        // chrome.scripting.executeScript({
        //     target: { tabId: tab.id },
        //     files: ['side_pannel.js']
        // });
        // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //     chrome.sidePanel.open(tabs[2].id);
        // });
        chrome.runtime.sendMessage({ action: 'openExtensionPage', mode: 'right' });
    });
    key('shift+x', function () {
        chrome.runtime.sendMessage({
            action: 'retrieveAllHistoryAndSummarize',
        });
    });
    key('shift+y', function () {
        chrome.runtime.sendMessage({
            action: 'backupDatabase',
        });
    });

} else {
    console.error('Keymaster library not loaded.');
}

function renderMermaidDiagrams() {
    const codeBlocks = document.querySelectorAll('pre');
    // create an array of code blocks for store the following code
    let codeArray = [];
    codeBlocks.forEach(block => {
        const header = block.querySelector('p.text-xs');
        if (header && header.textContent.trim().toLowerCase() === 'mermaid') {
            const code_block = block.querySelector('.code-block__code')
            const code = code_block.textContent;
            codeArray.push(code);
            // console.log(code)
            // const mermaidContainer = document.createElement('div');
            // mermaidContainer.className = 'mermaid';
            // mermaidContainer.textContent = code;
            // code_block.parentNode.insertBefore(mermaidContainer, code_block.nextSibling);

            // mermaid.init(undefined, mermaidContainer);
        }
    });
}

function getQuestions() {
    const elements = document.querySelectorAll('div[data-message-author-role="user"]');
    const questions = Array.from(elements)
        .map(element => element.textContent.trim())
    return questions;
}