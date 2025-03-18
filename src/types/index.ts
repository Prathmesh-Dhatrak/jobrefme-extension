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
  
  export interface AppState {
    isHireJobsUrl: boolean;
    currentUrl: string;
    status: ProcessingStatus;
    error: string | null;
    referralMessage: string | null;
    jobTitle: string | null;
    companyName: string | null;
    user: UserState | null;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
  }
  
  export interface AppContextType {
    state: AppState;
    validateUrl: (url: string) => Promise<void>;
    generateReferral: (url: string) => Promise<void>;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    handleAuthCallback: (token: string) => Promise<boolean>;
    storeGeminiApiKey: (apiKey: string) => Promise<boolean>;
    deleteGeminiApiKey: () => Promise<boolean>;
    reset: () => void;
  }