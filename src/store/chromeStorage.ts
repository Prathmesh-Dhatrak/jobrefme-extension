import { StateCreator } from 'zustand';
import { StoreState } from './index';

const PERSISTED_KEYS = [
  'authToken', 
  'tokenExpiry', 
  'user', 
  'selectedTemplateId',
  'hasGeminiApiKey'
];

export const chromeStorageMiddleware = <T extends StoreState>(
  f: StateCreator<T, [], []>
): StateCreator<T> => (set, get, api) => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(PERSISTED_KEYS, (result) => {
      if (Object.keys(result).length > 0) {
        const stateUpdate: Partial<StoreState> = {};
        
        if (result.authToken && result.tokenExpiry) {
          stateUpdate.authToken = result.authToken;
          stateUpdate.tokenExpiry = result.tokenExpiry;
          stateUpdate.isAuthenticated = Date.now() < result.tokenExpiry;
        }
        if (result.user) {
          stateUpdate.user = result.user;
        }
        if (result.selectedTemplateId) {
          stateUpdate.selectedTemplateId = result.selectedTemplateId;
        }
        if (result.hasGeminiApiKey !== undefined) {
          stateUpdate.hasGeminiApiKey = result.hasGeminiApiKey;
        }
        if (Object.keys(stateUpdate).length > 0) {
          set(stateUpdate as any);
        }
      }
    });
    
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        const stateUpdate: Partial<StoreState> = {};
        let hasUpdate = false;
        
        PERSISTED_KEYS.forEach(key => {
          if (changes[key]) {
            hasUpdate = true;
            (stateUpdate as any)[key] = changes[key].newValue;
            
            if (key === 'tokenExpiry') {
              stateUpdate.isAuthenticated = changes[key].newValue 
                ? Date.now() < changes[key].newValue 
                : false;
            }
          }
        });
        
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