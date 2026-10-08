import { useState } from 'react';
import { Bell, Building2, Check, QrCode, Receipt, Search, ShieldAlert, Smartphone, UserRound, Users, Wallet, X } from 'lucide-react';
import { PinPad, Screen, Sheet, StatusBar, T, Tap, money, useAutoOpen, useSim, useStack } from './kit/SimKit';
import { PEOPLE, PayBillFlow, RechargeFlow, ScanPayFlow, SendMoneyFlow, Statement, personName, useWallet } from './kit/MoneyKit';

// Google Pay (India, UPI): scan any QR, pay contacts, bills, balance check
// with the UPI PIN, and the "request money" trap.

const BRAND = {
  name: 'Google Pay', color: '#1a73e8', currency: 'INR', symbol: '₹', locale: 'en-IN', region: 'IN', pinLength: 4, confirm: 'button',
  ownNumber: '98110 00000',
  quickAmounts: [100, 500, 1000, 2000], rechargeAmounts: [199, 299, 479, 719],
  sendFee: () => 0, billAmount: 1420,
  pinTitle: T('Enter UPI PIN', 'ইউপিআই পিন দিন', 'UPI पिन डालें', 'Nhập mã PIN UPI'),
  words: {
    sendMoney: T('Pay contacts', 'কন্টাক্টকে পেমেন্ট', 'कॉन्टैक्ट को भुगतान', 'Thanh toán cho người liên hệ'),
    recharge: T('Mobile recharge', 'মোবাইল রিচার্জ', 'मोबाइल रिचार्ज', 'Nạp tiền điện thoại'),
    payBill: T('Pay bills', 'বিল পরিশোধ', 'बिल भुगतान', 'Thanh toán hóa đơn'),
    statement: T('Transaction history', 'লেনদেনের ইতিহাস', 'लेन-देन का इतिहास', 'Lịch sử giao dịch'),
    tapBalance: T('Check balance', 'ব্যালেন্স দেখুন', 'बैलेंस देखें', 'Xem số dư'),
    confirm: T('Pay', 'পেমেন্ট করুন', 'भुगतान करें', 'Thanh toán'),
  },
};
const OPERATORS = [
  { id: 'jio', name: 'Jio', short: 'J', color: '#0f3cc9' },
  { id: 'airtel', name: 'Airtel', short: 'A', color: '#e40000' },
  { id: 'vi', name: 'Vi', short: 'Vi', color: '#ee008c' },
  { id: 'bsnl', name: 'BSNL', short: 'B', color: '#1565c0' },
];
const BILLERS = [
  { id: 'bses', name: 'BSES Rajdhani', color: '#f9a825', kind: T('Electricity', 'বিদ্যুৎ', 'बिजली', 'Điện') },
  { id: 'mtnl', name: 'MTNL Broadband', color: '#1e88e5', kind: T('Broadband', 'ব্রডব্যান্ড', 'ब्रॉडबैंड', 'Internet') },
  { id: 'igl', name: 'Indraprastha Gas', color: '#e53935', kind: T('Gas', 'গ্যাস', 'गैस', 'Gas') },
];

