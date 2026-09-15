import { useState, useEffect } from 'react';
import { useApp } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { Check, Award, ShieldCheck, BookOpen, Search, HeartHandshake, Flame } from 'lucide-react';
import GuidiaLoadingState from './ui/GuidiaLoadingState';

// Achievements are computed from real counts returned by GET /api/progress/me
// — not a hardcoded earned/not-earned table. Each entry defines the
// condition that earns it.
const ACHIEVEMENT_DEFS = [
  { id:'a1', icon:<Award size={26}/>, title:'First Lesson', titleBn:'প্রথম পাঠ', desc:'Complete your first lesson', descBn:'আপনার প্রথম পাঠ সম্পন্ন করুন', earned:(p) => p.lessonsCompleted >= 1 },
  { id:'a2', icon:<ShieldCheck size={26}/>, title:'Scam Spotter', titleBn:'স্ক্যাম শনাক্তকারী', desc:'Correctly flag a risky message', descBn:'একটি ঝুঁকিপূর্ণ বার্তা চিহ্নিত করুন', earned:(p) => p.scamsRecognized >= 1 },
  { id:'a3', icon:<BookOpen size={26}/>, title:'Dedicated Learner', titleBn:'নিবেদিত শিক্ষার্থী', desc:'Complete 3 lessons', descBn:'৩টি পাঠ সম্পন্ন করুন', earned:(p) => p.lessonsCompleted >= 3 },
  { id:'a4', icon:<Search size={26}/>, title:'Safety Checker', titleBn:'নিরাপত্তা পরীক্ষক', desc:'Check 3 messages for safety', descBn:'৩টি বার্তা নিরাপত্তার জন্য যাচাই করুন', earned:(p) => p.scamsChecked >= 3 },
  { id:'a5', icon:<HeartHandshake size={26}/>, title:'Safety-Minded', titleBn:'নিরাপত্তা সচেতন', desc:'Use the Safety Net before a sensitive action', descBn:'সংবেদনশীল কাজের আগে নিরাপত্তা প্যানেল ব্যবহার করুন', earned:(p) => p.safetyInterceptions >= 1 },
  { id:'a6', icon:<Flame size={26}/>, title:'Multi-Day Learner', titleBn:'একাধিক দিনের শিক্ষার্থী', desc:'Be active across 3 different days', descBn:'৩টি ভিন্ন দিনে সক্রিয় থাকুন', earned:(p) => p.activeDays >= 3 },
];

