import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { ToastProvider } from './context/ToastContext';
import { VoiceProvider } from './context/VoiceContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute, { FullPageSpinner } from './components/ProtectedRoute';
import AppShell from './components/shell/AppShell';
import AppErrorBoundary from './components/AppErrorBoundary';
import { PageSkeleton } from './components/PageSkeleton';

const Landing = lazy(() => import('./pages/Landing'));
const Showcase = lazy(() => import('./pages/Showcase'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const OnboardingPage = lazy(() => import('./pages/app/OnboardingPage'));
const HomePage = lazy(() => import('./pages/app/HomePage'));
const AskPage = lazy(() => import('./pages/app/AskPage'));
const SafetyPage = lazy(() => import('./pages/app/SafetyPage'));
const MemoryPage = lazy(() => import('./pages/app/MemoryPage'));
const ProgressPage = lazy(() => import('./pages/app/ProgressPage'));
const PeoplePage = lazy(() => import('./pages/app/PeoplePage'));
const HelpPage = lazy(() => import('./pages/app/HelpPage'));
const NotificationsPage = lazy(() => import('./pages/app/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/app/SettingsPage'));
const ScreenUploadPage = lazy(() => import('./pages/app/ScreenPage').then((m) => ({ default: m.ScreenUploadPage })));
const ScreenResultPage = lazy(() => import('./pages/app/ScreenPage').then((m) => ({ default: m.ScreenResultPage })));
const LearnPage = lazy(() => import('./pages/app/LearnPage').then((m) => ({ default: m.LearnPage })));
const LessonPage = lazy(() => import('./pages/app/LearnPage').then((m) => ({ default: m.LessonPage })));
const PracticeHomePage = lazy(() => import('./pages/app/PracticePage').then((m) => ({ default: m.PracticeHomePage })));
const PracticeAppPage = lazy(() => import('./pages/app/PracticePage').then((m) => ({ default: m.PracticeAppPage })));

function RootRedirect() {
  const { status, user } = useAuth();
  if (status === 'loading') return <FullPageSpinner />;
  if (status !== 'authenticated') return <Navigate to="/landing" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to={user?.preference?.onboardingDone ? '/app/home' : '/onboarding'} replace />;
}

// V1 extension links → V2 screen viewer.
function LegacyScreenshotRedirect() {
  const { analysisId } = useParams();
  return <Navigate to={`/app/screen/${analysisId}`} replace />;
}

const APP_ROUTES = [
  ['home', HomePage, 'home'], ['ask', AskPage, 'chat'], ['screen', ScreenUploadPage, 'panel'], ['screen/:id', ScreenResultPage, 'panel'],
  ['learn', LearnPage, 'cards'], ['learn/:slug', LessonPage, 'panel'], ['practice', PracticeHomePage, 'cards'], ['practice/:slug', PracticeAppPage, 'panel'],
  ['safety', SafetyPage, 'panel'], ['memory', MemoryPage, 'cards'], ['progress', ProgressPage, 'cards'], ['people', PeoplePage, 'list'],
  ['help', HelpPage, 'panel'], ['notifications', NotificationsPage, 'list'], ['settings', SettingsPage, 'list'],
];

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <AuthProvider>
          <PreferencesProvider>
            <ToastProvider>
              <VoiceProvider>
                <NotificationProvider>
                  <AppErrorBoundary>
                    <Suspense fallback={<FullPageSpinner />}>
                      <Routes>
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/landing" element={<Landing />} />
                        <Route path="/showcase" element={<Showcase />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><OnboardingPage /></ProtectedRoute>} />
                        <Route path="/screenshot-explain/:analysisId" element={<LegacyScreenshotRedirect />} />
                        <Route path="/admin" element={<ProtectedRoute role="ADMIN" requireOnboarding={false}><AdminDashboard /></ProtectedRoute>} />

                        <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                          <Route index element={<Navigate to="home" replace />} />
                          {APP_ROUTES.map(([path, Page, skeleton]) => (
                            <Route key={path} path={path} element={<Suspense fallback={<PageSkeleton kind={skeleton} />}><Page /></Suspense>} />
                          ))}
                          {/* V1 paths */}
                          <Route path="assistant" element={<Navigate to="/app/ask" replace />} />
                          <Route path="guardian" element={<Navigate to="/app/people" replace />} />
                          <Route path="emergency" element={<Navigate to="/app/help" replace />} />
                          <Route path="*" element={<Suspense fallback={null}><NotFoundPage inShell /></Suspense>} />
                        </Route>

                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </AppErrorBoundary>
                </NotificationProvider>
              </VoiceProvider>
            </ToastProvider>
          </PreferencesProvider>
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}
