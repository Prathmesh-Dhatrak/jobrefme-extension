import { StateCreator } from 'zustand';
import axios from 'axios';
import { StoreState } from './index';
import { UserState } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AuthSlice {
  isAuthenticated: boolean;
  authToken: string | null;
  tokenExpiry: number | null;
  isAuthLoading: boolean;
  
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleAuthCallback: (token: string) => Promise<boolean>;
  checkAuthStatus: () => boolean;
  getAuthToken: () => string | null;
}

export const createAuthSlice: StateCreator<
  StoreState,
  [],
  [],
  AuthSlice
> = (set, get, _store) => ({
  isAuthenticated: false,
  authToken: null,
  tokenExpiry: null,
  isAuthLoading: false,
  
  checkAuthStatus: () => {
    const { authToken, tokenExpiry } = get();
    return Boolean(authToken && tokenExpiry && Date.now() < tokenExpiry);
  },
  
  getAuthToken: () => {
    const { authToken, tokenExpiry } = get();
    if (!authToken || !tokenExpiry || Date.now() >= tokenExpiry) {
      return null;
    }
    return authToken;
  },
  
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
  
  handleAuthCallback: async (token: string) => {
    try {
      set({ isAuthLoading: true });
      
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      
      set({
        authToken: token,
        tokenExpiry: expiresAt,
        isAuthenticated: true
      });
      
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
        
        set({ 
          user: userProfile,
          hasGeminiApiKey: userProfile.hasGeminiApiKey 
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error handling auth callback:', error);
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
  
  logout: async () => {
    try {
      set({
        authToken: null,
        tokenExpiry: null,
        isAuthenticated: false,
        user: null
      });
      
      await chrome.storage.local.remove(['authToken', 'tokenExpiry', 'user']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
});