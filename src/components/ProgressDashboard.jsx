import React from 'react';
import { useApp } from '../context/AppStateContext';
import { TrendingUp, Award, Flame, Star, BookOpen, Check } from 'lucide-react';
import { PROGRESS_CATEGORIES } from '../data/hardcoded';

const ACHIEVEMENTS = [
  { id:'a1', icon:'🏆', title:'First Lesson',    titleBn:'প্রথম পাঠ',    desc:'Completed your very first lesson',        descBn:'আপনার প্রথম পাঠ সম্পন্ন হয়েছে',       earned:true  },
  { id:'a2', icon:'🛡️', title:'Scam Spotter',   titleBn:'স্ক্যাম শনাক্তকারী', desc:'Correctly identified a scam message',   descBn:'একটি স্ক্যাম মেসেজ সঠিকভাবে চিহ্নিত', earned:true  },
  { id:'a3', icon:'💬', title:'Chat Master',     titleBn:'চ্যাট মাস্টার',  desc:'Sent 5 practice messages on WhatsApp',    descBn:'WhatsApp-এ ৫টি অনুশীলন মেসেজ পাঠান',  earned:true  },
  { id:'a4', icon:'💳', title:'Safe Banker',     titleBn:'নিরাপদ ব্যাংকার', desc:'Completed the bKash safety lesson',      descBn:'bKash নিরাপত্তা পাঠ সম্পন্ন',          earned:false },
  { id:'a5', icon:'📸', title:'Screenshot Pro',  titleBn:'স্ক্রিনশট প্রো', desc:'Analyzed 3 screenshots with AI',         descBn:'এআই দিয়ে ৩টি স্ক্রিনশট বিশ্লেষণ',     earned:false },
  { id:'a6', icon:'🔥', title:'7-Day Streak',    titleBn:'৭ দিনের ধারা',   desc:'Practiced every day for a week',          descBn:'এক সপ্তাহ প্রতিদিন অনুশীলন করেছেন',   earned:false },
];

const RECENT_LESSONS = [
  { icon:'💬', title:'Send a WhatsApp Message',    titleBn:'WhatsApp-এ মেসেজ পাঠান', date:'Today',     cat:'messaging', pct:100 },
  { icon:'📸', title:'Send a Photo on WhatsApp',   titleBn:'WhatsApp-এ ছবি পাঠান',    date:'Yesterday', cat:'messaging', pct:100 },
  { icon:'🛡️', title:'Recognizing Scam Messages', titleBn:'স্ক্যাম মেসেজ চিনুন',      date:'3 days ago', cat:'safety',  pct:100 },
  { icon:'💳', title:'Send Money on bKash Safely', titleBn:'bKash-এ নিরাপদে টাকা পাঠান', date:'Last week', cat:'banking', pct:35 },
];

