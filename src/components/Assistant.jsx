import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppStateContext';
import { Send, Mic, Camera, PlayCircle, Loader } from 'lucide-react';
import { getAIResponse, AI_RESPONSES } from '../data/hardcoded';

const SCREENSHOT_RESULT = {
  en: "I've analyzed this screenshot safely.\n\n🔴 Warning: This message creates urgency and fear.\n\n⚠️ Suspicious elements:\n1. 'URGENT' — designed to scare you into acting fast\n2. External link — not from the official app\n3. Account closure threat — a classic scare tactic\n\nReal banks will NEVER send messages like this.\nDo not tap any links. You are safe. 🛡️",
  bn: "আমি স্ক্রিনশটটি নিরাপদে বিশ্লেষণ করেছি।\n\n🔴 সতর্কতা: এই মেসেজটি জরুরি অবস্থা তৈরি করছে।\n\n⚠️ সন্দেহজনক বিষয়:\n১. 'URGENT' — ভয় দেখিয়ে দ্রুত কাজ করাচ্ছে\n২. বাইরের লিংক — অফিসিয়াল নয়\n৩. অ্যাকাউন্ট বন্ধের হুমকি — একটি কৌশল\n\nআসল ব্যাংক এ ধরনের মেসেজ পাঠায় না।\nকোনো লিংকে চাপ দেবেন না। আপনি নিরাপদ। 🛡️"
};

