chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('JobRefMe: Extension installed, opening welcome page');
    
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html'),
    });
  } else if (details.reason === 'update') {
    console.log('JobRefMe: Extension updated');
    const result = await chrome.storage.local.get(['authToken', 'tokenExpiry']);
    const hasValidToken = result.authToken && result.tokenExpiry && Date.now() < result.tokenExpiry;
    
    if (!hasValidToken) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html'),
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'HIREJOBS_PAGE_DETECTED') {
    console.log('JobRefMe: HireJobs page detected', message.url);
  }
  
  return true;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.tokenExpiry) {
    const newExpiryTime = changes.tokenExpiry.newValue;
    
    if (!newExpiryTime || Date.now() > newExpiryTime) {
      console.log('JobRefMe: Auth token expired or removed');
    }
  }
});