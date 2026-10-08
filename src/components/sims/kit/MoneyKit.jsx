/* eslint-disable react-refresh/only-export-components -- shared money-app flows and their helpers */
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Check, CheckCircle2, ChevronRight, Contact, Delete, Phone, PhoneOff, QrCode, ShieldAlert, ShieldCheck, Store, Zap,
} from 'lucide-react';
import { AppBar, HoldToConfirm, PinPad, Screen, StatusBar, T, Tap, money, useSim, useStack } from './SimKit';

// Shared flows for the practice money apps (bKash, Nagad, MoMo, Google Pay,
// PayPal). Each app passes its brand — colours, words, currency, how the
// final confirmation works — and keeps its own home screen. Pretend money.
//
// Actions reported: open_send_money, choose_recipient, enter_amount,
// review_payment, enter_pin, hold_confirm | confirm_payment, payment_done,
// open_recharge, choose_operator, open_pay_bill, choose_biller, enter_bill_code,
// open_scan, scan_qr, open_statement, tap_balance, decline_scam_call,
// hang_up_scam, mistake_share_otp.

export const PEOPLE = {
  BD: [
    { id: 'rupa', name: 'Rupa (Daughter)', bn: 'রূপা (মেয়ে)', phone: '01711-234567', color: '#e57373' },
    { id: 'rahim', name: 'Rahim (Son)', bn: 'রহিম (ছেলে)', phone: '01819-765432', color: '#64b5f6' },
    { id: 'shop', name: 'Karim Store', bn: 'করিম স্টোর', phone: '01900-112233', color: '#81c784' },
  ],
  IN: [
    { id: 'rupa', name: 'Priya (Daughter)', hi: 'प्रिया (बेटी)', phone: '98110 23456', color: '#e57373' },
    { id: 'rahim', name: 'Rahul (Son)', hi: 'राहुल (बेटा)', phone: '98201 76543', color: '#64b5f6' },
    { id: 'shop', name: 'Sharma General Store', hi: 'शर्मा जनरल स्टोर', phone: '99300 11223', color: '#81c784' },
  ],
  VN: [
    { id: 'rupa', name: 'Lan (con gái)', phone: '0912 345 678', color: '#e57373' },
    { id: 'rahim', name: 'Minh (con trai)', phone: '0987 654 321', color: '#64b5f6' },
    { id: 'shop', name: 'Tạp hóa Hòa', phone: '0903 112 233', color: '#81c784' },
  ],
  US: [
    { id: 'rupa', name: 'Emma (Daughter)', phone: 'emma@example.com', color: '#e57373' },
    { id: 'rahim', name: 'James (Son)', phone: 'james@example.com', color: '#64b5f6' },
    { id: 'shop', name: 'Corner Books', phone: 'shop@cornerbooks.example', color: '#81c784' },
  ],
};
export const personName = (p, language) => p[language] || p.name;

const txId = () => Math.random().toString(36).slice(2, 12).toUpperCase();

/** Wallet state: balance + history. */
export function useWallet(start) {
  const [balance, setBalance] = useState(start);
  const [history, setHistory] = useState([]);
  const record = (entry) => {
    setBalance((b) => b - entry.amount - (entry.fee || 0));
    setHistory((h) => [{ id: txId(), time: new Date(), ...entry }, ...h]);
  };
  return { balance, history, record };
}

/** The balance pill most wallets use: hidden until tapped, hides again. */
export function BalancePill({ balance, brand, dark = true }) {
  const { t, language, emit } = useSim();
  const [shown, setShown] = useState(false);
  useEffect(() => { if (!shown) return undefined; const id = setTimeout(() => setShown(false), 4000); return () => clearTimeout(id); }, [shown]);
  return (
    <Tap className={`mk-balance ${dark ? 'is-dark' : ''}`} style={{ '--c': brand.color }} act="tap_balance" onClick={() => { setShown(true); emit('tap_balance'); }}
      explain={T('Shows your balance for a few seconds, then hides it again so others can\'t see.', 'কয়েক সেকেন্ডের জন্য ব্যালেন্স দেখায়, তারপর আবার লুকিয়ে যায় যাতে অন্যরা না দেখে।', 'कुछ सेकंड के लिए बैलेंस दिखाता है, फिर छिप जाता है ताकि दूसरे न देखें।', 'Hiện số dư vài giây rồi ẩn lại để người khác không thấy.')}>
      {shown ? <strong>{money(balance, brand.currency, language)}</strong> : <span>{t(...brand.words.tapBalance)}</span>}
    </Tap>
  );
}

function Keypad({ value, onChange, max = 9 }) {
  const press = (k) => {
    if (k === 'del') onChange(value.slice(0, -1));
    else if (value.length < max) onChange(value + k);
  };
  return (
    <div className="mk-keypad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del'].map((k) => (
        <button key={k} type="button" className="mk-key" onClick={() => press(k)} aria-label={k === 'del' ? 'Delete' : k}>{k === 'del' ? <Delete size={20} /> : k}</button>
      ))}
    </div>
  );
}

