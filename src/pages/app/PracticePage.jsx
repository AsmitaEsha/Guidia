import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Award, Info, BookOpen, Check, ChevronRight, CircleAlert, Hand, HeartHandshake, Lightbulb, ListChecks,
  MessageCircle, RotateCcw, ShieldCheck, Sparkles, Volume2, X,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { useToast } from '../../context/ToastContext';
import { useResource } from '../../hooks/useResource';
import { post } from '../../services/apiClient';
import { localize } from '../../i18n';
import { announce } from '../../utils/announce';
import { APP_CATEGORIES, APP_CATEGORY_ORDER, skillName } from '../../data/catalog';
import { Alert, Badge, Button, EmptyState, ErrorState, IconButton, ModeLabel, PageHeader, ProgressBar, SectionHeader, Skeleton, Stepper, SuccessState } from '../../components/ui';
import AppLogo from '../../components/AppLogo';
import { SIMULATORS } from '../../components/sims/registry';
import SimBoundary from '../../components/sims/SimBoundary';
import { SimRoot } from '../../components/sims/kit/SimKit';

const RISK_NOTE = {
  HIGH: ['Includes money — extra safety checks', 'টাকা আছে — বাড়তি নিরাপত্তা যাচাই', 'पैसे शामिल — अतिरिक्त सुरक्षा जांच', 'Có liên quan đến tiền — kiểm tra kỹ hơn'],
  MEDIUM: ['Personal details — practise carefully', 'ব্যক্তিগত তথ্য — সাবধানে অনুশীলন', 'निजी जानकारी — ध्यान से अभ्यास', 'Thông tin cá nhân — luyện cẩn thận'],
  LOW: ['Everyday use — a gentle start', 'প্রতিদিনের ব্যবহার — সহজ শুরু', 'रोज़ का इस्तेमाल — आसान शुरुआत', 'Dùng hằng ngày — khởi đầu nhẹ nhàng'],
};

function PracticeNotice({ t }) {
  return (
    <div className="practice-notice rise" style={{ '--i': 1 }}>
      <span className="practice-notice-icon" aria-hidden="true"><ShieldCheck /></span>
      <div className="stack" style={{ '--gap': '2px' }}>
        <p className="text-strong">{t('Practice mode · Safe to explore', 'অনুশীলন মোড · নিশ্চিন্তে ঘুরে দেখুন', 'अभ्यास मोड · बेझिझक देखें', 'Chế độ luyện tập · Cứ thoải mái khám phá')}</p>
        <p className="text-muted">{t('Nothing here reaches the real world: no real messages, no real money, no real bookings.', 'এখান থেকে আসল কিছু হয় না: আসল মেসেজ, টাকা বা বুকিং যায় না।', 'यहाँ से असल में कुछ नहीं होता: न असली मैसेज, न पैसे, न बुकिंग।', 'Không có gì ở đây ảnh hưởng đến đời thật: không tin nhắn thật, không tiền thật, không đặt chỗ thật.')}</p>
      </div>
    </div>
  );
}

