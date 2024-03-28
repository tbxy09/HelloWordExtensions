// Initialize Mermaid
// mermaid.initialize({
//     startOnLoad: true,
//     theme: 'forest', // Available themes are 'default', 'forest', and 'dark'
//     flowchart: {
//         useMaxWidth: false,
//         htmlLabels: true
//     }
// });
// with a fixed size of mermaid diagram div
mermaid.initialize({ startOnLoad: true });


// Initialize the script by adding the button
// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchQuestions") {
        const questions = fetchQuestionsFromPage(); // Implement this based on your page structure
        sendResponse({ questions });
    }
});

// Function to retrieve the questions

// Example function to scroll to a question
function scrollToQuestion(questionId) {
    const element = document.querySelector(`#${questionId}`); // Adjust selector as needed
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// This could be triggered by a message from your side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrollToQuestion") {
        scrollToQuestion(request.questionId);
    }
});
// insert a code input the mermaid code
const codeInput = document.createElement('textarea');
codeInput.placeholder = 'Enter Mermaid code here...';
codeInput.style.width = '100%';
codeInput.style.height = '100px';
codeInput.style.marginBottom = '10px';
codeInput.id = 'mermaidCode';
document.body.appendChild(codeInput);

// Sample Mermaid diagram
const sampleDiagram = `
flowchart LR

A[Hard] -->|Text| B(Round)
B --> C{Decision}
C -->|One| D[Result 1]
C -->|Two| E[Result 2]
`;
// sampleDiagram = null;
// Render the Mermaid diagram
// add a button to render the mermaid diagram
// create a mermaid diagram div for render sample diagram
// keymaster
if (typeof key == 'function') {
    key('shift+r', function () {
        const code = codeInput.value || sampleDiagram;
        const mermaidDiagramDiv = document.getElementById('mermaidDiagram');
        mermaidDiagramDiv.innerHTML = `<div class="mermaid">${code}</div>`;

        // Check if the diagram code is valid
        try {
            mermaid.mermaidAPI.parse(code);
            mermaid.init(undefined, mermaidDiagramDiv.querySelector('.mermaid'));
        } catch (error) {
            // Show the error in the page
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Diagram code is invalid with error message: ' + error;
            document.body.appendChild(errorMessage);
        }
    });
} else {
    // Show the error in HTML
    const error = document.createElement('p');
    error.textContent = 'Keymaster library not loaded.';
    document.body.appendChild(error);
}


// Quick navigation links
const quickNavLinks = [
    { title: 'Google', url: 'https://www.google.com' },
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com' }
];

// Render quick navigation links
// const quickNavList = document.getElementById('quickNavList');
// quickNavLinks.forEach(link => {
//     const listItem = document.createElement('li');
//     const anchor = document.createElement('a');
//     anchor.href = link.url;
//     anchor.target = '_blank';
//     anchor.textContent = link.title;
//     listItem.appendChild(anchor);
//     quickNavList.appendChild(listItem);
// });


function displayQuestions(questions) {
    // const questions = getQuestions();
    questionContainer.innerHTML = '';

    const questionList = document.createElement('ul');

    questions.forEach(question => {
        const truncatedQuestion = truncateToTokens(question, 100);

        const listItem = document.createElement('li');
        listItem.innerHTML = `<pre><code>• ${truncatedQuestion}</code></pre>`;

        questionList.appendChild(listItem);
    });

    questionContainer.appendChild(questionList);

    const favoriteConversations = loadFavoriteConversations();
    const currentConversation = questions.join('\n');
    const isFavorite = favoriteConversations.includes(currentConversation);
    favoriteButton.textContent = isFavorite ? 'Unfavorite' : 'Favorite';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'renderQuestions') {
        displayQuestions(request.questions);
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'renderMermaidDiagrams') {
        // Render the Mermaid diagram
        const mermaidDiagramDiv = document.getElementById('mermaidDiagram');
        mermaidDiagramDiv.textContent = request.code;
        mermaid.init(undefined, mermaidDiagramDiv);
    }
});