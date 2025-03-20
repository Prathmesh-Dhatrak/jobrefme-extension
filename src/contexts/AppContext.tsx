import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { AppState, AppContextType, ProcessingStatus, UserState, Template } from '../types';
import { useHireJobsDetection } from '../hooks/useHireJobsDetection';
import {
  validateJobUrl,
  initiateReferralGeneration,
  pollReferralResult,
  clearReferralCache
} from '../services/apiService';
import authService from '../services/authService';
import {
  fetchTemplates as fetchTemplatesApi,
  createTemplate as createTemplateApi,
  updateTemplate as updateTemplateApi,
  deleteTemplate as deleteTemplateApi
} from '../services/templateService';

const initialState: AppState = {
  isHireJobsUrl: false,
  currentUrl: '',
  status: ProcessingStatus.IDLE,
  error: null,
  referralMessage: null,
  jobTitle: null,
  companyName: null,
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  errorJobUrl: null,
  templates: [],
  isLoadingTemplates: false,
  templateError: null,
  selectedTemplateId: null,
};

type Action =
  | { type: 'SET_HIREJOBS_STATUS'; payload: { isHireJobsUrl: boolean; currentUrl: string } }
  | { type: 'SET_STATUS'; payload: ProcessingStatus }
  | { type: 'SET_ERROR'; payload: { message: string | null; jobUrl?: string | null } }
  | { type: 'SET_REFERENCE_DATA'; payload: { referralMessage: string; jobTitle: string; companyName: string } }
  | { type: 'SET_AUTH_STATUS'; payload: { isAuthenticated: boolean; user: UserState | null } }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_TEMPLATES'; payload: Template[] }
  | { type: 'SET_LOADING_TEMPLATES'; payload: boolean }
  | { type: 'SET_TEMPLATE_ERROR'; payload: string | null }
  | { type: 'ADD_TEMPLATE'; payload: Template }
  | { type: 'UPDATE_TEMPLATE'; payload: Template }
  | { type: 'REMOVE_TEMPLATE'; payload: string }
  | { type: 'SET_SELECTED_TEMPLATE'; payload: string | null }
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
        error: action.payload.message,
        errorJobUrl: action.payload.jobUrl || state.errorJobUrl,
        status: action.payload.message ? ProcessingStatus.ERROR : state.status
      };
    case 'SET_REFERENCE_DATA':
      return {
        ...state,
        referralMessage: action.payload.referralMessage,
        jobTitle: action.payload.jobTitle,
        companyName: action.payload.companyName,
        status: ProcessingStatus.COMPLETED
      };
    case 'SET_AUTH_STATUS':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user
      };
    case 'SET_AUTH_LOADING':
      return {
        ...state,
        isAuthLoading: action.payload
      };

    case 'SET_TEMPLATES':
      return {
        ...state,
        templates: action.payload,
        templateError: null
      };
    case 'SET_LOADING_TEMPLATES':
      return {
        ...state,
        isLoadingTemplates: action.payload
      };
    case 'SET_TEMPLATE_ERROR':
      return {
        ...state,
        templateError: action.payload
      };
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, action.payload]
      };
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(template =>
          template._id === action.payload._id ? action.payload : template
        )
      };
    case 'REMOVE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(template => template._id !== action.payload)
      };

    case 'SET_SELECTED_TEMPLATE':
      return {
        ...state,
        selectedTemplateId: action.payload
      };
    case 'RESET':
      return {
        ...initialState,
        isHireJobsUrl: state.isHireJobsUrl,
        currentUrl: state.currentUrl,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAuthLoading: state.isAuthLoading,
        errorJobUrl: null
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isHireJobsUrl, currentUrl } = useHireJobsDetection();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_AUTH_LOADING', payload: true });
        const isAuthenticated = authService.isAuthenticated();

        if (isAuthenticated) {
          const userProfile = await authService.fetchUserProfile();

          if (userProfile) {
            console.log('Auth initialized successfully with profile:', userProfile);
            dispatch({
              type: 'SET_AUTH_STATUS',
              payload: {
                isAuthenticated: true,
                user: {
                  id: userProfile.id,
                  email: userProfile.email,
                  displayName: userProfile.displayName,
                  firstName: userProfile.firstName,
                  lastName: userProfile.lastName,
                  profilePicture: userProfile.profilePicture,
                  hasGeminiApiKey: userProfile.hasGeminiApiKey
                }
              }
            });
          } else {
            console.log('Profile fetch failed during auth initialization');
            dispatch({
              type: 'SET_AUTH_STATUS',
              payload: { isAuthenticated: false, user: null }
            });
          }
        } else {
          console.log('User not authenticated during initialization');
          dispatch({
            type: 'SET_AUTH_STATUS',
            payload: { isAuthenticated: false, user: null }
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({
          type: 'SET_AUTH_STATUS',
          payload: { isAuthenticated: false, user: null }
        });
      } finally {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        setInitialized(true);
      }
    };

    initializeAuth();

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.authToken || changes.userProfile) {
        console.log('Auth storage changed, reinitializing auth');
        initializeAuth();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    dispatch({
      type: 'SET_HIREJOBS_STATUS',
      payload: { isHireJobsUrl, currentUrl }
    });
  }, [isHireJobsUrl, currentUrl]);

  /**
   * Handle the authentication callback
   */
  const handleAuthCallback = async (token: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_AUTH_LOADING', payload: true });

      const success = await authService.handleAuthCallback(token);

      if (success) {
        const userProfile = await authService.fetchUserProfile();

        if (userProfile) {
          dispatch({
            type: 'SET_AUTH_STATUS',
            payload: {
              isAuthenticated: true,
              user: {
                id: userProfile.id,
                email: userProfile.email,
                displayName: userProfile.displayName,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                profilePicture: userProfile.profilePicture,
                hasGeminiApiKey: userProfile.hasGeminiApiKey
              }
            }
          });
        }
      }

      return success;
    } catch (error) {
      console.error('Error handling auth callback:', error);
      return false;
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    }
  };

  /**
   * Start the login process
   */
  const login = async (): Promise<void> => {
    try {
      await authService.login();
    } catch (error) {
      console.error('Login error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: error instanceof Error ? error.message : 'Failed to login'
        }
      });
    }
  };

  /**
   * Logout the user
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({
        type: 'SET_AUTH_STATUS',
        payload: { isAuthenticated: false, user: null }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Store Gemini API key
   */
  const storeGeminiApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const success = await authService.storeGeminiApiKey(apiKey);

      if (success && state.user) {
        // Update local user state
        dispatch({
          type: 'SET_AUTH_STATUS',
          payload: {
            isAuthenticated: true,
            user: {
              ...state.user,
              hasGeminiApiKey: true
            }
          }
        });
      }

      return success;
    } catch (error) {
      console.error('Error storing API key:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: error instanceof Error ? error.message : 'Failed to store API key'
        }
      });
      return false;
    }
  };

  /**
   * Delete Gemini API key
   */
  const deleteGeminiApiKey = async (): Promise<boolean> => {
    try {
      const success = await authService.deleteGeminiApiKey();

      if (success && state.user) {
        // Update local user state
        dispatch({
          type: 'SET_AUTH_STATUS',
          payload: {
            isAuthenticated: true,
            user: {
              ...state.user,
              hasGeminiApiKey: false
            }
          }
        });
      }

      return success;
    } catch (error) {
      console.error('Error deleting API key:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: error instanceof Error ? error.message : 'Failed to delete API key'
        }
      });
      return false;
    }
  };

  /**
   * Validates if a job URL is valid
   */
  const validateUrl = async (url: string): Promise<void> => {
    if (!state.isAuthenticated) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: 'Authentication required. Please log in to continue.'
        }
      });
      return;
    }

    try {
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.VALIDATING });

      const validationResult = await validateJobUrl(url);

      if (!validationResult.valid) {
        throw new Error('This job posting URL is not valid or accessible');
      }

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: error instanceof Error ? error.message : 'Failed to validate URL'
        }
      });
    }
  };

  /**
   * Generates a referral message for a job posting
   */
  const generateReferral = async (url: string): Promise<void> => {
    if (!state.isAuthenticated) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: 'Authentication required. Please log in to continue.'
        }
      });
      return;
    }

    if (!state.user?.hasGeminiApiKey) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: 'Gemini API key is required. Please configure it in the settings.'
        }
      });
      return;
    }

    try {
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.GENERATING });
      await initiateReferralGeneration(url, state.selectedTemplateId || undefined);

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
        payload: {
          message: error instanceof Error ? error.message : 'Failed to generate referral',
          jobUrl: url
        }
      });
    }
  };

  /**
   * Clears the referral cache for a specific job URL or all cached referrals
   */
  const clearCache = async (url?: string): Promise<boolean> => {
    if (!state.isAuthenticated) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: 'Authentication required. Please log in to continue.'
        }
      });
      return false;
    }

    try {
      const result = await clearReferralCache(url || "all");
      return result.success;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: error instanceof Error ? error.message : 'Failed to clear cache'
        }
      });
      return false;
    }
  };

  /**
 * Clears the cache for a specific job URL and attempts to generate a new referral
 */
  const clearCacheAndRetry = async (url: string): Promise<void> => {
    if (!state.isAuthenticated) {
      dispatch({
        type: 'SET_ERROR',
        payload: { message: 'Authentication required. Please log in to continue.' }
      });
      return;
    }
  
    if (!state.user?.hasGeminiApiKey) {
      dispatch({
        type: 'SET_ERROR',
        payload: { message: 'Gemini API key is required. Please configure it in the settings.' }
      });
      return;
    }
  
    try {
      dispatch({ type: 'SET_STATUS', payload: ProcessingStatus.VALIDATING });
      const clearResult = await clearCache(url);
  
      if (!clearResult) {
        throw new Error('Failed to clear cache for this job URL');
      }
  
      await generateReferral(url);
  
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: error instanceof Error ? error.message : 'Failed to generate referral',
          jobUrl: url
        }
      });
    }
  };

  /**
   * Fetch all templates
   */
  const fetchTemplates = async (): Promise<void> => {
    if (!state.isAuthenticated) {
      dispatch({
        type: 'SET_TEMPLATE_ERROR',
        payload: 'Authentication required. Please log in to continue.'
      });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING_TEMPLATES', payload: true });
      const templates = await fetchTemplatesApi();
      dispatch({ type: 'SET_TEMPLATES', payload: templates });
    } catch (error) {
      dispatch({
        type: 'SET_TEMPLATE_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch templates'
      });
    } finally {
      dispatch({ type: 'SET_LOADING_TEMPLATES', payload: false });
    }
  };

  /**
   * Create a new template
   */
  const createTemplate = async (template: {
    name: string;
    content: string;
    isDefault: boolean;
  }): Promise<Template | null> => {
    if (!state.isAuthenticated) {
      dispatch({
        type: 'SET_TEMPLATE_ERROR',
        payload: 'Authentication required. Please log in to continue.'
      });
      return null;
    }

    try {
      const newTemplate = await createTemplateApi(template);
      dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });

      if (newTemplate.isDefault) {
        dispatch({
          type: 'SET_TEMPLATES',
          payload: state.templates.map(t =>
            t._id !== newTemplate._id ? { ...t, isDefault: false } : t
          )
        });
      }

      return newTemplate;
    } catch (error) {
      dispatch({
        type: 'SET_TEMPLATE_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to create template'
      });
      return null;
    }
  };

  /**
   * Update an existing template
   */
  const updateTemplate = async (
    id: string,
    template: { name?: string; content?: string; isDefault?: boolean }
  ): Promise<Template | null> => {
    if (!state.isAuthenticated) {
      dispatch({
        type: 'SET_TEMPLATE_ERROR',
        payload: 'Authentication required. Please log in to continue.'
      });
      return null;
    }

    try {
      const updatedTemplate = await updateTemplateApi(id, template);
      dispatch({ type: 'UPDATE_TEMPLATE', payload: updatedTemplate });

      if (updatedTemplate.isDefault) {
        dispatch({
          type: 'SET_TEMPLATES',
          payload: state.templates.map(t =>
            t._id !== updatedTemplate._id ? { ...t, isDefault: false } : t
          )
        });
      }

      return updatedTemplate;
    } catch (error) {
      dispatch({
        type: 'SET_TEMPLATE_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update template'
      });
      return null;
    }
  };

  /**
   * Delete a template
   */
  const deleteTemplate = async (id: string): Promise<boolean> => {
    if (!state.isAuthenticated) {
      dispatch({
        type: 'SET_TEMPLATE_ERROR',
        payload: 'Authentication required. Please log in to continue.'
      });
      return false;
    }

    try {
      const success = await deleteTemplateApi(id);

      if (success) {
        dispatch({ type: 'REMOVE_TEMPLATE', payload: id });
      }

      return success;
    } catch (error) {
      dispatch({
        type: 'SET_TEMPLATE_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to delete template'
      });
      return false;
    }
  };

  /**
  * Sets the selected template
  */
  const setSelectedTemplate = (templateId: string | null): void => {
    dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: templateId });
  };

  /**
   * Resets the application state
   */
  const reset = (): void => {
    dispatch({ type: 'RESET' });
  };

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>;
  }

  const contextValue: AppContextType = {
    state,
    validateUrl,
    generateReferral,
    clearCacheAndRetry,
    login,
    logout,
    handleAuthCallback,
    storeGeminiApiKey,
    deleteGeminiApiKey,
    clearCache,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setSelectedTemplate,
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