import { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { ArrowLeft, PlayCircle, ChevronRight, BookOpen, Check, Info } from 'lucide-react';
import AppLogo from './AppLogo';
import { TUTORIALS } from '../data/hardcoded';
import { BUTTON_GUIDES } from '../data/buttonGuides';
import VoiceGuide from './VoiceGuide';

// ── Color intensity helpers ──────────────────────────────────
const INTENSITY_MAP = {
  safe: { bg:'#dcfce7', border:'#16a34a', text:'#15803d', label:{en:'SAFE',bn:'নিরাপদ',hi:'सुरक्षित'}, dot:'#16a34a' },
  action: { bg:'#dbeafe', border:'#2563eb', text:'#1d4ed8', label:{en:'ACTION',bn:'অ্যাকশন',hi:'कार्रवाई'}, dot:'#2563eb' },
  danger: { bg:'#fee2e2', border:'#dc2626', text:'#b91c1c', label:{en:'DANGER',bn:'বিপদ',hi:'खतरा'}, dot:'#dc2626' },
  warn: { bg:'#ffedd5', border:'#ea580c', text:'#c2410c', label:{en:'CAUTION',bn:'সতর্কতা',hi:'सावधानी'}, dot:'#ea580c' },
  info: { bg:'#f3e8ff', border:'#7c3aed', text:'#6d28d9', label:{en:'INFO',bn:'তথ্য',hi:'जानकारी'}, dot:'#7c3aed' },
};

// App name → AppLogo key
const GUIDE_APP_KEY = {
  'WhatsApp':'whatsapp','Facebook':'facebook','Gmail':'gmail','bKash':'bkash',
  'Nagad':'nagad','Google Pay':'googlepay','PayPal':'paypal','Booking.com':'booking',
  'Practo':'practo','Amazon':'amazon'
};

// ── App Button Guide Viewer ──────────────────────────────────
function ButtonGuideViewer({ guide, onClose }) {
  const { t, speak, language } = useApp();
  const [active, setActive] = useState(null);

  return (
    <div className="flex-col" style={{ height:'100%' }}>
      {/* Header */}
      <div style={{ padding:'18px 24px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
        <button onClick={onClose} className="btn btn-icon btn-ghost"><ArrowLeft size={22}/></button>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:800, fontSize:18 }}>{guide.name} — {t('Button Guide','বাটন গাইড')}</p>
          <p className="t-tiny">{t('Tap any button to learn what it does','যেকোনো বাটনে চাপ দিয়ে জানুন')}</p>
        </div>
        <div style={{ width:36, height:36 }}><AppLogo app={GUIDE_APP_KEY[guide.name]||'whatsapp'} size={36} radius={8}/></div>
      </div>

      <div className="page-scroll" style={{ padding:20 }}>
        {/* Legend */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
          {Object.entries(INTENSITY_MAP).map(([key,val]) => (
            <span key={key} style={{ padding:'4px 10px', borderRadius:20, background:val.bg, color:val.text, fontWeight:700, fontSize:12, border:`1.5px solid ${val.border}` }}>
              ● {typeof val.label === 'string' ? val.label : (val.label[language] || val.label.en)}
            </span>
          ))}
        </div>

        {/* App image banner */}
        <div style={{ borderRadius:'var(--r-lg)', overflow:'hidden', marginBottom:20, height:160, position:'relative' }}>
          <img src={guide.image} alt={guide.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={e => { e.target.parentNode.style.background=guide.color; e.target.style.display='none'; }}/>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to right, ${guide.color}cc, transparent)` }}/>
          <div style={{ position:'absolute', top:16, left:16, color:'#fff' }}>
            <p style={{ fontWeight:900, fontSize:22 }}>{guide.name}</p>
            <p style={{ fontSize:13, opacity:0.9 }}>{guide.buttons.length} {t('buttons explained','টি বাটনের ব্যাখ্যা')}</p>
          </div>
        </div>

        {/* Button cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {guide.buttons.map((btn, i) => {
            const imap = INTENSITY_MAP[btn.intensity] || INTENSITY_MAP.info;
            const isOpen = active === i;
            return (
              <button key={i}
                onClick={() => { 
                  setActive(isOpen ? null : i); 
                  if (!isOpen) {
                    const l = typeof btn.label === 'string' ? btn.label : (btn.label[language] || btn.label.en);
                    const d = typeof btn.desc === 'string' ? btn.desc : (btn.desc[language] || btn.desc.en);
                    speak(l + '. ' + d); 
                  }
                }}
                style={{ textAlign:'left', padding:0, border:'none', background:'transparent', cursor:'pointer', width:'100%' }}>
                <div style={{ borderRadius:'var(--r-sm)', border:`2px solid ${isOpen ? imap.border : 'var(--border)'}`, background: isOpen ? imap.bg : 'var(--surface)', transition:'all 0.2s', overflow:'hidden' }}>
                  {/* Button row */}
                  <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
                    {/* Color circle */}
                    <div style={{ width:44, height:44, borderRadius:'50%', background:btn.color, color:'#fff', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 0 4px ${imap.bg}` }}>
                      {btn.icon}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>
                        {typeof btn.label === 'string' ? btn.label : (btn.label[language] || btn.label.en)}
                      </p>
                      <span style={{ padding:'2px 8px', borderRadius:12, background:imap.bg, color:imap.text, fontWeight:700, fontSize:11, border:`1px solid ${imap.border}` }}>
                        ● {typeof imap.label === 'string' ? imap.label : (imap.label[language] || imap.label.en)}
                      </span>
                    </div>
                    <div style={{ fontSize:18, color:'var(--text-3)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition:'transform 0.2s' }}>›</div>
                  </div>
                  {/* Expanded desc */}
                  {isOpen && (
                    <div style={{ padding:'0 16px 16px 74px', borderTop:`1px solid ${imap.border}30` }}>
                      <p style={{ fontSize:15, lineHeight:1.6, color:'var(--text-1)', paddingTop:10 }}>
                        {typeof btn.desc === 'string' ? btn.desc : (btn.desc[language] || btn.desc.en)}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding:'12px 20px', background:'var(--surface)', borderTop:'1px solid var(--border)', flexShrink:0 }}>
        <button className="btn btn-primary btn-full" onClick={onClose}>
          {t('← Back to Lessons','← পাঠে ফিরুন')}
        </button>
      </div>
    </div>
  );
}

// ── Tutorial Player ──────────────────────────────────────────
function TutorialPlayer({ tut, onClose, onComplete }) {
  const { language, t, addMemory, voiceAutoPlay, voiceControls } = useApp();
  const [step, setStep] = useState(0);
  const steps = tut.steps[language] || tut.steps.en;
  const done = step >= steps.length;
  const title = localizedTutorialTitle(tut, language, t);
  const level = localizedTutorialLevel(tut, language, t);

  const STEP_ICONS = ['','','⌨','','','','','','',''];

  const handleNext = () => { if (done) return; voiceControls.stop(); setStep(s => s+1); };
  const handleComplete = () => {
    addMemory({ title, category:'learning', starred:false, summary: steps[steps.length-1] });
    onComplete();
  };

  return (
    <div className="flex-col" style={{ height:'100%' }}>
      <div style={{ padding:'20px 24px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <button onClick={onClose} className="btn btn-icon btn-ghost"><ArrowLeft size={22}/></button>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:800, fontSize:17 }}>{title}</p>
          <p className="t-tiny">{t('Step','ধাপ')} {Math.min(step+1, steps.length)} {t('of','/')} {steps.length}</p>
        </div>
        <span className="badge badge-blue">{level}</span>
      </div>

      <div className="page-scroll" style={{ padding:24, flex:1 }}>
        <div className="progress-track" style={{ marginBottom:20 }}>
          <div className="progress-fill" style={{ width:`${(step/steps.length)*100}%` }} />
        </div>

        {!done ? (
          <>
            <div className="card anim-scale" style={{ background:'linear-gradient(135deg,var(--blue-light),var(--teal-light))', marginBottom:20, padding:28, textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>{STEP_ICONS[step % STEP_ICONS.length]}</div>
              <p style={{ fontWeight:700, fontSize:20, marginBottom:12 }}>
                {t('Step','ধাপ')} {step+1}: {steps[step]}
              </p>
              <VoiceGuide
                text={steps[step]}
                title={t('Voice Guidance', 'ভয়েস গাইডেন্স')}
                autoPlay={voiceAutoPlay}
                priority="lesson"
              />
            </div>
            <div className="flex-col gap-12">
              {steps.slice(0, step).map((s,i) => (
                <div key={i} className="flex items-center gap-12" style={{ padding:'12px 16px', background:'var(--surface)', borderRadius:'var(--r-sm)', opacity:0.7 }}>
                  <div className="icon-wrap iw-sm ic-success"><Check size={16}/></div>
                  <p className="t-sub" style={{ fontSize:15 }}>{s}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="card text-center anim-scale" style={{ padding:40 }}>
            <div style={{ fontSize:64, marginBottom:16 }}></div>
            <h2 className="t-title" style={{ color:'var(--success)', marginBottom:12 }}>{t('Wonderful!','চমৎকার!')}</h2>
            <p className="t-body">{t('You completed this lesson safely!','আপনি এই পাঠটি নিরাপদে সম্পন্ন করেছেন!')}</p>
          </div>
        )}
      </div>

      <div style={{ padding:'16px 24px 28px', background:'var(--surface)', borderTop:'1px solid var(--border)', flexShrink:0 }}>
        {!done ? (
          <button className="btn btn-primary btn-full btn-lg" onClick={handleNext}>
            <PlayCircle size={22}/> {t('Continue','চালিয়ে যান')}
          </button>
        ) : (
          <button className="btn btn-success btn-full btn-lg" onClick={handleComplete}>
            <Check size={22}/> {t('Save to Memory Book & Finish','স্মৃতির বইতে সংরক্ষণ করুন')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── APP KEY MAP for Button Guides ────────────────────────────
const APP_GUIDE_MAP = {
  messaging: ['whatsapp', 'facebook', 'gmail'],
  banking: ['bkash', 'nagad', 'googlepay', 'paypal'],
  shopping: ['amazon'],
  health: ['practo'],
  travel: ['booking'],
};

const TUTORIAL_COPY = {
  tut1: { title: ['Send a WhatsApp Message', 'WhatsApp মেসেজ পাঠান', 'WhatsApp संदेश भेजें'], level: ['Beginner', 'শুরু', 'शुरुआती'] },
  tut2: { title: ['Send a Photo on WhatsApp', 'WhatsApp-এ ছবি পাঠান', 'WhatsApp पर फोटो भेजें'], level: ['Beginner', 'শুরু', 'शुरुआती'] },
  tut3: { title: ['Make a Video Call', 'ভিডিও কল করুন', 'वीडियो कॉल करें'], level: ['Intermediate', 'মাঝারি', 'मध्यम'] },
  tut4: { title: ['Send Money on bKash Safely', 'bKash-এ নিরাপদে টাকা পাঠান', 'bKash से सुरक्षित पैसे भेजें'], level: ['Intermediate', 'মাঝারি', 'मध्यम'] },
  tut_gp: { title: ['Pay using Google Pay', 'Google Pay দিয়ে পেমেন্ট করুন', 'Google Pay से भुगतान करें'], level: ['Intermediate', 'মাঝারি', 'मध्यम'] },
  tut_amz: { title: ['Order Safely on Amazon', 'Amazon-এ নিরাপদে অর্ডার করুন', 'Amazon पर सुरक्षित ऑर्डर करें'], level: ['Beginner', 'শুরু', 'शुरुआती'] },
  tut_prac: { title: ['Book a Doctor Online', 'অনলাইনে ডাক্তার বুক করুন', 'ऑनलाइन डॉक्टर बुक करें'], level: ['Beginner', 'শুরু', 'शुरुआती'] },
  tut_book: { title: ['Find a Safe Hotel', 'নিরাপদ হোটেল খুঁজুন', 'सुरक्षित होटल खोजें'], level: ['Intermediate', 'মাঝারি', 'मध्यम'] },
  tut5: { title: ['Recognizing Scam Messages', 'স্ক্যাম মেসেজ চিনুন', 'स्कैम संदेश पहचानें'], level: ['Beginner', 'শুরু', 'शुरुआती'] },
};

function localizedTutorialTitle(tut, language, t) {
  if (language === 'bn' && tut.titleBn) return tut.titleBn;
  if (language === 'hi' && tut.titleHi) return tut.titleHi;
  const copy = TUTORIAL_COPY[tut.id]?.title;
  return copy ? t(...copy) : tut.title;
}

function localizedTutorialLevel(tut, language, t) {
  if (language === 'bn' && tut.levelBn) return tut.levelBn;
  if (language === 'hi' && tut.levelHi) return tut.levelHi;
  const copy = TUTORIAL_COPY[tut.id]?.level;
  return copy ? t(...copy) : tut.level;
}

// ── Main Learn Component ────────────────────────────────────
export default function Learn() {
  const { t, speak, language } = useApp();
  const [activeTut, setActiveTut] = useState(null);
  const [activeGuide, setActiveGuide] = useState(null);
  const [completed, setCompleted] = useState(['tut1','tut2','tut5']);

  if (activeTut) return <TutorialPlayer tut={activeTut} onClose={() => setActiveTut(null)} onComplete={() => { setCompleted(p=>[...p,activeTut.id]); setActiveTut(null); }} />;
  if (activeGuide) return <ButtonGuideViewer guide={activeGuide} onClose={() => setActiveGuide(null)} />;

  const groups = [
    { label: t(' Messaging',' মেসেজিং'), key:'messaging', color:'#25D366', app:'whatsapp' },
    { label: t(' Banking',' ব্যাংকিং'), key:'banking', color:'#E2136E', app:'bkash' },
    { label: t(' Shopping',' শপিং'), key:'shopping', color:'#f3a847', app:'amazon' },
    { label: t(' Health',' স্বাস্থ্য'), key:'health', color:'#14BEF0', app:'practo' },
    { label: t(' Travel',' ভ্রমণ'), key:'travel', color:'#003580', app:'booking' },
    { label: t(' Online Safety',' অনলাইন নিরাপত্তা'), key:'safety', color:'var(--success)', app:null },
  ];

  return (
    <div className="page-scroll">
      <div style={{ padding:'28px 24px 16px' }}>
        <h1 className="t-title anim-up">{t('Learn New Skills','নতুন দক্ষতা শিখুন')}</h1>
        <p className="t-sub anim-up d1">{t('Take your time. Every lesson is at your own pace.','ধীরে সুস্থে করুন। প্রতিটি পাঠ আপনার নিজের গতিতে।')}</p>
      </div>

      <div style={{ padding:'0 24px 32px' }}>
        {groups.map(grp => {
          const tuts = TUTORIALS[grp.key] || [];
          const guideKeys = APP_GUIDE_MAP[grp.key] || [];
          const guides = guideKeys.map(k => BUTTON_GUIDES[k]).filter(Boolean);

          return (
            <div key={grp.key} style={{ marginBottom:32 }}>
              {/* Group header */}
              <div className="flex items-center gap-12" style={{ marginBottom:14 }}>
                {grp.app && <AppLogo app={grp.app} size={32} radius={8}/>}
                <div style={{ width:4, height:22, borderRadius:2, background:grp.color }}/>
                <p style={{ fontWeight:800, fontSize:18 }}>{grp.label}</p>
              </div>

              {/* Button Guide Cards (horizontal scroll) */}
              {guides.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--text-3)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                    <Info size={14}/> {t('App Button Guides:','অ্যাপ বাটন গাইড:')}
                  </p>
                  <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8 }}>
                    {guides.map(g => (
                      <button key={g.name} onClick={() => setActiveGuide(g)}
                        style={{ flexShrink:0, borderRadius:'var(--r-sm)', border:`2px solid ${g.color}40`, background:`${g.color}10`, padding:'10px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:10, minWidth:160 }}>
                        <div style={{ width:32, height:32 }}><AppLogo app={GUIDE_APP_KEY[g.name]||'whatsapp'} size={32} radius={8}/></div>
                        <div style={{ textAlign:'left' }}>
                          <p style={{ fontWeight:700, fontSize:13, color:g.color }}>{g.name}</p>
                          <p style={{ fontSize:11, color:'var(--text-3)' }}>{g.buttons.length} {t('buttons','বাটন')}</p>
                        </div>
                        <span style={{ fontSize:16, color:g.color }}>›</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tutorial list */}
              {tuts.map((tut, i) => {
                const done = completed.includes(tut.id);
                const title = localizedTutorialTitle(tut, language, t);
                const level = localizedTutorialLevel(tut, language, t);
                return (
                  <button key={tut.id} className={`card card-btn flex items-center gap-16 anim-up d${i+1}`}
                    onClick={() => { setActiveTut(tut); speak(t(`Starting: ${tut.title}`,`শুরু হচ্ছে: ${tut.title}`)); }}
                    style={{ marginBottom:12, borderLeft:`4px solid ${done?'var(--success)':grp.color}`, padding:18 }}>
                    <div className="icon-wrap iw-md" style={{ background:done?'var(--success-light)':'var(--blue-light)', color:done?'var(--success)':grp.color }}>
                      {done ? <Check size={24}/> : <BookOpen size={24}/>}
                    </div>
                    <div style={{ flex:1, textAlign:'left' }}>
                      <p style={{ fontWeight:700, fontSize:17 }}>{title}</p>
                      <div className="flex items-center gap-8" style={{ marginTop:4 }}>
                        <span className="badge" style={{ background:done?'var(--success-light)':'var(--blue-light)', color:done?'var(--success)':'var(--blue-dark)' }}>
                          {done ? t(' Completed',' সম্পন্ন') : tut.level}
                        </span>
                        <span className="t-tiny">⏱ {tut.duration}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} color="var(--text-3)"/>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
