import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthToken {
  token: string;
  expiresAt: number;
}

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  hasGeminiApiKey: boolean;
  lastLogin?: string;
  createdAt?: string;
}

class AuthService {
  private authToken: AuthToken | null = null;
  private userProfile: UserProfile | null = null;

  constructor() {
    this.loadAuthFromStorage();
  }

  /**
   * Initialize the auth service and load any stored auth data
   */
  private async loadAuthFromStorage(): Promise<void> {
    try {
      const storedAuth = await chrome.storage.local.get(['authToken', 'tokenExpiry']);
      if (storedAuth.authToken && storedAuth.tokenExpiry) {
        this.authToken = {
          token: storedAuth.authToken,
          expiresAt: storedAuth.tokenExpiry
        };

        if (this.isAuthenticated()) {
          await this.fetchUserProfile();
        }
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
    }
  }

  /**
   * Get the stored authentication token
   */
  getToken(): string | null {
    if (!this.authToken || Date.now() >= this.authToken.expiresAt) {
      return null;
    }
    return this.authToken.token;
  }

  /**
   * Check if the user is authenticated with a valid token
   */
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  /**
   * Get user profile if authenticated
   */
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  /**
   * Fetch and store user profile
   */
  async fetchUserProfile(): Promise<UserProfile | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      });

      console.log('Profile response:', response);

      const userData = response.data?.data || response.data?.user || response.data;
      
      if (userData) {
        this.userProfile = {
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: userData.profilePicture || userData.profilePhoto,
          hasGeminiApiKey: userData.hasApiKey || userData.hasGeminiApiKey,
          lastLogin: userData.lastLogin,
          createdAt: userData.createdAt
        };
        return this.userProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.logout();
      }
      return null;
    }
  }

  /**
   * Handle the auth callback from Google OAuth
   */
  async handleAuthCallback(token: string): Promise<boolean> {
    try {
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      
      this.authToken = { token, expiresAt };
      
      await chrome.storage.local.set({
        authToken: token,
        tokenExpiry: expiresAt
      });
      
      let maxRetries = 3;
      let retryCount = 0;
      let profile = null;
      
      while (retryCount < maxRetries) {
        try {
          profile = await this.fetchUserProfile();
          if (profile) break;
        } catch (error) {
          console.error(`Profile fetch attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          }
        }
      }
      
      await chrome.storage.local.set({ authStateChanged: Date.now() });
      
      return Boolean(profile);
    } catch (error) {
      console.error('Error handling auth callback:', error);
      return false;
    }
  }

  /**
   * Log out the user and clear auth data
   */
  async logout(): Promise<void> {
    this.authToken = null;
    this.userProfile = null;
    await chrome.storage.local.remove(['authToken', 'tokenExpiry']);
    await chrome.storage.local.set({ authStateChanged: Date.now() });
  }

  /**
   * Start the Google OAuth flow
   */
  async login(): Promise<void> {
    try {
      const callbackUrl = chrome.runtime.getURL('auth-callback.html');
      
      const authUrl = `${API_BASE_URL}/auth/google?redirect=${encodeURIComponent(callbackUrl)}`;
      await chrome.tabs.create({ url: authUrl });
    } catch (error) {
      console.error('Error initiating login:', error);
      throw new Error('Failed to start authentication');
    }
  }

  /**
   * Check if the user has a stored Gemini API key
   */
  async hasGeminiApiKey(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const { data } = await axios.get(`${API_BASE_URL}/user/gemini-key/verify`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      });
      
      return data.success && data.hasKey;
    } catch (error) {
      console.error('Error checking API key:', error);
      return false;
    }
  }

  /**
   * Store a Gemini API key on the server
   */
  async storeGeminiApiKey(apiKey: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/user/gemini-key`,
        { apiKey: apiKey },
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        }
      );
      
      if (data.success) {
        if (this.userProfile) {
          this.userProfile.hasGeminiApiKey = true;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error storing API key:', error);
      throw new Error('Failed to store API key');
    }
  }

  /**
   * Delete the stored Gemini API key from the server
   */
  async deleteGeminiApiKey(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/user/gemini-key`, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      });
      
      if (data.success) {
        if (this.userProfile) {
          this.userProfile.hasGeminiApiKey = false;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw new Error('Failed to delete API key');
    }
  }
}

const authService = new AuthService();
export default authService;