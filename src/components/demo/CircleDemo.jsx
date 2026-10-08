import { useState } from 'react';
import { BellRing, EyeOff, HandHelping, ShieldCheck, TrendingUp } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Avatar, Badge } from '../ui';
import GuidiaDemoFrame from './GuidiaDemoFrame';

const PERMS = [
  { key: 'help', icon: HandHelping, label: ['Help when I ask', 'আমি চাইলে সাহায্য', 'मेरे मांगने पर मदद', 'Giúp khi tôi nhờ'], what: ['Rupa is told the moment you press "I need help" — and can call you straight away.', 'আপনি "আমার সাহায্য দরকার" চাপলেই রূপা জানবেন — এবং সঙ্গে সঙ্গে ফোন করতে পারবেন।', '"मुझे मदद चाहिए" दबाते ही रूपा को पता चलेगा — और वह तुरंत फोन कर सकेंगी।', 'Rupa được báo ngay khi bạn bấm "Tôi cần giúp đỡ" — và có thể gọi bạn liền.'] },
  { key: 'sensitive', icon: ShieldCheck, label: ['Help with sensitive actions', 'সংবেদনশীল কাজে সাহায্য', 'संवेदनशील कामों में मदद', 'Giúp với việc nhạy cảm'], what: ['Before a larger payment goes through, Rupa is asked to take a look.', 'বড় পেমেন্টের আগে রূপাকে একবার দেখে নিতে বলা হয়।', 'बड़े भुगतान से पहले रूपा से एक बार देखने को कहा जाता है।', 'Trước khoản thanh toán lớn, Rupa được nhờ xem qua.'] },
  { key: 'safety', icon: BellRing, label: ['Safety alerts', 'নিরাপত্তা সতর্কতা', 'सुरक्षा अलर्ट', 'Cảnh báo an toàn'], what: ['Rupa sees how many risky messages you checked — never the messages themselves.', 'রূপা দেখেন কতগুলো ঝুঁকিপূর্ণ মেসেজ যাচাই করেছেন — মেসেজগুলো নয়।', 'रूपा देखती हैं कितने खतरनाक मैसेज जांचे — मैसेज नहीं।', 'Rupa thấy số tin rủi ro bạn đã kiểm tra — không phải nội dung.'] },
  { key: 'progress', icon: TrendingUp, label: ['Learning progress', 'শেখার অগ্রগতি', 'सीखने की प्रगति', 'Tiến độ học'], what: ['Rupa can cheer you on as you learn new skills.', 'নতুন দক্ষতা শেখার সময় রূপা উৎসাহ দিতে পারেন।', 'नए कौशल सीखते समय रूपा हौसला बढ़ा सकती हैं।', 'Rupa có thể động viên khi bạn học kỹ năng mới.'] },
];

export default function CircleDemo() {
  const { t } = usePreferences();
  const [on, setOn] = useState(() => new Set(['help', 'sensitive']));
  const [focus, setFocus] = useState('help');
  const toggle = (k) => {
    setFocus(k);
    setOn((prev) => { const next = new Set(prev); if (next.has(k)) next.delete(k); else next.add(k); return next; });
  };
  const current = PERMS.find((p) => p.key === focus);

  return (
    <GuidiaDemoFrame title={t('Trusted Circle', 'বিশ্বস্ত বৃত্ত', 'भरोसेमंद दायरा', 'Vòng tròn tin cậy')} state={on.size ? 'active' : 'ready'}>
      <div className="demo-circle">
        <div className="circle-visual" aria-hidden="true">
          <span className="circle-you"><Avatar name="You" size="lg" /><span>{t('You', 'আপনি', 'आप', 'Bạn')}</span></span>
          <span className="circle-links">{PERMS.map((p) => <span key={p.key} className="circle-link" data-on={on.has(p.key)} />)}</span>
          <span className="circle-them"><Avatar name="Rupa" tone="coral" size="lg" /><span>Rupa</span></span>
        </div>
        <div className="stack" style={{ '--gap': 'var(--s-3)' }}>
          <p className="h-card">{t('What can Rupa (your daughter) help with?', 'রূপা (আপনার মেয়ে) কীসে সাহায্য করবেন?', 'रूपा (आपकी बेटी) किसमें मदद करें?', 'Rupa (con gái bạn) có thể giúp gì?')}</p>
          <div className="circle-perms" role="group" aria-label={t('Permissions', 'অনুমতি', 'अनुमतियाँ', 'Quyền')}>
            {PERMS.map((p) => <button key={p.key} type="button" className="chip" aria-pressed={on.has(p.key)} onClick={() => toggle(p.key)}><p.icon aria-hidden="true" />{t(...p.label)}</button>)}
          </div>
          <div className="circle-explain" aria-live="polite">
            <p className="text-strong row" style={{ '--gap': '8px' }}><current.icon size={20} aria-hidden="true" />{t(...current.label)} · <Badge tone={on.has(current.key) ? 'ok' : undefined}>{on.has(current.key) ? t('On', 'চালু', 'चालू', 'Bật') : t('Off', 'বন্ধ', 'बंद', 'Tắt')}</Badge></p>
            <p className="text-muted">{t(...current.what)}</p>
          </div>
          <p className="circle-never"><EyeOff aria-hidden="true" />{t('Never shared: passwords, PINs, OTPs or private conversations.', 'কখনো শেয়ার হয় না: পাসওয়ার্ড, পিন, ওটিপি বা ব্যক্তিগত কথোপকথন।', 'कभी साझा नहीं: पासवर्ड, पिन, ओटीपी या निजी बातचीत।', 'Không bao giờ chia sẻ: mật khẩu, PIN, OTP hay trò chuyện riêng.')}</p>
        </div>
      </div>
    </GuidiaDemoFrame>
  );
}
