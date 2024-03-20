function main() {
  console.log('Content script loaded');
  const btn = document.createElement('button');
  btn.textContent = 'Go to Latest Conversation';
  btn.style.position = 'absolute';
  btn.style.top = '10px';
  btn.style.left = '10px';
  btn.style.zIndex = '1000'; // Ensure the button is visible on top

  btn.onclick = function () {
    // Logic to navigate to the latest conversation
    window.location.href = 'https://chat.openai.com/g/g-3cf5L8Suv-chathistorian/c/d0158178-5242-42b1-b080-253e964f49de';
  };

  document.body.appendChild(btn);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
const observer = new MutationObserver((mutations, obs) => {
  const element = document.querySelector(YOUR_TARGET_SELECTOR);
  if (element) {
    // Element is now present. Do your stuff
    obs.disconnect(); // Stop observing
  }
});

observer.observe(document, { childList: true, subtree: true });
