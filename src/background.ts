chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('JobRefMe: Extension installed, opening welcome page');
    
    const storage = await chrome.storage.local.get(['geminiApiKey']);
    
    if (!storage.geminiApiKey) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html'),
      });
    }
  } else if (details.reason === 'update') {
    console.log('JobRefMe: Extension updated');
  }
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'HIREJOBS_PAGE_DETECTED') {
    console.log('JobRefMe: HireJobs page detected', message.url);
  }
  
  return true;
});