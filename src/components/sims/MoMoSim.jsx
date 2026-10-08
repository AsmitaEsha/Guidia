import { ArrowLeftRight, Bell, Gift, History, Home, QrCode, Receipt, ShieldAlert, Smartphone, UserRound, Wallet } from 'lucide-react';
import { Screen, StatusBar, T, Tap, useAutoOpen, useSim, useStack } from './kit/SimKit';
import { BalancePill, PayBillFlow, RechargeFlow, ScamCall, ScanPayFlow, SendMoneyFlow, Statement, useWallet } from './kit/MoneyKit';

// MoMo (Vietnam): the magenta wallet with transfer, bills, QR and history.

const BRAND = {
  name: 'MoMo', color: '#A50064', currency: 'VND', symbol: '₫', locale: 'vi-VN', region: 'VN', pinLength: 6, confirm: 'button',
  ownNumber: '0912 000 000',
  quickAmounts: [50000, 100000, 200000, 500000], rechargeAmounts: [10000, 20000, 50000, 100000],
  sendFee: () => 0, billAmount: 486000,
  words: {
    sendMoney: T('Transfer', 'ট্রান্সফার', 'ट्रांसफ़र', 'Chuyển tiền'),
    recharge: T('Top up phone', 'ফোন রিচার্জ', 'फोन रिचार्ज', 'Nạp tiền điện thoại'),
    payBill: T('Pay bills', 'বিল পরিশোধ', 'बिल भुगतान', 'Thanh toán hóa đơn'),
    statement: T('History', 'হিস্ট্রি', 'हिस्ट्री', 'Lịch sử'),
    tapBalance: T('Show balance', 'ব্যালেন্স দেখুন', 'बैलेंस दिखाएं', 'Hiện số dư'),
    confirm: T('Confirm', 'নিশ্চিত করুন', 'पुष्टि करें', 'Xác nhận'),
  },
};
const OPERATORS = [
  { id: 'viettel', name: 'Viettel', short: 'V', color: '#ee0033' },
  { id: 'vina', name: 'Vinaphone', short: 'VN', color: '#0072bc' },
  { id: 'mobi', name: 'Mobifone', short: 'M', color: '#00539b' },
  { id: 'vnm', name: 'Vietnamobile', short: 'VM', color: '#f58220' },
];
const BILLERS = [
  { id: 'evn', name: 'EVN HCMC (Điện)', color: '#f9a825', kind: T('Electricity', 'বিদ্যুৎ', 'बिजली', 'Điện') },
  { id: 'sawaco', name: 'SAWACO (Nước)', color: '#1e88e5', kind: T('Water', 'পানি', 'पानी', 'Nước') },
  { id: 'fpt', name: 'FPT Telecom', color: '#f36f21', kind: T('Internet', 'ইন্টারনেট', 'इंटरनेट', 'Internet') },
];

