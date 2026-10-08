import { useEffect, useRef, useState } from 'react';
import { CircleHelp, HeartHandshake, MessageSquare, Phone, RotateCcw, Search, ShieldBan, ShieldCheck, Hand } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { TACTICS, TACTIC_WHY } from '../../data/scamPractice';
import { Badge, Button, RiskBadge, Timeline } from '../ui';
import GuidiaDemoFrame from './GuidiaDemoFrame';

const CLUES = ['FAMILY_EMERGENCY', 'NEW_NUMBER', 'ASKS_MONEY', 'URGENCY', 'SECRECY'];

export default function ScamDemo() {
  const { t } = usePreferences();
  const [stage, setStage] = useState('message'); // message | analyzing | warning | respond
  const [clue, setClue] = useState(null);
  const [showClues, setShowClues] = useState(false);
  const [asked, setAsked] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const check = () => {
    setStage('analyzing'); setShowClues(false); setClue(null);
    timer.current = setTimeout(() => setStage('warning'), 1200);
  };
  const reset = () => { clearTimeout(timer.current); setStage('message'); setShowClues(false); setClue(null); setAsked(false); };

  return (
    <GuidiaDemoFrame title={t('Scam protection', 'প্রতারণা থেকে সুরক্ষা', 'धोखे से सुरक्षा', 'Bảo vệ khỏi lừa đảo')} state={stage === 'respond' ? 'complete' : stage === 'message' ? 'ready' : 'active'} onReset={stage !== 'message' ? reset : undefined}>
      <div className="demo-scam">
        <div className="phone-msg">
          <div className="phone-msg-head">
            <span className="phone-msg-channel"><MessageSquare aria-hidden="true" />WhatsApp</span>
            <span className="text-strong">+880 1XX-XXX-X09</span>
          </div>
          <p className="phone-msg-body">{t("Abba it's me, my phone broke so this is my new number. I'm in trouble — please send 15,000 taka right now. Don't tell anyone, I'll explain later.", 'আব্বা আমি, আমার ফোন নষ্ট তাই এটা নতুন নম্বর। আমি বিপদে আছি — এখনই ১৫,০০০ টাকা পাঠাও। কাউকে বোলো না, পরে বুঝিয়ে বলব।', 'पापा मैं हूँ, मेरा फोन टूट गया, यह नया नंबर है। मैं मुसीबत में हूँ — अभी 15,000 भेज दो। किसी को मत बताना, बाद में समझाऊंगा।', 'Bố ơi con đây, điện thoại con hỏng nên đây là số mới. Con đang gặp chuyện — bố chuyển ngay 5 triệu nhé. Đừng nói với ai, con giải thích sau.')}</p>
        </div>

        {stage === 'message' && <Button icon={Search} onClick={check} className="self-start">{t('Check this message', 'মেসেজটি যাচাই করুন', 'यह मैसेज जांचें', 'Kiểm tra tin nhắn này')}</Button>}
        {stage === 'analyzing' && (
          <div className="demo-analyzing fade" role="status">
            <span className="thinking-dots" aria-hidden="true"><span /><span /><span /></span>
            {t('Guidia is checking this carefully…', 'Guidia ভালো করে যাচাই করছে…', 'Guidia ध्यान से जांच रहा है…', 'Guidia đang kiểm tra kỹ…')}
          </div>
        )}

        {(stage === 'warning' || stage === 'respond') && (
          <div className="risk-result tone-danger rise" aria-live="polite">
            <div className="risk-result-head">
              <span className="risk-result-icon" aria-hidden="true"><ShieldBan /></span>
              <div className="stack" style={{ '--gap': '4px' }}>
                <RiskBadge severity="CRITICAL" t={t} />
                <p className="risk-result-context">{t('This looks like the "new number" family scam. Please pause before doing anything.', 'এটি "নতুন নম্বর" পারিবারিক প্রতারণার মতো। কিছু করার আগে থামুন।', 'यह "नया नंबर" वाला पारिवारिक धोखा लगता है। कुछ भी करने से पहले रुकें।', 'Đây giống chiêu lừa "số mới" giả làm người nhà. Hãy dừng lại trước khi làm gì.')}</p>
              </div>
            </div>
            {showClues && (
              <div className="stack fade" style={{ '--gap': 'var(--s-2)' }}>
                <div className="row" style={{ '--gap': '6px' }}>
                  {CLUES.map((k) => <button key={k} type="button" className="chip clue-chip" aria-pressed={clue === k} onClick={() => setClue(k)}>{t(...TACTICS[k])}</button>)}
                </div>
                {clue && <p key={clue} className="clue-why fade">{t(...TACTIC_WHY[clue])}</p>}
              </div>
            )}
            {stage === 'respond' && (
              <div className="fade">
                <Timeline items={[
                  { key: 'p', icon: Hand, state: 'done', title: t('Pause — do not reply or send money', 'থামুন — উত্তর দেবেন না, টাকা পাঠাবেন না', 'रुकें — जवाब न दें, पैसे न भेजें', 'Dừng lại — đừng trả lời hay gửi tiền') },
                  { key: 'v', icon: Phone, state: 'done', title: t('Verify — call your son on his saved number', 'যাচাই — ছেলের সেভ করা নম্বরে ফোন করুন', 'जांचें — बेटे के सेव नंबर पर फोन करें', 'Kiểm tra — gọi con bằng số đã lưu') },
                  { key: 's', icon: ShieldCheck, state: 'current', title: t('Safe response — if it is not him, block and report', 'নিরাপদ পদক্ষেপ — সে না হলে ব্লক ও রিপোর্ট করুন', 'सुरक्षित कदम — अगर वह नहीं है, ब्लॉक और रिपोर्ट करें', 'Phản hồi an toàn — nếu không phải con, hãy chặn và báo cáo') },
                ]} />
              </div>
            )}
            {asked && <Badge tone="ok" icon={HeartHandshake}>{t('Sent to Rupa — she will call you (demo)', 'রূপাকে পাঠানো হয়েছে — তিনি ফোন করবেন (ডেমো)', 'रूपा को भेजा गया — वह फोन करेंगी (डेमो)', 'Đã gửi cho Rupa — cô ấy sẽ gọi bạn (demo)')}</Badge>}
            <div className="demo-actions">
              <Button size="sm" variant="secondary" icon={CircleHelp} onClick={() => { setShowClues(true); setClue((c) => c || CLUES[0]); }}>{t('Why?', 'কেন?', 'क्यों?', 'Vì sao?')}</Button>
              <Button size="sm" icon={ShieldCheck} onClick={() => setStage('respond')}>{t('What should I do?', 'আমি কী করব?', 'मुझे क्या करना चाहिए?', 'Tôi nên làm gì?')}</Button>
              <Button size="sm" variant="ghost" icon={RotateCcw} onClick={check}>{t('Check again', 'আবার যাচাই', 'फिर जांचें', 'Kiểm tra lại')}</Button>
              <Button size="sm" variant="help" icon={HeartHandshake} onClick={() => setAsked(true)} disabled={asked}>{t('Ask someone I trust', 'বিশ্বস্ত কাউকে বলুন', 'भरोसेमंद से पूछें', 'Nhờ người tin cậy')}</Button>
            </div>
          </div>
        )}
      </div>
    </GuidiaDemoFrame>
  );
}
