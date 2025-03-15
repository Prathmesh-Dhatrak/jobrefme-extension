import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppContextType, ProcessingStatus } from '../types';
import { useHireJobsDetection } from '../hooks/useHireJobsDetection';
import {
  validateJobUrl,
  initiateReferralGeneration,
  pollReferralResult
} from '../services/apiService';

const initialState: AppState = {
  isHireJobsUrl: false,
  currentUrl: '',
  status: ProcessingStatus.IDLE,
  error: null,
  referralMessage: null,
  jobTitle: null,
  companyName: null
};

type Action =
  | { type: 'SET_HIREJOBS_STATUS'; payload: { isHireJobsUrl: boolean; currentUrl: string } }
  | { type: 'SET_STATUS'; payload: ProcessingStatus }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REFERENCE_DATA'; payload: { referralMessage: string; jobTitle: string; companyName: string } }
  | { type: 'RESET' };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_HIREJOBS_STATUS':
      return {
        ...state,
        isHireJobsUrl: action.payload.isHireJobsUrl,
        currentUrl: action.payload.currentUrl
      };
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
        error: action.payload === ProcessingStatus.ERROR ? state.error : null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        status: action.payload ? ProcessingStatus.ERROR : state.status
      };
    case 'SET_REFERENCE_DATA':
      return {
        ...state,
        referralMessage: action.payload.referralMessage,
        jobTitle: action.payload.jobTitle,
        companyName: action.payload.companyName,
        status: ProcessingStatus.COMPLETED
      };
    case 'RESET':
      return {
        ...initialState,
        isHireJobsUrl: state.isHireJobsUrl,
        currentUrl: state.currentUrl
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isHireJobsUrl, currentUrl } = useHireJobsDetection();

  React.useEffect(() => {
    dispatch({
      type: 'SET_HIREJOBS_STATUS',
      payload: { isHireJobsUrl, currentUrl }
    });
  }, [isHireJobsUrl, currentUrl]);

  /**
   * Validates if a job URL is valid
   */
  const validateUrl = async (url: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.VALIDATING });
      
      const validationResult = await validateJobUrl(url);
      
      if (!validationResult.valid) {
        throw new Error('This job posting URL is not valid or accessible');
      }
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to validate URL' 
      });
    }
  };

  /**
   * Generates a referral message for a job posting
   */
  const generateReferral = async (url: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.VALIDATING });
      await validateJobUrl(url);
      
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.GENERATING });
      await initiateReferralGeneration(url);

      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.FETCHING });
      const result = await pollReferralResult(url);
      
      dispatch({
        type: 'SET_REFERENCE_DATA',
        payload: {
          referralMessage: result.referralMessage,
          jobTitle: result.jobTitle,
          companyName: result.companyName
        }
      });
      
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to generate referral'
      });
    }
  };

  /**
   * Resets the application state
   */
  const reset = (): void => {
    dispatch({ type: 'RESET' });
  };

  const contextValue: AppContextType = {
    state,
    validateUrl,
    generateReferral,
    reset
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}