export interface UrlValidationResponse {
    success: boolean;
    valid: boolean;
    message: string;
    cached: boolean;
}

export interface ReferenceInitResponse {
    success: boolean;
    status: string;
    message: string;
    jobId: string;
    estimatedTime: string;
}

export interface ReferenceResultResponse {
    success: boolean;
    referenceMessage: string;
    jobTitle: string;
    companyName: string;
    jobId: string;
    cached: boolean;
    cachedAt?: number;
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
    referenceMessage: string | null;
    jobTitle: string | null;
    companyName: string | null;
}

export interface AppContextType {
    state: AppState;
    validateUrl: (url: string) => Promise<void>;
    generateReference: (url: string) => Promise<void>;
    reset: () => void;
}