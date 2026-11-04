import './App.css'
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PageLoadingSpinner from '@/components/PageLoadingSpinner';
import { ExternalLinkProvider } from '@/components/ucp/ExternalLinkProvider';

// Route-level code splitting — these pages load their own chunk on first visit.
const Pricing = lazy(() => import('./pages/Pricing'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const WhitePaper = lazy(() => import('./pages/WhitePaper'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Renders a route inside the layout, showing a spinner while its chunk loads so
// the nav and footer stay in place.
const RoutedPage = ({ pageName, children }) => (
  <LayoutWrapper currentPageName={pageName}>
    <Suspense fallback={<PageLoadingSpinner />}>{children}</Suspense>
  </LayoutWrapper>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <RoutedPage pageName={mainPageKey}>
          <MainPage />
        </RoutedPage>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <RoutedPage pageName={path}>
              <Page />
            </RoutedPage>
          }
        />
      ))}
      <Route path="/Pricing" element={
        <RoutedPage pageName="Pricing"><Pricing /></RoutedPage>
      } />
      <Route path="/ThankYou" element={
        <RoutedPage pageName="ThankYou"><ThankYou /></RoutedPage>
      } />
      <Route path="/PrivacyPolicy" element={
        <RoutedPage pageName="PrivacyPolicy"><PrivacyPolicy /></RoutedPage>
      } />
      <Route path="/Terms" element={
        <RoutedPage pageName="Terms"><Terms /></RoutedPage>
      } />
      <Route path="/WhitePaper" element={
        <RoutedPage pageName="WhitePaper"><WhitePaper /></RoutedPage>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ExternalLinkProvider>
            <NavigationTracker />
            <AuthenticatedApp />
          </ExternalLinkProvider>
        </Router>
        <Toaster />
        {/* Builder-only visual editing helper: no DOM observers or scroll listeners in production/TWA builds */}
        {import.meta.env.DEV && <VisualEditAgent />}
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App