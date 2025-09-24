/**
 * Background service worker for Weeklet
 */

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Weeklet extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    console.log('Welcome to Weeklet!');
  } else if (details.reason === 'update') {
    console.log('Weeklet updated to version:', chrome.runtime.getManifest().version);
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Weeklet background service worker started');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'ping':
      sendResponse({ status: 'pong' });
      break;
    
    default:
      console.log('Unknown message type:', message.type);
      sendResponse({ error: 'Unknown message type' });
  }
  
  return true;
});
