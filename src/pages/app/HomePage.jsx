import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookMarked, BookOpen, CalendarClock, ChevronRight, Hand, HeartHandshake, MessageCircle, Pause, Play,
  PlayCircle, RefreshCw, ScanSearch, ShieldCheck, Sparkles, Volume2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { useToast } from '../../context/ToastContext';
import { useResource } from '../../hooks/useResource';
import { post } from '../../services/apiClient';
import { localize, formatRelative } from '../../i18n';
import { FEATURED_APPS, SAFETY_TIPS, skillName, tipOfTheDay } from '../../data/catalog';
import { Badge, Button, Card, IconButton, ProgressBar, SectionHeader, Skeleton } from '../../components/ui';
import AppLogo from '../../components/AppLogo';

function greeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('Good morning', 'সুপ্রভাত', 'सुप्रभात', 'Chào buổi sáng');
  if (h < 17) return t('Good afternoon', 'শুভ অপরাহ্ন', 'नमस्कार', 'Chào buổi chiều');
  return t('Good evening', 'শুভ সন্ধ্যা', 'शुभ संध्या', 'Chào buổi tối');
}

// Language → which everyday apps to suggest first.
const APP_PRIORITY = { bn: ['nagad', 'imo', 'facebook', 'gmail'], hi: ['gmail', 'facebook', 'imo', 'nagad'], vi: ['facebook', 'gmail', 'imo', 'nagad'], en: ['gmail', 'facebook', 'imo', 'nagad'] };

function HomeHero({ t, firstName }) {
  return (
    <section className="home-hero rise" aria-labelledby="home-question">
      <div className="home-hero-text">
        <p className="eyebrow">{greeting(t)}{firstName ? `, ${firstName}` : ''}</p>
        <h1 id="home-question" className="home-question">{t('What would you like to do today?', 'আজ আপনি কী করতে চান?', 'आज आप क्या करना चाहेंगे?', 'Hôm nay bạn muốn làm gì?')}</h1>
        <p className="lead">{t('Pick one small step. Guidia stays beside you, and nothing in practice can go wrong for real.', 'একটি ছোট ধাপ বেছে নিন। Guidia আপনার পাশে আছে, অনুশীলনে আসলে কিছু ভুল হবে না।', 'एक छोटा कदम चुनें। Guidia आपके साथ है, अभ्यास में असल में कुछ गलत नहीं होगा।', 'Chọn một bước nhỏ. Guidia luôn ở bên bạn, khi luyện tập không có gì hỏng thật cả.')}</p>
      </div>
    </section>
  );
}

