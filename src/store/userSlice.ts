import { StateCreator } from 'zustand';
import axios from 'axios';
import { StoreState } from './index';
import { UserState } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the User slice of the store
export interface UserSlice {
  // State
  user: UserState | null;
  hasGeminiApiKey: boolean;
  
  // Actions
  fetchUserProfile: () => Promise<UserState | null>;
  storeGeminiApiKey: (apiKey: string) => Promise<boolean>;
  deleteGeminiApiKey: () => Promise<boolean>;
}

// Create the user slice
export const createUserSlice: StateCreator<
  StoreState,
  [],
  [],
  UserSlice
> = (set, get, _store) => ({
  // Initial state
  user: null,
  hasGeminiApiKey: false,
  
  // Fetch the user profile
  fetchUserProfile: async () => {
    const { getAuthToken } = get();
    const token = getAuthToken();
    
    if (!token) {
      set({ error: 'No authentication token available' });
      return null;
    }
    
    try {
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
        
        return userProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Handle unauthorized - token might be expired
        get().logout();
      }
      
      set({ error: error instanceof Error ? error.message : 'Failed to fetch user profile' });
      return null;
    }
  },
  
  // Store the Gemini API key
  storeGeminiApiKey: async (apiKey: string) => {
    const { getAuthToken, user } = get();
    const token = getAuthToken();
    
    if (!token) {
      set({ error: 'Authentication required' });
      throw new Error('Authentication required');
    }
    
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/user/gemini-key`,
        { apiKey },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (data.success) {
        // Update user state with API key status
        if (user) {
          set({
            user: { ...user, hasGeminiApiKey: true },
            hasGeminiApiKey: true
          });
        } else {
          set({ hasGeminiApiKey: true });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error storing API key:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to store API key' });
      throw new Error('Failed to store API key');
    }
  },
  
  // Delete the Gemini API key
  deleteGeminiApiKey: async () => {
    const { getAuthToken, user } = get();
    const token = getAuthToken();
    
    if (!token) {
      set({ error: 'Authentication required' });
      throw new Error('Authentication required');
    }
    
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/user/gemini-key`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        // Update user state to reflect API key deletion
        if (user) {
          set({
            user: { ...user, hasGeminiApiKey: false },
            hasGeminiApiKey: false
          });
        } else {
          set({ hasGeminiApiKey: false });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting API key:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete API key' });
      throw new Error('Failed to delete API key');
    }
  }
});