function Success({ brand, title, rows, onDone }) {
  const { t, emit } = useSim();
  useEffect(() => { emit('payment_done'); }, [emit]);
  return (
    <div className="sim-scroll">
      <div className="sim-success">
        <span className="sim-success-icon" style={{ background: brand.color }}><Check size={40} strokeWidth={3} /></span>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{title}</p>
        <p style={{ margin: 0, color: '#667781' }}>{t('Practice only — no real money moved.', 'শুধু অনুশীলন — আসল টাকা যায়নি।', 'सिर्फ़ अभ्यास — असली पैसा नहीं गया।', 'Chỉ luyện tập — không có tiền thật nào được chuyển.')}</p>
      </div>
      <div className="mk-receipt">
        {rows.map(([k, v]) => <div key={k} className="mk-receipt-row"><span>{k}</span><strong>{v}</strong></div>)}
      </div>
      <div className="sim-pad"><Tap className="sim-primary" style={{ background: brand.color }} act="finish_payment" onClick={onDone}>{t('Back to home', 'হোমে ফিরুন', 'होम पर वापस', 'Về trang chủ')}</Tap></div>
    </div>
  );
}

/**
 * Send money: recipient → amount → note → review → PIN → confirm → receipt.
 * brand.confirm: 'hold' (bKash, Nagad) or 'button'.
 */
