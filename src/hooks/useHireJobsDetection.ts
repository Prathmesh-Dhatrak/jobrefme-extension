import { useEffect } from 'react';
import { isHireJobsJobUrl } from '../utils/urlUtils';
import { useStore } from '../store';

export function useHireJobsDetection(): void {
  const setUrlStatus = useStore(state => state.setUrlStatus);

  useEffect(() => {
    const getCurrentTabInfo = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        const url = activeTab?.url || '';
        
        const isHireJobsUrl = isHireJobsJobUrl(url);
        setUrlStatus(isHireJobsUrl, url);
      });
    };

    getCurrentTabInfo();
    
    chrome.tabs.onActivated.addListener(getCurrentTabInfo);
    chrome.tabs.onUpdated.addListener((_, changeInfo) => {
      if (changeInfo.url) {
        getCurrentTabInfo();
      }
    });
    
    return () => {
      chrome.tabs.onActivated.removeListener(getCurrentTabInfo);
      chrome.tabs.onUpdated.removeListener(getCurrentTabInfo);
    };
  }, [setUrlStatus]);
}