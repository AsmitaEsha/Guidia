import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Clock, LifeBuoy, Pencil, ShieldAlert, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useVoice } from '../context/VoiceContext';
import { get, newIdempotencyKey, post } from '../services/apiClient';
import { Alert, Dialog, RiskBadge, StepDots } from './ui';
import { formatMoney } from '../i18n';

// The Psychological Safety Net, now backed by the real Safety Engine.
//
//   open → POST /actions (REVIEW; server decides risk, confirmations, guardian)
//        → one explicit confirmation per check (amount, recipient, consequence)
//        → GUARDIAN_PENDING (waits for a real guardian decision) or EXECUTED
//        → onProceed(proposal) only after the server executed the practice
//          transaction. Nothing here moves real money.

const RISK_FROM_LEVEL = { LOW: 'SAFE', MEDIUM: 'WARNING', HIGH: 'HIGH_RISK', CRITICAL: 'CRITICAL' };

// V1 simulators pass e.g. "bkash_send_money" — derive app + action type.
function parseLegacy(actionType = '') {
  const [app, ...rest] = actionType.split('_');
  const kind = rest.join('_').toUpperCase();
  const map = { SEND_MONEY: 'SEND_MONEY', PAYMENT: 'PURCHASE', PAY_BILL: 'PAY_BILL', PURCHASE: 'PURCHASE' };
  return { application: app, type: map[kind] || 'SEND_MONEY' };
}

function parseAmount(text) {
  const m = String(text || '').replace(/,/g, '').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}