function Meter({ label, value, color }) {
  return (
    <div style={{ textAlign:'center', flex:1, minWidth:120 }}>
      <div style={{ position:'relative', width:110, height:110, margin:'0 auto 10px' }}>
        <svg viewBox="0 0 110 110" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="55" cy="55" r="46" fill="none" stroke="var(--border)" strokeWidth="11"/>
          <circle cx="55" cy="55" r="46" fill="none" stroke={color} strokeWidth="11"
            strokeDasharray={`${2*Math.PI*46*value/100} 999`} style={{ transition:'stroke-dasharray 1.2s ease' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <p style={{ fontWeight:900, fontSize:26, color }}>{value}%</p>
        </div>
      </div>
      <p style={{ fontWeight:700, fontSize:15, color:'var(--text-2)' }}>{label}</p>
    </div>
  );
}

export default function ProgressDashboard() {
  const { memoryEntries, language, t, speak } = useApp();
  const { authedFetch } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authedFetch('/progress/me')
      .then(({ progress: p }) => { if (!cancelled) setProgress(p); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authedFetch]);

  if (loading || !progress) {
    return <GuidiaLoadingState/>;
  }

  const earnedCount = ACHIEVEMENT_DEFS.filter(a => a.earned(progress)).length;
  const recentLessons = memoryEntries.filter(m => m.category === 'learning').slice(0, 5);

  return (
    <div>
      <div className="section-header">
        <h1 className="t-title anim-up">{t('My Progress','আমার অগ্রগতি')}</h1>
        <p className="t-sub anim-up d1" style={{ marginTop:8 }}>{t('Every lesson makes you stronger. You\'re doing wonderfully!','প্রতিটি পাঠ আপনাকে আরও শক্তিশালী করে। আপনি দারুণ করছেন!')}</p>
        <div className="section-divider"/>
      </div>

      {/* Confidence & Competence — kept as two separate numbers, not blended */}
      <div className="card anim-up" style={{ background:'linear-gradient(135deg,var(--blue-light),var(--teal-light))', marginBottom:24, padding:28 }}>
        <div className="flex items-center" style={{ justifyContent:'center', flexWrap:'wrap', gap:24, marginBottom:20 }}>
          <Meter label={t('Confidence','আত্মবিশ্বাস')} value={progress.confidence} color="var(--blue)"/>
          <Meter label={t('Competence','দক্ষতা')} value={progress.competence} color="var(--sage)"/>
        </div>
        <p className="t-tiny" style={{ textAlign:'center', maxWidth:420, margin:'0 auto' }}>
          {t(
            'Confidence reflects how comfortable you currently feel. Competence reflects what you have actually completed — lessons, safety checks, and more.',
            'আত্মবিশ্বাস বর্তমানে আপনি কতটা স্বাচ্ছন্দ্য বোধ করছেন তা প্রতিফলিত করে। দক্ষতা আপনি প্রকৃতপক্ষে কী সম্পন্ন করেছেন তা প্রতিফলিত করে।'
          )}
        </p>
        <div className="flex items-center gap-16" style={{ justifyContent:'center', flexWrap:'wrap', marginTop:20 }}>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontWeight:800, fontSize:24, color:'var(--blue)' }}>{progress.lessonsCompleted}</p>
            <p className="t-tiny">{t('Lessons Done','পাঠ সম্পন্ন')}</p>
          </div>
          <div style={{ width:1, height:36, background:'var(--border)' }}/>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontWeight:800, fontSize:24, color:'var(--warn)' }}>{progress.activeDays}</p>
            <p className="t-tiny">{t('Active Days','সক্রিয় দিন')}</p>
          </div>
          <div style={{ width:1, height:36, background:'var(--border)' }}/>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontWeight:800, fontSize:24, color:'var(--success)' }}>{earnedCount}</p>
            <p className="t-tiny">{t('Achievements','পুরস্কার')}</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card anim-up d2" style={{ marginBottom:24 }}>
        <h2 className="t-head" style={{ marginBottom:20 }}> {t('Achievements','অর্জন')} <span className="badge badge-blue" style={{ marginLeft:8 }}>{earnedCount}/{ACHIEVEMENT_DEFS.length}</span></h2>
        <div className="grid-3" style={{ gap:14 }}>
          {ACHIEVEMENT_DEFS.map(a => {
            const earned = a.earned(progress);
            return (
              <div key={a.id} className="card" style={{ padding:16, textAlign:'center', background: earned?'var(--success-light)':'var(--surface-2)', border: earned?'2px solid var(--success)':'2px solid var(--border)', opacity:earned?1:0.55 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>{a.icon}</div>
                <p style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>{language==='bn'?a.titleBn:a.title}</p>
                <p style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.4 }}>{language==='bn'?a.descBn:a.desc}</p>
                {earned && <div className="flex items-center gap-4 justify-center" style={{ marginTop:8 }}>
                  <Check size={14} color="var(--success)"/><p style={{ fontSize:12, color:'var(--success)', fontWeight:700 }}>{t('Earned','অর্জিত')}</p>
                </div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Lessons — real Memory Book entries, not static content */}
      <div className="card anim-up d3">
        <h2 className="t-head" style={{ marginBottom:16 }}> {t('Recent Lessons','সাম্প্রতিক পাঠ')}</h2>
        {recentLessons.length === 0 ? (
          <p className="t-sub">{t('Complete a lesson to see it here.','এখানে দেখতে একটি পাঠ সম্পন্ন করুন।')}</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {recentLessons.map((l) => (
              <div key={l.id} className="flex items-center gap-14" style={{ padding:'12px 16px', background:'var(--surface-2)', borderRadius:'var(--r-sm)' }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700, fontSize:16 }}>{l.title}</p>
                  <p className="t-tiny">{l.date}</p>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => speak(`${l.title}. ${l.summary}`)}>{t('Replay','পুনরায়')}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
