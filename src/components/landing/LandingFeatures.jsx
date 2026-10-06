import { Check } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import ScreenDemo from '../demo/ScreenDemo';
import PracticeDemo from '../demo/PracticeDemo';
import ScamDemo from '../demo/ScamDemo';
import CircleDemo from '../demo/CircleDemo';
import JourneyDemo from '../demo/JourneyDemo';
import AccessibilityDemo from '../demo/AccessibilityDemo';

// Copy beside a live demo; `reverse` puts the demo on the left.
function FeatureSection({ id, eyebrow, title, body, points, demo, reverse, tint }) {
  const { t } = usePreferences();
  return (
    <section className={`lp-section ${tint ? 'lp-tint' : ''}`} id={id} aria-labelledby={`${id}-h`}>
      <div className={`lp-container lp-feature ${reverse ? 'is-reverse' : ''}`}>
        <div className="lp-feature-copy">
          <p className="eyebrow">{t(...eyebrow)}</p>
          <h2 id={`${id}-h`} className="lp-display-2">{t(...title)}</h2>
          <p className="lp-lead">{t(...body)}</p>
          <ul className="lp-points">
            {points.map((p, i) => <li key={i}><Check aria-hidden="true" />{t(...p)}</li>)}
          </ul>
        </div>
        <div className="lp-feature-demo">{demo}</div>
      </div>
    </section>
  );
}

