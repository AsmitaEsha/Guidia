import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookCheck, BookOpen, Hand, History, Info, Loader2, MessageCirclePlus, Mic, MicOff, RotateCcw, ScanSearch,
  Send, ShieldAlert, ShieldCheck, Trash2, Users, Volume2, HeartHandshake, Square,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { useCapabilities } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import { del, get, post } from '../../services/apiClient';
import { useResource } from '../../hooks/useResource';
import { formatMoney, formatRelative } from '../../i18n';
import { announce } from '../../utils/announce';
import { Alert, Button, ConfirmDialog, IconButton, KeyValue, RiskBadge, Sheet, Skeleton } from '../../components/ui';
import { GuidiaMark } from '../../components/GuidiaLogo';
import { useVoiceState, voiceStateLabel } from '../../components/voice/voiceState';

const RISK_FROM_LEVEL = { LOW: 'SAFE', MEDIUM: 'WARNING', HIGH: 'HIGH_RISK', CRITICAL: 'CRITICAL' };
const PRACTICE_APPS = ['whatsapp', 'facebook', 'messenger', 'gmail', 'bkash', 'nagad', 'momo', 'googlepay', 'paypal', 'booking', 'practo', 'amazon'];
const DRAFT_KEY = 'guidia.ask.draft';
const CONVO_KEY = 'guidia.ask.conversation';

const store = {
  get(key) { try { return sessionStorage.getItem(key) || ''; } catch { return ''; } },
  set(key, value) { try { if (value) sessionStorage.setItem(key, value); else sessionStorage.removeItem(key); } catch { /* storage unavailable */ } },
};

const spoken = (m) => [m.reply, ...(m.steps || []), m.safetyNote].filter(Boolean).join('. ');

// Highlights numbers and amounts in a voice transcript so the user can
// confirm critical details ("I heard: send 500 taka to 017…").
function Highlighted({ text }) {
  const parts = String(text).split(/(\d[\d,.\s]*\d|\d)/g);
  return parts.map((p, i) => (/\d/.test(p) ? <mark key={i} className="heard-mark">{p}</mark> : <span key={i}>{p}</span>));
}

function practiceAppFor(m) {
  if (m.proposedAction?.application && PRACTICE_APPS.includes(m.proposedAction.application)) return m.proposedAction.application;
  const slug = m.sources?.[0]?.slug || '';
  return PRACTICE_APPS.find((a) => slug.startsWith(`${a}-`)) || null;
}

function ActionPreview({ pa, t, language }) {
  const risk = RISK_FROM_LEVEL[pa.evaluation?.risk] || 'UNKNOWN';
  return (
    <div className="action-preview">
      <div className="row-between">
        <p className="h-card">{t('Before doing this for real', 'আসলে করার আগে', 'असल में करने से पहले', 'Trước khi làm thật')}</p>
        <RiskBadge severity={risk} t={t} />
      </div>
      <KeyValue
        items={[
          pa.type && [t('What', 'কী', 'क्या', 'Việc gì'), pa.type.replace(/_/g, ' ').toLowerCase()],
          pa.recipientLabel && [t('Who', 'কাকে', 'किसे', 'Cho ai'), pa.recipientLabel],
          pa.amountMinor != null && pa.currency && [t('Amount', 'পরিমাণ', 'रकम', 'Số tiền'), formatMoney(pa.amountMinor, pa.currency, language)],
          [t('Consequence', 'ফলাফল', 'नतीजा', 'Hệ quả'), pa.evaluation?.allowed === false
            ? t('Guidia would not continue with this.', 'Guidia এটি চালিয়ে যাবে না।', 'Guidia इसे आगे नहीं बढ़ाएगा।', 'Guidia sẽ không tiếp tục việc này.')
            : t('Real money would leave your account.', 'আসল টাকা আপনার অ্যাকাউন্ট থেকে চলে যাবে।', 'असली पैसे आपके खाते से जाएंगे।', 'Tiền thật sẽ rời khỏi tài khoản của bạn.')],
          pa.evaluation?.requiresConfirmation && [t('Next step', 'পরের ধাপ', 'अगला कदम', 'Bước tiếp'), t(`Check ${pa.evaluation.confirmationLevel} things first`, `আগে ${pa.evaluation.confirmationLevel}টি বিষয় যাচাই`, `पहले ${pa.evaluation.confirmationLevel} बातें जांचें`, `Kiểm tra ${pa.evaluation.confirmationLevel} điều trước`)],
        ]}
      />
      <p className="text-subtle">{t('Guidia never moves real money. You can practise this safely first.', 'Guidia কখনো আসল টাকা পাঠায় না। আগে নিরাপদে অনুশীলন করে নিন।', 'Guidia कभी असली पैसा नहीं भेजता। पहले सुरक्षित अभ्यास करें।', 'Guidia không bao giờ chuyển tiền thật. Bạn có thể luyện tập an toàn trước.')}</p>
    </div>
  );
}

