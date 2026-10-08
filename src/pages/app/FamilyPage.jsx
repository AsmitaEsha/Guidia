import { useEffect, useState } from 'react';
import {
  AlertTriangle, BookOpen, Check, Clock, Eye, HandHelping, HeartHandshake, KeyRound, Link2, MessageCircle, MessageSquare,
  Phone, ShieldCheck, Sparkles, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useToast } from '../../context/ToastContext';
import { useResource } from '../../hooks/useResource';
import { post } from '../../services/apiClient';
import { formatRelative, localize } from '../../i18n';
import { REASONS } from '../../data/emergencyReasons';
import { MASTERY, MASTERY_ORDER, skillName } from '../../data/catalog';
import { Alert, Avatar, Badge, Button, EmptyState, Field, PageHeader, ProgressBar, SectionHeader, Skeleton } from '../../components/ui';

const OPEN = ['TRIGGERED', 'SENT', 'ACKNOWLEDGED', 'CONTACTED'];
const POLL_MS = 15_000;
const digits = (phone) => String(phone || '').replace(/[^\d+]/g, '');
const firstName = (name) => String(name || '').replace(/\(.*?\)/g, '').trim().split(' ')[0];

// Call and WhatsApp buttons for a phone number (shown only when shared).
function CallButtons({ phone, name, t, size = 'sm' }) {
  if (!phone) return null;
  const wa = digits(phone).replace(/^\+/, '');
  return (
    <>
      <Button size={size} icon={Phone} href={`tel:${digits(phone)}`}>{t(`Call ${name}`, `${name}-কে ফোন করুন`, `${name} को फोन करें`, `Gọi ${name}`)}</Button>
      <Button size={size} variant="secondary" icon={MessageCircle} href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</Button>
    </>
  );
}

// A help request, with everything needed to answer it in one place.
function HelpRequest({ e, t, language, busy, act }) {
  const name = firstName(e.senior?.fullName);
  const reason = REASONS.find((r) => r.key === e.reason)?.label;
  const step = e.status === 'CONTACTED' ? 2 : e.status === 'ACKNOWLEDGED' ? 1 : 0;
  return (
    <article className="card family-alert stack" style={{ '--gap': 'var(--s-3)' }} aria-live="polite">
      <div className="row-between">
        <span className="row" style={{ '--gap': 'var(--s-3)' }}>
          <span className="family-alert-icon" aria-hidden="true"><AlertTriangle /></span>
          <span className="stack" style={{ '--gap': 0 }}>
            <span className="h-card">{t(`${name} needs your help`, `${name}-এর আপনার সাহায্য দরকার`, `${name} को आपकी मदद चाहिए`, `${name} cần bạn giúp`)}</span>
            <span className="text-subtle row" style={{ '--gap': '6px' }}><Clock size={14} aria-hidden="true" />{formatRelative(e.createdAt, language)}</span>
          </span>
        </span>
        <Badge tone={step === 0 ? 'danger' : 'warn'}>{step === 0 ? t('New', 'নতুন', 'नया', 'Mới') : step === 1 ? t('You have seen it', 'আপনি দেখেছেন', 'आपने देख लिया', 'Bạn đã xem') : t('You contacted them', 'আপনি যোগাযোগ করেছেন', 'आपने संपर्क किया', 'Bạn đã liên lạc')}</Badge>
      </div>
      <p className="family-alert-reason">{reason ? t(...reason) : ''}{e.message ? <span className="text-muted"> — “{e.message}”</span> : null}</p>
      <div className="btn-group">
        <CallButtons phone={e.senior?.phone} name={name} t={t} size="md" />
      </div>
      {!e.senior?.phone && <p className="hint">{t(`Call ${name} on a number you already know. They can add their phone number in Settings so a call button appears here.`, `আগে থেকে জানা নম্বরে ${name}-কে ফোন করুন। তিনি সেটিংসে ফোন নম্বর দিলে এখানে ফোনের বোতাম আসবে।`, `${name} को पहले से पता नंबर पर फोन करें। वे सेटिंग्स में फोन नंबर डालें तो यहाँ फोन बटन दिखेगा।`, `Hãy gọi ${name} theo số bạn đã biết. Nếu họ thêm số điện thoại trong Cài đặt, nút gọi sẽ hiện ở đây.`)}</p>}
      <div className="btn-group">
        {['TRIGGERED', 'SENT'].includes(e.status) && (
          <Button size="sm" variant="tonal" icon={Eye} state={busy === `ack-${e.id}` ? 'loading' : 'idle'} onClick={() => act(`ack-${e.id}`, () => post(`/emergency/${e.id}/acknowledge`, {}, { idempotent: true }), t(`${name} has been told you saw it.`, `${name}-কে জানানো হয়েছে যে আপনি দেখেছেন।`, `${name} को बता दिया गया कि आपने देख लिया।`, `Đã báo ${name} rằng bạn đã thấy.`))}>
            {t(`Tell ${name} I've seen it`, `${name}-কে জানান আমি দেখেছি`, `${name} को बताएं मैंने देख लिया`, `Báo ${name} là tôi đã thấy`)}
          </Button>
        )}
        {e.status !== 'CONTACTED' && (
          <Button size="sm" variant="quiet" icon={MessageSquare} state={busy === `con-${e.id}` ? 'loading' : 'idle'} onClick={() => act(`con-${e.id}`, () => post(`/emergency/${e.id}/contacted`, {}, { idempotent: true }))}>
            {t("I've spoken to them", 'কথা বলেছি', 'मैंने बात कर ली', 'Tôi đã nói chuyện')}
          </Button>
        )}
        <Button size="sm" variant="quiet" icon={Check} state={busy === `res-${e.id}` ? 'loading' : 'idle'} onClick={() => act(`res-${e.id}`, () => post(`/emergency/${e.id}/resolve`, {}, { idempotent: true }), t('Marked as sorted out.', 'সমাধান হয়েছে বলে চিহ্নিত।', 'सुलझ गया के रूप में चिह्नित।', 'Đã đánh dấu là xong.'))}>
          {t('Sorted out', 'সমাধান হয়েছে', 'सुलझ गया', 'Đã xong')}
        </Button>
      </div>
    </article>
  );
}