export default function GuidiaSafetyPanel({
  open, actionType, application, type, amount, currency, recipientLabel,
  title, what, who, amountOrData, consequence, onProceed, onEdit, onRequestHelp,
}) {
  const { status: authStatus } = useAuth();
  const { t, language } = usePreferences();
  const { speak } = useVoice();
  const [proposal, setProposal] = useState(null);
  const [phase, setPhase] = useState('creating'); // creating | review | confirming | waiting | done | rejected | error
  const [error, setError] = useState('');
  const keyRef = useRef(null);
  const createdFor = useRef(null);

  const legacy = parseLegacy(actionType);
  const app = application || legacy.application;
  const kind = type || legacy.type;
  const numericAmount = amount ?? parseAmount(amountOrData);

  const log = useCallback((resolution) => {
    post('/safety/interceptions', { actionType: `${app}_${kind}`.toLowerCase(), summary: { what: what || '', who: who || '', amountOrData: amountOrData || '', consequence: consequence || '' }, resolution }).catch(() => {});
  }, [app, kind, what, who, amountOrData, consequence]);

  // Create the proposal when the panel opens; forget it when it closes.
  useEffect(() => {
    if (!open) return undefined;
    const signature = `${app}|${kind}|${numericAmount}|${who}`;
    if (createdFor.current === signature) return undefined;
    createdFor.current = signature;
    let cancelled = false;
    const request = authStatus === 'authenticated'
      ? post('/actions', { applicationSlug: app, actionType: kind, recipientLabel: recipientLabel || who || '', amount: numericAmount, ...(currency ? { currency } : {}) }, { idempotent: true })
      : Promise.reject(new Error(t('Please sign in to practise payments.', 'পেমেন্ট অনুশীলনের জন্য সাইন ইন করুন।', 'भुगतान अभ्यास के लिए साइन इन करें।', 'Vui lòng đăng nhập để luyện thanh toán.')));
    request
      .then(({ proposal: p }) => { if (!cancelled) { setError(''); setProposal(p); setPhase('review'); } })
      .catch((err) => { if (!cancelled) { setPhase('error'); setError(err.message); } });
    return () => {
      cancelled = true;
      createdFor.current = null;
      setProposal(null);
      setPhase('creating');
    };
  }, [open, app, kind, numericAmount, who, recipientLabel, currency, authStatus, t]);

  // Poll while a guardian decides.
  useEffect(() => {
    if (phase !== 'waiting' || !proposal) return undefined;
    const id = setInterval(async () => {
      try {
        const { proposal: p } = await get(`/actions/${proposal.id}`);
        setProposal(p);
        if (p.status === 'EXECUTED') { setPhase('done'); speak(t('Your guardian approved. Practice transfer complete.', 'আপনার গার্ডিয়ান অনুমোদন দিয়েছেন। অনুশীলনের টাকা পাঠানো সম্পন্ন।', 'आपके अभिभावक ने मंज़ूरी दी। अभ्यास भुगतान पूरा हुआ।', 'Người giám hộ đã đồng ý. Đã hoàn tất giao dịch luyện tập.')); onProceed?.(p); }
        if (['REJECTED', 'CANCELLED', 'EXPIRED'].includes(p.status)) setPhase('rejected');
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(id);
  }, [phase, proposal, onProceed, speak, t]);

  if (!open) return null;

  const checks = [
    { title: t('Is the amount right?', 'টাকার পরিমাণ কি ঠিক আছে?', 'क्या रकम सही है?', 'Số tiền có đúng không?'), value: amountOrData || (proposal?.amountMinor != null ? formatMoney(proposal.amountMinor, proposal.currency, language) : '') },
    { title: t('Is this the right person?', 'এটি কি সঠিক মানুষ?', 'क्या यह सही व्यक्ति है?', 'Có đúng người nhận không?'), value: who },
    { title: t('Do you understand what happens next?', 'এরপর কী হবে বুঝেছেন?', 'क्या आप समझते हैं आगे क्या होगा?', 'Bạn hiểu điều gì sẽ xảy ra tiếp theo chứ?'), value: consequence },
  ];
  const level = proposal?.confirmationLevel ?? 1;
  const given = proposal?.confirmationsGiven ?? 0;
  const currentCheck = checks[Math.min(given, checks.length - 1)];

  const confirm = async () => {
    setPhase('confirming');
    keyRef.current = keyRef.current || newIdempotencyKey();
    try {
      const { proposal: p } = await post(`/actions/${proposal.id}/confirm`, { version: proposal.version }, { idempotent: keyRef.current });
      keyRef.current = null;
      setProposal(p);
      if (p.status === 'REVIEW') { setPhase('review'); return; }
      if (p.status === 'GUARDIAN_PENDING') {
        log('PROCEED');
        setPhase('waiting');
        speak(t('I have asked your guardian. We will wait for them together.', 'আপনার গার্ডিয়ানকে জানিয়েছি। চলুন একসাথে অপেক্ষা করি।', 'मैंने आपके अभिभावक से पूछा है। साथ में इंतज़ार करते हैं।', 'Tôi đã hỏi người giám hộ. Chúng ta cùng chờ nhé.'));
        return;
      }
      if (p.status === 'EXECUTED') { log('PROCEED'); setPhase('done'); onProceed?.(p); }
    } catch (err) {
      keyRef.current = null;
      setPhase('error');
      setError(err.message);
    }
  };

  const cancel = async (cb, resolution) => {
    if (proposal && ['REVIEW', 'GUARDIAN_PENDING'].includes(proposal.status)) {
      await post(`/actions/${proposal.id}/cancel`, {}, { idempotent: true }).catch(() => {});
    }
    log(resolution);
    cb?.();
  };

  return (
    <Dialog open onClose={() => cancel(onEdit, 'EDIT')} labelledBy="safety-net-title">
      <div className="stack" style={{ '--gap': 'var(--s-5)' }}>
        <div className="row" style={{ '--gap': 'var(--s-3)', alignItems: 'flex-start' }}>
          <span className="icon-chip" style={{ background: 'var(--warn-100)', color: 'var(--warn-700)' }}><ShieldAlert size={24} /></span>
          <div className="stack" style={{ '--gap': '6px', flex: 1 }}>
            <h2 id="safety-net-title" className="h-section">{title || t("Let's check this together first", 'আগে একসাথে যাচাই করি', 'पहले साथ में जांच लें', 'Cùng kiểm tra trước nhé')}</h2>
            <div className="row">
              <span className="badge badge-brand">{t('Practice only — no real money moves', 'শুধু অনুশীলন — আসল টাকা যাবে না', 'केवल अभ्यास — असली पैसा नहीं जाएगा', 'Chỉ luyện tập — không chuyển tiền thật')}</span>
              {proposal && <RiskBadge severity={RISK_FROM_LEVEL[proposal.riskLevel]} t={t} />}
            </div>
          </div>
        </div>

        {phase === 'creating' && <p className="text-muted">{t('Checking this with Guidia’s safety rules…', 'Guidia-র নিরাপত্তা নিয়মে যাচাই হচ্ছে…', 'Guidia के सुरक्षा नियमों से जांच हो रही है…', 'Đang kiểm tra với quy tắc an toàn của Guidia…')}</p>}

        {(phase === 'review' || phase === 'confirming') && proposal && (
          <>
            <dl className="stack" style={{ '--gap': 'var(--s-3)', margin: 0 }}>
              {[
                [t('What are you doing?', 'আপনি কী করছেন?', 'आप क्या कर रहे हैं?', 'Bạn đang làm gì?'), what],
                [t('Who receives it?', 'কে পাবে?', 'किसे मिलेगा?', 'Ai nhận?'), who],
                [t('How much?', 'কত?', 'कितना?', 'Bao nhiêu?'), checks[0].value],
              ].map(([k, v]) => (
                <div key={k} className="row-between" style={{ padding: 'var(--s-3) 0', borderBottom: '1px solid var(--border)' }}>
                  <dt className="text-muted">{k}</dt>
                  <dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>{v}</dd>
                </div>
              ))}
            </dl>

            {proposal.requiresGuardian && (
              <Alert tone="info" icon={Users} title={t('Your guardian will be asked to approve', 'আপনার গার্ডিয়ানের অনুমোদন লাগবে', 'आपके अभिभावक की मंज़ूरी ली जाएगी', 'Người giám hộ sẽ được hỏi ý kiến')}>
                {t('You chose this for amounts like this one. You can change it in Trusted people.', 'এ রকম পরিমাণের জন্য আপনি এটি বেছে নিয়েছিলেন। বিশ্বস্ত মানুষ পাতায় বদলাতে পারেন।', 'आपने इस तरह की रकम के लिए यह चुना था। भरोसेमंद लोग में बदल सकते हैं।', 'Bạn đã chọn điều này cho số tiền như vậy. Có thể đổi trong Người tin cậy.')}
              </Alert>
            )}

            <div className="card card-soft card-flat stack" style={{ '--gap': 'var(--s-3)' }}>
              <div className="row-between">
                <p className="eyebrow">{t(`Check ${given + 1} of ${level}`, `যাচাই ${given + 1} / ${level}`, `जांच ${given + 1} / ${level}`, `Kiểm tra ${given + 1}/${level}`)}</p>
              </div>
              <StepDots total={level} current={given} />
              <p className="h-card">{currentCheck.title}</p>
              {currentCheck.value && <p>{currentCheck.value}</p>}
            </div>

            <div className="stack" style={{ '--gap': 'var(--s-3)' }}>
              <button type="button" className="btn btn-primary btn-lg btn-block" onClick={confirm} disabled={phase === 'confirming'}>
                {given + 1 < level ? t('Yes, that is correct', 'হ্যাঁ, এটি ঠিক', 'हाँ, यह सही है', 'Đúng, chính xác') : t('Yes, continue', 'হ্যাঁ, এগিয়ে যান', 'हाँ, आगे बढ़ें', 'Đúng, tiếp tục')} <ArrowRight size={22} />
              </button>
              <div className="row" style={{ '--gap': 'var(--s-2)' }}>
                <button type="button" className="btn btn-quiet" style={{ flex: 1 }} onClick={() => cancel(onEdit, 'EDIT')}><Pencil size={20} /> {t('Change details', 'তথ্য বদলান', 'जानकारी बदलें', 'Sửa thông tin')}</button>
                <button type="button" className="btn btn-quiet" style={{ flex: 1 }} onClick={() => cancel(onRequestHelp, 'HELP')}><LifeBuoy size={20} /> {t('Ask for help', 'সাহায্য চান', 'मदद मांगें', 'Nhờ giúp đỡ')}</button>
              </div>
            </div>
          </>
        )}

        {phase === 'waiting' && (
          <div className="stack" style={{ '--gap': 'var(--s-4)' }}>
            <Alert tone="info" icon={Clock} title={t('Waiting for your guardian', 'আপনার গার্ডিয়ানের জন্য অপেক্ষা', 'आपके अभिभावक का इंतज़ार', 'Đang chờ người giám hộ')}>
              {t('They have been notified. This page will update by itself — you can also come back later.', 'তাঁকে জানানো হয়েছে। এই পাতা নিজে থেকেই বদলাবে — পরে ফিরেও আসতে পারেন।', 'उन्हें सूचना दी गई है। यह पेज अपने आप बदलेगा — आप बाद में भी लौट सकते हैं।', 'Họ đã được thông báo. Trang này sẽ tự cập nhật — bạn cũng có thể quay lại sau.')}
            </Alert>
            <button type="button" className="btn btn-quiet btn-block" onClick={() => cancel(onEdit, 'EDIT')}><X size={20} /> {t('Cancel this practice', 'এই অনুশীলন বাতিল করুন', 'यह अभ्यास रद्द करें', 'Hủy lần luyện tập này')}</button>
          </div>
        )}

        {phase === 'rejected' && (
          <div className="stack" style={{ '--gap': 'var(--s-4)' }}>
            <Alert tone="warn" title={t('Your guardian would like to talk first', 'আপনার গার্ডিয়ান আগে কথা বলতে চান', 'आपके अभिभावक पहले बात करना चाहते हैं', 'Người giám hộ muốn nói chuyện trước')}>
              {t('Nothing was sent. That is a safe outcome — a quick chat can clear things up.', 'কিছুই পাঠানো হয়নি। এটি নিরাপদ ফল — একটু কথা বললেই পরিষ্কার হবে।', 'कुछ नहीं भेजा गया। यह सुरक्षित नतीजा है — थोड़ी बात से सब साफ हो जाएगा।', 'Không có gì được gửi. Đây là kết quả an toàn — trò chuyện một chút là rõ.')}
            </Alert>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => onEdit?.()}>{t('Back', 'ফিরে যান', 'वापस', 'Quay lại')}</button>
          </div>
        )}

        {phase === 'error' && (
          <div className="stack" style={{ '--gap': 'var(--s-4)' }}>
            <Alert tone="warn" title={t('This practice can’t continue right now', 'এই অনুশীলন এখন চালানো যাচ্ছে না', 'यह अभ्यास अभी जारी नहीं हो सकता', 'Hiện chưa thể tiếp tục bài luyện tập này')}>{error}</Alert>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => onEdit?.()}>{t('Back', 'ফিরে যান', 'वापस', 'Quay lại')}</button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
