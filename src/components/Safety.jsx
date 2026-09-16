import { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertTriangle, ChevronRight, ArrowLeft, Check, Search, X } from 'lucide-react';
import { SCAM_EXAMPLES } from '../data/hardcoded';
import VoiceGuide from './VoiceGuide';

const SEV_COLORS = { warning:'var(--warn)', high:'#f07050', critical:'var(--danger)' };
const SEV_BG = { warning:'var(--warn-light)', high:'#fde8e0', critical:'var(--danger-light)' };

// Maps the backend's severity enum to the same visual language used for
// the static examples below, so a live check and an example look consistent.
const LIVE_SEV = {
  SAFE: { label:'Looks Safe', color:'var(--success)', bg:'var(--success-light)' },
  WARNING: { label:'Warning', color:SEV_COLORS.warning, bg:SEV_BG.warning },
  HIGH_RISK: { label:'High Risk', color:SEV_COLORS.high, bg:SEV_BG.high },
  CRITICAL: { label:'Critical', color:SEV_COLORS.critical,bg:SEV_BG.critical },
};

function ScamChecker() {
  const { t, addMemory } = useApp();
  const { authedFetch, ApiError } = useAuth();
  const [contentType, setContentType] = useState('MESSAGE');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await authedFetch('/safety/analyze', { method: 'POST', body: { contentType, content } });
      setResult(data);
      if (data.severity !== 'SAFE') {
        addMemory({
          title: t('Checked a suspicious message', 'একটি সন্দেহজনক বার্তা পরীক্ষা করেছেন'),
          category: 'safety',
          starred: data.severity === 'CRITICAL',
          summary: data.whatLooksSuspicious[0] || content.slice(0, 100),
        });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't check that right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sev = result ? LIVE_SEV[result.severity] : null;
  const resultVoiceText = result
    ? [
        `${sev.label}.`,
        result.aiContext,
        result.whatLooksSuspicious.length ? `What looks suspicious. ${result.whatLooksSuspicious.join('. ')}.` : '',
        result.whatToDo.length ? `What to do. ${result.whatToDo.join('. ')}.` : '',
        result.whatToAvoid.length ? `What to avoid. ${result.whatToAvoid.join('. ')}.` : '',
      ].filter(Boolean).join(' ')
    : '';

  return (
    <div className="card anim-up" style={{ padding:20 }}>
      <p style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>{t('Check a Message or Link','একটি বার্তা বা লিংক পরীক্ষা করুন')}</p>
      <p className="t-sub" style={{ marginBottom:14 }}>{t('Paste a suspicious link, SMS, or message below to check it.','সন্দেহজনক লিংক, SMS বা বার্তা নিচে পেস্ট করুন।')}</p>

      <div className="segment" style={{ padding:3, marginBottom:12, width:'fit-content' }}>
        {['URL','SMS','MESSAGE'].map(ty => (
          <button key={ty} className={`seg-btn ${contentType===ty?'active':''}`} onClick={() => setContentType(ty)}>{ty}</button>
        ))}
      </div>

      <textarea
        className="input-field" rows={3} style={{ resize:'vertical', marginBottom:12 }}
        placeholder={t('Paste the message or link here…','এখানে বার্তা বা লিংক পেস্ট করুন…')}
        value={content} onChange={e => setContent(e.target.value)}
      />

      <button className="btn btn-primary btn-full" onClick={handleCheck} disabled={loading || !content.trim()}>
        {loading ? t('Checking…','পরীক্ষা করা হচ্ছে…') : (<><Search size={18}/> {t('Check for Danger','বিপদ পরীক্ষা করুন')}</>)}
      </button>

      {error && <p role="alert" style={{ color:'var(--danger)', fontWeight:600, marginTop:12 }}>{error}</p>}

      {result && (
        <div className="card anim-scale" style={{ marginTop:16, border:`2px solid ${sev.color}`, background:sev.bg }}>
          <div className="flex items-center gap-10" style={{ marginBottom:10 }}>
            <span className="badge" style={{ background:sev.color, color:'#fff', textTransform:'uppercase' }}>{sev.label}</span>
            <button className="btn btn-icon btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => setResult(null)}><X size={16}/></button>
          </div>

          {result.whatLooksSuspicious.length > 0 && (
            <div style={{ marginBottom:10 }}>
              <p style={{ fontWeight:700, marginBottom:6 }}>{t('What looks suspicious','কী সন্দেহজনক')}</p>
              {result.whatLooksSuspicious.map((r,i) => (
                <p key={i} className="t-sub" style={{ marginBottom:4 }}>• {r}</p>
              ))}
            </div>
          )}

          {result.aiContext && (
            <p className="t-sub" style={{ marginBottom:10, fontStyle:'italic' }}>{result.aiContext}</p>
          )}

          <div style={{ marginBottom:10 }}>
            <p style={{ fontWeight:700, marginBottom:6, color:'var(--success)' }}>{t('What to do','কী করবেন')}</p>
            {result.whatToDo.map((r,i) => <p key={i} className="t-sub" style={{ marginBottom:4 }}> {r}</p>)}
          </div>

          <div>
            <p style={{ fontWeight:700, marginBottom:6, color:'var(--danger)' }}>{t('What to avoid','কী এড়াবেন')}</p>
            {result.whatToAvoid.map((r,i) => <p key={i} className="t-sub" style={{ marginBottom:4 }}> {r}</p>)}
          </div>
          <VoiceGuide
            text={resultVoiceText}
            title={t('Listen to Safety Guidance', 'নিরাপত্তা গাইডেন্স শুনুন')}
            priority="safety"
          />
        </div>
      )}
    </div>
  );
}

function ScamDetail({ scam, onBack }) {
  const { t, speak, language, showToast, addMemory } = useApp();
  const [reported, setReported] = useState(false);
  const tips = scam.safetyTips[language] || scam.safetyTips.en;
  const col = SEV_COLORS[scam.severity];

  const handleReport = () => {
    setReported(true);
    speak(t('Good job! You reported this scam. Your guardian has been notified.', 'দারুণ কাজ! আপনি এই প্রতারণাটি রিপোর্ট করেছেন। আপনার গার্ডিয়ানকে জানানো হয়েছে।'));
    showToast(t('Scam reported. Guardian notified. ', 'স্ক্যাম রিপোর্ট করা হয়েছে। গার্ডিয়ান অবহিত। '), 'success');
    addMemory({ title: t('Recognized a scam!', 'একটি স্ক্যাম চিনেছেন!'), icon: '', category:'safety', starred:true, summary: scam.message.slice(0,60) });
  };

  return (
    <div className="flex-col" style={{ height:'100%' }}>
      <div style={{ padding:'20px 24px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <button onClick={onBack} className="btn btn-icon btn-ghost"><ArrowLeft size={22}/></button>
        <div className="flex items-center gap-10 flex-1">
          <div className="icon-wrap iw-sm" style={{ background:SEV_BG[scam.severity], color:col, borderRadius:8 }}>
            <Shield size={18}/>
          </div>
          <p style={{ fontWeight:800 }}>{scam.type}</p>
        </div>
        <span className="badge" style={{ background:SEV_BG[scam.severity], color:col, textTransform:'uppercase' }}>{scam.severity}</span>
      </div>

      <div className="page-scroll" style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
        {/* Message */}
        <div className="card" style={{ borderLeft:`5px solid ${col}`, background: SEV_BG[scam.severity] }}>
          <p style={{ fontWeight:700, marginBottom:8, color:col }}>{t(' Suspicious Message',' সন্দেহজনক বার্তা')}</p>
          <p style={{ fontStyle:'italic', fontSize:17, lineHeight:1.6, color:'var(--text-1)' }}>{scam.message}</p>
        </div>

        {/* Tactics */}
        <div className="card">
          <p style={{ fontWeight:800, fontSize:17, marginBottom:12 }}> {t('Why This Is Dangerous','কেন এটি বিপজ্জনক')}</p>
          {scam.tactics.map((tac,i) => (
            <div key={i} className="flex items-center gap-10" style={{ padding:'8px 0', borderBottom: i<scam.tactics.length-1?'1px solid var(--border)':'none' }}>
              <div className="icon-wrap iw-sm ic-danger" style={{ borderRadius:8, flexShrink:0 }}><AlertTriangle size={16}/></div>
              <p className="t-sub">{tac}</p>
            </div>
          ))}
        </div>

        {/* Safety Tips */}
        <div className="card">
          <p style={{ fontWeight:800, fontSize:17, marginBottom:12 }}> {t('How to Stay Safe','নিরাপদ থাকার উপায়')}</p>
          {tips.map((tip,i) => (
            <div key={i} className="flex items-start gap-10" style={{ padding:'8px 0', borderBottom: i<tips.length-1?'1px solid var(--border)':'none' }}>
              <div className="icon-wrap iw-sm ic-success" style={{ borderRadius:8, flexShrink:0, marginTop:2 }}><Check size={16}/></div>
              <p className="t-sub">{tip}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex-col gap-10">
          {!reported ? (
            <button className="btn btn-danger btn-full" onClick={handleReport}>
               {t('Report This Scam & Notify Guardian','এই স্ক্যাম রিপোর্ট করুন ও গার্ডিয়ানকে জানান')}
            </button>
          ) : (
            <div className="card" style={{ background:'var(--success-light)', textAlign:'center', padding:20 }}>
              <p style={{ fontWeight:800, fontSize:18, color:'var(--success)' }}> {t('Reported & Guardian Notified!','রিপোর্ট করা হয়েছে ও গার্ডিয়ান অবহিত!')}</p>
              <p className="t-sub">{t('You did the right thing. Well done!','আপনি সঠিক কাজ করেছেন। দারুণ!')}</p>
            </div>
          )}
          <button className="btn btn-ghost btn-full" onClick={onBack}>{t('← Back to Safety Center','← নিরাপত্তা কেন্দ্রে ফিরুন')}</button>
        </div>
      </div>
    </div>
  );
}

export default function Safety() {
  const { t, speak } = useApp();
  const [selected, setSelected] = useState(null);

  if (selected) return <ScamDetail scam={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="page-scroll">
      <div style={{ padding:'28px 24px 16px' }}>
        <div className="flex items-center gap-14 anim-up">
          <div className="icon-wrap iw-md ic-sage"><Shield size={26}/></div>
          <div>
            <h1 className="t-title">{t('Scam Protection Center','স্ক্যাম সুরক্ষা কেন্দ্র')}</h1>
            <p className="t-sub">{t('Learn to recognize dangerous messages.','বিপজ্জনক বার্তা চিনতে শিখুন।')}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'8px 24px 32px', display:'flex', flexDirection:'column', gap:14 }}>
        {/* Education Banner */}
        <div className="card anim-up d1" style={{ background:'linear-gradient(135deg,#1e2a35,#3a5068)', color:'#fff', padding:22 }}>
          <p style={{ fontWeight:800, fontSize:18, marginBottom:8 }}> {t('You Are Protected Here','আপনি এখানে সুরক্ষিত')}</p>
          <p style={{ opacity:0.85, fontSize:16 }}>{t('Browse these real scam examples to learn how to stay safe online. Knowledge is your best shield.','অনলাইনে নিরাপদ থাকতে এই আসল স্ক্যামের উদাহরণগুলো দেখুন। জ্ঞানই আপনার সেরা ঢাল।')}</p>
        </div>

        <ScamChecker/>

        <p style={{ fontWeight:800, fontSize:18, marginTop:4, color:'var(--text-2)' }}>{t('Common Scam Examples (for learning)','সাধারণ স্ক্যামের উদাহরণ (শেখার জন্য)')}</p>

        {SCAM_EXAMPLES.map((s,i) => {
          const col = SEV_COLORS[s.severity];
          return (
            <button key={s.id} className={`card card-btn flex items-center gap-16 anim-up d${i+2}`} onClick={() => { setSelected(s); speak(t(`Warning. ${s.type} detected.`, `সতর্কতা। ${s.type} শনাক্ত হয়েছে।`)); }} style={{ padding:18, borderLeft:`5px solid ${col}` }}>
              <div style={{ width:50, height:50, borderRadius:14, background:SEV_BG[s.severity], display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{s.icon}</div>
              <div style={{ flex:1, textAlign:'left' }}>
                <div className="flex items-center gap-8" style={{ marginBottom:4 }}>
                  <p style={{ fontWeight:800, fontSize:17 }}>{s.type}</p>
                  <span className="badge" style={{ background:SEV_BG[s.severity], color:col, fontSize:11 }}>{s.severity.toUpperCase()}</span>
                </div>
                <p className="t-tiny">{s.message.slice(0,55)}…</p>
              </div>
              <ChevronRight size={20} color="var(--text-3)"/>
            </button>
          );
        })}

        {/* Quick Tips */}
        <div className="card anim-up" style={{ marginTop:8 }}>
          <p style={{ fontWeight:800, fontSize:17, marginBottom:12 }}> {t('Golden Safety Rules','সোনালী নিরাপত্তা নিয়ম')}</p>
          {[
            t('Never share your PIN or OTP with anyone.','কাউকে আপনার পিন বা OTP দেবেন না।'),
            t('Real banks never call asking for codes.','আসল ব্যাংক কখনো ফোন করে কোড চায় না।'),
            t('If something feels urgent — wait and ask family.','কিছু জরুরি মনে হলে — অপেক্ষা করুন এবং পরিবারকে জিজ্ঞেস করুন।'),
            t('You cannot win a prize you never entered for.','আপনি যে প্রতিযোগিতায় অংশ নেননি সেখানে পুরস্কার পাবেন না।'),
          ].map((tip,i) => (
            <div key={i} className="flex items-start gap-10" style={{ padding:'9px 0', borderBottom:i<3?'1px solid var(--border)':'none' }}>
              <div className="icon-wrap iw-sm ic-success" style={{ borderRadius:8, flexShrink:0 }}><Check size={15}/></div>
              <p className="t-sub">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
