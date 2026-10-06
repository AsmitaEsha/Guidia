import { useEffect, useRef, useState } from 'react';
import {
  Accessibility, Bell, Check, Copy, Download, Globe, Laptop, Link2, LogOut, Puzzle, RefreshCw, Save, ShieldCheck,
  Smartphone, Sparkles, Trash2, User, Volume2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { useToast } from '../../context/ToastContext';
import { useCapabilities } from '../../context/ConfigContext';
import { useResource } from '../../hooks/useResource';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { api, del, get, post } from '../../services/apiClient';
import { LANGUAGES, getLanguage } from '../../config/languages';
import { formatRelative } from '../../i18n';
import { announce } from '../../utils/announce';
import { Alert, Badge, Button, ChoiceCard, Dialog, Field, IconButton, PageHeader, Segmented, Skeleton, Switch } from '../../components/ui';

const SECTIONS = [
  ['profile', User, ['Profile', 'প্রোফাইল', 'प्रोफ़ाइल', 'Hồ sơ']],
  ['language', Globe, ['Language', 'ভাষা', 'भाषा', 'Ngôn ngữ']],
  ['guidance', Sparkles, ['Guidia guidance', 'Guidia-র নির্দেশনা', 'Guidia मार्गदर्शन', 'Cách hướng dẫn']],
  ['reading', Accessibility, ['Reading & display', 'পড়া ও প্রদর্শন', 'पढ़ना और दिखावट', 'Đọc & hiển thị']],
  ['voice', Volume2, ['Voice', 'ভয়েস', 'आवाज़', 'Giọng nói']],
  ['notifications', Bell, ['Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo']],
  ['browser', Puzzle, ['Browser helper', 'ব্রাউজার সহায়ক', 'ब्राउज़र सहायक', 'Tiện ích trình duyệt']],
  ['sessions', Laptop, ['Sessions', 'সেশন', 'सत्र', 'Phiên đăng nhập']],
  ['privacy', ShieldCheck, ['Privacy & data', 'গোপনীয়তা ও তথ্য', 'निजता और डेटा', 'Riêng tư & dữ liệu']],
  ['account', LogOut, ['Account', 'অ্যাকাউন্ট', 'खाता', 'Tài khoản']],
];

function Section({ id, title, description, children, saved, t }) {
  return (
    <section className="card card-pad-lg settings-section" id={`set-${id}`} aria-labelledby={`h-${id}`} tabIndex={-1}>
      <div className="settings-section-head">
        <div className="stack" style={{ '--gap': '4px' }}>
          <h2 id={`h-${id}`} className="h-section">{title}</h2>
          {description && <p className="text-muted">{description}</p>}
        </div>
        {saved && <span className="saved-pill fade" role="status"><Check aria-hidden="true" />{t('Saved', 'রাখা হয়েছে', 'सहेजा गया', 'Đã lưu')}</span>}
      </div>
      {children}
    </section>
  );
}

function Toggle({ label, hint, checked, onChange, id }) {
  return (
    <div className="setting-row">
      <div className="stack" style={{ '--gap': '2px' }}>
        <span className="label" id={id}>{label}</span>
        {hint && <span className="hint">{hint}</span>}
      </div>
      <Switch checked={checked} onChange={onChange} labelledBy={id} />
    </div>
  );
}

function PairingCode({ t, language }) {
  const { showToast } = useToast();
  const [pairing, setPairing] = useState(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const make = useAsyncAction();

  useEffect(() => {
    if (!pairing) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [pairing]);

  const create = async () => {
    try { const p = await make.run(() => post('/extension/pairing')); setPairing(p); setCopied(false); setNow(Date.now()); } catch (err) { showToast(err.message, 'danger'); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(pairing.code); setCopied(true); showToast(t('Code copied.', 'কোড কপি হয়েছে।', 'कोड कॉपी हुआ।', 'Đã sao chép mã.'), 'success'); } catch { /* clipboard unavailable */ }
  };

  if (!pairing) {
    return <Button variant="secondary" icon={Link2} onClick={create} state={make.state === 'loading' ? 'loading' : 'idle'} className="self-start">{t('Connect the extension', 'এক্সটেনশন যুক্ত করুন', 'एक्सटेंशन जोड़ें', 'Kết nối tiện ích')}</Button>;
  }
  const left = Math.max(0, Math.round((new Date(pairing.expiresAt).getTime() - now) / 1000));
  const expired = left === 0;
  const grouped = `${pairing.code.slice(0, 4)} ${pairing.code.slice(4)}`;

  return (
    <div className={`pairing ${expired ? 'is-expired' : ''}`}>
      <p>{expired ? t('This code has expired. Make a new one.', 'এই কোডের মেয়াদ শেষ। নতুন কোড নিন।', 'यह कोड खत्म हो गया। नया बनाएं।', 'Mã đã hết hạn. Hãy tạo mã mới.') : t('Type this code into the Guidia extension:', 'এই কোডটি Guidia এক্সটেনশনে লিখুন:', 'यह कोड Guidia एक्सटेंशन में लिखें:', 'Nhập mã này vào tiện ích Guidia:')}</p>
      <p className="pairing-code" aria-label={pairing.code.split('').join(' ')} lang="en">{grouped}</p>
      <div className="row" style={{ '--gap': 'var(--s-2)' }}>
        {!expired && <Button variant="quiet" size="sm" icon={copied ? Check : Copy} onClick={copy}>{copied ? t('Copied', 'কপি হয়েছে', 'कॉपी हुआ', 'Đã sao chép') : t('Copy', 'কপি', 'कॉपी', 'Sao chép')}</Button>}
        <Badge tone={expired ? 'warn' : 'brand'}>{expired ? t('Expired', 'মেয়াদ শেষ', 'खत्म', 'Hết hạn') : t(`Expires in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`, `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} মিনিটে শেষ`, `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} में खत्म`, `Hết hạn sau ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`)}</Badge>
        <Badge>{t('Works once', 'একবারই চলে', 'एक बार चलेगा', 'Dùng một lần')}</Badge>
        {expired && <Button size="sm" icon={RefreshCw} onClick={create}>{t('New code', 'নতুন কোড', 'नया कोड', 'Mã mới')}</Button>}
      </div>
      <span className="sr-only" aria-live="polite">{expired ? t('Code expired', 'কোডের মেয়াদ শেষ', 'कोड खत्म', 'Mã đã hết hạn') : ''}</span>
      <p className="hint">{new Date(pairing.expiresAt).toLocaleTimeString(getLanguage(language).locale, { hour: 'numeric', minute: '2-digit' })}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { t, language, setLanguage, mode, setMode, prefs, setPreference } = usePreferences();
  const { speak } = useVoice();
  const { showToast } = useToast();
  const caps = useCapabilities();
  const navigate = useNavigate();
  const sessions = useResource('/auth/sessions', { select: (d) => d.sessions });
  const [name, setName] = useState(user?.fullName || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const profile = useAsyncAction();
  const exporting = useAsyncAction();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');
  const deleting = useAsyncAction();
  const [savedIn, setSavedIn] = useState(null);
  const [active, setActive] = useState('profile');
  const savedTimer = useRef(null);

  // Links like /app/settings#set-browser open at that section.
  useEffect(() => {
    if (!window.location.hash.startsWith('#set-')) return undefined;
    const id = setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ block: 'start' }), 300);
    return () => clearTimeout(id);
  }, []);

  // Highlight the section in view in the side navigation.
  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(`set-${id}`)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id.replace('set-', ''));
    }, { rootMargin: '-90px 0px -60% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Instant preferences: apply immediately, confirm quietly, roll back on failure.
  const pref = (section, key) => (value) => setPreference(key, value)
    .then(() => {
      clearTimeout(savedTimer.current);
      setSavedIn(section);
      announce(t('Saved', 'রাখা হয়েছে', 'सहेजा गया', 'Đã lưu'));
      savedTimer.current = setTimeout(() => setSavedIn(null), 2000);
    })
    .catch((err) => showToast(`${err.message} ${t('Your previous setting was kept.', 'আগের সেটিং রাখা হয়েছে।', 'पिछली सेटिंग रखी गई।', 'Đã giữ cài đặt trước đó.')}`, 'danger'));

  const saveProfile = async (e) => {
    e.preventDefault();
    try { await profile.run(() => updateProfile({ fullName: name.trim(), age: age ? Number(age) : null })); } catch { /* shown inline */ }
  };

  const exportData = async () => {
    try {
      const data = await exporting.run(() => get('/users/me/export'));
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'guidia-my-data.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { showToast(err.message, 'danger'); }
  };

  const deleteAccount = async () => {
    try {
      await deleting.run(() => api('/users/me', { method: 'DELETE', body: { password } }));
      await logout().catch(() => {});
      navigate('/landing', { replace: true });
    } catch { /* shown inline */ }
  };

  const signOut = async () => { await logout().catch(() => {}); navigate('/login', { replace: true }); };

  const jump = (id) => {
    const el = document.getElementById(`set-${id}`);
    el?.scrollIntoView({ behavior: prefs.reducedMotion ? 'auto' : 'smooth', block: 'start' });
    el?.focus({ preventScroll: true });
  };

  const browserVoice = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const thisAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const sortedSessions = [...(sessions.data || [])].sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt));
  const currentId = sortedSessions.find((s) => s.userAgent === thisAgent)?.id;
  const modes = [
    { value: 'calm', icon: Sparkles, title: t('Comfortable', 'স্বচ্ছন্দ', 'आरामदायक', 'Thoải mái'), body: t('Normal steps and pace. Good if you use a phone most days.', 'স্বাভাবিক ধাপ ও গতি। প্রতিদিন ফোন চালালে ভালো।', 'सामान्य कदम और गति। रोज़ फोन चलाते हैं तो अच्छा।', 'Bước và nhịp bình thường. Hợp nếu bạn dùng điện thoại hằng ngày.') },
    { value: 'unsure', icon: Accessibility, title: t('A little more help', 'একটু বেশি সাহায্য', 'थोड़ी ज़्यादा मदद', 'Thêm chút trợ giúp'), body: t('More explanation, more space between steps, slightly slower voice.', 'বেশি ব্যাখ্যা, ধাপের মাঝে বেশি জায়গা, একটু ধীর কণ্ঠ।', 'ज़्यादा समझाना, कदमों में ज़्यादा जगह, थोड़ी धीमी आवाज़।', 'Giải thích kỹ hơn, các bước thưa hơn, giọng chậm hơn chút.') },
    { value: 'scared', icon: ShieldCheck, title: t('Very gentle', 'খুব নরম', 'बहुत सहज', 'Rất nhẹ nhàng'), body: t('One small step at a time, fewer choices on screen, extra reassurance, slower movement.', 'এক এক করে ছোট ধাপ, স্ক্রিনে কম বিকল্প, বাড়তি ভরসা, ধীর নড়াচড়া।', 'एक-एक छोटा कदम, स्क्रीन पर कम विकल्प, ज़्यादा भरोसा, धीमी हलचल।', 'Từng bước nhỏ, ít lựa chọn trên màn hình, thêm trấn an, chuyển động chậm.') },
  ];

  return (
    <div className="page settings-page">
      <PageHeader
        eyebrow={t('Settings', 'সেটিংস', 'सेटिंग्स', 'Cài đặt')}
        title={t('Make Guidia comfortable for you', 'Guidia-কে নিজের মতো করে নিন', 'Guidia को अपने लिए आरामदायक बनाएं', 'Điều chỉnh Guidia cho thoải mái')}
        description={t('Changes apply straight away and follow you to any device you sign in on.', 'পরিবর্তন সঙ্গে সঙ্গে চালু হয় এবং যেকোনো ডিভাইসে সাইন ইন করলে সাথে থাকে।', 'बदलाव तुरंत लागू होते हैं और किसी भी डिवाइस पर साइन इन करने पर साथ रहते हैं।', 'Thay đổi áp dụng ngay và theo bạn sang mọi thiết bị bạn đăng nhập.')}
      />

      <div className="settings-layout">
        <nav className="settings-nav" aria-label={t('Settings sections', 'সেটিংসের বিভাগ', 'सेटिंग्स के हिस्से', 'Các mục cài đặt')}>
          {SECTIONS.map(([id, Icon, label]) => (
            <button key={id} type="button" className="settings-nav-item" aria-current={active === id ? 'true' : undefined} onClick={() => jump(id)}>
              <Icon aria-hidden="true" />{t(...label)}
            </button>
          ))}
        </nav>

        <div className="stack settings-content" style={{ '--gap': 'var(--s-5)' }}>
          <Section id="profile" t={t} title={t('Profile', 'প্রোফাইল', 'प्रोफ़ाइल', 'Hồ sơ')}>
            <form className="stack" style={{ '--gap': 'var(--s-4)' }} onSubmit={saveProfile}>
              <Field label={t('Name', 'নাম', 'नाम', 'Tên')}>
                {(p) => <input {...p} className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required autoComplete="name" />}
              </Field>
              <Field label={t('Age', 'বয়স', 'उम्र', 'Tuổi')} optional={t('optional', 'ঐচ্ছিক', 'वैकल्पिक', 'không bắt buộc')} hint={t('Only you see this. Guidia never uses age to decide what you can do.', 'শুধু আপনি এটি দেখেন। Guidia বয়স দেখে কখনো ঠিক করে না আপনি কী পারবেন।', 'यह केवल आप देखते हैं। Guidia उम्र से कभी तय नहीं करता कि आप क्या कर सकते हैं।', 'Chỉ bạn thấy thông tin này. Guidia không dùng tuổi để quyết định bạn làm được gì.')}>
                {(p) => <input {...p} className="input" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))} style={{ maxWidth: 160 }} />}
              </Field>
              <p className="text-subtle">{t('Email', 'ইমেইল', 'ईमेल', 'Email')}: {user?.email}</p>
              {profile.state === 'error' && <Alert tone="warn">{profile.error?.message}</Alert>}
              <Button type="submit" icon={Save} className="self-start" state={profile.state} loadingLabel={t('Saving…', 'রাখা হচ্ছে…', 'सहेजा जा रहा है…', 'Đang lưu…')} successLabel={t('Profile saved', 'প্রোফাইল রাখা হয়েছে', 'प्रोफ़ाइल सहेजी गई', 'Đã lưu hồ sơ')}>{t('Save', 'রাখুন', 'सहेजें', 'Lưu')}</Button>
            </form>
          </Section>

          <Section id="language" t={t} saved={savedIn === 'language'} title={t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ')} description={t('Used for the app, Guidia’s answers and spoken guidance.', 'অ্যাপ, Guidia-র উত্তর ও কথা বলায় ব্যবহার হবে।', 'ऐप, Guidia के जवाब और बोलकर बताने में इस्तेमाल होगी।', 'Dùng cho ứng dụng, câu trả lời của Guidia và giọng đọc.')}>
            <div className="lang-grid" role="radiogroup" aria-label={t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ')}>
              {LANGUAGES.map((l) => (
                <ChoiceCard key={l.code} lang={l.htmlLang} selected={language === l.code} radio={false} title={l.nativeName} body={l.englishName}
                  onSelect={() => setLanguage(l.code).then(() => { setSavedIn('language'); clearTimeout(savedTimer.current); savedTimer.current = setTimeout(() => setSavedIn(null), 2000); }).catch(() => {})} />
              ))}
            </div>
          </Section>

          <Section id="guidance" t={t} saved={savedIn === 'guidance'} title={t('How Guidia guides you', 'Guidia কীভাবে গাইড করবে', 'Guidia कैसे मार्गदर्शन करे', 'Cách Guidia hướng dẫn bạn')} description={t('Changes the length of instructions, the space between steps, how fast Guidia speaks and how many choices you see at once.', 'নির্দেশনার দৈর্ঘ্য, ধাপের মাঝের জায়গা, Guidia কত দ্রুত বলে আর একবারে কতগুলো বিকল্প দেখেন — সব বদলায়।', 'निर्देशों की लंबाई, कदमों के बीच जगह, Guidia कितनी तेज़ बोले और एक बार में कितने विकल्प दिखें — सब बदलता है।', 'Thay đổi độ dài hướng dẫn, khoảng cách giữa các bước, tốc độ đọc và số lựa chọn hiển thị cùng lúc.')}>
            <div className="stack" role="radiogroup" style={{ '--gap': 'var(--choice-gap)' }}>
              {modes.map((m) => <ChoiceCard key={m.value} icon={m.icon} selected={mode === m.value} title={m.title} body={m.body} onSelect={() => setMode(m.value).then(() => { setSavedIn('guidance'); clearTimeout(savedTimer.current); savedTimer.current = setTimeout(() => setSavedIn(null), 2000); }).catch(() => {})} />)}
            </div>
          </Section>

          <Section id="reading" t={t} saved={savedIn === 'reading'} title={t('Reading & display', 'পড়া ও প্রদর্শন', 'पढ़ना और दिखावट', 'Đọc & hiển thị')}>
            <div className="field">
              <div className="row-between">
                <label className="label" htmlFor="set-font">{t('Text size', 'লেখার আকার', 'अक्षर का आकार', 'Cỡ chữ')}</label>
                <span className="badge badge-brand num">{prefs.fontSize}px</span>
              </div>
              <input id="set-font" type="range" min={18} max={28} step={1} value={prefs.fontSize} onChange={(e) => pref('reading', 'fontSize')(Number(e.target.value))} className="range" aria-valuetext={`${prefs.fontSize} pixels`} />
              <div className="range-labels" aria-hidden="true"><span style={{ fontSize: 16 }}>A</span><span style={{ fontSize: 26 }}>A</span></div>
              <div className="text-preview" aria-hidden="true">
                <p className="h-card">{t('A preview of your text', 'আপনার লেখার নমুনা', 'आपके अक्षरों का नमूना', 'Xem trước cỡ chữ')}</p>
                <p className="text-muted">{t('Guidia will show every page at this size. Pick what feels easy to read without glasses straining.', 'Guidia প্রতিটি পেজ এই আকারে দেখাবে। চোখে চাপ ছাড়া যা সহজে পড়া যায় তা বেছে নিন।', 'Guidia हर पेज इसी आकार में दिखाएगा। जो आसानी से पढ़ा जाए वह चुनें।', 'Guidia sẽ hiển thị mọi trang với cỡ này. Hãy chọn cỡ dễ đọc nhất với bạn.')}</p>
              </div>
            </div>
            <div>
              <Toggle id="t-contrast" label={t('High contrast', 'উচ্চ কনট্রাস্ট', 'उच्च कंट्रास्ट', 'Độ tương phản cao')} hint={t('Stronger text and borders for easier reading.', 'সহজে পড়ার জন্য গাঢ় লেখা ও সীমারেখা।', 'आसानी से पढ़ने के लिए गहरे अक्षर और किनारे।', 'Chữ và viền đậm hơn để dễ đọc.')} checked={prefs.highContrast} onChange={pref('reading', 'highContrast')} />
              <Toggle id="t-dark" label={t('Dark background', 'গাঢ় পটভূমি', 'गहरी पृष्ठभूमि', 'Nền tối')} hint={t('Easier on the eyes in a dark room.', 'অন্ধকার ঘরে চোখের জন্য আরামদায়ক।', 'अंधेरे कमरे में आंखों को आराम।', 'Dễ chịu cho mắt khi phòng tối.')} checked={prefs.darkMode} onChange={pref('reading', 'darkMode')} />
              <Toggle id="t-motion" label={t('Reduce movement', 'নড়াচড়া কমান', 'हलचल कम करें', 'Giảm chuyển động')} hint={t('Turns off animations; changes happen instantly.', 'অ্যানিমেশন বন্ধ করে; পরিবর্তন সঙ্গে সঙ্গে হয়।', 'एनिमेशन बंद; बदलाव तुरंत होते हैं।', 'Tắt hiệu ứng; thay đổi diễn ra ngay.')} checked={prefs.reducedMotion} onChange={pref('reading', 'reducedMotion')} />
            </div>
          </Section>

          <Section id="voice" t={t} saved={savedIn === 'voice'} title={t('Voice', 'ভয়েস', 'आवाज़', 'Giọng nói')}>
            <Alert tone={caps.voice || caps.speech || browserVoice ? 'ok' : 'warn'} icon={Volume2}>
              {caps.voice || caps.speech ? t('Guidia’s own voice is available.', 'Guidia-র নিজস্ব ভয়েস চালু আছে।', 'Guidia की अपनी आवाज़ उपलब्ध है।', 'Giọng của Guidia đang hoạt động.')
                : browserVoice ? t('Your device’s voice is used. If it has no voice for your language, Guidia shows the text instead.', 'আপনার ডিভাইসের ভয়েস ব্যবহার হয়। আপনার ভাষায় ভয়েস না থাকলে Guidia লেখা দেখায়।', 'आपके डिवाइस की आवाज़ इस्तेमाल होती है। आपकी भाषा में आवाज़ न हो तो Guidia लिखा दिखाता है।', 'Dùng giọng của thiết bị. Nếu không có giọng cho ngôn ngữ của bạn, Guidia sẽ hiện chữ.')
                  : t('This browser cannot speak. Everything is still shown as text.', 'এই ব্রাউজার কথা বলতে পারে না। সবকিছু লেখায় দেখানো হবে।', 'यह ब्राउज़र बोल नहीं सकता। सब कुछ लिखकर दिखेगा।', 'Trình duyệt này không đọc được. Mọi thứ vẫn hiện bằng chữ.')}
            </Alert>
            <div>
              <Toggle id="t-voice" label={t('Read things aloud', 'জোরে পড়ে শোনান', 'ज़ोर से पढ़कर सुनाएं', 'Đọc to')} checked={prefs.voiceEnabled} onChange={pref('voice', 'voiceEnabled')} />
              <Toggle id="t-auto" label={t('Read Guidia’s answers automatically', 'Guidia-র উত্তর নিজে থেকে পড়ুন', 'Guidia के जवाब अपने आप पढ़ें', 'Tự động đọc câu trả lời')} hint={t('Also reads each lesson step as you arrive.', 'প্রতিটি পাঠের ধাপেও পড়ে শোনাবে।', 'हर पाठ के चरण पर भी पढ़ेगा।', 'Cũng đọc từng bước bài học khi bạn tới.')} checked={prefs.voiceAutoPlay} onChange={pref('voice', 'voiceAutoPlay')} />
            </div>
            <div className="field">
              <span className="label">{t('Speaking speed', 'কথার গতি', 'बोलने की गति', 'Tốc độ nói')}</span>
              <Segmented label={t('Speaking speed', 'কথার গতি', 'बोलने की गति', 'Tốc độ nói')} value={prefs.voiceSpeed <= 0.85 ? 0.8 : prefs.voiceSpeed >= 1.15 ? 1.2 : 1} onChange={pref('voice', 'voiceSpeed')} options={[
                { value: 0.8, label: t('Slow', 'ধীর', 'धीमा', 'Chậm') },
                { value: 1, label: t('Normal', 'স্বাভাবিক', 'सामान्य', 'Vừa') },
                { value: 1.2, label: t('Fast', 'দ্রুত', 'तेज़', 'Nhanh') },
              ]} />
            </div>
            <Button variant="tonal" icon={Volume2} className="self-start" disabled={!prefs.voiceEnabled} onClick={() => speak(t('Hello. This is how Guidia sounds.', 'নমস্কার। Guidia এভাবে কথা বলে।', 'नमस्ते। Guidia ऐसे बोलता है।', 'Xin chào. Guidia nói như thế này.'))}>{t('Test the voice', 'ভয়েস পরীক্ষা করুন', 'आवाज़ जांचें', 'Thử giọng nói')}</Button>
          </Section>

          <Section id="notifications" t={t} saved={savedIn === 'notifications'} title={t('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')}>
            <Toggle id="t-email" label={t('Email me important updates', 'গুরুত্বপূর্ণ খবর ইমেইলে পাঠান', 'ज़रूरी सूचनाएं ईमेल करें', 'Gửi email cập nhật quan trọng')} hint={t('Help requests from people you look after are always emailed.', 'যাঁদের দেখাশোনা করেন তাঁদের সাহায্যের অনুরোধ সবসময় ইমেইলে যাবে।', 'जिनकी देखभाल करते हैं उनके मदद अनुरोध हमेशा ईमेल होंगे।', 'Yêu cầu giúp đỡ từ người bạn chăm sóc luôn được gửi email.')} checked={prefs.notificationsEnabled} onChange={pref('notifications', 'notificationsEnabled')} />
          </Section>

          <Section id="browser" t={t} title={t('Guidia browser helper', 'Guidia ব্রাউজার সহায়ক', 'Guidia ब्राउज़र सहायक', 'Tiện ích trình duyệt Guidia')} description={t('Ask about any website on your computer. The helper takes a picture of the page only when you press its button.', 'কম্পিউটারে যেকোনো ওয়েবসাইট নিয়ে জিজ্ঞাসা করুন। বোতাম চাপলেই শুধু পেজের ছবি নেয়।', 'कंप्यूटर पर किसी भी वेबसाइट के बारे में पूछें। बटन दबाने पर ही पेज की तस्वीर लेता है।', 'Hỏi về bất kỳ trang web nào trên máy tính. Tiện ích chỉ chụp trang khi bạn bấm nút.')}>
            <ol className="how-steps">
              <li>{t('Install the Guidia extension in Chrome or Edge.', 'Chrome বা Edge-এ Guidia এক্সটেনশন ইনস্টল করুন।', 'Chrome या Edge में Guidia एक्सटेंशन इंस्टॉल करें।', 'Cài tiện ích Guidia trên Chrome hoặc Edge.')}</li>
              <li>{t('Press “Connect the extension” below to get a one-time code.', 'নিচে “এক্সটেনশন যুক্ত করুন” চাপুন — একবারের কোড পাবেন।', 'नीचे “एक्सटेंशन जोड़ें” दबाएं — एक बार का कोड मिलेगा।', 'Bấm “Kết nối tiện ích” bên dưới để nhận mã một lần.')}</li>
              <li>{t('Type the code into the extension. That is all.', 'কোডটি এক্সটেনশনে লিখুন। ব্যস।', 'कोड एक्सटेंशन में लिखें। बस।', 'Nhập mã vào tiện ích. Vậy là xong.')}</li>
            </ol>
            {caps.browserExtension ? <PairingCode t={t} language={language} /> : <Alert tone="info">{t('The browser helper is not turned on for this Guidia server.', 'এই Guidia সার্ভারে ব্রাউজার সহায়ক চালু নেই।', 'इस Guidia सर्वर पर ब्राउज़र सहायक चालू नहीं है।', 'Tiện ích trình duyệt chưa được bật trên máy chủ Guidia này.')}</Alert>}
          </Section>

          <Section id="sessions" t={t} title={t('Where you are signed in', 'কোথায় সাইন ইন আছেন', 'कहाँ साइन इन हैं', 'Nơi bạn đang đăng nhập')} description={t('Sign out of any device you do not recognise.', 'অচেনা কোনো ডিভাইস থেকে সাইন আউট করুন।', 'अनजान डिवाइस से साइन आउट करें।', 'Đăng xuất khỏi thiết bị bạn không nhận ra.')}>
            {sessions.loading && !sessions.data && <Skeleton height={72} count={2} style={{ marginBottom: 8 }} />}
            {sessions.error && <Alert tone="warn" actions={<Button size="sm" variant="secondary" onClick={sessions.reload}>{t('Try again', 'আবার চেষ্টা করুন', 'फिर कोशिश करें', 'Thử lại')}</Button>}>{sessions.error.message}</Alert>}
            <ul className="session-list">
              {sortedSessions.map((s) => {
                const mobile = /Mobi|Android|iPhone/i.test(s.userAgent || '');
                const browserName = /Edg\//.test(s.userAgent) ? 'Edge' : /Chrome\//.test(s.userAgent) ? 'Chrome' : /Firefox\//.test(s.userAgent) ? 'Firefox' : /Safari\//.test(s.userAgent) ? 'Safari' : t('Browser', 'ব্রাউজার', 'ब्राउज़र', 'Trình duyệt');
                const os = /Windows/.test(s.userAgent) ? 'Windows' : /Android/.test(s.userAgent) ? 'Android' : /iPhone|iPad/.test(s.userAgent) ? 'iOS' : /Mac OS/.test(s.userAgent) ? 'macOS' : /Linux/.test(s.userAgent) ? 'Linux' : '';
                const isThis = s.id === currentId;
                return (
                  <li key={s.id} className={`session ${isThis ? 'is-current' : ''}`}>
                    <span className="icon-chip" aria-hidden="true">{mobile ? <Smartphone /> : <Laptop />}</span>
                    <div className="stack grow" style={{ '--gap': '2px', minWidth: 0 }}>
                      <p className="text-strong">{browserName}{os && ` · ${os}`} {isThis && <Badge tone="ok">{t('This device', 'এই ডিভাইস', 'यह डिवाइस', 'Thiết bị này')}</Badge>}</p>
                      <p className="text-subtle">{t('Last active', 'শেষ সক্রিয়', 'आखिरी बार सक्रिय', 'Hoạt động lần cuối')} {formatRelative(s.lastUsedAt, language)}</p>
                    </div>
                    {!isThis && <IconButton icon={LogOut} variant="quiet" size="sm" label={t('Sign out this device', 'এই ডিভাইস থেকে সাইন আউট', 'इस डिवाइस से साइन आउट', 'Đăng xuất thiết bị này')} onClick={() => del(`/auth/sessions/${s.id}`).then(() => { sessions.reload(); showToast(t('Signed out that device.', 'ওই ডিভাইস থেকে সাইন আউট হয়েছে।', 'उस डिवाइस से साइन आउट हुआ।', 'Đã đăng xuất thiết bị đó.'), 'success'); }).catch((err) => showToast(err.message, 'danger'))} />}
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section id="privacy" t={t} title={t('Privacy & data', 'গোপনীয়তা ও তথ্য', 'निजता और डेटा', 'Riêng tư & dữ liệu')} description={t('Screenshots are deleted after 30 minutes. Passwords, PINs and OTPs are never stored.', 'স্ক্রিনশট ৩০ মিনিট পর মুছে যায়। পাসওয়ার্ড, পিন ও ওটিপি কখনো রাখা হয় না।', 'स्क्रीनशॉट 30 मिनट बाद हट जाते हैं। पासवर्ड, पिन और ओटीपी कभी नहीं रखे जाते।', 'Ảnh chụp màn hình bị xóa sau 30 phút. Mật khẩu, mã PIN và OTP không bao giờ được lưu.')}>
            <div className="data-actions">
              <div className="stack" style={{ '--gap': '4px' }}>
                <p className="text-strong">{t('Download my data', 'আমার তথ্য ডাউনলোড', 'मेरा डेटा डाउनलोड करें', 'Tải dữ liệu của tôi')}</p>
                <p className="text-muted text-sm">{t('A file with your profile, settings, Memory Book, progress and conversations.', 'আপনার প্রোফাইল, সেটিংস, স্মৃতির খাতা, অগ্রগতি ও কথোপকথনের একটি ফাইল।', 'आपकी प्रोफ़ाइल, सेटिंग्स, याद की किताब, प्रगति और बातचीत की एक फ़ाइल।', 'Một tệp gồm hồ sơ, cài đặt, Sổ ghi nhớ, tiến độ và cuộc trò chuyện.')}</p>
              </div>
              <Button variant="secondary" icon={Download} onClick={exportData} state={exporting.state === 'loading' ? 'loading' : 'idle'}>{t('Download', 'ডাউনলোড', 'डाउनलोड', 'Tải xuống')}</Button>
            </div>
            <div className="data-actions is-danger">
              <div className="stack" style={{ '--gap': '4px' }}>
                <p className="text-strong">{t('Delete my account', 'আমার অ্যাকাউন্ট মুছুন', 'मेरा खाता हटाएं', 'Xóa tài khoản')}</p>
                <p className="text-muted text-sm">{t('Removes everything for good. This cannot be undone.', 'সবকিছু চিরতরে মুছে দেয়। এটি ফেরানো যাবে না।', 'सब कुछ हमेशा के लिए हटा देता है। इसे वापस नहीं किया जा सकता।', 'Xóa vĩnh viễn mọi thứ. Không thể hoàn tác.')}</p>
              </div>
              <Button variant="danger-quiet" icon={Trash2} onClick={() => setDeleteOpen(true)}>{t('Delete account', 'অ্যাকাউন্ট মুছুন', 'खाता हटाएं', 'Xóa tài khoản')}</Button>
            </div>
          </Section>

          <Section id="account" t={t} title={t('Account', 'অ্যাকাউন্ট', 'खाता', 'Tài khoản')}>
            <div className="row-between">
              <p className="text-muted">{t('Signed in as', 'সাইন ইন করেছেন', 'साइन इन हैं', 'Đang đăng nhập với')} <strong>{user?.email}</strong></p>
              <Button variant="quiet" icon={LogOut} onClick={signOut}>{t('Sign out', 'সাইন আউট', 'साइन आउट', 'Đăng xuất')}</Button>
            </div>
          </Section>
        </div>
      </div>

      <Dialog
        open={deleteOpen} onClose={() => { setDeleteOpen(false); setPassword(''); deleting.reset(); }} icon={Trash2} iconTone="danger"
        title={t('Delete your account?', 'অ্যাকাউন্ট মুছবেন?', 'खाता हटाएं?', 'Xóa tài khoản?')}
        description={t('This permanently removes:', 'এটি চিরতরে মুছে দেবে:', 'यह हमेशा के लिए हटा देगा:', 'Thao tác này xóa vĩnh viễn:')}
        actions={(
          <>
            <Button variant="quiet" onClick={() => { setDeleteOpen(false); setPassword(''); deleting.reset(); }} data-autofocus>{t('Keep my account', 'অ্যাকাউন্ট রাখুন', 'खाता रखें', 'Giữ tài khoản')}</Button>
            <Button variant="danger" icon={Trash2} disabled={!password} onClick={deleteAccount} state={deleting.state === 'loading' ? 'loading' : 'idle'}>{t('Delete forever', 'চিরতরে মুছুন', 'हमेशा के लिए हटाएं', 'Xóa vĩnh viễn')}</Button>
          </>
        )}
      >
        <ul className="stack" style={{ '--gap': '6px', paddingLeft: '1.2em' }}>
          <li>{t('Your profile and settings', 'আপনার প্রোফাইল ও সেটিংস', 'आपकी प्रोफ़ाइल और सेटिंग्स', 'Hồ sơ và cài đặt')}</li>
          <li>{t('Lessons, progress and your Memory Book', 'পাঠ, অগ্রগতি ও স্মৃতির খাতা', 'पाठ, प्रगति और याद की किताब', 'Bài học, tiến độ và Sổ ghi nhớ')}</li>
          <li>{t('Conversations with Guidia', 'Guidia-র সাথে কথোপকথন', 'Guidia के साथ बातचीत', 'Các cuộc trò chuyện với Guidia')}</li>
          <li>{t('Connections with your trusted people', 'বিশ্বস্ত মানুষদের সাথে সংযোগ', 'भरोसेमंद लोगों से जुड़ाव', 'Kết nối với người tin cậy')}</li>
        </ul>
        <Field label={t('Type your password to confirm', 'নিশ্চিত করতে পাসওয়ার্ড লিখুন', 'पुष्टि के लिए पासवर्ड लिखें', 'Nhập mật khẩu để xác nhận')} error={deleting.state === 'error' ? deleting.error?.message : null}>
          {(p) => <input {...p} type="password" className="input" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        </Field>
      </Dialog>
    </div>
  );
}
