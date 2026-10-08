import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, HeartHandshake, Pencil, ShieldCheck, UserRound } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { getLanguage } from '../../config/languages';
import { formatMoney } from '../../i18n';
import { Avatar, Badge, Button, KeyValue, ModeLabel, RiskBadge, SuccessState } from '../ui';
import GuidiaDemoFrame from './GuidiaDemoFrame';

// Major-unit amounts that feel natural in each currency.
const AMOUNTS = { BDT: [500, 1500, 5000], INR: [500, 1500, 5000], VND: [200000, 1000000, 3000000], USD: [20, 75, 250] };
const MINOR = { BDT: 100, INR: 100, VND: 1, USD: 100 };

export default function PracticeDemo() {
  const { t, language } = usePreferences();
  const currency = getLanguage(language).currency;
  const amounts = AMOUNTS[currency] || AMOUNTS.USD;
  const money = (v) => formatMoney(v * (MINOR[currency] || 100), currency, language);
  const [step, setStep] = useState('who');
  const [who, setWho] = useState(null);
  const [amount, setAmount] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [approval, setApproval] = useState(null); // null | waiting | approved
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const contacts = [
    { id: 'rupa', name: t('Rupa (daughter)', 'রূপা (মেয়ে)', 'रूपा (बेटी)', 'Rupa (con gái)'), note: t('Saved contact', 'সেভ করা নম্বর', 'सेव किया संपर्क', 'Danh bạ đã lưu') },
    { id: 'unknown', name: '01X-XXXX-XX77', note: t('Not in your contacts', 'কন্টাক্টে নেই', 'संपर्कों में नहीं', 'Không có trong danh bạ') },
  ];
  const purposes = [t('Groceries', 'বাজার', 'राशन', 'Đi chợ'), t('Medicine', 'ওষুধ', 'दवा', 'Thuốc'), t('A gift', 'উপহার', 'उपहार', 'Quà tặng')];
  const recipient = contacts.find((c) => c.id === who);
  const high = amount != null && amounts.indexOf(amount) >= 1;
  const unknown = who === 'unknown';
  const severity = unknown ? 'CRITICAL' : high ? 'HIGH_RISK' : 'SAFE';

  const reset = () => { clearTimeout(timer.current); setStep('who'); setWho(null); setAmount(null); setPurpose(null); setApproval(null); };
  const askTrusted = () => {
    setApproval('waiting');
    timer.current = setTimeout(() => setApproval('approved'), 1400);
  };

  return (
    <GuidiaDemoFrame title={t('Safe practice: send money', 'নিরাপদ অনুশীলন: টাকা পাঠানো', 'सुरक्षित अभ्यास: पैसे भेजना', 'Luyện an toàn: chuyển tiền')} state={step === 'done' ? 'complete' : step === 'who' ? 'ready' : 'active'} onReset={step !== 'who' ? reset : undefined}>
      <div className="demo-practice">
        <div className="row-between">
          <ModeLabel>{t('Practice mode — no real money moves', 'অনুশীলন মোড — আসল টাকা যায় না', 'अभ्यास मोड — असली पैसा नहीं जाता', 'Chế độ luyện tập — không chuyển tiền thật')}</ModeLabel>
          <span className="text-subtle num">{['who', 'amount', 'review', 'done'].indexOf(step) + 1}/4</span>
        </div>

        {step === 'who' && (
          <div className="stack step-in" style={{ '--gap': 'var(--s-3)' }}>
            <p className="h-card">{t('Who are you sending to?', 'কাকে পাঠাচ্ছেন?', 'किसे भेज रहे हैं?', 'Bạn gửi cho ai?')}</p>
            {contacts.map((c) => (
              <button key={c.id} type="button" className="choice" aria-pressed={who === c.id} onClick={() => { setWho(c.id); setStep('amount'); }}>
                {c.id === 'rupa' ? <Avatar name="Rupa" size="sm" tone="coral" /> : <span className="icon-chip icon-chip-sm tone-neutral" aria-hidden="true"><UserRound /></span>}
                <span className="stack" style={{ '--gap': 0, textAlign: 'left' }}><span>{c.name}</span><span className="text-subtle">{c.note}</span></span>
              </button>
            ))}
          </div>
        )}

        {step === 'amount' && (
          <div className="stack step-in" style={{ '--gap': 'var(--s-3)' }}>
            <p className="h-card">{t('How much?', 'কত টাকা?', 'कितने?', 'Bao nhiêu?')}</p>
            <div className="row" style={{ '--gap': 'var(--s-2)' }}>
              {amounts.map((a) => <button key={a} type="button" className="chip chip-lg" aria-pressed={amount === a} onClick={() => setAmount(a)}>{money(a)}</button>)}
            </div>
            <p className="h-card">{t('What is it for?', 'কীসের জন্য?', 'किसलिए?', 'Để làm gì?')}</p>
            <div className="row" style={{ '--gap': 'var(--s-2)' }}>
              {purposes.map((p) => <button key={p} type="button" className="chip" aria-pressed={purpose === p} onClick={() => setPurpose(p)}>{p}</button>)}
            </div>
            <div className="row-between">
              <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setStep('who')}>{t('Back', 'আগে', 'पीछे', 'Quay lại')}</Button>
              <Button size="sm" arrow disabled={amount == null || !purpose} onClick={() => setStep('review')}>{t('Review', 'যাচাই করুন', 'जांचें', 'Xem lại')}</Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="demo-checkpoint step-in">
            <div className="row-between">
              <p className="h-card">{t('Guidia safety checkpoint', 'Guidia নিরাপত্তা যাচাই', 'Guidia सुरक्षा जांच', 'Điểm kiểm tra an toàn Guidia')}</p>
              <RiskBadge severity={severity} t={t} />
            </div>
            <KeyValue items={[
              [t('What', 'কী', 'क्या', 'Việc gì'), t('Send money', 'টাকা পাঠানো', 'पैसे भेजना', 'Chuyển tiền')],
              [t('Who', 'কাকে', 'किसे', 'Cho ai'), recipient?.name],
              [t('Amount', 'পরিমাণ', 'रकम', 'Số tiền'), money(amount)],
              [t('For', 'কারণ', 'किसलिए', 'Để'), purpose],
              [t('Consequence', 'ফলাফল', 'नतीजा', 'Hệ quả'), t('Money sent cannot easily come back', 'পাঠানো টাকা সহজে ফেরত আসে না', 'भेजा गया पैसा आसानी से वापस नहीं आता', 'Tiền đã gửi khó lấy lại')],
            ]} />
            {unknown && <p className="demo-warn"><ShieldCheck aria-hidden="true" />{t('This number is not in your contacts. Call the person on a number you trust before sending.', 'এই নম্বরটি আপনার কন্টাক্টে নেই। পাঠানোর আগে চেনা নম্বরে ফোন করে নিন।', 'यह नंबर आपके संपर्कों में नहीं है। भेजने से पहले भरोसेमंद नंबर पर फोन करें।', 'Số này không có trong danh bạ. Hãy gọi người đó bằng số bạn tin trước khi gửi.')}</p>}
            {!unknown && high && <p className="demo-warn"><ShieldCheck aria-hidden="true" />{t('For larger amounts, Guidia suggests asking someone you trust to check first.', 'বড় অঙ্কের জন্য Guidia আগে বিশ্বস্ত কাউকে দেখিয়ে নিতে বলে।', 'बड़ी रकम के लिए Guidia पहले किसी भरोसेमंद से जांच करवाने की सलाह देता है।', 'Với số tiền lớn, Guidia gợi ý nhờ người tin cậy kiểm tra trước.')}</p>}
            {approval === 'waiting' && <p className="demo-wait fade" role="status"><span className="thinking-dots" aria-hidden="true"><span /><span /><span /></span>{t('Waiting for Rupa to check…', 'রূপা দেখছেন…', 'रूपा जांच रही हैं…', 'Đang chờ Rupa kiểm tra…')}</p>}
            {approval === 'approved' && <Badge tone="ok" icon={Check}>{t('Rupa approved it · practice only', 'রূপা অনুমোদন দিয়েছেন · শুধু অনুশীলন', 'रूपा ने मंज़ूरी दी · केवल अभ्यास', 'Rupa đã duyệt · chỉ luyện tập')}</Badge>}
            <div className="demo-actions">
              <Button size="sm" icon={Check} onClick={() => setStep('done')} disabled={(high || unknown) && approval !== 'approved'}>{t('Continue', 'এগিয়ে যান', 'आगे बढ़ें', 'Tiếp tục')}</Button>
              <Button size="sm" variant="help" icon={HeartHandshake} onClick={askTrusted} disabled={approval != null}>{t('Ask someone I trust', 'বিশ্বস্ত কাউকে বলুন', 'भरोसेमंद से पूछें', 'Nhờ người tin cậy')}</Button>
              <Button size="sm" variant="ghost" icon={Pencil} onClick={() => { setApproval(null); setStep('amount'); }}>{t('Edit', 'বদলান', 'बदलें', 'Sửa')}</Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <SuccessState title={t('Practice complete', 'অনুশীলন শেষ', 'अभ्यास पूरा', 'Hoàn thành luyện tập')}>
            <p className="text-muted">{t(`You practised sending ${money(amount)} safely — checking who, how much and why before confirming. No real money moved.`, `আপনি নিরাপদে ${money(amount)} পাঠানো অনুশীলন করলেন — নিশ্চিত করার আগে কাকে, কত, কেন যাচাই করে। আসল টাকা যায়নি।`, `आपने ${money(amount)} सुरक्षित भेजने का अभ्यास किया — पुष्टि से पहले किसे, कितना और क्यों जांचकर। असली पैसा नहीं गया।`, `Bạn đã luyện gửi ${money(amount)} an toàn — kiểm tra ai, bao nhiêu và vì sao trước khi xác nhận. Không có tiền thật nào được chuyển.`)}</p>
          </SuccessState>
        )}
      </div>
    </GuidiaDemoFrame>
  );
}
