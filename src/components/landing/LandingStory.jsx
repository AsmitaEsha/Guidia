import { useState } from 'react';
import {
  Bot, BookMarked, BookOpen, Brain, CalendarCheck, CreditCard, Eye, Hand, HeartHandshake, Layers, Lock, MessageCircle,
  Newspaper, PlayCircle, ShieldAlert, ShieldCheck, ShoppingBag, Sparkles, Users, Wand2,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Button } from '../ui';
import { GuidiaMark } from '../GuidiaLogo';

export function TrustStatement() {
  const { t } = usePreferences();
  return (
    <section className="lp-statement" aria-labelledby="lp-statement-h">
      <svg className="lp-statement-arcs" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M760 -30 C 900 50, 1060 70, 1240 30" fill="none" stroke="var(--brand-100)" strokeWidth="26" strokeLinecap="round" />
        <path d="M-40 430 C 160 370, 360 372, 560 430" fill="none" stroke="var(--coral-100)" strokeWidth="22" strokeLinecap="round" />
      </svg>
      <div className="lp-container lp-statement-inner">
        <h2 id="lp-statement-h" className="lp-display-2">{t('Confidence grows when technology meets people where they are.', 'প্রযুক্তি যখন মানুষের কাছে তাদের মতো করে আসে, তখনই আত্মবিশ্বাস বাড়ে।', 'जब तकनीक लोगों के पास उनके हिसाब से आती है, तभी भरोसा बढ़ता है।', 'Sự tự tin lớn lên khi công nghệ đến với con người theo cách của họ.')}</h2>
        <p className="lp-lead">{t('Guidia adapts its pace, language, presentation and support around each person — never the other way round.', 'Guidia প্রতিটি মানুষের মতো করে গতি, ভাষা, উপস্থাপনা ও সহায়তা বদলায় — উল্টোটা কখনো নয়।', 'Guidia हर व्यक्ति के हिसाब से गति, भाषा, प्रस्तुति और सहायता बदलता है — उल्टा कभी नहीं।', 'Guidia điều chỉnh nhịp độ, ngôn ngữ, cách trình bày và hỗ trợ theo từng người — không bao giờ ngược lại.')}</p>
      </div>
    </section>
  );
}

const PHASES = [
  { icon: BookOpen, title: ['Understand', 'বুঝুন', 'समझें', 'Hiểu'], body: ['Short lessons and plain-language answers explain what a button does and why.', 'ছোট পাঠ ও সহজ ভাষার উত্তরে বোঝানো হয় কোন বোতাম কী করে আর কেন।', 'छोटे पाठ और आसान जवाब बताते हैं कि बटन क्या करता है और क्यों।', 'Bài học ngắn và câu trả lời dễ hiểu giải thích nút làm gì và vì sao.'], preview: ['“Tap the paperclip, then choose the photo.”', '“পেপারক্লিপে চাপুন, তারপর ছবি বেছে নিন।”', '“पेपरक्लिप दबाएं, फिर फोटो चुनें।”', '“Chạm kẹp giấy, rồi chọn ảnh.”'] },
  { icon: Hand, title: ['Practise', 'অনুশীলন', 'अभ्यास', 'Luyện tập'], body: ['Real-looking practice apps with pretend money — mistakes are welcome.', 'নকল টাকা দিয়ে আসলের মতো অনুশীলন অ্যাপ — ভুল করাও ঠিক আছে।', 'नकली पैसों वाले असली जैसे अभ्यास ऐप — गलती करना ठीक है।', 'Ứng dụng luyện tập giống thật với tiền giả — sai cũng không sao.'], preview: ['Practice mode · no real money moves', 'অনুশীলন মোড · আসল টাকা যায় না', 'अभ्यास मोड · असली पैसा नहीं जाता', 'Chế độ luyện tập · không chuyển tiền thật'] },
  { icon: Sparkles, title: ['Use', 'ব্যবহার করুন', 'इस्तेमाल करें', 'Sử dụng'], body: ['When it is time for the real app, Guidia stays beside you, one step at a time.', 'আসল অ্যাপ ব্যবহারের সময়ও Guidia পাশে থাকে, এক এক ধাপে।', 'असली ऐप के समय भी Guidia साथ रहता है, एक-एक कदम।', 'Khi dùng ứng dụng thật, Guidia vẫn ở bên, từng bước một.'], preview: ['Step 2 of 4 · Listen · Hint', 'ধাপ ২/৪ · শুনুন · ইঙ্গিত', 'चरण 2/4 · सुनें · संकेत', 'Bước 2/4 · Nghe · Gợi ý'] },
  { icon: BookMarked, title: ['Remember', 'মনে রাখুন', 'याद रखें', 'Ghi nhớ'], body: ['Everything you learn is kept in your Memory Book, with gentle reviews.', 'যা শেখেন সব স্মৃতির খাতায় থাকে, সাথে নরম ঝালিয়ে নেওয়া।', 'जो सीखते हैं सब याद की किताब में रहता है, हल्के दोहराव के साथ।', 'Mọi điều bạn học được giữ trong Sổ ghi nhớ, kèm ôn tập nhẹ nhàng.'], preview: ['Saved to your Memory Book · Listen again', 'স্মৃতির খাতায় রাখা · আবার শুনুন', 'याद की किताब में सहेजा · फिर सुनें', 'Đã lưu vào Sổ ghi nhớ · Nghe lại'] },
  { icon: ShieldCheck, title: ['Stay safe', 'নিরাপদ থাকুন', 'सुरक्षित रहें', 'An toàn'], body: ['Guidia checks risky messages and sensitive actions before anything happens.', 'কিছু হওয়ার আগেই Guidia ঝুঁকিপূর্ণ মেসেজ ও সংবেদনশীল কাজ যাচাই করে।', 'कुछ होने से पहले Guidia खतरनाक संदेश और संवेदनशील काम जांचता है।', 'Guidia kiểm tra tin rủi ro và việc nhạy cảm trước khi có chuyện.'], preview: ['Stop — very risky · Here is why', 'থামুন — খুব ঝুঁকিপূর্ণ · কারণ দেখুন', 'रुकें — बहुत खतरनाक · कारण देखें', 'Dừng lại — rất nguy hiểm · Vì sao'] },
  { icon: HeartHandshake, title: ['Get help', 'সাহায্য নিন', 'मदद लें', 'Nhờ giúp đỡ'], body: ['One tap reaches someone you trust — and you choose what they can see.', 'এক চাপেই বিশ্বস্ত কেউ জানতে পারেন — আর তাঁরা কী দেখবেন আপনিই ঠিক করেন।', 'एक टैप में भरोसेमंद व्यक्ति तक पहुँचें — और आप तय करें वे क्या देखें।', 'Một chạm là người tin cậy biết — và bạn chọn họ được thấy gì.'], preview: ['Request sent · Rupa has seen it', 'অনুরোধ পাঠানো হয়েছে · রূপা দেখেছেন', 'अनुरोध भेजा · रूपा ने देख लिया', 'Đã gửi · Rupa đã thấy'] },
];