function PrimaryActions({ t }) {
  const tiles = [
    { to: '/app/learn', icon: BookOpen, tone: 'teal', title: t('Learn something', 'কিছু শিখুন', 'कुछ सीखें', 'Học điều mới'), body: t('Short, calm lessons on everyday apps.', 'প্রতিদিনের অ্যাপ নিয়ে ছোট, সহজ পাঠ।', 'रोज़ के ऐप्स पर छोटे, आसान पाठ।', 'Bài học ngắn, dễ hiểu về ứng dụng hằng ngày.') },
    { to: '/app/ask', icon: MessageCircle, tone: 'coral', title: t('Ask Guidia', 'Guidia-কে জিজ্ঞাসা করুন', 'Guidia से पूछें', 'Hỏi Guidia'), body: t('Type or say your question. One step at a time.', 'লিখে বা বলে প্রশ্ন করুন। এক এক ধাপে উত্তর।', 'लिखकर या बोलकर पूछें। एक-एक कदम में जवाब।', 'Gõ hoặc nói câu hỏi. Trả lời từng bước.') },
    { to: '/app/screen', icon: ScanSearch, tone: 'gold', title: t('Understand my screen', 'আমার স্ক্রিন বুঝুন', 'मेरी स्क्रीन समझें', 'Hiểu màn hình của tôi'), body: t('Share a screenshot. Learn what to press — and what to avoid.', 'স্ক্রিনশট দিন। জানুন কোথায় চাপবেন — আর কোথায় নয়।', 'स्क्रीनशॉट दें। जानें कहाँ दबाएं — और कहाँ नहीं।', 'Gửi ảnh màn hình. Biết nên bấm gì — và tránh gì.') },
    { to: '/app/practice', icon: Hand, tone: 'sage', title: t('Practise safely', 'নিরাপদে অনুশীলন', 'सुरक्षित अभ्यास', 'Luyện tập an toàn'), body: t('Real-looking apps, pretend money. Mistakes are welcome.', 'আসলের মতো অ্যাপ, নকল টাকা। ভুল করা ঠিক আছে।', 'असली जैसे ऐप, नकली पैसे। गलती करना ठीक है।', 'Ứng dụng giống thật, tiền giả. Sai cũng không sao.') },
  ];
  return (
    <section aria-label={t('Main actions', 'প্রধান কাজ', 'मुख्य काम', 'Việc chính')}>
      <ul className="action-tiles">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <li key={tile.to} className="rise" style={{ '--i': i + 1 }}>
              <Link to={tile.to} className={`action-tile tone-${tile.tone}`}>
                <span className="action-tile-icon" aria-hidden="true"><Icon /></span>
                <span className="action-tile-text">
                  <span className="action-tile-title">{tile.title}</span>
                  <span className="action-tile-body">{tile.body}</span>
                </span>
                <ArrowRight className="action-tile-arrow" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ContinueCard({ t, language, task, onChanged, recommended }) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  if (task.loading && !task.data) return <Skeleton variant="card" height={190} />;

  if (!task.data) {
    return (
      <Card className="continue-card is-empty">
        <span className="icon-chip icon-chip-lg tone-gold" aria-hidden="true"><Sparkles /></span>
        <div className="stack grow" style={{ '--gap': 'var(--s-2)' }}>
          <p className="eyebrow">{t('Start with a small step', 'ছোট একটি ধাপে শুরু করুন', 'एक छोटे कदम से शुरू करें', 'Bắt đầu với một bước nhỏ')}</p>
          <h2 className="h-section">{recommended ? localize(recommended.title, language) : t('Send your first message', 'প্রথম মেসেজ পাঠান', 'अपना पहला मैसेज भेजें', 'Gửi tin nhắn đầu tiên')}</h2>
          <p className="text-muted">{t('Nothing in progress right now. This short lesson is a good place to begin.', 'এখন কিছু চলছে না। শুরু করার জন্য এই ছোট পাঠটি ভালো।', 'अभी कुछ चल नहीं रहा। शुरू करने के लिए यह छोटा पाठ अच्छा है।', 'Hiện chưa có bài nào đang học. Bài ngắn này là điểm khởi đầu tốt.')}</p>
        </div>
        <Button arrow to={`/app/learn/${recommended?.slug || 'whatsapp-send-message'}`}>{t('Start learning', 'শেখা শুরু করুন', 'सीखना शुरू करें', 'Bắt đầu học')}</Button>
      </Card>
    );
  }

  const tk = task.data;
  const total = tk.totalSteps || 0;
  const step = Math.min(tk.currentStepOrder + 1, Math.max(total, 1));
  const pct = total ? Math.round((100 * tk.currentStepOrder) / total) : 0;
  const paused = tk.status === 'PAUSED';
  const title = localize(tk.scenario?.title || tk.lesson?.title, language) || tk.goal;
  const to = tk.application ? `/app/practice/${tk.application.slug}` : tk.lesson ? `/app/learn/${tk.lesson.slug}` : '/app/learn';
  const remaining = Math.max(total - tk.currentStepOrder, 0);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await post(`/tasks/${tk.id}/${paused ? 'resume' : 'pause'}`);
      onChanged(res.task);
      showToast(paused ? t('Welcome back — carry on when ready.', 'আবার স্বাগতম — প্রস্তুত হলে চালিয়ে যান।', 'फिर से स्वागत है — तैयार हों तो जारी रखें।', 'Chào mừng trở lại — sẵn sàng thì tiếp tục nhé.') : t('Paused. It will wait for you here.', 'থামানো হলো। এটি এখানে আপনার জন্য অপেক্ষা করবে।', 'रोका गया। यह यहीं आपका इंतज़ार करेगा।', 'Đã tạm dừng. Bài sẽ chờ bạn ở đây.'), 'success');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="continue-card" raised>
      {tk.application ? <AppLogo app={tk.application.slug} name={tk.application.displayName} size={60} /> : <span className="icon-chip icon-chip-lg" aria-hidden="true"><BookOpen /></span>}
      <div className="stack grow" style={{ '--gap': 'var(--s-2)' }}>
        <div className="row" style={{ '--gap': 'var(--s-2)' }}>
          <p className="eyebrow">{t('Continue where you left off', 'যেখানে থেমেছিলেন', 'जहाँ छोड़ा था वहीं से', 'Tiếp tục từ chỗ dừng')}</p>
          {paused && <Badge tone="gold" icon={Pause}>{t('Paused', 'থামানো', 'रुका हुआ', 'Tạm dừng')}</Badge>}
        </div>
        <h2 className="h-section">{title}</h2>
        {total > 0 && (
          <>
            <ProgressBar value={pct} label={t('Progress', 'অগ্রগতি', 'प्रगति', 'Tiến độ')} />
            <p className="text-subtle">
              {t(`Step ${step} of ${total}`, `ধাপ ${step} / ${total}`, `चरण ${step} / ${total}`, `Bước ${step}/${total}`)}
              {' · '}
              {t(`about ${Math.max(1, remaining)} min left`, `প্রায় ${Math.max(1, remaining)} মিনিট বাকি`, `लगभग ${Math.max(1, remaining)} मिनट बाकी`, `còn khoảng ${Math.max(1, remaining)} phút`)}
            </p>
          </>
        )}
      </div>
      <div className="btn-group continue-actions">
        <Button arrow to={to}>{t('Continue', 'চালিয়ে যান', 'जारी रखें', 'Tiếp tục')}</Button>
        <Button variant="quiet" icon={paused ? Play : Pause} onClick={toggle} state={busy ? 'loading' : 'idle'}>
          {paused ? t('Resume', 'আবার শুরু', 'फिर शुरू', 'Tiếp tục lại') : t('Pause', 'থামান', 'रोकें', 'Tạm dừng')}
        </Button>
      </div>
    </Card>
  );
}

