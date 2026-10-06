import { useEffect, useRef, useState } from 'react';
import { BookCheck, Hand, Mic, Send, Volume2 } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { Button } from '../ui';
import { GuidiaMark } from '../GuidiaLogo';
import GuidiaDemoFrame from './GuidiaDemoFrame';

// Scripted answers (clearly a guided demo — no AI call is made here).
const SCRIPTS = [
  {
    q: ['How do I send a photo on WhatsApp?', 'হোয়াটসঅ্যাপে কীভাবে ছবি পাঠাব?', 'व्हाट्सऐप पर फोटो कैसे भेजूं?', 'Làm sao gửi ảnh trên WhatsApp?'],
    a: ['Here are the steps — take your time.', 'এই হলো ধাপগুলো — ধীরে ধীরে করুন।', 'ये रहे कदम — आराम से करें।', 'Đây là các bước — cứ từ từ nhé.'],
    steps: [
      ['Open the chat with the person.', 'মানুষটির সাথে চ্যাট খুলুন।', 'उस व्यक्ति की चैट खोलें।', 'Mở cuộc trò chuyện với người đó.'],
      ['Tap the paperclip, then Gallery.', 'পেপারক্লিপে চাপুন, তারপর গ্যালারি।', 'पेपरक्लिप दबाएं, फिर गैलरी।', 'Chạm kẹp giấy, rồi Thư viện.'],
      ['Choose the photo and press the green arrow.', 'ছবি বেছে সবুজ তীরে চাপুন।', 'फोटो चुनें और हरा तीर दबाएं।', 'Chọn ảnh và bấm mũi tên xanh.'],
    ],
    practice: true,
  },
  {
    q: ['Someone asked for my OTP. Is it safe?', 'কেউ আমার ওটিপি চাইছে। এটা কি নিরাপদ?', 'कोई मेरा ओटीपी मांग रहा है। क्या यह सुरक्षित है?', 'Có người hỏi mã OTP của tôi. Có an toàn không?'],
    a: ['No — please do not share it. No real company ever asks for your OTP.', 'না — দয়া করে দেবেন না। কোনো আসল প্রতিষ্ঠান কখনো ওটিপি চায় না।', 'नहीं — कृपया न बताएं। कोई असली कंपनी कभी ओटीपी नहीं मांगती।', 'Không — xin đừng đưa. Không công ty thật nào hỏi mã OTP.'],
    steps: [
      ['Do not reply or call back the number.', 'উত্তর দেবেন না বা ওই নম্বরে ফোন করবেন না।', 'जवाब न दें, उस नंबर पर फोन न करें।', 'Đừng trả lời hay gọi lại số đó.'],
      ['Delete the message.', 'মেসেজটি মুছে দিন।', 'संदेश मिटा दें।', 'Xóa tin nhắn.'],
      ['Tell someone you trust.', 'বিশ্বস্ত কাউকে জানান।', 'किसी भरोसेमंद को बताएं।', 'Báo cho người bạn tin.'],
    ],
  },
];

export default function AskDemo({ compact, onPractise }) {
  const { t } = usePreferences();
  const { speak } = useVoice();
  const [turn, setTurn] = useState(null); // { i, phase: 'thinking' | 'answered' }
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const ask = (i) => {
    clearTimeout(timer.current);
    setTurn({ i, phase: 'thinking' });
    timer.current = setTimeout(() => setTurn({ i, phase: 'answered' }), 900);
  };
  const s = turn ? SCRIPTS[turn.i] : null;

  return (
    <GuidiaDemoFrame title={t('Ask Guidia', 'Guidia-কে জিজ্ঞাসা', 'Guidia से पूछें', 'Hỏi Guidia')} state={turn?.phase === 'answered' ? 'complete' : turn ? 'active' : 'ready'} onReset={turn ? () => setTurn(null) : undefined}>
      <div className={`demo-chat ${compact ? 'is-compact' : ''}`}>
        {!turn && <p className="text-muted">{t('Tap a question to see how Guidia answers:', 'Guidia কীভাবে উত্তর দেয় দেখতে একটি প্রশ্নে চাপুন:', 'Guidia कैसे जवाब देता है देखने के लिए सवाल दबाएं:', 'Chạm một câu hỏi để xem Guidia trả lời:')}</p>}
        {s && <div className="demo-bubble-user fade">{t(...s.q)}</div>}
        {turn?.phase === 'thinking' && (
          <div className="demo-bubble-ai fade" role="status"><span className="thinking-dots" aria-hidden="true"><span /><span /><span /></span><span className="sr-only">{t('Guidia is thinking', 'Guidia ভাবছে', 'Guidia सोच रहा है', 'Guidia đang suy nghĩ')}</span></div>
        )}
        {turn?.phase === 'answered' && (
          <div className="demo-bubble-ai rise" aria-live="polite">
            <span className="demo-ai-head"><GuidiaMark size={22} title="" /> Guidia</span>
            <p className="text-strong">{t(...s.a)}</p>
            <ol className="demo-steps">{s.steps.map((st, n) => <li key={n}><span>{n + 1}</span>{t(...st)}</li>)}</ol>
            <span className="badge badge-ok self-start"><BookCheck aria-hidden="true" /> {t('From a Guidia lesson', 'Guidia-র পাঠ থেকে', 'Guidia के पाठ से', 'Từ bài học Guidia')}</span>
            <div className="row" style={{ '--gap': '8px' }}>
              <Button size="sm" variant="tonal" icon={Volume2} onClick={() => speak([t(...s.a), ...s.steps.map((st) => t(...st))].join('. '))}>{t('Listen', 'শুনুন', 'सुनें', 'Nghe')}</Button>
              {s.practice && onPractise && <Button size="sm" variant="secondary" icon={Hand} onClick={onPractise}>{t('Practise this', 'এটি অনুশীলন', 'इसका अभ्यास', 'Luyện việc này')}</Button>}
            </div>
          </div>
        )}
        <div className="demo-prompts">
          {SCRIPTS.map((sc, i) => <button key={i} type="button" className="chip" aria-pressed={turn?.i === i} onClick={() => ask(i)}>{t(...sc.q)}</button>)}
        </div>
        <div className="demo-composer" aria-hidden="true">
          <span className="demo-mic"><Mic /></span>
          <span className="demo-input">{t('Type or say your question…', 'লিখুন বা বলুন…', 'लिखें या बोलें…', 'Gõ hoặc nói câu hỏi…')}</span>
          <span className="demo-send"><Send /></span>
        </div>
      </div>
    </GuidiaDemoFrame>
  );
}