function AssistantMessage({ m, t, language, onListen, onFocusInput, userText }) {
  const navigate = useNavigate();
  const app = practiceAppFor(m);
  const lessonSlug = m.grounding === 'VERIFIED_GUIDIA' ? m.sources?.[0]?.slug : null;
  const safetyish = ['SCAM_CHECK', 'SAFETY_CHECK'].includes(m.intent) || (m.messageRisk && m.messageRisk !== 'SAFE');
  const screenish = ['CHECK_SCREEN', 'EXPLAIN_SCREEN'].includes(m.intent);
  const helpish = ['CONTACT_GUARDIAN', 'REQUEST_HELP'].includes(m.intent);
  const unsure = m.grounding === 'UNKNOWN';

  return (
    <div className="msg msg-ai rise">
      <span className="msg-avatar" aria-hidden="true"><GuidiaMark size={30} title="" /></span>
      <div className="msg-body">
        {unsure && (
          <p className="msg-unsure"><Info aria-hidden="true" />{t("Guidia isn't sure yet.", 'Guidia এখনো নিশ্চিত নয়।', 'Guidia अभी पक्का नहीं है।', 'Guidia chưa chắc chắn.')}</p>
        )}
        {m.reply && <p className="msg-answer">{m.reply}</p>}
        {m.steps?.length > 0 && (
          <ol className="msg-steps">
            {m.steps.map((s, i) => <li key={i}><span className="msg-step-num" aria-hidden="true">{i + 1}</span><span>{s}</span></li>)}
          </ol>
        )}
        {m.needsClarification && m.clarifyingQuestion && <p className="msg-clarify">{m.clarifyingQuestion}</p>}
        {m.safetyNote && (
          <div className="msg-safe-next">
            <ShieldAlert aria-hidden="true" />
            <div>
              <p className="text-strong">{t('Safe next step', 'নিরাপদ পরের ধাপ', 'सुरक्षित अगला कदम', 'Bước an toàn tiếp theo')}</p>
              <p>{m.safetyNote}</p>
            </div>
          </div>
        )}
        {m.proposedAction && <ActionPreview pa={m.proposedAction} t={t} language={language} />}

        <div className="msg-meta">
          {m.grounding === 'VERIFIED_GUIDIA' && <span className="badge badge-ok"><BookCheck aria-hidden="true" /> {t('From a Guidia lesson', 'Guidia-র পাঠ থেকে', 'Guidia के पाठ से', 'Từ bài học Guidia')}</span>}
          {m.grounding === 'MODEL_INTERPRETATION' && <span className="badge badge-info"><Info aria-hidden="true" /> {t('General guidance — screens can differ', 'সাধারণ নির্দেশনা — স্ক্রিন আলাদা হতে পারে', 'सामान्य मार्गदर्शन — स्क्रीन अलग हो सकती है', 'Hướng dẫn chung — màn hình có thể khác')}</span>}
          {m.degraded && <span className="badge">{t('Simple mode', 'সহজ মোড', 'सरल मोड', 'Chế độ đơn giản')}</span>}
        </div>

        <div className="msg-actions">
          <Button variant="tonal" size="sm" icon={Volume2} onClick={() => onListen(m)}>{t('Listen', 'শুনুন', 'सुनें', 'Nghe')}</Button>
          {app && <Button variant="secondary" size="sm" icon={Hand} to={`/app/practice/${app}`}>{t('Practise this', 'এটি অনুশীলন করুন', 'इसका अभ्यास करें', 'Luyện việc này')}</Button>}
          {lessonSlug && <Button variant="ghost" size="sm" icon={BookOpen} to={`/app/learn/${lessonSlug}`}>{t('Open the lesson', 'পাঠটি খুলুন', 'पाठ खोलें', 'Mở bài học')}</Button>}
          {safetyish && <Button variant="ghost" size="sm" icon={ShieldCheck} onClick={() => navigate('/app/safety', { state: { checkText: userText } })}>{t('Check this in Safety', 'নিরাপত্তায় যাচাই করুন', 'सुरक्षा में जांचें', 'Kiểm tra trong An toàn')}</Button>}
          {screenish && <Button variant="ghost" size="sm" icon={ScanSearch} to="/app/screen">{t('Understand my screen', 'আমার স্ক্রিন বুঝুন', 'मेरी स्क्रीन समझें', 'Hiểu màn hình của tôi')}</Button>}
          {(helpish || unsure) && <Button variant="ghost" size="sm" icon={HeartHandshake} to="/app/help">{t('Ask someone I trust', 'বিশ্বস্ত কাউকে বলুন', 'भरोसेमंद से पूछें', 'Nhờ người tin cậy')}</Button>}
          {unsure && <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onFocusInput}>{t('Ask another way', 'অন্যভাবে জিজ্ঞাসা', 'दूसरे तरीके से पूछें', 'Hỏi cách khác')}</Button>}
        </div>
      </div>
    </div>
  );
}

