import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accessibility, ArrowLeft, Check, Globe, ShieldCheck, Sparkles, User, Volume2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { LANGUAGES } from '../../config/languages';
import { announce } from '../../utils/announce';
import { Alert, Button, ChoiceCard, Field, Segmented, Stepper, SuccessState, Switch } from '../../components/ui';
import { GuidiaMark } from '../../components/GuidiaLogo';
import { useVoiceState, voiceStateLabel } from '../../components/voice/voiceState';

const STYLE_PREVIEW = {
  calm: { gap: 8, words: 1 },
  unsure: { gap: 14, words: 2 },
  scared: { gap: 22, words: 3 },
};

// First-run setup, one decision per step.
//   guest:   the welcome flow shown before the landing page (language,
//            guidance, reading). Choices are kept in this browser and copied
//            to the account on sign-up.
//   account: saved to the account so it follows the user to any device. If
//            the welcome flow already ran, it opens on the last, optional step.
const GUEST_AGE_KEY = 'guidia.guestAge';

export default function OnboardingPage({ guest = false }) {
  const { user, updateProfile } = useAuth();
  const { t, language, setLanguage, mode, setMode, prefs, setPreference, savePreferences, setupDone, markSetupDone } = usePreferences();
  const { speak } = useVoice();
  const voiceState = useVoiceState();
  const navigate = useNavigate();
  const startStep = !guest && setupDone ? 3 : 0;
  const [step, setStep] = useState(startStep);
  // The welcome flow asks for age too; it is kept on this device and filled
  // in here after sign-up, then saved to the account.
  const [age, setAge] = useState(() => {
    if (user?.age) return String(user.age);
    try { return localStorage.getItem(GUEST_AGE_KEY) || ''; } catch { return ''; }
  });
  const ageNumber = Number(age);
  const ageInvalid = age !== '' && (ageNumber < 18 || ageNumber > 120);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const total = 4;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.scale = 'user';
    return () => { delete root.dataset.scale; };
  }, []);

  const firstName = user?.fullName?.replace(/\(.*?\)/g, '').trim().split(' ')[0] || '';
  const labels = [t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ'), t('Guidance', 'নির্দেশনা', 'मार्गदर्शन', 'Hướng dẫn'), t('Reading', 'পড়া', 'पढ़ना', 'Đọc'), t('About you', 'আপনার সম্পর্কে', 'आपके बारे में', 'Về bạn')];

  const go = (n) => {
    setStep(n);
    announce(`${t(`Step ${n + 1} of ${total}`, `ধাপ ${n + 1} / ${total}`, `चरण ${n + 1} / ${total}`, `Bước ${n + 1}/${total}`)}: ${labels[n]}`);
    window.scrollTo({ top: 0, behavior: prefs.reducedMotion ? 'auto' : 'smooth' });
  };

  const finish = async () => {
    if (ageInvalid) return;
    if (guest) {
      try { if (age) localStorage.setItem(GUEST_AGE_KEY, age); else localStorage.removeItem(GUEST_AGE_KEY); } catch { /* private mode */ }
      markSetupDone();
      setDone(true);
      speak(t('All set. Here is Guidia, made for you.', 'সব প্রস্তুত। এই যে Guidia, আপনার মতো করে সাজানো।', 'सब तैयार है। यह रहा Guidia, आपके हिसाब से।', 'Xong rồi. Đây là Guidia, dành riêng cho bạn.'));
      setTimeout(() => navigate('/landing', { replace: true }), prefs.reducedMotion ? 400 : 1300);
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (age && ageNumber !== user?.age) await updateProfile({ age: ageNumber });
      await savePreferences({ onboardingDone: true });
      try { localStorage.removeItem(GUEST_AGE_KEY); } catch { /* private mode */ }
      setDone(true);
      speak(t('You are all set. Welcome to Guidia.', 'সব প্রস্তুত। Guidia-তে স্বাগতম।', 'सब तैयार है। Guidia में स्वागत है।', 'Mọi thứ đã sẵn sàng. Chào mừng bạn đến với Guidia.'));
      setTimeout(() => navigate('/app/home', { replace: true }), prefs.reducedMotion ? 600 : 1600);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const modes = [
    { value: 'calm', icon: Sparkles, title: t('Comfortable', 'স্বচ্ছন্দ', 'आरामदायक', 'Thoải mái'), body: t('I am fairly comfortable with phones.', 'ফোন মোটামুটি চালাতে পারি।', 'फोन ठीक-ठाक चला लेता हूँ।', 'Tôi khá quen dùng điện thoại.') },
    { value: 'unsure', icon: Accessibility, title: t('A little more help', 'একটু বেশি সাহায্য', 'थोड़ी ज़्यादा मदद', 'Thêm chút trợ giúp'), body: t('Please explain things a little more.', 'একটু বেশি বুঝিয়ে বলুন।', 'थोड़ा ज़्यादा समझाइए।', 'Hãy giải thích kỹ hơn một chút.') },
    { value: 'scared', icon: ShieldCheck, title: t('Very gentle', 'খুব নরম', 'बहुत सहज', 'Rất nhẹ nhàng'), body: t('One small step at a time, please.', 'এক এক করে ছোট ধাপে বলুন।', 'एक-एक छोटा कदम बताइए।', 'Từng bước nhỏ một thôi nhé.') },
  ];
  const preview = STYLE_PREVIEW[mode] || STYLE_PREVIEW.calm;

  return (
    <div className="onboarding">
      <main className="onboarding-card" aria-labelledby="ob-title">
        <div className="onboarding-top">
          <span className="row" style={{ '--gap': 'var(--s-3)' }}>
            <GuidiaMark size={44} title="" />
            <span className="guidia-wordmark" style={{ fontSize: '1.5rem' }}>Guidia</span>
          </span>
          <span className="text-subtle num">{t(`Step ${step + 1} of ${total}`, `ধাপ ${step + 1} / ${total}`, `चरण ${step + 1} / ${total}`, `Bước ${step + 1}/${total}`)}</span>
        </div>
        <div className="onboarding-progress"><Stepper total={total} current={done ? total : step} labels={labels.slice(0, total)} /></div>

        {done ? (
          <SuccessState title={t('You are all set', 'সব প্রস্তুত', 'सब तैयार है', 'Mọi thứ đã sẵn sàng')}>
            <p className="text-muted">{guest
              ? t('Opening Guidia, set up your way…', 'আপনার মতো করে সাজানো Guidia খুলছি…', 'आपके हिसाब से सजा Guidia खुल रहा है…', 'Đang mở Guidia theo cách của bạn…')
              : t('Opening your home page…', 'আপনার হোম পেজ খুলছি…', 'आपका होम पेज खुल रहा है…', 'Đang mở trang chủ của bạn…')}</p>
          </SuccessState>
        ) : (
          <div key={step} className="onboarding-step step-in">
            {step === 0 && (
              <section className="stack" style={{ '--gap': 'var(--s-5)' }}>
                <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
                  <p className="eyebrow"><Globe size={16} aria-hidden="true" /> {labels[0]}</p>
                  {guest && <p className="ob-hello" aria-hidden="true">Welcome · স্বাগতম · स्वागत है · Chào mừng</p>}
                  <h1 id="ob-title" className="onboarding-title">{t(`Welcome${firstName ? `, ${firstName}` : ''}. Which language feels most natural?`, `স্বাগতম${firstName ? `, ${firstName}` : ''}। কোন ভাষা সবচেয়ে স্বাভাবিক লাগে?`, `स्वागत है${firstName ? `, ${firstName}` : ''}। कौन सी भाषा सबसे सहज लगती है?`, `Chào mừng${firstName ? ` ${firstName}` : ''}. Bạn thấy ngôn ngữ nào tự nhiên nhất?`)}</h1>
                  <p className="lead">{t('The whole app changes as soon as you choose.', 'বেছে নেওয়ার সঙ্গে সঙ্গে পুরো অ্যাপ বদলে যাবে।', 'चुनते ही पूरा ऐप बदल जाएगा।', 'Cả ứng dụng sẽ đổi ngay khi bạn chọn.')}</p>
                </div>
                <div className="lang-grid" role="radiogroup" aria-labelledby="ob-title">
                  {LANGUAGES.map((l) => (
                    <ChoiceCard key={l.code} size="lg" lang={l.htmlLang} radio={false} selected={language === l.code} onSelect={() => setLanguage(l.code).catch(() => {})}
                      title={<span className="ob-lang-native">{l.nativeName}</span>} body={l.englishName} />
                  ))}
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="stack" style={{ '--gap': 'var(--s-5)' }}>
                <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
                  <p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> {labels[1]}</p>
                  <h1 id="ob-title" className="onboarding-title">{t('How would you like Guidia to guide you?', 'Guidia কীভাবে আপনাকে গাইড করবে?', 'Guidia आपको कैसे मार्गदर्शन दे?', 'Bạn muốn Guidia hướng dẫn thế nào?')}</h1>
                  <p className="lead">{t('You can change this any time in Settings.', 'সেটিংসে যেকোনো সময় বদলাতে পারবেন।', 'सेटिंग्स में कभी भी बदल सकते हैं।', 'Bạn có thể đổi bất cứ lúc nào trong Cài đặt.')}</p>
                </div>
                <div className="ob-guidance">
                  <div className="stack" role="radiogroup" aria-labelledby="ob-title" style={{ '--gap': 'var(--choice-gap)' }}>
                    {modes.map((m) => <ChoiceCard key={m.value} icon={m.icon} selected={mode === m.value} onSelect={() => setMode(m.value).catch(() => {})} title={m.title} body={m.body} />)}
                  </div>
                  <div className="style-preview" aria-hidden="true">
                    <p className="text-subtle">{t('Preview', 'নমুনা', 'झलक', 'Xem trước')}</p>
                    <div className="style-preview-steps" style={{ gap: preview.gap }}>
                      {[1, 2, 3].slice(0, mode === 'scared' ? 1 : 3).map((n) => (
                        <div key={n} className="style-preview-step">
                          <span>{n}</span>
                          <i style={{ width: `${55 + preview.words * 12}%` }} />
                        </div>
                      ))}
                    </div>
                    <p className="text-subtle">{mode === 'scared' ? t('One step at a time, slower voice', 'এক এক ধাপ, ধীর কণ্ঠ', 'एक-एक कदम, धीमी आवाज़', 'Từng bước một, giọng chậm') : mode === 'unsure' ? t('More explanation, more space', 'বেশি ব্যাখ্যা, বেশি জায়গা', 'ज़्यादा समझाना, ज़्यादा जगह', 'Giải thích kỹ, thoáng hơn') : t('Normal pace', 'স্বাভাবিক গতি', 'सामान्य गति', 'Nhịp bình thường')}</p>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="stack" style={{ '--gap': 'var(--s-5)' }}>
                <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
                  <p className="eyebrow"><Accessibility size={16} aria-hidden="true" /> {labels[2]}</p>
                  <h1 id="ob-title" className="onboarding-title">{t('Is this easy to read?', 'এটা কি সহজে পড়া যাচ্ছে?', 'क्या यह पढ़ना आसान है?', 'Chữ này có dễ đọc không?')}</h1>
                </div>
                <div className="field">
                  <div className="row-between">
                    <label className="label" htmlFor="ob-font">{t('Text size', 'লেখার আকার', 'अक्षर का आकार', 'Cỡ chữ')}</label>
                    <span className="badge badge-brand num">{prefs.fontSize}px</span>
                  </div>
                  <input id="ob-font" type="range" min={18} max={28} value={prefs.fontSize} onChange={(e) => setPreference('fontSize', Number(e.target.value)).catch(() => {})} className="range" aria-valuetext={`${prefs.fontSize} pixels`} />
                  <div className="range-labels" aria-hidden="true"><span style={{ fontSize: 16 }}>A</span><span style={{ fontSize: 26 }}>A</span></div>
                </div>
                <div className="text-preview">
                  <p className="h-card">{t('Sending a photo to your family', 'পরিবারকে ছবি পাঠানো', 'परिवार को फोटो भेजना', 'Gửi ảnh cho gia đình')}</p>
                  <p>{t('Tap the paperclip, choose the picture, then press the green arrow. That is all.', 'পেপারক্লিপে চাপুন, ছবি বেছে নিন, তারপর সবুজ তীরে চাপুন। ব্যস।', 'पेपरक्लिप दबाएं, तस्वीर चुनें, फिर हरा तीर दबाएं। बस।', 'Chạm kẹp giấy, chọn ảnh, rồi bấm mũi tên xanh. Vậy là xong.')}</p>
                </div>
                <div className="setting-row">
                  <div className="stack" style={{ '--gap': '2px' }}>
                    <span className="label" id="ob-voice-l">{t('Read things aloud to me', 'আমাকে পড়ে শোনান', 'मुझे पढ़कर सुनाएं', 'Đọc to cho tôi nghe')}</span>
                    <span className="hint">{voiceStateLabel(voiceState, t)}</span>
                  </div>
                  <Switch checked={prefs.voiceEnabled} onChange={(v) => setPreference('voiceEnabled', v).catch(() => {})} labelledBy="ob-voice-l" />
                </div>
                {prefs.voiceEnabled && (
                  <div className="stack fade" style={{ '--gap': 'var(--s-3)' }}>
                    <span className="label">{t('Voice speed', 'কণ্ঠের গতি', 'आवाज़ की गति', 'Tốc độ giọng')}</span>
                    <Segmented label={t('Voice speed', 'কণ্ঠের গতি', 'आवाज़ की गति', 'Tốc độ giọng')} value={prefs.voiceSpeed <= 0.85 ? 0.8 : prefs.voiceSpeed >= 1.15 ? 1.2 : 1}
                      onChange={(v) => { setPreference('voiceSpeed', v).catch(() => {}); }}
                      options={[{ value: 0.8, label: t('Slow', 'ধীর', 'धीमा', 'Chậm') }, { value: 1, label: t('Normal', 'স্বাভাবিক', 'सामान्य', 'Vừa') }, { value: 1.2, label: t('Fast', 'দ্রুত', 'तेज़', 'Nhanh') }]} />
                    <Button variant="tonal" icon={Volume2} className="self-start" onClick={() => speak(t('Hello. I am Guidia. I am here to help, one step at a time.', 'নমস্কার। আমি Guidia। এক এক ধাপে আপনাকে সাহায্য করতে আছি।', 'नमस्ते। मैं Guidia हूँ। एक-एक कदम में आपकी मदद के लिए हूँ।', 'Xin chào. Tôi là Guidia. Tôi ở đây để giúp bạn từng bước một.'))}>{t('Hear Guidia', 'Guidia-কে শুনুন', 'Guidia को सुनें', 'Nghe Guidia')}</Button>
                  </div>
                )}
              </section>
            )}

            {step === 3 && (
              <section className="stack" style={{ '--gap': 'var(--s-5)' }}>
                <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
                  <p className="eyebrow"><User size={16} aria-hidden="true" /> {labels[3]}</p>
                  {startStep === 3 && <Alert tone="ok" icon={Check}>{t('We kept the language, guidance and reading choices you made earlier. You can change them any time in Settings.', 'আগে যে ভাষা, নির্দেশনা ও পড়ার ধরন বেছেছিলেন সেগুলো রাখা হয়েছে। সেটিংসে যেকোনো সময় বদলাতে পারবেন।', 'आपने पहले जो भाषा, मार्गदर्शन और पढ़ने का तरीका चुना था, वह रख लिया गया है। सेटिंग्स में कभी भी बदल सकते हैं।', 'Chúng tôi đã giữ ngôn ngữ, cách hướng dẫn và cỡ chữ bạn chọn trước đó. Bạn có thể đổi bất cứ lúc nào trong Cài đặt.')}</Alert>}
                  <h1 id="ob-title" className="onboarding-title">{t('One last, optional question', 'শেষ একটি ঐচ্ছিক প্রশ্ন', 'आखिरी, वैकल्पिक सवाल', 'Câu hỏi cuối, không bắt buộc')}</h1>
                  <p className="lead">{t('Your age helps Guidia suggest relevant lessons. It is never used to decide what you can do, and only you can see it.', 'আপনার বয়স Guidia-কে প্রাসঙ্গিক পাঠ সুপারিশ করতে সাহায্য করে। এটি দিয়ে কখনো ঠিক করা হয় না আপনি কী পারবেন, আর শুধু আপনি দেখতে পান।', 'आपकी उम्र Guidia को सही पाठ सुझाने में मदद करती है। इससे कभी तय नहीं होता कि आप क्या कर सकते हैं, और इसे सिर्फ़ आप देख सकते हैं।', 'Tuổi giúp Guidia gợi ý bài học phù hợp. Không bao giờ dùng để quyết định bạn làm được gì, và chỉ bạn thấy.')}</p>
                </div>
                <Field label={t('Your age', 'আপনার বয়স', 'आपकी उम्र', 'Tuổi của bạn')} optional={t('optional', 'ঐচ্ছিক', 'वैकल्पिक', 'không bắt buộc')}>
                  {(p) => <input {...p} className="input input-lg" inputMode="numeric" autoComplete="off" value={age} aria-invalid={ageInvalid || undefined} onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))} onKeyDown={(e) => { if (e.key === 'Enter') finish(); }} style={{ maxWidth: 180 }} />}
                </Field>
                {ageInvalid && age.length >= 2 && <Alert tone="warn">{t('Please enter an age between 18 and 120, or leave it empty.', '১৮ থেকে ১২০-এর মধ্যে বয়স লিখুন, অথবা ফাঁকা রাখুন।', '18 से 120 के बीच उम्र लिखें, या खाली छोड़ दें।', 'Hãy nhập tuổi từ 18 đến 120, hoặc để trống.')}</Alert>}
              </section>
            )}
          </div>
        )}

        {error && <Alert tone="warn">{error}</Alert>}

        {!done && (
          <div className="onboarding-nav">
            {step === startStep && guest ? (
              <Button variant="ghost" onClick={() => { markSetupDone(); navigate('/landing', { replace: true }); }}>{t('Skip for now', 'এখন থাক', 'अभी छोड़ें', 'Để sau')}</Button>
            ) : (
              <Button variant="ghost" icon={ArrowLeft} onClick={() => go(step - 1)} disabled={step === startStep}>{t('Back', 'পেছনে', 'पीछे', 'Quay lại')}</Button>
            )}
            {step < total - 1 ? (
              <Button size="lg" arrow onClick={() => go(step + 1)}>{t('Continue', 'এগিয়ে যান', 'आगे बढ़ें', 'Tiếp tục')}</Button>
            ) : (
              <Button size="lg" icon={Check} onClick={finish} disabled={ageInvalid} state={busy ? 'loading' : 'idle'}>{guest ? t('Show me Guidia', 'Guidia দেখান', 'Guidia दिखाएं', 'Xem Guidia') : t('Start using Guidia', 'Guidia শুরু করুন', 'Guidia शुरू करें', 'Bắt đầu dùng Guidia')}</Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
