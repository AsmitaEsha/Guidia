import { useState } from 'react';
import {
  ArrowDownToLine, Bell, CreditCard, Gift, Home, Inbox, Landmark, PiggyBank, QrCode, Receipt, Send, ShieldAlert, Smartphone, Store, UserRound,
} from 'lucide-react';
import { Screen, Sheet, StatusBar, T, Tap, useAutoOpen, useSim, useStack } from './kit/SimKit';
import { BalancePill, PayBillFlow, RechargeFlow, ScamCall, ScanPayFlow, SendMoneyFlow, Statement, useWallet } from './kit/MoneyKit';

// bKash (Bangladesh): the pink home screen, services grid, QR, inbox, and
// every money flow — with the hold-to-confirm step bKash really uses.

const BRAND = {
  name: 'bKash', color: '#E2136E', currency: 'BDT', symbol: '৳', locale: 'en-IN', region: 'BD', pinLength: 5, confirm: 'hold',
  ownNumber: '01711-000000',
  quickAmounts: [500, 1000, 2000, 5000], rechargeAmounts: [20, 50, 100, 300],
  sendFee: (a) => (a > 25000 ? Math.round(a * 0.0085) : a >= 100 ? 5 : 0),
  billAmount: 1840,
  words: {
    sendMoney: T('Send Money', 'সেন্ড মানি', 'सेंड मनी', 'Gửi tiền'),
    recharge: T('Mobile Recharge', 'মোবাইল রিচার্জ', 'मोबाइल रिचार्ज', 'Nạp tiền điện thoại'),
    payBill: T('Pay Bill', 'পে বিল', 'बिल भुगतान', 'Thanh toán hóa đơn'),
    statement: T('Statement', 'স্টেটমেন্ট', 'स्टेटमेंट', 'Sao kê'),
    tapBalance: T('Tap for Balance', 'ব্যালেন্স জানতে ট্যাপ করুন', 'बैलेंस के लिए टैप करें', 'Chạm để xem số dư'),
    confirm: T('Confirm', 'নিশ্চিত করুন', 'पुष्टि करें', 'Xác nhận'),
  },
};
const OPERATORS = [
  { id: 'gp', name: 'Grameenphone', short: 'GP', color: '#1aa0db' },
  { id: 'robi', name: 'Robi', short: 'R', color: '#e4002b' },
  { id: 'bl', name: 'Banglalink', short: 'BL', color: '#f26522' },
  { id: 'tt', name: 'Teletalk', short: 'TT', color: '#00a651' },
];
const BILLERS = [
  { id: 'desco', name: 'DESCO (Electricity)', color: '#f9a825', kind: T('Electricity', 'বিদ্যুৎ', 'बिजली', 'Điện') },
  { id: 'wasa', name: 'Dhaka WASA', color: '#1e88e5', kind: T('Water', 'পানি', 'पानी', 'Nước') },
  { id: 'titas', name: 'Titas Gas', color: '#e53935', kind: T('Gas', 'গ্যাস', 'गैस', 'Gas') },
];