// Suggested questions. A conversation started from one is titled with its
// words; showing them through this list keeps the title in today's
// language even if it was asked in another one.
const SUGGESTIONS = [
  ['How do I send a photo?', 'কীভাবে ছবি পাঠাব?', 'फोटो कैसे भेजूं?', 'Làm sao để gửi ảnh?'],
  ['Is this message safe?', 'এই মেসেজটি কি নিরাপদ?', 'क्या यह मैसेज सुरक्षित है?', 'Tin nhắn này có an toàn không?'],
  ['How do I book an appointment?', 'কীভাবে অ্যাপয়েন্টমেন্ট বুক করব?', 'अपॉइंटमेंट कैसे बुक करूं?', 'Làm sao để đặt lịch hẹn?'],
  ['Where do I press?', 'কোথায় চাপব?', 'कहाँ दबाऊं?', 'Tôi nên bấm vào đâu?'],
  ['Can you explain this?', 'এটা কি বুঝিয়ে বলবেন?', 'क्या आप यह समझा सकते हैं?', 'Bạn giải thích giúp được không?'],
];
const SUGGESTION_BY_TEXT = new Map(SUGGESTIONS.flatMap((q) => q.map((text) => [text, q])));

/** A suggested question in the current language; anything typed stays as typed. */
function inLanguage(text, t) {
  const q = SUGGESTION_BY_TEXT.get((text || '').trim());
  return q ? t(...q) : text;
}

