import { useState, useEffect } from 'react';
import { useApp } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, GraduationCap, ShieldCheck, MessageCircle, PlayCircle, BookOpen, MessageSquare, ShieldAlert, ChevronRight } from 'lucide-react';
import { TUTORIALS } from '../data/hardcoded';

const TOTAL_LESSONS = Object.values(TUTORIALS).flat().length;

const CATEGORY_ICONS = { learning: BookOpen, safety: ShieldAlert, messaging: MessageSquare, banking: ShieldCheck, social: MessageSquare };

function greetingForNow(t) {
  const hour = new Date().getHours();
  if (hour < 12) return t('Good Morning', 'শুভ সকাল', 'सुप्रभात');
  if (hour < 17) return t('Good Afternoon', 'শুভ অপরাহ্ন', 'शुभ दोपहर');
  return t('Good Evening', 'শুভ সন্ধ্যা', 'शुभ संध्या');
}

const QUICK_ACCESS = [
  { icon: <BookOpen size={22}/>, color:'#6366f1', bg:'rgba(99,102,241,0.14)', tab:'learn', title:(t)=>t('Learn','শিখুন','सीखें'), sub:(t)=>t('Build new skills','নতুন দক্ষতা তৈরি করুন','नए कौशल बनाएं') },
  { icon: <GraduationCap size={22}/>, color:'#22c55e', bg:'rgba(34,197,94,0.14)', tab:'practice', title:(t)=>t('Practice','চর্চা','अभ्यास'), sub:(t)=>t('Try it safely','নিরাপদে চেষ্টা করুন','सुरक्षित रूप से आज़माएं') },
  { icon: <MessageCircle size={22}/>, color:'#8b5cf6', bg:'rgba(139,92,246,0.14)', tab:'assistant', title:(t)=>t('AI Assistant','এআই সহকারী','AI सहायक'), sub:(t)=>t('Get instant help','তাৎক্ষণিক সাহায্য নিন','तुरंत मदद पाएं') },
  { icon: <ShieldCheck size={22}/>, color:'#f59e0b', bg:'rgba(245,158,11,0.14)', tab:'safety', title:(t)=>t('Safety Check','নিরাপত্তা যাচাই','सुरक्षा जांच'), sub:(t)=>t('Scan for risks','ঝুঁকি স্ক্যান করুন','जोखिम स्कैन करें') },
];

export default function Home() {
  const { user, t, speak, setActiveTab, memoryEntries } = useApp();
  const { authedFetch } = useAuth();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authedFetch('/progress/me')
      .then(({ progress: p }) => { if (!cancelled) setProgress(p); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authedFetch]);

  const firstName = user?.name?.split(' ')[0] || t('friend', 'বন্ধু', 'मित्र');
  const overall = progress ? Math.round((progress.confidence + progress.competence) / 2) : 0;
  const recentActivity = memoryEntries.slice(0, 4);

  return (
    <div>
      <div className="anim-up" style={{ marginBottom: 28 }}>
        <h1 className="t-title">{greetingForNow(t)}, {firstName}</h1>
        <p className="t-sub" style={{ marginTop: 6 }}>{t('Small steps today, bigger confidence tomorrow.', 'আজকের ছোট পদক্ষেপ, আগামীকালের বড় আত্মবিশ্বাস।', 'आज के छोटे कदम, कल का बड़ा आत्मविश्वास।')}</p>
      </div>

      <div className="grid-2 anim-up d1" style={{ marginBottom: 24, alignItems: 'stretch' }}>
        <div style={{ background: 'var(--gradient-brand)', borderRadius: 'var(--r-lg)', padding: 32, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 'var(--sh-md)' }}>
          <p style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{t('Learn at Your Own Pace', 'নিজের গতিতে শিখুন', 'अपनी गति से सीखें')}</p>
          <p style={{ opacity: 0.85, marginBottom: 20, maxWidth: 380 }}>{t('Simple lessons, real-life examples, everyday skills.', 'সহজ পাঠ, বাস্তব উদাহরণ, দৈনন্দিন দক্ষতা।', 'सरल पाठ, वास्तविक उदाहरण, रोज़मर्रा के कौशल।')}</p>
          <button onClick={() => setActiveTab('learn')} className="btn" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', width: 'fit-content', fontWeight: 700 }}>
            {t('Start Learning', 'শেখা শুরু করুন', 'सीखना शुरू करें')} <ArrowRight size={18}/>
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-2)' }}>{t('Your Progress', 'আপনার অগ্রগতি', 'आपकी प्रगति')}</p>
          <div className="flex items-center gap-20">
            <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
              <svg viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="38" cy="38" r="32" fill="none" stroke="var(--border)" strokeWidth="8"/>
                <circle cx="38" cy="38" r="32" fill="none" stroke="var(--blue)" strokeWidth="8"
                  strokeDasharray={`${2*Math.PI*32*overall/100} 999`} style={{ transition: 'stroke-dasharray 1s ease' }}/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: 18 }}>{overall}%</p>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 20 }}>{progress?.activeDays ?? 0} {t('active days', 'সক্রিয় দিন', 'सक्रिय दिन')}</p>
              <p className="t-tiny" style={{ marginTop: 2 }}>{t('Completed Lessons', 'সম্পন্ন পাঠ', 'पूरे किए गए पाठ')} {progress?.lessonsCompleted ?? 0} / {TOTAL_LESSONS}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={() => setActiveTab('progress')}>
            {t('View Details', 'বিস্তারিত দেখুন', 'विवरण देखें')} <ChevronRight size={16}/>
          </button>
        </div>
      </div>

      <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-2)', marginBottom: 14 }} className="anim-up d2">{t('Quick Access', 'দ্রুত প্রবেশ', 'त्वरित पहुंच')}</p>
      <div className="grid-4 anim-up d2" style={{ marginBottom: 28 }}>
        {QUICK_ACCESS.map((c) => (
          <button key={c.tab} className="card card-btn" onClick={() => setActiveTab(c.tab)} style={{ padding: 20, textAlign: 'left' }}>
            <div className="icon-wrap iw-md" style={{ background: c.bg, color: c.color, marginBottom: 14 }}>{c.icon}</div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{c.title(t)}</p>
            <p className="t-tiny" style={{ marginTop: 2 }}>{c.sub(t)}</p>
          </button>
        ))}
      </div>

      <div className="card anim-up d3">
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{t('Recent Activity', 'সাম্প্রতিক কার্যক্রম', 'हाल की गतिविधि')}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('memory')}>{t('View All', 'সব দেখুন', 'सभी देखें')}</button>
        </div>
        {recentActivity.length === 0 ? (
          <p className="t-sub">{t('Nothing yet — complete a lesson or safety check to see it here.', 'এখনো কিছু নেই — এখানে দেখতে একটি পাঠ বা নিরাপত্তা যাচাই সম্পন্ন করুন।', 'अभी तक कुछ नहीं — यहां देखने के लिए एक पाठ या सुरक्षा जांच पूरी करें।')}</p>
        ) : (
          <div className="flex-col gap-14">
            {recentActivity.map((entry) => {
              const Icon = CATEGORY_ICONS[entry.category] || BookOpen;
              return (
                <div key={entry.id} className="flex items-center gap-14">
                  <div className="icon-wrap iw-sm ic-blue" style={{ flexShrink: 0 }}><Icon size={16}/></div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{entry.title}</p>
                    <p className="t-tiny">{entry.date}</p>
                  </div>
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={() => speak(`${entry.title}. ${entry.summary}`)}><PlayCircle size={14}/></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
