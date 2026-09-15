import React, { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { Settings, Globe, Volume2, ZoomIn, Moon, Bell, Shield, ChevronRight, LogOut, User } from 'lucide-react';

function Toggle({ on, onToggle }) {
  return (
    <div className={`toggle ${on?'on':''}`} onClick={onToggle}>
      <div className="toggle-knob"/>
    </div>
  );
}

export default function SettingsPage() {
  const { language, setLanguage, mode, user, speak, t, setScreen,
          fontSize, setFontSize, darkMode, setDarkMode,
          voiceEnabled, setVoiceEnabled, reducedMotion, setReducedMotion } = useApp();
  const [notifications, setNotifications] = useState(true);

  const Section = ({ title, children, style={} }) => (
    <div style={{ marginBottom:24, ...style }}>
      <p style={{ fontWeight:800, fontSize:15, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:1, marginBottom:10, paddingLeft:4 }}>{title}</p>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ icon, label, sub, right, onClick, divider=true }) => (
    <div onClick={onClick} className="flex items-center gap-14" style={{ padding:'16px 20px', borderBottom: divider?'1px solid var(--border)':'none', cursor: onClick?'pointer':'default' }}>
      <div className="icon-wrap iw-sm ic-blue" style={{ borderRadius:10 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <p style={{ fontWeight:700, fontSize:17 }}>{label}</p>
        {sub && <p className="t-tiny" style={{ marginTop:2 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <h1 className="t-title anim-up">{t('Settings & Accessibility','সেটিংস ও অ্যাক্সেসিবিলিটি')}</h1>
        <p className="t-sub anim-up d1" style={{ marginTop:8 }}>{t('Customize your Guideia experience.','আপনার Guideia অভিজ্ঞতা কাস্টমাইজ করুন।')}</p>
        <div className="section-divider"/>
      </div>

      <div>
        {/* Profile */}
        <div className="card anim-up d1" style={{ marginBottom:28, background:'linear-gradient(135deg,var(--blue-light),var(--teal-light))', display:'flex', alignItems:'center', gap:20, padding:24 }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <User size={28} color="#fff"/>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:800, fontSize:22 }}>{user?.name || t('User','ব্যবহারকারী','उपयोगकर्ता')}</p>
            <p className="t-sub">{user?.phone || '+880 17XX XXXX XX'}</p>
            <div className="flex items-center gap-8" style={{ marginTop:6 }}>
              <span className="badge badge-blue">{mode === 'scared' ? t('Nervous Mode','ভীত মোড','घबराया हुआ') : mode === 'unsure' ? t('Unsure Mode','অনিশ্চিত মোড','अनिश्चित') : t('Calm Mode','শান্ত মোড','शांत')}</span>
              <span className="badge badge-sage">{t('Guardian Connected','গার্ডিয়ান সংযুক্ত','गार्जियन जुड़ा हुआ')}</span>
            </div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))', gap:24, marginBottom:24 }}>

        {/* Language */}
        <Section title={t('Language','ভাষা','भाषा')}>
          <Row icon={<Globe size={18}/>} label={t('App Language','অ্যাপের ভাষা','ऐप की भाषा')}
            sub={language==='bn'?'বাংলা':language==='hi'?'हिन्दी':'English'} divider={false}
            right={
              <div className="segment" style={{ padding:3 }}>
                <button className={`seg-btn ${language==='en'?'active':''}`} onClick={() => { setLanguage('en'); speak('Switched to English'); }}>EN</button>
                <button className={`seg-btn ${language==='bn'?'active':''}`} onClick={() => { setLanguage('bn'); speak('বাংলায় পরিবর্তন হয়েছে'); }}>বাং</button>
                <button className={`seg-btn ${language==='hi'?'active':''}`} onClick={() => { setLanguage('hi'); speak('हिन्दी में बदल गया'); }}>हि</button>
              </div>
            }
          />
        </Section>

        {/* Accessibility */}
        <Section title={t('Accessibility','অ্যাক্সেসিবিলিটি')}>
          <Row icon={<Volume2 size={18}/>} label={t('Voice Narration','ভয়েস বর্ণনা')} sub={t('Read content aloud','বিষয়বস্তু জোরে পড়ুন')}
            right={<Toggle on={voiceEnabled} onToggle={() => setVoiceEnabled(v => !v)} />} />
          <Row icon={<ZoomIn size={18}/>} label={t('Text Size','টেক্সট আকার')} sub={`${fontSize}px — ${fontSize<=16?t('Small','ছোট'):fontSize>=22?t('Large','বড়'):t('Medium','মাঝারি')}`}
            right={
              <div className="flex items-center gap-10">
                <button className="btn btn-sm btn-ghost" style={{ padding:'8px 14px' }} onClick={() => setFontSize(f => Math.max(14,f-2))}>A−</button>
                <button className="btn btn-sm btn-primary" style={{ padding:'8px 14px' }} onClick={() => setFontSize(f => Math.min(26,f+2))}>A+</button>
              </div>
            } />
          <Row icon={<Moon size={18}/>} label={t('Dark / High Contrast','ডার্ক / হাই কন্ট্রাস্ট')} sub={t('Easier on the eyes','চোখে আরামদায়ক')}
            right={<Toggle on={darkMode} onToggle={() => setDarkMode(d=>!d)} />} />
          <Row icon={<Settings size={18}/>} label={t('Reduced Motion','কম অ্যানিমেশন')} sub={t('Fewer animations','কম অ্যানিমেশন')} divider={false}
            right={<Toggle on={reducedMotion} onToggle={() => setReducedMotion(r=>!r)} />} />
        </Section>

        {/* Notifications */}
        <Section title={t('Notifications','নোটিফিকেশন')}>
          <Row icon={<Bell size={18}/>} label={t('Push Notifications','পুশ নোটিফিকেশন')} sub={t('Alerts & reminders','সতর্কতা ও অনুস্মারক')} divider={false}
            right={<Toggle on={notifications} onToggle={() => setNotifications(n=>!n)} />} />
        </Section>

        {/* Guardian */}
        <Section title={t('Family Guardian','পারিবারিক গার্ডিয়ান')}>
          <Row icon={<Shield size={18}/>} label={t('Guardian: Son (Dhaka)','গার্ডিয়ান: পুত্র (ঢাকা)','गार्जियन: बेटा (ढाका)')} sub={t('Online — approves transactions','অনলাইন — লেনদেন অনুমোদন করেন','ऑनलाइन — लेनदेन अनुमोदन')}
            right={<ChevronRight size={18} color="var(--text-3)"/>} divider={false} />
        </Section>

        {/* Sign Out */}
        </div>
        <button className="btn btn-ghost btn-full" style={{ color:'var(--danger)', border:'1px solid var(--danger-light)', marginTop:8 }} onClick={() => setScreen('auth')}>
          <LogOut size={20}/> {t('Sign Out','সাইন আউট')}
        </button>
      </div>
    </div>
  );
}
