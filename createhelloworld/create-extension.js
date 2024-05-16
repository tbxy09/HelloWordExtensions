const fs = require('fs');
const path = require('path');

function createExtension() {
    const extensionDir = 'hello-world-extension';

    // Create the extension directory
    fs.mkdirSync(extensionDir);

    // Create the manifest.json file
    fs.writeFileSync(path.join(extensionDir, 'manifest.json'), JSON.stringify({
        manifest_version: 2,
        name: 'Hello World Extension',
        version: '1.0',
        description: 'A simple Hello World Chrome extension',
        browser_action: {
            default_popup: 'popup.html'
        },
        permissions: ['activeTab', 'tabs', 'bookmarks', 'history', 'webNavigation'],
        background: {
            scripts: ['background.js'],
            persistent: false
        },
        content_scripts: [{
            matches: ['<all_urls>'],
            js: ['content.js']
        }]
    }, null, 2));

    // Create the popup.html file
    fs.writeFileSync(path.join(extensionDir, 'popup.html'), `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
  </body>
  </html>
  `);

    // Create the background.js file
    fs.writeFileSync(path.join(extensionDir, 'background.js'), `
  // This is the background script for the extension
  console.log('Background script running');
  `);

    // Create the content.js file
    fs.writeFileSync(path.join(extensionDir, 'content.js'), `
  // This is the content script for the extension
  console.log('Content script running');
  `);

    console.log('Created Hello World extension');
}

module.exports = createExtension;