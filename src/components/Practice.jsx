import { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { ChevronRight, MessageSquare, ThumbsUp, ShieldCheck, Banknote, Video, KeyRound } from 'lucide-react';
import AppLogo from './AppLogo';
import GuidedTaskTracker from './GuidedTaskTracker';

// Authentic simulator components (each has its own file)
import WhatsAppSim from './sims/WhatsAppSim';
import FacebookSim from './sims/FacebookSim';
import MessengerSim from './sims/MessengerSim';
import GmailSim from './sims/GmailSim';
import BkashSim from './sims/BkashSim';
import NagadSim from './sims/NagadSim';
import GPaySim from './sims/GPaySim';
import PayPalSim from './sims/PayPalSim';
import BookingSim from './sims/BookingSim';
import PractoSim from './sims/PractoSim';
import AmazonSim from './sims/AmazonSim';

const SIMS = [
  { id:'whatsapp', label:'WhatsApp', app:'whatsapp', color:'#25D366', bg:'#e8faf0', sub:'Send messages safely', subBn:'নিরাপদে মেসেজ পাঠান', subHi:'सुरक्षित संदेश भेजें', done:true },
  { id:'facebook', label:'Facebook', app:'facebook', color:'#1877F2', bg:'#e7f3ff', sub:'Browse posts & react', subBn:'পোস্ট দেখুন ও লাইক দিন', subHi:'पोस्ट देखें और लाइक करें', done:true },
  { id:'messenger', label:'Messenger', app:'messenger', color:'#0084FF', bg:'#e8f4ff', sub:'Chat & video call', subBn:'চ্যাট ও ভিডিও কল', subHi:'चैट और वीडियो कॉल', done:false },
  { id:'gmail', label:'Gmail', app:'gmail', color:'#EA4335', bg:'#fce8e8', sub:'Spot scam emails', subBn:'স্ক্যাম ইমেইল চিনুন', subHi:'स्कैम ईमेल पहचानें', done:false },
  { id:'bkash', label:'bKash', app:'bkash', color:'#E2136E', bg:'#fce8f3', sub:'Safe mobile banking', subBn:'নিরাপদ মোবাইল ব্যাংকিং', subHi:'सुरक्षित मोबाइल बैंकिंग', done:false },
  { id:'nagad', label:'Nagad', app:'nagad', color:'#F05A22', bg:'#fff3ed', sub:'OTP safety lesson', subBn:'OTP নিরাপত্তা পাঠ', subHi:'OTP सुरक्षा पाঠ', done:false },
  { id:'gpay', label:'Google Pay', app:'googlepay', color:'#1A73E8', bg:'#e8f0fe', sub:'Send money safely', subBn:'নিরাপদে টাকা পাঠান', subHi:'सुरक्षित पैसे भेजें', done:false },
  { id:'paypal', label:'PayPal', app:'paypal', color:'#003087', bg:'#e6f2ff', sub:'International payments', subBn:'আন্তর্জাতিক পেমেন্ট', subHi:'अंतरराष्ट्रीय भुगतान', done:false },
  { id:'booking', label:'Booking.com',app:'booking', color:'#003580', bg:'#e6f0fa', sub:'Book hotels online', subBn:'অনলাইনে হোটেল বুকিং', subHi:'ऑनलाइन होटल बुक करें', done:false },
  { id:'practo', label:'Practo', app:'practo', color:'#28328C', bg:'#e6f0fa', sub:'Telemedicine & Doctors', subBn:'টেলিমেডিসিন ও ডাক্তার', subHi:'टेलीमेडिसिन और डॉक्टर', done:false },
  { id:'amazon', label:'Amazon', app:'amazon', color:'#f3a847', bg:'#fef6eb', sub:'Online shopping safe', subBn:'নিরাপদ অনলাইন শপিং', subHi:'सुरक्षित ऑनलाइन शॉपिंग', done:false },
];

const ACHIEVEMENTS = [
  { icon:<MessageSquare size={22}/>, label:'First Message Sent', labelBn:'প্রথম মেসেজ পাঠানো', labelHi:'पहल संदेश भेजा', earned:true },
  { icon:<ThumbsUp size={22}/>, label:'First Facebook Like', labelBn:'প্রথম ফেসবুক লাইক', labelHi:'पहला Facebook लाइक', earned:true },
  { icon:<ShieldCheck size={22}/>, label:'Scam Spotter', labelBn:'স্ক্যাম শনাক্তকারী', labelHi:'स्कैम पहचानकर्ता', earned:true },
  { icon:<Banknote size={22}/>, label:'Safe Banking Practice', labelBn:'নিরাপদ ব্যাংকিং অনুশীলন', labelHi:'सरक्त बैंकिंग अभ्यास', earned:false },
  { icon:<Video size={22}/>, label:'First Video Call', labelBn:'প্রথম ভিডিও কল', labelHi:'पहली वीडियो काल', earned:false },
  { icon:<KeyRound size={22}/>, label:'OTP Lesson Complete', labelBn:'OTP পাঠ সম্পন্ন', labelHi:'OTP पाठ पूरा', earned:false },
];

export default function Practice() {
  const { t, mode, language } = useApp();
  const [active, setActive] = useState(null);
  const [showAch, setShowAch] = useState(false);

  // Full-screen simulators — rendered inside page-content area wrapped with GuidedTaskTracker
  if (active) {
    let SimComponent;
    if (active === 'whatsapp') SimComponent = <WhatsAppSim onClose={()=>setActive(null)}/>;
    if (active === 'facebook') SimComponent = <FacebookSim onClose={()=>setActive(null)}/>;
    if (active === 'messenger') SimComponent = <MessengerSim onClose={()=>setActive(null)}/>;
    if (active === 'gmail') SimComponent = <GmailSim onClose={()=>setActive(null)}/>;
    if (active === 'bkash') SimComponent = <BkashSim onClose={()=>setActive(null)}/>;
    if (active === 'nagad') SimComponent = <NagadSim onClose={()=>setActive(null)}/>;
    if (active === 'gpay') SimComponent = <GPaySim onClose={()=>setActive(null)}/>;
    if (active === 'paypal') SimComponent = <PayPalSim onClose={()=>setActive(null)}/>;
    if (active === 'booking') SimComponent = <BookingSim onClose={()=>setActive(null)}/>;
    if (active === 'practo') SimComponent = <PractoSim onClose={()=>setActive(null)}/>;
    if (active === 'amazon') SimComponent = <AmazonSim onClose={()=>setActive(null)}/>;

    return (
      <div style={{ height:'100%' }}>
        <GuidedTaskTracker appKey={active} onClose={() => setActive(null)}>
          {SimComponent}
        </GuidedTaskTracker>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div className="flex items-center justify-between" style={{ flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="t-title anim-up">{t('Practice Safely','নিরাপদে চর্চা করুন','सुरक्षित अभ्यास')}</h1>
            <p className="t-sub anim-up d1" style={{ marginTop:8 }}>
              {t('Authentic app simulations. No real data, no real money.','আসল অ্যাপের মতো সিমুলেশন। আসল ডেটা বা টাকা নেই।','वास्तविक एप सिमुलेशन। कोई वास्तविक डेटा या पैसा नहीं।')}
            </p>
          </div>
          <button className="btn btn-sm btn-outline anim-up d1" onClick={()=>setShowAch(v=>!v)}>
             {ACHIEVEMENTS.filter(a=>a.earned).length}/{ACHIEVEMENTS.length} {t('Achievements','অর্জন','उपलब्धियां')}
          </button>
        </div>
        <div className="section-divider"/>
      </div>

      {/* Achievements panel */}
      {showAch && (
        <div className="card anim-up" style={{ marginBottom:24, padding:20 }}>
          <p style={{ fontWeight:800, fontSize:17, marginBottom:14 }}> {t('Your Achievements','আপনার অর্জন','आपकी उपलब्धियां')}</p>
          <div className="grid-3" style={{ gap:12 }}>
            {ACHIEVEMENTS.map((a,i) => (
              <div key={i} style={{ padding:14, textAlign:'center', borderRadius:'var(--r-sm)', background:a.earned?'var(--success-light)':'var(--surface-2)', border:`1px solid ${a.earned?'var(--success)':'var(--border)'}`, opacity:a.earned?1:0.5 }}>
                <div style={{ fontSize:26, marginBottom:6 }}>{a.icon}</div>
                <p style={{ fontWeight:700, fontSize:12, lineHeight:1.3 }}>
                  {language==='bn' ? a.labelBn : language==='hi' ? a.labelHi : a.label}
                </p>
                {a.earned && <p style={{ fontSize:11, color:'var(--success)', fontWeight:700, marginTop:4 }}>&#10003; {t('Earned','অর্জিত','अर्जित')}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emotional mode card */}
      <div className="card anim-up d1" style={{ background:'linear-gradient(135deg,var(--sage-light),var(--teal-light))', marginBottom:24, padding:20 }}>
        <p style={{ fontWeight:700, fontSize:17 }}>
          {mode==='scared'
           ? t('"No rush. We\'ll do this together."','"তাড়া নেই। একসাথে করবো।"','"कोई जल्दी नहीं। साथ मिलकर करेंगे।"')
           : mode==='unsure'
           ? t('"You\'re doing well. Take your time."','"আপনি ভালো করছেন।"','"आप अच्छा कर रहे हैं। अपना समय लें।"')
           : t('"Great. Choose an app to start."','"চমৎকার। শুরু করতে একটি অ্যাপ বেছে নিন।"','"शुरू करने के लिए एक ऐप चुनें।"')}
        </p>
      </div>

      {/* App grid — no overlapping: logo left, text middle, badge/arrow right */}
      <div className="grid-2" style={{ gap:16 }}>
        {SIMS.map((s,i) => (
          <button key={s.id} onClick={()=>setActive(s.id)}
            className={`card card-btn anim-up d${i+2}`}
            style={{ padding:'16px 18px', borderLeft:`5px solid ${s.color}`, background:s.bg, display:'flex', alignItems:'center', gap:14, minHeight:80 }}>
            {/* Logo — fixed 44px so it never overflows */}
            <div style={{ width:44, height:44, flexShrink:0 }}>
              <AppLogo app={s.app} size={44} radius={10}/>
            </div>
            {/* Text */}
            <div style={{ flex:1, textAlign:'left', overflow:'hidden' }}>
              <p style={{ fontWeight:800, fontSize:17, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.label}</p>
              <p style={{ fontSize:13, color:'var(--text-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {language==='bn' ? s.subBn : language==='hi' ? s.subHi : s.sub}
              </p>
            </div>
            {/* Badge or arrow — fixed size, no overlap */}
            <div style={{ flexShrink:0 }}>
              {s.done
                ? <span className="badge badge-sage" style={{ fontSize:12 }}></span>
                : <ChevronRight size={18} color="var(--text-3)"/>
              }
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