export default function Assistant() {
  const { language, mode, speak, t, addMemory } = useApp();
  const [messages, setMessages] = useState([{
    id:1, from:'ai',
    text: language==='bn'
      ? 'হে, আমি কীভাবে আপনাকে সাহায্য করতে পারি?'
      : language==='hi'
      ? 'नमस्ते! मैं Guideia हूँ — आपका सुरक्षित डिजिटल सहायक । मैं आपकी किस तरह मदद कर सकता हूँ?'
      : 'Hey, how can I help you?',
    time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
  }]);
  const [flowState, setFlowState] = useState('idle');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, isTyping, isAnalyzing]);

  const addMsg = (from, text, extra={}) =>
    setMessages(prev => [...prev, { id:Date.now(), from, text, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), ...extra }]);

  const handleSend = () => {
    if (!input.trim()) return;
    addMsg('user', input);
    const q = input;
    setInput('');
    setIsTyping(true);
    const delay = mode==='scared'?2200:mode==='unsure'?1700:1200;
    setTimeout(() => {
      setIsTyping(false);
      
      if (q.toLowerCase().includes('send') && q.toLowerCase().includes('bkash') || q.includes('বিকাশ') || q.includes('bKash সে')) {
        setFlowState('awaiting_screenshot');
        const text = language === 'bn'
          ? "অবশ্যই! আমি আপনাকে ধাপে ধাপে গাইড করব। দয়া করে আপনার বিকাশ অ্যাপের একটি স্ক্রিনশট আপলোড করুন।\n\nনিশ্চিত থাকুন, এই কথোপকথন শেষ হওয়ার পর কোনো পিন বা ওটিপি সেভ করা হবে না।"
          : language === 'hi'
          ? "ज़रूर! मैं आपको चरण दर चरण मार्गदर्शन करूँगा। कृपया अपने bKash ऐप का एक स्क्रीनशॉट अपलोड करें।\n\nनिश्चिंत रहें — इस बातचीत के बाद कोई PIN या OTP सहेजा नहीं जाएगा।"
          : "Sure! I will guide you step by step. Please upload a screenshot of your bKash app.\n\nRest assured — no PINs or OTPs will be saved after this conversation ends.";
        addMsg('ai', text);
        speak(text);
        return;
      }

      const r = getAIResponse(q, language);
      if (typeof r === 'object') {
        addMsg('ai', r.text, { audit: r.audit });
        speak(r.text);
      } else {
        addMsg('ai', r);
        speak(r);
      }
    }, delay);
  };

  const handleMic = () => {
    setIsListening(true);
    speak(t('Listening…','শুনছি…'));
    setTimeout(() => {
      setIsListening(false);
      setInput(t('How do I send a photo on WhatsApp?','WhatsApp-এ ছবি কীভাবে পাঠাবো?'));
    }, 2500);
  };

  const handleScreenshot = () => {
    addMsg('user', language==='bn' ? '[স্ক্রিনশট আপলোড করা হয়েছে]' : '[Screenshot Uploaded]', { isImage: true });
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      
      if (flowState === 'awaiting_screenshot') {
        setFlowState('idle');
        const text = language==='bn'
          ? "স্ক্রিনশট পেয়েছি! আপনি বিকাশ হোম স্ক্রিনে আছেন।\n\nধাপসমূহ:\n১. 'Send Money' তে চাপ দিন।\n২. যার কাছে পাঠাবেন তার নম্বর লিখুন।\n৩. পরিমাণ দিন।\n\nএগিয়ে যাওয়ার আগে আসুন চেক করি আপনি সব ঠিকঠাক করেছেন কিনা।"
          : "Screenshot received! I see you are on the bKash home screen.\n\nSteps:\n1. Tap 'Send Money'.\n2. Enter the recipient's number.\n3. Enter the amount.\n\nLet's review an audit before proceeding to check if you have done it right.";
        
        const audit = {
          type: 'transaction',
          action: language === 'bn' ? 'bKash এ টাকা পাঠানো' : language === 'hi' ? 'bKash से पैसे भेजें' : 'Send Money via bKash',
          details: [
            { label: language === 'bn' ? 'পরিমাণ' : language === 'hi' ? 'राशि' : 'Amount',         val: '---', safe: true },
            { label: language === 'bn' ? 'প্রাপক' : language === 'hi' ? 'प्রापक' : 'Recipient',      val: '---', safe: true },
            { label: language === 'bn' ? 'নিরাপত্তা' : language === 'hi' ? 'सुरक्षा जाँच' : 'Safety Check',
              val: language === 'bn' ? 'কোনো পিন সেভ হবে না' : language === 'hi' ? 'कोई PIN সে঵ নহীं হোगा' : 'No PINs will be saved', safe: true }
          ]
        };
        addMsg('ai', text, { audit });
        speak(text);
        return;
      }

      const r = SCREENSHOT_RESULT[language];
      addMsg('ai', r, { isScam:true });
      speak(r);
      addMemory({ title:t('Screenshot analysis','স্ক্রিনশট বিশ্লেষণ'), icon:'📸', category:'safety', starred:false, summary:r.slice(0,80) });
    }, 3500);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--warm-white)' }}>
      {/* Header */}
      <div style={{ padding:'20px 28px 16px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <img src="/logo.svg" alt="AI" style={{ width:48, height:48, borderRadius:13 }} className="anim-breathe"/>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:800, fontSize:20 }}>Guideia {t('AI Assistant','এআই অ্যাসিস্ট্যান্ট','AI सहायक')}</p>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8,height:8, borderRadius:'50%', background:'var(--success)' }}/>
            <p style={{ fontSize:14, color:'var(--success)', fontWeight:600 }}>{t('Online — always here to help','অনলাইন — সবসময় সাহায্যে','ऑनलाइन — हमेशा मदद के लिए')}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => speak(t('Hello. I am Guideia. How can I help you today?','হ্যালো। আমি গাইডিয়া। আপনাকে কীভাবে সাহায্য করতে পারি?','नमस्ते। मैं Guideia हूँ। आज आपकी कैसे मदद करूँ?'))}>
            <PlayCircle size={18}/> {t('Voice Intro','ভয়েস পরিচয়','वॉयस परिचय')}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16, maxWidth:'860px', width:'100%', margin:'0 auto', alignSelf:'stretch' }}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex anim-up ${msg.from==='user'?'justify-end':'items-end gap-10'}`}>
            {msg.from==='ai' && (
              <button onClick={() => speak(msg.text)} style={{ background:'var(--sage-light)', color:'var(--sage)', padding:9, borderRadius:'50%', flexShrink:0 }}>
                <PlayCircle size={19}/>
              </button>
            )}
            <div>
              <div className={msg.from==='ai'?'bubble-ai':'bubble-user'} style={msg.isScam ? { borderLeft:'4px solid var(--danger)', background:'var(--danger-light)', color:'var(--text-1)' } : {}}>
                {msg.isImage && (
                  <div style={{ width: 140, height: 180, background: 'var(--blue-light)', borderRadius: 'var(--r-sm)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                    <Camera size={32} opacity={0.5} />
                  </div>
                )}
                <p style={{ whiteSpace:'pre-wrap' }}>{msg.text}</p>
                {msg.audit && (
                  <div className="card anim-scale" style={{ marginTop:14, padding:16, border:'2px solid var(--border)' }}>
                    <p style={{ fontWeight:800, fontSize:15, color:'var(--text-2)', textTransform:'uppercase', marginBottom:12 }}>🔍 Safety Audit: {msg.audit.action}</p>
                    <div className="flex-col gap-10">
                      {msg.audit.details.map((d, i) => (
                        <div key={i} className="flex items-start gap-10" style={{ padding:'10px 12px', background:d.safe?'var(--success-light)':'var(--warn-light)', borderRadius:'var(--r-sm)' }}>
                           <span style={{ fontSize:18 }}>{d.safe ? '✅' : '⚠️'}</span>
                           <div>
                             <p style={{ fontSize:14, color:'var(--text-2)', fontWeight:700 }}>{d.label}: <span style={{ color:'var(--text-1)' }}>{d.val}</span></p>
                             {d.warn && <p className="t-tiny" style={{ color:'var(--warn)', fontWeight:700, marginTop:2 }}>{d.warn}</p>}
                           </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-primary btn-full btn-sm" style={{ marginTop:16 }} onClick={() => speak(language === 'bn' ? 'এগিয়ে যাচ্ছি' : 'Proceeding with action')}>
                      {language === 'bn' ? 'এগিয়ে যান' : 'Proceed Safely'}
                    </button>
                  </div>
                )}
              </div>
              <p className="t-tiny" style={{ marginTop:4, textAlign:msg.from==='user'?'right':'left' }}>{msg.time}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-end gap-10 anim-in">
            <div style={{ background:'var(--sage-light)', color:'var(--sage)', padding:9, borderRadius:'50%' }}><PlayCircle size={19}/></div>
            <div className="bubble-ai flex items-center gap-10">
              <div className="spinner" style={{ width:18, height:18, borderWidth:2 }}/>
              <p className="t-sub">{t('Guideia is typing…','গাইডিয়া লিখছে…','Guideia लिख रहा है…')}</p>
            </div>
          </div>
        )}
        {isAnalyzing && (
          <div className="bubble-ai flex items-center gap-10 anim-pulse">
            <div className="spinner" style={{ width:18, height:18, borderWidth:2 }}/>
            <p className="t-sub">{t('Analyzing screenshot safely…','নিরাপদে বিশ্লেষণ হচ্ছে…','स्क्रीनशॉट सुरक्षित रूप से विश्लेषण हो रहा है…')}</p>
          </div>
        )}
        {isListening && (
          <div className="bubble-ai flex-col gap-10 anim-in">
            <p style={{ fontWeight:700 }}>{t('Listening…','শুনছি…','सुन रहे हैं…')}</p>
            <div className="waveform">{[1,2,3,4,5].map(i=><div key={i} className="wave-bar"/>)}</div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:'10px 24px 24px', background:'var(--surface)', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:10, alignItems:'center', flexShrink:0 }}>
        
        {/* Suggestion Chips */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', maxWidth:860, width:'100%', margin:'0 auto', paddingBottom:8 }}>
          {[
            t('How can I send money through PayPal?', 'PayPal দিয়ে কীভাবে টাকা পাঠাব?', 'PayPal से पैसे कैसे भेजें?'),
            t('How to save a contact in WhatsApp', 'WhatsApp এ কন্টাক্ট কীভাবে সেভ করব', 'WhatsApp में संपर्क कैसे सहेजें'),
            t('Book a doctor appointment', 'ডাক্তার দেখাব কীভাবে?', 'डॉक्टर अपॉइंटमेंट कैसे बुक करें?')
          ].map((text, i) => (
            <button key={i} className="btn btn-sm btn-ghost" style={{ background:'var(--surface-2)', whiteSpace:'nowrap', fontSize:14 }}
              onClick={() => { setInput(text); setTimeout(handleSend, 100); }}>
              {text}
            </button>
          ))}
        </div>

        <div style={{ maxWidth:860, width:'100%', margin:'0 auto', display:'flex', gap:10, alignItems:'center' }}>
          <button onClick={handleScreenshot} className="btn btn-icon ic-blue icon-wrap iw-md" title={t('Upload screenshot','স্ক্রিনশট আপলোড')}>
            <Camera size={22}/>
          </button>
          <button onClick={handleMic} className={`btn btn-icon icon-wrap iw-md ${isListening?'ic-danger anim-pulse':'ic-sage'}`}>
            <Mic size={22}/>
          </button>
          <input className="input-field" style={{ flex:1, borderRadius:100 }}
            placeholder={t('Ask me anything…','যেকোনো কিছু জিজ্ঞাসা করুন…','कुछ भी पूछें…')}
            value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()}
          />
          <button onClick={handleSend} className="btn btn-primary btn-icon" disabled={!input.trim()}>
            <Send size={22}/>
          </button>
        </div>
      </div>
    </div>
  );
}
