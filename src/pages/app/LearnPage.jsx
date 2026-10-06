import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Check, ChevronRight, Clock, Footprints, Hand, Lightbulb, ListChecks, PartyPopper,
  ShieldCheck, Sparkles, Volume2, MousePointerClick,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { useToast } from '../../context/ToastContext';
import { useResource } from '../../hooks/useResource';
import { post } from '../../services/apiClient';
import { localize, hasTranslation } from '../../i18n';
import { DIFFICULTY, DOMAINS, FEATURED_APPS } from '../../data/catalog';
import { clearLessonStep, getLessonStep, inProgressLessons, saveLessonStep } from '../../utils/lessonProgress';
import { announce } from '../../utils/announce';
import { Alert, Button, ChoiceCard, EmptyState, ErrorState, PageHeader, ProgressBar, SectionHeader, Segmented, Skeleton, Stepper, SuccessState } from '../../components/ui';
import AppLogo from '../../components/AppLogo';
import ButtonGuideExplainer from '../../components/learn/ButtonGuideExplainer';
import { guideApps } from '../../data/guideCatalog';

const SIMULATED = ['whatsapp', 'facebook', 'messenger', 'gmail', 'bkash', 'nagad', 'momo', 'googlepay', 'paypal', 'booking', 'practo', 'amazon'];

export function LessonCard({ lesson, done, partial, t, language, compact }) {
  const l = lesson;
  return (
    <Link to={`/app/learn/${l.slug}`} className={`card card-link lesson-card ${compact ? 'is-compact' : ''}`}>
      <div className="lesson-card-top">
        {l.application ? <AppLogo app={l.application.slug} name={l.application.displayName} size={48} /> : <span className="icon-chip" aria-hidden="true"><BookOpen /></span>}
        {done ? <span className="badge badge-ok"><Check aria-hidden="true" /> {t('Done', 'শেষ', 'पूरा', 'Xong')}</span>
          : partial ? <span className="badge badge-gold"><Footprints aria-hidden="true" /> {t('In progress', 'চলছে', 'जारी', 'Đang học')}</span>
            : <ChevronRight className="card-arrow" aria-hidden="true" />}
      </div>
      <span className="h-card">{localize(l.title, language)}</span>
      {!compact && <span className="text-muted clamp-2 text-sm">{localize(l.description, language)}</span>}
      <span className="lesson-card-meta">
        <span className="row" style={{ '--gap': '6px' }}><Clock aria-hidden="true" /> {l.estimatedMinutes} {t('min', 'মিনিট', 'मिनट', 'phút')}</span>
        <span className="row" style={{ '--gap': '6px' }}><ListChecks aria-hidden="true" /> {l._count?.steps ?? '–'} {t('steps', 'ধাপ', 'चरण', 'bước')}</span>
        <span>{t(...(DIFFICULTY[l.difficulty] || DIFFICULTY.BEGINNER))}</span>
        {!hasTranslation(l.title, language) && language !== 'en' && <span className="badge badge-info">English</span>}
      </span>
      {partial && !done && <ProgressBar value={(partial.step / Math.max(1, partial.total)) * 100} size="sm" label={t('Lesson progress', 'পাঠের অগ্রগতি', 'पाठ प्रगति', 'Tiến độ bài học')} />}
    </Link>
  );
}

