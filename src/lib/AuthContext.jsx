import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Preferences } from '@capacitor/preferences';

const API_URL = import.meta.env.VITE_API_URL || 'https://inkwell-api-production-91d6.up.railway.app';
const AUDIENCE = 'https://api.inkwell.app';

const AuthContext = createContext(null);

async function saveProfileToPreferences(profile) {
  await Preferences.set({
    key: 'user_profile',
    value: JSON.stringify(profile || {}),
  });
}

export function AuthProvider({ children }) {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
    logout,
    user,
  } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [authError, setAuthError] = useState(null);

  const refreshProfile = async () => {
    if (!isAuthenticated) {
      setProfile(null);
      await saveProfileToPreferences(null);
      return null;
    }

    setIsLoadingProfile(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: AUDIENCE },
      });
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Unable to load profile (${res.status})`);
      }
      const data = await res.json();
      setProfile(data);
      await saveProfileToPreferences(data);
      setAuthError(null);
      return data;
    } catch (error) {
      setAuthError(error);
      return null;
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      refreshProfile();
      return;
    }

    if (!isLoading && !isAuthenticated) {
      setProfile(null);
      saveProfileToPreferences(null);
    }
  }, [isAuthenticated, isLoading]);

  const value = useMemo(() => ({
    authError,
    currentUser: user,
    isAuthenticated,
    isLoadingAuth: isLoading,
    isLoadingPublicSettings: isLoadingProfile,
    logout,
    navigateToLogin: () => loginWithRedirect({
      authorizationParams: {
        audience: AUDIENCE,
        redirect_uri: window.Capacitor?.isNativePlatform?.()
          ? `${import.meta.env.VITE_AUTH0_CALLBACK_SCHEME}://callback`
          : window.location.origin,
      },
    }),
    profile,
    refreshProfile,
    markOnboardingComplete: async (updates = {}) => {
      const nextProfile = {
        ...(profile || {}),
        ...updates,
        onboarding_completed: true,
        mobile_onboarding_complete: true,
      };
      setProfile(nextProfile);
      await saveProfileToPreferences(nextProfile);
      return nextProfile;
    },
    setProfile,
  }), [authError, isAuthenticated, isLoading, isLoadingProfile, loginWithRedirect, logout, profile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
