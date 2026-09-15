import React, { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const DEMO = [
  { role:'elderly',  label:'Elderly User',  sub:'Abdul Karim, 65 — Scared Mode',  icon:'👴', color:'#5b9bd5' },
  { role:'beginner', label:'Beginner User',  sub:'Fatema Begum, 58 — Unsure Mode', icon:'👵', color:'#6ba8a0' },
  { role:'guardian', label:'Guardian User',  sub:'Son — Guardian Dashboard',        icon:'👨', color:'#85bb9a' },
];

export default function Auth() {
  const { login } = useApp();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [loadMsg, setLoadMsg] = useState('');

  const doLogin = (role) => {
    setStep('loading');
    setLoadMsg('Checking your comfort settings…');
    setTimeout(() => setLoadMsg('Preparing your safe learning space…'), 1200);
    setTimeout(() => login(role), 2400);
  };

  if (step === 'loading') return (
    <div style={{ textAlign:'center', padding:'40px 0' }}>
      <img src="/logo.svg" alt="Guideia" style={{ width:72, height:72, borderRadius:18, margin:'0 auto 20px' }} className="anim-breathe" />
      <div className="spinner" style={{ margin:'0 auto 16px' }}/>
      <p style={{ fontWeight:600, fontSize:17, color:'var(--text-2)' }}>{loadMsg}</p>
    </div>
  );

  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <img src="/logo.svg" alt="Guideia" style={{ width:64, height:64, borderRadius:16, margin:'0 auto 16px', boxShadow:'var(--sh-md)' }} />
        <h1 className="t-title">Welcome Back</h1>
        <p className="t-sub" style={{ marginTop:6 }}>You're safe here. Sign in to continue.</p>
      </div>

      {step === 'phone' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <label style={{ fontWeight:700 }}>Phone Number</label>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ padding:'16px 14px', background:'var(--surface-2)', borderRadius:'var(--r-md)', fontWeight:700, fontSize:18, color:'var(--text-2)' }}>🇧🇩 +880</div>
              <input className="input-field" type="tel" placeholder="017X XXXX XXXX" value={phone} onChange={e=>setPhone(e.target.value)} style={{ flex:1 }}/>
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep('otp')}>
            Continue <ArrowRight size={22}/>
          </button>
          <div style={{ textAlign:'center', margin:'8px 0' }}>
            <p style={{ color:'var(--text-3)', fontSize:15, marginBottom:16 }}>— or sign in with a demo account —</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {DEMO.map(d => (
                <button key={d.role} className="card card-btn flex items-center gap-16" onClick={() => doLogin(d.role)} style={{ padding:16, borderLeft:`4px solid ${d.color}` }}>
                  <span style={{ fontSize:28 }}>{d.icon}</span>
                  <div style={{ flex:1, textAlign:'left' }}>
                    <p style={{ fontWeight:700, fontSize:16 }}>{d.label}</p>
                    <p className="t-tiny">{d.sub}</p>
                  </div>
                  <ArrowRight size={18} color="var(--text-3)"/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <div style={{ textAlign:'center' }}>
            <h2 className="t-head">Enter Your Code</h2>
            <p className="t-sub" style={{ marginTop:8 }}>Demo code: <strong>123456</strong></p>
          </div>
          <div className="otp-wrap">
            {otp.map((v,i) => (
              <input key={i} id={`otp-${i}`} className="otp-box" type="tel" maxLength={1} value={v}
                onChange={e => {
                  if (!/^\d*$/.test(e.target.value)) return;
                  const n=[...otp]; n[i]=e.target.value.slice(-1); setOtp(n);
                  if (e.target.value && i<5) document.getElementById(`otp-${i+1}`)?.focus();
                }}
              />
            ))}
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={() => { if(otp.join()==='123456') doLogin('elderly'); else setOtp(['','','','','','']); }}>
            <ShieldCheck size={22}/> Verify & Sign In
          </button>
          <button className="btn btn-ghost btn-full" onClick={() => setStep('phone')}>← Go Back</button>
        </div>
      )}
    </div>
  );
}