export function HowItWorks() {
  const { t } = usePreferences();
  const [active, setActive] = useState(0);
  const P = PHASES[active];
  return (
    <section className="lp-section" id="how" aria-labelledby="lp-how-h">
      <div className="lp-container">
        <div className="lp-section-head">
          <p className="eyebrow">{t('How Guidia works', 'Guidia কীভাবে কাজ করে', 'Guidia कैसे काम करता है', 'Guidia hoạt động thế nào')}</p>
          <h2 id="lp-how-h" className="lp-display-2">{t('One small step, then the next.', 'একটি ছোট ধাপ, তারপর পরেরটি।', 'एक छोटा कदम, फिर अगला।', 'Một bước nhỏ, rồi bước tiếp theo.')}</h2>
        </div>
        <div className="lp-journey">
          <ol className="lp-rail">
            {PHASES.map((p, i) => (
              <li key={i}>
                <button type="button" className="lp-rail-item" aria-expanded={active === i} onClick={() => setActive(i)}>
                  <span className="lp-rail-num">{String(i + 1).padStart(2, '0')}</span>
                  <p.icon aria-hidden="true" />
                  <span className="lp-rail-title">{t(...p.title)}</span>
                </button>
                {active === i && <p className="lp-rail-body fade">{t(...p.body)}</p>}
              </li>
            ))}
          </ol>
          <div className="lp-journey-preview" aria-live="polite">
            <div key={active} className="lp-preview-card step-in">
              <span className="lp-preview-icon" aria-hidden="true"><P.icon /></span>
              <p className="lp-preview-num">{String(active + 1).padStart(2, '0')} · {t(...P.title)}</p>
              <p className="lp-preview-body">{t(...P.body)}</p>
              <div className="lp-preview-ui"><GuidiaMark size={22} title="" /><span>{t(...P.preview)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const LIFE = [
  [MessageCircle, ['Messaging', 'মেসেজিং', 'मैसेजिंग', 'Nhắn tin']],
  [CreditCard, ['Online payments', 'অনলাইন পেমেন্ট', 'ऑनलाइन भुगतान', 'Thanh toán trực tuyến']],
  [Users, ['Social media', 'সোশ্যাল মিডিয়া', 'सोशल मीडिया', 'Mạng xã hội']],
  [Newspaper, ['News & forwards', 'খবর ও ফরোয়ার্ড', 'खबरें और फॉरवर्ड', 'Tin tức & chuyển tiếp']],
  [Lock, ['Privacy', 'গোপনীয়তা', 'निजता', 'Quyền riêng tư']],
  [Bot, ['AI', 'এআই', 'AI', 'AI']],
  [ShieldAlert, ['Scams', 'প্রতারণা', 'धोखाधड़ी', 'Lừa đảo']],
  [CalendarCheck, ['Appointments', 'অ্যাপয়েন্টমেন্ট', 'अपॉइंटमेंट', 'Đặt lịch hẹn']],
  [ShoppingBag, ['Shopping', 'কেনাকাটা', 'खरीदारी', 'Mua sắm']],
];

export function LiteracySection() {
  const { t } = usePreferences();
  return (
    <section className="lp-section lp-tint" id="helps" aria-labelledby="lp-life-h">
      <div className="lp-container">
        <div className="lp-section-head is-center">
          <p className="eyebrow">{t('Social-digital literacy', 'সামাজিক-ডিজিটাল সাক্ষরতা', 'सामाजिक-डिजिटल साक्षरता', 'Hiểu biết số và xã hội')}</p>
          <h2 id="lp-life-h" className="lp-display-2">{t('Living in the digital world', 'ডিজিটাল দুনিয়ায় বেঁচে থাকা', 'डिजिटल दुनिया में जीना', 'Sống trong thế giới số')}</h2>
          <p className="lp-lead">{t('Not just how to press buttons — how to stay connected, informed and safe across everyday life.', 'শুধু বোতাম চাপা নয় — প্রতিদিনের জীবনে যুক্ত, অবগত ও নিরাপদ থাকা।', 'सिर्फ़ बटन दबाना नहीं — रोज़ की ज़िंदगी में जुड़े, जानकार और सुरक्षित रहना।', 'Không chỉ là bấm nút — mà là giữ kết nối, hiểu biết và an toàn trong cuộc sống hằng ngày.')}</p>
        </div>
        <div className="lp-ecosystem">
          <div className="lp-eco-center" aria-hidden="true"><GuidiaMark size={56} title="" /><span>{t('You', 'আপনি', 'आप', 'Bạn')}</span></div>
          <ul className="lp-eco-grid">
            {LIFE.map(([Icon, label], i) => (
              <li key={i} className="lp-eco-item rise" style={{ '--i': i }}><Icon aria-hidden="true" /><span>{t(...label)}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const MOAT = [
  [Brain, ['AI guidance', 'এআই নির্দেশনা', 'AI मार्गदर्शन', 'Hướng dẫn AI'], ['Grounded in reviewed lessons, honest when unsure.', 'যাচাই করা পাঠের ভিত্তিতে, নিশ্চিত না হলে সৎভাবে বলে।', 'जाँचे गए पाठों पर आधारित, पक्का न हो तो साफ़ बताता है।', 'Dựa trên bài học đã kiểm duyệt, thành thật khi chưa chắc.']],
  [Eye, ['Multimodal understanding', 'বহুমাত্রিক বোঝাপড়া', 'बहु-माध्यम समझ', 'Hiểu đa phương thức'], ['Text, voice and screenshots in four languages.', 'চার ভাষায় লেখা, কণ্ঠ ও স্ক্রিনশট।', 'चार भाषाओं में लेख, आवाज़ और स्क्रीनशॉट।', 'Chữ, giọng nói và ảnh màn hình bằng bốn ngôn ngữ.']],
  [Hand, ['Safe practice', 'নিরাপদ অনুশীলন', 'सुरक्षित अभ्यास', 'Luyện tập an toàn'], ['Realistic simulators where mistakes cost nothing.', 'বাস্তবসম্মত সিমুলেটর যেখানে ভুলের কোনো দাম নেই।', 'असली जैसे सिम्युलेटर जहाँ गलती का कोई नुकसान नहीं।', 'Mô phỏng giống thật, sai không tốn gì.']],
  [Wand2, ['Adaptive learning', 'মানিয়ে নেওয়া শেখা', 'अनुकूल सीखना', 'Học thích ứng'], ['Pace, spacing and choices adapt to how you feel.', 'আপনার অনুভূতি অনুযায়ী গতি, জায়গা ও বিকল্প বদলায়।', 'आपकी भावना के हिसाब से गति, जगह और विकल्प बदलते हैं।', 'Nhịp độ, khoảng cách và lựa chọn thích ứng theo bạn.']],
  [ShieldCheck, ['Safety intelligence', 'নিরাপত্তা বুদ্ধিমত্তা', 'सुरक्षा समझ', 'An toàn thông minh'], ['Deterministic rules first; AI can raise, never lower, a warning.', 'আগে নির্দিষ্ট নিয়ম; এআই সতর্কতা বাড়াতে পারে, কমাতে নয়।', 'पहले तय नियम; AI चेतावनी बढ़ा सकता है, घटा नहीं।', 'Quy tắc cố định trước; AI chỉ có thể nâng, không hạ cảnh báo.']],
  [HeartHandshake, ['Trusted human support', 'বিশ্বস্ত মানুষের সহায়তা', 'भरोसेमंद मानवीय सहायता', 'Hỗ trợ từ người tin cậy'], ['Family helps with permission — support without surveillance.', 'অনুমতি নিয়ে পরিবার সাহায্য করে — নজরদারি ছাড়া।', 'अनुमति से परिवार मदद करता है — निगरानी नहीं।', 'Gia đình giúp khi được cho phép — hỗ trợ, không giám sát.']],
  [BookMarked, ['Persistent memory', 'স্থায়ী স্মৃতি', 'स्थायी याद', 'Ghi nhớ lâu dài'], ['Skills, confidence and reviews that last.', 'দক্ষতা, আত্মবিশ্বাস ও ঝালিয়ে নেওয়া যা টিকে থাকে।', 'कौशल, भरोसा और दोहराव जो टिके रहते हैं।', 'Kỹ năng, sự tự tin và ôn tập bền lâu.']],
];

export function MoatSection() {
  const { t } = usePreferences();
  return (
    <section className="lp-section" aria-labelledby="lp-moat-h">
      <div className="lp-container lp-moat">
        <div className="lp-section-head">
          <p className="eyebrow"><Layers size={16} aria-hidden="true" /> {t('What makes Guidia different', 'Guidia কেন আলাদা', 'Guidia अलग क्यों है', 'Điều làm Guidia khác biệt')}</p>
          <h2 id="lp-moat-h" className="lp-display-2">{t('Seven layers working together, so the person never has to.', 'সাতটি স্তর একসাথে কাজ করে, যাতে মানুষটিকে তা না করতে হয়।', 'सात परतें मिलकर काम करती हैं, ताकि व्यक्ति को न करना पड़े।', 'Bảy lớp cùng hoạt động, để người dùng không phải lo.')}</h2>
        </div>
        <ol className="lp-layers">
          {MOAT.map(([Icon, title, body], i) => (
            <li key={i} className="lp-layer rise" style={{ '--i': i, '--depth': i }}>
              <span className="lp-layer-icon" aria-hidden="true"><Icon /></span>
              <span className="stack" style={{ '--gap': '2px' }}><span className="h-card">{t(...title)}</span><span className="text-muted">{t(...body)}</span></span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FinalCTA() {
  const { t } = usePreferences();
  return (
    <section className="lp-final" aria-labelledby="lp-final-h">
      <div className="lp-container lp-final-inner">
        <GuidiaMark size={64} title="" tile />
        <h2 id="lp-final-h" className="lp-display-2">{t('Your digital life should feel like yours.', 'আপনার ডিজিটাল জীবন আপনার নিজের মনে হওয়া উচিত।', 'आपकी डिजिटल ज़िंदगी आपकी अपनी लगनी चाहिए।', 'Cuộc sống số của bạn nên là của chính bạn.')}</h2>
        <p className="lp-lead">{t('Guidia helps you understand the next step, practise safely, remember what you learned, and reach someone you trust when you need help.', 'Guidia আপনাকে পরের ধাপ বুঝতে, নিরাপদে অনুশীলন করতে, শেখা মনে রাখতে এবং দরকারে বিশ্বস্ত কারও কাছে পৌঁছাতে সাহায্য করে।', 'Guidia अगला कदम समझने, सुरक्षित अभ्यास करने, सीखा याद रखने और ज़रूरत पर भरोसेमंद व्यक्ति तक पहुँचने में मदद करता है।', 'Guidia giúp bạn hiểu bước tiếp theo, luyện tập an toàn, nhớ điều đã học và tìm đến người tin cậy khi cần.')}</p>
        <div className="lp-hero-ctas">
          <Button size="lg" variant="on-dark" arrow to="/register">{t('Get started', 'শুরু করুন', 'शुरू करें', 'Bắt đầu')}</Button>
          <Button size="lg" variant="outline-on-dark" icon={PlayCircle} to="/showcase">{t('Explore the experience', 'অভিজ্ঞতা ঘুরে দেখুন', 'अनुभव देखें', 'Khám phá trải nghiệm')}</Button>
        </div>
      </div>
    </section>
  );
}

