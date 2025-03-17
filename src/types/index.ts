export interface UrlValidationResponse {
    success: boolean;
    valid: boolean;
    message: string;
    cached: boolean;
}

export interface ReferralInitResponse {
    success: boolean;
    status: string;
    message: string;
    jobId: string;
    estimatedTime: string;
    usingCustomApiKey?: boolean;
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
    usingCustomApiKey?: boolean;
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

export interface AppState {
    isHireJobsUrl: boolean;
    currentUrl: string;
    status: ProcessingStatus;
    error: string | null;
    referralMessage: string | null;
    jobTitle: string | null;
    companyName: string | null;
    geminiApiKey: string | null;
    isApiKeyConfigured: boolean;
}

export interface AppContextType {
    state: AppState;
    validateUrl: (url: string) => Promise<void>;
    generateReferral: (url: string) => Promise<void>;
    setApiKey: (apiKey: string) => Promise<void>;
    reset: () => void;
}