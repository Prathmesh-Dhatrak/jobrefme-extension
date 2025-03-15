import axios from 'axios';
import { UrlValidationResponse, ReferralInitResponse, ReferralResultResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
export async function initiateReferralGeneration(jobUrl: string): Promise<ReferralInitResponse> {
  try {
    const { data } = await api.post<ReferralInitResponse>('/generate-referral', { jobUrl });
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