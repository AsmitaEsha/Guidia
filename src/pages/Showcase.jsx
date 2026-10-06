import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookMarked, BookOpen, Brain, Database, Eye, Globe, Hand, HeartHandshake, Keyboard, Layers,
  MessageCircle, Pause, Play, RotateCcw, ScanSearch, ShieldCheck, Sparkles, TimerReset, Users, X,
} from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { LANGUAGES } from '../config/languages';
import { SIMULATORS } from '../components/sims/registry';
import { Button, IconButton, ModeLabel, ProgressRing, Timeline } from '../components/ui';
import { GuidiaMark } from '../components/GuidiaLogo';
import AppLogo from '../components/AppLogo';
import { LanguagePicker } from '../components/landing/LandingNavbar';
import ScreenDemo from '../components/demo/ScreenDemo';
import PracticeDemo from '../components/demo/PracticeDemo';
import ScamDemo from '../components/demo/ScamDemo';
import JourneyDemo from '../components/demo/JourneyDemo';
import CircleDemo from '../components/demo/CircleDemo';
import AskDemo from '../components/demo/AskDemo';

function ProblemStep({ t }) {
  const [beat, setBeat] = useState(0);
  return (
    <div className="sc-split">
      <div className="sc-copy">
        <p className="eyebrow">01 · {t('The problem', 'সমস্যা', 'समस्या', 'Vấn đề')}</p>
        <h2 className="sc-title">{t('Every day, a screen asks an older adult to make a decision they don’t understand.', 'প্রতিদিন একটি স্ক্রিন একজন প্রবীণকে এমন সিদ্ধান্ত নিতে বলে যা তিনি বোঝেন না।', 'हर दिन एक स्क्रीन बुज़ुर्ग से ऐसा फैसला मांगती है जो वे समझते नहीं।', 'Mỗi ngày, một màn hình buộc người lớn tuổi đưa ra quyết định họ không hiểu.')}</h2>
        <p className="lead">{t('Confusion turns into fear, fear turns into avoidance — or into a scammer’s opportunity.', 'বিভ্রান্তি থেকে ভয়, ভয় থেকে এড়িয়ে চলা — নয়তো প্রতারকের সুযোগ।', 'उलझन डर बनती है, डर टालना बनता है — या धोखेबाज़ का मौका।', 'Bối rối thành sợ hãi, sợ hãi thành né tránh — hoặc thành cơ hội cho kẻ gian.')}</p>
        {beat < 2 && <Button arrow onClick={() => setBeat((b) => b + 1)}>{beat === 0 ? t('What happens next?', 'এরপর কী হয়?', 'आगे क्या होता है?', 'Rồi sao?') : t('Bring in Guidia', 'Guidia আসুক', 'Guidia को लाएं', 'Gọi Guidia')}</Button>}
      </div>
      <div className="sc-problem">
        <div className={`sc-confusing ${beat >= 2 ? 'is-calm' : ''}`}>
          <div className="sc-pop">⚠ {t('Update required! Enter PIN to keep your account', 'আপডেট দরকার! অ্যাকাউন্ট রাখতে পিন দিন', 'अपडेट ज़रूरी! खाता बचाने के लिए पिन डालें', 'Cần cập nhật! Nhập PIN để giữ tài khoản')}</div>
          <div className="sc-btns"><span>OK</span><span>Allow</span><span>Continue</span><span>Verify</span></div>
        </div>
        {beat >= 1 && <p className="sc-thought fade">“{t('What should I press?', 'আমি কোথায় চাপব?', 'मैं क्या दबाऊं?', 'Tôi nên bấm gì?')}”</p>}
        {beat >= 2 && (
          <div className="sc-guidia rise">
            <GuidiaMark size={36} title="" />
            <div><p className="text-strong">{t('Let’s pause. This page wants your PIN — real apps never ask for it here. Tap Cancel.', 'একটু থামুন। এই পেজ আপনার পিন চাইছে — আসল অ্যাপ এখানে কখনো চায় না। বাতিল চাপুন।', 'ज़रा रुकें। यह पेज आपका पिन मांग रहा है — असली ऐप यहाँ कभी नहीं मांगते। रद्द दबाएं।', 'Dừng lại nhé. Trang này đòi PIN — ứng dụng thật không bao giờ hỏi ở đây. Hãy bấm Hủy.')}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

function MeetStep({ t }) {
  const tiles = [
    [BookOpen, t('Learn something', 'কিছু শিখুন', 'कुछ सीखें', 'Học điều mới')],
    [MessageCircle, t('Ask Guidia', 'Guidia-কে জিজ্ঞাসা', 'Guidia से पूछें', 'Hỏi Guidia')],
    [ScanSearch, t('Understand my screen', 'আমার স্ক্রিন বুঝুন', 'मेरी स्क्रीन समझें', 'Hiểu màn hình của tôi')],
    [Hand, t('Practise safely', 'নিরাপদে অনুশীলন', 'सुरक्षित अभ्यास', 'Luyện tập an toàn')],
  ];
  return (
    <div className="sc-split">
      <div className="sc-copy">
        <p className="eyebrow">02 · {t('Meet Guidia', 'Guidia-র সাথে পরিচয়', 'Guidia से मिलिए', 'Gặp Guidia')}</p>
        <h2 className="sc-title">{t('A calm companion that makes the next step obvious.', 'একজন শান্ত সঙ্গী, যে পরের ধাপ স্পষ্ট করে দেয়।', 'एक शांत साथी जो अगला कदम साफ़ कर देता है।', 'Một người bạn điềm tĩnh giúp bước tiếp theo rõ ràng.')}</h2>
        <p className="lead">{t('Ask in your own words, see your screen explained, practise safely — and reach someone you trust.', 'নিজের ভাষায় জিজ্ঞাসা করুন, স্ক্রিনের ব্যাখ্যা দেখুন, নিরাপদে অনুশীলন করুন — আর বিশ্বস্ত কারও কাছে পৌঁছান।', 'अपने शब्दों में पूछें, स्क्रीन की व्याख्या देखें, सुरक्षित अभ्यास करें — और भरोसेमंद तक पहुँचें।', 'Hỏi theo cách của bạn, xem giải thích màn hình, luyện tập an toàn — và tìm đến người tin cậy.')}</p>
      </div>
      <div className="stack" style={{ '--gap': 'var(--s-4)' }}>
        <div className="sc-home">
          <p className="sc-home-q">{t('What would you like to do today?', 'আজ আপনি কী করতে চান?', 'आज आप क्या करना चाहेंगे?', 'Hôm nay bạn muốn làm gì?')}</p>
          <div className="sc-home-grid">{tiles.map(([Icon, label]) => <span key={label}><Icon aria-hidden="true" />{label}</span>)}</div>
        </div>
        <AskDemo />
      </div>
    </div>
  );
}

function DemoStep({ n, eyebrow, title, body, children, t }) {
  return (
    <div className="sc-split is-demo">
      <div className="sc-copy">
        <p className="eyebrow">{String(n).padStart(2, '0')} · {t(...eyebrow)}</p>
        <h2 className="sc-title">{t(...title)}</h2>
        <p className="lead">{t(...body)}</p>
      </div>
      <div className="sc-demo">{children}</div>
    </div>
  );
}

function SupportStep({ t }) {
  const [stage, setStage] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);
  const request = () => {
    setStage(1);
    clearInterval(timer.current);
    timer.current = setInterval(() => setStage((s) => { if (s >= 3) { clearInterval(timer.current); return s; } return s + 1; }), 1300);
  };
  const st = (i) => (i < stage ? 'done' : i === stage ? 'current' : 'todo');
  return (
    <div className="sc-split is-demo">
      <div className="sc-copy">
        <p className="eyebrow">07 · {t('Human support', 'মানুষের সহায়তা', 'मानवीय सहायता', 'Hỗ trợ con người')}</p>
        <h2 className="sc-title">{t('When technology is not enough, a person is one tap away.', 'প্রযুক্তি যথেষ্ট না হলে, একজন মানুষ এক চাপেই।', 'जब तकनीक काफ़ी न हो, तो कोई इंसान एक टैप दूर है।', 'Khi công nghệ chưa đủ, một người thật chỉ cách một chạm.')}</h2>
        <div className="sc-help">
          <Button variant="help" icon={HeartHandshake} onClick={request} disabled={stage > 0 && stage < 3}>{t('I need help', 'আমার সাহায্য দরকার', 'मुझे मदद चाहिए', 'Tôi cần giúp đỡ')}</Button>
          {stage > 0 && (
            <Timeline items={[
              { key: 'a', icon: HeartHandshake, title: t('You asked for help', 'আপনি সাহায্য চেয়েছেন', 'आपने मदद मांगी', 'Bạn đã nhờ giúp'), state: 'done' },
              { key: 'b', icon: ArrowRight, title: t('Request sent to Rupa', 'রূপাকে অনুরোধ পাঠানো হয়েছে', 'रूपा को अनुरोध भेजा गया', 'Đã gửi tới Rupa'), state: st(1) },
              { key: 'c', icon: Eye, title: t('Rupa has seen it', 'রূপা দেখেছেন', 'रूपा ने देख लिया', 'Rupa đã thấy'), state: st(2) },
              { key: 'd', icon: Users, title: t('She is helping', 'তিনি সাহায্য করছেন', 'वह मदद कर रही हैं', 'Cô ấy đang giúp'), state: stage >= 3 ? 'current' : 'todo' },
            ]} />
          )}
        </div>
      </div>
      <div className="sc-demo"><CircleDemo /></div>
    </div>
  );
}

function ScaleStep({ t }) {
  const layers = [
    [Sparkles, t('Guidia experience', 'Guidia অভিজ্ঞতা', 'Guidia अनुभव', 'Trải nghiệm Guidia'), t('Web · mobile · browser helper', 'ওয়েব · মোবাইল · ব্রাউজার সহায়ক', 'वेब · मोबाइल · ब्राउज़र सहायक', 'Web · di động · tiện ích trình duyệt')],
    [Layers, t('Guided tasks', 'নির্দেশিত কাজ', 'निर्देशित काम', 'Nhiệm vụ có hướng dẫn'), t('Resumable steps, hints, recovery', 'আবার শুরু করা যায় এমন ধাপ, ইঙ্গিত, পুনরুদ্ধার', 'फिर शुरू होने वाले कदम, संकेत, सुधार', 'Bước làm tiếp được, gợi ý, khắc phục')],
    [ShieldCheck, t('Safety + learning', 'নিরাপত্তা + শেখা', 'सुरक्षा + सीखना', 'An toàn + học tập'), t('Risk engine, confirmations, skills, reviews', 'ঝুঁকি ইঞ্জিন, নিশ্চিতকরণ, দক্ষতা, ঝালাই', 'जोखिम इंजन, पुष्टि, कौशल, दोहराव', 'Bộ đánh giá rủi ro, xác nhận, kỹ năng, ôn tập')],
    [Brain, t('AI · vision · voice', 'এআই · দৃষ্টি · কণ্ঠ', 'AI · दृष्टि · आवाज़', 'AI · thị giác · giọng nói'), t('Free-tier or local models, with fallbacks', 'ফ্রি বা লোকাল মডেল, বিকল্পসহ', 'मुफ़्त या लोकल मॉडल, विकल्पों के साथ', 'Mô hình miễn phí hoặc cục bộ, có dự phòng')],
    [BookMarked, t('Knowledge + skills', 'জ্ঞান + দক্ষতা', 'ज्ञान + कौशल', 'Kiến thức + kỹ năng'), t('Reviewed lessons ground every answer', 'যাচাই করা পাঠ প্রতিটি উত্তরের ভিত্তি', 'जाँचे पाठ हर जवाब का आधार', 'Bài học đã duyệt làm nền cho mọi câu trả lời')],
    [Database, t('Data & services', 'ডেটা ও সেবা', 'डेटा और सेवाएं', 'Dữ liệu & dịch vụ'), t('Portable database, audit log, notification outbox', 'বহনযোগ্য ডেটাবেস, অডিট লগ, নোটিফিকেশন আউটবক্স', 'पोर्टेबल डेटाबेस, ऑडिट लॉग, सूचना आउटबॉक्स', 'CSDL di động, nhật ký kiểm tra, hàng đợi thông báo')],
  ];
  return (
    <div className="sc-split">
      <div className="sc-copy">
        <p className="eyebrow">08 · {t('Why Guidia scales', 'Guidia কেন বড় হতে পারে', 'Guidia क्यों बढ़ सकता है', 'Vì sao Guidia mở rộng được')}</p>
        <h2 className="sc-title">{t('One core. New languages, apps and countries plug in.', 'একটি মূল কাঠামো। নতুন ভাষা, অ্যাপ ও দেশ যুক্ত হয় সহজে।', 'एक कोर। नई भाषाएं, ऐप और देश आसानी से जुड़ते हैं।', 'Một lõi chung. Ngôn ngữ, ứng dụng và quốc gia mới dễ dàng gắn vào.')}</h2>
        <div className="stack" style={{ '--gap': 'var(--s-3)' }}>
          <p className="text-strong row" style={{ '--gap': '8px' }}><Globe size={20} aria-hidden="true" /> {LANGUAGES.map((l) => l.nativeName).join(' · ')}</p>
          <div className="sc-apps">{Object.keys(SIMULATORS).map((k) => <AppLogo key={k} app={k} size={40} />)}</div>
          <p className="text-muted">{t(`${Object.keys(SIMULATORS).length} practice apps · country packs for Bangladesh, India and Vietnam`, `${Object.keys(SIMULATORS).length}টি অনুশীলন অ্যাপ · বাংলাদেশ, ভারত ও ভিয়েতনামের জন্য প্যাক`, `${Object.keys(SIMULATORS).length} अभ्यास ऐप · बांग्लादेश, भारत और वियतनाम के पैक`, `${Object.keys(SIMULATORS).length} ứng dụng luyện tập · gói cho Bangladesh, Ấn Độ và Việt Nam`)}</p>
        </div>
      </div>
      <ol className="sc-arch">
        {layers.map(([Icon, title, sub], i) => (
          <li key={title} className="rise" style={{ '--i': i }}>
            <span className="sc-arch-icon" aria-hidden="true"><Icon /></span>
            <span className="stack" style={{ '--gap': 0 }}><span className="text-strong">{title}</span><span className="text-subtle">{sub}</span></span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FinalStep({ t }) {
  const words = [
    [BookOpen, t('Learn', 'শিখুন', 'सीखें', 'Học')], [ScanSearch, t('Understand', 'বুঝুন', 'समझें', 'Hiểu')],
    [ShieldCheck, t('Protect', 'সুরক্ষা', 'सुरक्षा', 'Bảo vệ')], [BookMarked, t('Remember', 'মনে রাখুন', 'याद रखें', 'Ghi nhớ')],
    [HeartHandshake, t('Connect', 'যুক্ত থাকুন', 'जुड़ें', 'Kết nối')],
  ];
  return (
    <div className="sc-final">
      <GuidiaMark size={96} title="Guidia" />
      <h2 className="sc-final-title">{t('Understand technology.', 'প্রযুক্তি বুঝুন।', 'तकनीक समझें।', 'Hiểu công nghệ.')}<br />{t('Practise safely.', 'নিরাপদে অনুশীলন করুন।', 'सुरक्षित अभ्यास करें।', 'Luyện tập an toàn.')}<br />{t('Stay independent.', 'স্বাধীন থাকুন।', 'आत्मनिर्भर रहें।', 'Sống tự lập.')}</h2>
      <ul className="sc-final-words">{words.map(([Icon, w], i) => <li key={w} className="rise" style={{ '--i': i + 2 }}><Icon aria-hidden="true" />{w}</li>)}</ul>
    </div>
  );
}

function LearnStep({ t }) {
  const [conf, setConf] = useState(null);
  return (
    <DemoStep n={6} t={t} eyebrow={['Learn & remember', 'শিখুন ও মনে রাখুন', 'सीखें और याद रखें', 'Học & ghi nhớ']}
      title={['Progress that measures independence, not clicks.', 'অগ্রগতি মাপে স্বাধীনতা, ক্লিক নয়।', 'प्रगति आत्मनिर्भरता नापती है, क्लिक नहीं।', 'Tiến bộ đo bằng sự tự lập, không phải số lần bấm.']}
      body={['After every lesson Guidia asks how it felt — competence and confidence are tracked separately.', 'প্রতিটি পাঠের পর Guidia জিজ্ঞাসা করে কেমন লাগল — দক্ষতা ও আত্মবিশ্বাস আলাদা করে মাপা হয়।', 'हर पाठ के बाद Guidia पूछता है कैसा लगा — क्षमता और भरोसा अलग मापे जाते हैं।', 'Sau mỗi bài, Guidia hỏi bạn thấy thế nào — năng lực và sự tự tin được theo dõi riêng.']}>
      <div className="stack" style={{ '--gap': 'var(--s-4)' }}>
        <div className="sc-confidence">
          <p className="text-strong">{t('How did that feel?', 'কেমন লাগল?', 'कैसा लगा?', 'Bạn thấy thế nào?')}</p>
          <div className="row" style={{ '--gap': 'var(--s-2)' }}>
            {[[40, t('Still unsure', 'এখনো নিশ্চিত নই', 'अभी पक्का नहीं', 'Vẫn chưa chắc')], [60, t('Getting there', 'বুঝে উঠছি', 'समझ आ रहा है', 'Đang quen dần')], [100, t('I feel confident', 'আমি আত্মবিশ্বাসী', 'मुझे भरोसा है', 'Tôi thấy tự tin')]].map(([v, l]) => (
              <button key={v} type="button" className="chip chip-lg" aria-pressed={conf === v} onClick={() => setConf(v)}>{l}</button>
            ))}
          </div>
          <div className="row" style={{ '--gap': 'var(--s-5)' }}>
            <span className="row" style={{ '--gap': 'var(--s-2)' }}><ProgressRing value={72} size={72} label={t('Competence', 'দক্ষতা', 'क्षमता', 'Năng lực')} /><span className="text-subtle">{t('What you can do', 'আপনি কী পারেন', 'आप क्या कर सकते हैं', 'Bạn làm được gì')}</span></span>
            <span className="row" style={{ '--gap': 'var(--s-2)' }}><ProgressRing value={conf ?? 0} size={72} tone="warm" label={t('Confidence', 'আত্মবিশ্বাস', 'भरोसा', 'Tự tin')}>{conf == null ? '—' : undefined}</ProgressRing><span className="text-subtle">{t('How comfortable you feel', 'কতটা স্বচ্ছন্দ', 'कितना सहज', 'Thoải mái thế nào')}</span></span>
          </div>
        </div>
        <JourneyDemo />
      </div>
    </DemoStep>
  );
}

const STEPS = [
  { id: 'problem', label: ['The problem', 'সমস্যা', 'समस्या', 'Vấn đề'] },
  { id: 'meet', label: ['Meet Guidia', 'পরিচয়', 'परिचय', 'Gặp Guidia'] },
  { id: 'understand', label: ['Understand', 'বুঝুন', 'समझें', 'Hiểu'] },
  { id: 'practise', label: ['Practise', 'অনুশীলন', 'अभ्यास', 'Luyện tập'] },
  { id: 'protect', label: ['Protect', 'সুরক্ষা', 'सुरक्षा', 'Bảo vệ'] },
  { id: 'learn', label: ['Learn & remember', 'শিখুন ও মনে রাখুন', 'सीखें और याद रखें', 'Học & ghi nhớ'] },
  { id: 'support', label: ['Human support', 'মানুষের সহায়তা', 'मानवीय सहायता', 'Hỗ trợ con người'] },
  { id: 'scale', label: ['Why Guidia scales', 'কেন বড় হতে পারে', 'क्यों बढ़ सकता है', 'Vì sao mở rộng được'] },
  { id: 'final', label: ['Guidia', 'Guidia', 'Guidia', 'Guidia'] },
];

function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return { elapsed, running, start: () => setRunning(true), toggle: () => setRunning((r) => !r), reset: () => { setRunning(false); setElapsed(0); } };
}

export default function Showcase() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0);
  const [keysOpen, setKeysOpen] = useState(false);
  const timer = useTimer();
  const stageRef = useRef(null);

  const go = useCallback((n) => {
    setStep((cur) => {
      const next = Math.max(0, Math.min(STEPS.length - 1, typeof n === 'function' ? n(cur) : n));
      return next;
    });
  }, []);
  const restart = useCallback(() => setReplay((r) => r + 1), []);

  useEffect(() => { stageRef.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }, [step]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target.isContentEditable;
      if (typing) return;
      if (e.key === 'Escape') { setKeysOpen(false); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); go((s) => s + 1); timer.start(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go((s) => s - 1); }
      else if (e.key === ' ' && !['BUTTON', 'A'].includes(tag)) { e.preventDefault(); go((s) => s + 1); timer.start(); }
      else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) restart();
      else if (e.key === '?') setKeysOpen((o) => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, restart, timer]);

  const mm = String(Math.floor(timer.elapsed / 60)).padStart(2, '0');
  const ss = String(timer.elapsed % 60).padStart(2, '0');
  const current = STEPS[step];

  return (
    <div className="showcase" data-gx-theme="light">
      <header className="sc-top">
        <span className="row" style={{ '--gap': 'var(--s-3)' }}>
          <GuidiaMark size={36} title="" />
          <span className="guidia-wordmark" style={{ fontSize: '1.4rem' }}>Guidia</span>
          <ModeLabel kind="demo" icon={Sparkles}>{t('Guided demo', 'নির্দেশিত ডেমো', 'निर्देशित डेमो', 'Bản demo')}</ModeLabel>
        </span>
        <span className="sc-top-title hide-md">{String(step + 1).padStart(2, '0')} · {t(...current.label)}</span>
        <span className="row" style={{ '--gap': 'var(--s-2)' }}>
          <span className="sc-timer" aria-label={t('Presentation time', 'উপস্থাপনার সময়', 'प्रस्तुति समय', 'Thời gian trình bày')}>
            <span className="num" aria-live="off">{mm}:{ss}</span>
            <IconButton icon={timer.running ? Pause : Play} size="sm" label={timer.running ? t('Pause timer', 'টাইমার থামান', 'टाइमर रोकें', 'Dừng đồng hồ') : t('Start timer', 'টাইমার চালু', 'टाइमर चालू', 'Bắt đầu đồng hồ')} onClick={timer.toggle} />
            <IconButton icon={TimerReset} size="sm" label={t('Reset timer', 'টাইমার রিসেট', 'टाइमर रीसेट', 'Đặt lại đồng hồ')} onClick={timer.reset} />
          </span>
          <LanguagePicker className="hide-sm" />
          <IconButton icon={Keyboard} size="sm" label={t('Keyboard shortcuts', 'কিবোর্ড শর্টকাট', 'कीबोर्ड शॉर्टकट', 'Phím tắt')} onClick={() => setKeysOpen((o) => !o)} aria-expanded={keysOpen} />
          <IconButton icon={X} size="sm" label={t('Exit showcase', 'প্রদর্শনী থেকে বের হন', 'प्रदर्शन से बाहर', 'Thoát trình diễn')} onClick={() => navigate('/landing')} />
        </span>
      </header>

      {keysOpen && (
        <div className="sc-keys fade" role="dialog" aria-label={t('Keyboard shortcuts', 'কিবোর্ড শর্টকাট', 'कीबोर्ड शॉर्टकट', 'Phím tắt')}>
          <p><span className="kbd">←</span> <span className="kbd">→</span> {t('Previous / next', 'আগের / পরের', 'पिछला / अगला', 'Trước / sau')}</p>
          <p><span className="kbd">Space</span> {t('Next', 'পরের', 'अगला', 'Tiếp')}</p>
          <p><span className="kbd">R</span> {t('Restart this step', 'এই ধাপ আবার', 'यह चरण फिर से', 'Làm lại bước này')}</p>
          <p><span className="kbd">Esc</span> {t('Close this panel', 'প্যানেল বন্ধ', 'पैनल बंद', 'Đóng bảng')}</p>
        </div>
      )}

      <main className="sc-stage" ref={stageRef} tabIndex={-1} aria-live="polite" aria-label={t(...current.label)}>
        <div key={`${step}-${replay}`} className="sc-slide route-enter">
          {current.id === 'problem' && <ProblemStep t={t} />}
          {current.id === 'meet' && <MeetStep t={t} />}
          {current.id === 'understand' && (
            <DemoStep n={3} t={t} eyebrow={['Understand', 'বুঝুন', 'समझें', 'Hiểu']}
              title={['A confusing screen becomes a clear next step.', 'বিভ্রান্তিকর স্ক্রিন হয়ে ওঠে স্পষ্ট পরের ধাপ।', 'उलझन भरी स्क्रीन साफ़ अगला कदम बनती है।', 'Màn hình khó hiểu trở thành bước tiếp theo rõ ràng.']}
              body={['Guidia reads the screenshot, numbers what matters and explains the risk — in the user’s language.', 'Guidia স্ক্রিনশট পড়ে, জরুরি অংশে নম্বর দেয় এবং ঝুঁকি বোঝায় — ব্যবহারকারীর ভাষায়।', 'Guidia स्क्रीनशॉट पढ़ता है, ज़रूरी हिस्सों पर नंबर देता है और जोखिम समझाता है — उपयोगकर्ता की भाषा में।', 'Guidia đọc ảnh màn hình, đánh số điều quan trọng và giải thích rủi ro — bằng ngôn ngữ của người dùng.']}>
              <ScreenDemo />
            </DemoStep>
          )}
          {current.id === 'practise' && (
            <DemoStep n={4} t={t} eyebrow={['Practise', 'অনুশীলন', 'अभ्यास', 'Luyện tập']}
              title={['Rehearse real tasks where mistakes cost nothing.', 'আসল কাজের মহড়া, যেখানে ভুলের দাম নেই।', 'असली कामों का अभ्यास, जहाँ गलती का कोई नुकसान नहीं।', 'Tập dượt việc thật, nơi sai lầm không tốn gì.']}
              body={['Every sensitive step gets a calm checkpoint: who, how much, why — and a trusted person for larger amounts.', 'প্রতিটি সংবেদনশীল ধাপে শান্ত যাচাই: কাকে, কত, কেন — বড় অঙ্কে বিশ্বস্ত মানুষ।', 'हर संवेदनशील कदम पर शांत जांच: किसे, कितना, क्यों — बड़ी रकम पर भरोसेमंद व्यक्ति।', 'Mỗi bước nhạy cảm có điểm kiểm tra: ai, bao nhiêu, vì sao — và người tin cậy cho số tiền lớn.']}>
              <PracticeDemo />
            </DemoStep>
          )}
          {current.id === 'protect' && (
            <DemoStep n={5} t={t} eyebrow={['Protect', 'সুরক্ষা', 'सुरक्षा', 'Bảo vệ']}
              title={['Pause, verify, respond — before money moves.', 'থামুন, যাচাই করুন, সাড়া দিন — টাকা যাওয়ার আগে।', 'रुकें, जांचें, जवाब दें — पैसा जाने से पहले।', 'Dừng, kiểm tra, phản hồi — trước khi tiền đi.']}
              body={['Deterministic safety rules set the floor; AI can only raise a warning, never lower it.', 'নির্দিষ্ট নিরাপত্তা নিয়ম ভিত্তি ঠিক করে; এআই শুধু সতর্কতা বাড়াতে পারে, কমাতে নয়।', 'तय सुरक्षा नियम आधार तय करते हैं; AI सिर्फ़ चेतावनी बढ़ा सकता है, घटा नहीं।', 'Quy tắc an toàn cố định đặt nền; AI chỉ nâng, không hạ cảnh báo.']}>
              <ScamDemo />
            </DemoStep>
          )}
          {current.id === 'learn' && <LearnStep t={t} />}
          {current.id === 'support' && <SupportStep t={t} />}
          {current.id === 'scale' && <ScaleStep t={t} />}
          {current.id === 'final' && <FinalStep t={t} />}
        </div>
      </main>

      <footer className="sc-bottom">
        <Button variant="quiet" icon={ArrowLeft} onClick={() => go(step - 1)} disabled={step === 0}>{t('Previous', 'আগের', 'पिछला', 'Trước')}</Button>
        <nav className="sc-steps" aria-label={t('Showcase steps', 'প্রদর্শনীর ধাপ', 'प्रदर्शन के चरण', 'Các bước trình diễn')}>
          {STEPS.map((s, i) => (
            <button key={s.id} type="button" className="sc-step" aria-current={i === step ? 'step' : undefined} data-done={i < step} onClick={() => go(i)} title={t(...s.label)}>
              <span className="sr-only">{t(...s.label)}</span>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </nav>
        <span className="row" style={{ '--gap': 'var(--s-2)' }}>
          <IconButton icon={RotateCcw} variant="quiet" label={t('Replay this step', 'এই ধাপ আবার', 'यह चरण फिर से', 'Phát lại bước này')} onClick={restart} />
          {step === 0 && !timer.running && timer.elapsed === 0 ? (
            <Button icon={Play} onClick={() => { timer.start(); go(1); }}>{t('Start demo', 'ডেমো শুরু', 'डेमो शुरू', 'Bắt đầu demo')}</Button>
          ) : step < STEPS.length - 1 ? (
            <Button arrow onClick={() => go(step + 1)}>{t('Next', 'পরের', 'अगला', 'Tiếp')}</Button>
          ) : (
            <Button icon={Sparkles} to="/register">{t('Get started', 'শুরু করুন', 'शुरू करें', 'Bắt đầu')}</Button>
          )}
        </span>
        <div className="sc-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
      </footer>
    </div>
  );
}
