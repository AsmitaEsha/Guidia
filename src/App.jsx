import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppStateContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import ScreenshotExplain from './pages/ScreenshotExplain';
import GuidiaLogo from './components/GuidiaLogo';
import { Sidebar, TopBar, BottomNav } from './components/Navigation';
import Onboarding          from './components/Onboarding';
import Home                from './components/Home';
import Learn               from './components/Learn';
import Practice            from './components/Practice';
import Assistant           from './components/Assistant';
import Safety              from './components/Safety';
import MemoryBook          from './components/MemoryBook';
import SettingsPage        from './components/SettingsPage';
import Notifications       from './components/Notifications';
import UIExplainer         from './components/UIExplainer';
import GuardianDashboard   from './components/GuardianDashboard';
import ProgressDashboard   from './components/ProgressDashboard';
import EmergencyHelp       from './components/EmergencyHelp';
import FloatingVoiceHelp   from './components/FloatingVoiceHelp';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const icon = toast.type === 'success'
    ? <CheckCircle size={18} color="var(--success)"/>
    : toast.type === 'danger'
    ? <AlertTriangle size={18} color="var(--danger)"/>
    : <Info size={18} color="var(--blue)"/>;
  return (
    <div className="toast" style={{ borderLeftColor: toast.type==='success'?'var(--success)':toast.type==='danger'?'var(--danger)':'var(--blue)' }}>
      {icon}
      <p style={{ fontWeight:600, fontSize:15 }}>{toast.msg}</p>
    </div>
  );
}

const PAGES = {
  home:         { component:<Home/>,               fullH:false },
  learn:        { component:<Learn/>,              fullH:false },
  practice:     { component:<Practice/>,           fullH:false },
  assistant:    { component:<Assistant/>,          fullH:true  },
  safety:       { component:<Safety/>,             fullH:false },
  screenshot:   { component:<UIExplainer/>,        fullH:true  },
  memory:       { component:<MemoryBook/>,         fullH:false },
  progress:     { component:<ProgressDashboard/>,  fullH:false },
  emergency:    { component:<EmergencyHelp/>,      fullH:false },
  settings:     { component:<SettingsPage/>,       fullH:false },
  notifications:{ component:<Notifications/>,      fullH:false },
  guardian:     { component:<GuardianDashboard/>,  fullH:false },
};

const MODE_STYLES = {
  calm:   { fontSize:'17px', '--anim-speed':'1s', '--spacing-ratio':1 },
  unsure: { fontSize:'18px', '--anim-speed':'1.5s', '--spacing-ratio':1.2 },
  scared: { fontSize:'20px', '--anim-speed':'2s', '--spacing-ratio':1.5 },
};

// ── Language + Emotional mode, reached once after registration ─────────
function OnboardingPage() {
  const { mode, fontSize } = useApp();
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.calm;
  const textScale = Math.max(0.8, Math.min(1.5, fontSize / 20));
  const fontDelta = `${fontSize - 20}px`;
  return (
    <div data-theme="light" style={{ minHeight:'100vh', background:'linear-gradient(160deg,#eef4f9,#e8f4f0)', display:'flex', flexDirection:'column', color:'var(--text-1)', ...modeStyle, fontSize:`${fontSize}px`, '--font-scale': textScale, '--font-delta': fontDelta }} data-mode={mode}>
      <Toast/>
      <div className="flex items-center gap-12 anim-up" style={{ padding:'24px 36px' }}>
        <GuidiaLogo size={42}/>
        <span style={{ fontWeight:800, fontSize:22 }}>Guidia</span>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px 16px 48px' }}>
        <div className="auth-card anim-up d1" style={{ maxWidth:520 }}>
          <Onboarding/>
        </div>
      </div>
    </div>
  );
}

function EntryRoute() {
  const { onboardingDone } = useApp();
  return <Navigate to={onboardingDone ? '/app/home' : '/onboarding'} replace />;
}

// ── Main authenticated application shell ────────────────────────────────
function AppShell() {
  const { activeTab, mode, onboardingDone, darkMode, fontSize } = useApp();
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.calm;
  const textScale = Math.max(0.8, Math.min(1.5, fontSize / 20));
  const fontDelta = `${fontSize - 20}px`;
  const page = PAGES[activeTab] || PAGES.home;

  if (!onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="app-layout" data-mode={mode} data-theme={darkMode ? 'dark' : 'guidia-app'} style={{ color:'var(--text-1)', ...modeStyle, fontSize:`${fontSize}px`, '--font-scale': textScale, '--font-delta': fontDelta }}>
      <Toast/>
      <Sidebar/>
      <FloatingVoiceHelp/>
      <div className="main-content">
        <TopBar/>
        <div className={`page-content${page.fullH ? ' full-h' : ''}`}>
          {page.component}
        </div>
        <BottomNav/>
      </div>
    </div>
  );
}

function ScreenshotExplainShell() {
  const { mode, onboardingDone, darkMode, fontSize } = useApp();
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.calm;
  const textScale = Math.max(0.8, Math.min(1.5, fontSize / 20));
  const fontDelta = `${fontSize - 20}px`;

  if (!onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="app-layout" data-mode={mode} data-theme={darkMode ? 'dark' : 'guidia-app'} style={{ color:'var(--text-1)', ...modeStyle, fontSize:`${fontSize}px`, '--font-scale': textScale, '--font-delta': fontDelta }}>
      <Toast/>
      <Sidebar/>
      <FloatingVoiceHelp/>
      <div className="main-content">
        <TopBar/>
        <div className="page-content">
          <ScreenshotExplain/>
        </div>
        <BottomNav/>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<EntryRoute/>} />
            <Route path="/landing" element={<Landing/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/forgot-password" element={<ForgotPassword/>} />
            <Route path="/reset-password" element={<ResetPassword/>} />
            <Route path="/screenshot-explain/:analysisId" element={<ScreenshotExplainShell/>} />
            <Route path="/onboarding" element={<OnboardingPage/>} />
            <Route path="/app" element={<Navigate to="/app/home" replace/>} />
            <Route path="/app/:tab" element={<ProtectedRoute><AppShell/></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard/></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace/>} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