export function SendMoneyFlow({ brand, wallet, onExit, region = 'BD', title }) {
  const { t, language, emit, showToast } = useSim();
  const nav = useStack('to');
  const people = PEOPLE[region];
  const [to, setTo] = useState(null);
  const [typed, setTyped] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const fee = brand.sendFee ? brand.sendFee(Number(amount || 0)) : 0;
  const amt = Number(amount || 0);
  const name = to ? personName(to, language) : '';
  const head = title || t(...brand.words.sendMoney);

  const pick = (p) => { setTo(p); emit('choose_recipient'); nav.push('amount'); };

  return (
    <div className="mk-flow" style={{ '--accent': brand.color }}>
      <StatusBar dark bg={brand.color} />
      <AppBar bg={brand.color} title={head} onBack={nav.depth > 1 && nav.screen !== 'done' ? nav.back : onExit} />
      {nav.screen === 'to' && (
        <Screen nav={nav}>
          <div className="sim-pad sim-stack">
            <label className="sim-label" htmlFor="mk-to">{brand.region === 'US' ? t('Name, email or phone', 'নাম, ইমেইল বা ফোন', 'नाम, ईमेल या फोन', 'Tên, email hoặc số điện thoại') : t('Enter name or number', 'নাম বা নম্বর লিখুন', 'नाम या नंबर लिखें', 'Nhập tên hoặc số điện thoại')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input id="mk-to" className="sim-field" data-act="enter_number" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={people[0].phone} inputMode={brand.region === 'US' ? 'email' : 'tel'} />
              <Tap className="sim-icon-btn mk-arrow" style={{ background: brand.color, color: '#fff', borderRadius: 12, width: 50, height: 50 }} act="choose_recipient" disabled={typed.replace(/\D/g, '').length < 6 && !typed.includes('@')}
                onClick={() => { setTo({ id: 'typed', name: typed, phone: typed, color: '#90a4ae' }); nav.push('amount'); }} label={t('Next', 'পরের ধাপ', 'आगे', 'Tiếp')}><ChevronRight size={22} /></Tap>
            </div>
            <p className="sim-label" style={{ marginTop: 6 }}>{t('Recent and saved', 'সাম্প্রতিক ও সেভ করা', 'हाल के और सेव किए', 'Gần đây và đã lưu')}</p>
            {people.map((p) => (
              <Tap key={p.id} className="sim-row mk-person" act={`choose_recipient choose_${p.id}`} onClick={() => pick(p)}
                explain={T('A saved person. Tap to send them money — you will check everything before paying.', 'সেভ করা মানুষ। টাকা পাঠাতে চাপুন — পেমেন্টের আগে সব মিলিয়ে নেবেন।', 'सेव किया व्यक्ति। पैसे भेजने के लिए टैप करें — भुगतान से पहले सब जांचेंगे।', 'Người đã lưu. Chạm để chuyển tiền — bạn sẽ kiểm tra hết trước khi trả.')}>
                <span className="sim-avatar sm" style={{ background: p.color }}>{personName(p, language).slice(0, 1)}</span>
                <span className="sim-row-main"><span className="sim-row-title">{personName(p, language)}</span><span className="sim-row-sub">{p.phone}</span></span>
                <ChevronRight size={18} color="#9aa5ab" />
              </Tap>
            ))}
          </div>
        </Screen>
      )}
      {nav.screen === 'amount' && (
        <Screen nav={nav}>
          <div className="mk-to-card">
            <span className="sim-avatar sm" style={{ background: to?.color }}>{name.slice(0, 1)}</span>
            <span className="sim-row-main"><span className="sim-row-title">{name}</span><span className="sim-row-sub">{to?.phone}</span></span>
          </div>
          <div className="mk-amount">
            <span className="mk-currency">{brand.symbol}</span>
            <span className="mk-amount-value">{amount ? Number(amount).toLocaleString(brand.locale) : '0'}</span>
          </div>
          <p className="mk-avail">{t('Available balance', 'বর্তমান ব্যালেন্স', 'उपलब्ध बैलेंस', 'Số dư khả dụng')}: {money(wallet.balance, brand.currency, language)}</p>
          <div className="mk-quick">
            {brand.quickAmounts.map((q) => <Tap key={q} className="sim-chip" act="enter_amount" onClick={() => { setAmount(String(q)); emit('enter_amount'); }}>{brand.symbol}{q.toLocaleString(brand.locale)}</Tap>)}
          </div>
          <Keypad value={amount} onChange={(v) => { setAmount(v); if (v) emit('enter_amount'); }} />
          <div className="sim-pad" style={{ paddingTop: 8 }}>
            <Tap className="sim-primary" style={{ background: brand.color }} act="amount_next" disabled={!amt || amt > wallet.balance}
              onClick={() => (amt > wallet.balance ? showToast(t('Not enough balance', 'যথেষ্ট ব্যালেন্স নেই', 'बैलेंस कम है', 'Không đủ số dư')) : nav.push('note'))}>
              {t('Next', 'পরের ধাপ', 'आगे', 'Tiếp tục')}
            </Tap>
          </div>
        </Screen>
      )}
      {nav.screen === 'note' && (
        <Screen nav={nav}>
          <div className="sim-pad sim-stack">
            <label className="sim-label" htmlFor="mk-note">{t('Reference (optional)', 'রেফারেন্স (ঐচ্ছিক)', 'रेफ़रेंस (वैकल्पिक)', 'Lời nhắn (không bắt buộc)')}</label>
            <input id="mk-note" className="sim-field" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('e.g. Medicine', 'যেমন: ওষুধ', 'जैसे: दवाई', 'ví dụ: Tiền thuốc')} maxLength={50} />
            <Tap className="sim-primary" style={{ background: brand.color }} act="review_payment" onClick={() => nav.push('review')}>{t('Review payment', 'পেমেন্ট মিলিয়ে নিন', 'भुगतान जांचें', 'Xem lại giao dịch')}</Tap>
          </div>
        </Screen>
      )}
      {nav.screen === 'review' && (
        <Screen nav={nav}>
          <div className="sim-scroll sim-pad sim-stack">
            <p className="mk-review-title">{t('Check before you pay', 'টাকা দেওয়ার আগে মিলিয়ে নিন', 'भुगतान से पहले जांच लें', 'Kiểm tra trước khi trả')}</p>
            <div className="mk-receipt">
              <div className="mk-receipt-row"><span>{t('To', 'প্রাপক', 'किसे', 'Người nhận')}</span><strong>{name}</strong></div>
              <div className="mk-receipt-row"><span>{brand.region === 'US' ? t('Email', 'ইমেইল', 'ईमेल', 'Email') : t('Number', 'নম্বর', 'नंबर', 'Số')}</span><strong>{to?.phone}</strong></div>
              <div className="mk-receipt-row"><span>{t('Amount', 'পরিমাণ', 'रकम', 'Số tiền')}</span><strong>{money(amt, brand.currency, language)}</strong></div>
              <div className="mk-receipt-row"><span>{t('Charge', 'চার্জ', 'शुल्क', 'Phí')}</span><strong>{money(fee, brand.currency, language)}</strong></div>
              {note && <div className="mk-receipt-row"><span>{t('Reference', 'রেফারেন্স', 'रेफ़रेंस', 'Lời nhắn')}</span><strong>{note}</strong></div>}
              <div className="mk-receipt-row mk-total"><span>{t('Total', 'মোট', 'कुल', 'Tổng')}</span><strong>{money(amt + fee, brand.currency, language)}</strong></div>
            </div>
            <p className="sim-safety"><ShieldCheck size={16} />{t('Is this the right person and the right amount? Once sent, money cannot be taken back.', 'ঠিক মানুষ আর ঠিক পরিমাণ তো? একবার গেলে টাকা আর ফেরত আনা যায় না।', 'सही व्यक्ति और सही रकम है न? एक बार गया पैसा वापस नहीं आता।', 'Đúng người, đúng số tiền chưa? Tiền đã gửi thì không lấy lại được.')}</p>
            <Tap className="sim-primary" style={{ background: brand.color }} act="go_to_pin" onClick={() => nav.push('pin')}>{t('Continue to PIN', 'পিন দিতে এগিয়ে যান', 'पिन के लिए आगे बढ़ें', 'Tiếp tục nhập PIN')}</Tap>
            <Tap className="sim-secondary" onClick={nav.back}>{t('Change something', 'কিছু বদলাতে চাই', 'कुछ बदलना है', 'Sửa lại')}</Tap>
          </div>
        </Screen>
      )}
      {nav.screen === 'pin' && (
        <Screen nav={nav}>
          <PinPad length={brand.pinLength} color={brand.color} title={brand.pinTitle ? t(...brand.pinTitle) : undefined} onDone={() => nav.push('confirm')} />
        </Screen>
      )}
      {nav.screen === 'confirm' && (
        <Screen nav={nav}>
          <div className="sim-pad sim-stack" style={{ flex: 1, justifyContent: 'center' }}>
            <p className="mk-review-title" style={{ textAlign: 'center' }}>{t(`Send ${money(amt, brand.currency, language)} to ${name}?`, `${name}-কে ${money(amt, brand.currency, language)} পাঠাবেন?`, `${name} को ${money(amt, brand.currency, language)} भेजें?`, `Gửi ${money(amt, brand.currency, language)} cho ${name}?`)}</p>
            {brand.confirm === 'hold' ? (
              <HoldToConfirm color={brand.color} label={t('Tap and hold to send', 'চেপে ধরে পাঠান', 'दबाकर रखें और भेजें', 'Nhấn giữ để gửi')} onConfirm={() => { wallet.record({ kind: 'send', to: name, amount: amt, fee }); nav.replace('done'); }}
                explain={T('Holding on purpose stops accidental payments. The money goes when the bar fills.', 'ইচ্ছে করে চেপে ধরতে হয়, তাই ভুল করে টাকা যায় না। দাগ ভরে গেলেই টাকা চলে যায়।', 'जानबूझकर दबाकर रखना होता है, इसलिए गलती से पैसे नहीं जाते। पट्टी भरते ही पैसे चले जाते हैं।', 'Phải cố ý giữ nên không chuyển nhầm. Thanh đầy là tiền đi.')} />
            ) : (
              <Tap className="sim-primary" style={{ background: brand.color, minHeight: 58 }} act="confirm_payment" onClick={() => { wallet.record({ kind: 'send', to: name, amount: amt, fee }); nav.replace('done'); }}>{t(...brand.words.confirm)}</Tap>
            )}
            <Tap className="sim-secondary" onClick={onExit}>{t('Cancel', 'বাতিল', 'रद्द करें', 'Hủy')}</Tap>
          </div>
        </Screen>
      )}
      {nav.screen === 'done' && (
        <Screen nav={nav}>
          <Success brand={brand} title={t('Money sent', 'টাকা পাঠানো হয়েছে', 'पैसे भेज दिए', 'Đã chuyển tiền')} onDone={onExit} rows={[
            [t('To', 'প্রাপক', 'किसे', 'Người nhận'), name],
            [t('Amount', 'পরিমাণ', 'रकम', 'Số tiền'), money(amt, brand.currency, language)],
            [t('Transaction ID', 'লেনদেন আইডি', 'ट्रांज़ैक्शन आईडी', 'Mã giao dịch'), wallet.history[0]?.id || '—'],
          ]} />
        </Screen>
      )}
    </div>
  );
}

