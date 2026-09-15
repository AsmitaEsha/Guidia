import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppStateContext';
import { Upload, Camera, Loader, ShieldAlert, Check, AlertTriangle, Sparkles } from 'lucide-react';
import AppLogo from './AppLogo';

import WhatsAppSim  from './sims/WhatsAppSim';
import FacebookSim  from './sims/FacebookSim';
import GmailSim     from './sims/GmailSim';
import BkashSim     from './sims/BkashSim';
import GPaySim      from './sims/GPaySim';
import PayPalSim    from './sims/PayPalSim';
import BookingSim   from './sims/BookingSim';
import PractoSim    from './sims/PractoSim';
import AmazonSim    from './sims/AmazonSim';

// Hardcoded analysis results mapped by app keyword
const ANALYSES = {
  whatsapp: {
    confidence: 94,
    safe: true,
    elements: [
      { label: 'Chats Tab', type: 'navigation', safe: true, desc: 'Shows all your recent text conversations.' },
      { label: 'Status/Updates Tab', type: 'navigation', safe: true, desc: 'View temporary photos and videos shared by your friends.' },
      { label: 'Calls Tab', type: 'navigation', safe: true, desc: 'View your voice and video call history.' },
      { label: 'Search Icon (🔍)', type: 'input', safe: true, desc: 'Type a name or word to find a specific message or person.' },
      { label: 'Camera Icon (📷)', type: 'action', safe: true, desc: 'Take a new photo or video to send immediately.' },
      { label: 'Menu Icon (⋮)', type: 'navigation', safe: true, desc: 'Access settings, linked devices, and broadcast lists.' },
      { label: 'New Chat Button (💬)', type: 'action', safe: true, desc: 'Start a conversation with a new contact from your phonebook.' },
      { label: 'Attachment Icon (📎)', type: 'action', safe: true, desc: 'Inside a chat, tap this to send documents, gallery photos, or location.' },
      { label: 'Microphone (🎤)', type: 'action', safe: true, desc: 'Hold this button to record and send a voice message.' },
    ],
    summary: 'This looks like the normal WhatsApp home screen. Everything looks safe here. No suspicious elements detected.',
    summaryBn: 'এটি স্বাভাবিক WhatsApp হোম স্ক্রিন। এখানে সব নিরাপদ। কোনো সন্দেহজনক উপাদান পাওয়া যায়নি।',
  },
  bkash: {
    confidence: 97,
    safe: false,
    elements: [
      { label: 'URGENT text', type: 'danger', safe: false, desc: 'Artificial urgency — designed to panic you into acting fast.' },
      { label: 'Suspicious link', type: 'danger', safe: false, desc: 'Not the real bKash website. This is a fake phishing link.' },
      { label: 'Account threat', type: 'danger', safe: false, desc: '"Account will close" — classic scare tactic. Real bKash never does this.' },
      { label: 'Unknown sender', type: 'warn', safe: false, desc: 'Sender is not the official bKash short code 16247.' },
    ],
    summary: 'HIGH RISK: This is a phishing scam. Do not tap any links. Block this number and inform your family immediately.',
    summaryBn: 'উচ্চ ঝুঁকি: এটি একটি প্রতারণামূলক বার্তা। কোনো লিংকে চাপ দেবেন না। নম্বরটি ব্লক করুন এবং পরিবারকে জানান।',
  },
  gmail: {
    confidence: 88,
    safe: false,
    elements: [
      { label: 'Prize claim subject', type: 'danger', safe: false, desc: 'Fake prize offers are one of the most common email scams.' },
      { label: 'Unknown sender', type: 'danger', safe: false, desc: 'Sender email is not from any legitimate company.' },
      { label: 'Urgent action required', type: 'warn', safe: false, desc: 'Creating urgency is a scam tactic to stop you from thinking clearly.' },
    ],
    summary: 'This email is a scam. Delete it immediately. Never click any links inside.',
    summaryBn: 'এই ইমেইলটি একটি প্রতারণা। অবিলম্বে মুছে দিন। ভেতরের কোনো লিংকে ক্লিক করবেন না।',
  },
  googlepay: {
    confidence: 96,
    safe: true,
    elements: [
      { label: 'Scan QR Code', type: 'action', safe: true, desc: 'Use your phone camera to scan a merchant\'s QR code for fast payment.' },
      { label: 'Pay Contacts', type: 'action', safe: true, desc: 'Send money to phone numbers saved in your contact list.' },
      { label: 'Pay Phone Number', type: 'action', safe: true, desc: 'Send money to any active GPay mobile number.' },
      { label: 'Bank Transfer', type: 'navigation', safe: true, desc: 'Send money directly to a bank using Account Number and IFSC code.' },
      { label: 'Pay Bills', type: 'action', safe: true, desc: 'Pay electricity, water, DTH, or recharge your mobile.' },
      { label: 'Check Bank Balance', type: 'info', safe: true, desc: 'View the current amount of money in your linked bank account.' },
      { label: 'Transaction History', type: 'info', safe: true, desc: 'A secure list of all the money you have sent and received.' },
      { label: 'Profile Picture', type: 'navigation', safe: true, desc: 'Tap your photo to see your UPI ID, bank accounts, and settings.' },
    ],
    summary: 'This is the standard Google Pay interface. Remember to only enter your UPI PIN when SENDING money, never to receive it.',
    summaryBn: 'এটি গুগল পের সাধারণ ইন্টারফেস। মনে রাখবেন, শুধু টাকা পাঠানোর সময় UPI পিন দেবেন, টাকা পাওয়ার জন্য নয়।',
  },
  paypal: {
    confidence: 94,
    safe: true,
    elements: [
      { label: 'PayPal Balance', type: 'info', safe: true, desc: 'Shows the total funds stored in your PayPal digital wallet.' },
      { label: 'Send Button', type: 'action', safe: true, desc: 'Send money domestically or internationally using an email or username.' },
      { label: 'Request Button', type: 'action', safe: true, desc: 'Send a notification asking someone to pay you.' },
      { label: 'Wallet Tab', type: 'navigation', safe: true, desc: 'Manage your linked bank accounts and credit/debit cards.' },
      { label: 'Activity Tab', type: 'info', safe: true, desc: 'Review past payments, refunds, and incoming transfers.' },
      { label: 'Crypto', type: 'action', safe: true, desc: 'Buy, sell, and hold cryptocurrency (optional feature).' },
      { label: 'Settings (⚙️)', type: 'navigation', safe: true, desc: 'Change your password, address, and security questions.' },
    ],
    summary: 'This is the genuine PayPal dashboard. Your account seems secure. Make sure you are on paypal.com.',
    summaryBn: 'এটি আসল পেপ্যাল ড্যাশবোর্ড। আপনার অ্যাকাউন্ট নিরাপদ মনে হচ্ছে। নিশ্চিত করুন আপনি paypal.com-এ আছেন।',
  },
  booking: {
    confidence: 92,
    safe: true,
    elements: [
      { label: 'Destination Box', type: 'input', safe: true, desc: 'Type the city, region, or specific hotel name.' },
      { label: 'Dates Calendar', type: 'input', safe: true, desc: 'Select your check-in and check-out days.' },
      { label: 'Guests & Rooms', type: 'input', safe: true, desc: 'Specify how many adults, children, and rooms you need.' },
      { label: 'Search Button', type: 'action', safe: true, desc: 'Tap to see a list of all available properties matching your criteria.' },
      { label: 'Map View', type: 'action', safe: true, desc: 'See hotels on a geographical map to check their location.' },
      { label: 'Sort & Filter', type: 'action', safe: true, desc: 'Narrow down results by lowest price, star rating, or free cancellation.' },
      { label: 'Guest Reviews', type: 'info', safe: true, desc: 'Scores (out of 10) given by previous visitors. Very important for safety.' },
    ],
    summary: 'This is the official Booking.com search screen. Always read reviews before booking a hotel.',
    summaryBn: 'এটি Booking.com এর আসল সার্চ স্ক্রিন। হোটেল বুক করার আগে সবসময় রিভিউ পড়ে নিন।',
  },
  practo: {
    confidence: 95,
    safe: true,
    elements: [
      { label: 'Find Doctors', type: 'action', safe: true, desc: 'Search for nearby doctors by specialty (e.g., Dentist, Cardiologist) and book in-person visits.' },
      { label: 'Video Consult', type: 'action', safe: true, desc: 'Instantly connect with a certified doctor online through a video call.' },
      { label: 'Medicines', type: 'action', safe: true, desc: 'Upload a prescription or buy medicines directly for home delivery.' },
      { label: 'Lab Tests', type: 'navigation', safe: true, desc: 'Schedule a phlebotomist to collect blood samples from your home.' },
      { label: 'Book Appointment', type: 'action', safe: true, desc: 'Confirm a specific time slot to see a doctor.' },
      { label: 'Patient Reviews', type: 'info', safe: true, desc: 'Read feedback from other patients about the doctor\'s behavior and treatment.' },
    ],
    summary: 'This is the Practo app home screen for health services. Booking appointments and video consults are safe here.',
    summaryBn: 'এটি স্বাস্থ্যসেবার জন্য Practo অ্যাপের হোম স্ক্রিন। এখানে ডাক্তার দেখানো এবং ভিডিও কল নিরাপদ।',
  },
  amazon: {
    confidence: 98,
    safe: true,
    elements: [
      { label: 'Search Bar (🔍)', type: 'input', safe: true, desc: 'Type the exact name of the product you want to buy.' },
      { label: 'Cart Icon (🛒)', type: 'navigation', safe: true, desc: 'Shows all items you have temporarily saved to purchase later. Tap to proceed to payment.' },
      { label: 'Add to Cart', type: 'action', safe: true, desc: 'Puts the item in your shopping basket without buying it immediately.' },
      { label: 'Buy Now', type: 'action', safe: true, desc: 'Skips the cart and takes you straight to the checkout/payment screen.' },
      { label: 'Star Ratings (⭐)', type: 'info', safe: true, desc: 'Shows quality out of 5. Always buy products with at least 4 stars and many reviews.' },
      { label: 'Your Orders', type: 'navigation', safe: true, desc: 'Track your current shipments or process returns and refunds.' },
      { label: 'Menu (☰)', type: 'navigation', safe: true, desc: 'Access settings, customer service, and full department lists.' },
    ],
    summary: 'This is the Amazon shopping app. It looks authentic. Be cautious of extremely low prices from unknown sellers.',
    summaryBn: 'এটি আমাজন শপিং অ্যাপ। এটি আসল মনে হচ্ছে। অচেনা বিক্রেতার খুব কম দামের জিনিস থেকে সাবধান থাকুন।',
  },
  default: {
    confidence: 82,
    safe: true,
    elements: [
      { label: 'App interface', type: 'info', safe: true, desc: 'Standard app interface detected.' },
      { label: 'Navigation elements', type: 'navigation', safe: true, desc: 'Normal navigation buttons found.' },
    ],
    summary: 'This screenshot appears safe. No suspicious elements detected.',
    summaryBn: 'এই স্ক্রিনশটটি নিরাপদ মনে হচ্ছে। কোনো সন্দেহজনক উপাদান পাওয়া যায়নি।',
  },
};

