import { useState } from 'react';
import { BookOpen, HeartHandshake, MessageCircle, PlayCircle, ScanSearch, ShieldCheck, Hand, Sparkles, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoice } from '../../context/VoiceContext';
import { getLanguage } from '../../config/languages';
import { usePreferences } from '../../context/PreferencesContext';
import { LANGUAGES } from '../../config/languages';
import { SIMULATORS } from '../sims/registry';
import { Button } from '../ui';
import ProductWalkthrough from './ProductWalkthrough';
import portrait560 from '../../assets/hero-portrait-560.webp';
import portrait900 from '../../assets/hero-portrait-900.webp';

const GUIDANCE = {
  calm: ['Comfortable pace', 'স্বচ্ছন্দ গতি', 'आरामदायक गति', 'Nhịp thoải mái'],
  unsure: ['A little more help', 'একটু বেশি সাহায্য', 'थोड़ी ज़्यादा मदद', 'Thêm chút trợ giúp'],
  scared: ['Very gentle, step by step', 'খুব ধীরে, এক এক ধাপে', 'बहुत सहज, एक-एक कदम', 'Rất nhẹ nhàng, từng bước'],
};

// What the visitor chose in the welcome setup, with a way to change it.
function PersonalBar({ t, language, mode, prefs, onListen }) {
  return (
    <div className="lp-personal rise" role="group" aria-label={t('Set up for you', 'আপনার জন্য সাজানো', 'आपके लिए सजाया गया', 'Thiết lập cho bạn')}>
      <span className="lp-personal-title"><Sparkles aria-hidden="true" />{t('Set up for you', 'আপনার জন্য সাজানো', 'आपके लिए सजाया गया', 'Thiết lập cho bạn')}</span>
      <span className="lp-personal-chip">{getLanguage(language).nativeName}</span>
      <span className="lp-personal-chip">{t(...(GUIDANCE[mode] || GUIDANCE.calm))}</span>
      <span className="lp-personal-chip num">{t(`Text ${prefs.fontSize}px`, `লেখা ${prefs.fontSize}px`, `अक्षर ${prefs.fontSize}px`, `Chữ ${prefs.fontSize}px`)}</span>
      <span className="lp-personal-chip">{prefs.voiceEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}{prefs.voiceEnabled ? t('Voice on', 'ভয়েস চালু', 'आवाज़ चालू', 'Bật giọng nói') : t('Voice off', 'ভয়েস বন্ধ', 'आवाज़ बंद', 'Tắt giọng nói')}</span>
      {prefs.voiceEnabled && <button type="button" className="lp-personal-action" onClick={onListen}><Volume2 aria-hidden="true" />{t('Read this page to me', 'পেজটি পড়ে শোনান', 'यह पेज पढ़कर सुनाएं', 'Đọc trang này cho tôi')}</button>}
      <Link className="lp-personal-action" to="/welcome"><SlidersHorizontal aria-hidden="true" />{t('Change', 'বদলান', 'बदलें', 'Thay đổi')}</Link>
    </div>
  );
}