export default function MoMoSim() {
  const { t } = useSim();
  const nav = useStack('home');
  const wallet = useWallet(3250000);
  const [scam, setScam] = useAutoOpen(['decline_scam_call', 'hang_up_scam']);
  const back = () => nav.reset('home');

  if (nav.screen === 'send') return <SendMoneyFlow brand={BRAND} wallet={wallet} onExit={back} />;
  if (nav.screen === 'recharge') return <RechargeFlow brand={BRAND} wallet={wallet} onExit={back} operators={OPERATORS} ownNumber={BRAND.ownNumber} />;
  if (nav.screen === 'bill') return <PayBillFlow brand={BRAND} wallet={wallet} onExit={back} billers={BILLERS} />;
  if (nav.screen === 'scan') return <ScanPayFlow brand={BRAND} wallet={wallet} onExit={back} shop="Phở Hòa Pasteur" />;
  if (nav.screen === 'statement') return <Statement brand={BRAND} wallet={wallet} onExit={back} />;

  const services = [
    ['send', ArrowLeftRight, BRAND.words.sendMoney, 'open_send_money', () => nav.push('send')],
    ['bill', Receipt, BRAND.words.payBill, 'open_pay_bill', () => nav.push('bill')],
    ['recharge', Smartphone, BRAND.words.recharge, 'open_recharge', () => nav.push('recharge')],
    ['qr', QrCode, T('Scan to pay', 'স্ক্যান করে পেমেন্ট', 'स्कैन करके भुगतान', 'Quét mã'), 'open_scan', () => nav.push('scan')],
    ['wallet', Wallet, T('Top up wallet', 'ওয়ালেটে টাকা', 'वॉलेट में पैसे', 'Nạp tiền vào ví'), 'open_add_money', () => nav.push('statement')],
    ['history', History, BRAND.words.statement, 'open_statement', () => nav.push('statement')],
  ];

  return (
    <div className="mm" style={{ '--accent': BRAND.color }}>
      <Screen nav={nav}>
        <div className="mm-head">
          <StatusBar dark bg="transparent" />
          <div className="bk-head-row">
            <span className="bk-avatar"><UserRound size={22} /></span>
            <span className="bk-hello"><strong>{t('Hello, Mother', 'হ্যালো, মা', 'नमस्ते, माँ', 'Chào Mẹ')}</strong><BalancePill balance={wallet.balance} brand={BRAND} /></span>
            <Tap className="sim-icon-btn" style={{ color: '#fff' }} act="open_notifications" label={t('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')} onClick={() => nav.push('statement')}><Bell size={22} /></Tap>
            <span className="mm-logo">mo<b>mo</b></span>
          </div>
        </div>
        <div className="sim-scroll" style={{ paddingTop: 14 }}>
          <div className="mm-grid">
            {services.map(([id, Icon, label, act, fn]) => (
              <Tap key={id} className="bk-tile" act={act} onClick={fn} explain={label}>
                <span className="mm-tile-icon"><Icon size={24} /></span><span>{t(...label)}</span>
              </Tap>
            ))}
          </div>
          <div className="bk-offer" style={{ background: 'linear-gradient(120deg,#fde7f3,#fbcfe8)', color: '#6b0040' }}><Gift size={20} />{t('Vouchers: only use the ones inside the MoMo app.', 'ভাউচার: শুধু মোমো অ্যাপের ভেতরের গুলোই ব্যবহার করুন।', 'वाउचर: सिर्फ़ MoMo ऐप के अंदर वाले ही इस्तेमाल करें।', 'Ưu đãi: chỉ dùng voucher trong ứng dụng MoMo.')}</div>
          <p className="sim-safety" style={{ margin: '4px 16px 90px' }}><ShieldAlert size={16} />{t('MoMo never calls to ask for your OTP or password.', 'মোমো কখনো ফোন করে ওটিপি বা পাসওয়ার্ড চায় না।', 'MoMo कभी फोन करके ओटीपी या पासवर्ड नहीं मांगता।', 'MoMo không bao giờ gọi điện hỏi OTP hay mật khẩu.')}</p>
        </div>
        <nav className="bk-nav">
          <Tap className="bk-nav-item" aria-selected act="tab_home" onClick={back}><Home size={22} />{t('Home', 'হোম', 'होम', 'Trang chủ')}</Tap>
          <Tap className="bk-qr" style={{ background: BRAND.color }} act="open_scan" onClick={() => nav.push('scan')} label={t('Scan QR', 'কিউআর স্ক্যান', 'QR स्कैन', 'Quét mã QR')}><QrCode size={28} /></Tap>
          <Tap className="bk-nav-item" act="open_statement" onClick={() => nav.push('statement')}><History size={22} />{t('History', 'হিস্ট্রি', 'हिस्ट्री', 'Lịch sử')}</Tap>
        </nav>
      </Screen>
      {scam && <ScamCall brand={BRAND} caller={t('"MoMo Support"', '"মোমো সাপোর্ট"', '"MoMo सपोर्ट"', '"Tổng đài MoMo"')} onEnd={() => setScam(false)} />}
    </div>
  );
}
