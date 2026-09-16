import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppStateContext';
import { Globe, Smile, HelpCircle, Heart, ArrowRight, ChevronRight } from 'lucide-react';
import GuidiaLogo from './GuidiaLogo';

const LANGUAGES = [
  { id:'en', label:'English',  sub:'Continue in English',       flag:'EN' },
  { id:'bn', label:'বাংলা',    sub:'বাংলায় চালিয়ে যান',          flag:'বাং' },
  { id:'hi', label:'हिन्दी',   sub:'हिन्दी में जारी रखें',        flag:'हि' },
];

const MODES = [
  { id:'calm',   Icon:Smile,       border:'#2563eb', color:'var(--blue)',
    en:{label:'Confident',  desc:'I am comfortable and ready to learn.'},
    bn:{label:'আত্মবিশ্বাসী', desc:'আমি প্রস্তুত এবং শিখতে চাই।'},
    hi:{label:'आत्मविश्वासी', desc:'मैं तैयार हूँ और सीखना चाहता हूँ।'} },
  { id:'unsure', Icon:HelpCircle, border:'#0891b2', color:'var(--teal)',
    en:{label:'Unsure',     desc:'I need some guidance and patience.'},
    bn:{label:'নিশ্চিত নই',  desc:'আমার কিছুটা সাহায্য দরকার।'},
    hi:{label:'अनिश्चित',    desc:'मुझे थोड़ी मदद और धैर्य चाहिए।'} },
  { id:'scared', Icon:Heart,      border:'#059669', color:'var(--sage)',
    en:{label:'Nervous',    desc:'Please go very slowly, step by step.'},
    bn:{label:'নার্ভাস',     desc:'অনুগ্রহ করে ধীরে ধীরে সাহায্য করুন।'},
    hi:{label:'घबराया हुआ', desc:'कृपया बहुत धीरे-धीरे मार्गदर्शन करें।'} },
];

export default function Onboarding() {
  const { setMode, setLanguage, language, t, persistPreferences } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState('language');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const finishOnboarding = async (modeId) => {
    if (saving) return;
    setSaving(true);
    setError('');
    setMode(modeId);
    try {
      await persistPreferences({
        preferredLanguage: language,
        cognitiveState: modeId.toUpperCase(),
        onboardingDone: true,
      });
      navigate('/app/home', { replace: true });
    } catch (err) {
      setError(err.message || t('We could not save your setup. Please try again.', 'আপনার সেটআপ সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:36 }}>
        <GuidiaLogo size={64} style={{ margin:'0 auto 20px', boxShadow:'var(--sh-md)' }} />
        <h1 style={{ fontWeight:900, fontSize:26, letterSpacing:'-0.02em' }}>Welcome to Guidia</h1>
        <p style={{ color:'var(--text-2)', marginTop:6, fontSize:15 }}>Your trusted digital companion</p>
      </div>

      {step === 'language' && (
        <div className="anim-up">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--blue-light)', color:'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Globe size={18}/>
            </div>
            <div>
              <p style={{ fontWeight:700, fontSize:17 }}>Select your language</p>
              <p style={{ color:'var(--text-2)', fontSize:13 }}>আপনার ভাষা বেছে নিন · अपनी भाषा चुनें</p>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {LANGUAGES.map(lang => (
              <button key={lang.id}
                onClick={() => { setLanguage(lang.id); setStep('mode'); }}
                style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:'var(--surface)', border:'2px solid var(--border)', borderRadius:'var(--r-sm)', cursor:'pointer', textAlign:'left', transition:'all var(--tr)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--blue)'; e.currentTarget.style.background='var(--blue-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)'; }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:'var(--text-2)', flexShrink:0 }}>
                  {lang.flag}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700, fontSize:17 }}>{lang.label}</p>
                  <p style={{ color:'var(--text-2)', fontSize:13 }}>{lang.sub}</p>
                </div>
                <ChevronRight size={18} color="var(--text-3)"/>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'mode' && (
        <div className="anim-up">
          <div style={{ marginBottom:24 }}>
            <p style={{ fontWeight:700, fontSize:17, marginBottom:4 }}>
              {t('How are you feeling today?', 'আজ আপনি কেমন অনুভব করছেন?', 'आज आप कैसा महसूस कर रहे हैं?')}
            </p>
            <p style={{ color:'var(--text-2)', fontSize:14 }}>
              {t('This helps us adapt the app to your comfort level.', 'এটি আপনার জন্য অ্যাপটি মানানসই করতে সাহায্য করে।', 'यह हमें ऐप को आपके अनुसार ढालने में मदद करता है।')}
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {MODES.map(m => {
              const ldata = language === 'bn' ? m.bn : language === 'hi' ? m.hi : m.en;
              return (
                <button key={m.id}
                  onClick={() => finishOnboarding(m.id)}
                  disabled={saving}
                  style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px', background:'var(--surface)', border:`2px solid var(--border)`, borderRadius:'var(--r-sm)', cursor:'pointer', textAlign:'left', borderLeft:`4px solid ${m.border}`, transition:'all var(--tr)' }}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--surface-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--surface)'; }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${m.border}18`, color:m.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <m.Icon size={24}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, fontSize:17, marginBottom:2 }}>{ldata.label}</p>
                    <p style={{ color:'var(--text-2)', fontSize:14 }}>{ldata.desc}</p>
                  </div>
                  <ArrowRight size={18} color="var(--text-3)"/>
                </button>
              );
            })}
          </div>
          {saving && <p className="t-sub" style={{ marginTop:14 }}>{t('Saving your setup...', 'আপনার সেটআপ সংরক্ষণ হচ্ছে...', 'आपका सेटअप सहेजा जा रहा है...')}</p>}
          {error && <p role="alert" style={{ marginTop:14, color:'var(--danger)', fontWeight:700 }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
