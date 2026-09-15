import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppStateContext';
import { PlayCircle, ChevronRight, Sparkles, MessageCircle, ShieldAlert, BookMarked,
         AlertTriangle, BookOpen, Users, Monitor, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';
import { PROGRESS_CATEGORIES } from '../data/hardcoded';

const GREETINGS = {
  en: ["You are safe here. Take your time.", "Welcome back. You are doing wonderfully.", "Good to see you. No rush today."],
  bn: ["আপনি এখানে নিরাপদ। ধীরে সুস্থে করুন।", "আবার স্বাগতম। আপনি দারুণ করছেন।", "আপনাকে দেখে ভালো লাগছে। আজ কোনো তাড়া নেই।"],
  hi: ["आप यहाँ सुरक्षित हैं। अपना समय लें।", "वापसी पर स्वागत है। आप बहुत अच्छा कर रहे हैं।", "आपको देखकर अच्छा लगा। आज कोई जल्दी नहीं।"],
};

export default function Home() {
  const { user, mode, language, t, speak, setActiveTab, progress, unreadCount } = useApp();
  const [greeting] = useState(() => {
    const arr = GREETINGS[language] || GREETINGS.en;
    return arr[Math.floor(Math.random() * arr.length)];
  });

  useEffect(() => {
    const name = user?.name?.split(' ')[0] || t('friend', 'বন্ধু', 'मित्र');
    const msg = t(`Hello ${name}. You are safe here.`, `হ্যালো ${name}। আপনি নিরাপদ।`, `नमस्ते ${name}। आप सुरक्षित हैं।`);
    const timer = setTimeout(() => speak(msg), 700);
    return () => clearTimeout(timer);
  }, []);

  const totalProgress = Math.round(Object.values(progress).reduce((a,b)=>a+b,0)/Object.values(progress).length);

  const cards = [
    { icon:<Sparkles size={26}/>,       color:'var(--blue)',    bg:'var(--blue-light)',    tab:'learn',      title:t('Learn Something New','নতুন কিছু শিখুন','नया सीखें'),              sub:t('Guided tutorials & digital literacy','গাইডেড টিউটোরিয়াল','गाइडेड ट्यूटोरियल') },
    { icon:<Users size={26}/>,           color:'var(--teal)',    bg:'var(--teal-light)',    tab:'practice',   title:t('Practice Safely','নিরাপদে চর্চা করুন','सुरक्षित अभ्यास'),          sub:t('WhatsApp, Gmail, bKash & more','WhatsApp, Gmail, bKash সহ','WhatsApp, Gmail, bKash') },
    { icon:<MessageCircle size={26}/>,   color:'var(--peach)',   bg:'var(--peach-light)',   tab:'assistant',  title:t('Ask AI Assistant','এআই অ্যাসিস্ট্যান্ট','AI सहायक से पूछें'),      sub:t('Chat, voice & screenshot help','চ্যাট, ভয়েস ও স্ক্রিনশট','चैट, वॉयस सहायता') },
    { icon:<ShieldAlert size={26}/>,     color:'var(--warn)',    bg:'var(--warn-light)',    tab:'safety',     title:t('Safety Check','নিরাপত্তা যাচাই','सुरक्षा जाँच'),                   sub:t('Scam detection & phishing alerts','স্ক্যাম শনাক্তকরণ','स्कैम पहचान') },
    { icon:<Monitor size={26}/>,         color:'var(--teal)',    bg:'var(--teal-light)',    tab:'screenshot', title:t('UI Guide','UI গাইড','UI गाइड'),                                   sub:t('Explained app buttons & screens','অ্যাপ বাটনের ব্যাখ্যা','ऐप बटन की व्याख्या') },
    { icon:<TrendingUp size={26}/>,      color:'var(--sage)',    bg:'var(--sage-light)',    tab:'progress',   title:t('My Progress','আমার অগ্রগতি','मेरी प्रगति'),                       sub:t('Achievements & skill tracking','অর্জন ও দক্ষতা ট্র্যাকিং','उपलब्धियाँ') },
    { icon:<HeartHandshake size={26}/>,  color:'var(--danger)',  bg:'var(--danger-light)',  tab:'emergency',  title:t('Emergency Help','জরুরি সাহায্য','आपातकालीन सहायता'),              sub:t('SOS & emergency contacts','SOS ও জরুরি যোগাযোগ','SOS संपर्क') },
    { icon:<BookMarked size={26}/>,      color:'var(--blue)',    bg:'var(--blue-light)',    tab:'memory',     title:t('Memory Book','স্মৃতির বই','स्मृति पुस्तक'),                        sub:t('Saved lessons & voice replays','সংরক্ষিত পাঠ','सहेजे गए पाठ') },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="anim-up" style={{ background:'linear-gradient(135deg,#1d4ed8 0%,#0891b2 100%)', borderRadius:'var(--r-lg)', padding:'28px 32px', marginBottom:28, color:'#fff', display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:220 }}>
          <p style={{ fontSize:13, opacity:0.75, fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
            {t(`Hello, ${user?.name?.split(' ')[0] || 'friend'}`, `হ্যালো, ${user?.name?.split(' ')[0] || 'বন্ধু'}`, `नमस्ते, ${user?.name?.split(' ')[0] || 'मित्र'}`)}
          </p>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:8, lineHeight:1.3, letterSpacing:'-0.02em' }}>{greeting}</h1>
          <p style={{ opacity:0.8, fontSize:15, fontWeight:500 }}>
            {t('Guideia is here to guide you safely.', 'Guideia আপনাকে নিরাপদে গাইড করতে এখানে আছে।', 'Guideia यहाँ आपको सुरक्षित मार्गदर्शन देने के लिए है।')}
          </p>
        </div>
        <button onClick={() => speak(greeting)}
          style={{ background:'rgba(255,255,255,0.15)', color:'#fff', padding:'10px 18px', borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', gap:8, fontWeight:600, fontSize:15, border:'1px solid rgba(255,255,255,0.25)', cursor:'pointer', flexShrink:0 }}>
          <PlayCircle size={18}/> {t('Read Aloud','জোরে পড়ুন','ज़ोर से पढ़ें')}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid-3 anim-up d1" style={{ marginBottom:28 }}>
        <div className="card" style={{ textAlign:'center', padding:20 }}>
          <p style={{ fontSize:36, fontWeight:900, color:'var(--blue)', marginBottom:4, letterSpacing:'-0.03em' }}>{totalProgress}%</p>
          <p style={{ fontSize:14, color:'var(--text-2)', fontWeight:600 }}>{t('Overall Progress','সামগ্রিক অগ্রগতি','कुल प्रगति')}</p>
          <div className="progress-track" style={{ marginTop:10 }}><div className="progress-fill" style={{ width:`${totalProgress}%` }}/></div>
        </div>
        <div className="card" style={{ textAlign:'center', padding:20 }}>
          <p style={{ fontSize:36, fontWeight:900, color:'var(--sage)', marginBottom:4, letterSpacing:'-0.03em' }}>3</p>
          <p style={{ fontSize:14, color:'var(--text-2)', fontWeight:600 }}>{t('Lessons Completed','সম্পন্ন পাঠ','पाठ पूरे')}</p>
          <p style={{ fontSize:13, color:'var(--text-3)', marginTop:4 }}>{t('This week','এই সপ্তাহ','इस सप्ताह')}</p>
        </div>
        <div className="card" style={{ textAlign:'center', padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 }}>
            <ShieldCheck size={32} color="var(--sage)"/>
          </div>
          <p style={{ fontSize:14, color:'var(--text-2)', fontWeight:600 }}>{t('Scams Avoided','এড়ানো স্ক্যাম','बचे स्कैम')}</p>
          <p style={{ fontSize:13, color:'var(--text-3)', marginTop:4 }}>{t('You are protected','আপনি সুরক্ষিত','आप सुरक्षित हैं')}</p>
        </div>
      </div>

      {/* Main Cards */}
      <h2 style={{ fontWeight:700, fontSize:18, marginBottom:14, color:'var(--text-2)', letterSpacing:'-0.01em' }} className="anim-up">
        {t('What would you like to do?','আপনি কী করতে চান?','आप क्या करना चाहते हैं?')}
      </h2>
      <div className="grid-2 anim-up d2" style={{ marginBottom:32 }}>
        {cards.map((c) => (
          <button key={c.tab} className="card card-btn flex items-center gap-14"
            onClick={() => setActiveTab(c.tab)}
            style={{ padding:18, borderLeft:`3px solid ${c.color}` }}>
            <div className="icon-wrap iw-md" style={{ background:c.bg, color:c.color, borderRadius:'var(--r-sm)' }}>{c.icon}</div>
            <div style={{ flex:1, textAlign:'left' }}>
              <p style={{ fontWeight:700, fontSize:16, marginBottom:3 }}>{c.title}</p>
              <p style={{ fontSize:13, color:'var(--text-3)', fontWeight:500 }}>{c.sub}</p>
            </div>
            <ChevronRight size={18} color="var(--text-3)"/>
          </button>
        ))}
      </div>
    </div>
  );
}
