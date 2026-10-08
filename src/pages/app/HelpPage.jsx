import { useEffect, useState } from 'react';
import {
  AlertTriangle, CalendarClock, CircleHelp, Eye, HandCoins, HeartHandshake, Lock, MessageCircle, Phone, Send,
  ShieldAlert, Sparkles, UserPlus, Users, X,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { useResource } from '../../hooks/useResource';
import { get, newIdempotencyKey, post } from '../../services/apiClient';
import { formatDate, formatRelative } from '../../i18n';
import { announce } from '../../utils/announce';
import { REASONS } from '../../data/emergencyReasons';
import { Alert, Button, ChoiceCard, ConfirmDialog, EmptyState, Field, Skeleton, Timeline } from '../../components/ui';
import EmergencyContacts from '../../components/help/EmergencyContacts';

const REASON_ICON = {
  I_AM_CONFUSED: CircleHelp, I_THINK_THIS_IS_UNSAFE: ShieldAlert, I_MAY_HAVE_MADE_A_MISTAKE: AlertTriangle,
  PAYMENT_HELP: HandCoins, APPOINTMENT_HELP: CalendarClock, OTHER: MessageCircle,
};
const OPEN = ['TRIGGERED', 'SENT', 'ACKNOWLEDGED', 'CONTACTED'];
const ORDER = ['TRIGGERED', 'SENT', 'ACKNOWLEDGED', 'CONTACTED', 'RESOLVED'];

function HelpStatus({ open, t, language, onCancel }) {
  const nobody = open.status === 'TRIGGERED';
  const n = open.guardiansNotified || 0;
  const at = (iso) => (iso ? formatDate(iso, language, { timeStyle: 'short' }) : null);
  const reached = ORDER.indexOf(open.status);
  const state = (i) => (i < reached ? 'done' : i === reached ? 'current' : 'todo');
  const items = [
    { key: 'asked', icon: HeartHandshake, title: t('You asked for help', 'আপনি সাহায্য চেয়েছেন', 'आपने मदद मांगी', 'Bạn đã nhờ giúp đỡ'), meta: at(open.createdAt), state: 'done' },
    { key: 'sent', icon: Send, title: nobody ? t('Nobody could be told yet', 'এখনো কাউকে জানানো যায়নি', 'अभी किसी को बताया नहीं जा सका', 'Chưa báo được cho ai') : (n ? t(`Request sent to ${n} trusted ${n === 1 ? 'person' : 'people'}`, `${n} জন বিশ্বস্ত মানুষকে অনুরোধ পাঠানো হয়েছে`, `${n} भरोसेमंद लोगों को अनुरोध भेजा गया`, `Đã gửi yêu cầu tới ${n} người tin cậy`) : t('Request sent to your trusted people', 'বিশ্বস্ত মানুষদের অনুরোধ পাঠানো হয়েছে', 'भरोसेमंद लोगों को अनुरोध भेजा गया', 'Đã gửi yêu cầu tới người tin cậy')), meta: at(open.sentAt), state: nobody ? 'current' : state(1) },
    { key: 'seen', icon: Eye, title: open.acknowledgedBy ? t(`${open.acknowledgedBy} has seen it`, `${open.acknowledgedBy} দেখেছেন`, `${open.acknowledgedBy} ने देख लिया`, `${open.acknowledgedBy} đã thấy`) : t('Someone has seen it', 'কেউ দেখেছেন', 'किसी ने देख लिया', 'Có người đã thấy'), meta: at(open.acknowledgedAt), state: nobody ? 'todo' : state(2) },
    { key: 'helping', icon: Phone, title: t('They are helping', 'তাঁরা সাহায্য করছেন', 'वे मदद कर रहे हैं', 'Họ đang giúp'), meta: at(open.contactedAt), state: nobody ? 'todo' : state(3) },
  ];

  return (
    <section className="card card-pad-lg help-status rise" aria-live="polite" aria-labelledby="status-h">
      <div className="help-status-head">
        <span className={`help-status-icon ${nobody ? 'is-warn' : ''}`} aria-hidden="true">{nobody ? <AlertTriangle /> : <HeartHandshake />}</span>
        <div className="stack" style={{ '--gap': '4px' }}>
          <h2 id="status-h" className="h-section">
            {nobody ? t('Your request is saved', 'আপনার অনুরোধ রাখা হয়েছে', 'आपका अनुरोध सहेजा गया', 'Yêu cầu của bạn đã được lưu')
              : open.status === 'SENT' ? t('Your trusted people have been told', 'আপনার বিশ্বস্ত মানুষদের জানানো হয়েছে', 'आपके भरोसेमंद लोगों को बता दिया गया', 'Người tin cậy của bạn đã được báo')
                : open.status === 'ACKNOWLEDGED' ? t('Someone has seen your request', 'কেউ আপনার অনুরোধ দেখেছেন', 'किसी ने आपका अनुरोध देख लिया', 'Đã có người thấy yêu cầu của bạn')
                  : t('Help is on the way', 'সাহায্য আসছে', 'मदद आ रही है', 'Sự giúp đỡ đang tới')}
          </h2>
          <p className="text-muted">{t(...(REASONS.find((r) => r.key === open.reason)?.label || ['']))} · {formatRelative(open.createdAt, language)}</p>
        </div>
      </div>

      <Timeline items={items} />

      {nobody && (
        <Alert tone="warn" title={t('Nobody was notified', 'কাউকে জানানো যায়নি', 'किसी को सूचना नहीं गई', 'Chưa ai được thông báo')}
          actions={<Button size="sm" variant="secondary" icon={UserPlus} to="/app/people">{t('Add someone you trust', 'বিশ্বস্ত কাউকে যোগ করুন', 'किसी भरोसेमंद को जोड़ें', 'Thêm người bạn tin')}</Button>}>
          {t('Add a trusted person so Guidia can reach someone next time. For now, please phone someone you know.', 'একজন বিশ্বস্ত মানুষ যোগ করুন যাতে পরের বার Guidia কাউকে জানাতে পারে। আপাতত পরিচিত কাউকে ফোন করুন।', 'एक भरोसेमंद व्यक्ति जोड़ें ताकि अगली बार Guidia किसी तक पहुँच सके। अभी किसी परिचित को फोन करें।', 'Hãy thêm người tin cậy để lần sau Guidia báo được cho ai đó. Lúc này, hãy gọi cho người bạn quen.')}
        </Alert>
      )}
      {!nobody && <p className="reassure-line">{t('Take a slow breath. You do not need to do anything else right now.', 'ধীরে শ্বাস নিন। এখন আর কিছু করতে হবে না।', 'धीरे से सांस लें। अभी और कुछ करने की ज़रूरत नहीं।', 'Hít thở chậm. Bây giờ bạn không cần làm gì thêm.')}</p>}

      <div className="btn-group">
        <Button variant="secondary" icon={MessageCircle} to="/app/ask">{t('Meanwhile, ask Guidia', 'এর মধ্যে Guidia-কে জিজ্ঞাসা করুন', 'तब तक Guidia से पूछें', 'Trong lúc chờ, hỏi Guidia')}</Button>
        <Button variant="ghost" icon={X} onClick={onCancel}>{t('I’m okay now — cancel', 'এখন ঠিক আছি — বাতিল', 'अब ठीक हूँ — रद्द करें', 'Tôi ổn rồi — hủy')}</Button>
      </div>
    </section>
  );
}

export default function HelpPage() {
  const { t, language } = usePreferences();
  const { speak } = useVoice();
  const history = useResource('/emergency', { select: (d) => d.events });
  const people = useResource('/guardian', { select: (d) => d.myTrustedPeople.filter((r) => r.status === 'ACTIVE') });
  const [reason, setReason] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const open = event && OPEN.includes(event.status) ? event : (!event ? history.data?.find((e) => OPEN.includes(e.status)) : null);
  const noPeople = people.data && people.data.length === 0;

  // Follow the open request so the senior sees "someone has seen it".
  useEffect(() => {
    if (!open) return undefined;
    const id = setInterval(async () => {
      try {
        const { events } = await get('/emergency');
        const fresh = events.find((e) => e.id === open.id);
        if (fresh && fresh.status !== open.status) {
          setEvent(fresh);
          if (fresh.status === 'ACKNOWLEDGED') {
            const msg = t('Someone has seen your request. Help is coming.', 'কেউ আপনার অনুরোধ দেখেছেন। সাহায্য আসছে।', 'किसी ने आपका अनुरोध देख लिया। मदद आ रही है।', 'Đã có người thấy yêu cầu của bạn. Sự giúp đỡ đang tới.');
            announce(msg);
            speak(msg);
          }
        }
      } catch { /* keep trying */ }
    }, 10_000);
    return () => clearInterval(id);
  }, [open, speak, t]);

  const send = async () => {
    if (!reason) return;
    setBusy(true);
    setError('');
    try {
      const { event: created } = await post('/emergency', { reason, ...(message.trim() ? { message: message.trim() } : {}) }, { idempotent: newIdempotencyKey() });
      setEvent(created);
      history.reload();
      const msg = created.status === 'SENT'
        ? t('Your trusted people have been told. Take a slow breath — you are not alone.', 'আপনার বিশ্বস্ত মানুষদের জানানো হয়েছে। ধীরে শ্বাস নিন — আপনি একা নন।', 'आपके भरोसेमंद लोगों को बता दिया गया है। धीरे सांस लें — आप अकेले नहीं हैं।', 'Người tin cậy của bạn đã được báo. Hít thở chậm — bạn không một mình.')
        : t('Your request is saved, but no trusted person is connected yet.', 'আপনার অনুরোধ রাখা হয়েছে, কিন্তু এখনো কোনো বিশ্বস্ত মানুষ যুক্ত নেই।', 'आपका अनुरोध सहेजा गया, पर अभी कोई भरोसेमंद व्यक्ति जुड़ा नहीं है।', 'Yêu cầu đã được lưu, nhưng chưa có người tin cậy nào được kết nối.');
      announce(msg);
      speak(msg);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      const { event: e } = await post(`/emergency/${open.id}/cancel`, {}, { idempotent: true });
      setEvent(e);
      setReason(null);
      setMessage('');
      setConfirmCancel(false);
      history.reload();
    } catch (err) { setError(err.message); } finally { setCancelling(false); }
  };

  const past = (history.data || []).filter((e) => !OPEN.includes(e.status)).slice(0, 5);

  return (
    <div className="page page-narrow help-page">
      <header className="help-hero rise">
        <span className="help-hero-mark" aria-hidden="true"><HeartHandshake /></span>
        <p className="eyebrow">{t('I need help', 'আমার সাহায্য দরকার', 'मुझे मदद चाहिए', 'Tôi cần giúp đỡ')}</p>
        <h1 className="help-title">{t('You are not alone.', 'আপনি একা নন।', 'आप अकेले नहीं हैं।', 'Bạn không một mình.')}</h1>
        <p className="lead">{t('Take a slow breath. Nothing needs to be done in a hurry. Tell us what is happening and we will let your trusted people know.', 'ধীরে শ্বাস নিন। কোনো কিছুই তাড়াহুড়ো করে করতে হবে না। কী হচ্ছে জানান, আমরা আপনার বিশ্বস্ত মানুষদের জানিয়ে দেব।', 'धीरे से सांस लें। कुछ भी जल्दी में नहीं करना है। बताइए क्या हो रहा है, हम आपके भरोसेमंद लोगों को बता देंगे।', 'Hít thở chậm. Không có gì phải vội. Hãy cho biết chuyện gì đang xảy ra, chúng tôi sẽ báo cho người bạn tin cậy.')}</p>
      </header>

      <div className="emergency-note" role="note">
        <Phone aria-hidden="true" />
        <p><strong>{t('In immediate danger or a medical emergency?', 'এখনই বিপদে বা চিকিৎসার জরুরি অবস্থায়?', 'तुरंत खतरे या चिकित्सा आपात स्थिति में?', 'Đang gặp nguy hiểm hoặc cấp cứu y tế?')}</strong> {t('Call your local emergency number now. Guidia helps with digital problems and cannot call emergency services.', 'এখনই আপনার এলাকার জরুরি নম্বরে ফোন করুন। Guidia ডিজিটাল সমস্যায় সাহায্য করে, জরুরি সেবায় ফোন করতে পারে না।', 'अभी अपने स्थानीय आपातकालीन नंबर पर फोन करें। Guidia डिजिटल समस्याओं में मदद करता है, आपातकालीन सेवाओं को फोन नहीं कर सकता।', 'Hãy gọi ngay số khẩn cấp tại nơi bạn ở. Guidia hỗ trợ vấn đề kỹ thuật số và không thể gọi dịch vụ khẩn cấp.')}</p>
      </div>

      {history.loading && !history.data ? <Skeleton variant="card" height={320} /> : open ? (
        <>
          <HelpStatus open={open} t={t} language={language} onCancel={() => setConfirmCancel(true)} />
          <EmergencyContacts urgent />
        </>
      ) : (
        <section className="card card-pad-lg stack help-form rise" style={{ '--gap': 'var(--s-5)', '--i': 1 }}>
          <fieldset className="stack" style={{ '--gap': 'var(--s-3)' }}>
            <legend className="h-section" style={{ marginBottom: 'var(--s-3)' }}>{t('What is happening?', 'কী হচ্ছে?', 'क्या हो रहा है?', 'Chuyện gì đang xảy ra?')}</legend>
            <div className="reason-grid" role="radiogroup">
              {REASONS.map((r) => <ChoiceCard key={r.key} selected={reason === r.key} onSelect={() => setReason(r.key)} title={t(...r.label)} icon={REASON_ICON[r.key]} radio={false} />)}
            </div>
          </fieldset>

          {noPeople && (
            <EmptyState compact icon={Users} tone="coral" title={t('No trusted person yet.', 'এখনো কোনো বিশ্বস্ত মানুষ নেই।', 'अभी कोई भरोसेमंद व्यक्ति नहीं।', 'Chưa có người tin cậy.')}
              action={<Button variant="secondary" icon={UserPlus} to="/app/people">{t('Add someone you trust', 'বিশ্বস্ত কাউকে যোগ করুন', 'किसी भरोसेमंद को जोड़ें', 'Thêm người bạn tin')}</Button>}>
              {t('Guidia can only reach people you have added. You can still save your request, and phone someone you know.', 'আপনি যাঁদের যোগ করেছেন শুধু তাঁদেরই Guidia জানাতে পারে। তবুও অনুরোধ রাখতে পারেন, আর পরিচিত কাউকে ফোন করুন।', 'Guidia सिर्फ़ उन्हीं तक पहुँच सकता है जिन्हें आपने जोड़ा है। फिर भी अनुरोध सहेज सकते हैं, और किसी परिचित को फोन करें।', 'Guidia chỉ báo được cho người bạn đã thêm. Bạn vẫn có thể lưu yêu cầu và gọi cho người quen.')}
            </EmptyState>
          )}

          <Field label={t('Anything else you want to say?', 'আর কিছু বলতে চান?', 'और कुछ कहना चाहेंगे?', 'Bạn muốn nói thêm gì không?')} optional={t('optional', 'ঐচ্ছিক', 'वैकल्पिक', 'không bắt buộc')}>
            {(p) => <textarea {...p} className="textarea" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} placeholder={t('For example: “I clicked a link and now my screen looks strange.”', 'যেমন: “একটা লিংকে চাপ দিয়েছি, এখন স্ক্রিন অদ্ভুত দেখাচ্ছে।”', 'जैसे: “मैंने एक लिंक दबाया और अब स्क्रीन अजीब दिख रही है।”', 'Ví dụ: “Tôi bấm vào một link và giờ màn hình trông lạ.”')} />}
          </Field>
          <p className="hint row row-top" style={{ '--gap': '6px', flexWrap: 'nowrap' }}><Lock size={16} aria-hidden="true" style={{ marginTop: 3 }} />{t('Never write a password, PIN or OTP here. Guidia removes them if it finds any.', 'এখানে কখনো পাসওয়ার্ড, পিন বা ওটিপি লিখবেন না। থাকলে Guidia সরিয়ে দেয়।', 'यहाँ कभी पासवर्ड, पिन या ओटीपी न लिखें। मिलने पर Guidia उन्हें हटा देता है।', 'Đừng bao giờ ghi mật khẩu, mã PIN hay OTP ở đây. Guidia sẽ xóa nếu thấy.')}</p>
          {error && <Alert tone="warn">{error}</Alert>}
          <Button variant="help" size="lg" block icon={HeartHandshake} onClick={send} disabled={!reason} state={busy ? 'loading' : 'idle'} loadingLabel={t('Sending your request…', 'আপনার অনুরোধ পাঠানো হচ্ছে…', 'आपका अनुरोध भेजा जा रहा है…', 'Đang gửi yêu cầu…')}>
            {t('Ask my trusted people for help', 'আমার বিশ্বস্ত মানুষদের কাছে সাহায্য চান', 'मेरे भरोसेमंद लोगों से मदद मांगें', 'Nhờ người tin cậy giúp đỡ')}
          </Button>
          <Button variant="ghost" icon={Sparkles} to="/app/ask" className="self-start">{t('Or ask Guidia first', 'অথবা আগে Guidia-কে জিজ্ঞাসা করুন', 'या पहले Guidia से पूछें', 'Hoặc hỏi Guidia trước')}</Button>
        </section>
      )}

      {!open && <EmergencyContacts />}

      {past.length > 0 && (
        <details className="card past-requests">
          <summary className="text-strong">{t('Earlier requests', 'আগের অনুরোধ', 'पिछले अनुरोध', 'Yêu cầu trước đây')}</summary>
          <ul className="list">
            {past.map((e) => (
              <li key={e.id} className="list-item">
                <div className="list-item-main">
                  <span className="list-item-title">{t(...(REASONS.find((r) => r.key === e.reason)?.label || ['']))}</span>
                  <span className="list-item-meta">{formatRelative(e.createdAt, language)}</span>
                </div>
                <span className="badge">{e.status === 'RESOLVED' ? t('Resolved', 'সমাধান হয়েছে', 'सुलझ गया', 'Đã xong') : t('Cancelled', 'বাতিল', 'रद्द', 'Đã hủy')}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <ConfirmDialog
        open={confirmCancel} onClose={() => setConfirmCancel(false)} onConfirm={cancel} tone="primary" state={cancelling ? 'loading' : 'idle'}
        title={t('Glad you are okay. Cancel your request?', 'আপনি ভালো আছেন জেনে ভালো লাগল। অনুরোধ বাতিল করবেন?', 'आप ठीक हैं, यह जानकर अच्छा लगा। अनुरोध रद्द करें?', 'Thật mừng bạn ổn. Hủy yêu cầu nhé?')}
        consequences={[t('Your trusted people will see that you are okay now.', 'আপনার বিশ্বস্ত মানুষরা দেখবেন আপনি এখন ঠিক আছেন।', 'आपके भरोसेमंद लोग देखेंगे कि आप अब ठीक हैं।', 'Người tin cậy sẽ thấy bạn đã ổn.')]}
        confirmLabel={t('Yes, cancel', 'হ্যাঁ, বাতিল', 'हाँ, रद्द करें', 'Có, hủy')}
        cancelLabel={t('Keep it open', 'চালু রাখুন', 'खुला रखें', 'Giữ yêu cầu')}
      />
    </div>
  );
}