/** Mobile recharge: number → operator → amount → PIN → confirm → done. */
export function RechargeFlow({ brand, wallet, onExit, operators, ownNumber }) {
  const { t, language, emit } = useSim();
  const nav = useStack('number');
  const [num, setNum] = useState(ownNumber);
  const [op, setOp] = useState(null);
  const [amount, setAmount] = useState('');
  const amt = Number(amount || 0);
  return (
    <div className="mk-flow" style={{ '--accent': brand.color }}>
      <StatusBar dark bg={brand.color} />
      <AppBar bg={brand.color} title={t(...brand.words.recharge)} onBack={nav.depth > 1 && nav.screen !== 'done' ? nav.back : onExit} />
      {nav.screen === 'number' && (
        <Screen nav={nav}>
          <div className="sim-pad sim-stack">
            <label className="sim-label" htmlFor="mk-num">{t('Mobile number', 'মোবাইল নম্বর', 'मोबाइल नंबर', 'Số điện thoại')}</label>
            <input id="mk-num" className="sim-field" inputMode="tel" value={num} onChange={(e) => setNum(e.target.value)} />
            <p className="sim-label">{t('Operator', 'অপারেটর', 'ऑपरेटर', 'Nhà mạng')}</p>
            <div className="mk-ops">
              {operators.map((o) => (
                <Tap key={o.id} className="mk-op" aria-pressed={op === o.id} act="choose_operator" onClick={() => { setOp(o.id); nav.push('amount'); }} style={{ '--op': o.color }}>
                  <span className="mk-op-logo">{o.short}</span><span>{o.name}</span>
                </Tap>
              ))}
            </div>
          </div>
        </Screen>
      )}
      {nav.screen === 'amount' && (
        <Screen nav={nav}>
          <div className="mk-amount"><span className="mk-currency">{brand.symbol}</span><span className="mk-amount-value">{amount || '0'}</span></div>
          <div className="mk-quick">{brand.rechargeAmounts.map((q) => <Tap key={q} className="sim-chip" act="enter_amount" onClick={() => { setAmount(String(q)); emit('enter_amount'); }}>{brand.symbol}{q}</Tap>)}</div>
          <Keypad value={amount} onChange={(v) => { setAmount(v); if (v) emit('enter_amount'); }} max={5} />
          <div className="sim-pad"><Tap className="sim-primary" style={{ background: brand.color }} act="go_to_pin" disabled={!amt || amt > wallet.balance} onClick={() => nav.push('pin')}>{t('Next', 'পরের ধাপ', 'आगे', 'Tiếp tục')}</Tap></div>
        </Screen>
      )}
      {nav.screen === 'pin' && <Screen nav={nav}><PinPad length={brand.pinLength} color={brand.color} onDone={() => nav.push('confirm')} /></Screen>}
      {nav.screen === 'confirm' && (
        <Screen nav={nav}>
          <div className="sim-pad sim-stack" style={{ flex: 1, justifyContent: 'center' }}>
            <p className="mk-review-title" style={{ textAlign: 'center' }}>{t(`Recharge ${money(amt, brand.currency, language)} to ${num}?`, `${num} নম্বরে ${money(amt, brand.currency, language)} রিচার্জ করবেন?`, `${num} पर ${money(amt, brand.currency, language)} रिचार्ज करें?`, `Nạp ${money(amt, brand.currency, language)} cho ${num}?`)}</p>
            {brand.confirm === 'hold'
              ? <HoldToConfirm color={brand.color} label={t('Tap and hold to recharge', 'চেপে ধরে রিচার্জ করুন', 'दबाकर रखें और रिचार्ज करें', 'Nhấn giữ để nạp')} onConfirm={() => { wallet.record({ kind: 'recharge', to: num, amount: amt }); nav.replace('done'); }} />
              : <Tap className="sim-primary" style={{ background: brand.color }} act="confirm_payment" onClick={() => { wallet.record({ kind: 'recharge', to: num, amount: amt }); nav.replace('done'); }}>{t(...brand.words.confirm)}</Tap>}
          </div>
        </Screen>
      )}
      {nav.screen === 'done' && <Screen nav={nav}><Success brand={brand} title={t('Recharge successful', 'রিচার্জ হয়েছে', 'रिचार्ज हो गया', 'Nạp tiền thành công')} onDone={onExit} rows={[[t('Number', 'নম্বর', 'नंबर', 'Số'), num], [t('Amount', 'পরিমাণ', 'रकम', 'Số tiền'), money(amt, brand.currency, language)]]} /></Screen>}
    </div>
  );
}

