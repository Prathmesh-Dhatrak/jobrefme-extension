import axios from 'axios';
import { getStoreState } from '../store';
import { UrlValidationResponse, ReferralInitResponse, ReferralResultResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const state = getStoreState();
    const token = state.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.warn('Authentication error, clearing token');
      const state = getStoreState();
      state.logout();
    }
    return Promise.reject(error);
  }
);

/**
 * Validates if a job URL is valid and accessible
 */
export async function validateJobUrl(jobUrl: string): Promise<UrlValidationResponse> {
  try {
    const { data } = await api.post<UrlValidationResponse>('/validate-job-url', { jobUrl });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to validate URL: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to validate URL: Unknown error');
  }
}

/**
 * Initiates the referral generation process
 */
export async function initiateReferralGeneration(
  jobUrl: string, 
  templateId?: string
): Promise<ReferralInitResponse> {
  try {
    const payload: any = { jobUrl };
    
    if (templateId) {
      payload.templateId = templateId;
    }
    
    const { data } = await api.post<ReferralInitResponse>('/generate-referral', payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to initiate referral generation: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to initiate referral generation: Unknown error');
  }
}

/**
 * Fetches the generated referral message
 */
export async function fetchReferralResult(jobUrl: string): Promise<ReferralResultResponse> {
  try {
    const { data } = await api.post<ReferralResultResponse>('/generate-referral/result', { jobUrl });
    
    if (data.status === 'processing') {
      throw new Error('PROCESSING');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error && error.message === 'PROCESSING') {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch referral result: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to fetch referral result: Unknown error');
  }
}

/**
 * Polls for the referral result until it's available
 */
export async function pollReferralResult(
  jobUrl: string,
  maxAttempts = 10,
  interval = 1500
): Promise<ReferralResultResponse> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const result = await fetchReferralResult(jobUrl);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === 'PROCESSING') {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, interval));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Timed out waiting for referral result');
}

/**
 * Clears the referral cache for a specific job URL or all cached referrals
 */
export async function clearReferralCache(jobUrl: string): Promise<{ success: boolean, message: string }> {
  try {
    const { data } = await api.post('/clear-cache', { jobUrl });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to clear cache: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to clear cache: Unknown error');
  }
}