// One learner: progress, what they're doing now, safety, and how to reach them.
function LearnerCard({ rel, t, language }) {
  const { data, loading, error } = useResource(`/guardian/seniors/${rel.senior.id}/overview`, { select: (d) => d.overview });
  const name = firstName(rel.senior.fullName);
  const skills = data?.progress?.skills || [];
  const strongest = [...skills].sort((a, b) => MASTERY_ORDER.indexOf(b.masteryLevel) - MASTERY_ORDER.indexOf(a.masteryLevel)).slice(0, 4);
  const risky = data?.safety ? (data.safety.last30Days.HIGH_RISK || 0) + (data.safety.last30Days.CRITICAL || 0) : null;
  const checked = data?.safety ? Object.values(data.safety.last30Days).reduce((a, b) => a + b, 0) : null;
  const independence = data?.progress ? Math.round((data.progress.independentCompletionRate || 0) * 100) : null;

  return (
    <article className="card family-learner stack" style={{ '--gap': 'var(--s-4)' }}>
      <div className="row-between">
        <span className="row" style={{ '--gap': 'var(--s-3)' }}>
          <Avatar name={rel.senior.fullName} size="lg" tone="coral" />
          <span className="stack" style={{ '--gap': 0 }}>
            <span className="h-section">{rel.senior.fullName}</span>
            <span className="text-subtle">{rel.respondedAt ? t(`Connected ${formatRelative(rel.respondedAt, language)}`, `যুক্ত হয়েছেন ${formatRelative(rel.respondedAt, language)}`, `जुड़े ${formatRelative(rel.respondedAt, language)}`, `Đã kết nối ${formatRelative(rel.respondedAt, language)}`) : ''}</span>
          </span>
        </span>
        <div className="btn-group"><CallButtons phone={data?.senior?.phone} name={name} t={t} /></div>
      </div>

      {loading && !data ? <Skeleton height={120} /> : error ? <Alert tone="warn">{error.message}</Alert> : data && (
        <>
          <div className="family-stats">
            {data.progress && (
              <div className="family-stat">
                <BookOpen aria-hidden="true" />
                <strong className="num">{data.progress.lessonsCompleted}</strong>
                <span>{t('lessons finished', 'পাঠ শেষ', 'पाठ पूरे', 'bài học đã xong')}</span>
              </div>
            )}
            {data.progress && (
              <div className="family-stat">
                <Sparkles aria-hidden="true" />
                <strong className="num">{skills.length}</strong>
                <span>{t('skills practised', 'দক্ষতা অনুশীলন', 'कौशल अभ्यास', 'kỹ năng đã luyện')}</span>
              </div>
            )}
            {checked != null && (
              <div className="family-stat">
                <ShieldCheck aria-hidden="true" />
                <strong className="num">{checked}</strong>
                <span>{t('messages checked (30 days)', 'মেসেজ যাচাই (৩০ দিন)', 'मैसेज जांचे (30 दिन)', 'tin đã kiểm tra (30 ngày)')}</span>
              </div>
            )}
          </div>

          {independence != null && (
            <div className="stack" style={{ '--gap': '6px' }}>
              <span className="row-between"><span className="text-strong">{t('Does tasks on their own', 'নিজে নিজে কাজ করেন', 'खुद से काम करते हैं', 'Tự làm được')}</span><span className="num text-strong">{independence}%</span></span>
              <ProgressBar value={independence} label={t('Independence', 'স্বনির্ভরতা', 'आत्मनिर्भरता', 'Mức tự lập')} tone="ok" />
            </div>
          )}

          {strongest.length > 0 && (
            <div className="stack" style={{ '--gap': '6px' }}>
              <span className="eyebrow"><TrendingUp size={14} aria-hidden="true" /> {t('What they are learning', 'যা শিখছেন', 'वे क्या सीख रहे हैं', 'Họ đang học gì')}</span>
              <ul className="family-skills">
                {strongest.map((s) => (
                  <li key={s.skillKey}><span>{skillName(s.skillKey, t)}</span><Badge tone={['INDEPENDENT', 'RETAINED', 'MASTERED'].includes(s.masteryLevel) ? 'ok' : 'brand'}>{t(...(MASTERY[s.masteryLevel] || MASTERY.NEW))}</Badge></li>
                ))}
              </ul>
            </div>
          )}

          {data.currentTask && (
            <p className="family-now"><HandHelping aria-hidden="true" />{t('Working on now:', 'এখন করছেন:', 'अभी कर रहे हैं:', 'Đang làm:')} <strong>{localize(data.currentTask.scenario?.title || data.currentTask.lesson?.title, language) || data.currentTask.goal}</strong></p>
          )}
          {risky > 0 && (
            <Alert tone="risk" title={t(`${risky} risky message${risky === 1 ? '' : 's'} in the last 30 days`, `গত ৩০ দিনে ${risky}টি ঝুঁকিপূর্ণ মেসেজ`, `पिछले 30 दिनों में ${risky} खतरनाक मैसेज`, `${risky} tin rủi ro trong 30 ngày qua`)}>
              {t(`Scammers may be contacting ${name}. A quick call to check in can help.`, `প্রতারকেরা হয়তো ${name}-এর সাথে যোগাযোগ করছে। একবার ফোন করে খোঁজ নিন।`, `धोखेबाज़ शायद ${name} से संपर्क कर रहे हैं। एक बार फोन करके हालचाल लें।`, `Kẻ gian có thể đang liên lạc với ${name}. Một cuộc gọi hỏi thăm sẽ có ích.`)}
            </Alert>
          )}
          {!data.progress && !data.safety && (
            <p className="text-muted">{t(`${name} has not shared progress with you yet.`, `${name} এখনো অগ্রগতি শেয়ার করেননি।`, `${name} ने अभी प्रगति साझा नहीं की है।`, `${name} chưa chia sẻ tiến độ với bạn.`)}</p>
          )}
          <p className="hint row" style={{ '--gap': '6px' }}><Eye size={16} aria-hidden="true" />{t('You only see what they chose to share — never passwords, PINs or private messages.', 'তাঁরা যা শেয়ার করতে চেয়েছেন শুধু সেটুকুই দেখছেন — পাসওয়ার্ড, পিন বা ব্যক্তিগত মেসেজ কখনো নয়।', 'आप वही देखते हैं जो उन्होंने साझा करना चुना — पासवर्ड, पिन या निजी मैसेज कभी नहीं।', 'Bạn chỉ thấy những gì họ chọn chia sẻ — không bao giờ có mật khẩu, PIN hay tin nhắn riêng.')}</p>
        </>
      )}
    </article>
  );
}

