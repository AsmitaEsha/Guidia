import React from 'react';
import { AppProvider, useApp } from './context/AppStateContext';
import { Sidebar, TopBar, BottomNav } from './components/Navigation';
import SplashScreen        from './components/SplashScreen';
import Onboarding          from './components/Onboarding';
import Home                from './components/Home';
import Learn               from './components/Learn';
import Practice            from './components/Practice';
import Assistant           from './components/Assistant';
import Safety              from './components/Safety';
import MemoryBook          from './components/MemoryBook';
import SettingsPage        from './components/SettingsPage';
import Notifications       from './components/Notifications';
import ScreenshotAnalyzer  from './components/ScreenshotAnalyzer';
import UIExplainer         from './components/UIExplainer';
import GuardianDashboard   from './components/GuardianDashboard';
import ProgressDashboard   from './components/ProgressDashboard';
import EmergencyHelp       from './components/EmergencyHelp';
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
};

const MODE_STYLES = {
  calm:   { fontSize:'17px', '--anim-speed':'1s', '--spacing-ratio':1 },
  unsure: { fontSize:'18px', '--anim-speed':'1.5s', '--spacing-ratio':1.2 },
  scared: { fontSize:'20px', '--anim-speed':'2s', '--spacing-ratio':1.5 },
};

function AppLayout() {
  const { screen, activeTab, mode } = useApp();
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.calm;

  // ── Splash ────────────────────────────────────────────────────────
  if (screen === 'splash') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#4a8ec2,#6ba8a0)', display:'flex', flexDirection:'column' }}>
      <Toast/>
      <SplashScreen/>
    </div>
  );

  // ── Language + Emotional mode (no phone/OTP) ───────────────────────
  if (screen === 'onboard') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#eef4f9,#e8f4f0)', display:'flex', flexDirection:'column', ...modeStyle }} data-mode={mode}>
      <Toast/>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'24px 36px' }}>
        <img src="/logo.svg" alt="Guideia" style={{ width:42, height:42, borderRadius:10 }}/>
        <span style={{ fontWeight:800, fontSize:22 }}>Guideia</span>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px 16px 48px' }}>
        <div className="auth-card" style={{ maxWidth:520 }}>
          <Onboarding/>
        </div>
      </div>
    </div>
  );

  // ── Main app ──────────────────────────────────────────────────────
  const page = PAGES[activeTab] || PAGES.home;
  return (
    <div className="app-layout" data-mode={mode} style={modeStyle}>
      <Toast/>
      <Sidebar/>
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

export default function App() {
  return (
    <AppProvider>
      <AppLayout/>
    </AppProvider>
  );
}