function Recommendations({ t, language, progress, lessons, memories }) {
  const cards = [];
  const skills = progress.data?.skills || [];
  const due = skills.filter((s) => s.dueForReview);
  if (due.length) {
    cards.push({
      key: 'review', icon: CalendarClock, tone: 'gold', to: '/app/practice',
      title: t('Ready for a quick review', 'একটু ঝালিয়ে নেওয়ার সময়', 'थोड़ा दोहराने का समय', 'Đến lúc ôn lại nhanh'),
      body: due.slice(0, 2).map((s) => skillName(s.skillKey, t)).join(' · '),
      why: t('Reviewing now helps you remember it for good.', 'এখন ঝালিয়ে নিলে স্থায়ীভাবে মনে থাকে।', 'अभी दोहराने से यह हमेशा याद रहेगा।', 'Ôn bây giờ giúp bạn nhớ lâu.'),
      action: t('Review', 'ঝালিয়ে নিন', 'दोहराएं', 'Ôn tập'),
    });
  }
  const known = new Set(skills.map((s) => s.skillKey));
  const priority = APP_PRIORITY[language] || APP_PRIORITY.en;
  const featured = priority.flatMap((slug) => FEATURED_APPS.find((a) => a.slug === slug)?.lessons || []);
  const next = (lessons.data || []).filter((l) => featured.includes(l.slug)).sort((a, b) => featured.indexOf(a.slug) - featured.indexOf(b.slug)).find((l) => !known.has(l.skillKey));
  if (next) {
    cards.push({
      key: 'lesson', app: next.application?.slug, appName: next.application?.displayName, tone: 'teal', to: `/app/learn/${next.slug}`,
      title: localize(next.title, language),
      body: `${next.estimatedMinutes} ${t('min', 'মিনিট', 'मिनट', 'phút')} · ${next._count?.steps ?? ''} ${t('steps', 'ধাপ', 'चरण', 'bước')}`,
      why: t("Recommended — you haven't tried this yet.", 'আপনার জন্য — এটি এখনো চেষ্টা করেননি।', 'आपके लिए — यह अभी तक नहीं आज़माया।', 'Gợi ý — bạn chưa thử bài này.'),
      action: t('Start', 'শুরু করুন', 'शुरू करें', 'Bắt đầu'),
    });
  }
  const practised = [...skills].filter((s) => s.lastPracticedAt).sort((a, b) => new Date(b.lastPracticedAt) - new Date(a.lastPracticedAt))[0];
  if (practised && !due.some((d) => d.skillKey === practised.skillKey)) {
    cards.push({
      key: 'again', icon: RefreshCw, tone: 'sage', to: '/app/practice',
      title: t('Practise again', 'আবার অনুশীলন করুন', 'फिर से अभ्यास करें', 'Luyện lại'),
      body: skillName(practised.skillKey, t),
      why: `${t('Last practised', 'শেষ অনুশীলন', 'पिछला अभ्यास', 'Luyện lần cuối')} ${formatRelative(practised.lastPracticedAt, language)}`,
      action: t('Practise', 'অনুশীলন', 'अभ्यास', 'Luyện tập'),
    });
  }
  const recent = memories.data?.[0];
  if (recent && cards.length < 3) {
    cards.push({
      key: 'memory', icon: BookMarked, tone: 'coral', to: '/app/memory',
      title: recent.title, body: recent.summary,
      why: t('From your Memory Book — worth a quick listen.', 'আপনার স্মৃতির খাতা থেকে — একবার শুনে নিন।', 'आपकी याद की किताब से — एक बार सुन लें।', 'Từ Sổ ghi nhớ — nghe lại một chút nhé.'),
      action: t('Open', 'খুলুন', 'खोलें', 'Mở'),
    });
  }

  if ((progress.loading || lessons.loading) && cards.length === 0) {
    return <div className="rec-grid"><Skeleton variant="card" count={3} /></div>;
  }
  if (cards.length === 0) return null;

  return (
    <section className="section" aria-labelledby="rec-heading">
      <SectionHeader id="rec-heading" title={t('Picked for you', 'আপনার জন্য বাছাই', 'आपके लिए चुना गया', 'Dành cho bạn')} />
      <div className="rec-grid">
        {cards.slice(0, 3).map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.key} to={c.to} className={`card card-link rec-card tone-${c.tone}`}>
              <div className="row-between" style={{ alignItems: 'flex-start' }}>
                {c.app ? <AppLogo app={c.app} name={c.appName} size={44} /> : <span className={`icon-chip tone-${c.tone === 'teal' ? 'neutral' : c.tone === 'sage' ? 'ok' : c.tone}`} aria-hidden="true"><Icon /></span>}
                <ChevronRight className="card-arrow" aria-hidden="true" />
              </div>
              <span className="h-card clamp-2">{c.title}</span>
              {c.body && <span className="text-muted clamp-2">{c.body}</span>}
              <span className="rec-why">{c.why}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RecentMemories({ t, language, memories }) {
  const { speak } = useVoice();
  return (
    <Card className="stack" style={{ '--gap': 'var(--s-3)' }} aria-labelledby="memory-heading">
      <div className="card-header">
        <h2 id="memory-heading" className="h-section">{t('Recently learned', 'সম্প্রতি শিখেছেন', 'हाल में सीखा', 'Mới học gần đây')}</h2>
        <Button variant="ghost" size="sm" to="/app/memory" iconRight={ChevronRight}>{t('See all', 'সব দেখুন', 'सब देखें', 'Xem tất cả')}</Button>
      </div>
      {memories.loading && !memories.data && <Skeleton count={3} height={48} style={{ marginBottom: 8 }} />}
      {memories.data?.length ? (
        <ul className="list">
          {memories.data.map((m) => (
            <li key={m.id} className="list-item">
              <span className="icon-chip icon-chip-sm tone-coral" aria-hidden="true"><BookMarked /></span>
              <Link to="/app/memory" className="list-item-main" style={{ color: 'inherit', textDecoration: 'none' }}>
                <span className="list-item-title truncate">{m.title}</span>
                <span className="list-item-meta">{formatRelative(m.createdAt, language)}</span>
              </Link>
              <IconButton icon={PlayCircle} label={t(`Listen to ${m.title}`, `${m.title} শুনুন`, `${m.title} सुनें`, `Nghe ${m.title}`)} onClick={() => speak(`${m.title}. ${m.summary}`)} />
            </li>
          ))}
        </ul>
      ) : memories.data && (
        <p className="text-muted">{t('Lessons you finish are kept here so you can listen again any time.', 'যে পাঠ শেষ করবেন তা এখানে থাকবে, যখন খুশি আবার শুনতে পারবেন।', 'जो पाठ पूरे करेंगे वे यहाँ रहेंगे, कभी भी दोबारा सुन सकते हैं।', 'Bài học bạn hoàn thành sẽ được giữ ở đây để nghe lại bất cứ lúc nào.')}</p>
      )}
    </Card>
  );
}

function SafetyReminder({ t }) {
  const { speak } = useVoice();
  const [offset, setOffset] = useState(0);
  const tip = tipOfTheDay(offset);
  return (
    <Card tone="soft" className="tip-card" aria-labelledby="tip-heading">
      <span className="icon-chip icon-chip-lg" style={{ background: 'var(--card)' }} aria-hidden="true"><ShieldCheck /></span>
      <div className="stack grow" style={{ '--gap': 'var(--s-2)' }}>
        <p className="eyebrow" id="tip-heading">{t("Today's safety reminder", 'আজকের নিরাপত্তা কথা', 'आज की सुरक्षा बात', 'Nhắc nhở an toàn hôm nay')}</p>
        <p key={offset} className="tip-text fade" aria-live="polite">{t(...tip)}</p>
        <div className="btn-group" style={{ '--gap': 'var(--s-2)' }}>
          <Button variant="secondary" size="sm" icon={Volume2} onClick={() => speak(t(...tip))}>{t('Listen', 'শুনুন', 'सुनें', 'Nghe')}</Button>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => setOffset((o) => (o + 1) % SAFETY_TIPS.length)}>{t('Another tip', 'আরেকটি কথা', 'एक और बात', 'Mẹo khác')}</Button>
          <Button variant="ghost" size="sm" to="/app/safety" iconRight={ChevronRight}>{t('Learn more', 'আরও জানুন', 'और जानें', 'Tìm hiểu thêm')}</Button>
        </div>
      </div>
    </Card>
  );
}

function HelpPrompt({ t }) {
  return (
    <Card tone="warm" className="help-prompt" aria-labelledby="help-heading">
      <span className="icon-chip icon-chip-lg tone-coral" style={{ background: 'var(--card)' }} aria-hidden="true"><HeartHandshake /></span>
      <div className="stack grow" style={{ '--gap': '4px' }}>
        <h2 id="help-heading" className="h-section">{t('Need another person?', 'আরেকজন মানুষের দরকার?', 'किसी और की ज़रूरत है?', 'Cần thêm một người?')}</h2>
        <p className="text-muted">{t('Someone you trust can help — and Guidia is always here too.', 'বিশ্বস্ত কেউ সাহায্য করতে পারেন — আর Guidia সবসময় আছে।', 'कोई भरोसेमंद मदद कर सकता है — और Guidia हमेशा यहाँ है।', 'Người bạn tin cậy có thể giúp — và Guidia luôn ở đây.')}</p>
      </div>
      <div className="btn-group">
        <Button variant="help" icon={HeartHandshake} to="/app/help">{t('Ask someone I trust', 'বিশ্বস্ত কাউকে বলুন', 'भरोसेमंद से पूछें', 'Nhờ người tin cậy')}</Button>
        <Button variant="secondary" icon={MessageCircle} to="/app/ask">{t('Ask Guidia', 'Guidia-কে জিজ্ঞাসা', 'Guidia से पूछें', 'Hỏi Guidia')}</Button>
      </div>
    </Card>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { t, language } = usePreferences();
  const task = useResource('/tasks/active', { select: (d) => d.task });
  const memories = useResource(`/memory?lang=${language}`, { select: (d) => d.entries.slice(0, 3) });
  const progress = useResource('/progress/me', { select: (d) => d.progress });
  const lessons = useResource('/learning/lessons', { select: (d) => d.lessons });

  const firstName = user?.fullName?.replace(/\(.*?\)/g, '').trim().split(' ')[0] || '';
  const recommended = useMemo(() => {
    const priority = APP_PRIORITY[language] || APP_PRIORITY.en;
    const first = FEATURED_APPS.find((a) => a.slug === priority[0])?.lessons[0];
    return (lessons.data || []).find((l) => l.slug === first) || null;
  }, [lessons.data, language]);

  return (
    <div className="page home-page">
      <HomeHero t={t} firstName={firstName} />
      <PrimaryActions t={t} />
      <div className="rise" style={{ '--i': 5 }}>
        <ContinueCard t={t} language={language} task={task} onChanged={(next) => task.mutate(next)} recommended={recommended} />
      </div>
      <Recommendations t={t} language={language} progress={progress} lessons={lessons} memories={memories} />
      <div className="home-columns">
        <RecentMemories t={t} language={language} memories={memories} />
        <div className="stack" style={{ '--gap': 'var(--s-4)' }}>
          <SafetyReminder t={t} />
          <HelpPrompt t={t} />
        </div>
      </div>
    </div>
  );
}
