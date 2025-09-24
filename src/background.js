// Background service worker for Weeklet Chrome Extension
// Manifest V3 requires service worker instead of background page

console.log('Weeklet background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Weeklet extension installed:', details.reason);
  
  if (details.reason === 'install') {
    console.log('First time installation');
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Weeklet extension started');
});

// Handle messages from popup or content scripts (for future use)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message);
  
  // Echo back for now - can add specific handlers later
  sendResponse({ received: true, echo: message });
});

// Optional: Handle extension icon click (redundant with popup action, but available)
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.url);
  // This won't fire if popup is defined in manifest, but keeping for reference
});

console.log('Weeklet background service worker setup complete');
