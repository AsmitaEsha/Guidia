import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ExternalLink, HelpCircle, Loader2, Volume2 } from 'lucide-react';
import { apiFetch } from '../services/apiClient';
import { useApp } from '../context/AppStateContext';

function typeColor(type) {
  if (type === 'danger') return 'var(--danger)';
  if (type === 'warn') return 'var(--warn)';
  if (type === 'input') return 'var(--blue)';
  if (type === 'action') return 'var(--teal)';
  return 'var(--sage)';
}

function fallbackAnswer(question, language, activeLabel) {
  const q = question.toLowerCase();
  if (language === 'bn') {
    if (q.includes('login') || q.includes('log in')) return 'লগ ইন করতে সাধারণত “Sign in”, “Log in”, বা অ্যাকাউন্ট আইকন খুঁজুন। সন্দেহ হলে পাসওয়ার্ড দেওয়ার আগে ঠিকানা দেখে নিন।';
    if (q.includes('search')) return 'সার্চ বক্স সাধারণত উপরের দিকে থাকে। ম্যাগনিফাইং গ্লাস আইকন বা “Search” লেখা খুঁজুন।';
    if (q.includes('safe') || q.includes('payment')) return 'পেমেন্ট পেজ হলে ধীরে এগোন। ঠিকানা, টাকা, প্রাপক এবং কোনো OTP/PIN চাইছে কি না ভালোভাবে দেখুন।';
    return `${activeLabel || 'এই অংশ'} সম্পর্কে ধীরে দেখে নিন। গুরুত্বপূর্ণ বোতামে চাপ দেওয়ার আগে লেখা পড়ুন।`;
  }
  if (language === 'hi') {
    if (q.includes('login') || q.includes('log in')) return 'लॉग इन करने के लिए “Sign in”, “Log in”, या अकाउंट आइकन खोजें। पासवर्ड देने से पहले वेबसाइट का पता जांचें।';
    if (q.includes('search')) return 'खोज बॉक्स अक्सर ऊपर होता है। मैग्निफाइंग ग्लास आइकन या “Search” शब्द देखें।';
    if (q.includes('safe') || q.includes('payment')) return 'भुगतान पेज पर धीरे आगे बढ़ें। वेबसाइट, राशि, प्राप्तकर्ता और OTP/PIN की मांग ध्यान से जांचें।';
    return `${activeLabel || 'इस हिस्से'} को धीरे से देखें। किसी महत्वपूर्ण बटन पर क्लिक करने से पहले लिखा हुआ पढ़ें।`;
  }
  if (q.includes('login') || q.includes('log in')) return 'Look for “Sign in”, “Log in”, or an account/profile icon. Before entering a password, check that the website address looks correct.';
  if (q.includes('search')) return 'The search box is usually near the top. Look for a magnifying glass icon or the word “Search”.';
  if (q.includes('safe') || q.includes('payment')) return 'Move slowly on payment pages. Check the website address, amount, recipient, and whether it asks for OTP, PIN, or password.';
  return `Look carefully at ${activeLabel || 'this screen'}. Read the button text before clicking anything important.`;
}