// Enter the code a parent shared to connect.
function ConnectWithCode({ t, onLinked, prominent }) {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (code.trim().length < 4) return;
    setBusy(true);
    setError('');
    try {
      const { relationship } = await post('/guardian/link', { code: code.trim() });
      showToast(t(`You are now connected with ${relationship.senior.fullName}.`, `${relationship.senior.fullName}-এর সাথে যুক্ত হয়েছেন।`, `अब आप ${relationship.senior.fullName} से जुड़ गए हैं।`, `Bạn đã kết nối với ${relationship.senior.fullName}.`), 'success');
      setCode('');
      onLinked();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className={`card stack ${prominent ? 'card-pad-lg family-connect' : ''}`} style={{ '--gap': 'var(--s-3)' }} onSubmit={submit}>
      <p className="h-card row" style={{ '--gap': '8px' }}><KeyRound size={20} aria-hidden="true" />{t('Connect with a family code', 'ফ্যামিলি কোড দিয়ে যুক্ত হন', 'फैमिली कोड से जुड़ें', 'Kết nối bằng mã gia đình')}</p>
      <p className="text-muted">{t('Ask your parent to open Guidia → Trusted people → "Share my family code", then type the 6 letters here.', 'বাবা-মাকে Guidia খুলে → বিশ্বস্ত মানুষ → "আমার ফ্যামিলি কোড শেয়ার করুন" চাপতে বলুন, তারপর ৬টি অক্ষর এখানে লিখুন।', 'माता-पिता से Guidia खोलकर → भरोसेमंद लोग → "मेरा फैमिली कोड शेयर करें" दबाने को कहें, फिर 6 अक्षर यहाँ लिखें।', 'Nhờ bố mẹ mở Guidia → Người tin cậy → "Chia sẻ mã gia đình", rồi nhập 6 ký tự vào đây.')}</p>
      <Field label={t('Family code', 'ফ্যামিলি কোড', 'फैमिली कोड', 'Mã gia đình')} error={error || null}>
        {(p) => <input {...p} className="input input-lg family-code-input" value={code} maxLength={9} autoComplete="off" autoCapitalize="characters" spellCheck="false" placeholder="ABC123" onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9 -]/g, ''))} />}
      </Field>
      <Button type="submit" icon={Link2} className="self-start" disabled={code.trim().length < 4} state={busy ? 'loading' : 'idle'}>{t('Connect', 'যুক্ত হন', 'जुड़ें', 'Kết nối')}</Button>
    </form>
  );
}

