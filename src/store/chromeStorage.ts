import { StateCreator } from 'zustand';
import { StoreState } from './index';

// Define which state properties should be persisted to Chrome storage
const PERSISTED_KEYS = [
  'authToken', 
  'tokenExpiry', 
  'user', 
  'selectedTemplateId',
  'hasGeminiApiKey'
];

// Simplified middleware without complex typing
export const chromeStorageMiddleware = <T extends StoreState>(
  f: StateCreator<T, [], []>
): StateCreator<T> => (set, get, api) => {
  // Get the initial state
  const state = f(set, get, api as any);

  // Load persisted state from Chrome storage
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(PERSISTED_KEYS, (result) => {
      if (Object.keys(result).length > 0) {
        const stateUpdate: Partial<StoreState> = {};
        
        // Restore auth state
        if (result.authToken && result.tokenExpiry) {
          stateUpdate.authToken = result.authToken;
          stateUpdate.tokenExpiry = result.tokenExpiry;
          stateUpdate.isAuthenticated = Date.now() < result.tokenExpiry;
        }
        
        // Restore user profile
        if (result.user) {
          stateUpdate.user = result.user;
        }
        
        // Restore template selection
        if (result.selectedTemplateId) {
          stateUpdate.selectedTemplateId = result.selectedTemplateId;
        }
        
        // Restore API key status
        if (result.hasGeminiApiKey !== undefined) {
          stateUpdate.hasGeminiApiKey = result.hasGeminiApiKey;
        }
        
        // Update the store with persisted data
        if (Object.keys(stateUpdate).length > 0) {
          set(stateUpdate as any);
        }
      }
    });
    
    // Listen for storage changes from other contexts
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        const stateUpdate: Partial<StoreState> = {};
        let hasUpdate = false;
        
        // Check which persisted values have changed
        PERSISTED_KEYS.forEach(key => {
          if (changes[key]) {
            hasUpdate = true;
            (stateUpdate as any)[key] = changes[key].newValue;
            
            // Special handling for auth token changes
            if (key === 'tokenExpiry') {
              stateUpdate.isAuthenticated = changes[key].newValue 
                ? Date.now() < changes[key].newValue 
                : false;
            }
          }
        });
        
        // Apply changes to the store if anything changed
        if (hasUpdate) {
          set(stateUpdate as any);
        }
      }
    });
  }

  // Create a new setState function that syncs changes to Chrome storage
  const newSet: typeof set = (updater, replace?) => {
    // Call the original set function with proper typing for replace
    if (replace === true) {
      // For the case when replace is explicitly true
      set(updater as any, true);
    } else {
      // For the case when replace is undefined or false
      set(updater as any, false);
    }
    
    // After state update, sync relevant parts to Chrome storage
    const currentState = get();
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const storageUpdate: Record<string, any> = {};
      
      // Using type assertion to resolve property access
      const typedState = currentState as unknown as StoreState;
      
      if (typedState.authToken) storageUpdate.authToken = typedState.authToken;
      if (typedState.tokenExpiry) storageUpdate.tokenExpiry = typedState.tokenExpiry;
      if (typedState.user) storageUpdate.user = typedState.user;
      if (typedState.selectedTemplateId) storageUpdate.selectedTemplateId = typedState.selectedTemplateId;
      if (typedState.hasGeminiApiKey !== undefined) storageUpdate.hasGeminiApiKey = typedState.hasGeminiApiKey;
      
      // Only update storage if we have values to store
      if (Object.keys(storageUpdate).length > 0) {
        chrome.storage.local.set(storageUpdate);
      }
    }
  };

  // Call the original creator function with our wrapped set
  return f(newSet as any, get, api as any);
};