/** Pay a bill: biller → customer code → bill → PIN → confirm → done. */
export function PayBillFlow({ brand, wallet, onExit, billers }) {
  const { t, language, emit } = useSim();
  const nav = useStack('billers');
  const [biller, setBiller] = useState(null);
  const [code, setCode] = useState('');
  const due = useMemo(() => brand.billAmount || 1250, [brand.billAmount]);
  return (
    <div className="mk-flow" style={{ '--accent': brand.color }}>
      <StatusBar dark bg={brand.color} />
      <AppBar bg={brand.color} title={t(...brand.words.payBill)} onBack={nav.depth > 1 && nav.screen !== 'done' ? nav.back : onExit} />
      {nav.screen === 'billers' && (
        <Screen nav={nav}>
          <div className="sim-scroll">
            {billers.map((b) => (
              <Tap key={b.id} className="sim-row" act={`choose_biller choose_biller_${b.id}`} onClick={() => { setBiller(b); nav.push('code'); }}>
                <span className="sim-avatar sm" style={{ background: b.color }}><Zap size={18} /></span>
                <span className="sim-row-main"><span className="sim-row-title">{b.name}</span><span className="sim-row-sub">{t(...b.kind)}</span></span><ChevronRight size={18} color="#9aa5ab" />
              </Tap>
            ))}
          </div>
        </Screen>
      )}
      {nav.screen === 'code' && (
        <Screen nav={nav}>
          <div className="sim-pad sim-stack">
            <p className="sim-row-title">{biller?.name}</p>
            <label className="sim-label" htmlFor="mk-code">{t('Customer / account number (on your paper bill)', 'গ্রাহক / অ্যাকাউন্ট নম্বর (কাগজের বিলে লেখা)', 'ग्राहक / खाता नंबर (कागज़ के बिल पर)', 'Mã khách hàng (in trên hóa đơn giấy)')}</label>
            <input id="mk-code" className="sim-field" data-act="enter_bill_code" inputMode="numeric" value={code} onChange={(e) => { if (!code && e.target.value) emit('enter_bill_code'); setCode(e.target.value); }} placeholder="1029384756" />
            <Tap className="sim-primary" style={{ background: brand.color }} act="check_bill" disabled={code.length < 4} onClick={() => nav.push('bill')}>{t('Check bill', 'বিল দেখুন', 'बिल देखें', 'Xem hóa đơn')}</Tap>
          </div>
        </Screen>
      )}
      {nav.screen === 'bill' && (
        <Screen nav={nav}>
          <div className="sim-pad sim-stack">
            <div className="mk-receipt">
              <div className="mk-receipt-row"><span>{t('Biller', 'বিলার', 'बिलर', 'Nhà cung cấp')}</span><strong>{biller?.name}</strong></div>
              <div className="mk-receipt-row"><span>{t('Customer', 'গ্রাহক', 'ग्राहक', 'Khách hàng')}</span><strong>{code}</strong></div>
              <div className="mk-receipt-row mk-total"><span>{t('Amount due', 'বকেয়া', 'बकाया', 'Số tiền phải trả')}</span><strong>{money(due, brand.currency, language)}</strong></div>
            </div>
            <p className="sim-safety"><ShieldCheck size={16} />{t('Check the name and amount match your paper bill.', 'নাম আর টাকার পরিমাণ কাগজের বিলের সাথে মিলিয়ে নিন।', 'नाम और रकम कागज़ के बिल से मिलाएं।', 'Kiểm tra tên và số tiền khớp với hóa đơn giấy.')}</p>
            <Tap className="sim-primary" style={{ background: brand.color }} act="go_to_pin" onClick={() => nav.push('pin')}>{t('Pay bill', 'বিল দিন', 'बिल भरें', 'Thanh toán')}</Tap>
          </div>
        </Screen>
      )}
      {nav.screen === 'pin' && <Screen nav={nav}><PinPad length={brand.pinLength} color={brand.color} onDone={() => nav.push('confirm')} /></Screen>}
      {nav.screen === 'confirm' && (
        <Screen nav={nav}>
          <div className="sim-pad sim-stack" style={{ flex: 1, justifyContent: 'center' }}>
            {brand.confirm === 'hold'
              ? <HoldToConfirm color={brand.color} label={t('Tap and hold to pay', 'চেপে ধরে পেমেন্ট করুন', 'दबाकर रखें और भुगतान करें', 'Nhấn giữ để trả')} onConfirm={() => { wallet.record({ kind: 'bill', to: biller?.name, amount: due }); nav.replace('done'); }} />
              : <Tap className="sim-primary" style={{ background: brand.color }} act="confirm_payment" onClick={() => { wallet.record({ kind: 'bill', to: biller?.name, amount: due }); nav.replace('done'); }}>{t(...brand.words.confirm)}</Tap>}
          </div>
        </Screen>
      )}
      {nav.screen === 'done' && <Screen nav={nav}><Success brand={brand} title={t('Bill paid', 'বিল দেওয়া হয়েছে', 'बिल भर दिया', 'Đã thanh toán hóa đơn')} onDone={onExit} rows={[[t('Biller', 'বিলার', 'बिलर', 'Nhà cung cấp'), biller?.name], [t('Amount', 'পরিমাণ', 'रकम', 'Số tiền'), money(due, brand.currency, language)]]} /></Screen>}
    </div>
  );
}

