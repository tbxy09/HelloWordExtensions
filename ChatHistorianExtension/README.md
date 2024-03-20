# My Extension

This is a browser extension that adds a custom button to the ChatGPT interface on `https://chat.openai.com`. The button allows users to navigate to the latest conversation of the current gizmo.

## Installation

1. Download or clone this repository to your local machine.
2. Open the browser's extension management page by navigating to `chrome://extensions` for Chrome or `about:addons` for Firefox.
3. Enable Developer Mode (for Chrome) or Debug Add-ons (for Firefox).
4. Click "Load Unpacked" (for Chrome) or "Load Temporary Add-on" (for Firefox) and select the `my-extension` directory.

## Usage

Once installed, navigate to `https://chat.openai.com`. You will see a custom button in the upper left corner of the page. Clicking this button will take you to the latest conversation of the current gizmo.

## Files

- `manifest.json`: Specifies basic metadata about the extension and which scripts to run on which pages.
- `background.js`: Listens for events from the browser and from other scripts in the extension.
- `content.js`: Injects the custom button into the ChatGPT interface.
- `popup.html`: Contains the HTML content for the popup that appears when the user clicks on the extension's icon.
- `popup.js`: Manipulates the DOM of the popup.html file and communicates with the background script.
- `styles.css`: Defines the styles for the custom button and the popup.

## Support

For any issues or improvements, please open an issue on the GitHub repository.

## License

This project is licensed under the MIT License.