export default function LandingFeatures() {
  return (
    <>
      <FeatureSection
        id="screen" tint
        eyebrow={['Understand my screen', 'আমার স্ক্রিন বুঝুন', 'मेरी स्क्रीन समझें', 'Hiểu màn hình của tôi']}
        title={['A confusing screen, explained in plain words.', 'বিভ্রান্তিকর স্ক্রিন, সহজ কথায় ব্যাখ্যা।', 'उलझन भरी स्क्रीन, आसान शब्दों में।', 'Màn hình khó hiểu, giải thích bằng lời đơn giản.']}
        body={['Share a screenshot. Guidia shows what you are looking at, what matters, what to check — and the next safe step.', 'একটি স্ক্রিনশট দিন। Guidia দেখায় আপনি কী দেখছেন, কী জরুরি, কী যাচাই করবেন — আর পরের নিরাপদ ধাপ।', 'स्क्रीनशॉट दें। Guidia बताता है आप क्या देख रहे हैं, क्या ज़रूरी है, क्या जांचें — और अगला सुरक्षित कदम।', 'Gửi ảnh màn hình. Guidia cho biết bạn đang xem gì, điều gì quan trọng, cần kiểm tra gì — và bước an toàn tiếp theo.']}
        points={[
          ['Numbered markers point to each button', 'নম্বর দেওয়া চিহ্ন প্রতিটি বোতাম দেখায়', 'नंबर वाले निशान हर बटन दिखाते हैं', 'Số đánh dấu chỉ từng nút'],
          ['Screenshots are deleted after 30 minutes', 'স্ক্রিনশট ৩০ মিনিট পরে মুছে যায়', 'स्क्रीनशॉट 30 मिनट बाद हट जाते हैं', 'Ảnh tự xóa sau 30 phút'],
          ['Ask follow-up questions about the same screen', 'একই স্ক্রিন নিয়ে আরও প্রশ্ন করুন', 'उसी स्क्रीन पर और सवाल पूछें', 'Hỏi thêm về cùng màn hình'],
        ]}
        demo={<ScreenDemo />}
      />
      <FeatureSection
        id="practice" reverse
        eyebrow={['Safe practice', 'নিরাপদ অনুশীলন', 'सुरक्षित अभ्यास', 'Luyện tập an toàn']}
        title={['Practise the real thing — with pretend money.', 'আসল কাজের অনুশীলন — নকল টাকা দিয়ে।', 'असली काम का अभ्यास — नकली पैसों से।', 'Luyện việc thật — với tiền giả.']}
        body={['Twelve everyday apps, recreated as safe practice spaces. Guidia adds a calm checkpoint before every sensitive step.', 'প্রতিদিনের বারোটি অ্যাপ, নিরাপদ অনুশীলনের জায়গা হিসেবে। প্রতিটি সংবেদনশীল ধাপের আগে Guidia শান্ত যাচাই যোগ করে।', 'रोज़ के बारह ऐप, सुरक्षित अभ्यास के रूप में। हर संवेदनशील कदम से पहले Guidia शांत जांच जोड़ता है।', 'Mười hai ứng dụng hằng ngày, tái tạo thành nơi luyện tập an toàn. Guidia thêm một bước kiểm tra trước mỗi bước nhạy cảm.']}
        points={[
          ['Review who, how much and why before confirming', 'নিশ্চিত করার আগে কাকে, কত ও কেন যাচাই', 'पुष्टि से पहले किसे, कितना और क्यों जांचें', 'Xem lại ai, bao nhiêu, vì sao trước khi xác nhận'],
          ['Ask someone you trust to check larger amounts', 'বড় অঙ্ক বিশ্বস্ত কাউকে দেখিয়ে নিন', 'बड़ी रकम किसी भरोसेमंद से जंचवाएं', 'Nhờ người tin cậy kiểm tra số tiền lớn'],
          ['Nothing ever reaches the real world', 'আসল দুনিয়ায় কিছুই পৌঁছায় না', 'असली दुनिया तक कुछ नहीं पहुँचता', 'Không có gì ra thế giới thật'],
        ]}
        demo={<PracticeDemo />}
      />
      <FeatureSection
        id="safety" tint
        eyebrow={['Safety intelligence', 'নিরাপত্তা বুদ্ধিমত্তা', 'सुरक्षा समझ', 'An toàn thông minh']}
        title={['Pause. Verify. Respond safely.', 'থামুন। যাচাই করুন। নিরাপদে সাড়া দিন।', 'रुकें। जांचें। सुरक्षित जवाब दें।', 'Dừng lại. Kiểm tra. Phản hồi an toàn.']}
        body={['Paste a suspicious message. Guidia explains the warning signs and walks you through the safe response — calmly.', 'সন্দেহজনক মেসেজ পেস্ট করুন। Guidia সতর্কতার চিহ্ন বুঝিয়ে শান্তভাবে নিরাপদ পদক্ষেপ দেখায়।', 'संदिग्ध संदेश डालें। Guidia चेतावनी के संकेत समझाकर शांति से सुरक्षित कदम बताता है।', 'Dán tin nhắn đáng ngờ. Guidia giải thích dấu hiệu cảnh báo và bình tĩnh hướng dẫn cách phản hồi an toàn.']}
        points={[
          ['Clear risk levels — in words, not just colours', 'স্পষ্ট ঝুঁকির মাত্রা — শুধু রং নয়, কথায়', 'साफ़ जोखिम स्तर — सिर्फ़ रंग नहीं, शब्दों में', 'Mức rủi ro rõ ràng — bằng lời, không chỉ màu'],
          ['Codes and passwords are removed before checking', 'যাচাইয়ের আগে কোড ও পাসওয়ার্ড সরানো হয়', 'जांच से पहले कोड और पासवर्ड हटाए जाते हैं', 'Mã và mật khẩu được xóa trước khi kiểm tra'],
          ['Practise spotting scams with pretend messages', 'নকল মেসেজে প্রতারণা চেনার অনুশীলন', 'नकली संदेशों से धोखा पहचानने का अभ्यास', 'Luyện nhận biết lừa đảo với tin nhắn giả'],
        ]}
        demo={<ScamDemo />}
      />
      <FeatureSection
        id="families" reverse
        eyebrow={['Trusted people', 'বিশ্বস্ত মানুষ', 'भरोसेमंद लोग', 'Người tin cậy']}
        title={['Support without surveillance.', 'নজরদারি ছাড়া পাশে থাকা।', 'निगरानी नहीं, साथ।', 'Hỗ trợ, không giám sát.']}
        body={['Invite a son, daughter or carer. You decide exactly what they can help with — and you can change it any time.', 'ছেলে, মেয়ে বা দেখাশোনাকারীকে আমন্ত্রণ জানান। তাঁরা ঠিক কীসে সাহায্য করবেন আপনিই ঠিক করেন — যেকোনো সময় বদলাতে পারেন।', 'बेटे, बेटी या देखभाल करने वाले को बुलाएं। वे ठीक किसमें मदद करें, आप तय करते हैं — कभी भी बदल सकते हैं।', 'Mời con hoặc người chăm sóc. Bạn quyết định chính xác họ giúp gì — và đổi bất cứ lúc nào.']}
        points={[
          ['"I need help" reaches them in one tap', '"আমার সাহায্য দরকার" এক চাপেই পৌঁছায়', '"मुझे मदद चाहिए" एक टैप में पहुँचता है', '"Tôi cần giúp" đến họ chỉ với một chạm'],
          ['They see status updates, never your passwords', 'তাঁরা অবস্থা দেখেন, কখনো পাসওয়ার্ড নয়', 'वे स्थिति देखते हैं, कभी पासवर्ड नहीं', 'Họ thấy cập nhật, không bao giờ thấy mật khẩu'],
          ['Remove access instantly', 'সঙ্গে সঙ্গে অনুমতি সরান', 'तुरंत पहुँच हटाएं', 'Gỡ quyền ngay lập tức'],
        ]}
        demo={<CircleDemo />}
      />
      <FeatureSection
        id="memory" tint
        eyebrow={['Memory & learning', 'স্মৃতি ও শেখা', 'याद और सीखना', 'Ghi nhớ & học tập']}
        title={['From guided, to independent, to remembered.', 'নির্দেশনা থেকে স্বাধীনতা, তারপর মনে রাখা।', 'मार्गदर्शन से आत्मनिर्भरता, फिर याद।', 'Từ có hướng dẫn, đến tự lập, đến ghi nhớ.']}
        body={['Guidia is a long-term learning companion, not a content library. It tracks what you can do and how comfortable you feel — separately.', 'Guidia দীর্ঘমেয়াদি শেখার সঙ্গী, শুধু বিষয়বস্তুর ভাণ্ডার নয়। আপনি কী পারেন আর কতটা স্বচ্ছন্দ — আলাদা করে দেখে।', 'Guidia लंबे समय का सीखने का साथी है, सिर्फ़ सामग्री का भंडार नहीं। आप क्या कर सकते हैं और कितना सहज हैं — अलग-अलग देखता है।', 'Guidia là người bạn học lâu dài, không chỉ là kho nội dung. Nó theo dõi riêng việc bạn làm được gì và bạn thấy thoải mái thế nào.']}
        points={[
          ['Every lesson saved to your Memory Book', 'প্রতিটি পাঠ স্মৃতির খাতায় রাখা', 'हर पाठ याद की किताब में', 'Mọi bài học được lưu vào Sổ ghi nhớ'],
          ['Gentle reviews when a skill needs refreshing', 'দক্ষতা ঝালাই দরকার হলে নরম মনে করানো', 'कौशल ताज़ा करने के लिए हल्का दोहराव', 'Ôn nhẹ nhàng khi kỹ năng cần nhắc lại'],
          ['Independence is the milestone that matters', 'স্বাধীনভাবে করাই আসল মাইলফলক', 'आत्मनिर्भरता ही असली उपलब्धि है', 'Tự lập là cột mốc quan trọng nhất'],
        ]}
        demo={<JourneyDemo />}
      />
      <FeatureSection
        id="accessibility" reverse
        eyebrow={['Accessibility', 'সহজলভ্যতা', 'सुलभता', 'Trợ năng']}
        title={['Your eyes, your pace, your language.', 'আপনার চোখ, আপনার গতি, আপনার ভাষা।', 'आपकी आंखें, आपकी गति, आपकी भाषा।', 'Đôi mắt, nhịp độ và ngôn ngữ của bạn.']}
        body={['Text size, contrast, movement, voice and guidance style change the whole experience — try them on the preview.', 'লেখার আকার, কনট্রাস্ট, নড়াচড়া, কণ্ঠ ও নির্দেশনার ধরন পুরো অভিজ্ঞতা বদলে দেয় — নমুনায় চেষ্টা করুন।', 'अक्षर का आकार, कंट्रास्ट, हलचल, आवाज़ और मार्गदर्शन पूरा अनुभव बदलते हैं — झलक पर आज़माएं।', 'Cỡ chữ, độ tương phản, chuyển động, giọng đọc và kiểu hướng dẫn thay đổi toàn bộ trải nghiệm — thử ngay trên bản xem trước.']}
        points={[
          ['English · বাংলা · हिन्दी · Tiếng Việt', 'English · বাংলা · हिन्दी · Tiếng Việt', 'English · বাংলা · हिन्दी · Tiếng Việt', 'English · বাংলা · हिन्दी · Tiếng Việt'],
          ['Every step can be read aloud', 'প্রতিটি ধাপ পড়ে শোনানো যায়', 'हर कदम पढ़कर सुनाया जा सकता है', 'Mọi bước đều có thể đọc to'],
          ['Large targets, visible focus, screen-reader friendly', 'বড় বোতাম, স্পষ্ট ফোকাস, স্ক্রিন রিডার বান্ধব', 'बड़े बटन, साफ़ फोकस, स्क्रीन रीडर अनुकूल', 'Nút lớn, tiêu điểm rõ, thân thiện với trình đọc màn hình'],
        ]}
        demo={<AccessibilityDemo />}
      />
    </>
  );
}