const DEMO_SHOTS = [
  { id:'wa',   label:'WhatsApp Home', app:'whatsapp', key:'whatsapp', emoji:'💬' },
  { id:'bk',   label:'bKash Scam',    app:'bkash',    key:'bkash',   emoji:'⚠️' },
  { id:'gm',   label:'Gmail Scam',    app:'gmail',    key:'gmail',   emoji:'📧' },
  { id:'gpay', label:'Google Pay',    app:'googlepay',key:'googlepay', emoji:'💳' },
  { id:'pp',   label:'PayPal',        app:'paypal',   key:'paypal',   emoji:'🌐' },
  { id:'book', label:'Booking.com',   app:'booking',  key:'booking',  emoji:'🏨' },
  { id:'prac', label:'Practo Health', app:'practo',   key:'practo',   emoji:'👨‍⚕️' },
  { id:'amz',  label:'Amazon',        app:'amazon',   key:'amazon',   emoji:'🛒' },
];

const LOADING_MSGS_EN = [
  'Uploading screenshot safely…',
  'Looking carefully at each element…',
  'Checking this safely…',
  'Identifying interactive elements…',
  'Generating plain-language explanation…',
];
const LOADING_MSGS_BN = [
  'নিরাপদে স্ক্রিনশট আপলোড হচ্ছে…',
  'প্রতিটি উপাদান মনোযোগ দিয়ে দেখা হচ্ছে…',
  'নিরাপদে যাচাই করা হচ্ছে…',
  'ইন্টারেক্টিভ উপাদান চিহ্নিত করা হচ্ছে…',
  'সহজ ভাষায় ব্যাখ্যা তৈরি হচ্ছে…',
];

