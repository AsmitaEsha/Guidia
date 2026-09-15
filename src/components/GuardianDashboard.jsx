import React, { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { Shield, Check, X, AlertTriangle, Bell, Clock, Phone, MessageCircle, TrendingUp, Eye, DollarSign, ShieldCheck, Info, User } from 'lucide-react';

const ACTIVITY_LOG = [
  { id:'a1', time:'5 min ago',    icon:<DollarSign size={18}/>,    type:'danger',  msg:'Transfer request: ৳5,000 to unknown number 017XXXXXXX', status:'pending' },
  { id:'a2', time:'1 hour ago',   icon:<AlertTriangle size={18}/>, type:'warn',    msg:'Suspicious link detected in WhatsApp message from unknown sender', status:'resolved' },
  { id:'a3', time:'2 hours ago',  icon:<ShieldCheck size={18}/>,   type:'success', msg:'Login from Dhaka, Bangladesh — device recognized', status:'info' },
  { id:'a4', time:'Yesterday',    icon:<TrendingUp size={18}/>,    type:'info',    msg:'Completed lesson: "Recognizing Scam Messages" — great progress!', status:'info' },
  { id:'a5', time:'Yesterday',    icon:<DollarSign size={18}/>,    type:'success', msg:'Approved transfer: ৳1,000 to Rupa (Daughter) — completed safely', status:'approved' },
  { id:'a6', time:'2 days ago',   icon:<Shield size={18}/>,        type:'success', msg:'Screenshot analyzed — no threats found', status:'info' },
];

const STATUS_COLORS = { pending:'var(--warn)', resolved:'var(--success)', info:'var(--blue)', approved:'var(--success)' };
const STATUS_BG     = { pending:'var(--warn-light)', resolved:'var(--success-light)', info:'var(--blue-light)', approved:'var(--success-light)' };

export default function GuardianDashboard() {
  const { t, guardianAlerts, resolveGuardianAlert, speak, showToast, language } = useApp();
  const [calling, setCalling] = useState(false);
  const [activeSection, setActiveSection] = useState('alerts'); // alerts|activity|settings

  const pending = guardianAlerts.filter(a => a.status === 'pending');

  const handleCall = () => {
    setCalling(true);
    speak(t('Calling your guardian now.', 'আপনার গার্ডিয়ানকে এখন কল করা হচ্ছে।'));
    setTimeout(() => {
      setCalling(false);
      showToast(t('Guardian connected! They will help you.', 'গার্ডিয়ান সংযুক্ত! তারা সাহায্য করবেন।'), 'success');
    }, 3000);
  };

  const handleApprove = (id) => {
    resolveGuardianAlert(id, 'approved');
    speak(t('Transaction approved by guardian.', 'গার্ডিয়ান লেনদেন অনুমোদন করেছেন।'));
  };
  const handleReject = (id) => {
    resolveGuardianAlert(id, 'rejected');
    speak(t('Transaction rejected for safety.', 'নিরাপত্তার জন্য লেনদেন প্রত্যাখ্যান করা হয়েছে।'));
  };

  return (
    <div>
      <div className="section-header">
        <div className="flex items-center gap-16">
          <div className="icon-wrap iw-md ic-blue"><Shield size={26}/></div>
          <div>
            <h1 className="t-title anim-up">{t('Guardian Dashboard', 'গার্ডিয়ান ড্যাশবোর্ড')}</h1>
            <p className="t-sub anim-up d1" style={{ marginTop:4 }}>{t('Family protection & oversight', 'পারিবারিক সুরক্ষা ও নজরদারি')}</p>
          </div>
        </div>
        <div className="section-divider"/>
      </div>

      {/* Guardian Card */}
      <div className="card anim-up" style={{ background:'linear-gradient(135deg,#1e2a35,#3a5068)', color:'#fff', marginBottom:24, padding:28 }}>
        <div className="flex items-center gap-20" style={{ flexWrap:'wrap' }}>
          <div style={{ fontSize:46, width:46, height:46, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <User size={24} color="#fff"/>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>{t('Karim\'s Son (Dhaka)','করিমের পুত্র (ঢাকা)')}</p>
            <div className="flex items-center gap-8" style={{ marginBottom:8 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#4ade80' }}/>
              <p style={{ fontSize:15, color:'#4ade80', fontWeight:700 }}>{t('🟢 Online — available now','🟢 অনলাইন — এখন উপলব্ধ')}</p>
            </div>
            <p style={{ opacity:0.75, fontSize:15 }}>{t('Last seen: 2 minutes ago • 019XXXXXX88','সর্বশেষ দেখা: ২ মিনিট আগে • 019XXXXXX88')}</p>
          </div>
          <div className="flex-col gap-10">
            <button onClick={handleCall} className="btn btn-sm" style={{ background:'#4ade80', color:'#1e2a35', fontWeight:800 }}
              disabled={calling}>
              <Phone size={18}/> {calling ? t('Connecting…','সংযুক্ত হচ্ছে…') : t('Call Now','এখন কল করুন')}
            </button>
            <button className="btn btn-sm btn-ghost" style={{ color:'#fff', border:'1px solid rgba(255,255,255,0.3)' }}>
              <MessageCircle size={18}/> {t('Message','মেসেজ')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="segment anim-up d1" style={{ marginBottom:24 }}>
        {['alerts','activity','settings'].map(s => (
          <button key={s} className={`seg-btn ${activeSection===s?'active':''}`} onClick={()=>setActiveSection(s)}>
            {s==='alerts'   ? `${t('Alerts','সতর্কতা')} ${pending.length>0?`(${pending.length})`:''}` :
             s==='activity' ? t('Activity','কার্যক্রম') :
                              t('Settings','সেটিংস')}
          </button>
        ))}
      </div>

      {/* Alerts Tab */}
      {activeSection === 'alerts' && (
        <div className="flex-col gap-14 anim-up">
          {pending.length === 0 && (
            <div className="card text-center" style={{ padding:40 }}>
              <p style={{ fontSize:40, marginBottom:12 }}>✅</p>
              <p style={{ fontWeight:700, fontSize:18 }}>{t('No pending alerts. Everything is safe!','কোনো মুলতুবি সতর্কতা নেই। সব নিরাপদ!')}</p>
            </div>
          )}
          {guardianAlerts.map((alert, i) => (
            <div key={alert.id} className={`card anim-up d${i+1}`} style={{ padding:20, borderLeft:`5px solid ${STATUS_COLORS[alert.status]||'var(--blue)'}`, background:STATUS_BG[alert.status]||'var(--surface)' }}>
              <div className="flex items-start gap-14" style={{ marginBottom: alert.status==='pending'?16:0 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:STATUS_BG[alert.status]||'var(--blue-light)', color:STATUS_COLORS[alert.status]||'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {alert.type==='transaction'?<DollarSign size={18}/>:alert.type==='scam'?<AlertTriangle size={18}/>:<Info size={18}/>}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:800, fontSize:17, marginBottom:4 }}>{alert.msg}</p>
                  <div className="flex items-center gap-10">
                    <Clock size={14} color="var(--text-3)"/>
                    <p className="t-tiny">{alert.time}</p>
                    <span className="badge" style={{ background:STATUS_COLORS[alert.status]+'22', color:STATUS_COLORS[alert.status], fontSize:12 }}>
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              {alert.status === 'pending' && (
                <div className="flex gap-12">
                  <button className="btn btn-success btn-sm flex-1" onClick={() => handleApprove(alert.id)}>
                    <Check size={18}/> {t('Approve','অনুমোদন')}
                  </button>
                  <button className="btn btn-danger btn-sm flex-1" onClick={() => handleReject(alert.id)}>
                    <X size={18}/> {t('Reject','প্রত্যাখ্যান')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Activity Tab */}
      {activeSection === 'activity' && (
        <div className="flex-col gap-12 anim-up">
          <div className="card" style={{ background:'var(--blue-light)', padding:16, marginBottom:8 }}>
            <p style={{ fontWeight:700, color:'var(--blue)' }}>📊 {t('Last 7 days activity for Abdul Karim','আবদুল করিমের গত ৭ দিনের কার্যক্রম')}</p>
          </div>
          {ACTIVITY_LOG.map((log, i) => (
            <div key={log.id} className={`flex items-center gap-14 anim-up d${i+1}`} style={{ padding:'14px 18px', background:'var(--surface)', borderRadius:'var(--r-sm)', boxShadow:'var(--sh-xs)' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:STATUS_BG[log.status]||'var(--surface-2)', color:STATUS_COLORS[log.status]||'var(--text-3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {log.icon}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600, fontSize:16 }}>{log.msg}</p>
                <p className="t-tiny" style={{ marginTop:2 }}>{log.time}</p>
              </div>
              <span className="badge" style={{ background:STATUS_BG[log.status]||'var(--surface-2)', color:STATUS_COLORS[log.status]||'var(--text-3)', fontSize:12, flexShrink:0 }}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeSection === 'settings' && (
        <div className="flex-col gap-16 anim-up">
          {[
            { label:t('Transaction Approval Required','লেনদেন অনুমোদন প্রয়োজন'), val:true, desc:t('Guardian must approve all money transfers','গার্ডিয়ানকে সব টাকা স্থানান্তর অনুমোদন করতে হবে') },
            { label:t('Scam Alert Notifications','স্ক্যাম সতর্কতা বিজ্ঞপ্তি'), val:true, desc:t('Get notified of suspicious messages','সন্দেহজনক বার্তার বিজ্ঞপ্তি পান') },
            { label:t('Login Alerts','লগইন সতর্কতা'), val:true, desc:t('Know when the user signs in','ব্যবহারকারী সাইন ইন করলে জানুন') },
            { label:t('Daily Activity Reports','দৈনিক কার্যক্রম রিপোর্ট'), val:false, desc:t('Receive daily summary emails','দৈনিক সারসংক্ষেপ ইমেইল পান') },
          ].map((s,i) => (
            <div key={i} className="card flex items-center gap-16" style={{ padding:20 }}>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:17 }}>{s.label}</p>
                <p className="t-tiny">{s.desc}</p>
              </div>
              <div className={`toggle ${s.val?'on':''}`} onClick={() => showToast(t('Setting updated.','সেটিং আপডেট হয়েছে।'))}>
                <div className="toggle-knob"/>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
