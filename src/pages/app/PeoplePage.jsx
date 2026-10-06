import { useState } from 'react';
import {
  AlertTriangle, BellRing, BookMarked, Check, ChevronDown, ChevronUp, Clock, Eye, EyeOff, HandHelping, HeartHandshake,
  ListChecks, Mail, MessageSquare, Settings2, ShieldCheck, TrendingUp, UserMinus, UserPlus, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useToast } from '../../context/ToastContext';
import { useResource } from '../../hooks/useResource';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { post, put } from '../../services/apiClient';
import { formatMoney, formatRelative, localize } from '../../i18n';
import { getLanguage } from '../../config/languages';
import { REASONS } from '../../data/emergencyReasons';
import {
  Alert, Avatar, Badge, Button, ConfirmDialog, Dialog, EmptyState, ErrorState, Field, KeyValue, PageHeader,
  SectionHeader, Skeleton, Switch, SuccessState, Tabs,
} from '../../components/ui';

// Permissions in plain language: what it lets them see or do, and why.
const SCOPES = [
  { key: 'EMERGENCY_ALERTS', icon: HandHelping, label: ['Help when I ask', 'আমি চাইলে সাহায্য', 'मेरे मांगने पर मदद', 'Giúp khi tôi nhờ'], desc: ['They are told when you press "I need help".', '"আমার সাহায্য দরকার" চাপলে তাঁরা জানবেন।', '"मुझे मदद चाहिए" दबाने पर उन्हें पता चलेगा।', 'Họ được báo khi bạn bấm "Tôi cần giúp đỡ".'], why: ['So a real person can reach you quickly.', 'যাতে একজন মানুষ দ্রুত আপনার কাছে পৌঁছাতে পারেন।', 'ताकि कोई व्यक्ति जल्दी आप तक पहुँच सके।', 'Để có người thật liên lạc với bạn nhanh chóng.'] },
  { key: 'APPROVAL_REQUESTS', icon: ShieldCheck, label: ['Help with sensitive actions', 'সংবেদনশীল কাজে সাহায্য', 'संवेदनशील कामों में मदद', 'Giúp với việc nhạy cảm'], desc: ['Asked to approve larger practice payments before they go through.', 'বড় অনুশীলন পেমেন্টের আগে অনুমোদন চাওয়া হবে।', 'बड़े अभ्यास भुगतान से पहले मंज़ूरी मांगी जाएगी।', 'Được hỏi duyệt các khoản thanh toán luyện tập lớn.'], why: ['A second pair of eyes before money moves.', 'টাকা যাওয়ার আগে আরেকজনের চোখ।', 'पैसे जाने से पहले एक और नज़र।', 'Thêm một người kiểm tra trước khi tiền đi.'] },
  { key: 'SAFETY_ALERTS', icon: BellRing, label: ['Receive safety alerts', 'নিরাপত্তা সতর্কবার্তা', 'सुरक्षा अलर्ट पाएं', 'Nhận cảnh báo an toàn'], desc: ['How many risky messages you checked — never the messages themselves.', 'কতগুলো ঝুঁকিপূর্ণ মেসেজ যাচাই করেছেন — মেসেজগুলো নয়।', 'कितने खतरनाक संदेश जांचे — संदेश नहीं।', 'Số tin rủi ro bạn đã kiểm tra — không phải nội dung.'], why: ['They can notice if scammers are targeting you.', 'প্রতারকেরা আপনাকে নিশানা করছে কি না তাঁরা বুঝতে পারবেন।', 'वे देख सकेंगे कि धोखेबाज़ आपको निशाना तो नहीं बना रहे।', 'Họ có thể nhận ra nếu kẻ gian đang nhắm vào bạn.'] },
  { key: 'LEARNING_PROGRESS', icon: TrendingUp, label: ['See learning progress', 'শেখার অগ্রগতি দেখা', 'सीखने की प्रगति देखें', 'Xem tiến độ học'], desc: ['Which skills you are learning and how far you have come.', 'কোন দক্ষতা শিখছেন আর কতদূর এগিয়েছেন।', 'कौन से कौशल सीख रहे हैं और कितना आगे आए।', 'Bạn đang học kỹ năng nào và đã tiến bộ ra sao.'], why: ['So they can cheer you on and practise with you.', 'যাতে তাঁরা উৎসাহ দিতে ও সাথে অনুশীলন করতে পারেন।', 'ताकि वे हौसला बढ़ा सकें और साथ अभ्यास करें।', 'Để họ động viên và luyện cùng bạn.'] },
  { key: 'TASK_ACTIVITY', icon: ListChecks, label: ["See what I'm working on", 'আমি কী করছি দেখা', 'मैं क्या कर रहा हूँ देखें', 'Xem việc tôi đang làm'], desc: ['The lesson or practice you are in the middle of.', 'যে পাঠ বা অনুশীলনের মাঝে আছেন।', 'जिस पाठ या अभ्यास के बीच में हैं।', 'Bài học hoặc bài luyện bạn đang làm dở.'], why: ['Helpful when they guide you over the phone.', 'ফোনে দেখিয়ে দেওয়ার সময় কাজে লাগে।', 'फोन पर मार्गदर्शन करते समय उपयोगी।', 'Hữu ích khi họ hướng dẫn bạn qua điện thoại.'] },
  { key: 'MEMORY_BOOK', icon: BookMarked, label: ['See Memory Book titles', 'স্মৃতির খাতার শিরোনাম দেখা', 'याद की किताब के शीर्षक देखें', 'Xem tiêu đề Sổ ghi nhớ'], desc: ['Titles of things you saved — not your notes.', 'আপনার রাখা জিনিসের শিরোনাম — আপনার নোট নয়।', 'आपकी सहेजी चीज़ों के शीर्षक — आपके नोट नहीं।', 'Tiêu đề những điều bạn lưu — không phải ghi chú.'], why: ['So they know what you have already learned.', 'যাতে তাঁরা জানেন আপনি কী শিখে ফেলেছেন।', 'ताकि उन्हें पता हो आपने क्या सीख लिया।', 'Để họ biết bạn đã học được gì.'] },
];
const DEFAULT_SCOPES = ['EMERGENCY_ALERTS', 'APPROVAL_REQUESTS', 'SAFETY_ALERTS'];
const ROLE = {
  PRIMARY: ['Main trusted person', 'প্রধান বিশ্বস্ত মানুষ', 'मुख्य भरोसेमंद व्यक्ति', 'Người tin cậy chính'],
  SECONDARY: ['Also helps', 'সাথে সাহায্য করেন', 'साथ में मदद करते हैं', 'Cùng giúp đỡ'],
};

