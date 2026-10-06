import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Check, CircleHelp, HeartHandshake, Link2, LifeBuoy, MessageSquare, RotateCcw, Search,
  ShieldCheck, ShieldX, Smartphone, Sparkles, ThumbsDown, ThumbsUp, Volume2,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { useResource } from '../../hooks/useResource';
import { post } from '../../services/apiClient';
import { announce } from '../../utils/announce';
import { Alert, Badge, Button, PageHeader, SectionHeader, Segmented, riskMeta } from '../../components/ui';
import { SCAM_PRACTICE, TACTICS, TACTIC_WHY } from '../../data/scamPractice';
import { LessonCard } from './LearnPage';

function StageTrack({ stage, t }) {
  const stages = [t('Check', 'যাচাই', 'जांचें', 'Kiểm tra'), t('Understand', 'বুঝুন', 'समझें', 'Hiểu'), t('Respond', 'পদক্ষেপ', 'कदम उठाएं', 'Phản hồi')];
  return (
    <ol className="stage-track" aria-label={t('Steps', 'ধাপ', 'चरण', 'Các bước')}>
      {stages.map((s, i) => (
        <li key={s} data-state={i < stage ? 'done' : i === stage ? 'current' : 'todo'} aria-current={i === stage ? 'step' : undefined}>
          <span className="stage-num" aria-hidden="true">{i < stage ? <Check size={16} strokeWidth={3} /> : i + 1}</span>{s}
        </li>
      ))}
    </ol>
  );
}

