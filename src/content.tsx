import './index.css';
import { isHireJobsJobUrl } from './utils/urlUtils';
import { getStoreState } from './store';

console.log('JobRefMe: Content script loaded');

const currentUrl = window.location.href;
const isHireJobsPage = isHireJobsJobUrl(currentUrl);

const store = getStoreState();
store.setUrlStatus(isHireJobsPage, currentUrl);

if (isHireJobsPage) {
  console.log('JobRefMe: HireJobs job posting detected');
  
  chrome.runtime.sendMessage({
    type: 'HIREJOBS_PAGE_DETECTED',
    url: currentUrl
  });
  
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'GET_CURRENT_URL') {
      sendResponse({ url: window.location.href });
    }
  });
}