export function PracticeHomePage() {
  const { t, language } = usePreferences();
  const apps = useResource('/learning/applications', { select: (d) => d.applications.filter((a) => a.hasSimulation && SIMULATORS[a.slug]) });
  const active = useResource('/tasks/active', { select: (d) => d.task });

  const groups = {};
  for (const app of apps.data || []) (groups[app.category] ||= []).push(app);
  const ordered = APP_CATEGORY_ORDER.filter((c) => groups[c]).concat(Object.keys(groups).filter((c) => !APP_CATEGORY_ORDER.includes(c)));
  const resumable = active.data?.application && SIMULATORS[active.data.application.slug] ? active.data : null;

  return (
    <div className="page practice-home">
      <PageHeader
        eyebrow={t('Practice', 'অনুশীলন', 'अभ्यास', 'Luyện tập')}
        title={t('Practise safely', 'নিরাপদে অনুশীলন করুন', 'सुरक्षित अभ्यास करें', 'Luyện tập an toàn')}
        description={t('These look and feel like the real apps, so the real thing feels familiar later. Mistakes are part of learning.', 'এগুলো দেখতে ও চালাতে আসল অ্যাপের মতো, যাতে পরে আসলটা চেনা লাগে। ভুল করাও শেখার অংশ।', 'ये दिखने और चलाने में असली ऐप जैसे हैं, ताकि बाद में असली ऐप जाना-पहचाना लगे। गलतियाँ सीखने का हिस्सा हैं।', 'Chúng trông và dùng giống ứng dụng thật, để sau này bạn thấy quen thuộc. Sai cũng là một phần của việc học.')}
      />
      <PracticeNotice t={t} />

      {resumable && (
        <div className="card card-raised continue-card rise" style={{ '--i': 2 }}>
          <AppLogo app={resumable.application.slug} name={resumable.application.displayName} size={56} />
          <div className="stack grow" style={{ '--gap': '6px' }}>
            <p className="eyebrow">{t('Continue where you left off', 'যেখানে থেমেছিলেন', 'जहाँ छोड़ा था वहीं से', 'Tiếp tục từ chỗ dừng')}</p>
            <p className="h-card">{localize(resumable.scenario?.title, language)}</p>
            {resumable.totalSteps > 0 && <ProgressBar value={(100 * resumable.currentStepOrder) / resumable.totalSteps} size="sm" label={t('Progress', 'অগ্রগতি', 'प्रगति', 'Tiến độ')} />}
          </div>
          <Button arrow to={`/app/practice/${resumable.application.slug}`}>{t('Continue', 'চালিয়ে যান', 'जारी रखें', 'Tiếp tục')}</Button>
        </div>
      )}

      {apps.loading && !apps.data && <div className="app-grid"><Skeleton variant="card" height={180} count={6} /></div>}
      {apps.error && <ErrorState card title={t('Apps could not be loaded', 'অ্যাপ লোড করা যায়নি', 'ऐप लोड नहीं हो सके', 'Không tải được ứng dụng')} message={apps.error.message} onRetry={apps.reload} />}
      {apps.data?.length === 0 && <EmptyState card icon={Hand} title={t('No practice apps yet', 'এখনো অনুশীলন অ্যাপ নেই', 'अभी कोई अभ्यास ऐप नहीं', 'Chưa có ứng dụng luyện tập')} />}

      {ordered.map((category, gi) => (
        <section key={category} className="section rise" style={{ '--i': gi + 2 }} aria-labelledby={`cat-${category}`}>
          <SectionHeader id={`cat-${category}`} title={t(...(APP_CATEGORIES[category] || [category]))} />
          <div className="app-grid">
            {groups[category].map((app) => (
              <Link key={app.slug} to={`/app/practice/${app.slug}`} className="card card-link app-card">
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <AppLogo app={app.slug} name={app.displayName} size={56} />
                  {app.riskProfile === 'HIGH' && <Badge tone="gold" icon={ShieldCheck}>{t('Extra checks', 'বাড়তি যাচাই', 'अतिरिक्त जांच', 'Kiểm tra thêm')}</Badge>}
                </div>
                <span className="stack" style={{ '--gap': '4px' }}>
                  <span className="h-card">{app.displayName}</span>
                  <span className="text-subtle">{t(...(RISK_NOTE[app.riskProfile] || RISK_NOTE.LOW))}</span>
                </span>
                <span className="app-card-action">{t('Practise', 'অনুশীলন', 'अभ्यास', 'Luyện tập')} <ChevronRight aria-hidden="true" className="card-arrow" /></span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// Guided task controller: instruction, hint, recovery and completion.
function TaskPanel({ task, onChange, onClose, onRestart, t, language }) {
  const { speak, voiceControls } = useVoice();
  const { prefs } = usePreferences();
  const { showToast } = useToast();
  const [hint, setHint] = useState(null);
  const [recovery, setRecovery] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const steps = task.steps;
  const idx = task.currentStepOrder;
  const finished = idx >= steps.length;
  const instruction = localize(steps[Math.min(idx, steps.length - 1)]?.instruction, language);

  // Each new step: stop the old voice, announce and (if wanted) read it.
  useEffect(() => {
    voiceControls.stop();
    if (finished || !instruction) return;
    announce(`${t(`Step ${idx + 1} of ${steps.length}`, `ধাপ ${idx + 1} / ${steps.length}`, `चरण ${idx + 1} / ${steps.length}`, `Bước ${idx + 1}/${steps.length}`)}. ${instruction}`);
    if (prefs.voiceEnabled) speak(instruction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const call = async (fn) => {
    setBusy(true);
    try { await fn(); } catch (err) { showToast(err.message, 'danger'); } finally { setBusy(false); }
  };

  const done = () => call(async () => {
    const expected = steps[Math.min(idx, steps.length - 1)]?.expectedAction;
    const res = await post(`/tasks/${task.id}/actions`, { action: expected || 'STEP_DONE', version: task.version });
    setHint(null);
    if (res.correct === false) {
      setRecovery(localize(res.recovery, language) || t('Try the step again, slowly.', 'ধাপটি আবার ধীরে চেষ্টা করুন।', 'यह चरण फिर से धीरे करें।', 'Hãy thử lại bước này, từ từ thôi.'));
    } else {
      setRecovery(null);
    }
    onChange(res.task);
  });

  const askHint = () => call(async () => {
    const res = await post(`/tasks/${task.id}/hint`);
    setHint(localize(res.hint, language));
    onChange({ ...task, version: task.version + 1 });
  });

  const complete = () => call(async () => {
    const res = await post(`/tasks/${task.id}/complete`, { outcome: 'SUCCESS', language }, { idempotent: true });
    setResult(res);
    speak(res.independent
      ? t('Wonderful — you did it all by yourself.', 'চমৎকার — আপনি পুরোটা নিজেই করেছেন।', 'शानदार — आपने सब खुद किया।', 'Tuyệt vời — bạn đã tự làm hết.')
      : t('Well done. Next time, try it with fewer hints.', 'খুব ভালো। পরেরবার কম সাহায্য নিয়ে চেষ্টা করুন।', 'बहुत बढ़िया। अगली बार कम संकेत लेकर कोशिश करें।', 'Làm tốt lắm. Lần sau hãy thử với ít gợi ý hơn.'));
  });

  if (result) {
    const skill = task.scenario?.skillKey;
    return (
      <div className="task-panel">
        <SuccessState icon={Award} title={t('Practice complete', 'অনুশীলন শেষ', 'अभ्यास पूरा', 'Hoàn thành luyện tập')}>
          <div className="stack" style={{ '--gap': 'var(--s-3)', textAlign: 'left' }}>
            <Badge tone={result.independent ? 'ok' : 'gold'} size="lg" icon={result.independent ? Sparkles : Lightbulb}>
              {result.independent ? t('Done on your own', 'নিজে নিজে করেছেন', 'खुद से किया', 'Tự làm được') : t('Done with some help', 'একটু সাহায্যে করেছেন', 'थोड़ी मदद से किया', 'Làm được với chút trợ giúp')}
            </Badge>
            <p className="text-muted">
              {result.independent
                ? t('You did every step without hints. That is what independence looks like — it counts towards your progress.', 'কোনো ইঙ্গিত ছাড়াই সব ধাপ করেছেন। এটাই স্বাধীনতা — আপনার অগ্রগতিতে যোগ হয়েছে।', 'आपने बिना संकेत के हर चरण किया। यही आत्मनिर्भरता है — यह आपकी प्रगति में जुड़ गया।', 'Bạn làm mọi bước mà không cần gợi ý. Đó chính là tự lập — được tính vào tiến độ của bạn.')
                : t('Hints are there to help. Try again later without them to make the skill your own.', 'ইঙ্গিত সাহায্যের জন্যই। দক্ষতা নিজের করতে পরে ইঙ্গিত ছাড়া আবার চেষ্টা করুন।', 'संकेत मदद के लिए हैं। कौशल अपना बनाने के लिए बाद में बिना संकेत फिर कोशिश करें।', 'Gợi ý luôn sẵn để giúp. Lần sau hãy thử không dùng gợi ý để thành thạo.')}
            </p>
            {skill && <p className="text-subtle">{t('Skill practised', 'যে দক্ষতা অনুশীলন হলো', 'अभ्यास किया गया कौशल', 'Kỹ năng đã luyện')}: <strong>{skillName(skill, t)}</strong></p>}
          </div>
        </SuccessState>
        <div className="btn-group-stack">
          <Button icon={RotateCcw} onClick={onRestart}>{t('Try again', 'আবার চেষ্টা করুন', 'फिर कोशिश करें', 'Thử lại')}</Button>
          <Button variant="secondary" onClick={onClose}>{t('Choose another practice', 'অন্য অনুশীলন বেছে নিন', 'दूसरा अभ्यास चुनें', 'Chọn bài luyện khác')}</Button>
          <Button variant="ghost" icon={BookOpen} to="/app/progress">{t('Review this skill', 'দক্ষতাটি দেখুন', 'यह कौशल देखें', 'Xem lại kỹ năng')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-panel" aria-live="polite">
      <div className="row-between row-nowrap">
        <div className="stack" style={{ '--gap': '2px', minWidth: 0 }}>
          <p className="eyebrow">{t('Your task', 'আপনার কাজ', 'आपका काम', 'Nhiệm vụ của bạn')}</p>
          <p className="h-card">{localize(task.scenario?.title, language)}</p>
        </div>
        <IconButton icon={X} size="sm" label={t('Stop this practice', 'অনুশীলন বন্ধ করুন', 'अभ्यास रोकें', 'Dừng luyện tập')} onClick={onClose} />
      </div>
      <Stepper total={steps.length} current={Math.min(idx, steps.length)} />

      {finished ? (
        <div className="stack" style={{ '--gap': 'var(--s-3)' }}>
          <p className="task-instruction">{t('You have done every step. Ready to finish?', 'সব ধাপ শেষ। শেষ করবেন?', 'सारे चरण हो गए। समाप्त करें?', 'Bạn đã làm xong mọi bước. Kết thúc nhé?')}</p>
          <Button size="lg" icon={Check} onClick={complete} state={busy ? 'loading' : 'idle'}>{t('Finish', 'শেষ করুন', 'समाप्त करें', 'Hoàn tất')}</Button>
        </div>
      ) : (
        <>
          <p className="eyebrow">{t(`Step ${idx + 1} of ${steps.length}`, `ধাপ ${idx + 1} / ${steps.length}`, `चरण ${idx + 1} / ${steps.length}`, `Bước ${idx + 1}/${steps.length}`)}</p>
          <p key={idx} className="task-instruction step-in">{instruction}</p>
          {recovery && (
            <div className="task-recovery fade" role="alert">
              <CircleAlert aria-hidden="true" />
              <div className="stack" style={{ '--gap': '2px' }}>
                <p className="text-strong">{t('That did something different.', 'এতে অন্য কিছু হয়েছে।', 'इससे कुछ और हुआ।', 'Thao tác đó làm việc khác.')}</p>
                <p>{t('Try this instead:', 'এর বদলে এটি চেষ্টা করুন:', 'इसके बजाय यह करें:', 'Hãy thử cách này:')} {recovery}</p>
              </div>
            </div>
          )}
          {hint && (
            <div className="task-hint fade">
              <Lightbulb aria-hidden="true" />
              <p>{hint}</p>
            </div>
          )}
          <div className="task-actions">
            <Button arrow onClick={done} state={busy ? 'loading' : 'idle'} loadingLabel={t('Checking…', 'দেখছি…', 'जांच रहा हूँ…', 'Đang kiểm tra…')}>{recovery ? t('Try again', 'আবার চেষ্টা', 'फिर कोशिश', 'Thử lại') : t("I've done this", 'এটা করেছি', 'यह कर लिया', 'Tôi đã làm xong')}</Button>
            <IconButton icon={Volume2} variant="quiet" label={t('Listen', 'শুনুন', 'सुनें', 'Nghe')} onClick={() => speak(instruction)} />
            <Button variant="quiet" icon={Lightbulb} onClick={askHint} disabled={busy}>{t('Hint', 'ইঙ্গিত', 'संकेत', 'Gợi ý')}</Button>
          </div>
          <div className="task-help">
            <Button variant="ghost" size="sm" icon={MessageCircle} to="/app/ask">{t("I'm stuck — ask Guidia", 'আটকে গেছি — Guidia-কে জিজ্ঞাসা', 'अटक गया — Guidia से पूछें', 'Tôi bị kẹt — hỏi Guidia')}</Button>
            <Button variant="ghost" size="sm" icon={HeartHandshake} to="/app/help">{t('Ask someone I trust', 'বিশ্বস্ত কাউকে বলুন', 'भरोसेमंद से पूछें', 'Nhờ người tin cậy')}</Button>
          </div>
        </>
      )}
    </div>
  );
}

export function PracticeAppPage() {
  const { slug } = useParams();
  const { t, language } = usePreferences();
  const { showToast } = useToast();
  const apps = useResource('/learning/applications', { select: (d) => d.applications });
  const scenarios = useResource(`/learning/scenarios?application=${encodeURIComponent(slug)}`, { select: (d) => d.scenarios });
  const active = useResource('/tasks/active', { select: (d) => d.task });
  const [started, setTask] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [simKey, setSimKey] = useState(0);
  const [starting, setStarting] = useState(null);
  const [explain, setExplain] = useState(false);
  const [cheer, setCheer] = useState(0);
  const reporting = useRef(false);
  const Sim = SIMULATORS[slug];
  const app = apps.data?.find((a) => a.slug === slug);
  const appName = app?.displayName || slug;

  // Resume an unfinished practice for this app after a refresh.
  const resumable = !dismissed && active.data?.application?.slug === slug && active.data?.scenario ? active.data : null;
  const task = started ?? resumable;

  // The simulator reports what the learner did; when it is the current
  // step's expected action, the step completes on the server by itself.
  const currentStep = task && task.currentStepOrder < (task.steps?.length || 0) ? task.steps[task.currentStepOrder] : null;
  const expected = currentStep?.expectedAction || null;
  const onSimAction = useCallback(async (action) => {
    if (!task || !expected || action !== expected || reporting.current) return;
    reporting.current = true;
    try {
      const res = await post(`/tasks/${task.id}/actions`, { action, version: task.version });
      if (res.correct) { setTask(res.task); setCheer((n) => n + 1); }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      reporting.current = false;
    }
  }, [task, expected, showToast]);


  if (!Sim) {
    return (
      <div className="page page-narrow">
        <ErrorState card title={t('This practice app was not found', 'এই অনুশীলন অ্যাপটি পাওয়া যায়নি', 'यह अभ्यास ऐप नहीं मिला', 'Không tìm thấy ứng dụng luyện tập')} secondary={<Button to="/app/practice">{t('All practice apps', 'সব অনুশীলন অ্যাপ', 'सभी अभ्यास ऐप', 'Tất cả ứng dụng luyện tập')}</Button>} />
      </div>
    );
  }

  const start = async (scenarioSlug) => {
    setStarting(scenarioSlug);
    try {
      const { task: created } = await post('/tasks', { scenarioSlug, applicationSlug: slug, language });
      setTask(created);
      setDismissed(false);
      setSimKey((k) => k + 1);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setStarting(null);
    }
  };

  const stop = () => { setTask(null); setDismissed(true); active.reload(); };
  const restart = () => { const s = task?.scenario?.slug; setTask(null); if (s) start(s); };
  const progress = task && task.totalSteps ? Math.round((100 * Math.min(task.currentStepOrder, task.totalSteps)) / task.totalSteps) : null;

  return (
    <div className="page page-wide practice-app">
      <header className="sim-bar rise">
        <Button variant="ghost" size="sm" icon={ArrowLeft} to="/app/practice">{t('Exit', 'বের হন', 'बाहर निकलें', 'Thoát')}</Button>
        <span className="sim-bar-app">
          <AppLogo app={slug} name={appName} size={40} />
          <span className="stack" style={{ '--gap': 0, minWidth: 0 }}>
            <span className="text-strong truncate">{appName}</span>
            <span className="text-subtle truncate">{task ? localize(task.scenario?.title, language) : t('Free exploration', 'নিজের মতো ঘুরে দেখা', 'खुद से देखना', 'Tự do khám phá')}</span>
          </span>
        </span>
        {progress != null && <span className="sim-bar-progress hide-sm"><ProgressBar value={progress} size="sm" label={t('Task progress', 'কাজের অগ্রগতি', 'काम की प्रगति', 'Tiến độ')} /></span>}
        <ModeLabel>{t('Practice mode', 'অনুশীলন মোড', 'अभ्यास मोड', 'Chế độ luyện tập')}</ModeLabel>
        <IconButton icon={HeartHandshake} variant="quiet" to="/app/help" label={t('Get help', 'সাহায্য নিন', 'मदद लें', 'Nhờ giúp đỡ')} />
      </header>

      <div className="practice-layout">
        <aside className="practice-side">
          {task ? (
            <div className="card card-raised"><TaskPanel key={task.id} task={task} onChange={setTask} onClose={stop} onRestart={restart} t={t} language={language} /></div>
          ) : (
            <div className="card stack" style={{ '--gap': 'var(--s-4)' }}>
              <div className="stack" style={{ '--gap': '4px' }}>
                <h1 className="h-section">{t('Choose something to practise', 'কী অনুশীলন করবেন বেছে নিন', 'क्या अभ्यास करें चुनें', 'Chọn điều muốn luyện')}</h1>
                <p className="text-muted">{t('Guidia will guide you one step at a time. Or simply explore the app.', 'Guidia এক এক ধাপে দেখিয়ে দেবে। অথবা নিজের মতো অ্যাপটি ঘুরে দেখুন।', 'Guidia एक-एक कदम में बताएगा। या ऐप खुद देखें।', 'Guidia sẽ hướng dẫn từng bước. Hoặc bạn cứ tự khám phá.')}</p>
              </div>
              {scenarios.loading && !scenarios.data && <Skeleton height={64} count={3} style={{ marginBottom: 8 }} />}
              {scenarios.error && <ErrorState compact message={scenarios.error.message} onRetry={scenarios.reload} />}
              {scenarios.data?.length === 0 && <p className="text-muted">{t('No guided tasks for this app yet — explore freely.', 'এই অ্যাপের জন্য এখনো নির্দেশিত কাজ নেই — নিজের মতো দেখুন।', 'इस ऐप के लिए अभी कोई निर्देशित काम नहीं — खुद देखें।', 'Chưa có bài hướng dẫn cho ứng dụng này — hãy tự khám phá.')}</p>}
              <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
                {(scenarios.data || []).map((s) => (
                  <button key={s.slug} type="button" className="card card-link card-flat scenario-item" onClick={() => start(s.slug)} disabled={Boolean(starting)} aria-busy={starting === s.slug}>
                    <span className="icon-chip icon-chip-sm" aria-hidden="true"><ListChecks /></span>
                    <span className="stack grow" style={{ '--gap': '2px', textAlign: 'left' }}>
                      <span className="list-item-title">{localize(s.title, language)}</span>
                      <span className="text-subtle">{s._count.steps} {t('steps', 'ধাপ', 'चरण', 'bước')}</span>
                    </span>
                    {starting === s.slug ? <span className="spin" aria-hidden="true"><RotateCcw size={18} /></span> : <ChevronRight className="card-arrow" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Alert tone="ok" icon={ShieldCheck}>{t('Pretend money and messages only. Mistakes are safe here.', 'শুধু নকল টাকা ও মেসেজ। এখানে ভুল করলেও ক্ষতি নেই।', 'केवल नकली पैसे और मैसेज। यहाँ गलती से कोई नुकसान नहीं।', 'Chỉ có tiền và tin nhắn giả. Sai ở đây không sao cả.')}</Alert>
        </aside>

        <section className="device-stage" aria-label={t(`${appName} practice app`, `${appName} অনুশীলন অ্যাপ`, `${appName} अभ्यास ऐप`, `Ứng dụng luyện tập ${appName}`)}>
          <div className="device-toolbar">
            <span className="text-subtle row" style={{ '--gap': '6px' }}><Hand size={16} aria-hidden="true" /> {t('Simulated app — tap anything', 'নকল অ্যাপ — যেকোনো কিছুতে চাপুন', 'नकली ऐप — कुछ भी दबाएं', 'Ứng dụng mô phỏng — chạm thoải mái')}</span>
            <span className="row" style={{ '--gap': 'var(--s-2)' }}>
              <Button variant={explain ? 'primary' : 'secondary'} size="sm" icon={Info} aria-pressed={explain} onClick={() => setExplain((v) => !v)}>
                {explain ? t('Explaining — tap any button', 'ব্যাখ্যা চালু — যেকোনো বোতামে চাপুন', 'समझा रहे हैं — कोई भी बटन दबाएं', 'Đang giải thích — chạm nút bất kỳ') : t("What's this?", 'এটা কী?', 'यह क्या है?', 'Đây là gì?')}
              </Button>
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setSimKey((k) => k + 1)}>{t('Start the app again', 'অ্যাপটি আবার শুরু করুন', 'ऐप फिर से शुरू करें', 'Mở lại ứng dụng')}</Button>
            </span>
          </div>
          {explain && <p className="sim-explain-hint">{t(`"What's this?" is on: tapping a button explains it instead of pressing it. Turn it off to use the app.`, '"এটা কী?" চালু: কোনো বোতামে চাপলে সেটা কাজ না করে ব্যাখ্যা দেখাবে। অ্যাপ ব্যবহার করতে এটি বন্ধ করুন।', '"यह क्या है?" चालू: बटन दबाने पर वह काम नहीं करेगा, बल्कि समझाएगा। ऐप चलाने के लिए इसे बंद करें।', '"Đây là gì?" đang bật: chạm nút sẽ giải thích thay vì bấm. Tắt đi để dùng ứng dụng.')}</p>}
          <div className="device-frame">
            <div className="device-screen legacy-scope">
              <Suspense fallback={<div className="state"><Skeleton variant="card" height={420} /></div>}>
                <SimRoot t={t} language={language} expect={explain ? null : expected} coach={currentStep ? localize(currentStep.instruction, language) : null} onAction={onSimAction} explainMode={explain}>
                  <SimBoundary key={simKey} t={t} onRestart={() => setSimKey((k) => k + 1)}>
                    <Sim onClose={() => setSimKey((k) => k + 1)} />
                  </SimBoundary>
                </SimRoot>
              </Suspense>
              {cheer > 0 && <span key={cheer} className="sim-cheer" aria-hidden="true">✓</span>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