export default function ScreenshotExplain() {
  const { analysisId } = useParams();
  const { language, setLanguage, speak, t } = useApp();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const itemRefs = useRef([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/screenshots/sessions/${analysisId}`)
      .then((data) => {
        if (cancelled) return;
        setSession(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Could not open this screenshot explanation.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [analysisId]);

  const elements = session?.analysis?.elements || [];
  const active = elements[activeIndex];
  const isRisky = session?.analysis && (!session.analysis.safe || elements.some((element) => element.safe === false));
  const visibleElements = useMemo(() => elements.slice(0, 8), [elements]);

  const focusItem = (index) => {
    setActiveIndex(index);
    itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const ask = (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    const nextAnswer = fallbackAnswer(question, language, active?.label);
    setAnswer(nextAnswer);
    speak(nextAnswer);
  };

  if (loading) {
    return (
      <div className="screenshot-explain-page">
        <Loader2 className="spin" size={32} />
        <p>{t('Opening your screenshot...', 'আপনার স্ক্রিনশট খোলা হচ্ছে...', 'आपका स्क्रीनशॉट खोला जा रहा है...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screenshot-explain-page">
        <div className="screenshot-explain-error">
          <AlertTriangle size={34} />
          <h1>{t('We could not open this screenshot', 'এই স্ক্রিনশট খোলা যায়নি', 'यह स्क्रीनशॉट नहीं खुल सका')}</h1>
          <p>{error}</p>
          <Link className="btn btn-primary" to="/app/home">{t('Open Guidia', 'Guidia খুলুন', 'Guidia खोलें')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="screenshot-explain-page">
      <header className="screenshot-explain-header">
        <Link to="/app/home" className="btn btn-icon btn-ghost" aria-label={t('Back to Guidia', 'Guidia-তে ফিরুন', 'Guidia पर वापस जाएं')}>
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1>{t("Let's understand this screen", 'চলুন এই স্ক্রিনটি বুঝি', 'आइए इस स्क्रीन को समझें')}</h1>
          <p>{t('Guidia captured what is currently visible on your screen.', 'Guidia আপনার স্ক্রিনে এখন যা দেখা যাচ্ছে তা ধরেছে।', 'Guidia ने आपकी स्क्रीन पर अभी जो दिख रहा है उसे कैप्चर किया है।')}</p>
        </div>
        <div className="screenshot-language">
          <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button>
          <button className={language === 'bn' ? 'active' : ''} onClick={() => setLanguage('bn')}>বাংলা</button>
          <button className={language === 'hi' ? 'active' : ''} onClick={() => setLanguage('hi')}>हिन्दी</button>
        </div>
      </header>

      {isRisky && (
        <section className="screenshot-warning">
          <AlertTriangle size={22} />
          <div>
            <strong>{t('Please check this carefully.', 'দয়া করে এটি সাবধানে দেখুন।', 'कृपया इसे ध्यान से देखें।')}</strong>
            <p>{session.analysis.warning || t('This page may be asking for sensitive information.', 'এই পেজটি সংবেদনশীল তথ্য চাইতে পারে।', 'यह पेज संवेदनशील जानकारी मांग सकता है।')}</p>
          </div>
        </section>
      )}

      <main className="screenshot-explain-grid">
        <section className="screenshot-canvas-panel">
          <div className="screenshot-canvas">
            <img src={session.imageDataUrl} alt={t('Captured browser screen', 'ধরা ব্রাউজার স্ক্রিন', 'कैप्चर की गई ब्राउजर स्क्रीन')} />
            {visibleElements.map((element, index) => (
              <button
                key={`${element.label}-${index}`}
                className={`screenshot-marker ${activeIndex === index ? 'active' : ''}`}
                style={{ left: `${element.x}%`, top: `${element.y}%`, '--marker-color': typeColor(element.type) }}
                onClick={() => focusItem(index)}
                aria-label={`${index + 1}. ${element.label}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </section>

        <aside className="screenshot-explain-panel">
          {session.sourceUrl && (
            <p className="screenshot-source">
              <ExternalLink size={15} /> {session.sourceUrl}
            </p>
          )}
          <p className="screenshot-summary">{session.analysis.summary}</p>

          <div className="screenshot-voice-row">
            <button className="btn btn-sm btn-primary" onClick={() => speak(session.analysis.summary)}>
              <Volume2 size={17} /> {t('Listen', 'শুনুন', 'सुनें')}
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => speak(session.analysis.summary)}>
              <Volume2 size={17} /> বাংলায় শুনুন
            </button>
          </div>

          <div className="screenshot-items">
            {visibleElements.map((element, index) => (
              <button
                key={`${element.label}-item-${index}`}
                ref={(node) => { itemRefs.current[index] = node; }}
                className={`screenshot-item ${activeIndex === index ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
                style={{ '--item-color': typeColor(element.type) }}
              >
                <strong>{index + 1}. {element.label}</strong>
                <span>{element.desc}</span>
              </button>
            ))}
          </div>

          <form className="screenshot-ask" onSubmit={ask}>
            <label htmlFor="screenshot-question">
              <HelpCircle size={18} /> {t('Ask about this screen', 'এই স্ক্রিন সম্পর্কে জিজ্ঞাসা করুন', 'इस स्क्रीन के बारे में पूछें')}
            </label>
            <input
              id="screenshot-question"
              className="input-field"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={t('Where do I search?', 'আমি কোথায় সার্চ করব?', 'मैं कहां खोजूं?')}
            />
            <button className="btn btn-primary btn-full" type="submit">{t('Ask Guidia', 'Guidia-কে জিজ্ঞাসা করুন', 'Guidia से पूछें')}</button>
          </form>

          {answer && (
            <div className="screenshot-answer">
              <strong>{t('Guidia says', 'Guidia বলছে', 'Guidia कहता है')}</strong>
              <p>{answer}</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
