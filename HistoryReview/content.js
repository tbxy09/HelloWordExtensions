//helper functions to peek mode
if (typeof key == 'function') {
    // Define a function to run when "Shift + A" is pressed
    key('shift+a', function () {
        // console.log('Shift + A is pressed!');
        // alert('Shift + A is pressed!');
        // open window if not exist, else close it
        chrome.runtime.sendMessage({ action: 'openExtensionPage', mode: 'center' });
        // openHistoryInPeekMode('center');
        // Here you can add your logic to open your extension's main page in different modes
    });
} else {
    console.error('Keymaster library not loaded.');
}