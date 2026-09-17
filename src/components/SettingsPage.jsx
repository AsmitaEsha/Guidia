import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import GuidiaVoiceControls from './GuidiaVoiceControls';
import {
  Bell,
  ChevronRight,
  Globe,
  Heart,
  Moon,
  RotateCcw,
  Save,
  Settings,
  Shield,
  User,
  Volume2,
  ZoomIn,
} from 'lucide-react';

function Toggle({ on, onToggle, label }) {
  return (
    <button
      type="button"
      className={`toggle ${on ? 'on' : ''}`}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={on}
      style={{ border: 0 }}
    >
      <div className="toggle-knob" />
    </button>
  );
}

export default function SettingsPage() {
  const {
    language,
    setLanguage,
    mode,
    setMode,
    user,
    speak,
    t,
    setActiveTab,
    fontSize,
    setFontSize,
    darkMode,
    setDarkMode,
    voiceEnabled,
    setVoiceEnabled,
    voiceSpeed,
    setVoiceSpeed,
    voiceAutoPlay,
    setVoiceAutoPlay,
    reducedMotion,
    setReducedMotion,
    notificationsEnabled,
    setNotificationsEnabled,
    persistPreferences,
    updateLocalProfile,
    resetFirstRun,
    showToast,
  } = useApp();
  const { logout, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setAge(user?.age ? String(user.age) : '');
  }, [user]);

  const saveProfile = (event) => {
    event.preventDefault();
    const numericAge = Number(age);
    if (name.trim().length < 2) {
      setProfileError(t('Please enter a name.', 'একটি নাম লিখুন।', 'कृपया नाम लिखें।'));
      return;
    }
    if (!Number.isInteger(numericAge) || numericAge < 1 || numericAge > 120) {
      setProfileError(t('Please enter a valid age.', 'সঠিক বয়স লিখুন।', 'कृपया सही उम्र लिखें।'));
      return;
    }
    updateLocalProfile({ name, age: numericAge, language });
    setProfileError('');
    showToast(t('Profile saved.', 'প্রোফাইল সংরক্ষণ হয়েছে।', 'प्रोफाइल सहेज दिया गया।'), 'success');
  };

  const saveLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    updateLocalProfile({ name: name || user?.name, age: age || user?.age, language: nextLanguage });
    persistPreferences({ preferredLanguage: nextLanguage });
    const voiceText = nextLanguage === 'bn'
      ? 'বাংলা চালু হয়েছে।'
      : nextLanguage === 'hi'
        ? 'हिन्दी चालू हो गई है।'
        : 'English is now selected.';
    speak(voiceText, { rate: voiceSpeed });
  };

  const saveMode = (nextMode) => {
    setMode(nextMode);
    persistPreferences({ mode: nextMode, cognitiveState: nextMode.toUpperCase() });
    showToast(t('Comfort mode updated.', 'কমফোর্ট মোড পরিবর্তন হয়েছে।', 'आराम मोड बदल गया।'), 'success');
  };

  const handleRestartSetup = async () => {
    if (authUser) await logout();
    resetFirstRun();
    navigate('/onboarding', { replace: true });
  };

  const Section = ({ title, children }) => (
    <section style={{ marginBottom: 24 }}>
      <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingLeft: 4 }}>
        {title}
      </p>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </section>
  );

  const Row = ({ icon, label, sub, right, onClick, divider = true }) => (
    <div
      onClick={onClick}
      className="flex items-center gap-14"
      style={{ padding: '16px 20px', borderBottom: divider ? '1px solid var(--border)' : 'none', cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="icon-wrap iw-sm ic-blue" style={{ borderRadius: 10 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 17 }}>{label}</p>
        {sub && <p className="t-tiny" style={{ marginTop: 2 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <h1 className="t-title anim-up">{t('Settings & Accessibility', 'সেটিংস ও অ্যাক্সেসিবিলিটি', 'सेटिंग्स और सुविधा')}</h1>
        <p className="t-sub anim-up d1" style={{ marginTop: 8 }}>
          {t('Customize your Guidia experience.', 'আপনার Guidia অভিজ্ঞতা নিজের মতো করুন।', 'Guidia को अपने अनुसार बदलें।')}
        </p>
        <div className="section-divider" />
      </div>

      <div className="card anim-up d1" style={{ marginBottom: 28, background: 'linear-gradient(135deg,var(--blue-light),var(--teal-light))', display: 'flex', alignItems: 'center', gap: 20, padding: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={28} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontWeight: 800, fontSize: 22 }}>{user?.name || t('User', 'ব্যবহারকারী', 'उपयोगकर्ता')}</p>
          <p className="t-sub">{user?.age ? t(`Age ${user.age}`, `বয়স ${user.age}`, `उम्र ${user.age}`) : t('No age saved', 'বয়স সংরক্ষিত নেই', 'उम्र सहेजी नहीं गई')}</p>
          <div className="flex items-center gap-8" style={{ marginTop: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-blue">
              {mode === 'scared'
                ? t('Nervous Mode', 'ধীর সহায়তা মোড', 'धीमा सहायता मोड')
                : mode === 'unsure'
                  ? t('Guided Mode', 'গাইডেড মোড', 'मार्गदर्शित मोड')
                  : t('Calm Mode', 'শান্ত মোড', 'शांत मोड')}
            </span>
            <span className="badge badge-sage">{language === 'bn' ? 'বাংলা' : language === 'hi' ? 'हिन्दी' : 'English'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 24, marginBottom: 24 }}>
        <Section title={t('Profile', 'প্রোফাইল', 'प्रोफाइल')}>
          <form onSubmit={saveProfile} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label htmlFor="settings-name" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>{t('Name', 'নাম', 'नाम')}</label>
              <input id="settings-name" className="input-field" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label htmlFor="settings-age" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>{t('Age', 'বয়স', 'उम्र')}</label>
              <input id="settings-age" className="input-field" inputMode="numeric" value={age} onChange={(event) => setAge(event.target.value)} />
            </div>
            {profileError && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 700 }}>{profileError}</p>}
            <button className="btn btn-primary btn-full" type="submit"><Save size={18} /> {t('Save Profile', 'প্রোফাইল সংরক্ষণ করুন', 'प्रोफाइल सहेजें')}</button>
          </form>
        </Section>

        <Section title={t('Language', 'ভাষা', 'भाषा')}>
          <Row
            icon={<Globe size={18} />}
            label={t('App Language', 'অ্যাপের ভাষা', 'ऐप की भाषा')}
            sub={language === 'bn' ? 'বাংলা' : language === 'hi' ? 'हिन्दी' : 'English'}
            divider={false}
            right={
              <div className="segment" style={{ padding: 3 }}>
                <button className={`seg-btn ${language === 'en' ? 'active' : ''}`} onClick={() => saveLanguage('en')}>EN</button>
                <button className={`seg-btn ${language === 'bn' ? 'active' : ''}`} onClick={() => saveLanguage('bn')}>বাংলা</button>
                <button className={`seg-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => saveLanguage('hi')}>हिन्दी</button>
              </div>
            }
          />
        </Section>

        <Section title={t('Comfort Level', 'সহায়তার ধরন', 'सहायता स्तर')}>
          <Row
            icon={<Heart size={18} />}
            label={t('Guidia Help Style', 'Guidia কীভাবে সাহায্য করবে', 'Guidia कैसे मदद करे')}
            sub={t('Choose how slowly and simply Guidia should guide you.', 'Guidia কতটা ধীরে ও সহজভাবে গাইড করবে তা বেছে নিন।', 'Guidia कितनी सरल और धीमी मदद करे चुनें।')}
            divider={false}
            right={
              <div className="segment" style={{ padding: 3 }}>
                <button className={`seg-btn ${mode === 'calm' ? 'active' : ''}`} onClick={() => saveMode('calm')}>{t('Calm', 'শান্ত', 'शांत')}</button>
                <button className={`seg-btn ${mode === 'unsure' ? 'active' : ''}`} onClick={() => saveMode('unsure')}>{t('Guided', 'গাইডেড', 'गाइडेड')}</button>
                <button className={`seg-btn ${mode === 'scared' ? 'active' : ''}`} onClick={() => saveMode('scared')}>{t('Slow', 'ধীরে', 'धीरे')}</button>
              </div>
            }
          />
        </Section>

        <Section title={t('Accessibility', 'অ্যাক্সেসিবিলিটি', 'सुविधा')}>
          <Row
            icon={<Volume2 size={18} />}
            label={t('Voice Narration', 'ভয়েস বর্ণনা', 'आवाज से पढ़ना')}
            sub={t('Read content aloud.', 'লেখা পড়ে শোনাবে।', 'सामग्री आवाज में पढ़ेगा।')}
            right={<Toggle label="voice" on={voiceEnabled} onToggle={() => { const next = !voiceEnabled; setVoiceEnabled(next); persistPreferences({ voiceEnabled: next }); }} />}
          />
          {voiceEnabled && (
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <button
                className="btn btn-sm btn-primary"
                style={{ marginBottom: 10 }}
                onClick={() => speak(t('This is Guidia speaking. Voice guidance is working.', 'এটি Guidia বলছে। ভয়েস গাইডেন্স কাজ করছে।', 'यह Guidia बोल रहा है। आवाज मार्गदर्शन काम कर रहा है।'))}
              >
                {t('Try Voice', 'ভয়েস চেষ্টা করুন', 'आवाज जांचें')}
              </button>
              <GuidiaVoiceControls />
            </div>
          )}
          {voiceEnabled && (
            <Row
              icon={<Volume2 size={18} />}
              label={t('Reading Speed', 'পড়ার গতি', 'पढ़ने की गति')}
              sub={voiceSpeed < 0.9 ? t('Slow', 'ধীর', 'धीमा') : voiceSpeed > 1.05 ? t('Faster', 'দ্রুত', 'तेज') : t('Normal', 'স্বাভাবিক', 'सामान्य')}
              right={
                <div className="segment" style={{ padding: 3 }}>
                  {[
                    { label: t('Slow', 'ধীর', 'धीमा'), value: 0.8 },
                    { label: t('Normal', 'স্বাভাবিক', 'सामान्य'), value: 1 },
                    { label: t('Faster', 'দ্রুত', 'तेज'), value: 1.15 },
                  ].map((opt) => (
                    <button key={opt.value} className={`seg-btn ${Math.abs(voiceSpeed - opt.value) < 0.01 ? 'active' : ''}`} onClick={() => { setVoiceSpeed(opt.value); persistPreferences({ voiceSpeed: opt.value }); }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              }
            />
          )}
          {voiceEnabled && (
            <Row
              icon={<Volume2 size={18} />}
              label={t('Auto-read lesson steps', 'পাঠের ধাপ নিজে পড়বে', 'पाठ अपने-आप पढ़े')}
              sub={t('Guidia reads lesson steps when they appear.', 'পাঠের ধাপ দেখালে Guidia পড়ে শোনাবে।', 'पाठ के चरण दिखने पर Guidia पढ़ेगा।')}
              right={<Toggle label="auto read" on={voiceAutoPlay} onToggle={() => { const next = !voiceAutoPlay; setVoiceAutoPlay(next); persistPreferences({ voiceAutoPlay: next }); }} />}
            />
          )}
          <Row
            icon={<ZoomIn size={18} />}
            label={t('Text Size', 'টেক্সট আকার', 'टेक्स्ट आकार')}
            sub={`${fontSize}px`}
            right={
              <div className="flex items-center gap-10">
                <button className="btn btn-sm btn-ghost" style={{ padding: '8px 14px' }} onClick={() => { const next = Math.max(14, fontSize - 2); setFontSize(next); persistPreferences({ fontSize: next }); }}>A-</button>
                <button className="btn btn-sm btn-primary" style={{ padding: '8px 14px' }} onClick={() => { const next = Math.min(30, fontSize + 2); setFontSize(next); persistPreferences({ fontSize: next }); }}>A+</button>
              </div>
            }
          />
          <Row
            icon={<Moon size={18} />}
            label={t('Dark / High Contrast', 'ডার্ক / হাই কনট্রাস্ট', 'डार्क / हाई कंट्रास्ट')}
            sub={t('Easier on the eyes.', 'চোখে আরামদায়ক।', 'आंखों के लिए आरामदायक।')}
            right={<Toggle label="dark mode" on={darkMode} onToggle={() => { const next = !darkMode; setDarkMode(next); persistPreferences({ darkMode: next }); }} />}
          />
          <Row
            icon={<Settings size={18} />}
            label={t('Reduced Motion', 'কম অ্যানিমেশন', 'कम एनीमेशन')}
            sub={t('Fewer animations and movement.', 'কম নড়াচড়া ও অ্যানিমেশন।', 'कम गति और एनीमेशन।')}
            divider={false}
            right={<Toggle label="reduced motion" on={reducedMotion} onToggle={() => { const next = !reducedMotion; setReducedMotion(next); persistPreferences({ reducedMotion: next }); }} />}
          />
        </Section>

        <Section title={t('Notifications', 'নোটিফিকেশন', 'नोटिफिकेशन')}>
          <Row
            icon={<Bell size={18} />}
            label={t('Reminders & Alerts', 'রিমাইন্ডার ও সতর্কতা', 'रिमाइंडर और अलर्ट')}
            sub={notificationsEnabled ? t('Notifications are on.', 'নোটিফিকেশন চালু আছে।', 'नोटिफिकेशन चालू हैं।') : t('Notifications are off.', 'নোটিফিকেশন বন্ধ আছে।', 'नोटिफिकेशन बंद हैं।')}
            divider={false}
            right={<Toggle label="notifications" on={notificationsEnabled} onToggle={() => { const next = !notificationsEnabled; setNotificationsEnabled(next); persistPreferences({ notificationsEnabled: next }); }} />}
          />
        </Section>

        <Section title={t('Family Guardian', 'পারিবারিক গার্ডিয়ান', 'परिवार गार्जियन')}>
          <Row
            icon={<Shield size={18} />}
            label={t('Manage Guardians & Approvals', 'গার্ডিয়ান ও অনুমোদন পরিচালনা', 'गार्जियन और अनुमोदन')}
            sub={authUser ? t('Invite a guardian and review approval requests.', 'গার্ডিয়ান আমন্ত্রণ করুন ও অনুরোধ দেখুন।', 'गार्जियन आमंत्रित करें और अनुरोध देखें।') : t('Guardian features need an account login.', 'Guardian ফিচারের জন্য অ্যাকাউন্ট লগইন দরকার।', 'गार्जियन सुविधा के लिए अकाउंट लॉगिन चाहिए।')}
            onClick={() => authUser && setActiveTab('guardian')}
            right={authUser ? <ChevronRight size={18} color="var(--text-3)" /> : <span className="badge badge-blue">{t('Account needed', 'অ্যাকাউন্ট দরকার', 'अकाउंट चाहिए')}</span>}
            divider={false}
          />
        </Section>
      </div>

      <button className="btn btn-ghost btn-full" style={{ color: 'var(--danger)', border: '1px solid var(--danger-light)', marginTop: 8 }} onClick={handleRestartSetup}>
        <RotateCcw size={20} /> {t('Restart Setup', 'আবার সেটআপ করুন', 'सेटअप फिर शुरू करें')}
      </button>
    </div>
  );
}