/** Scan a shop's QR: viewfinder → shop found → amount → PIN → confirm → done. */
export function ScanPayFlow({ brand, wallet, onExit, shop }) {
  const { t, language, emit } = useSim();
  const nav = useStack('scan');
  const [amount, setAmount] = useState('');
  const amt = Number(amount || 0);
  return (
    <div className="mk-flow" style={{ '--accent': brand.color }}>
      {nav.screen === 'scan' && (
        <Screen nav={nav} style={{ background: '#111', color: '#fff' }}>
          <StatusBar dark bg="#111" />
          <AppBar bg="#111" onBack={onExit} title={t('Scan QR code', 'কিউআর কোড স্ক্যান', 'QR कोड स्कैन', 'Quét mã QR')} />
          <div className="mk-scan">
            <Tap className="mk-scan-frame" act="scan_qr" onClick={() => { emit('scan_qr'); nav.push('amount'); }}
              explain={T('Point the camera at the shop\'s QR code. Here, tap the square to "scan" it.', 'দোকানের কিউআর কোডের দিকে ক্যামেরা ধরুন। এখানে "স্ক্যান" করতে বর্গে চাপুন।', 'दुकान के QR कोड की ओर कैमरा रखें। यहां "स्कैन" के लिए चौकोर पर टैप करें।', 'Hướng camera vào mã QR của cửa hàng. Ở đây, chạm khung vuông để "quét".')}>
              <QrCode size={120} />
            </Tap>
            <p className="mk-scan-hint">{t('Point at the shop\'s QR code (tap the square to scan)', 'দোকানের কিউআর কোডের দিকে ধরুন (স্ক্যান করতে বর্গে চাপুন)', 'दुकान के QR कोड की ओर रखें (स्कैन के लिए चौकोर पर टैप करें)', 'Hướng vào mã QR của cửa hàng (chạm khung để quét)')}</p>
          </div>
        </Screen>
      )}
      {nav.screen !== 'scan' && <><StatusBar dark bg={brand.color} /><AppBar bg={brand.color} title={t('Pay', 'পেমেন্ট', 'भुगतान', 'Thanh toán')} onBack={nav.screen === 'done' ? onExit : nav.back} /></>}
      {nav.screen === 'amount' && (
        <Screen nav={nav}>
          <div className="mk-to-card"><span className="sim-avatar sm" style={{ background: '#81c784' }}><Store size={18} /></span><span className="sim-row-main"><span className="sim-row-title">{shop}</span><span className="sim-row-sub"><CheckCircle2 size={13} color="#1e8e3e" /> {t('Verified merchant', 'যাচাই করা দোকান', 'जांची हुई दुकान', 'Cửa hàng đã xác minh')}</span></span></div>
          <p className="sim-safety" style={{ margin: '0 16px' }}><ShieldCheck size={16} />{t('Is this the shop you are standing in? Check the name first.', 'আপনি যে দোকানে আছেন এটা কি সেটাই? আগে নাম মিলিয়ে নিন।', 'क्या यह वही दुकान है जहां आप हैं? पहले नाम जांचें।', 'Có đúng cửa hàng bạn đang đứng không? Kiểm tra tên trước.')}</p>
          <div className="mk-amount"><span className="mk-currency">{brand.symbol}</span><span className="mk-amount-value">{amount ? Number(amount).toLocaleString(brand.locale) : '0'}</span></div>
          <div className="mk-quick">{brand.quickAmounts.slice(0, 3).map((q) => <Tap key={q} className="sim-chip" act="enter_amount" onClick={() => { setAmount(String(q)); emit('enter_amount'); }}>{brand.symbol}{q.toLocaleString(brand.locale)}</Tap>)}</div>
          <Keypad value={amount} onChange={(v) => { setAmount(v); if (v) emit('enter_amount'); }} />
          <div className="sim-pad"><Tap className="sim-primary" style={{ background: brand.color }} act="go_to_pin" disabled={!amt || amt > wallet.balance} onClick={() => nav.push('pin')}>{t('Pay', 'পেমেন্ট করুন', 'भुगतान करें', 'Thanh toán')}</Tap></div>
        </Screen>
      )}
      {nav.screen === 'pin' && <Screen nav={nav}><PinPad length={brand.pinLength} color={brand.color} onDone={() => { wallet.record({ kind: 'qr', to: shop, amount: amt }); nav.replace('done'); }} /></Screen>}
      {nav.screen === 'done' && <Screen nav={nav}><Success brand={brand} title={t('Paid', 'পেমেন্ট হয়েছে', 'भुगतान हो गया', 'Đã thanh toán')} onDone={onExit} rows={[[t('Shop', 'দোকান', 'दुकान', 'Cửa hàng'), shop], [t('Amount', 'পরিমাণ', 'रकम', 'Số tiền'), money(amt, brand.currency, language)]]} /></Screen>}
    </div>
  );
}

