import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppStateContext';

export default function SplashScreen() {
  const { setScreen } = useApp();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => setScreen('onboard'), 3100); // → language + mode, no login
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [setScreen]);

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24, minHeight:'100vh' }}>
      <div className="anim-logo" style={{ textAlign:'center' }}>
        <img src="/logo.svg" alt="Guideia" style={{ width:120, height:120, borderRadius:30, boxShadow:'0 24px 60px rgba(0,0,0,0.28)', marginBottom:24 }}/>
        <h1 style={{ color:'#fff', fontSize:44, fontWeight:800, letterSpacing:-1 }}>Guideia</h1>
      </div>
      {phase >= 1 && <p className="anim-scale" style={{ color:'rgba(255,255,255,0.85)', fontSize:18, fontWeight:600 }}>Your safe digital guide</p>}
      {phase >= 2 && (
        <div className="anim-in" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginTop:16 }}>
          <div className="spinner" style={{ borderTopColor:'#fff', borderColor:'rgba(255,255,255,0.3)' }}/>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:15 }}>Preparing your safe learning space…</p>
        </div>
      )}
    </div>
  );
}
