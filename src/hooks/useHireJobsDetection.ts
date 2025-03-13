import { useState, useEffect } from 'react';
import { isHireJobsJobUrl } from '../utils/urlUtils';

interface UseHireJobsDetectionResult {
  isHireJobsUrl: boolean;
  currentUrl: string;
}

/**
 * Hook to detect if the current tab is a HireJobs job posting
 */
export function useHireJobsDetection(): UseHireJobsDetectionResult {
  const [isHireJobsUrl, setIsHireJobsUrl] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
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
  }, []);

  /**
   * Gets information about the current tab
   */
  function getCurrentTabInfo() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const url = activeTab?.url || '';
      
      setCurrentUrl(url);
      setIsHireJobsUrl(isHireJobsJobUrl(url));
    });
  }

  return { isHireJobsUrl, currentUrl };
}