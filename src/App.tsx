import React from 'react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { ColorModeProvider } from './components/ui/color-mode';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PostsPage from './pages/PostsPage';
import PostEditorPage from './pages/PostEditorPage';
import PostDetailPage from './pages/PostDetailPage';
import NetworksPage from './pages/NetworksPage';
import NetworkEditPage from './pages/NetworkEditPage';
import CalendarPage from './pages/CalendarPage';
import HelpFacebookPage from './pages/HelpFacebookPage';
import HelpTwitterPage from './pages/HelpTwitterPage';
import HelpThreadsPage from './pages/HelpThreadsPage';
import HelpMastodonPage from './pages/HelpMastodonPage';
import HelpBlueskyPage from './pages/HelpBlueskyPage';

// Komponenta pro ochranu privátních tras
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Nebo nějaký loading spinner
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Komponenta pro přesměrování přihlášených uživatelů z login stránky
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Veřejné trasy */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <ErrorBoundary>
              <LoginPage />
            </ErrorBoundary>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <ErrorBoundary>
              <LoginPage />
            </ErrorBoundary>
          </PublicRoute>
        }
      />

      {/* Help stránky - mimo MainLayout */}
      <Route
        path="/help/facebook"
        element={
          <PrivateRoute>
            <ErrorBoundary>
              <HelpFacebookPage />
            </ErrorBoundary>
          </PrivateRoute>
        }
      />
      <Route
        path="/help/twitter"
        element={
          <PrivateRoute>
            <ErrorBoundary>
              <HelpTwitterPage />
            </ErrorBoundary>
          </PrivateRoute>
        }
      />
      <Route
        path="/help/threads"
        element={
          <PrivateRoute>
            <ErrorBoundary>
              <HelpThreadsPage />
            </ErrorBoundary>
          </PrivateRoute>
        }
      />
      <Route
        path="/help/mastodon"
        element={
          <PrivateRoute>
            <ErrorBoundary>
              <HelpMastodonPage />
            </ErrorBoundary>
          </PrivateRoute>
        }
      />
      <Route
        path="/help/bluesky"
        element={
          <PrivateRoute>
            <ErrorBoundary>
              <HelpBlueskyPage />
            </ErrorBoundary>
          </PrivateRoute>
        }
      />

      {/* Chráněné trasy s MainLayout */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route
                  path="/posts/new"
                  element={
                    <ErrorBoundary>
                      <PostEditorPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/posts/edit/:id"
                  element={
                    <ErrorBoundary>
                      <PostEditorPage />
                    </ErrorBoundary>
                  }
                />
                <Route path="/posts/:id" element={<PostDetailPage />} />
                <Route
                  path="/calendar"
                  element={
                    <ErrorBoundary>
                      <CalendarPage />
                    </ErrorBoundary>
                  }
                />
                <Route path="/networks" element={<NetworksPage />} />
                <Route path="/networks/new" element={<NetworkEditPage />} />
                <Route path="/networks/edit/:networkId" element={<NetworkEditPage />} />
                {/* Přesměrování na home pro neznámé trasy */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

// Vytvoříme QueryClient mimo komponentu, aby se nevytvářel pokaždé znovu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minut
    } } });

const App: React.FC = () => {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </ColorModeProvider>
    </ChakraProvider>
  );
};

export default App;
