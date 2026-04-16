import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import NewEntry from './pages/NewEntry';
import Entries from './pages/Entries';
import EntryDetail from './pages/EntryDetail';
import Settings from './pages/Settings';
import Progress from './pages/Progress';
import OnboardingGate from './components/OnboardingGate';
import FreeWrite from './pages/FreeWrite';
import JournalView from './pages/JournalView';
import NewPage from './pages/NewPage';
import PageDetail from './pages/PageDetail';
import NewJournal from './pages/NewJournal';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, isAuthenticated, authError, navigateToLogin } = useAuth();

  // Show loading spinner while auth is resolving
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated — redirect to Auth0 login
  if (!isAuthenticated) {
    navigateToLogin();
    return null;
  }

  // Handle auth errors
  if (authError) {
    return <UserNotRegisteredError />;
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<OnboardingGate />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewEntry />} />
          <Route path="/entries" element={<Entries />} />
          <Route path="/entries/:id" element={<EntryDetail />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/journals/new" element={<NewJournal />} />
          <Route path="/journals/:id" element={<JournalView />} />
          <Route path="/journals/:journalId/new" element={<NewPage />} />
          <Route path="/pages/:id" element={<PageDetail />} />
          <Route path="/write/free" element={<FreeWrite />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


const isNative = () => window.Capacitor?.isNativePlatform();

function App() {
  const redirectUri = isNative()
    ? `${import.meta.env.VITE_AUTH0_CALLBACK_SCHEME}://callback`
    : window.location.origin;

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: redirectUri, audience: 'https://api.inkwell.app' }}
    >
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </Auth0Provider>
  );
}

export default App