function PermissionEditor({ scopes, setScopes, threshold, setThreshold, t, currency, idPrefix }) {
  return (
    <div className="perm-list">
      {SCOPES.map((s) => {
        const on = scopes.has(s.key);
        const Icon = s.icon;
        return (
          <div key={s.key} className="perm-row" data-on={on}>
            <span className="icon-chip icon-chip-sm" aria-hidden="true"><Icon /></span>
            <div className="stack grow" style={{ '--gap': '2px' }}>
              <span className="text-strong" id={`${idPrefix}-${s.key}`}>{t(...s.label)}</span>
              <span className="text-muted text-sm">{t(...s.desc)}</span>
              <span className="text-subtle">{t(...s.why)}</span>
            </div>
            <Switch checked={on} labelledBy={`${idPrefix}-${s.key}`} onChange={(v) => setScopes((prev) => { const next = new Set(prev); if (v) next.add(s.key); else next.delete(s.key); return next; })} />
          </div>
        );
      })}
      {scopes.has('APPROVAL_REQUESTS') && (
        <Field label={t(`Ask them to approve practice payments from this amount (${currency})`, `এই পরিমাণ থেকে অনুশীলন পেমেন্টে অনুমোদন চাইবে (${currency})`, `इस रकम से अभ्यास भुगतान पर मंज़ूरी मांगें (${currency})`, `Nhờ duyệt thanh toán luyện tập từ số tiền này (${currency})`)}>
          {(p) => <input {...p} className="input" inputMode="decimal" value={threshold} onChange={(e) => setThreshold(e.target.value.replace(/[^\d.]/g, ''))} style={{ maxWidth: 220 }} />}
        </Field>
      )}
      <p className="hint row row-top" style={{ '--gap': '6px', flexWrap: 'nowrap' }}><EyeOff size={16} aria-hidden="true" style={{ marginTop: 3 }} />{t('Trusted people never see your passwords, PINs, OTPs, money details or private conversations.', 'বিশ্বস্ত মানুষরা কখনো আপনার পাসওয়ার্ড, পিন, ওটিপি, টাকার তথ্য বা ব্যক্তিগত কথোপকথন দেখতে পান না।', 'भरोसेमंद लोग कभी आपका पासवर्ड, पिन, ओटीपी, पैसों की जानकारी या निजी बातचीत नहीं देखते।', 'Người tin cậy không bao giờ thấy mật khẩu, mã PIN, OTP, thông tin tiền bạc hay trò chuyện riêng của bạn.')}</p>
    </div>
  );
}

