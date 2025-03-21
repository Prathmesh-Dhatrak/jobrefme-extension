import { StateCreator } from 'zustand';
import { StoreState } from './index';

export interface UISlice {
  error: string | null;
  successMessage: string | null;
  
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  clearMessages: () => void;
  showTemporaryMessage: (message: string, duration?: number) => void;
  showTemporaryError: (error: string, duration?: number) => void;
}

export const createUISlice: StateCreator<
  StoreState,
  [],
  [],
  UISlice
> = (set, _get, _store) => ({
  error: null,
  successMessage: null,
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  setSuccessMessage: (message: string | null) => {
    set({ successMessage: message });
  },
  
  clearMessages: () => {
    set({ error: null, successMessage: null });
  },
  
  showTemporaryMessage: (message: string, duration: number = 3000) => {
    set({ successMessage: message, error: null });
    
    setTimeout(() => {
      set(state => {
        if (state.successMessage === message) {
          return { successMessage: null };
        }
        return {};
      });
    }, duration);
  },
  
  showTemporaryError: (error: string, duration: number = 3000) => {
    set({ error, successMessage: null });
    
    setTimeout(() => {
      set(state => {
        if (state.error === error) {
          return { error: null };
        }
        return {};
      });
    }, duration);
  }
});