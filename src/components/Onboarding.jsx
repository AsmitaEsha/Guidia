import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppStateContext';
import { ArrowRight, ChevronRight, Globe, User, CalendarDays } from 'lucide-react';
import GuidiaLogo from './GuidiaLogo';

const LANGUAGES = [
  { id: 'en', label: 'English', sub: 'Continue in English', flag: 'EN' },
  { id: 'bn', label: 'বাংলা', sub: 'বাংলায় চালিয়ে যান', flag: 'বাং' },
  { id: 'hi', label: 'हिन्दी', sub: 'हिन्दी में जारी रखें', flag: 'हि' },
];

export default function Onboarding() {
  const { language, setLanguage, completeFirstRun, t } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState('language');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const chooseLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setStep('name');
    setError('');
  };

  const submitName = (event) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError(t('Please enter your name.', 'আপনার নাম লিখুন।', 'कृपया अपना नाम लिखें।'));
      return;
    }
    setStep('age');
    setError('');
  };

  const submitAge = (event) => {
    event.preventDefault();
    const numericAge = Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 1 || numericAge > 120) {
      setError(t('Please enter a valid age.', 'সঠিক বয়স লিখুন।', 'कृपया सही उम्र लिखें।'));
      return;
    }
    completeFirstRun({ name, age: numericAge, language });
    navigate('/app/home', { replace: true });
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 34 }}>
        <GuidiaLogo size={64} style={{ margin: '0 auto 20px', boxShadow: 'var(--sh-md)' }} />
        <h1 style={{ fontWeight: 900, fontSize: 26, letterSpacing: 0 }}>
          {t('Welcome to Guidia', 'Guidia-তে স্বাগতম', 'Guidia में आपका स्वागत है')}
        </h1>
        <p style={{ color: 'var(--text-2)', marginTop: 6, fontSize: 15 }}>
          {t('A safe place to learn digital tasks.', 'ডিজিটাল কাজ শেখার নিরাপদ জায়গা।', 'डिजिटल काम सीखने की सुरक्षित जगह।')}
        </p>
      </div>

      {step === 'language' && (
        <div className="anim-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={18} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17 }}>Select your language</p>
              <p style={{ color: 'var(--text-2)', fontSize: 13 }}>আপনার ভাষা বেছে নিন · अपनी भाषा चुनें</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LANGUAGES.map((item) => (
              <button
                key={item.id}
                onClick={() => chooseLanguage(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', textAlign: 'left', transition: 'all var(--tr)' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'var(--text-2)', flexShrink: 0 }}>
                  {item.flag}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 17 }}>{item.label}</p>
                  <p style={{ color: 'var(--text-2)', fontSize: 13 }}>{item.sub}</p>
                </div>
                <ChevronRight size={18} color="var(--text-3)" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'name' && (
        <form className="anim-up" onSubmit={submitName}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal-light)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17 }}>{t('What is your name?', 'আপনার নাম কী?', 'आपका नाम क्या है?')}</p>
              <p style={{ color: 'var(--text-2)', fontSize: 13 }}>{t('Guidia will use it to greet you.', 'Guidia আপনাকে এই নামে ডাকবে।', 'Guidia आपको इसी नाम से बुलाएगा।')}</p>
            </div>
          </div>

          <label htmlFor="first-run-name" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
            {t('Name', 'নাম', 'नाम')}
          </label>
          <input
            id="first-run-name"
            className="input-field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('Enter your name', 'আপনার নাম লিখুন', 'अपना नाम लिखें')}
            autoComplete="name"
            autoFocus
          />
          {error && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 700, marginTop: 12 }}>{error}</p>}
          <button className="btn btn-primary btn-full btn-lg" type="submit" style={{ marginTop: 20 }}>
            {t('Continue', 'চালিয়ে যান', 'जारी रखें')} <ArrowRight size={22} />
          </button>
        </form>
      )}

      {step === 'age' && (
        <form className="anim-up" onSubmit={submitAge}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage-light)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={18} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17 }}>{t('How old are you?', 'আপনার বয়স কত?', 'आपकी उम्र कितनी है?')}</p>
              <p style={{ color: 'var(--text-2)', fontSize: 13 }}>{t('This helps Guidia keep the experience comfortable.', 'এতে Guidia অভিজ্ঞতাটি আরামদায়ক রাখতে পারবে।', 'इससे Guidia अनुभव को आरामदायक रखेगा।')}</p>
            </div>
          </div>

          <label htmlFor="first-run-age" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
            {t('Age', 'বয়স', 'उम्र')}
          </label>
          <input
            id="first-run-age"
            className="input-field"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder={t('Enter your age', 'আপনার বয়স লিখুন', 'अपनी उम्र लिखें')}
            inputMode="numeric"
            autoFocus
          />
          {error && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 700, marginTop: 12 }}>{error}</p>}
          <button className="btn btn-primary btn-full btn-lg" type="submit" style={{ marginTop: 20 }}>
            {t('Start Guidia', 'Guidia শুরু করুন', 'Guidia शुरू करें')} <ArrowRight size={22} />
          </button>
        </form>
      )}
    </div>
  );
}
