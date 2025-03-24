import { useStore } from '../store';

export const useAuth = () => {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const isAuthLoading = useStore(state => state.isAuthLoading);
  const login = useStore(state => state.login);
  const logout = useStore(state => state.logout);
  const handleAuthCallback = useStore(state => state.handleAuthCallback);
  
  return { isAuthenticated, isAuthLoading, login, logout, handleAuthCallback };
};

export const useUser = () => {
  const user = useStore(state => state.user);
  const hasGeminiApiKey = useStore(state => state.hasGeminiApiKey);
  const storeGeminiApiKey = useStore(state => state.storeGeminiApiKey);
  const deleteGeminiApiKey = useStore(state => state.deleteGeminiApiKey);
  const fetchUserProfile = useStore(state => state.fetchUserProfile);
  
  return { user, hasGeminiApiKey, storeGeminiApiKey, deleteGeminiApiKey, fetchUserProfile };
};

export const useJobProcessing = () => {
  const isHireJobsUrl = useStore(state => state.isHireJobsUrl);
  const currentUrl = useStore(state => state.currentUrl);
  const status = useStore(state => state.status);
  const referralMessage = useStore(state => state.referralMessage);
  const jobTitle = useStore(state => state.jobTitle);
  const companyName = useStore(state => state.companyName);
  const errorJobUrl = useStore(state => state.errorJobUrl);
  const selectedJobContent = useStore(state => state.selectedJobContent);
  
  const validateUrl = useStore(state => state.validateUrl);
  const generateReferral = useStore(state => state.generateReferral);
  const generateReferralFromContent = useStore(state => state.generateReferralFromContent);
  const clearCacheAndRetry = useStore(state => state.clearCacheAndRetry);
  const clearCacheAndRetryForContent = useStore(state => state.clearCacheAndRetryForContent);
  const clearCacheForContent = useStore(state => state.clearCacheForContent);
  const checkForSelectedContent = useStore(state => state.checkForSelectedContent);
  const clearSelectedContent = useStore(state => state.clearSelectedContent);
  const resetJobState = useStore(state => state.resetJobState);
  
  return {
    isHireJobsUrl,
    currentUrl,
    status,
    referralMessage,
    jobTitle,
    companyName,
    errorJobUrl,
    selectedJobContent,
    validateUrl,
    generateReferral,
    generateReferralFromContent,
    clearCacheAndRetry,
    clearCacheAndRetryForContent,
    clearCacheForContent,
    checkForSelectedContent,
    clearSelectedContent,
    resetJobState
  };
};

export const useTemplates = () => {
  const templates = useStore(state => state.templates);
  const isLoadingTemplates = useStore(state => state.isLoadingTemplates);
  const templateError = useStore(state => state.templateError);
  const selectedTemplateId = useStore(state => state.selectedTemplateId);
  
  const fetchTemplates = useStore(state => state.fetchTemplates);
  const createTemplate = useStore(state => state.createTemplate);
  const updateTemplate = useStore(state => state.updateTemplate);
  const deleteTemplate = useStore(state => state.deleteTemplate);
  const setSelectedTemplate = useStore(state => state.setSelectedTemplate);
  
  return {
    templates,
    isLoadingTemplates,
    templateError,
    selectedTemplateId,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setSelectedTemplate
  };
};

export const useUI = () => {
  const error = useStore(state => state.error);
  const successMessage = useStore(state => state.successMessage);
  
  const setError = useStore(state => state.setError);
  const setSuccessMessage = useStore(state => state.setSuccessMessage);
  const clearMessages = useStore(state => state.clearMessages);
  const showTemporaryMessage = useStore(state => state.showTemporaryMessage);
  const showTemporaryError = useStore(state => state.showTemporaryError);
  
  return {
    error,
    successMessage,
    setError,
    setSuccessMessage,
    clearMessages,
    showTemporaryMessage,
    showTemporaryError
  };
};

export const useCache = () => {
  const clearCache = useStore(state => state.clearCache);
  return { clearCache };
};