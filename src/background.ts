import { getStoreState } from './store';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('JobRefMe: Extension installed, opening welcome page');
    
    chrome.contextMenus.create({
      id: 'generateReferralFromContent',
      title: 'Generate Referral from Selected Content',
      contexts: ['selection']
    });
    
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html'),
    });
  } else if (details.reason === 'update') {
    console.log('JobRefMe: Extension updated');
    
    chrome.contextMenus.create({
      id: 'generateReferralFromContent',
      title: 'Generate Referral from Selected Content',
      contexts: ['selection']
    });
    
    const state = getStoreState();
    const hasValidToken = state.checkAuthStatus();
    
    if (!hasValidToken) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html'),
      });
    }
  }
});

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === 'generateReferralFromContent' && info.selectionText) {
    console.log('JobRefMe: Selected text for referral generation', info.selectionText.substring(0, 100) + '...');
    
    chrome.storage.local.set({
      'selectedJobContent': info.selectionText,
      'selectedJobContentTimestamp': Date.now()
    });
    
    chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'HIREJOBS_PAGE_DETECTED') {
    console.log('JobRefMe: HireJobs page detected', message.url);

    const state = getStoreState();
    state.setUrlStatus(true, message.url);
  }
  
  return true;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.tokenExpiry) {
    const newExpiryTime = changes.tokenExpiry.newValue;
    
    if (!newExpiryTime || Date.now() > newExpiryTime) {
      console.log('JobRefMe: Auth token expired or removed');
      
      // We could update the store state here if needed
      // const state = getStoreState();
      // state.logout();
    }
  }
});