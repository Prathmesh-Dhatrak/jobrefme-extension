import { StateCreator } from 'zustand';
import axios from 'axios';
import { StoreState } from './index';
import { ProcessingStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface JobSlice {
  isHireJobsUrl: boolean;
  currentUrl: string;
  status: ProcessingStatus;
  referralMessage: string | null;
  jobTitle: string | null;
  companyName: string | null;
  errorJobUrl: string | null;
  
  setUrlStatus: (isHireJobsUrl: boolean, currentUrl: string) => void;
  validateUrl: (url: string) => Promise<void>;
  generateReferral: (url: string) => Promise<void>;
  clearCacheAndRetry: (url: string) => Promise<void>;
  clearCache: (url?: string) => Promise<boolean>;
  resetJobState: () => void;
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
  
  setUrlStatus: (isHireJobsUrl: boolean, currentUrl: string) => {
    set({ isHireJobsUrl, currentUrl });
  },
  
  validateUrl: async (url: string) => {
    const { getAuthToken, isAuthenticated } = get();
    
    if (!isAuthenticated) {
      set({ 
        status: ProcessingStatus.ERROR,
        error: 'Authentication required. Please log in to continue.'
      });
      return;
    }
    
    try {
      set({ status: ProcessingStatus.VALIDATING });
      
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/validate-job-url`,
        { jobUrl: url },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const validationResult = response.data;
      
      if (!validationResult.valid) {
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
    const { getAuthToken, isAuthenticated, hasGeminiApiKey, selectedTemplateId } = get();
    
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
      
      const token = getAuthToken();
      const payload: any = { jobUrl: url };
      
      if (selectedTemplateId) {
        payload.templateId = selectedTemplateId;
      }
      
      await axios.post(
        `${API_BASE_URL}/generate-referral`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      set({ status: ProcessingStatus.FETCHING });
      
      let attempts = 0;
      const maxAttempts = 10;
      const interval = 1500;
      
      while (attempts < maxAttempts) {
        try {
          const result = await axios.post(
            `${API_BASE_URL}/generate-referral/result`,
            { jobUrl: url },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (result.data.status === 'processing') {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, interval));
            continue;
          }
          
          set({
            status: ProcessingStatus.COMPLETED,
            referralMessage: result.data.referralMessage,
            jobTitle: result.data.jobTitle,
            companyName: result.data.companyName
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
  
  clearCache: async (url: string = 'all') => {
    const { getAuthToken, isAuthenticated } = get();
    
    if (!isAuthenticated) {
      set({
        error: 'Authentication required. Please log in to continue.'
      });
      return false;
    }
    
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/clear-cache`,
        { jobUrl: url },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data.success;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear cache'
      });
      return false;
    }
  },
  
  resetJobState: () => {
    set({
      status: ProcessingStatus.IDLE,
      error: null,
      referralMessage: null,
      jobTitle: null,
      companyName: null,
      errorJobUrl: null
    });
  }
});