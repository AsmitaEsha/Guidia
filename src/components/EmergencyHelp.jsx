import React, { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { Phone, MessageCircle, Shield, AlertTriangle, HeartHandshake } from 'lucide-react';

const EMERGENCY_CONTACTS = [
  { name:'Son (Dhaka)', relation:'Guardian', phone:'019XXXXXX88', avatar:'', available:true },
  { name:'Rupa (Daughter)', relation:'Family', phone:'018XXXXXX33', avatar:'', available:true },
  { name:'Dr. Ahmed', relation:'Doctor', phone:'017XXXXXX91', avatar:'', available:false },
];

export default function EmergencyHelp() {
  const { t, speak, showToast, setActiveTab } = useApp();
  const [calling, setCalling] = useState(null);
  const [sosActive, setSosActive] = useState(false);

  const handleCall = (contact) => {
    setCalling(contact.name);
    speak(t(`Calling ${contact.name} now. Please wait.`, `এখন ${contact.name} কে কল করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।`));
    setTimeout(() => {
      setCalling(null);
      showToast(t(`${contact.name} answered. You are safe!`, `${contact.name} ধরেছেন। আপনি নিরাপদ!`), 'success');
    }, 3000);
  };

  const handleSOS = () => {
    setSosActive(true);
    speak(t('SOS activated! Notifying all your guardians immediately.', 'SOS সক্রিয়! আপনার সব গার্ডিয়ানকে এখনই জানানো হচ্ছে।'));
    setTimeout(() => {
      setSosActive(false);
      showToast(t(' All guardians notified! Help is on the way.', ' সব গার্ডিয়ানকে জানানো হয়েছে! সাহায্য আসছে।'), 'success');
    }, 3000);
  };

  return (
    <div>
      <div className="section-header">
        <div className="flex items-center gap-16">
          <div className="icon-wrap iw-md ic-danger"><AlertTriangle size={26}/></div>
          <div>
            <h1 className="t-title anim-up">{t('Emergency Help','জরুরি সাহায্য')}</h1>
            <p className="t-sub anim-up d1" style={{ marginTop:4 }}>{t('You are not alone. Help is one tap away.','আপনি একা নন। এক চাপেই সাহায্য পাবেন।')}</p>
          </div>
        </div>
        <div className="section-divider"/>
      </div>

      {/* Reassurance */}
      <div className="card anim-up" style={{ background:'linear-gradient(135deg,var(--sage-light),var(--teal-light))', padding:24, marginBottom:24, textAlign:'center' }}>
        <HeartHandshake size={40} color="var(--sage)" style={{ margin:'0 auto 12px' }}/>
        <p style={{ fontWeight:800, fontSize:20, marginBottom:8 }}>{t('You are safe. Take a deep breath.','আপনি নিরাপদ। একটু শ্বাস নিন।')}</p>
        <p className="t-sub">{t('No rush. We\'ll solve this together, step by step.','তাড়া নেই। আমরা একসাথে ধীরে ধীরে সমাধান করবো।')}</p>
      </div>

      {/* SOS Button */}
      <div className="anim-up d1" style={{ textAlign:'center', marginBottom:28 }}>
        <button onClick={handleSOS} disabled={sosActive}
          className={sosActive ? 'anim-pulse' : ''}
          style={{ width:160, height:160, borderRadius:'50%', background: sosActive?'#cc2020':'var(--danger)', color:'#fff', fontSize:18, fontWeight:900, border:'6px solid #fff', boxShadow:'0 0 0 8px rgba(217,112,112,0.3)', cursor:'pointer', display:'inline-flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
          <span style={{ fontSize:36 }}>🆘</span>
          {sosActive ? t('Sending…','পাঠানো হচ্ছে…') : t('SOS','জরুরি')}
        </button>
        <p className="t-tiny" style={{ marginTop:12 }}>{t('Tap to notify all guardians immediately','সব গার্ডিয়ানকে তাৎক্ষণিক জানাতে চাপ দিন')}</p>
      </div>

      {/* Emergency Contacts */}
      <div className="card anim-up d2" style={{ marginBottom:24 }}>
        <h2 className="t-head" style={{ marginBottom:16 }}> {t('Emergency Contacts','জরুরি যোগাযোগ')}</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {EMERGENCY_CONTACTS.map((c, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 18px', background:'var(--surface-2)', borderRadius:'var(--r-sm)' }}>
              <div style={{ fontSize:36 }}>{c.avatar}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:800, fontSize:17 }}>{c.name}</p>
                <p className="t-tiny">{c.relation} · {c.phone}</p>
                <div className="flex items-center gap-6" style={{ marginTop:4 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: c.available?'var(--success)':'var(--text-3)' }}/>
                  <p style={{ fontSize:13, fontWeight:600, color: c.available?'var(--success)':'var(--text-3)' }}>
                    {c.available ? t('Available now','এখন উপলব্ধ') : t('May be busy','ব্যস্ত থাকতে পারেন')}
                  </p>
                </div>
              </div>
              <button onClick={() => handleCall(c)} disabled={calling === c.name} className="btn btn-sm btn-primary">
                <Phone size={18}/> {calling===c.name ? t('Calling…','কল হচ্ছে…') : t('Call','কল')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid-2 anim-up d3" style={{ gap:14 }}>
        <button className="card card-btn flex-col items-center gap-12" onClick={() => { setActiveTab('assistant'); speak(t('Opening AI assistant.','এআই অ্যাসিস্ট্যান্ট খোলা হচ্ছে।')); }} style={{ padding:24, textAlign:'center' }}>
          <div className="icon-wrap iw-md ic-blue"><MessageCircle size={28}/></div>
          <p style={{ fontWeight:800, fontSize:17 }}>{t('Ask AI Assistant','এআই অ্যাসিস্ট্যান্ট')}</p>
          <p className="t-tiny">{t('Always available, always patient','সবসময় উপলব্ধ, সবসময় ধৈর্যশীল')}</p>
        </button>
        <button className="card card-btn flex-col items-center gap-12" onClick={() => { setActiveTab('safety'); speak(t('Opening scam protection.','স্ক্যাম সুরক্ষা খোলা হচ্ছে।')); }} style={{ padding:24, textAlign:'center' }}>
          <div className="icon-wrap iw-md ic-sage"><Shield size={28}/></div>
          <p style={{ fontWeight:800, fontSize:17 }}>{t('Report a Scam','স্ক্যাম রিপোর্ট করুন')}</p>
          <p className="t-tiny">{t('Identify & report suspicious messages','সন্দেহজনক বার্তা রিপোর্ট করুন')}</p>
        </button>
      </div>
    </div>
  );
}