/** Statement: every practice payment, newest first. */
export function Statement({ brand, wallet, onExit }) {
  const { t, language } = useSim();
  const kinds = { send: T('Sent money', 'টাকা পাঠানো', 'पैसे भेजे', 'Chuyển tiền'), recharge: T('Mobile recharge', 'মোবাইল রিচার্জ', 'मोबाइल रिचार्ज', 'Nạp điện thoại'), bill: T('Bill payment', 'বিল পরিশোধ', 'बिल भुगतान', 'Thanh toán hóa đơn'), qr: T('Shop payment', 'দোকানে পেমেন্ট', 'दुकान पर भुगतान', 'Thanh toán cửa hàng') };
  const [sample] = useState(() => [{ id: 'S1', kind: 'recharge', to: brand.ownNumber || '—', amount: 50, time: new Date(Date.now() - 86_400_000 * 2) }, { id: 'S2', kind: 'send', to: personName(PEOPLE[brand.region]?.[1] || PEOPLE.BD[1], language), amount: 1000, time: new Date(Date.now() - 86_400_000 * 5) }]);
  const rows = [...wallet.history, ...sample];
  return (
    <div className="mk-flow">
      <StatusBar dark bg={brand.color} />
      <AppBar bg={brand.color} title={t(...brand.words.statement)} onBack={onExit} />
      <div className="sim-scroll">
        {rows.map((r) => (
          <div key={r.id} className="sim-row">
            <span className="sim-avatar sm" style={{ background: '#eceff1', color: brand.color }}>−</span>
            <span className="sim-row-main"><span className="sim-row-title">{t(...kinds[r.kind])}</span><span className="sim-row-sub">{r.to} · {r.time.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB')}</span></span>
            <strong style={{ color: '#c62828' }}>−{money(r.amount, brand.currency, language)}</strong>
          </div>
        ))}
        <p className="sim-safety" style={{ margin: 16 }}><AlertTriangle size={16} />{t('See a payment you did not make? Call the official helpline printed in the app.', 'নিজে করেননি এমন লেনদেন দেখছেন? অ্যাপে লেখা অফিসিয়াল হেল্পলাইনে ফোন করুন।', 'ऐसा भुगतान दिखे जो आपने नहीं किया? ऐप में लिखी आधिकारिक हेल्पलाइन पर फोन करें।', 'Thấy giao dịch bạn không làm? Gọi tổng đài chính thức ghi trong ứng dụng.')}</p>
      </div>
    </div>
  );
}

/**
 * The fake "customer care" call: someone claiming to be from the app asks
 * for the code that was just sent. Right answer: decline / hang up.
 */
export function ScamCall({ brand, caller, onEnd }) {
  const { t } = useSim();
  const [stage, setStage] = useState('ringing'); // ringing | talking | shared | safe
  const lines = [
    T(`Hello, I am calling from ${caller}. Your account will be blocked today.`, `হ্যালো, আমি ${caller} থেকে বলছি। আজ আপনার অ্যাকাউন্ট বন্ধ হয়ে যাবে।`, `हैलो, मैं ${caller} से बोल रहा हूं। आज आपका खाता बंद हो जाएगा।`, `Alô, tôi gọi từ ${caller}. Tài khoản của bác sẽ bị khóa hôm nay.`),
    T('To stop it, just tell me the 6-digit code we sent you by SMS.', 'বন্ধ হওয়া আটকাতে এসএমএসে পাঠানো ৬ সংখ্যার কোডটা শুধু বলুন।', 'इसे रोकने के लिए बस एसएमएस में भेजा 6 अंकों का कोड बता दीजिए।', 'Để ngăn lại, bác chỉ cần đọc mã 6 số chúng tôi vừa gửi qua SMS.'),
  ];
  if (stage === 'safe' || stage === 'shared') {
    return (
      <div className="sim-call" style={{ background: stage === 'safe' ? 'linear-gradient(180deg,#1b5e20,#0b3d12)' : 'linear-gradient(180deg,#8e1b1b,#3d0b0b)' }}>
        <div className="mk-call-result">
          {stage === 'safe' ? <ShieldCheck size={56} /> : <ShieldAlert size={56} />}
          <p className="wa-call-name">{stage === 'safe' ? t('You stayed safe', 'আপনি নিরাপদ রইলেন', 'आप सुरक्षित रहे', 'Bạn đã an toàn') : t('That was a scam', 'এটা প্রতারণা ছিল', 'यह धोखा था', 'Đó là lừa đảo')}</p>
          <p>{stage === 'safe'
            ? t(`${brand.name} never calls to ask for a code, PIN or password. Hanging up was exactly right.`, `${brand.name} কখনো ফোন করে কোড, পিন বা পাসওয়ার্ড চায় না। ফোন কেটে দেওয়াই ঠিক ছিল।`, `${brand.name} कभी फोन करके कोड, पिन या पासवर्ड नहीं मांगता। फोन काटना बिल्कुल सही था।`, `${brand.name} không bao giờ gọi để hỏi mã, PIN hay mật khẩu. Cúp máy là hoàn toàn đúng.`)
            : t(`In real life, that code lets them into your account. ${brand.name} never asks for it. If this ever happens, call the official helpline at once — in practice, nothing was lost.`, `বাস্তবে এই কোড দিয়ে তারা আপনার অ্যাকাউন্টে ঢুকে যেত। ${brand.name} কখনো এটা চায় না। কখনো এমন হলে সঙ্গে সঙ্গে অফিসিয়াল হেল্পলাইনে ফোন করুন — অনুশীলনে কিছুই হারায়নি।`, `असल में यह कोड उन्हें आपके खाते में घुसने देता। ${brand.name} कभी यह नहीं मांगता। कभी ऐसा हो तो तुरंत आधिकारिक हेल्पलाइन पर फोन करें — अभ्यास में कुछ नहीं गया।`, `Ngoài đời, mã đó cho họ vào tài khoản của bạn. ${brand.name} không bao giờ hỏi mã này. Nếu xảy ra, hãy gọi ngay tổng đài chính thức — trong luyện tập, bạn không mất gì.`)}</p>
          <Tap className="sim-primary" style={{ background: '#fff', color: '#111', maxWidth: 260 }} act="close_scam_result" onClick={onEnd}>{t('Back to the app', 'অ্যাপে ফিরুন', 'ऐप पर वापस', 'Quay lại ứng dụng')}</Tap>
        </div>
      </div>
    );
  }
  return (
    <div className="sim-call">
      <div className="wa-call-top">
        <span className="mk-unknown-caller"><Contact size={40} /></span>
        <p className="wa-call-name">{caller}</p>
        <p className="wa-call-state">+880 1309-000 777 · {stage === 'ringing' ? t('Incoming call', 'ইনকামিং কল', 'आने वाली कॉल', 'Cuộc gọi đến') : '00:12'}</p>
        {stage === 'talking' && (
          <div className="mk-call-lines">
            {lines.map((l, i) => <p key={i} className="mk-call-line">“{t(...l)}”</p>)}
          </div>
        )}
      </div>
      {stage === 'ringing' ? (
        <div className="sim-call-controls" style={{ gap: 60 }}>
          <Tap className="sim-call-btn end" act="decline_scam_call hang_up_scam" onClick={() => setStage('safe')} label={t('Decline', 'কেটে দিন', 'काटें', 'Từ chối')}
            explain={T('Decline: you never have to answer unknown callers.', 'কেটে দিন: অচেনা নম্বরের ফোন ধরতেই হবে এমন নয়।', 'काटें: अनजान नंबर की कॉल उठाना ज़रूरी नहीं।', 'Từ chối: bạn không cần nghe máy số lạ.')}><PhoneOff size={26} /></Tap>
          <Tap className="sim-call-btn" style={{ background: '#2e7d32' }} act="answer_scam_call" onClick={() => setStage('talking')} label={t('Answer', 'ধরুন', 'उठाएं', 'Nghe')}><Phone size={26} /></Tap>
        </div>
      ) : (
        <div className="sim-stack" style={{ width: '100%' }}>
          <Tap className="sim-primary" style={{ background: '#e53935' }} act="hang_up_scam" onClick={() => setStage('safe')}><PhoneOff size={20} /> {t('Hang up', 'ফোন কেটে দিন', 'फोन काट दें', 'Cúp máy')}</Tap>
          <Tap className="sim-secondary" style={{ background: 'transparent', color: '#fff', borderColor: 'rgb(255 255 255 / 0.5)' }} act="mistake_share_otp" onClick={() => setStage('shared')}>{t('Read out the code', 'কোডটা বলে দিন', 'कोड बता दें', 'Đọc mã cho họ')}</Tap>
        </div>
      )}
    </div>
  );
}