export default function ProgressDashboard() {
  const { progress, language, t, speak } = useApp();
  const totalProgress = Math.round(Object.values(progress).reduce((a,b)=>a+b,0)/Object.values(progress).length);
  const earnedCount = ACHIEVEMENTS.filter(a=>a.earned).length;

  const meterColor = totalProgress < 30 ? 'var(--danger)' : totalProgress < 60 ? 'var(--warn)' : 'var(--success)';
  const meterLabel = totalProgress < 30 ? t('Just Starting','সবে শুরু') : totalProgress < 60 ? t('Growing Confidence','আত্মবিশ্বাস বাড়ছে') : t('Confident Learner','আত্মবিশ্বাসী শিক্ষার্থী');

  return (
    <div>
      <div className="section-header">
        <h1 className="t-title anim-up">{t('My Progress','আমার অগ্রগতি')}</h1>
        <p className="t-sub anim-up d1" style={{ marginTop:8 }}>{t('Every lesson makes you stronger. You\'re doing wonderfully!','প্রতিটি পাঠ আপনাকে আরও শক্তিশালী করে। আপনি দারুণ করছেন!')}</p>
        <div className="section-divider"/>
      </div>

      {/* Confidence Meter */}
      <div className="card anim-up" style={{ background:'linear-gradient(135deg,var(--blue-light),var(--teal-light))', marginBottom:24, padding:28, textAlign:'center' }}>
        <p style={{ fontWeight:700, fontSize:16, color:'var(--text-2)', marginBottom:12 }}>{t('Overall Confidence Level','সামগ্রিক আত্মবিশ্বাসের স্তর')}</p>
        <div style={{ position:'relative', width:160, height:160, margin:'0 auto 16px' }}>
          <svg viewBox="0 0 160 160" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r="66" fill="none" stroke="var(--border)" strokeWidth="14"/>
            <circle cx="80" cy="80" r="66" fill="none" stroke={meterColor} strokeWidth="14"
              strokeDasharray={`${2*Math.PI*66*totalProgress/100} 999`}
              style={{ transition:'stroke-dasharray 1.2s ease' }}/>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <p style={{ fontWeight:900, fontSize:38, color:meterColor, lineHeight:1 }}>{totalProgress}%</p>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--text-3)' }}>{meterLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-16" style={{ justifyContent:'center', flexWrap:'wrap' }}>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontWeight:800, fontSize:24, color:'var(--blue)' }}>3</p>
            <p className="t-tiny">{t('Lessons Done','পাঠ সম্পন্ন')}</p>
          </div>
          <div style={{ width:1, height:36, background:'var(--border)' }}/>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontWeight:800, fontSize:24, color:'var(--warn)' }}>🔥 4</p>
            <p className="t-tiny">{t('Day Streak','দিনের ধারা')}</p>
          </div>
          <div style={{ width:1, height:36, background:'var(--border)' }}/>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontWeight:800, fontSize:24, color:'var(--success)' }}>{earnedCount}</p>
            <p className="t-tiny">{t('Achievements','পুরস্কার')}</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card anim-up d1" style={{ marginBottom:24 }}>
        <h2 className="t-head" style={{ marginBottom:20 }}>{t('Skills Progress','দক্ষতার অগ্রগতি')}</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {PROGRESS_CATEGORIES.map(cat => {
            const pct = progress[cat.id] || 0;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between" style={{ marginBottom:6 }}>
                  <div className="flex items-center gap-10">
                    <span style={{ fontSize:20 }}>{cat.icon}</span>
                    <p style={{ fontWeight:700, fontSize:17 }}>{cat.label[language] || cat.label.en}</p>
                  </div>
                  <span className="badge" style={{ background:cat.color+'22', color:cat.color }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width:`${pct}%`, background:cat.color }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="card anim-up d2" style={{ marginBottom:24 }}>
        <h2 className="t-head" style={{ marginBottom:20 }}>🏆 {t('Achievements','অর্জন')} <span className="badge badge-blue" style={{ marginLeft:8 }}>{earnedCount}/{ACHIEVEMENTS.length}</span></h2>
        <div className="grid-3" style={{ gap:14 }}>
          {ACHIEVEMENTS.map(a => (
            <div key={a.id} className="card" style={{ padding:16, textAlign:'center', background: a.earned?'var(--success-light)':'var(--surface-2)', border: a.earned?'2px solid var(--success)':'2px solid var(--border)', opacity:a.earned?1:0.55 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{a.icon}</div>
              <p style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>{language==='bn'?a.titleBn:a.title}</p>
              <p style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.4 }}>{language==='bn'?a.descBn:a.desc}</p>
              {a.earned && <div className="flex items-center gap-4 justify-center" style={{ marginTop:8 }}>
                <Check size={14} color="var(--success)"/><p style={{ fontSize:12, color:'var(--success)', fontWeight:700 }}>{t('Earned','অর্জিত')}</p>
              </div>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Lessons */}
      <div className="card anim-up d3">
        <h2 className="t-head" style={{ marginBottom:16 }}>📚 {t('Recent Lessons','সাম্প্রতিক পাঠ')}</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {RECENT_LESSONS.map((l,i) => (
            <div key={i} className="flex items-center gap-14" style={{ padding:'12px 16px', background:'var(--surface-2)', borderRadius:'var(--r-sm)' }}>
              <div style={{ fontSize:28, flexShrink:0 }}>{l.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:16 }}>{language==='bn'?l.titleBn:l.title}</p>
                <p className="t-tiny">{l.date}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                {l.pct === 100
                  ? <span className="badge badge-sage">✓ {t('Done','সম্পন্ন')}</span>
                  : <><div className="progress-track" style={{ width:60 }}><div className="progress-fill" style={{ width:`${l.pct}%` }}/></div><p className="t-tiny" style={{ marginTop:2 }}>{l.pct}%</p></>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