export default function FamilyPage() {
  const { user } = useAuth();
  const { t, language } = usePreferences();
  const { showToast } = useToast();
  const people = useResource('/guardian');
  const emergencies = useResource('/emergency/incoming', { select: (d) => d.events });
  const approvals = useResource('/guardian/approvals/mine', { select: (d) => d.approvals });
  const [busy, setBusy] = useState(null);

  // Help requests are time-sensitive: check every 15 seconds while open.
  const reloadEmergencies = emergencies.reload;
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === 'visible') reloadEmergencies(); }, POLL_MS);
    return () => clearInterval(id);
  }, [reloadEmergencies]);

  const act = async (key, fn, okMsg) => {
    setBusy(key);
    try {
      await fn();
      if (okMsg) showToast(okMsg, 'success');
      emergencies.reload(); approvals.reload(); people.reload();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setBusy(null);
    }
  };

  const linked = people.data?.peopleIHelp || [];
  const invitations = people.data?.invitationsForMe || [];
  const open = (emergencies.data || []).filter((e) => OPEN.includes(e.status));
  const pending = (approvals.data || []).filter((a) => a.status === 'PENDING');
  const me = firstName(user?.fullName);

  return (
    <div className="page stack" style={{ '--gap': 'var(--step-gap)' }}>
      <PageHeader
        eyebrow={t('Family dashboard', 'পরিবারের ড্যাশবোর্ড', 'परिवार डैशबोर्ड', 'Bảng gia đình')}
        title={t(`Hello${me ? `, ${me}` : ''}`, `নমস্কার${me ? `, ${me}` : ''}`, `नमस्ते${me ? `, ${me}` : ''}`, `Xin chào${me ? ` ${me}` : ''}`)}
        description={t('See how your family is doing, and answer the moment they ask for help.', 'আপনার পরিবারের সবাই কেমন আছেন দেখুন, আর সাহায্য চাইলেই সঙ্গে সঙ্গে সাড়া দিন।', 'देखें आपका परिवार कैसा है, और मदद मांगते ही जवाब दें।', 'Xem gia đình bạn thế nào, và trả lời ngay khi họ cần giúp.')}
      />

      {open.length > 0 && (
        <section className="section" aria-labelledby="fam-alerts-h">
          <SectionHeader id="fam-alerts-h" title={<span className="row" style={{ '--gap': '8px', color: 'var(--danger-700)' }}><AlertTriangle aria-hidden="true" />{t('Help requests', 'সাহায্যের অনুরোধ', 'मदद के अनुरोध', 'Yêu cầu giúp đỡ')}</span>} />
          <div className="stack" style={{ '--gap': 'var(--s-4)' }}>
            {open.map((e) => <HelpRequest key={e.id} e={e} t={t} language={language} busy={busy} act={act} />)}
          </div>
        </section>
      )}

      {invitations.map((r) => (
        <Alert key={r.id} tone="brand" icon={HeartHandshake} title={t(`${r.senior.fullName} invited you`, `${r.senior.fullName} আপনাকে আমন্ত্রণ জানিয়েছেন`, `${r.senior.fullName} ने आपको बुलाया है`, `${r.senior.fullName} đã mời bạn`)}
          actions={<Button size="sm" icon={Check} state={busy === `acc-${r.id}` ? 'loading' : 'idle'} onClick={() => act(`acc-${r.id}`, () => post(`/guardian/${r.id}/accept`), t('Connected.', 'যুক্ত হয়েছে।', 'जुड़ गए।', 'Đã kết nối.'))}>{t('Accept', 'গ্রহণ করুন', 'स्वीकार करें', 'Chấp nhận')}</Button>}>
          {t('Accept to see their progress and get their help requests.', 'গ্রহণ করলে তাঁদের অগ্রগতি দেখবেন আর সাহায্যের অনুরোধ পাবেন।', 'स्वीकार करें तो उनकी प्रगति दिखेगी और मदद के अनुरोध मिलेंगे।', 'Chấp nhận để xem tiến độ và nhận yêu cầu giúp đỡ của họ.')}
        </Alert>
      ))}

      {people.loading && !people.data ? <Skeleton variant="card" height={220} /> : linked.length === 0 ? (
        <div className="family-empty stack" style={{ '--gap': 'var(--s-5)' }}>
          <EmptyState icon={HeartHandshake} title={t('Connect with your parent', 'বাবা-মায়ের সাথে যুক্ত হন', 'माता-पिता से जुड़ें', 'Kết nối với bố mẹ')}>
            {t('Once connected you will see what they are learning and be alerted the moment they press "I need help".', 'যুক্ত হলে দেখবেন তাঁরা কী শিখছেন, আর তাঁরা "আমার সাহায্য দরকার" চাপলেই সঙ্গে সঙ্গে জানতে পারবেন।', 'जुड़ने पर आप देखेंगे वे क्या सीख रहे हैं, और "मुझे मदद चाहिए" दबाते ही आपको पता चलेगा।', 'Khi kết nối, bạn sẽ thấy họ đang học gì và được báo ngay khi họ bấm "Tôi cần giúp đỡ".')}
          </EmptyState>
          <ConnectWithCode t={t} onLinked={people.reload} prominent />
        </div>
      ) : (
        <section className="section" aria-labelledby="fam-people-h">
          <SectionHeader id="fam-people-h" title={t('Your family', 'আপনার পরিবার', 'आपका परिवार', 'Gia đình bạn')} />
          <div className="family-grid">
            {linked.map((rel) => <LearnerCard key={rel.id} rel={rel} t={t} language={language} />)}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section className="section" aria-labelledby="fam-approvals-h">
          <SectionHeader id="fam-approvals-h" title={t('Waiting for your OK', 'আপনার অনুমতির অপেক্ষায়', 'आपकी मंज़ूरी का इंतज़ार', 'Đang chờ bạn đồng ý')} description={t('Practice payments above the amount they set.', 'তাঁদের ঠিক করা সীমার বেশি অনুশীলন পেমেন্ট।', 'उनकी तय सीमा से ज़्यादा अभ्यास भुगतान।', 'Thanh toán luyện tập vượt mức họ đặt.')} />
          {pending.map((a) => (
            <article key={a.id} className="card stack" style={{ '--gap': 'var(--s-3)' }}>
              <div className="row-between"><p className="h-card">{a.senior?.fullName}</p><Badge tone="brand">{t('Practice', 'অনুশীলন', 'अभ्यास', 'Luyện tập')}</Badge></div>
              <p>{[a.summary.application, a.summary.amountOrData, a.summary.who].filter(Boolean).join(' · ')}</p>
              <div className="btn-group">
                <Button size="sm" icon={Check} state={busy === `ap-${a.id}` ? 'loading' : 'idle'} onClick={() => act(`ap-${a.id}`, () => post(`/guardian/approvals/${a.id}/resolve`, { status: 'APPROVED' }, { idempotent: true }))}>{t('Approve', 'অনুমতি দিন', 'मंज़ूरी दें', 'Đồng ý')}</Button>
                <Button size="sm" variant="quiet" state={busy === `rj-${a.id}` ? 'loading' : 'idle'} onClick={() => act(`rj-${a.id}`, () => post(`/guardian/approvals/${a.id}/resolve`, { status: 'REJECTED' }, { idempotent: true }))}>{t('Not now', 'এখন না', 'अभी नहीं', 'Để sau')}</Button>
              </div>
            </article>
          ))}
        </section>
      )}

      {linked.length > 0 && <ConnectWithCode t={t} onLinked={people.reload} />}
    </div>
  );
}