function HistoryList({ t, language, list, activeId, onOpen, onDelete, onNew }) {
  return (
    <div className="stack" style={{ '--gap': 'var(--s-3)' }}>
      <Button variant="secondary" block icon={MessageCirclePlus} onClick={onNew}>{t('New conversation', 'নতুন কথোপকথন', 'नई बातचीत', 'Cuộc trò chuyện mới')}</Button>
      {list.loading && !list.data && <Skeleton count={4} height={56} style={{ marginBottom: 8 }} />}
      {list.data?.length === 0 && <p className="text-muted">{t('Your past conversations will appear here.', 'আগের কথোপকথন এখানে দেখা যাবে।', 'पिछली बातचीत यहाँ दिखेंगी।', 'Các cuộc trò chuyện trước sẽ hiện ở đây.')}</p>}
      <ul className="history-list">
        {(list.data || []).map((c) => (
          <li key={c.id} className="history-item" data-active={c.id === activeId}>
            <button type="button" className="history-open" onClick={() => onOpen(c.id)} aria-current={c.id === activeId ? 'true' : undefined}>
              <span className="truncate text-strong">{inLanguage(c.title, t) || t('Conversation', 'কথোপকথন', 'बातचीत', 'Cuộc trò chuyện')}</span>
              <span className="text-subtle">{formatRelative(c.lastMessageAt || c.createdAt, language)}</span>
            </button>
            <IconButton icon={Trash2} size="sm" label={t('Delete conversation', 'কথোপকথন মুছুন', 'बातचीत मिटाएं', 'Xóa cuộc trò chuyện')} onClick={() => onDelete(c)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AskPage() {
  const { t, language, mode, prefs } = usePreferences();
  const { speak, listen, listening, stopListening, listenSupported, voiceControls } = useVoice();
  const voiceState = useVoiceState();
  const caps = useCapabilities();
  const { showToast } = useToast();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(() => store.get(CONVO_KEY) || undefined);
  const [input, setInput] = useState(() => location.state?.prefill || store.get(DRAFT_KEY));
  const [inputSource, setInputSource] = useState('TEXT');
  const [heard, setHeard] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingConvo, setLoadingConvo] = useState(() => Boolean(store.get(CONVO_KEY)));
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const history = useResource('/assistant/conversations', { select: (d) => d.conversations });
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const stickToBottom = useRef(true);

  // Keep a typed draft through navigation (this browser tab only).
  useEffect(() => { store.set(DRAFT_KEY, input); }, [input]);
  useEffect(() => { store.set(CONVO_KEY, conversationId || ''); }, [conversationId]);

  const scrollToEnd = useCallback(() => {
    const el = logRef.current;
    if (el && stickToBottom.current) el.scrollTo({ top: el.scrollHeight, behavior: prefs.reducedMotion ? 'auto' : 'smooth' });
  }, [prefs.reducedMotion]);
  useEffect(scrollToEnd, [messages, busy, scrollToEnd]);

  // Loads a stored conversation; state is only set after the response,
  // so it is safe to call from an effect.
  const loadConversation = useCallback((id) => get(`/assistant/conversations/${id}`)
    .then(({ conversation }) => {
      setConversationId(conversation.id);
      setMessages(conversation.messages.map((msg) => (msg.role === 'USER'
        ? { role: 'user', id: msg.id, text: msg.content }
        : { role: 'assistant', id: msg.id, ...(msg.structured || { reply: msg.content }), grounding: msg.grounding ?? msg.structured?.grounding })));
      stickToBottom.current = true;
    })
    .catch((err) => {
      if (err.status === 404) { setConversationId(undefined); setMessages([]); } else setError(err.message);
    })
    .finally(() => setLoadingConvo(false)), []);

  const openConversation = (id) => {
    setHistoryOpen(false);
    setLoadingConvo(true);
    setError('');
    loadConversation(id);
  };

  // Restore the conversation this tab was in.
  useEffect(() => {
    const saved = store.get(CONVO_KEY);
    if (saved) loadConversation(saved);
  }, [loadConversation]);

  const newConversation = () => {
    voiceControls.stop();
    setHistoryOpen(false);
    setConversationId(undefined);
    setMessages([]);
    setError('');
    setInput('');
    inputRef.current?.focus();
  };

  const send = async (text = input) => {
    const message = text.trim();
    if (!message || busy) return;
    voiceControls.stop();
    setError('');
    setInput('');
    setHeard('');
    stickToBottom.current = true;
    setMessages((list) => [...list, { role: 'user', text: message, id: `u${Date.now()}` }]);
    setBusy(true);
    try {
      const data = await post('/assistant/message', { message, conversationId, language, cognitiveState: mode.toUpperCase(), source: inputSource });
      setConversationId(data.conversationId);
      setMessages((list) => {
        const next = [...list];
        if (data.secretsRemoved) {
          const lastUser = next.findLastIndex((x) => x.role === 'user');
          if (lastUser >= 0) next[lastUser] = { ...next[lastUser], secretRemoved: true };
        }
        return [...next, { role: 'assistant', id: `a${Date.now()}`, ...data }];
      });
      announce(t('Guidia answered.', 'Guidia উত্তর দিয়েছে।', 'Guidia ने जवाब दिया।', 'Guidia đã trả lời.'));
      if (prefs.voiceAutoPlay || prefs.preferVoice || inputSource === 'VOICE') speak(spoken(data));
      if (!conversationId) history.reload();
    } catch (err) {
      setError(err.message);
      setMessages((list) => list.slice(0, -1));
      setInput(message);
    } finally {
      setBusy(false);
      setInputSource('TEXT');
      inputRef.current?.focus();
    }
  };

  const mic = useCallback(async () => {
    if (listening) { stopListening(); return; }
    setError('');
    try {
      const transcript = await listen();
      // The user reviews (and can edit) what Guidia heard before sending.
      setInput(transcript);
      setHeard(transcript);
      setInputSource('VOICE');
      inputRef.current?.focus();
    } catch {
      setError(t("Guidia couldn't hear that. Please try again, or type your question.", 'Guidia শুনতে পায়নি। আবার চেষ্টা করুন বা লিখে প্রশ্ন করুন।', 'Guidia सुन नहीं पाया। फिर कोशिश करें या लिखकर पूछें।', 'Guidia chưa nghe rõ. Hãy thử lại hoặc gõ câu hỏi.'));
    }
  }, [listening, stopListening, listen, t]);

  // Opened from the global voice control: start listening straight away.
  useEffect(() => {
    if (params.get('listen') !== '1') return;
    setParams({}, { replace: true });
    if (!listenSupported) return undefined;
    const id = setTimeout(mic, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await del(`/assistant/conversations/${toDelete.id}`);
      if (toDelete.id === conversationId) newConversation();
      history.mutate((list) => (list || []).filter((c) => c.id !== toDelete.id));
      showToast(t('Conversation deleted.', 'কথোপকথন মুছে ফেলা হয়েছে।', 'बातचीत मिटा दी गई।', 'Đã xóa cuộc trò chuyện.'), 'success');
      setToDelete(null);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setDeleting(false);
    }
  };

  const suggestions = SUGGESTIONS.map((q) => t(...q));

  const lastUserText = (i) => messages.slice(0, i).reverse().find((x) => x.role === 'user')?.text || '';
  const composerState = listening ? 'listening' : busy ? 'processing' : 'ready';

  const historyProps = { t, language, list: history, activeId: conversationId, onOpen: openConversation, onDelete: setToDelete, onNew: newConversation };

  return (
    <div className="page page-wide ask-page">
      <div className="ask-layout">
        <aside className="ask-history card hide-md" aria-label={t('Past conversations', 'আগের কথোপকথন', 'पिछली बातचीत', 'Cuộc trò chuyện trước')}>
          <h2 className="h-card row" style={{ '--gap': '8px' }}><History size={20} aria-hidden="true" /> {t('Conversations', 'কথোপকথন', 'बातचीत', 'Cuộc trò chuyện')}</h2>
          <HistoryList {...historyProps} />
        </aside>

        <section className="ask-studio card card-pad-0" aria-labelledby="ask-title">
          <header className="ask-head">
            <span className="ask-head-avatar" aria-hidden="true"><GuidiaMark size={36} title="" /></span>
            <div className="stack grow" style={{ '--gap': '0' }}>
              <h1 id="ask-title" className="h-section">{t('Ask Guidia', 'Guidia-কে জিজ্ঞাসা', 'Guidia से पूछें', 'Hỏi Guidia')}</h1>
              <p className="text-subtle row" style={{ '--gap': '6px' }}>
                <span className={`status-dot ${voiceState === 'listening' ? 'is-live' : caps.assistant ? 'is-on' : 'is-warn'}`} aria-hidden="true" />
                {voiceState === 'ready' || voiceState === 'off'
                  ? (caps.assistant ? t('Ready to help', 'সাহায্যের জন্য প্রস্তুত', 'मदद के लिए तैयार', 'Sẵn sàng giúp') : t('Lessons only right now', 'এখন শুধু পাঠ থেকে', 'अभी केवल पाठ से', 'Hiện chỉ từ bài học'))
                  : voiceStateLabel(voiceState, t)}
              </p>
            </div>
            <Button variant="quiet" size="sm" icon={History} className="show-md" onClick={() => setHistoryOpen(true)}>{t('History', 'আগের', 'पिछली', 'Lịch sử')}</Button>
            <IconButton icon={MessageCirclePlus} label={t('New conversation', 'নতুন কথোপকথন', 'नई बातचीत', 'Cuộc trò chuyện mới')} onClick={newConversation} />
          </header>

          {!caps.assistant && (
            <div className="ask-notice">
              <Alert tone="info" title={t('Guidia’s AI helper is resting right now', 'Guidia-র এআই সহকারী এখন বন্ধ আছে', 'Guidia का AI सहायक अभी बंद है', 'Trợ lý AI của Guidia đang tạm nghỉ')}
                actions={<><Button size="sm" variant="secondary" to="/app/learn">{t('Browse lessons', 'পাঠ দেখুন', 'पाठ देखें', 'Xem bài học')}</Button><Button size="sm" variant="ghost" to="/app/safety">{t('Safety resources', 'নিরাপত্তা', 'सुरक्षा', 'An toàn')}</Button><Button size="sm" variant="ghost" to="/app/help">{t('Get help', 'সাহায্য নিন', 'मदद लें', 'Nhờ giúp đỡ')}</Button></>}>
                {t('You can still ask: when a reviewed Guidia lesson matches your question, you will get that lesson.', 'তবুও প্রশ্ন করতে পারেন: Guidia-র যাচাই করা পাঠ মিললে সেটিই দেখাবে।', 'फिर भी पूछ सकते हैं: अगर Guidia का जाँचा हुआ पाठ मिलेगा तो वही दिखेगा।', 'Bạn vẫn có thể hỏi: nếu có bài học Guidia phù hợp, bạn sẽ nhận được bài đó.')}
              </Alert>
            </div>
          )}

          <div
            className="ask-log" ref={logRef} aria-live="polite" aria-busy={busy}
            onScroll={(e) => { const el = e.currentTarget; stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}
          >
            {loadingConvo && <Skeleton variant="card" height={120} count={2} style={{ marginBottom: 16 }} />}
            {!loadingConvo && messages.length === 0 && (
              <div className="ask-empty fade">
                <GuidiaMark size={64} title="" />
                <p className="h-section">{t('What would you like to know?', 'কী জানতে চান?', 'आप क्या जानना चाहेंगे?', 'Bạn muốn biết điều gì?')}</p>
                <p className="text-muted">{t('Ask in your own words — by typing or speaking. Guidia will never ask for your password, PIN or OTP.', 'নিজের ভাষায় জিজ্ঞাসা করুন — লিখে বা বলে। Guidia কখনো আপনার পাসওয়ার্ড, পিন বা ওটিপি চাইবে না।', 'अपने शब्दों में पूछें — लिखकर या बोलकर। Guidia कभी आपका पासवर्ड, पिन या ओटीपी नहीं मांगेगा।', 'Hỏi theo cách của bạn — gõ hoặc nói. Guidia không bao giờ hỏi mật khẩu, mã PIN hay OTP.')}</p>
                <div className="ask-suggestions" role="list" aria-label={t('Example questions', 'উদাহরণ প্রশ্ন', 'उदाहरण सवाल', 'Câu hỏi mẫu')}>
                  {suggestions.map((s) => <button key={s} type="button" role="listitem" className="chip chip-lg" onClick={() => send(s)}>{s}</button>)}
                </div>
              </div>
            )}
            {messages.map((m, i) => (m.role === 'user' ? (
              <div key={m.id} className="msg msg-user rise">
                <div className="msg-bubble">
                  <p>{inLanguage(m.text, t)}</p>
                  {m.secretRemoved && (
                    <p className="msg-secret"><ShieldCheck aria-hidden="true" /> {t('Guidia removed a secret code from this message. Please never share it with anyone.', 'Guidia এই মেসেজ থেকে একটি গোপন কোড সরিয়ে দিয়েছে। কখনো কাউকে দেবেন না।', 'Guidia ने इस मैसेज से एक गुप्त कोड हटा दिया। इसे कभी किसी को न दें।', 'Guidia đã xóa một mã bí mật khỏi tin nhắn. Đừng bao giờ chia sẻ nó với ai.')}</p>
                  )}
                </div>
              </div>
            ) : (
              <AssistantMessage key={m.id} m={m} t={t} language={language} onListen={(msg) => speak(spoken(msg))} onFocusInput={() => inputRef.current?.focus()} userText={lastUserText(i)} />
            )))}
            {busy && (
              <div className="msg msg-ai fade" role="status">
                <span className="msg-avatar" aria-hidden="true"><GuidiaMark size={30} title="" /></span>
                <div className="msg-body msg-thinking">
                  <span className="thinking-dots" aria-hidden="true"><span /><span /><span /></span>
                  <span className="text-muted">{t('Guidia is thinking carefully…', 'Guidia ভেবে দেখছে…', 'Guidia ध्यान से सोच रहा है…', 'Guidia đang suy nghĩ kỹ…')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="ask-composer-wrap">
            {error && <Alert tone="warn" className="fade">{error}</Alert>}
            {heard && inputSource === 'VOICE' && (
              <div className="heard fade">
                <Mic aria-hidden="true" />
                <p><span className="text-strong">{t('I heard:', 'আমি শুনেছি:', 'मैंने सुना:', 'Tôi nghe được:')}</span> “<Highlighted text={heard} />” <span className="text-subtle">— {t('you can correct it before sending.', 'পাঠানোর আগে ঠিক করে নিতে পারেন।', 'भेजने से पहले सुधार सकते हैं।', 'bạn có thể sửa trước khi gửi.')}</span></p>
              </div>
            )}
            <form className="ask-composer" data-state={composerState} onSubmit={(e) => { e.preventDefault(); send(); }}>
              {listenSupported && (
                <button
                  type="button" className={`btn btn-icon btn-round ask-mic ${listening ? 'is-listening' : ''}`} onClick={mic}
                  aria-pressed={listening}
                  aria-label={listening ? t('Stop listening', 'শোনা বন্ধ করুন', 'सुनना बंद करें', 'Dừng nghe') : t('Speak your question', 'প্রশ্নটি বলুন', 'अपना सवाल बोलें', 'Nói câu hỏi của bạn')}
                >
                  {listening ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
                </button>
              )}
              <label htmlFor="ask-input" className="sr-only">{t('Your question', 'আপনার প্রশ্ন', 'आपका सवाल', 'Câu hỏi của bạn')}</label>
              <textarea
                id="ask-input" ref={inputRef} className="ask-input" rows={1} value={input} maxLength={2000}
                placeholder={listening ? t('Listening… speak now', 'শুনছি… এখন বলুন', 'सुन रहा हूँ… अब बोलें', 'Đang nghe… hãy nói') : t('Type your question…', 'আপনার প্রশ্ন লিখুন…', 'अपना सवाल लिखें…', 'Gõ câu hỏi của bạn…')}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`; }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              />
              <Button type="submit" icon={busy ? Loader2 : Send} disabled={!input.trim() || busy} className={busy ? 'is-busy' : undefined}>
                <span className="hide-sm">{t('Send', 'পাঠান', 'भेजें', 'Gửi')}</span>
              </Button>
            </form>
            <div className="ask-foot">
              <span className="row" style={{ '--gap': '6px' }}>
                <Users size={16} aria-hidden="true" />
                <Link to="/app/help">{t('Ask a trusted person for help', 'বিশ্বস্ত কারও সাহায্য নিন', 'किसी भरोसेमंद से मदद लें', 'Nhờ người tin cậy giúp')}</Link>
              </span>
              {(voiceState === 'speaking' || voiceState === 'paused') && (
                <Button variant="ghost" size="sm" icon={Square} onClick={voiceControls.stop}>{t('Stop speaking', 'কথা বন্ধ করুন', 'बोलना बंद करें', 'Dừng đọc')}</Button>
              )}
            </div>
          </div>
        </section>
      </div>

      <Sheet open={historyOpen} onClose={() => setHistoryOpen(false)} title={t('Conversations', 'কথোপকথন', 'बातचीत', 'Cuộc trò chuyện')}>
        <HistoryList {...historyProps} />
      </Sheet>

      <ConfirmDialog
        open={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={confirmDelete} state={deleting ? 'loading' : 'idle'}
        title={t('Delete this conversation?', 'এই কথোপকথন মুছবেন?', 'यह बातचीत मिटाएं?', 'Xóa cuộc trò chuyện này?')}
        description={inLanguage(toDelete?.title, t)}
        consequences={[t('Its messages are removed from your account for good.', 'এর মেসেজগুলো আপনার অ্যাকাউন্ট থেকে স্থায়ীভাবে মুছে যাবে।', 'इसके मैसेज आपके अकाउंट से हमेशा के लिए हट जाएंगे।', 'Các tin nhắn sẽ bị xóa vĩnh viễn khỏi tài khoản.'), t('Your Memory Book and lessons are not affected.', 'স্মৃতির খাতা ও পাঠ অপরিবর্তিত থাকবে।', 'याद की किताब और पाठ पर असर नहीं होगा।', 'Sổ ghi nhớ và bài học không bị ảnh hưởng.')]}
        confirmLabel={t('Delete', 'মুছুন', 'मिटाएं', 'Xóa')}
      />
    </div>
  );
}
