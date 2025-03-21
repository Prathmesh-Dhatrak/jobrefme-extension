import { StateCreator } from 'zustand';
import axios from 'axios';
import { StoreState } from './index';
import { UserState } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the Auth slice of the store
export interface AuthSlice {
  // State
  isAuthenticated: boolean;
  authToken: string | null;
  tokenExpiry: number | null;
  isAuthLoading: boolean;
  
  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleAuthCallback: (token: string) => Promise<boolean>;
  checkAuthStatus: () => boolean;
  getAuthToken: () => string | null;
}

// Create the auth slice
export const createAuthSlice: StateCreator<
  StoreState,
  [],
  [],
  AuthSlice
> = (set, get, _store) => ({
  // Initial state
  isAuthenticated: false,
  authToken: null,
  tokenExpiry: null,
  isAuthLoading: false,
  
  // Helper to check if current auth is valid
  checkAuthStatus: () => {
    const { authToken, tokenExpiry } = get();
    return Boolean(authToken && tokenExpiry && Date.now() < tokenExpiry);
  },
  
  // Get the current auth token
  getAuthToken: () => {
    const { authToken, tokenExpiry } = get();
    if (!authToken || !tokenExpiry || Date.now() >= tokenExpiry) {
      return null;
    }
    return authToken;
  },
  
  // Login action - starts the OAuth flow
  login: async () => {
    try {
      set({ isAuthLoading: true });
      
      const callbackUrl = chrome.runtime.getURL('auth-callback.html');
      const authUrl = `${API_BASE_URL}/auth/google?redirect=${encodeURIComponent(callbackUrl)}`;
      
      await chrome.tabs.create({ url: authUrl });
    } catch (error) {
      console.error('Error initiating login:', error);
      set({ 
        isAuthLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start authentication' 
      });
      throw new Error('Failed to start authentication');
    }
  },
  
  // Handle the OAuth callback
  handleAuthCallback: async (token: string) => {
    try {
      set({ isAuthLoading: true });
      
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      
      // Store the token and expiry
      set({
        authToken: token,
        tokenExpiry: expiresAt,
        isAuthenticated: true
      });
      
      // Fetch the user profile
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const userData = response.data?.data || response.data?.user || response.data;
      
      if (userData) {
        const userProfile: UserState = {
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: userData.profilePicture || userData.profilePhoto,
          hasGeminiApiKey: userData.hasApiKey || userData.hasGeminiApiKey
        };
        
        // Update user state in the store
        set({ 
          user: userProfile,
          hasGeminiApiKey: userProfile.hasGeminiApiKey 
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error handling auth callback:', error);
      // Reset auth state on error
      set({
        authToken: null,
        tokenExpiry: null,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
      return false;
    } finally {
      set({ isAuthLoading: false });
    }
  },
  
  // Logout action
  logout: async () => {
    try {
      // Clear authentication state
      set({
        authToken: null,
        tokenExpiry: null,
        isAuthenticated: false,
        user: null
      });
      
      // Additional cleanup if needed
      await chrome.storage.local.remove(['authToken', 'tokenExpiry', 'user']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
});