function ScamChecker({ inputRef }) {
  const { t, language } = usePreferences();
  const { speak } = useVoice();
  const location = useLocation();
  const [type, setType] = useState('MESSAGE');
  const [content, setContent] = useState(() => location.state?.checkText || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState(null); // null | sending | sent
  const resultRef = useRef(null);

  const check = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true); setError(''); setResult(null); setFeedback(null);
    try {
      const data = await post('/safety/analyze', { contentType: type, content, language });
      setResult(data);
      announce(t(...riskMeta(data.severity).label));
      speak([t(...riskMeta(data.severity).label), data.aiContext, ...data.whatToDo].filter(Boolean).join('. '));
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const sendFeedback = async (verdict) => {
    setFeedback('sending');
    try { await post('/safety/feedback', { assessmentId: result.id, verdict }); } catch { /* non-blocking */ }
    setFeedback('sent');
    announce(t('Thank you. Your feedback was recorded for review.', 'ধন্যবাদ। আপনার মতামত পর্যালোচনার জন্য রাখা হয়েছে।', 'धन्यवाद। आपकी राय समीक्षा के लिए दर्ज की गई।', 'Cảm ơn bạn. Ý kiến đã được ghi lại để xem xét.'));
  };

  const reset = () => { setResult(null); setContent(''); setFeedback(null); inputRef.current?.focus(); };
  const meta = result ? riskMeta(result.severity) : null;
  const stage = result ? 2 : busy ? 1 : 0;

  return (
    <section className="card card-pad-lg checker" id="check" aria-labelledby="checker-h">
      <div className="stack" style={{ '--gap': 'var(--s-3)' }}>
        <div className="row-between">
          <h2 id="checker-h" className="h-section">{t('Check a message or link', 'মেসেজ বা লিংক যাচাই করুন', 'संदेश या लिंक जांचें', 'Kiểm tra tin nhắn hoặc đường link')}</h2>
          <StageTrack stage={stage} t={t} />
        </div>
        <p className="text-muted">{t('Paste what you received. Guidia explains what looks wrong — and what looks fine.', 'যা পেয়েছেন তা পেস্ট করুন। Guidia বলবে কী সন্দেহজনক — আর কী ঠিক আছে।', 'जो मिला उसे चिपकाएं। Guidia बताएगा क्या गड़बड़ है — और क्या ठीक है।', 'Dán nội dung bạn nhận được. Guidia sẽ giải thích điều gì đáng ngờ — và điều gì ổn.')}</p>
      </div>

      {!result && (
        <form className="stack" style={{ '--gap': 'var(--s-3)' }} onSubmit={check}>
          <Segmented label={t('What did you receive?', 'কী পেয়েছেন?', 'आपको क्या मिला?', 'Bạn nhận được gì?')} value={type} onChange={setType} options={[
            { value: 'MESSAGE', label: t('Message', 'মেসেজ', 'संदेश', 'Tin nhắn'), icon: MessageSquare },
            { value: 'SMS', label: 'SMS', icon: Smartphone },
            { value: 'URL', label: t('Link', 'লিংক', 'लिंक', 'Đường link'), icon: Link2 },
          ]} />
          <label htmlFor="scam-input" className="sr-only">{t('Message to check', 'যাচাইয়ের মেসেজ', 'जांचने वाला संदेश', 'Nội dung cần kiểm tra')}</label>
          <textarea
            id="scam-input" ref={inputRef} className="textarea checker-input" value={content} onChange={(e) => setContent(e.target.value)} maxLength={5000}
            placeholder={type === 'URL' ? 'https://…' : t('Paste the message here…', 'এখানে মেসেজটি পেস্ট করুন…', 'यहाँ संदेश चिपकाएं…', 'Dán tin nhắn vào đây…')}
          />
          <p className="text-subtle row row-top" style={{ '--gap': '6px', flexWrap: 'nowrap' }}>
            <ShieldCheck size={16} aria-hidden="true" style={{ marginTop: 3 }} />
            {t('If it contains a code or password, Guidia removes it before checking. Nothing is sent to anyone.', 'এতে কোড বা পাসওয়ার্ড থাকলে যাচাইয়ের আগে Guidia তা সরিয়ে দেয়। কারও কাছে কিছু পাঠানো হয় না।', 'इसमें कोड या पासवर्ड हो तो जांच से पहले Guidia उसे हटा देता है। किसी को कुछ नहीं भेजा जाता।', 'Nếu có mã hay mật khẩu, Guidia sẽ xóa trước khi kiểm tra. Không gửi cho ai cả.')}
          </p>
          {error && <Alert tone="warn">{error}</Alert>}
          <Button type="submit" size="lg" icon={Search} disabled={!content.trim()} state={busy ? 'loading' : 'idle'} loadingLabel={t('Checking this carefully…', 'ভালো করে যাচাই করছি…', 'ध्यान से जांच रहा हूँ…', 'Đang kiểm tra kỹ…')} className="self-start">
            {t('Check it', 'যাচাই করুন', 'जांचें', 'Kiểm tra')}
          </Button>
        </form>
      )}

      {result && (
        <div ref={resultRef} className={`risk-result tone-${meta.tone} rise`} aria-live="polite">
          <div className="risk-result-head">
            <span className="risk-result-icon" aria-hidden="true"><meta.Icon /></span>
            <div className="stack grow" style={{ '--gap': '4px' }}>
              <p className="risk-result-title">{t(...meta.label)}</p>
              {result.aiContext && <p className="risk-result-context">{result.aiContext}</p>}
            </div>
          </div>

          {result.whatLooksSuspicious.length > 0 && (
            <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
              <p className="h-card">{t('Why Guidia is concerned', 'কেন Guidia চিন্তিত', 'Guidia क्यों चिंतित है', 'Vì sao Guidia lo ngại')}</p>
              <ul className="reason-list">{result.whatLooksSuspicious.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          )}

          <div className="respond-grid">
            <div className="respond-col do">
              <p className="h-card row" style={{ '--gap': '8px' }}><ShieldCheck aria-hidden="true" /> {t('What to do', 'কী করবেন', 'क्या करें', 'Nên làm')}</p>
              <ul className="reason-list">{result.whatToDo.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
            <div className="respond-col avoid">
              <p className="h-card row" style={{ '--gap': '8px' }}><ShieldX aria-hidden="true" /> {t('What to avoid', 'কী করবেন না', 'क्या न करें', 'Không nên')}</p>
              <ul className="reason-list">{result.whatToAvoid.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          </div>

          <div className="btn-group">
            <Button variant="secondary" icon={Volume2} onClick={() => speak([t(...meta.label), result.aiContext, ...result.whatToDo].filter(Boolean).join('. '))}>{t('Listen', 'শুনুন', 'सुनें', 'Nghe')}</Button>
            {result.severity !== 'SAFE' && <Button variant="help" icon={HeartHandshake} to="/app/help">{t('Ask someone I trust', 'বিশ্বস্ত কাউকে বলুন', 'भरोसेमंद से पूछें', 'Nhờ người tin cậy')}</Button>}
            <Button variant="ghost" icon={RotateCcw} onClick={reset}>{t('Check another', 'আরেকটি যাচাই', 'दूसरा जांचें', 'Kiểm tra cái khác')}</Button>
          </div>

          <div className="feedback-row">
            {feedback === 'sent' ? (
              <p className="field-ok fade"><Check aria-hidden="true" />{t('Thank you — recorded for review by a person at Guidia.', 'ধন্যবাদ — Guidia-র একজন মানুষ পর্যালোচনা করবেন।', 'धन्यवाद — Guidia की टीम इसकी समीक्षा करेगी।', 'Cảm ơn — đã ghi lại để người của Guidia xem xét.')}</p>
            ) : (
              <>
                <span className="text-subtle">{t('Was this right?', 'এটা কি ঠিক ছিল?', 'क्या यह सही था?', 'Kết quả này đúng không?')}</span>
                <Button variant="quiet" size="sm" icon={ThumbsUp} disabled={feedback === 'sending'} onClick={() => sendFeedback('HELPFUL')}>{t('Yes', 'হ্যাঁ', 'हाँ', 'Đúng')}</Button>
                <Button variant="quiet" size="sm" icon={ThumbsDown} disabled={feedback === 'sending'} onClick={() => sendFeedback(result.severity === 'SAFE' ? 'MISSED_A_SCAM' : 'WARNING_SEEMS_WRONG')}>{t('Not quite', 'পুরোপুরি না', 'पूरी तरह नहीं', 'Chưa hẳn')}</Button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ScamPractice({ sectionRef }) {
  const { t, language } = usePreferences();
  const { speak } = useVoice();
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [clue, setClue] = useState(null);
  const [seen, setSeen] = useState(() => new Set());
  const item = SCAM_PRACTICE[i];
  const finished = i >= SCAM_PRACTICE.length;
  const message = item ? (item.message[language] || item.message.en) : '';

  const choose = (saysScam) => {
    const correct = saysScam === item.isScam;
    setAnswer({ saysScam, correct });
    setClue(item.tactics[0]);
    setSeen((s) => new Set([...s, ...item.tactics]));
    if (correct) setScore((s) => s + 1);
    speak(correct
      ? t('Well spotted.', 'ঠিক ধরেছেন।', 'सही पहचाना।', 'Bạn nhận ra đúng rồi.')
      : t("Let's look more closely at the clues.", 'চলুন সূত্রগুলো ভালো করে দেখি।', 'सुराग ध्यान से देखते हैं।', 'Cùng xem kỹ các dấu hiệu nhé.'));
  };

  const next = () => { setAnswer(null); setClue(null); setI((n) => n + 1); };
  const restart = () => { setAnswer(null); setClue(null); setI(0); setScore(0); setSeen(new Set()); };

  return (
    <section className="card card-pad-lg gym" id="practice" ref={sectionRef} aria-labelledby="gym-h">
      <div className="row-between">
        <div className="stack" style={{ '--gap': '4px' }}>
          <p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> {t('Scam Practice', 'প্রতারণা চেনার অনুশীলন', 'धोखा पहचानने का अभ्यास', 'Luyện nhận biết lừa đảo')}</p>
          <h2 id="gym-h" className="h-section">{t('Is this safe or a scam?', 'এটা নিরাপদ, নাকি প্রতারণা?', 'यह सुरक्षित है या धोखा?', 'An toàn hay lừa đảo?')}</h2>
        </div>
        {!finished && <Badge>{i + 1} / {SCAM_PRACTICE.length}</Badge>}
      </div>

      {finished ? (
        <div className="stack rise" style={{ '--gap': 'var(--s-4)' }}>
          <div className="gym-done">
            <span className="state-icon tone-ok pop" aria-hidden="true"><Sparkles /></span>
            <div className="stack" style={{ '--gap': '4px' }}>
              <p className="h-section">{t('Practice complete', 'অনুশীলন শেষ', 'अभ्यास पूरा', 'Hoàn thành luyện tập')}</p>
              <p className="text-subtle">{t(`You spotted ${score} of ${SCAM_PRACTICE.length}.`, `${SCAM_PRACTICE.length}টির মধ্যে ${score}টি ঠিক ধরেছেন।`, `${SCAM_PRACTICE.length} में से ${score} सही पहचाने।`, `Bạn nhận ra đúng ${score}/${SCAM_PRACTICE.length}.`)}</p>
            </div>
          </div>
          <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
            <p className="h-card">{t('Clues you learned to notice', 'যে সূত্রগুলো চিনতে শিখলেন', 'जो सुराग पहचानना सीखा', 'Những dấu hiệu bạn đã học')}</p>
            <div className="row" style={{ '--gap': 'var(--s-2)' }}>
              {[...seen].filter((k) => TACTICS[k]).map((k) => <span key={k} className="badge badge-brand">{t(...TACTICS[k])}</span>)}
            </div>
          </div>
          <p className="text-muted">{t('The clues matter more than the score. When unsure: pause, and check with someone you trust.', 'নম্বরের চেয়ে সূত্রগুলো বেশি জরুরি। নিশ্চিত না হলে থামুন, বিশ্বস্ত কারও সাথে যাচাই করুন।', 'अंक से ज़्यादा सुराग मायने रखते हैं। पक्का न हो तो रुकें और किसी भरोसेमंद से जांचें।', 'Dấu hiệu quan trọng hơn điểm số. Khi không chắc: dừng lại và hỏi người bạn tin.')}</p>
          <Button variant="secondary" icon={RotateCcw} onClick={restart} className="self-start">{t('Practise again', 'আবার অনুশীলন', 'फिर से अभ्यास', 'Luyện lại')}</Button>
        </div>
      ) : (
        <>
          <div className="phone-msg" key={item.id}>
            <div className="phone-msg-head">
              <span className="phone-msg-channel">{item.channel === 'SMS' ? <Smartphone aria-hidden="true" /> : <MessageSquare aria-hidden="true" />}{item.channel}</span>
              <span className="text-strong truncate">{item.from}</span>
            </div>
            <p className="phone-msg-body">{message}</p>
          </div>

          {!answer ? (
            <div className="gym-choices">
              <Button variant="quiet" size="lg" icon={ShieldX} onClick={() => choose(true)}>{t('Scam', 'প্রতারণা', 'धोखा', 'Lừa đảo')}</Button>
              <Button variant="quiet" size="lg" icon={ShieldCheck} onClick={() => choose(false)}>{t('Looks safe', 'নিরাপদ মনে হচ্ছে', 'सुरक्षित लगता है', 'Có vẻ an toàn')}</Button>
            </div>
          ) : (
            <div className="stack rise" style={{ '--gap': 'var(--s-3)' }}>
              <Alert tone={answer.correct ? 'ok' : 'info'} icon={answer.correct ? Check : CircleHelp}
                title={answer.correct ? t('Correct!', 'ঠিক!', 'सही!', 'Chính xác!') : t("Let's look more closely", 'চলুন ভালো করে দেখি', 'आइए ध्यान से देखें', 'Cùng xem kỹ hơn')}>
                {item.isScam ? t('This is a scam.', 'এটি প্রতারণা।', 'यह धोखा है।', 'Đây là lừa đảo.') : t('This one is genuine.', 'এটি আসল।', 'यह असली है।', 'Tin này là thật.')}
                {item.note && <> {t(...item.note)}</>}
              </Alert>
              <p className="h-card">{t('Tap a clue to see why it matters', 'সূত্রে চাপ দিয়ে কারণ দেখুন', 'सुराग पर दबाकर कारण देखें', 'Chạm vào dấu hiệu để xem vì sao')}</p>
              <div className="row" style={{ '--gap': 'var(--s-2)' }} role="group" aria-label={t('Clues', 'সূত্র', 'सुराग', 'Dấu hiệu')}>
                {item.tactics.map((k) => (
                  <button key={k} type="button" className="chip clue-chip" aria-pressed={clue === k} onClick={() => setClue(k)}>{t(...TACTICS[k])}</button>
                ))}
              </div>
              {clue && TACTIC_WHY[clue] && <p key={clue} className="clue-why fade" aria-live="polite">{t(...TACTIC_WHY[clue])}</p>}
              <Button arrow onClick={next} className="self-start">{i === SCAM_PRACTICE.length - 1 ? t('See my results', 'ফলাফল দেখুন', 'नतीजे देखें', 'Xem kết quả') : t('Next example', 'পরের উদাহরণ', 'अगला उदाहरण', 'Ví dụ tiếp theo')}</Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function SafetyPage() {
  const { t, language } = usePreferences();
  const inputRef = useRef(null);
  const gymRef = useRef(null);
  const location = useLocation();
  const lessons = useResource('/learning/lessons?domain=DIGITAL_SAFETY', { select: (d) => d.lessons });
  const safetyLessons = useMemo(() => (lessons.data || []).filter((l) => l.domain === 'DIGITAL_SAFETY').slice(0, 6), [lessons.data]);

  useEffect(() => { if (location.state?.checkText) inputRef.current?.focus(); }, [location.state]);

  return (
    <div className="page safety-page">
      <PageHeader
        eyebrow={t('Safety Center', 'নিরাপত্তা কেন্দ্র', 'सुरक्षा केंद्र', 'Trung tâm an toàn')}
        title={t('Calm checks before you act', 'কিছু করার আগে শান্তভাবে যাচাই', 'कुछ करने से पहले शांत जांच', 'Bình tĩnh kiểm tra trước khi làm')}
        description={t('Check a message, practise spotting tricks, and know exactly what to do if something already went wrong.', 'মেসেজ যাচাই করুন, প্রতারণা চেনার অনুশীলন করুন, আর ভুল হয়ে গেলে ঠিক কী করবেন জেনে নিন।', 'संदेश जांचें, चालें पहचानने का अभ्यास करें, और गलती हो जाए तो ठीक क्या करें जानें।', 'Kiểm tra tin nhắn, luyện nhận biết thủ đoạn, và biết chính xác cần làm gì nếu đã lỡ có chuyện.')}
      />

      <div className="safety-actions rise" style={{ '--i': 1 }}>
        <button type="button" className="safety-action is-primary" onClick={() => { inputRef.current?.focus(); inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
          <span className="safety-action-icon" aria-hidden="true"><Search /></span>
          <span className="stack" style={{ '--gap': '2px' }}><span className="h-card">{t('Check a message or link', 'মেসেজ বা লিংক যাচাই', 'संदेश या लिंक जांचें', 'Kiểm tra tin nhắn hoặc link')}</span><span className="text-sm">{t('Get a clear, calm answer', 'পরিষ্কার, শান্ত উত্তর পান', 'साफ़, शांत जवाब पाएं', 'Nhận câu trả lời rõ ràng')}</span></span>
        </button>
        <button type="button" className="safety-action" onClick={() => gymRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          <span className="safety-action-icon" aria-hidden="true"><Sparkles /></span>
          <span className="stack" style={{ '--gap': '2px' }}><span className="h-card">{t('Practise spotting scams', 'প্রতারণা চেনার অনুশীলন', 'धोखा पहचानने का अभ्यास', 'Luyện nhận biết lừa đảo')}</span><span className="text-sm text-muted">{t('Pretend messages, real clues', 'নকল মেসেজ, আসল সূত্র', 'नकली संदेश, असली सुराग', 'Tin giả, dấu hiệu thật')}</span></span>
        </button>
        <a className="safety-action" href="#safety-lessons">
          <span className="safety-action-icon" aria-hidden="true"><BookOpen /></span>
          <span className="stack" style={{ '--gap': '2px' }}><span className="h-card">{t('Learn to stay safer online', 'অনলাইনে নিরাপদ থাকতে শিখুন', 'ऑनलाइन सुरक्षित रहना सीखें', 'Học cách an toàn hơn trên mạng')}</span><span className="text-sm text-muted">{t('Short lessons', 'ছোট পাঠ', 'छोटे पाठ', 'Bài học ngắn')}</span></span>
        </a>
      </div>

      <div className="safety-layout">
        <ScamChecker inputRef={inputRef} />
        <ScamPractice sectionRef={gymRef} />
      </div>

      <section className="card card-warm mistake-card" aria-labelledby="mistake-h">
        <span className="icon-chip icon-chip-lg tone-coral" style={{ background: 'var(--card)' }} aria-hidden="true"><LifeBuoy /></span>
        <div className="stack grow" style={{ '--gap': 'var(--s-2)' }}>
          <h2 id="mistake-h" className="h-section">{t('I think I made a mistake', 'মনে হচ্ছে ভুল করে ফেলেছি', 'लगता है मुझसे गलती हो गई', 'Hình như tôi đã làm sai')}</h2>
          <p className="text-muted">{t('Clicked a strange link, or shared a code? Stay calm — there are clear steps to take, and you do not have to do them alone.', 'অদ্ভুত লিংকে চাপ দিয়েছেন বা কোড বলে ফেলেছেন? শান্ত থাকুন — পরিষ্কার ধাপ আছে, আর একা করতে হবে না।', 'अजीब लिंक खोल दिया या कोड बता दिया? शांत रहें — साफ कदम हैं, और आपको अकेले नहीं करना।', 'Lỡ bấm link lạ hay đọc mã cho ai? Bình tĩnh — có các bước rõ ràng, và bạn không phải làm một mình.')}</p>
        </div>
        <div className="btn-group">
          <Button variant="secondary" arrow to="/app/learn/i-clicked-a-bad-link">{t('Show me what to do', 'কী করব দেখান', 'क्या करूं दिखाएं', 'Chỉ tôi cách làm')}</Button>
          <Button variant="help" icon={HeartHandshake} to="/app/help">{t('Get help from a person', 'একজন মানুষের সাহায্য নিন', 'किसी व्यक्ति से मदद लें', 'Nhờ người giúp')}</Button>
        </div>
      </section>

      {safetyLessons.length > 0 && (
        <section className="section" id="safety-lessons" aria-labelledby="safety-lessons-h">
          <SectionHeader id="safety-lessons-h" title={t('Safety lessons', 'নিরাপত্তার পাঠ', 'सुरक्षा पाठ', 'Bài học an toàn')} action={<Button variant="ghost" size="sm" to="/app/learn" iconRight={ArrowRight}>{t('All lessons', 'সব পাঠ', 'सभी पाठ', 'Tất cả bài học')}</Button>} />
          <div className="lesson-grid">
            {safetyLessons.map((l) => <div key={l.slug}><LessonCard lesson={l} t={t} language={language} /></div>)}
          </div>
        </section>
      )}
    </div>
  );
}

