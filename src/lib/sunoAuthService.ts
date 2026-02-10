/**
 * Suno Authentication Service
 * Handles Google OAuth login and Suno.com session management
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface SunoAuthStatus {
  authenticated: boolean;
  user?: {
    name: string;
    email: string;
  };
}

export interface SunoSessionStatus {
  loggedIn: boolean;
  message?: string;
}

export interface SunoPersona {
  name: string;
  value: string;
}

export interface CreateSongRequest {
  lyrics?: string;
  stylePrompt?: string;
  genres?: string[];
  persona?: string;
  weirdness?: number;
  style?: number;
  audioQuality?: number;
  songTitle?: string;
}

export class SunoAuthService {
  /**
   * Initiate Google OAuth login
   */
  static loginWithGoogle(): void {
    window.location.href = `${BACKEND_URL}/auth/google`;
  }

  /**
   * Check authentication status
   */
  static async getAuthStatus(): Promise<SunoAuthStatus> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/status`, {
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to get auth status:', error);
      return { authenticated: false };
    }
  }

  /**
   * Logout from Google OAuth
   */
  static async logout(): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }

  /**
   * Login to Suno.com using the authenticated Google account
   */
  static async loginToSuno(): Promise<SunoSessionStatus> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/suno/login`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login to Suno');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to login to Suno:', error);
      throw error;
    }
  }

  /**
   * Create a song on Suno.com
   */
  static async createSong(request: CreateSongRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/suno/create-song`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create song on Suno');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to create song on Suno:', error);
      throw error;
    }
  }

  /**
   * Get available personas from Suno
   */
  static async getPersonas(): Promise<SunoPersona[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/suno/personas`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch personas');
      }
      
      const data = await response.json();
      return data.personas || [];
    } catch (error) {
      console.error('Failed to fetch personas:', error);
      throw error;
    }
  }

  /**
   * Logout from Suno.com
   */
  static async logoutFromSuno(): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/api/suno/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to logout from Suno:', error);
      throw error;
    }
  }

  /**
   * Check if backend is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}