export default function BkashSim() {
  const { t, showToast } = useSim();
  const nav = useStack('home');
  const wallet = useWallet(25480);
  const [tab, setTab] = useState('home');
  const [info, setInfo] = useState(null);
  const [scam, setScam] = useAutoOpen(['decline_scam_call', 'hang_up_scam']);

  // In the guided "scam call" practice, the call arrives by itself.

  const back = () => nav.reset('home');
  const services = [
    ['send', Send, BRAND.words.sendMoney, 'open_send_money', () => nav.push('send')],
    ['cashout', ArrowDownToLine, T('Cash Out', 'ক্যাশ আউট', 'कैश आउट', 'Rút tiền mặt'), 'open_cash_out', () => nav.push('cashout')],
    ['recharge', Smartphone, BRAND.words.recharge, 'open_recharge', () => nav.push('recharge')],
    ['payment', Store, T('Make Payment', 'পেমেন্ট', 'पेमेंट करें', 'Thanh toán'), 'open_scan', () => nav.push('scan')],
    ['addmoney', CreditCard, T('Add Money', 'অ্যাড মানি', 'ऐड मनी', 'Nạp tiền vào ví'), 'open_add_money', () => setInfo('addmoney')],
    ['paybill', Receipt, BRAND.words.payBill, 'open_pay_bill', () => nav.push('bill')],
    ['savings', PiggyBank, T('Savings', 'সেভিংস', 'सेविंग्स', 'Tiết kiệm'), 'open_savings', () => setInfo('savings')],
    ['remit', Landmark, T('Bank Transfer', 'ব্যাংক ট্রান্সফার', 'बैंक ट्रांसफ़र', 'Chuyển ngân hàng'), 'open_bank', () => setInfo('bank')],
  ];

  if (nav.screen === 'send') return <SendMoneyFlow brand={BRAND} wallet={wallet} onExit={back} />;
  if (nav.screen === 'cashout') return <SendMoneyFlow brand={{ ...BRAND, sendFee: (a) => Math.round(a * 0.0185) }} wallet={wallet} onExit={back} title={t('Cash Out (enter the agent number shown in the shop)', 'ক্যাশ আউট (দোকানে লেখা এজেন্ট নম্বর দিন)', 'कैश आउट (दुकान में लिखा एजेंट नंबर डालें)', 'Rút tiền (nhập số đại lý ghi tại cửa hàng)')} />;
  if (nav.screen === 'recharge') return <RechargeFlow brand={BRAND} wallet={wallet} onExit={back} operators={OPERATORS} ownNumber={BRAND.ownNumber} />;
  if (nav.screen === 'bill') return <PayBillFlow brand={BRAND} wallet={wallet} onExit={back} billers={BILLERS} />;
  if (nav.screen === 'scan') return <ScanPayFlow brand={BRAND} wallet={wallet} onExit={back} shop="Karim Store, Mirpur" />;
  if (nav.screen === 'statement') return <Statement brand={BRAND} wallet={wallet} onExit={back} />;

  return (
    <div className="bk" style={{ '--accent': BRAND.color }}>
      <Screen nav={nav}>
        <div className="bk-head">
          <StatusBar dark bg="transparent" />
          <div className="bk-head-row">
            <span className="bk-avatar"><UserRound size={22} /></span>
            <span className="bk-hello">
              <strong>{t('Hello, Amma', 'হ্যালো, আম্মা', 'नमस्ते, अम्मा', 'Xin chào, Mẹ')}</strong>
              <BalancePill balance={wallet.balance} brand={BRAND} />
            </span>
            <Tap className="sim-icon-btn" style={{ color: '#fff' }} act="open_notifications" onClick={() => setTab('inbox')} label={t('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')}
              explain={T('Notifications: offers and payment messages from bKash.', 'নোটিফিকেশন: বিকাশের অফার ও লেনদেনের মেসেজ।', 'सूचनाएं: bKash के ऑफ़र और भुगतान मैसेज।', 'Thông báo: ưu đãi và tin giao dịch của bKash.')}><Bell size={22} /></Tap>
            <span className="bk-logo">bKash</span>
          </div>
        </div>
        <div className="sim-scroll bk-body">
          {tab === 'home' ? (
            <>
              <div className="bk-grid">
                {services.map(([id, Icon, label, act, fn]) => (
                  <Tap key={id} className="bk-tile" act={act} onClick={fn} explain={label}>
                    <span className="bk-tile-icon"><Icon size={24} /></span>
                    <span>{t(...label)}</span>
                  </Tap>
                ))}
              </div>
              <Tap className="bk-banner" act="open_statement" onClick={() => nav.push('statement')} explain={T('Statement: every payment you made.', 'স্টেটমেন্ট: আপনার সব লেনদেন।', 'स्टेटमेंट: आपके सारे भुगतान।', 'Sao kê: mọi giao dịch của bạn.')}>
                <Receipt size={20} /> {t('See my statement', 'আমার স্টেটমেন্ট দেখুন', 'मेरा स्टेटमेंट देखें', 'Xem sao kê của tôi')}
              </Tap>
              <div className="bk-offer"><Gift size={20} />{t('Offer: 5% cashback on bill payments this month', 'অফার: এই মাসে বিল পেমেন্টে ৫% ক্যাশব্যাক', 'ऑफ़र: इस महीने बिल भुगतान पर 5% कैशबैक', 'Ưu đãi: hoàn 5% khi thanh toán hóa đơn tháng này')}</div>
              <p className="sim-safety" style={{ margin: '4px 16px 90px' }}><ShieldAlert size={16} />{t('bKash never asks for your PIN or OTP — not on the phone, not by SMS, not in a link.', 'বিকাশ কখনো আপনার পিন বা ওটিপি চায় না — ফোনে না, এসএমএসে না, লিংকে না।', 'bKash कभी आपका पिन या ओटीपी नहीं मांगता — न फोन पर, न एसएमएस में, न लिंक में।', 'bKash không bao giờ hỏi PIN hay OTP — qua điện thoại, SMS hay đường link.')}</p>
            </>
          ) : (
            <div>
              <p className="wa-section">{t('Inbox', 'ইনবক্স', 'इनबॉक्स', 'Hộp thư')}</p>
              {[
                [T('Cashback received', 'ক্যাশব্যাক পেয়েছেন', 'कैशबैक मिला', 'Đã nhận hoàn tiền'), T('৳10 cashback for your bill payment.', 'বিল পেমেন্টের জন্য ৳১০ ক্যাশব্যাক।', 'बिल भुगतान पर ৳10 कैशबैक।', 'Hoàn ৳10 cho thanh toán hóa đơn.'), false],
                [T('Suspicious SMS (not from bKash)', 'সন্দেহজনক এসএমএস (বিকাশের নয়)', 'संदिग्ध एसएमएस (bKash का नहीं)', 'SMS đáng ngờ (không phải bKash)'), T('"Your bKash will be blocked. Call 01309000777 now." — bKash never sends this. Delete it.', '"আপনার বিকাশ বন্ধ হয়ে যাবে। এখনই 01309000777-এ ফোন করুন।" — বিকাশ কখনো এমন পাঠায় না। মুছে দিন।', '"आपका bKash बंद हो जाएगा। अभी 01309000777 पर फोन करें।" — bKash कभी ऐसा नहीं भेजता। डिलीट करें।', '"bKash của bạn sẽ bị khóa. Gọi ngay 01309000777." — bKash không bao giờ gửi tin này. Hãy xóa.'), true],
              ].map(([title, body, danger], i) => (
                <div key={i} className="sim-row" style={{ alignItems: 'flex-start' }}>
                  <span className="sim-avatar sm" style={{ background: danger ? '#e53935' : BRAND.color }}>{danger ? <ShieldAlert size={18} /> : <Gift size={18} />}</span>
                  <span className="sim-row-main"><span className="sim-row-title">{t(...title)}</span><span className="sim-row-sub" style={{ whiteSpace: 'normal' }}>{t(...body)}</span></span>
                </div>
              ))}
            </div>
          )}
        </div>
        <nav className="bk-nav">
          <Tap className="bk-nav-item" aria-selected={tab === 'home'} act="tab_home" onClick={() => setTab('home')}><Home size={22} />{t('Home', 'হোম', 'होम', 'Trang chủ')}</Tap>
          <Tap className="bk-qr" act="open_scan" onClick={() => nav.push('scan')} label={t('Scan QR', 'কিউআর স্ক্যান', 'QR स्कैन', 'Quét QR')}
            explain={T('Scan QR: pay a shop by scanning its code.', 'কিউআর স্ক্যান: দোকানের কোড স্ক্যান করে পেমেন্ট করুন।', 'QR स्कैन: दुकान का कोड स्कैन करके भुगतान करें।', 'Quét QR: trả tiền cửa hàng bằng cách quét mã.')}><QrCode size={28} /></Tap>
          <Tap className="bk-nav-item" aria-selected={tab === 'inbox'} act="tab_inbox" onClick={() => setTab('inbox')}><Inbox size={22} />{t('Inbox', 'ইনবক্স', 'इनबॉक्स', 'Hộp thư')}</Tap>
        </nav>
      </Screen>

      <Sheet open={Boolean(info)} onClose={() => setInfo(null)} title={info === 'savings' ? t('Savings', 'সেভিংস', 'सेविंग्स', 'Tiết kiệm') : info === 'bank' ? t('Bank Transfer', 'ব্যাংক ট্রান্সফার', 'बैंक ट्रांसफ़र', 'Chuyển ngân hàng') : t('Add Money', 'অ্যাড মানি', 'ऐड मनी', 'Nạp tiền vào ví')}>
        <p style={{ margin: '0 0 14px', color: '#54656f' }}>{info === 'savings'
          ? t('Save a fixed amount every month with a partner bank. Read the terms carefully and ask family before you start.', 'পার্টনার ব্যাংকের সাথে প্রতি মাসে নির্দিষ্ট টাকা জমান। শর্তগুলো ভালো করে পড়ুন, শুরুর আগে পরিবারকে জিজ্ঞেস করুন।', 'पार्टनर बैंक के साथ हर महीने तय रकम बचाएं। शर्तें ध्यान से पढ़ें और शुरू करने से पहले परिवार से पूछें।', 'Tiết kiệm số tiền cố định mỗi tháng với ngân hàng đối tác. Đọc kỹ điều khoản và hỏi gia đình trước.')
          : info === 'bank' ? t('Send money from bKash to a bank account. Check the account number twice — bank transfers cannot be undone.', 'বিকাশ থেকে ব্যাংক অ্যাকাউন্টে টাকা পাঠান। অ্যাকাউন্ট নম্বর দুবার মিলিয়ে নিন — ব্যাংক ট্রান্সফার ফেরানো যায় না।', 'bKash से बैंक खाते में पैसे भेजें। खाता नंबर दो बार जांचें — बैंक ट्रांसफ़र वापस नहीं होता।', 'Chuyển tiền từ bKash sang tài khoản ngân hàng. Kiểm tra số tài khoản hai lần — không hoàn tác được.')
            : t('Move money into bKash from your bank account or card. Only do this inside the official app.', 'ব্যাংক অ্যাকাউন্ট বা কার্ড থেকে বিকাশে টাকা আনুন। শুধু অফিসিয়াল অ্যাপের ভেতরেই করুন।', 'बैंक खाते या कार्ड से bKash में पैसे लाएं। यह सिर्फ़ आधिकारिक ऐप के अंदर करें।', 'Nạp tiền vào bKash từ tài khoản ngân hàng hoặc thẻ. Chỉ làm trong ứng dụng chính thức.')}</p>
        <Tap className="sim-primary" style={{ background: BRAND.color }} onClick={() => { setInfo(null); showToast(t('Practice tip: try Send Money or Pay Bill from the home screen.', 'অনুশীলনের টিপস: হোম থেকে সেন্ড মানি বা পে বিল চেষ্টা করুন।', 'अभ्यास टिप: होम से सेंड मनी या बिल भुगतान आज़माएं।', 'Mẹo: thử Gửi tiền hoặc Thanh toán hóa đơn ở trang chủ.')); }}>{t('OK', 'ঠিক আছে', 'ठीक है', 'Đồng ý')}</Tap>
      </Sheet>

      {scam && <ScamCall brand={BRAND} caller={t('"bKash Customer Care"', '"বিকাশ কাস্টমার কেয়ার"', '"bKash कस्टमर केयर"', '"Chăm sóc khách hàng bKash"')} onEnd={() => setScam(false)} />}
    </div>
  );
}
