import { StateCreator } from 'zustand';
import { StoreState } from './index';
import { ProcessingStatus } from '../types';
import { api } from '../services/apiClient';

export interface JobSlice {
  isHireJobsUrl: boolean;
  currentUrl: string;
  status: ProcessingStatus;
  referralMessage: string | null;
  jobTitle: string | null;
  companyName: string | null;
  errorJobUrl: string | null;
  selectedJobContent: string | null;
  
  setUrlStatus: (isHireJobsUrl: boolean, currentUrl: string) => void;
  validateUrl: (url: string) => Promise<void>;
  generateReferral: (url: string) => Promise<void>;
  generateReferralFromContent: (content: string) => Promise<void>;
  clearCacheAndRetry: (url: string) => Promise<void>;
  clearCacheAndRetryForContent: (content: string, jobId: string) => Promise<void>;
  clearCacheForContent: (jobId: string) => Promise<boolean>;
  clearCache: (url?: string) => Promise<boolean>;
  checkForSelectedContent: () => Promise<boolean>;
  resetJobState: () => void;
  clearSelectedContent: () => Promise<void>;
}

export const createJobSlice: StateCreator<
  StoreState,
  [],
  [],
  JobSlice
> = (set, get, _store) => ({
  isHireJobsUrl: false,
  currentUrl: '',
  status: ProcessingStatus.IDLE,
  referralMessage: null,
  jobTitle: null,
  companyName: null,
  errorJobUrl: null,
  selectedJobContent: null,
  
  setUrlStatus: (isHireJobsUrl: boolean, currentUrl: string) => {
    set({ isHireJobsUrl, currentUrl });
  },
  
  validateUrl: async (url: string) => {
    if (!get().isAuthenticated) {
      set({ 
        status: ProcessingStatus.ERROR,
        error: 'Authentication required. Please log in to continue.'
      });
      return;
    }
    
    try {
      set({ status: ProcessingStatus.VALIDATING });
      
      const { data } = await api.post('/validate-job-url', { jobUrl: url });
      
      if (!data.valid) {
        throw new Error('This job posting URL is not valid or accessible');
      }
      
    } catch (error) {
      set({
        status: ProcessingStatus.ERROR,
        error: error instanceof Error ? error.message : 'Failed to validate URL'
      });
    }
  },
  
  generateReferral: async (url: string) => {
    const { isAuthenticated, hasGeminiApiKey, selectedTemplateId } = get();
    
    if (!isAuthenticated) {
      set({
        status: ProcessingStatus.ERROR,
        error: 'Authentication required. Please log in to continue.'
      });
      return;
    }
    
    if (!hasGeminiApiKey) {
      set({
        status: ProcessingStatus.ERROR,
        error: 'Gemini API key is required. Please configure it in the settings.'
      });
      return;
    }
    
    try {
      set({ status: ProcessingStatus.GENERATING });
      
      const payload: any = { jobUrl: url };
      
      if (selectedTemplateId) {
        payload.templateId = selectedTemplateId;
      }
      
      await api.post('/generate-referral', payload);
      
      set({ status: ProcessingStatus.FETCHING });
      
      let attempts = 0;
      const maxAttempts = 10;
      const interval = 1500;
      
      while (attempts < maxAttempts) {
        try {
  
          const { data } = await api.post('/generate-referral/result', { jobUrl: url });
          
          if (data.status === 'processing') {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, interval));
            continue;
          }
          
          set({
            status: ProcessingStatus.COMPLETED,
            referralMessage: data.referralMessage,
            jobTitle: data.jobTitle,
            companyName: data.companyName
          });
          
          return;
        } catch (error) {
          if (error instanceof Error && error.message.includes('processing')) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, interval));
          } else {
            throw error;
          }
        }
      }
      
      throw new Error('Timed out waiting for referral result');
      
    } catch (error) {
      set({
        status: ProcessingStatus.ERROR,
        error: error instanceof Error ? error.message : 'Failed to generate referral',
        errorJobUrl: url
      });
    }
  },
  
  generateReferralFromContent: async (content: string) => {
    const { isAuthenticated, hasGeminiApiKey } = get();
    
    if (!isAuthenticated) {
      set({
        status: ProcessingStatus.ERROR,
        error: 'Authentication required. Please log in to continue.'
      });
      return;
    }
    
    if (!hasGeminiApiKey) {
      set({
        status: ProcessingStatus.ERROR,
        error: 'Gemini API key is required. Please configure it in the settings.'
      });
      return;
    }
    
    try {
      set({ 
        status: ProcessingStatus.GENERATING,
        selectedJobContent: content
      });
      
      const { data } = await api.post('/generate-referral/content', { 
        jobContent: content 
      });
      
      set({
        status: ProcessingStatus.COMPLETED,
        referralMessage: data.referralMessage,
        jobTitle: data.jobTitle,
        companyName: data.companyName
      });
      
    } catch (error) {
      set({
        status: ProcessingStatus.ERROR,
        error: error instanceof Error ? error.message : 'Failed to generate referral from content'
      });
    }
  },
  
  clearCacheAndRetry: async (url: string) => {
    const { isAuthenticated, hasGeminiApiKey, clearCache, generateReferral } = get();
    
    if (!isAuthenticated) {
      set({
        status: ProcessingStatus.ERROR,
        error: 'Authentication required. Please log in to continue.'
      });
      return;
    }
    
    if (!hasGeminiApiKey) {
      set({
        status: ProcessingStatus.ERROR,
        error: 'Gemini API key is required. Please configure it in the settings.'
      });
      return;
    }
    
    try {
      set({ status: ProcessingStatus.VALIDATING });
      
      const clearResult = await clearCache(url);
      
      if (!clearResult) {
        throw new Error('Failed to clear cache for this job URL');
      }
      
      await generateReferral(url);
      
    } catch (error) {
      set({
        status: ProcessingStatus.ERROR,
        error: error instanceof Error ? error.message : 'Failed to generate referral',
        errorJobUrl: url
      });
    }
  },
  
  clearCacheAndRetryForContent: async (content: string, jobId: string) => {
    const { isAuthenticated, hasGeminiApiKey, clearCacheForContent, generateReferralFromContent } = get();
    
    if (!isAuthenticated) {
      set({
        status: ProcessingStatus.ERROR,
        error: 'Authentication required. Please log in to continue.'
      });
      return;
    }
    
    if (!hasGeminiApiKey) {
      set({
        status: ProcessingStatus.ERROR,
        error: 'Gemini API key is required. Please configure it in the settings.'
      });
      return;
    }
    
    try {
      set({ status: ProcessingStatus.VALIDATING });
      
      const clearResult = await clearCacheForContent(jobId);
      
      if (!clearResult) {
        throw new Error('Failed to clear cache for this job content');
      }
      
      await generateReferralFromContent(content);
      
    } catch (error) {
      set({
        status: ProcessingStatus.ERROR,
        error: error instanceof Error ? error.message : 'Failed to generate referral from content'
      });
    }
  },
  
  clearCacheForContent: async (jobId: string) => {
    if (!get().isAuthenticated) {
      set({
        error: 'Authentication required. Please log in to continue.'
      });
      return false;
    }
    
    try {
      const { data } = await api.post('/clear-cache', { jobId });
      
      return data.success;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear cache for content'
      });
      return false;
    }
  },
  
  clearCache: async (url: string = 'all') => {
    if (!get().isAuthenticated) {
      set({
        error: 'Authentication required. Please log in to continue.'
      });
      return false;
    }
    
    try {
      const { data } = await api.post('/clear-cache', { jobUrl: url });
      
      return data.success;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear cache'
      });
      return false;
    }
  },
  
  checkForSelectedContent: async () => {
    try {
      const result = await chrome.storage.local.get(['selectedJobContent', 'selectedJobContentTimestamp']);
      
      if (result.selectedJobContent && result.selectedJobContentTimestamp) {
        const isRecent = Date.now() - result.selectedJobContentTimestamp < 5 * 60 * 1000;
        
        if (isRecent) {
          set({ selectedJobContent: result.selectedJobContent });
          return true;
        } else {
          await chrome.storage.local.remove(['selectedJobContent', 'selectedJobContentTimestamp']);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check for selected content:', error);
      return false;
    }
  },
  
  clearSelectedContent: async () => {
    try {
      await chrome.storage.local.remove(['selectedJobContent', 'selectedJobContentTimestamp']);
      set({ selectedJobContent: null });
    } catch (error) {
      console.error('Failed to clear selected content:', error);
    }
  },
  
  resetJobState: () => {
    set({
      status: ProcessingStatus.IDLE,
      error: null,
      referralMessage: null,
      jobTitle: null,
      companyName: null,
      errorJobUrl: null,
      selectedJobContent: null
    });
  }
});