function InviteDialog({ open, onClose, onInvited, t, currency }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('PRIMARY');
  const [scopes, setScopes] = useState(() => new Set(DEFAULT_SCOPES));
  const [threshold, setThreshold] = useState('1000');
  const [sent, setSent] = useState(false);
  const action = useAsyncAction();
  const valid = /^\S+@\S+\.\S+$/.test(email.trim());

  const close = () => { onClose(); setTimeout(() => { setSent(false); setEmail(''); action.reset(); }, 300); };
  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    try {
      await action.run(() => post('/guardian/invite', { guardianEmail: email.trim(), role, permissions: [...scopes], approvalThreshold: Number(threshold) || 0 }));
      setSent(true);
      onInvited();
    } catch { /* shown below */ }
  };

  return (
    <Dialog open={open} onClose={close} size="lg" icon={UserPlus} title={t('Add a trusted person', 'বিশ্বস্ত মানুষ যোগ করুন', 'भरोसेमंद व्यक्ति जोड़ें', 'Thêm người tin cậy')}
      description={sent ? null : t('A son, daughter, friend or carer. They can help — you stay in charge of your account.', 'ছেলে, মেয়ে, বন্ধু বা দেখাশোনাকারী। তাঁরা সাহায্য করবেন — অ্যাকাউন্টের নিয়ন্ত্রণ আপনার হাতেই।', 'बेटा, बेटी, दोस्त या देखभाल करने वाला। वे मदद करेंगे — खाते का नियंत्रण आपके पास रहेगा।', 'Con, bạn bè hay người chăm sóc. Họ có thể giúp — bạn vẫn làm chủ tài khoản.')}>
      {sent ? (
        <SuccessState title={t('Invitation sent', 'আমন্ত্রণ পাঠানো হয়েছে', 'निमंत्रण भेजा गया', 'Đã gửi lời mời')} action={<Button onClick={close}>{t('Done', 'ঠিক আছে', 'ठीक है', 'Xong')}</Button>}>
          <p className="text-muted">{t('Nothing is shared until they accept. You can change or remove their access any time.', 'তাঁরা গ্রহণ না করা পর্যন্ত কিছু শেয়ার হবে না। যেকোনো সময় অনুমতি বদলাতে বা সরাতে পারবেন।', 'उनके स्वीकार करने तक कुछ साझा नहीं होगा। कभी भी अनुमति बदल या हटा सकते हैं।', 'Không chia sẻ gì cho đến khi họ chấp nhận. Bạn có thể đổi hoặc gỡ quyền bất cứ lúc nào.')}</p>
        </SuccessState>
      ) : (
        <form className="stack" style={{ '--gap': 'var(--s-5)' }} onSubmit={submit}>
          <Field label={t('Their email address', 'তাঁর ইমেইল ঠিকানা', 'उनका ईमेल पता', 'Địa chỉ email của họ')} error={action.state === 'error' ? action.error?.message : null}>
            {(p) => <input {...p} type="email" autoComplete="off" className="input input-lg" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" data-autofocus />}
          </Field>
          <fieldset className="stack" style={{ '--gap': 'var(--s-2)' }}>
            <legend className="label">{t('Their role', 'তাঁর ভূমিকা', 'उनकी भूमिका', 'Vai trò của họ')}</legend>
            <div className="row" style={{ '--gap': 'var(--s-2)' }} role="radiogroup">
              {Object.entries(ROLE).map(([k, label]) => (
                <button key={k} type="button" role="radio" aria-checked={role === k} className="choice" style={{ flex: '1 1 200px', minHeight: 56 }} onClick={() => setRole(k)}>
                  <span className="choice-radio" aria-hidden="true" />{t(...label)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="stack" style={{ '--gap': 'var(--s-2)' }}>
            <legend className="label">{t('What they can help with', 'তাঁরা কীসে সাহায্য করতে পারবেন', 'वे किसमें मदद कर सकते हैं', 'Họ có thể giúp gì')}</legend>
            <PermissionEditor scopes={scopes} setScopes={setScopes} threshold={threshold} setThreshold={setThreshold} t={t} currency={currency} idPrefix="inv" />
          </fieldset>
          <div className="dialog-actions">
            <Button variant="quiet" onClick={close}>{t('Cancel', 'বাতিল', 'रद्द करें', 'Hủy')}</Button>
            <Button type="submit" icon={Mail} disabled={!valid} state={action.state === 'loading' ? 'loading' : 'idle'} loadingLabel={t('Sending…', 'পাঠানো হচ্ছে…', 'भेजा जा रहा है…', 'Đang gửi…')}>{t('Send invitation', 'আমন্ত্রণ পাঠান', 'निमंत्रण भेजें', 'Gửi lời mời')}</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

function PersonCard({ rel, t, language, currency, onChanged }) {
  const { showToast } = useToast();
  const [managing, setManaging] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [scopes, setScopes] = useState(() => new Set(rel.permissions));
  const [threshold, setThreshold] = useState(String(rel.approvalThreshold / 100));
  const save = useAsyncAction();
  const revoke = useAsyncAction();
  const pending = rel.status === 'PENDING';
  const name = rel.guardian?.fullName || rel.guardianEmail;

  const doSave = async () => {
    try {
      await save.run(() => put(`/guardian/${rel.id}/permissions`, { permissions: [...scopes], approvalThreshold: Number(threshold) || 0 }));
      showToast(t('Permissions updated.', 'অনুমতি হালনাগাদ হয়েছে।', 'अनुमतियाँ अपडेट हुईं।', 'Đã cập nhật quyền.'), 'success');
      setManaging(false);
      onChanged();
    } catch { /* shown in dialog */ }
  };
  const doRevoke = async () => {
    try {
      await revoke.run(() => post(`/guardian/${rel.id}/revoke`));
      showToast(pending ? t('Invitation cancelled.', 'আমন্ত্রণ বাতিল হয়েছে।', 'निमंत्रण रद्द हुआ।', 'Đã hủy lời mời.') : t('Access removed.', 'অনুমতি সরানো হয়েছে।', 'पहुँच हटा दी गई।', 'Đã gỡ quyền truy cập.'), 'success');
      setRemoving(false);
      onChanged();
    } catch (err) { showToast(err.message, 'danger'); }
  };

  return (
    <article className="card person-card" aria-labelledby={`p-${rel.id}`}>
      <div className="person-head">
        <Avatar name={name} size="lg" tone={pending ? 'gold' : undefined} />
        <div className="stack grow" style={{ '--gap': '2px', minWidth: 0 }}>
          <h3 id={`p-${rel.id}`} className="h-card truncate">{name}</h3>
          <p className="text-subtle truncate">{rel.guardianEmail}</p>
          <div className="row" style={{ '--gap': '6px', marginTop: 4 }}>
            {pending ? <Badge tone="gold" icon={Clock}>{t('Invitation sent', 'আমন্ত্রণ পাঠানো হয়েছে', 'निमंत्रण भेजा गया', 'Đã gửi lời mời')}</Badge> : <Badge tone="ok" icon={Check}>{t('Connected', 'যুক্ত', 'जुड़े हुए', 'Đã kết nối')}</Badge>}
            <Badge>{t(...(ROLE[rel.role] || ROLE.PRIMARY))}</Badge>
          </div>
        </div>
      </div>
      <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
        <p className="text-sm text-strong">{t('Can help with', 'যাতে সাহায্য করতে পারেন', 'किसमें मदद कर सकते हैं', 'Có thể giúp')}</p>
        <div className="row" style={{ '--gap': '6px' }}>
          {rel.permissions.length === 0 && <span className="text-subtle">{t('Nothing shared yet', 'এখনো কিছু শেয়ার হয়নি', 'अभी कुछ साझा नहीं', 'Chưa chia sẻ gì')}</span>}
          {SCOPES.filter((s) => rel.permissions.includes(s.key)).map((s) => <span key={s.key} className="badge badge-brand"><s.icon aria-hidden="true" />{t(...s.label)}</span>)}
        </div>
      </div>
      <p className="text-subtle">
        {pending ? `${t('Invited', 'আমন্ত্রিত', 'आमंत्रित', 'Đã mời')} ${formatRelative(rel.createdAt, language)}` : `${t('Connected', 'যুক্ত', 'जुड़े', 'Kết nối')} ${formatRelative(rel.respondedAt || rel.createdAt, language)}`}
        {rel.permissions.includes('APPROVAL_REQUESTS') && rel.approvalThreshold > 0 && ` · ${t('approves from', 'অনুমোদন শুরু', 'मंज़ूरी', 'duyệt từ')} ${formatMoney(rel.approvalThreshold, currency, language)}`}
      </p>
      <div className="person-actions">
        {!pending && <Button variant="secondary" size="sm" icon={Settings2} onClick={() => setManaging(true)}>{t('Change permissions', 'অনুমতি বদলান', 'अनुमति बदलें', 'Đổi quyền')}</Button>}
        <Button variant="danger-quiet" size="sm" icon={pending ? X : UserMinus} onClick={() => setRemoving(true)}>{pending ? t('Cancel invitation', 'আমন্ত্রণ বাতিল', 'निमंत्रण रद्द करें', 'Hủy lời mời') : t('Remove access', 'অনুমতি সরান', 'पहुँच हटाएं', 'Gỡ quyền')}</Button>
      </div>

      <Dialog open={managing} onClose={() => setManaging(false)} size="lg" icon={Settings2} title={t(`What ${name} can help with`, `${name} কীসে সাহায্য করতে পারবেন`, `${name} किसमें मदद कर सकते हैं`, `${name} có thể giúp gì`)}
        actions={<><Button variant="quiet" onClick={() => setManaging(false)}>{t('Cancel', 'বাতিল', 'रद्द करें', 'Hủy')}</Button><Button icon={Check} onClick={doSave} state={save.state} loadingLabel={t('Saving…', 'রাখা হচ্ছে…', 'सहेजा जा रहा है…', 'Đang lưu…')} successLabel={t('Saved', 'রাখা হয়েছে', 'सहेजा गया', 'Đã lưu')}>{t('Save', 'রাখুন', 'सहेजें', 'Lưu')}</Button></>}>
        {save.state === 'error' && <Alert tone="warn">{save.error?.message}</Alert>}
        <PermissionEditor scopes={scopes} setScopes={setScopes} threshold={threshold} setThreshold={setThreshold} t={t} currency={currency} idPrefix={`m-${rel.id}`} />
      </Dialog>

      <ConfirmDialog
        open={removing} onClose={() => setRemoving(false)} onConfirm={doRevoke} state={revoke.state === 'loading' ? 'loading' : 'idle'}
        title={pending ? t('Cancel this invitation?', 'এই আমন্ত্রণ বাতিল করবেন?', 'यह निमंत्रण रद्द करें?', 'Hủy lời mời này?') : t(`Remove ${name}'s access?`, `${name}-এর অনুমতি সরাবেন?`, `${name} की पहुँच हटाएं?`, `Gỡ quyền của ${name}?`)}
        consequences={pending ? [t('The invitation link stops working.', 'আমন্ত্রণের লিংক আর কাজ করবে না।', 'निमंत्रण लिंक काम नहीं करेगा।', 'Liên kết mời sẽ không còn hiệu lực.')] : [
          t('Their access ends immediately.', 'তাঁদের অনুমতি সঙ্গে সঙ্গে শেষ হবে।', 'उनकी पहुँच तुरंत खत्म होगी।', 'Quyền của họ kết thúc ngay lập tức.'),
          t('They will no longer be told when you ask for help.', 'আপনি সাহায্য চাইলে তাঁরা আর জানবেন না।', 'आपके मदद मांगने पर उन्हें अब नहीं बताया जाएगा।', 'Họ sẽ không còn được báo khi bạn nhờ giúp.'),
          t('You can invite them again later.', 'পরে আবার আমন্ত্রণ জানাতে পারবেন।', 'बाद में फिर आमंत्रित कर सकते हैं।', 'Bạn có thể mời lại sau.'),
        ]}
        confirmLabel={pending ? t('Cancel invitation', 'আমন্ত্রণ বাতিল', 'निमंत्रण रद्द करें', 'Hủy lời mời') : t('Remove access', 'অনুমতি সরান', 'पहुँच हटाएं', 'Gỡ quyền')}
        cancelLabel={t('Keep', 'রেখে দিন', 'रहने दें', 'Giữ lại')}
      />
    </article>
  );
}

function MyCircle({ data, reload, t, language, currency }) {
  const [inviting, setInviting] = useState(false);
  const list = data.myTrustedPeople.filter((r) => r.status !== 'REVOKED');
  const active = list.filter((r) => r.status === 'ACTIVE');
  const pending = list.filter((r) => r.status === 'PENDING');

  return (
    <div className="stack" style={{ '--gap': 'var(--step-gap)' }}>
      <section className="circle-hero card card-pad-lg rise" aria-labelledby="circle-h">
        <div className="stack" style={{ '--gap': 'var(--s-2)', flex: 1 }}>
          <p className="eyebrow">{t('Support without surveillance', 'নজরদারি ছাড়া পাশে থাকা', 'निगरानी नहीं, साथ', 'Hỗ trợ, không giám sát')}</p>
          <h2 id="circle-h" className="h-section">{t('You choose who helps — and exactly what they can see.', 'কে সাহায্য করবেন — আর ঠিক কী দেখবেন — তা আপনিই বেছে নেন।', 'कौन मदद करे — और ठीक क्या देखे — यह आप चुनते हैं।', 'Bạn chọn ai giúp — và chính xác họ được thấy gì.')}</h2>
          <p className="text-muted">{t('Trusted people can be told when you ask for help, and can double-check sensitive actions. They never see passwords, codes or private conversations.', 'আপনি সাহায্য চাইলে বিশ্বস্ত মানুষদের জানানো যায়, আর তাঁরা সংবেদনশীল কাজ যাচাই করতে পারেন। পাসওয়ার্ড, কোড বা ব্যক্তিগত কথোপকথন তাঁরা কখনো দেখেন না।', 'मदद मांगने पर भरोसेमंद लोगों को बताया जा सकता है, और वे संवेदनशील काम जांच सकते हैं। वे कभी पासवर्ड, कोड या निजी बातचीत नहीं देखते।', 'Người tin cậy được báo khi bạn nhờ giúp và có thể kiểm tra lại việc nhạy cảm. Họ không bao giờ thấy mật khẩu, mã hay trò chuyện riêng.')}</p>
        </div>
        <Button size="lg" icon={UserPlus} onClick={() => setInviting(true)}>{t('Add a trusted person', 'বিশ্বস্ত মানুষ যোগ করুন', 'भरोसेमंद व्यक्ति जोड़ें', 'Thêm người tin cậy')}</Button>
      </section>

      <section className="section" aria-labelledby="circle-list-h">
        <SectionHeader id="circle-list-h" title={t('Your trusted people', 'আপনার বিশ্বস্ত মানুষ', 'आपके भरोसेमंद लोग', 'Người tin cậy của bạn')} />
        {active.length === 0 ? (
          <EmptyState card icon={HeartHandshake} tone="coral" title={t('No trusted person yet', 'এখনো কোনো বিশ্বস্ত মানুষ নেই', 'अभी कोई भरोसेमंद व्यक्ति नहीं', 'Chưa có người tin cậy')}
            action={<Button icon={UserPlus} onClick={() => setInviting(true)}>{t('Add someone you trust', 'বিশ্বস্ত কাউকে যোগ করুন', 'किसी भरोसेमंद को जोड़ें', 'Thêm người bạn tin')}</Button>}>
            {t('When you add someone, they can be told if you ask for help — so you are never on your own.', 'কাউকে যোগ করলে আপনি সাহায্য চাইলে তাঁকে জানানো যাবে — তাই আপনি কখনো একা নন।', 'किसी को जोड़ने पर मदद मांगने पर उन्हें बताया जा सकेगा — आप कभी अकेले नहीं।', 'Khi thêm ai đó, họ sẽ được báo khi bạn nhờ giúp — bạn không bao giờ một mình.')}
          </EmptyState>
        ) : (
          <div className="people-grid">{active.map((r) => <PersonCard key={r.id} rel={r} t={t} language={language} currency={currency} onChanged={reload} />)}</div>
        )}
      </section>

      {pending.length > 0 && (
        <section className="section" aria-labelledby="pending-h">
          <SectionHeader id="pending-h" title={t('Pending invitations', 'অপেক্ষমাণ আমন্ত্রণ', 'लंबित निमंत्रण', 'Lời mời đang chờ')} description={t('Nothing is shared until they accept.', 'গ্রহণ না করা পর্যন্ত কিছু শেয়ার হয় না।', 'स्वीकार करने तक कुछ साझा नहीं होता।', 'Không chia sẻ gì cho đến khi họ chấp nhận.')} />
          <div className="people-grid">{pending.map((r) => <PersonCard key={r.id} rel={r} t={t} language={language} currency={currency} onChanged={reload} />)}</div>
        </section>
      )}

      <section className="section" aria-labelledby="scopes-h">
        <SectionHeader id="scopes-h" title={t('What they can help with', 'তাঁরা কীসে সাহায্য করতে পারেন', 'वे किसमें मदद कर सकते हैं', 'Họ có thể giúp gì')} />
        <div className="scope-grid">
          {SCOPES.slice(0, 4).map((s) => (
            <div key={s.key} className="card scope-card">
              <span className="icon-chip" aria-hidden="true"><s.icon /></span>
              <p className="h-card">{t(...s.label)}</p>
              <p className="text-muted text-sm">{t(...s.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      <InviteDialog open={inviting} onClose={() => setInviting(false)} onInvited={reload} t={t} currency={currency} />
    </div>
  );
}

function SeniorOverview({ senior, t, language }) {
  const { data, loading, error } = useResource(`/guardian/seniors/${senior.id}/overview`, { select: (d) => d.overview });
  if (loading && !data) return <Skeleton height={80} />;
  if (error) return <Alert tone="warn">{error.message}</Alert>;
  if (!data) return null;
  return (
    <div className="stack fade" style={{ '--gap': 'var(--s-3)' }}>
      <KeyValue items={[
        data.progress && [t('Skills practised', 'অনুশীলিত দক্ষতা', 'अभ्यास किए कौशल', 'Kỹ năng đã luyện'), data.progress.skills.length],
        data.progress && [t('Lessons finished', 'শেষ করা পাঠ', 'पूरे पाठ', 'Bài học đã xong'), data.progress.lessonsCompleted],
        data.safety && [t('Risky messages checked (30 days)', 'যাচাই করা ঝুঁকিপূর্ণ মেসেজ (৩০ দিন)', 'जांचे गए खतरनाक संदेश (30 दिन)', 'Tin rủi ro đã kiểm tra (30 ngày)'), (data.safety.last30Days.HIGH_RISK || 0) + (data.safety.last30Days.CRITICAL || 0)],
        data.currentTask && [t('Working on', 'এখন করছেন', 'अभी कर रहे हैं', 'Đang làm'), localize(data.currentTask.scenario?.title || data.currentTask.lesson?.title, language) || data.currentTask.goal],
        data.recentMemories && [t('Recently saved', 'সম্প্রতি রাখা', 'हाल में सहेजा', 'Mới lưu'), data.recentMemories.map((m) => m.title).join(', ') || '—'],
      ]} />
      <p className="hint row" style={{ '--gap': '6px' }}><Eye size={16} aria-hidden="true" />{t('You only see what they chose to share.', 'তাঁরা যা শেয়ার করতে বেছে নিয়েছেন শুধু সেটাই দেখছেন।', 'आप वही देख रहे हैं जो उन्होंने साझा करना चुना।', 'Bạn chỉ thấy những gì họ chọn chia sẻ.')}</p>
    </div>
  );
}

function HelpingOthers({ data, reload, t, language }) {
  const { showToast } = useToast();
  const approvals = useResource('/guardian/approvals/mine', { select: (d) => d.approvals });
  const emergencies = useResource('/emergency/incoming', { select: (d) => d.events });
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(null);

  const act = async (key, fn, okMsg) => {
    setBusy(key);
    try { await fn(); if (okMsg) showToast(okMsg, 'success'); reload(); approvals.reload(); emergencies.reload(); } catch (err) { showToast(err.message, 'danger'); } finally { setBusy(null); }
  };

  const openEmergencies = (emergencies.data || []).filter((e) => ['TRIGGERED', 'SENT', 'ACKNOWLEDGED', 'CONTACTED'].includes(e.status));
  const pending = (approvals.data || []).filter((a) => a.status === 'PENDING');

  return (
    <div className="stack" style={{ '--gap': 'var(--step-gap)' }}>
      {data.invitationsForMe.map((r) => (
        <Alert key={r.id} tone="brand" icon={HeartHandshake} title={t(`${r.senior.fullName} would like you as a trusted person`, `${r.senior.fullName} আপনাকে বিশ্বস্ত মানুষ হিসেবে চান`, `${r.senior.fullName} आपको भरोसेमंद व्यक्ति बनाना चाहते हैं`, `${r.senior.fullName} muốn bạn là người tin cậy`)}
          actions={<><Button size="sm" icon={Check} state={busy === `acc-${r.id}` ? 'loading' : 'idle'} onClick={() => act(`acc-${r.id}`, () => post(`/guardian/${r.id}/accept`), t('Connected.', 'যুক্ত হয়েছে।', 'जुड़ गए।', 'Đã kết nối.'))}>{t('Accept', 'গ্রহণ', 'स्वीकार', 'Chấp nhận')}</Button><Button size="sm" variant="quiet" icon={X} onClick={() => act(`dec-${r.id}`, () => post(`/guardian/${r.id}/revoke`))}>{t('Decline', 'প্রত্যাখ্যান', 'अस्वीकार', 'Từ chối')}</Button></>}>
          {t('They chose what you will be able to see.', 'আপনি কী দেখতে পাবেন তা তাঁরাই বেছে নিয়েছেন।', 'आप क्या देख पाएंगे, उन्होंने चुना है।', 'Họ đã chọn những gì bạn được xem.')}
        </Alert>
      ))}

      {openEmergencies.length > 0 && (
        <section className="section" aria-labelledby="incoming-h">
          <SectionHeader id="incoming-h" title={<span className="row" style={{ '--gap': '8px', color: 'var(--danger-700)' }}><AlertTriangle aria-hidden="true" /> {t('Help requests', 'সাহায্যের অনুরোধ', 'मदद के अनुरोध', 'Yêu cầu giúp đỡ')}</span>} />
          {openEmergencies.map((e) => (
            <article key={e.id} className="card emergency-card stack" style={{ '--gap': 'var(--s-3)' }}>
              <div className="row-between">
                <p className="h-card">{e.senior?.fullName}</p>
                <span className="text-subtle">{formatRelative(e.createdAt, language)}</span>
              </div>
              <p>{t(...(REASONS.find((r) => r.key === e.reason)?.label || ['']))}{e.message ? ` — “${e.message}”` : ''}</p>
              <p className="hint">{t('Contact them using a phone number you already trust.', 'আগে থেকে জানা ফোন নম্বরে যোগাযোগ করুন।', 'पहले से भरोसेमंद फोन नंबर से संपर्क करें।', 'Liên lạc bằng số điện thoại bạn đã tin tưởng.')}</p>
              <div className="btn-group">
                {['TRIGGERED', 'SENT'].includes(e.status) && <Button size="sm" icon={Eye} state={busy === `ack-${e.id}` ? 'loading' : 'idle'} onClick={() => act(`ack-${e.id}`, () => post(`/emergency/${e.id}/acknowledge`, {}, { idempotent: true }))}>{t("I've seen this", 'দেখেছি', 'मैंने देख लिया', 'Tôi đã thấy')}</Button>}
                {e.status !== 'CONTACTED' && <Button size="sm" variant="secondary" icon={MessageSquare} state={busy === `con-${e.id}` ? 'loading' : 'idle'} onClick={() => act(`con-${e.id}`, () => post(`/emergency/${e.id}/contacted`, {}, { idempotent: true }))}>{t("I've contacted them", 'যোগাযোগ করেছি', 'मैंने संपर्क किया', 'Tôi đã liên lạc')}</Button>}
                <Button size="sm" variant="quiet" icon={Check} state={busy === `res-${e.id}` ? 'loading' : 'idle'} onClick={() => act(`res-${e.id}`, () => post(`/emergency/${e.id}/resolve`, {}, { idempotent: true }))}>{t('Resolved', 'সমাধান হয়েছে', 'सुलझ गया', 'Đã xong')}</Button>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="section" aria-labelledby="approvals-h">
        <SectionHeader id="approvals-h" title={t('Waiting for your approval', 'আপনার অনুমোদনের অপেক্ষায়', 'आपकी मंज़ूरी का इंतज़ार', 'Đang chờ bạn duyệt')} />
        {pending.length === 0 ? <p className="text-muted">{t('Nothing waiting right now.', 'এখন কিছু অপেক্ষায় নেই।', 'अभी कुछ इंतज़ार में नहीं।', 'Hiện không có gì đang chờ.')}</p> : pending.map((a) => (
          <article key={a.id} className="card stack" style={{ '--gap': 'var(--s-3)' }}>
            <div className="row-between">
              <p className="h-card">{a.senior?.fullName}</p>
              <Badge tone="brand">{t('Practice', 'অনুশীলন', 'अभ्यास', 'Luyện tập')}</Badge>
            </div>
            <KeyValue items={[
              [t('What', 'কী', 'क्या', 'Việc gì'), a.summary.what?.replace(/_/g, ' ').toLowerCase()],
              [t('App', 'অ্যাপ', 'ऐप', 'Ứng dụng'), a.summary.application],
              [t('Amount', 'পরিমাণ', 'रकम', 'Số tiền'), a.summary.amountOrData],
              [t('Who', 'কাকে', 'किसे', 'Cho ai'), a.summary.who],
            ]} />
            <p className="text-subtle row" style={{ '--gap': '6px' }}><Clock size={16} aria-hidden="true" /> {formatRelative(a.createdAt, language)}</p>
            <div className="btn-group">
              <Button size="sm" icon={Check} state={busy === `ap-${a.id}` ? 'loading' : 'idle'} onClick={() => act(`ap-${a.id}`, () => post(`/guardian/approvals/${a.id}/resolve`, { status: 'APPROVED' }, { idempotent: true }), t('Approved.', 'অনুমোদিত।', 'मंज़ूर।', 'Đã duyệt.'))}>{t('Approve', 'অনুমোদন', 'मंज़ूर', 'Duyệt')}</Button>
              <Button size="sm" variant="quiet" icon={MessageSquare} onClick={() => act(`fl-${a.id}`, () => post(`/guardian/approvals/${a.id}/resolve`, { status: 'FLAGGED' }, { idempotent: true }))}>{t("Let's talk first", 'আগে কথা বলি', 'पहले बात करें', 'Nói chuyện trước')}</Button>
              <Button size="sm" variant="danger-quiet" icon={X} onClick={() => act(`rj-${a.id}`, () => post(`/guardian/approvals/${a.id}/resolve`, { status: 'REJECTED' }, { idempotent: true }))}>{t('Decline', 'প্রত্যাখ্যান', 'अस्वीकार', 'Từ chối')}</Button>
            </div>
          </article>
        ))}
      </section>

      <section className="section" aria-labelledby="help-list-h">
        <SectionHeader id="help-list-h" title={t('People you help', 'যাঁদের আপনি সাহায্য করেন', 'जिनकी आप मदद करते हैं', 'Những người bạn giúp')} />
        {data.peopleIHelp.length === 0 ? <p className="text-muted">{t('Nobody has connected with you yet.', 'এখনো কেউ আপনার সাথে যুক্ত হননি।', 'अभी किसी ने आपसे नहीं जोड़ा।', 'Chưa ai kết nối với bạn.')}</p> : data.peopleIHelp.map((r) => (
          <article key={r.id} className="card stack" style={{ '--gap': 'var(--s-3)' }}>
            <button type="button" className="person-toggle" onClick={() => setExpanded(expanded === r.id ? null : r.id)} aria-expanded={expanded === r.id}>
              <Avatar name={r.senior.fullName} />
              <span className="list-item-title grow">{r.senior.fullName}</span>
              {expanded === r.id ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
            </button>
            {expanded === r.id && <SeniorOverview senior={r.senior} t={t} language={language} />}
          </article>
        ))}
      </section>
    </div>
  );
}

export default function PeoplePage() {
  const { user } = useAuth();
  const { t, language } = usePreferences();
  const { data, loading, error, reload } = useResource('/guardian');
  const helpsOthers = data && (data.peopleIHelp.length > 0 || data.invitationsForMe.length > 0);
  const [tab, setTab] = useState(user?.role === 'GUARDIAN' ? 'helping' : 'mine');
  const currency = getLanguage(language).currency === 'USD' ? 'BDT' : getLanguage(language).currency;
  const showTabs = helpsOthers || user?.role === 'GUARDIAN';

  return (
    <div className="page people-page">
      <PageHeader
        eyebrow={t('Trusted Circle', 'বিশ্বস্ত বৃত্ত', 'भरोसेमंद दायरा', 'Vòng tròn tin cậy')}
        title={t('The people who have your back', 'যাঁরা আপনার পাশে আছেন', 'जो आपके साथ हैं', 'Những người luôn bên bạn')}
        description={t('You decide who helps and what they can see. You can change it any time.', 'কে সাহায্য করবে আর কী দেখবে, আপনিই ঠিক করেন। যেকোনো সময় বদলাতে পারেন।', 'कौन मदद करे और क्या देखे, आप तय करते हैं। कभी भी बदल सकते हैं।', 'Bạn quyết định ai giúp và họ thấy gì. Có thể thay đổi bất cứ lúc nào.')}
      />
      {showTabs && (
        <Tabs label={t('View', 'দেখুন', 'देखें', 'Xem')} value={tab} onChange={setTab} tabs={[
          { id: 'mine', label: t('My trusted people', 'আমার বিশ্বস্ত মানুষ', 'मेरे भरोसेमंद लोग', 'Người tin cậy của tôi'), icon: HeartHandshake },
          { id: 'helping', label: t('People I help', 'যাঁদের সাহায্য করি', 'जिनकी मदद करता हूँ', 'Người tôi giúp'), icon: HandHelping, count: data?.invitationsForMe.length || 0 },
        ]} />
      )}
      {loading && !data && <div className="people-grid"><Skeleton variant="card" height={240} count={2} /></div>}
      {error && <ErrorState card title={t('Your trusted people could not be loaded', 'বিশ্বস্ত মানুষদের লোড করা যায়নি', 'भरोसेमंद लोग लोड नहीं हो सके', 'Không tải được người tin cậy')} message={error.message} onRetry={reload} />}
      {data && (
        <div role={showTabs ? 'tabpanel' : undefined} id={showTabs ? `panel-${tab}` : undefined} aria-labelledby={showTabs ? `tab-${tab}` : undefined} key={tab} className="fade">
          {tab === 'mine' ? <MyCircle data={data} reload={reload} t={t} language={language} currency={currency} /> : <HelpingOthers data={data} reload={reload} t={t} language={language} />}
        </div>
      )}
    </div>
  );
}
