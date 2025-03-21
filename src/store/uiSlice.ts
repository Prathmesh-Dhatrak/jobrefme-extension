import { StateCreator } from 'zustand';
import { StoreState } from './index';

// Define the UI slice of the store
export interface UISlice {
  // State
  error: string | null;
  successMessage: string | null;
  
  // Actions
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  clearMessages: () => void;
  showTemporaryMessage: (message: string, duration?: number) => void;
  showTemporaryError: (error: string, duration?: number) => void;
}

// Create the UI slice
export const createUISlice: StateCreator<
  StoreState,
  [],
  [],
  UISlice
> = (set, _get, _store) => ({
  // Initial state
  error: null,
  successMessage: null,
  
  // Set an error message
  setError: (error: string | null) => {
    set({ error });
  },
  
  // Set a success message
  setSuccessMessage: (message: string | null) => {
    set({ successMessage: message });
  },
  
  // Clear all messages
  clearMessages: () => {
    set({ error: null, successMessage: null });
  },
  
  // Show a temporary success message
  showTemporaryMessage: (message: string, duration: number = 3000) => {
    set({ successMessage: message, error: null });
    
    setTimeout(() => {
      set(state => {
        // Only clear if this is still the same message
        if (state.successMessage === message) {
          return { successMessage: null };
        }
        return {};
      });
    }, duration);
  },
  
  // Show a temporary error message
  showTemporaryError: (error: string, duration: number = 3000) => {
    set({ error, successMessage: null });
    
    setTimeout(() => {
      set(state => {
        // Only clear if this is still the same error
        if (state.error === error) {
          return { error: null };
        }
        return {};
      });
    }, duration);
  }
});