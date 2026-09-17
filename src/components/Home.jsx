import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Heart, MessageCircle, PlayCircle, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { TUTORIALS } from '../data/hardcoded';
import oldMan from '../../title_banner/old_man.png';

const TOTAL_LESSONS = Object.values(TUTORIALS).flat().length;

const ACTIONS = [
  {
    icon: <Users size={38}/>,
    tab: 'learn',
    title: ['Understand', 'বোঝা', 'समझें'],
    body: ['Clear lessons for common digital tasks.', 'সাধারণ ডিজিটাল কাজের সহজ পাঠ।', 'सामान्य डिजिटल कामों के आसान पाठ।'],
  },
  {
    icon: <BookOpen size={38}/>,
    tab: 'practice',
    title: ['Practice', 'অনুশীলন', 'अभ्यास'],
    body: ['Try things safely before doing them for real.', 'বাস্তবে করার আগে নিরাপদে অনুশীলন করুন।', 'वास्तव में करने से पहले सुरक्षित अभ्यास करें।'],
  },
  {
    icon: <ShieldCheck size={38}/>,
    tab: 'safety',
    title: ['Stay Safe', 'নিরাপদ থাকুন', 'सुरक्षित रहें'],
    body: ['Check messages, links, and warning signs.', 'বার্তা, লিংক ও সতর্কতার লক্ষণ পরীক্ষা করুন।', 'संदेश, लिंक और चेतावनी संकेत जांचें।'],
  },
  {
    icon: <Heart size={38}/>,
    tab: 'memory',
    title: ['Remember', 'মনে রাখুন', 'याद रखें'],
    body: ['Keep useful lessons in your Memory Book.', 'উপকারী পাঠ Memory Book-এ রাখুন।', 'उपयोगी पाठ Memory Book में रखें।'],
  },
];

function greetingForNow(t) {
  const hour = new Date().getHours();
  if (hour < 12) return t('Good morning', 'সুপ্রভাত', 'सुप्रभात');
  if (hour < 17) return t('Good afternoon', 'শুভ দুপুর', 'शुभ दोपहर');
  return t('Good evening', 'শুভ সন্ধ্যা', 'शुभ संध्या');
}

export default function Home() {
  const { user, speak, setActiveTab, memoryEntries, t } = useApp();
  const { authedFetch } = useAuth();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authedFetch('/progress/me')
      .then(({ progress: p }) => { if (!cancelled) setProgress(p); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authedFetch]);

  const firstName = user?.name?.split(' ')[0] || t('friend', 'বন্ধু', 'दोस्त');
  const overall = progress ? Math.round((progress.confidence + progress.competence) / 2) : 0;
  const recentActivity = memoryEntries.slice(0, 3);

  return (
    <div className="app-home">
      <section className="app-home-hero anim-up">
        <div className="app-home-photo">
          <img src={oldMan} alt="Older adult smiling while using a tablet" />
          <div className="app-home-photo-note">{t('New skills. Brighter days.', 'নতুন দক্ষতা। উজ্জ্বল দিন।', 'नए कौशल। बेहतर दिन।')}</div>
        </div>

        <div className="app-home-copy">
          <p className="app-home-kicker">{greetingForNow(t)}, {firstName}</p>
          <h1>{t('Confident online living, at your pace.', 'নিজের গতিতে আত্মবিশ্বাসী অনলাইন জীবন।', 'अपनी गति से आत्मविश्वासी ऑनलाइन जीवन।')}</h1>
          <p>
            {t(
              'Pick one small step for today. Guidia will keep it simple, safe, and easy to follow.',
              'আজকের জন্য একটি ছোট ধাপ বেছে নিন। Guidia সেটি সহজ, নিরাপদ এবং অনুসরণযোগ্য রাখবে।',
              'आज के लिए एक छोटा कदम चुनें। Guidia उसे सरल, सुरक्षित और समझने में आसान रखेगा।'
            )}
          </p>
          <div className="app-home-actions">
            <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('learn')}>
              {t('Start Learning Today', 'আজ শেখা শুরু করুন', 'आज सीखना शुरू करें')} <ArrowRight size={22}/>
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => setActiveTab('safety')}>
              {t('Explore the Guides', 'গাইড দেখুন', 'गाइड देखें')}
            </button>
          </div>
        </div>
      </section>

      <section className="app-action-row anim-up d1" aria-label={t('Guidia main actions', 'Guidia প্রধান কাজ', 'Guidia मुख्य काम')}>
        {ACTIONS.map((action) => (
          <button key={action.tab} className="app-action-box" onClick={() => setActiveTab(action.tab)}>
            <span>{action.icon}</span>
            <strong>{t(...action.title)}</strong>
            <p>{t(...action.body)}</p>
          </button>
        ))}
      </section>

      <section className="app-home-lower anim-up d2">
        <div className="app-progress-panel">
          <div>
            <p className="app-section-label">{t('Your progress', 'আপনার অগ্রগতি', 'आपकी प्रगति')}</p>
            <h2>{overall}% {t('confidence score', 'আত্মবিশ্বাস স্কোর', 'आत्मविश्वास स्कोर')}</h2>
            <p>
              {t(
                `${progress?.lessonsCompleted ?? 0} of ${TOTAL_LESSONS} lessons completed`,
                `${TOTAL_LESSONS}টির মধ্যে ${progress?.lessonsCompleted ?? 0}টি পাঠ সম্পন্ন`,
                `${TOTAL_LESSONS} में से ${progress?.lessonsCompleted ?? 0} पाठ पूरे`
              )}
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => setActiveTab('progress')}>
            {t('View Progress', 'অগ্রগতি দেখুন', 'प्रगति देखें')} <ArrowRight size={18}/>
          </button>
        </div>

        <div className="app-recent-panel">
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <p className="app-section-label">{t('Recent activity', 'সাম্প্রতিক কাজ', 'हाल की गतिविधि')}</p>
            <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('memory')}>{t('View All', 'সব দেখুন', 'सब देखें')}</button>
          </div>
          {recentActivity.length === 0 ? (
            <p className="t-sub">{t('Complete a lesson or safety check to see it here.', 'এখানে দেখতে একটি পাঠ বা নিরাপত্তা পরীক্ষা সম্পন্ন করুন।', 'यहां देखने के लिए एक पाठ या सुरक्षा जांच पूरी करें।')}</p>
          ) : (
            <div className="flex-col gap-12">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="app-recent-item">
                  <div>
                    <strong>{entry.title}</strong>
                    <p>{entry.date}</p>
                  </div>
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={() => speak(`${entry.title}. ${entry.summary}`)} aria-label={t('Replay memory', 'স্মৃতি আবার শুনুন', 'याद फिर सुनें')}>
                    <PlayCircle size={16}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="app-helper-panel">
          <MessageCircle size={34}/>
          <h2>{t('Need help?', 'সাহায্য দরকার?', 'मदद चाहिए?')}</h2>
          <p>{t('Ask Guidia to explain anything in simple steps.', 'যেকোনো বিষয় সহজ ধাপে বুঝতে Guidia-কে জিজ্ঞাসা করুন।', 'किसी भी बात को आसान चरणों में समझने के लिए Guidia से पूछें।')}</p>
          <button className="btn btn-primary" onClick={() => setActiveTab('assistant')}>
            {t('Ask Assistant', 'সহকারীকে জিজ্ঞাসা করুন', 'सहायक से पूछें')}
          </button>
        </div>
      </section>
    </div>
  );
}
