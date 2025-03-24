export interface Template {
  _id: string;
  name: string;
  content: string;
  isDefault: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UrlValidationResponse {
  success: boolean;
  valid: boolean;
  message: string;
  cached: boolean;
  isAuthenticated?: boolean;
  usingStoredApiKey?: boolean;
}

export interface ReferralInitResponse {
  success: boolean;
  status: string;
  message: string;
  jobId: string;
  estimatedTime: string;
  isAuthenticated?: boolean;
  usingStoredApiKey?: boolean;
}

export interface ReferralResultResponse {
  success: boolean;
  status?: 'processing' | 'completed';
  referralMessage: string;
  jobTitle: string;
  companyName: string;
  jobId: string;
  cached: boolean;
  cachedAt?: number;
  isAuthenticated?: boolean;
  usingStoredApiKey?: boolean;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export enum ProcessingStatus {
  IDLE = 'idle',
  VALIDATING = 'validating',
  GENERATING = 'generating',
  FETCHING = 'fetching',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface UserState {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  hasGeminiApiKey: boolean;
}

