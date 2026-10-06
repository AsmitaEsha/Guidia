import { useState } from 'react';
import { BookMarked, Check, Hand, Sparkles, Star, BookOpen } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Button } from '../ui';
import GuidiaDemoFrame from './GuidiaDemoFrame';

const STAGES = [
  { icon: BookOpen, label: ['Guided', 'নির্দেশনায়', 'मार्गदर्शन में', 'Có hướng dẫn'], text: ['A short lesson walks you through sending a message, step by step.', 'ছোট পাঠ ধাপে ধাপে মেসেজ পাঠানো দেখায়।', 'छोटा पाठ कदम-दर-कदम संदेश भेजना सिखाता है।', 'Bài học ngắn hướng dẫn gửi tin nhắn từng bước.'] },
  { icon: Hand, label: ['Practising', 'অনুশীলন', 'अभ्यास', 'Luyện tập'], text: ['You try it in a safe practice app. Hints are there if you need them.', 'নিরাপদ অনুশীলন অ্যাপে নিজে চেষ্টা করেন। দরকার হলে ইঙ্গিত আছে।', 'सुरक्षित अभ्यास ऐप में खुद करते हैं। ज़रूरत हो तो संकेत हैं।', 'Bạn thử trong ứng dụng luyện tập an toàn. Có gợi ý khi cần.'] },
  { icon: Sparkles, label: ['Independent', 'নিজে নিজে', 'खुद से', 'Tự làm được'], text: ['You do it on your own, without hints. This is the moment that matters most.', 'ইঙ্গিত ছাড়াই নিজে করেন। এই মুহূর্তটাই সবচেয়ে জরুরি।', 'बिना संकेत के खुद करते हैं। यही सबसे ज़रूरी पल है।', 'Bạn tự làm, không cần gợi ý. Đây là khoảnh khắc quan trọng nhất.'] },
  { icon: Star, label: ['Remembered', 'মনে আছে', 'याद है', 'Đã nhớ'], text: ['A few days later Guidia suggests a quick review, so the skill stays yours.', 'কয়েক দিন পরে Guidia একটু ঝালিয়ে নিতে বলে, যাতে দক্ষতা টিকে থাকে।', 'कुछ दिन बाद Guidia थोड़ा दोहराने को कहता है, ताकि कौशल बना रहे।', 'Vài ngày sau Guidia gợi ý ôn nhanh để kỹ năng ở lại với bạn.'] },
];

export default function JourneyDemo() {
  const { t } = usePreferences();
  const [stage, setStage] = useState(0);
  const S = STAGES[stage];
  return (
    <GuidiaDemoFrame title={t('Learn & remember', 'শিখুন ও মনে রাখুন', 'सीखें और याद रखें', 'Học & ghi nhớ')} state={stage === STAGES.length - 1 ? 'complete' : 'active'} onReset={stage > 0 ? () => setStage(0) : undefined}>
      <div className="demo-journey">
        <p className="h-card">{t('Skill: Sending a message', 'দক্ষতা: মেসেজ পাঠানো', 'कौशल: संदेश भेजना', 'Kỹ năng: Gửi tin nhắn')}</p>
        <ol className="journey-path">
          {STAGES.map((s, i) => (
            <li key={i} data-state={i < stage ? 'done' : i === stage ? 'current' : 'todo'} data-milestone={i === 2 || undefined}>
              <button type="button" onClick={() => setStage(i)} aria-current={i === stage ? 'step' : undefined}>
                <span className="journey-dot" aria-hidden="true">{i < stage ? <Check /> : <s.icon />}</span>
                <span>{t(...s.label)}</span>
              </button>
            </li>
          ))}
        </ol>
        <div key={stage} className="journey-explain step-in" aria-live="polite">
          <S.icon aria-hidden="true" />
          <p>{t(...S.text)}</p>
        </div>
        {stage >= 2 && (
          <div className="journey-memory fade">
            <BookMarked aria-hidden="true" />
            <div className="stack" style={{ '--gap': 0 }}>
              <p className="text-strong">{t('Saved to your Memory Book', 'স্মৃতির খাতায় রাখা হয়েছে', 'याद की किताब में रखा गया', 'Đã lưu vào Sổ ghi nhớ')}</p>
              <p className="text-subtle">{t('Listen again any time', 'যখন খুশি আবার শুনুন', 'कभी भी फिर सुनें', 'Nghe lại bất cứ lúc nào')}</p>
            </div>
          </div>
        )}
        {stage < STAGES.length - 1 && <Button size="sm" arrow className="self-start" onClick={() => setStage((s) => s + 1)}>{t('Next stage', 'পরের ধাপ', 'अगला पड़ाव', 'Giai đoạn tiếp')}</Button>}
      </div>
    </GuidiaDemoFrame>
  );
}