export default function LandingHero() {
  const { t, language, mode, prefs } = usePreferences();
  const { speak } = useVoice();
  const [walk, setWalk] = useState(null);
  const appCount = Object.keys(SIMULATORS).length;

  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-container lp-hero-grid">
        <div className="lp-hero-copy rise">
          <PersonalBar t={t} language={language} mode={mode} prefs={prefs} onListen={() => speak([
            t('Technology should feel understandable.', 'প্রযুক্তি বোঝা সহজ হওয়া উচিত।', 'तकनीक समझ में आने वाली होनी चाहिए।', 'Công nghệ nên dễ hiểu.'),
            t('Guidia helps you learn your apps step by step, practise safely with pretend money, understand confusing screens, spot scams, and call your family when you need help.', 'Guidia আপনাকে ধাপে ধাপে অ্যাপ শিখতে, নকল টাকায় নিরাপদে অনুশীলন করতে, কঠিন স্ক্রিন বুঝতে, প্রতারণা চিনতে, আর দরকারে পরিবারকে ডাকতে সাহায্য করে।', 'Guidia आपको एक-एक कदम में ऐप सीखने, नकली पैसों से सुरक्षित अभ्यास करने, उलझी स्क्रीन समझने, धोखा पहचानने, और ज़रूरत पर परिवार को बुलाने में मदद करता है।', 'Guidia giúp bạn học ứng dụng từng bước, luyện tập an toàn với tiền giả, hiểu màn hình khó, nhận ra lừa đảo và gọi gia đình khi cần giúp.'),
            t('Press Get started to begin.', 'শুরু করতে "শুরু করুন" চাপুন।', 'शुरू करने के लिए "शुरू करें" दबाएं।', 'Bấm Bắt đầu để bắt đầu.'),
          ].join(' '))} />
          <h1 id="lp-hero-title" className="lp-display">{t('Technology should feel understandable.', 'প্রযুক্তি বোঝা সহজ হওয়া উচিত।', 'तकनीक समझ में आने वाली होनी चाहिए।', 'Công nghệ nên dễ hiểu.')}</h1>
          {mode === 'scared' && <p className="lp-reassure">{t('Take your time. Nothing here can break, and nothing costs money.', 'সময় নিন। এখানে কিছুই নষ্ট হবে না, আর কোনো টাকাও লাগবে না।', 'आराम से। यहाँ कुछ खराब नहीं होगा, और कोई पैसा नहीं लगेगा।', 'Cứ từ từ. Ở đây không có gì hỏng được, và không tốn tiền.')}</p>}
          <p className="lp-lead">{t('Guidia helps older adults learn, practise, understand confusing screens, stay safer online, remember what they learn, and ask for help when needed.', 'Guidia প্রবীণদের শিখতে, অনুশীলন করতে, বিভ্রান্তিকর স্ক্রিন বুঝতে, অনলাইনে নিরাপদ থাকতে, শেখা মনে রাখতে এবং দরকারে সাহায্য চাইতে সাহায্য করে।', 'Guidia बुज़ुर्गों को सीखने, अभ्यास करने, उलझन भरी स्क्रीन समझने, ऑनलाइन सुरक्षित रहने, सीखा हुआ याद रखने और ज़रूरत पर मदद मांगने में मदद करता है।', 'Guidia giúp người lớn tuổi học, luyện tập, hiểu màn hình khó hiểu, an toàn hơn trên mạng, nhớ điều đã học và nhờ giúp khi cần.')}</p>
          <div className="lp-hero-ctas">
            <Button size="lg" arrow to="/register">{t('Get started', 'শুরু করুন', 'शुरू करें', 'Bắt đầu')}</Button>
            <Button size="lg" variant="secondary" icon={PlayCircle} onClick={() => setWalk('ask')}>{t('See Guidia in action', 'Guidia কাজ করতে দেখুন', 'Guidia को काम करते देखें', 'Xem Guidia hoạt động')}</Button>
          </div>
          <ul className="lp-trust-line" aria-label={t('What Guidia does', 'Guidia যা করে', 'Guidia क्या करता है', 'Guidia làm gì')}>
            <li><BookOpen aria-hidden="true" />{t('Learn', 'শিখুন', 'सीखें', 'Học')}</li>
            <li><Hand aria-hidden="true" />{t('Practise', 'অনুশীলন', 'अभ्यास', 'Luyện tập')}</li>
            <li><ShieldCheck aria-hidden="true" />{t('Stay safe', 'নিরাপদ থাকুন', 'सुरक्षित रहें', 'An toàn')}</li>
            <li><HeartHandshake aria-hidden="true" />{t('Ask for help', 'সাহায্য চান', 'मदद मांगें', 'Nhờ giúp đỡ')}</li>
          </ul>
        </div>

        <div className="lp-hero-visual">
          <svg className="lp-hero-arcs" viewBox="0 0 400 400" aria-hidden="true">
            <path d="M120 320 C 30 210, 110 70, 270 70 C 270 200, 216 296, 120 320 Z" fill="var(--brand-100)" />
            <path d="M288 88 C 376 200, 288 336, 128 336 C 128 216, 184 120, 288 88 Z" fill="var(--coral-100)" opacity="0.85" />
          </svg>
          <div className="lp-portrait">
            <img src={portrait900} srcSet={`${portrait560} 560w, ${portrait900} 900w`} sizes="(max-width: 900px) 80vw, 460px" width="900" height="1124"
              alt={t('An older man smiling as he uses his phone', 'ফোন ব্যবহার করতে করতে হাসছেন এক বয়স্ক মানুষ', 'फोन इस्तेमाल करते हुए मुस्कुराते एक बुज़ुर्ग', 'Một người lớn tuổi mỉm cười khi dùng điện thoại')} fetchPriority="high" />
          </div>
          <div className="lp-float-panel" role="group" aria-label={t('Guidia home preview', 'Guidia হোমের নমুনা', 'Guidia होम की झलक', 'Xem trước trang chủ Guidia')}>
            <p className="lp-float-q">{t('What would you like to do?', 'আপনি কী করতে চান?', 'आप क्या करना चाहेंगे?', 'Bạn muốn làm gì?')}</p>
            <button type="button" onClick={() => setWalk('remember')}><BookOpen aria-hidden="true" />{t('Learn something', 'কিছু শিখুন', 'कुछ सीखें', 'Học điều mới')}</button>
            <button type="button" onClick={() => setWalk('ask')}><MessageCircle aria-hidden="true" />{t('Ask Guidia', 'Guidia-কে জিজ্ঞাসা', 'Guidia से पूछें', 'Hỏi Guidia')}</button>
            <button type="button" onClick={() => setWalk('see')}><ScanSearch aria-hidden="true" />{t('Understand my screen', 'আমার স্ক্রিন বুঝুন', 'मेरी स्क्रीन समझें', 'Hiểu màn hình của tôi')}</button>
          </div>
          <div className="lp-float-badge" aria-hidden="true"><ShieldCheck />{t('Practice mode · safe', 'অনুশীলন মোড · নিরাপদ', 'अभ्यास मोड · सुरक्षित', 'Luyện tập · an toàn')}</div>
        </div>
      </div>

      <div className="lp-container">
        <ul className="lp-proof" aria-label={t('Guidia at a glance', 'এক নজরে Guidia', 'एक नज़र में Guidia', 'Guidia trong nháy mắt')}>
          <li><strong>{LANGUAGES.length}</strong>{t('languages', 'ভাষা', 'भाषाएं', 'ngôn ngữ')}</li>
          <li><strong>{appCount}</strong>{t('practice apps', 'অনুশীলন অ্যাপ', 'अभ्यास ऐप', 'ứng dụng luyện tập')}</li>
          <li><Sparkles aria-hidden="true" />{t('AI guidance', 'এআই নির্দেশনা', 'AI मार्गदर्शन', 'Hướng dẫn AI')}</li>
          <li><ScanSearch aria-hidden="true" />{t('Screen understanding', 'স্ক্রিন বোঝা', 'स्क्रीन समझ', 'Hiểu màn hình')}</li>
          <li><ShieldCheck aria-hidden="true" />{t('Safety intelligence', 'নিরাপত্তা বুদ্ধিমত্তা', 'सुरक्षा समझ', 'An toàn thông minh')}</li>
          <li><HeartHandshake aria-hidden="true" />{t('Trusted people', 'বিশ্বস্ত মানুষ', 'भरोसेमंद लोग', 'Người tin cậy')}</li>
        </ul>
      </div>

      <ProductWalkthrough key={walk || 'closed'} open={Boolean(walk)} initial={walk || 'ask'} onClose={() => setWalk(null)} />
    </section>
  );
}