function FeaturedApps({ t, language, lessons, done, partials }) {
  const available = FEATURED_APPS.filter((a) => a.lessons.some((s) => lessons.some((l) => l.slug === s)));
  const [app, setApp] = useState(available[0]?.slug);
  const current = available.find((a) => a.slug === app) || available[0];
  if (!current) return null;
  const list = current.lessons.map((s) => lessons.find((l) => l.slug === s)).filter(Boolean);
  const appName = list[0]?.application?.displayName || current.slug;
  return (
    <section className="featured-band rise" style={{ '--i': 2 }} aria-labelledby="featured-h">
      <div className="featured-head">
        <div className="stack" style={{ '--gap': '6px' }}>
          <p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> {t('New everyday app lessons', 'নতুন: প্রতিদিনের অ্যাপের পাঠ', 'नए: रोज़ के ऐप के पाठ', 'Mới: bài học ứng dụng hằng ngày')}</p>
          <h2 id="featured-h" className="h-section">{t('Facebook, Nagad, Gmail and imo — step by step', 'ফেসবুক, নগদ, জিমেইল ও imo — ধাপে ধাপে', 'फेसबुक, Nagad, Gmail और imo — कदम-दर-कदम', 'Facebook, Nagad, Gmail và imo — từng bước một')}</h2>
        </div>
        <div className="featured-apps" role="tablist" aria-label={t('Choose an app', 'অ্যাপ বেছে নিন', 'ऐप चुनें', 'Chọn ứng dụng')}>
          {available.map((a) => {
            const first = lessons.find((l) => l.slug === a.lessons[0]);
            return (
              <button key={a.slug} type="button" role="tab" aria-selected={a.slug === current.slug} className="featured-app" onClick={() => setApp(a.slug)}>
                <AppLogo app={a.slug} name={first?.application?.displayName} size={36} />
                <span>{first?.application?.displayName || a.slug}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="featured-grid" role="tabpanel" aria-label={appName} key={current.slug}>
        {list.map((l, i) => (
          <div key={l.slug} className="rise" style={{ '--i': i }}>
            <LessonCard lesson={l} done={done.has(l.id)} partial={partials[l.slug]} t={t} language={language} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function LearnPage() {
  const { t, language } = usePreferences();
  const [domain, setDomain] = useState('ALL');
  const [guide, setGuide] = useState(null);
  const lessons = useResource('/learning/lessons', { select: (d) => d.lessons });
  const memory = useResource('/memory', { select: (d) => new Set(d.entries.map((e) => e.lessonId).filter(Boolean)) });
  const done = memory.data || new Set();
  const partials = useMemo(() => Object.fromEntries(inProgressLessons().map((p) => [p.slug, p])), []);

  const all = useMemo(() => lessons.data || [], [lessons.data]);
  const visible = useMemo(() => all.filter((l) => domain === 'ALL' || l.domain === domain), [all, domain]);
  const continuing = inProgressLessons().map((p) => all.find((l) => l.slug === p.slug)).filter((l) => l && !done.has(l.id)).slice(0, 2);

  return (
    <div className="page learn-page">
      <PageHeader
        eyebrow={t('Learn', 'শিখুন', 'सीखें', 'Học')}
        title={t('Learn at your pace', 'নিজের গতিতে শিখুন', 'अपनी गति से सीखें', 'Học theo nhịp của bạn')}
        description={t('Short lessons, one step at a time. Every step can be read aloud, and nothing is timed.', 'ছোট পাঠ, এক এক ধাপ করে। প্রতিটি ধাপ পড়ে শোনানো যায়, কোনো তাড়া নেই।', 'छोटे पाठ, एक-एक कदम। हर कदम सुना जा सकता है, कोई जल्दी नहीं।', 'Bài học ngắn, từng bước một. Mỗi bước đều có thể nghe, không giới hạn thời gian.')}
      />

      {lessons.error && <ErrorState card title={t('Lessons could not be loaded', 'পাঠ লোড করা যায়নি', 'पाठ लोड नहीं हो सके', 'Không tải được bài học')} message={lessons.error.message} onRetry={lessons.reload} />}

      {continuing.length > 0 && (
        <section className="section rise" style={{ '--i': 1 }} aria-labelledby="continue-h">
          <SectionHeader id="continue-h" title={t('Continue learning', 'শেখা চালিয়ে যান', 'सीखना जारी रखें', 'Tiếp tục học')} />
          <div className="lesson-grid">
            {continuing.map((l) => <LessonCard key={l.slug} lesson={l} partial={partials[l.slug]} t={t} language={language} />)}
          </div>
        </section>
      )}

      {lessons.loading && !lessons.data ? (
        <div className="lesson-grid"><Skeleton variant="card" height={220} count={6} /></div>
      ) : (
        <FeaturedApps t={t} language={language} lessons={all} done={done} partials={partials} />
      )}

      <section className="section" aria-labelledby="topics-h">
        <SectionHeader id="topics-h" title={t('Learn by topic', 'বিষয় অনুযায়ী শিখুন', 'विषय के अनुसार सीखें', 'Học theo chủ đề')} />
        <div className="scroll-x">
          <Segmented
            label={t('Topic', 'বিষয়', 'विषय', 'Chủ đề')} value={domain} onChange={setDomain}
            options={[{ value: 'ALL', label: t('All', 'সব', 'सभी', 'Tất cả') }, ...DOMAINS.map((d) => ({ value: d.id, label: t(...d.label) }))]}
          />
        </div>
        {lessons.data && visible.length === 0 && <EmptyState card icon={BookOpen} title={t('No lessons here yet', 'এখানে এখনো পাঠ নেই', 'यहाँ अभी पाठ नहीं हैं', 'Chưa có bài học ở đây')} action={<Button variant="secondary" onClick={() => setDomain('ALL')}>{t('Show all lessons', 'সব পাঠ দেখুন', 'सभी पाठ देखें', 'Xem tất cả bài học')}</Button>} />}
        <div className="lesson-grid" key={domain}>
          {visible.map((l, i) => (
            <div key={l.slug} className="rise" style={{ '--i': Math.min(i, 8) }}>
              <LessonCard lesson={l} done={done.has(l.id)} partial={partials[l.slug]} t={t} language={language} />
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="guides-h">
        <SectionHeader
          id="guides-h"
          title={t('What does this button do?', 'এই বোতামটি কী করে?', 'यह बटन क्या करता है?', 'Nút này dùng để làm gì?')}
          description={t('Pick an app to see its buttons explained one by one — what each does and when to be careful.', 'একটি অ্যাপ বেছে নিন — প্রতিটি বোতাম কী করে আর কখন সাবধান থাকবেন, এক এক করে দেখুন।', 'एक ऐप चुनें — हर बटन क्या करता है और कब सावधान रहें, एक-एक कर देखें।', 'Chọn một ứng dụng để xem từng nút: nút làm gì và khi nào cần cẩn thận.')}
        />
        <div className="guide-grid">
          {guideApps().map((g) => (
            <button key={g.key} type="button" className="card card-link guide-chip" onClick={() => setGuide(g.key)}>
              <AppLogo app={g.key} name={g.name} size={44} />
              <span className="stack grow" style={{ '--gap': '2px', textAlign: 'left' }}>
                <span className="list-item-title">{g.name}</span>
                <span className="text-subtle row" style={{ '--gap': '4px' }}><MousePointerClick size={14} aria-hidden="true" /> {g.count} {t('buttons', 'বোতাম', 'बटन', 'nút')}</span>
              </span>
              <ChevronRight className="card-arrow" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <ButtonGuideExplainer key={guide || 'none'} appKey={guide} open={Boolean(guide)} onClose={() => setGuide(null)} />
    </div>
  );
}

const CONFIDENCE = [
  { value: 2, label: ['Still unsure', 'এখনো নিশ্চিত নই', 'अभी भी पक्का नहीं', 'Vẫn chưa chắc'], body: ['That is fine — practice helps.', 'ঠিক আছে — অনুশীলনে সহজ হবে।', 'कोई बात नहीं — अभ्यास से आसान होगा।', 'Không sao — luyện tập sẽ giúp bạn.'] },
  { value: 3, label: ['Getting there', 'বুঝে উঠছি', 'समझ आ रहा है', 'Đang quen dần'], body: ['One more try will make it stick.', 'আরেকবার করলেই মনে থাকবে।', 'एक बार और करने से याद रहेगा।', 'Thử thêm một lần là nhớ.'] },
  { value: 5, label: ['I feel confident', 'আমি আত্মবিশ্বাসী', 'मुझे भरोसा है', 'Tôi thấy tự tin'], body: ['Wonderful — try it on your own next.', 'চমৎকার — এবার নিজে চেষ্টা করুন।', 'बहुत बढ़िया — अब खुद करके देखें।', 'Tuyệt vời — lần tới hãy tự làm nhé.'] },
];

export function LessonPage() {
  const { slug } = useParams();
  const { t, language, prefs } = usePreferences();
  const { speak, voiceControls } = useVoice();
  const { showToast } = useToast();
  const { data: lesson, error, loading, reload } = useResource(`/learning/lessons/${slug}`, { select: (d) => d.lesson });
  const [step, setStep] = useState(() => getLessonStep(slug));
  const [phase, setPhase] = useState('steps'); // steps | reflect | done
  const [saving, setSaving] = useState(null);
  const stepRef = useRef(null);

  const steps = lesson?.steps || [];
  const total = steps.length;
  const safeStep = Math.min(step, Math.max(total - 1, 0));
  const text = localize(steps[safeStep]?.body, language);

  // Remember the position; read new steps aloud when the user wants that.
  useEffect(() => {
    if (!lesson || phase !== 'steps') return;
    saveLessonStep(slug, safeStep, total);
    if (prefs.voiceAutoPlay || prefs.preferVoice) speak(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, safeStep, phase]);

  if (loading && !lesson) {
    return (
      <div className="page page-narrow" aria-busy="true">
        <Skeleton variant="title" />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }
  if (error) return <div className="page page-narrow"><ErrorState card title={t('This lesson could not be opened', 'পাঠটি খোলা যায়নি', 'यह पाठ नहीं खुल सका', 'Không mở được bài học')} message={error.message} onRetry={reload} secondary={<Button variant="ghost" to="/app/learn">{t('All lessons', 'সব পাঠ', 'सभी पाठ', 'Tất cả bài học')}</Button>} /></div>;
  if (!lesson) return null;

  const last = safeStep === total - 1;
  const tips = Array.isArray(lesson.safetyTips) ? lesson.safetyTips : [];
  const appSlug = lesson.application?.slug;
  const canPractise = appSlug && SIMULATED.includes(appSlug);

  const go = (n) => {
    voiceControls.stop();
    setStep(n);
    announce(t(`Step ${n + 1} of ${total}`, `ধাপ ${n + 1} / ${total}`, `चरण ${n + 1} / ${total}`, `Bước ${n + 1}/${total}`));
    stepRef.current?.focus({ preventScroll: true });
  };

  const complete = async (confidence) => {
    setSaving(confidence ?? 'skip');
    try {
      await post(`/learning/lessons/${slug}/complete`, { language, ...(confidence ? { confidence } : {}) }, { idempotent: true });
      clearLessonStep(slug);
      setPhase('done');
      speak(t('Well done. This lesson is saved in your Memory Book.', 'খুব ভালো। পাঠটি আপনার স্মৃতির খাতায় রাখা হয়েছে।', 'बहुत बढ़िया। यह पाठ आपकी याद की किताब में रखा गया।', 'Làm tốt lắm. Bài học đã được lưu vào Sổ ghi nhớ.'));
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="page page-narrow lesson-page">
      <div className="row-between rise">
        <Button variant="ghost" size="sm" icon={ArrowLeft} to="/app/learn">{t('All lessons', 'সব পাঠ', 'सभी पाठ', 'Tất cả bài học')}</Button>
        {lesson.application && (
          <span className="row" style={{ '--gap': 'var(--s-2)' }}>
            <AppLogo app={lesson.application.slug} name={lesson.application.displayName} size={32} />
            <span className="text-strong">{lesson.application.displayName}</span>
          </span>
        )}
      </div>

      <header className="stack rise" style={{ '--gap': 'var(--s-3)', '--i': 1 }}>
        <h1 className="h-page">{localize(lesson.title, language)}</h1>
        <p className="lead">{localize(lesson.description, language)}</p>
        {!hasTranslation(steps[0]?.body, language) && language !== 'en' && (
          <Alert tone="info">{t('This lesson is shown in English for now.', 'এই পাঠটি এখনো বাংলায় অনুবাদ হয়নি, তাই ইংরেজিতে দেখানো হচ্ছে।', 'यह पाठ अभी हिन्दी में अनुवादित नहीं है, इसलिए अंग्रेज़ी में दिख रहा है।', 'Bài học này chưa được dịch sang tiếng Việt nên đang hiển thị bằng tiếng Anh.')}</Alert>
        )}
      </header>

      {phase === 'steps' && total > 0 && (
        <>
          <div className="lesson-progress rise" style={{ '--i': 2 }}>
            <div className="row-between">
              <p className="eyebrow">{t(`Step ${safeStep + 1} of ${total}`, `ধাপ ${safeStep + 1} / ${total}`, `चरण ${safeStep + 1} / ${total}`, `Bước ${safeStep + 1}/${total}`)}</p>
              <span className="text-subtle">{Math.round((safeStep / total) * 100)}%</span>
            </div>
            <Stepper total={total} current={safeStep} />
          </div>

          <section className="card card-pad-lg lesson-step-card" aria-live="polite" ref={stepRef} tabIndex={-1} aria-label={t(`Step ${safeStep + 1}`, `ধাপ ${safeStep + 1}`, `चरण ${safeStep + 1}`, `Bước ${safeStep + 1}`)}>
            <span className="lesson-step-num" aria-hidden="true">{safeStep + 1}</span>
            <p key={safeStep} className="lesson-step-text step-in">{text}</p>
            {steps[safeStep]?.hint && <Alert tone="info" icon={Lightbulb}>{localize(steps[safeStep].hint, language)}</Alert>}
            <Button variant="tonal" icon={Volume2} className="self-start" onClick={() => speak(text)}>{t('Listen to this step', 'এই ধাপটি শুনুন', 'यह चरण सुनें', 'Nghe bước này')}</Button>
            <div className="lesson-nav">
              <Button variant="ghost" icon={ArrowLeft} onClick={() => go(safeStep - 1)} disabled={safeStep === 0}>{t('Back', 'আগে', 'पीछे', 'Quay lại')}</Button>
              {last ? (
                <Button size="lg" icon={Check} onClick={() => { voiceControls.stop(); setPhase('reflect'); }}>{t('I did it', 'আমি করেছি', 'मैंने कर लिया', 'Tôi đã làm xong')}</Button>
              ) : (
                <Button size="lg" arrow onClick={() => go(safeStep + 1)}>{t('Next step', 'পরের ধাপ', 'अगला चरण', 'Bước tiếp')}</Button>
              )}
            </div>
          </section>

          {tips.length > 0 && (
            <aside className="card card-gold lesson-tips" aria-label={t('Keep in mind', 'মনে রাখুন', 'याद रखें', 'Hãy nhớ')}>
              <ShieldCheck aria-hidden="true" />
              <div className="stack" style={{ '--gap': '4px' }}>
                <p className="text-strong">{t('Keep in mind', 'মনে রাখুন', 'याद रखें', 'Hãy nhớ')}</p>
                {tips.map((tip, i) => <p key={i}>{localize(tip, language)}</p>)}
              </div>
            </aside>
          )}
        </>
      )}

      {phase === 'reflect' && (
        <section className="card card-pad-lg stack rise" style={{ '--gap': 'var(--s-4)' }} aria-labelledby="reflect-h">
          <h2 id="reflect-h" className="h-section">{t('How did that feel?', 'কেমন লাগল?', 'कैसा लगा?', 'Bạn thấy thế nào?')}</h2>
          <p className="text-muted">{t('There is no wrong answer. It helps Guidia know when to offer more practice.', 'কোনো উত্তরই ভুল নয়। এতে Guidia বুঝবে কখন আরও অনুশীলন দেবে।', 'कोई जवाब गलत नहीं है। इससे Guidia समझेगा कब और अभ्यास देना है।', 'Không có câu trả lời sai. Điều này giúp Guidia biết khi nào nên cho bạn luyện thêm.')}</p>
          <div className="stack" role="radiogroup" aria-labelledby="reflect-h" style={{ '--gap': 'var(--choice-gap)' }}>
            {CONFIDENCE.map((c) => (
              <ChoiceCard key={c.value} size="lg" selected={saving === c.value} onSelect={() => !saving && complete(c.value)} title={t(...c.label)} body={t(...c.body)} />
            ))}
          </div>
          <div className="row-between">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setPhase('steps')} disabled={Boolean(saving)}>{t('Back to the steps', 'ধাপে ফিরুন', 'चरणों पर लौटें', 'Quay lại các bước')}</Button>
            <Button variant="link" onClick={() => complete(null)} state={saving === 'skip' ? 'loading' : 'idle'} disabled={Boolean(saving)}>{t('Skip this question', 'এই প্রশ্নটি বাদ দিন', 'यह सवाल छोड़ें', 'Bỏ qua câu hỏi này')}</Button>
          </div>
        </section>
      )}

      {phase === 'done' && (
        <section className="card card-pad-lg lesson-done rise">
          <SuccessState
            icon={PartyPopper}
            title={t('Lesson complete', 'পাঠ শেষ', 'पाठ पूरा', 'Hoàn thành bài học')}
            action={(
              <>
                {canPractise && <Button icon={Hand} to={`/app/practice/${appSlug}`}>{t('Practise it now', 'এখনই অনুশীলন করুন', 'अभी अभ्यास करें', 'Luyện tập ngay')}</Button>}
                <Button variant="secondary" to="/app/learn">{t('Choose another lesson', 'অন্য পাঠ বেছে নিন', 'दूसरा पाठ चुनें', 'Chọn bài khác')}</Button>
                <Button variant="ghost" to="/app/memory">{t('Open Memory Book', 'স্মৃতির খাতা খুলুন', 'याद की किताब खोलें', 'Mở Sổ ghi nhớ')}</Button>
              </>
            )}
          >
            <p className="text-muted">{t('Saved to your Memory Book, so you can listen again any time.', 'আপনার স্মৃতির খাতায় রাখা হয়েছে — যখন খুশি আবার শুনুন।', 'आपकी याद की किताब में रख दिया गया — कभी भी फिर सुनें।', 'Đã lưu vào Sổ ghi nhớ để bạn nghe lại bất cứ lúc nào.')}</p>
          </SuccessState>
        </section>
      )}
    </div>
  );
}