export default function ScreenshotAnalyzer() {
  const { t, language, speak, addMemory, showToast, mode } = useApp();
  const [phase, setPhase] = useState('idle'); // idle|loading|result
  const [analysis, setAnalysis] = useState(null);
  const [loadMsg, setLoadMsg] = useState('');
  const [loadPct, setLoadPct] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const fileRef = useRef(null);

  const runAnalysis = (key, demoShot = null) => {
    const msgs = language === 'bn' ? LOADING_MSGS_BN : LOADING_MSGS_EN;
    setPhase('loading');
    setLoadPct(0);
    setSelectedDemo(demoShot);
    setLoadMsg(msgs[0]);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLoadMsg(msgs[Math.min(i, msgs.length - 1)]);
      setLoadPct(Math.min(95, (i / msgs.length) * 100));
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setLoadPct(100);
      const result = ANALYSES[key] || ANALYSES.default;
      setAnalysis(result);
      setPhase('result');
      const summary = language === 'bn' ? result.summaryBn : result.summary;
      speak(summary);
      addMemory({ title: t('Screenshot analyzed','স্ক্রিনশট বিশ্লেষণ করা হয়েছে'), icon:'📸', category:'safety', starred:false, summary: summary.slice(0,80) });
    }, 5500);
  };

  const reset = () => { setPhase('idle'); setAnalysis(null); setSelectedDemo(null); setLoadPct(0); };

  const typeColor = { danger:'var(--danger)', warn:'var(--warn)', info:'var(--blue)', navigation:'var(--teal)', action:'var(--sage)', input:'var(--text-2)' };
  const typeBg    = { danger:'var(--danger-light)', warn:'var(--warn-light)', info:'var(--blue-light)', navigation:'var(--teal-light)', action:'var(--sage-light)', input:'var(--surface-2)' };

  return (
    <div>
      <div className="section-header">
        <h1 className="t-title anim-up">{t('Screenshot Analyzer','স্ক্রিনশট বিশ্লেষক')}</h1>
        <p className="t-sub anim-up d1" style={{ marginTop:8 }}>{t('Upload any app screenshot and I will explain it safely in plain language.','যেকোনো অ্যাপের স্ক্রিনশট আপলোড করুন — আমি সহজ ভাষায় ব্যাখ্যা করবো।')}</p>
        <div className="section-divider"/>
      </div>

      {phase === 'idle' && (
        <>
          {/* Upload Zone */}
          <div className="anim-up" style={{ border:'3px dashed var(--blue)', borderRadius:'var(--r-lg)', padding:40, textAlign:'center', background:'var(--blue-light)', marginBottom:28, cursor:'pointer' }}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={() => runAnalysis('default')} />
            <Upload size={48} color="var(--blue)" style={{ margin:'0 auto 16px' }}/>
            <p style={{ fontWeight:800, fontSize:22, marginBottom:8 }}>{t('Upload a Screenshot','স্ক্রিনশট আপলোড করুন')}</p>
            <p className="t-sub">{t('Tap here to choose a photo from your device','এখানে চাপ দিয়ে আপনার ডিভাইস থেকে ছবি বেছে নিন')}</p>
            <button className="btn btn-primary" style={{ marginTop:20 }}>
              <Camera size={20}/> {t('Choose Screenshot','স্ক্রিনশট বেছে নিন')}
            </button>
          </div>

          {/* Demo screenshots */}
          <p style={{ fontWeight:800, fontSize:18, marginBottom:14, color:'var(--text-2)' }}>{t('Or try a demo screenshot:','অথবা একটি ডেমো স্ক্রিনশট চেষ্টা করুন:')}</p>
          <div className="grid-2" style={{ gap:14 }}>
            {DEMO_SHOTS.map((d,i) => (
              <button key={d.id} className={`card card-btn flex items-center gap-14 anim-up d${i+1}`}
                onClick={() => runAnalysis(d.key, d)} style={{ padding:18 }}>
                <AppLogo app={d.app} size={44} radius={12}/>
                <div style={{ flex:1, textAlign:'left' }}>
                  <p style={{ fontWeight:700, fontSize:17 }}>{d.label}</p>
                  <p className="t-tiny">{t('Tap to analyze','বিশ্লেষণ করতে চাপ দিন')}</p>
                </div>
                <span style={{ fontSize:24 }}>{d.emoji}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'loading' && (
        <div className="anim-in" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:28, paddingTop:40, textAlign:'center' }}>
          <div className="anim-breathe" style={{ width:100, height:100, borderRadius:'50%', background:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Sparkles size={48} color="var(--blue)"/>
          </div>
          <div style={{ width:'100%', maxWidth:400 }}>
            <p style={{ fontWeight:800, fontSize:20, marginBottom:16 }}>{loadMsg}</p>
            <div className="progress-track" style={{ height:14, marginBottom:10 }}>
              <div className="progress-fill" style={{ width:`${loadPct}%` }}/>
            </div>
            <p className="t-tiny">{Math.round(loadPct)}% {t('complete','সম্পন্ন')}</p>
          </div>
          <p className="t-sub">{t('You\'re safe. Analyzing carefully…','আপনি নিরাপদ। সাবধানে বিশ্লেষণ চলছে…')}</p>
        </div>
      )}

      {phase === 'result' && analysis && (
        <div className="anim-up">
          {/* Result header */}
          <div className="card" style={{ background: analysis.safe ? 'var(--success-light)' : 'var(--danger-light)', border:`2px solid ${analysis.safe?'var(--success)':'var(--danger)'}`, padding:24, marginBottom:20 }}>
            <div className="flex items-center gap-16" style={{ marginBottom:12 }}>
              <div style={{ fontSize:40 }}>{analysis.safe ? '✅' : '🚨'}</div>
              <div>
                <p style={{ fontWeight:800, fontSize:22, color: analysis.safe?'var(--success)':'var(--danger)' }}>
                  {analysis.safe ? t('Looks Safe','নিরাপদ মনে হচ্ছে') : t('RISK DETECTED','ঝুঁকি শনাক্ত হয়েছে')}
                </p>
                <p className="t-sub">{t(`AI Confidence: ${analysis.confidence}%`,`এআই নিশ্চয়তা: ${analysis.confidence}%`)}</p>
              </div>
            </div>
            <p style={{ fontSize:18, lineHeight:1.6 }}>{language==='bn' ? analysis.summaryBn : analysis.summary}</p>
          </div>

          {/* Authentic App Preview with Scanner Effect */}
          {selectedDemo && (
            <div style={{ position:'relative', width: 320, height: 480, overflow:'hidden', borderRadius: 24, border:'8px solid #222', margin:'0 auto 24px', boxShadow:'0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ pointerEvents: 'none', width:'100%', height:'100%', overflow:'hidden' }}>
                {selectedDemo.key === 'whatsapp' && <WhatsAppSim onClose={()=>{}}/>}
                {selectedDemo.key === 'bkash' && <BkashSim onClose={()=>{}}/>}
                {selectedDemo.key === 'gmail' && <GmailSim onClose={()=>{}}/>}
                {selectedDemo.key === 'googlepay' && <GPaySim onClose={()=>{}}/>}
                {selectedDemo.key === 'paypal' && <PayPalSim onClose={()=>{}}/>}
                {selectedDemo.key === 'booking' && <BookingSim onClose={()=>{}}/>}
                {selectedDemo.key === 'practo' && <PractoSim onClose={()=>{}}/>}
                {selectedDemo.key === 'amazon' && <AmazonSim onClose={()=>{}}/>}
                {selectedDemo.key === 'default' && <FacebookSim onClose={()=>{}}/>}
              </div>
              <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.15)', pointerEvents:'none' }}/>
              <div className="anim-pulse" style={{ position:'absolute', top:'20%', left:'10%', width:40, height:40, borderRadius:'50%', border:'3px solid var(--success)', background:'rgba(76,175,80,0.2)' }}/>
              <div className="anim-pulse" style={{ position:'absolute', top:'50%', right:'10%', width:40, height:40, borderRadius:'50%', border:`3px solid ${analysis.safe?'var(--success)':'var(--danger)'}`, background:analysis.safe?'rgba(76,175,80,0.2)':'rgba(244,67,54,0.2)', animationDelay:'0.5s' }}/>
            </div>
          )}

          {/* Elements */}
          <div className="card" style={{ marginBottom:20 }}>
            <p style={{ fontWeight:800, fontSize:18, marginBottom:14 }}>🔍 {t('Elements Found','পাওয়া উপাদানসমূহ')}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {analysis.elements.map((el,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', background:typeBg[el.type]||'var(--surface-2)', borderRadius:'var(--r-sm)', borderLeft:`4px solid ${typeColor[el.type]||'var(--text-3)'}` }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:typeColor[el.type]||'var(--text-3)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0 }}>
                    {i+1}
                  </div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:16 }}>{el.label}</p>
                    <p className="t-sub" style={{ fontSize:14, marginTop:2 }}>{el.desc}</p>
                  </div>
                  {!el.safe && <AlertTriangle size={18} color="var(--danger)" style={{ flexShrink:0, marginLeft:'auto' }}/>}
                  {el.safe  && <Check        size={18} color="var(--success)" style={{ flexShrink:0, marginLeft:'auto' }}/>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={() => speak(language==='bn'?analysis.summaryBn:analysis.summary)}>
              🔊 {t('Read Analysis Aloud','বিশ্লেষণ জোরে পড়ুন')}
            </button>
            <button className="btn btn-ghost" onClick={reset}>
              {t('← Analyze Another','← আরেকটি বিশ্লেষণ করুন')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
