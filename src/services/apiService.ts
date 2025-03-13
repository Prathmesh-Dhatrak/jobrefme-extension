import { UrlValidationResponse, ReferenceInitResponse, ReferenceResultResponse, ErrorResponse } from '../types';

const API_BASE_URL = 'https://jobrefme-backend.fly.dev/api/v1';

/**
 * Validates if a job URL is valid and accessible
 */
export async function validateJobUrl(jobUrl: string): Promise<UrlValidationResponse> {
  const response = await fetch(`${API_BASE_URL}/url/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobUrl }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error((data as ErrorResponse).error || 'Failed to validate URL');
  }
  
  return data as UrlValidationResponse;
}

/**
 * Initiates the reference generation process
 */
export async function initiateReferenceGeneration(jobUrl: string): Promise<ReferenceInitResponse> {
  const response = await fetch(`${API_BASE_URL}/reference`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobUrl }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error((data as ErrorResponse).error || 'Failed to initiate reference generation');
  }
  
  return data as ReferenceInitResponse;
}

/**
 * Fetches the generated reference message
 */
export async function fetchReferenceResult(jobUrl: string): Promise<ReferenceResultResponse> {
  const response = await fetch(`${API_BASE_URL}/reference/result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobUrl }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error((data as ErrorResponse).error || 'Failed to fetch reference result');
  }
  
  if (data.status === 'processing') {
    throw new Error('PROCESSING');
  }
  
  return data as ReferenceResultResponse;
}

/**
 * Polls for the reference result until it's available
 */
export async function pollReferenceResult(
  jobUrl: string, 
  maxAttempts = 10,
  interval = 1500
): Promise<ReferenceResultResponse> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const result = await fetchReferenceResult(jobUrl);
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
  
  throw new Error('Timed out waiting for reference result');
}