export default function GPaySim() {
  const { t, language, emit, showToast } = useSim();
  const nav = useStack('home');
  const wallet = useWallet(42850);
  const [request, setRequest] = useAutoOpen(['decline_request']);
  const [balancePin, setBalancePin] = useState(false);
  const [balanceShown, setBalanceShown] = useState(false);
  const back = () => nav.reset('home');
  const people = PEOPLE.IN;

  if (nav.screen === 'send') return <SendMoneyFlow brand={BRAND} wallet={wallet} onExit={back} region="IN" />;
  if (nav.screen === 'recharge') return <RechargeFlow brand={BRAND} wallet={wallet} onExit={back} operators={OPERATORS} ownNumber={BRAND.ownNumber} />;
  if (nav.screen === 'bill') return <PayBillFlow brand={BRAND} wallet={wallet} onExit={back} billers={BILLERS} />;
  if (nav.screen === 'scan') return <ScanPayFlow brand={BRAND} wallet={wallet} onExit={back} shop="Sharma General Store" />;
  if (nav.screen === 'statement') return <Statement brand={BRAND} wallet={wallet} onExit={back} />;

  return (
    <div className="gp" style={{ '--accent': BRAND.color }}>
      <Screen nav={nav}>
        <StatusBar bg="#fff" />
        <div className="gp-top">
          <div className="gp-search"><Search size={18} /><span>{t('Pay friends and merchants', 'বন্ধু ও দোকানে পেমেন্ট', 'दोस्तों और दुकानों को भुगतान', 'Trả cho bạn bè và cửa hàng')}</span></div>
          <Tap className="sim-icon-btn" act="open_notifications" onClick={() => setRequest(true)} label={t('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')}><Bell size={22} /></Tap>
          <span className="sim-avatar sm" style={{ background: '#8e24aa' }}>A</span>
        </div>
        <div className="sim-scroll">
          <div className="gp-actions">
            {[
              ['scan', QrCode, T('Scan any QR code', 'যেকোনো কিউআর স্ক্যান', 'कोई भी QR स्कैन', 'Quét mã QR bất kỳ'), 'open_scan', () => nav.push('scan')],
              ['contacts', Users, T('Pay contacts', 'কন্টাক্টকে পেমেন্ট', 'कॉन्टैक्ट को भुगतान', 'Thanh toán cho người liên hệ'), 'open_send_money', () => nav.push('send')],
              ['phone', Smartphone, T('Pay phone number', 'ফোন নম্বরে পেমেন্ট', 'फोन नंबर पर भुगतान', 'Trả theo số điện thoại'), 'open_send_money', () => nav.push('send')],
              ['bank', Building2, T('Bank transfer', 'ব্যাংক ট্রান্সফার', 'बैंक ट्रांसफ़र', 'Chuyển khoản ngân hàng'), 'open_bank', () => nav.push('send')],
            ].map(([id, Icon, label, act, fn]) => (
              <Tap key={id} className="gp-action" act={act} onClick={fn} explain={label}>
                <span className="gp-action-icon"><Icon size={24} /></span><span>{t(...label)}</span>
              </Tap>
            ))}
          </div>
          <p className="gp-section">{t('People', 'মানুষ', 'लोग', 'Mọi người')}</p>
          <div className="gp-people">
            {people.map((p) => (
              <Tap key={p.id} className="gp-person" act={`open_send_money choose_${p.id}`} onClick={() => nav.push('send')}>
                <span className="sim-avatar" style={{ background: p.color }}>{personName(p, language).slice(0, 1)}</span>
                <span>{personName(p, language).split(' ')[0]}</span>
              </Tap>
            ))}
          </div>
          <p className="gp-section">{t('Bills and recharges', 'বিল ও রিচার্জ', 'बिल और रिचार्ज', 'Hóa đơn và nạp tiền')}</p>
          <div className="gp-actions">
            <Tap className="gp-action" act="open_recharge" onClick={() => nav.push('recharge')}><span className="gp-action-icon"><Smartphone size={24} /></span><span>{t('Mobile recharge', 'মোবাইল রিচার্জ', 'मोबाइल रिचार्ज', 'Nạp điện thoại')}</span></Tap>
            <Tap className="gp-action" act="open_pay_bill" onClick={() => nav.push('bill')}><span className="gp-action-icon"><Receipt size={24} /></span><span>{t('Electricity', 'বিদ্যুৎ', 'बिजली', 'Tiền điện')}</span></Tap>
          </div>
          <div className="gp-links">
            <Tap className="gp-link" act="check_balance" onClick={() => setBalancePin(true)} explain={T('Check bank balance: asks for your UPI PIN, then shows how much is in your account. Nothing is paid.', 'ব্যাংক ব্যালেন্স দেখুন: ইউপিআই পিন চায়, তারপর অ্যাকাউন্টে কত আছে দেখায়। কোনো টাকা যায় না।', 'बैंक बैलेंस देखें: UPI पिन मांगता है, फिर खाते में कितना है दिखाता है। कोई भुगतान नहीं होता।', 'Xem số dư: hỏi mã PIN UPI rồi hiện số tiền. Không trả khoản nào.')}><Wallet size={20} /> {balanceShown ? money(wallet.balance, 'INR', language) : t('Check bank balance', 'ব্যাংক ব্যালেন্স দেখুন', 'बैंक बैलेंस देखें', 'Kiểm tra số dư ngân hàng')}</Tap>
            <Tap className="gp-link" act="open_statement" onClick={() => nav.push('statement')}><Receipt size={20} /> {t('See transaction history', 'লেনদেনের ইতিহাস দেখুন', 'लेन-देन का इतिहास देखें', 'Xem lịch sử giao dịch')}</Tap>
          </div>
          <p className="sim-safety" style={{ margin: '8px 16px 24px' }}><ShieldAlert size={16} />{t('You never need your UPI PIN to receive money.', 'টাকা পাওয়ার জন্য কখনো ইউপিআই পিন লাগে না।', 'पैसे पाने के लिए कभी UPI पिन नहीं लगता।', 'Nhận tiền không bao giờ cần mã PIN UPI.')}</p>
        </div>
      </Screen>

      <Sheet open={balancePin} onClose={() => setBalancePin(false)}>
        <PinPad length={4} color={BRAND.color} title={t('Enter UPI PIN to see balance', 'ব্যালেন্স দেখতে ইউপিআই পিন দিন', 'बैलेंस देखने के लिए UPI पिन डालें', 'Nhập PIN UPI để xem số dư')} onDone={() => { setBalancePin(false); setBalanceShown(true); emit('balance_shown'); }} />
      </Sheet>

      <Sheet open={request} onClose={() => setRequest(false)} title={t('Payment request', 'পেমেন্টের অনুরোধ', 'भुगतान अनुरोध', 'Yêu cầu thanh toán')}>
        <div className="sim-stack">
          <div className="mk-to-card" style={{ margin: 0 }}>
            <span className="sim-avatar sm" style={{ background: '#78909c' }}><UserRound size={18} /></span>
            <span className="sim-row-main"><span className="sim-row-title">“KBC Lottery Prize Dept”</span><span className="sim-row-sub">kbcprize@okaxis</span></span>
          </div>
          <p className="mk-review-title" style={{ fontSize: 22 }}>₹2,000 · {t('"Approve to receive your ₹25 lakh prize"', '"২৫ লাখ টাকার পুরস্কার পেতে অনুমোদন দিন"', '"₹25 लाख का इनाम पाने के लिए मंज़ूरी दें"', '"Đồng ý để nhận giải thưởng 25 lakh"')}</p>
          <p className="sim-danger-note"><ShieldAlert size={16} />{t('This is a COLLECT request: approving it SENDS ₹2,000 from your account. There is no prize.', 'এটা একটা কালেক্ট রিকোয়েস্ট: অনুমোদন দিলে আপনার অ্যাকাউন্ট থেকে ₹২,০০০ চলে যাবে। কোনো পুরস্কার নেই।', 'यह कलेक्ट रिक्वेस्ट है: मंज़ूरी देते ही आपके खाते से ₹2,000 चले जाएंगे। कोई इनाम नहीं है।', 'Đây là yêu cầu THU tiền: đồng ý là bạn GỬI ₹2.000 đi. Không có giải thưởng nào.')}</p>
          <Tap className="sim-primary" style={{ background: '#d93025' }} act="decline_request" onClick={() => { setRequest(false); showToast(t('Declined. Well spotted!', 'প্রত্যাখ্যান করেছেন। দারুণ ধরেছেন!', 'अस्वीकार किया। बढ़िया पहचाना!', 'Đã từ chối. Rất tỉnh táo!')); }}><X size={18} /> {t('Decline', 'প্রত্যাখ্যান', 'अस्वीकार करें', 'Từ chối')}</Tap>
          <Tap className="sim-secondary" act="mistake_pay_request" onClick={() => { setRequest(false); showToast(t('Stop! That would have sent ₹2,000 to a scammer. Always Decline requests you did not expect.', 'থামুন! এতে ₹২,০০০ প্রতারকের কাছে চলে যেত। অপ্রত্যাশিত অনুরোধ সবসময় প্রত্যাখ্যান করুন।', 'रुकिए! इससे ₹2,000 धोखेबाज़ के पास चले जाते। अनचाहे अनुरोध हमेशा अस्वीकार करें।', 'Dừng lại! Như vậy là gửi ₹2.000 cho kẻ lừa đảo. Luôn từ chối yêu cầu lạ.'), 4800); }}><Check size={18} /> {t('Pay', 'পেমেন্ট করুন', 'भुगतान करें', 'Trả tiền')}</Tap>
        </div>
      </Sheet>
    </div>
  );
}

