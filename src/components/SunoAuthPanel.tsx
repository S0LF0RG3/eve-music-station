import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { SunoAuthService, SunoAuthStatus } from '../lib/sunoAuthService';
import { CheckCircle, Warning, SignIn, SignOut, MusicNotes } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SunoAuthPanelProps {
  onAuthChange?: (authenticated: boolean) => void;
}

export function SunoAuthPanel({ onAuthChange }: SunoAuthPanelProps) {
  const [authStatus, setAuthStatus] = useState<SunoAuthStatus>({ authenticated: false });
  const [sunoLoggedIn, setSunoLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
    checkBackendHealth();

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      toast.success('Successfully authenticated with Google!');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      checkAuthStatus();
    }
  }, []);

  // Notify parent of auth changes
  useEffect(() => {
    onAuthChange?.(authStatus.authenticated && sunoLoggedIn);
  }, [authStatus.authenticated, sunoLoggedIn, onAuthChange]);

  const checkBackendHealth = async () => {
    const healthy = await SunoAuthService.healthCheck();
    setBackendAvailable(healthy);
    if (!healthy) {
      toast.error('Backend service is not available. Please start the server.');
    }
  };

  const checkAuthStatus = async () => {
    const status = await SunoAuthService.getAuthStatus();
    setAuthStatus(status);
  };

  const handleGoogleLogin = () => {
    if (!backendAvailable) {
      toast.error('Backend service is not available');
      return;
    }
    SunoAuthService.loginWithGoogle();
  };

  const handleGoogleLogout = async () => {
    setIsLoading(true);
    try {
      await SunoAuthService.logout();
      setAuthStatus({ authenticated: false });
      setSunoLoggedIn(false);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSunoLogin = async () => {
    if (!authStatus.authenticated) {
      toast.error('Please login with Google first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await SunoAuthService.loginToSuno();
      setSunoLoggedIn(true);
      toast.success(result.message || 'Successfully logged in to Suno');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to login to Suno');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSunoLogout = async () => {
    setIsLoading(true);
    try {
      await SunoAuthService.logoutFromSuno();
      setSunoLoggedIn(false);
      toast.success('Logged out from Suno');
    } catch (error) {
      toast.error('Failed to logout from Suno');
    } finally {
      setIsLoading(false);
    }
  };

  if (!backendAvailable) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    return (
      <Card className="p-6 bg-[oklch(0.20_0.05_285)] border-[oklch(0.25_0.08_260)]">
        <div className="flex items-center gap-3 text-red-400">
          <Warning size={24} weight="fill" />
          <div className="space-y-2">
            <p className="font-semibold">Backend Service Not Available</p>
            <p className="text-sm text-gray-400">
              Cannot connect to backend at <code className="text-xs bg-black/40 px-1 py-0.5 rounded">{backendUrl}</code>
            </p>
            <p className="text-sm text-gray-400">
              Start the server: <code className="text-xs bg-black/40 px-2 py-1 rounded">cd server && npm start</code>
            </p>
            <p className="text-xs text-gray-500">
              See <a href="/server/README.md" target="_blank" className="text-accent hover:underline">server/README.md</a> for setup instructions
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-[oklch(0.20_0.05_285)] border-[oklch(0.25_0.08_260)]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MusicNotes size={24} weight="fill" className="text-[oklch(0.75_0.12_85)]" />
          <h3 className="text-lg font-semibold text-[oklch(0.95_0.02_285)]">Suno.com Integration</h3>
        </div>

        {/* Google Auth Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {authStatus.authenticated ? (
                <CheckCircle size={20} weight="fill" className="text-green-400" />
              ) : (
                <Warning size={20} weight="fill" className="text-yellow-400" />
              )}
              <span className="text-sm text-[oklch(0.95_0.02_285)]">
                {authStatus.authenticated ? `Logged in as ${authStatus.user?.name}` : 'Not authenticated'}
              </span>
            </div>
            {authStatus.authenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoogleLogout}
                disabled={isLoading}
              >
                <SignOut size={16} className="mr-1" />
                Logout
              </Button>
            ) : (
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="bg-[oklch(0.75_0.12_85)] text-[oklch(0.15_0.02_285)] hover:bg-[oklch(0.70_0.12_85)]"
              >
                <SignIn size={16} className="mr-1" />
                Login with Google
              </Button>
            )}
          </div>
        </div>

        {/* Suno Login Status */}
        {authStatus.authenticated && (
          <div className="space-y-2 pt-2 border-t border-[oklch(0.25_0.08_260)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sunoLoggedIn ? (
                  <CheckCircle size={20} weight="fill" className="text-green-400" />
                ) : (
                  <Warning size={20} weight="fill" className="text-yellow-400" />
                )}
                <span className="text-sm text-[oklch(0.95_0.02_285)]">
                  {sunoLoggedIn ? 'Connected to Suno.com' : 'Not connected to Suno.com'}
                </span>
              </div>
              {sunoLoggedIn ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSunoLogout}
                  disabled={isLoading}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  onClick={handleSunoLogin}
                  disabled={isLoading}
                  className="bg-[oklch(0.35_0.15_285)] text-[oklch(0.95_0.02_285)] hover:bg-[oklch(0.40_0.15_285)]"
                >
                  <MusicNotes size={16} className="mr-1" />
                  Connect to Suno
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Info Message */}
        {authStatus.authenticated && sunoLoggedIn && (
          <div className="pt-2 border-t border-[oklch(0.25_0.08_260)]">
            <p className="text-xs text-gray-400">
              ✓ Ready to create songs on Suno.com with your authenticated session
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
