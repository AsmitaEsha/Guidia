import { useState } from 'react';
import { ArrowDownToLine, Bell, Gift, History, Home, QrCode, Receipt, Send, ShieldAlert, Smartphone, Store, UserRound } from 'lucide-react';
import { Screen, StatusBar, T, Tap, useAutoOpen, useSim, useStack } from './kit/SimKit';
import { BalancePill, PayBillFlow, RechargeFlow, ScamCall, ScanPayFlow, SendMoneyFlow, Statement, useWallet } from './kit/MoneyKit';

// Nagad (Bangladesh): orange-red home, services, and the OTP-scam call.

const BRAND = {
  name: 'Nagad', color: '#EC1C24', currency: 'BDT', symbol: '৳', locale: 'en-IN', region: 'BD', pinLength: 4, confirm: 'hold',
  ownNumber: '01811-000000',
  quickAmounts: [500, 1000, 2000, 5000], rechargeAmounts: [20, 50, 100, 300],
  sendFee: () => 0, billAmount: 1560,
  words: {
    sendMoney: T('Send Money', 'সেন্ড মানি', 'सेंड मनी', 'Gửi tiền'),
    recharge: T('Mobile Recharge', 'মোবাইল রিচার্জ', 'मोबाइल रिचार्ज', 'Nạp tiền điện thoại'),
    payBill: T('Bill Pay', 'বিল পে', 'बिल भुगतान', 'Thanh toán hóa đơn'),
    statement: T('Transactions', 'লেনদেন', 'लेन-देन', 'Giao dịch'),
    tapBalance: T('Tap for Balance', 'ব্যালেন্স দেখুন', 'बैलेंस देखें', 'Chạm để xem số dư'),
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
  { id: 'nesco', name: 'NESCO (Electricity)', color: '#f9a825', kind: T('Electricity', 'বিদ্যুৎ', 'बिजली', 'Điện') },
  { id: 'wasa', name: 'Chattogram WASA', color: '#1e88e5', kind: T('Water', 'পানি', 'पानी', 'Nước') },
];

export default function NagadSim() {
  const { t } = useSim();
  const nav = useStack('home');
  const wallet = useWallet(18250);
  const [scam, setScam] = useAutoOpen(['decline_scam_call', 'hang_up_scam']);
  const [tab, setTab] = useState('home');
  const back = () => nav.reset('home');

  if (nav.screen === 'send') return <SendMoneyFlow brand={BRAND} wallet={wallet} onExit={back} />;
  if (nav.screen === 'cashout') return <SendMoneyFlow brand={{ ...BRAND, sendFee: (a) => Math.round(a * 0.0115) }} wallet={wallet} onExit={back} title={t('Cash Out', 'ক্যাশ আউট', 'कैश आउट', 'Rút tiền mặt')} />;
  if (nav.screen === 'recharge') return <RechargeFlow brand={BRAND} wallet={wallet} onExit={back} operators={OPERATORS} ownNumber={BRAND.ownNumber} />;
  if (nav.screen === 'bill') return <PayBillFlow brand={BRAND} wallet={wallet} onExit={back} billers={BILLERS} />;
  if (nav.screen === 'scan') return <ScanPayFlow brand={BRAND} wallet={wallet} onExit={back} shop="Shapla Pharmacy" />;
  if (nav.screen === 'statement') return <Statement brand={BRAND} wallet={wallet} onExit={back} />;

  const services = [
    ['send', Send, BRAND.words.sendMoney, 'open_send_money', () => nav.push('send')],
    ['cashout', ArrowDownToLine, T('Cash Out', 'ক্যাশ আউট', 'कैश आउट', 'Rút tiền mặt'), 'open_cash_out', () => nav.push('cashout')],
    ['recharge', Smartphone, BRAND.words.recharge, 'open_recharge', () => nav.push('recharge')],
    ['pay', Store, T('Merchant Pay', 'মার্চেন্ট পে', 'मर्चेंट पे', 'Thanh toán cửa hàng'), 'open_scan', () => nav.push('scan')],
    ['bill', Receipt, BRAND.words.payBill, 'open_pay_bill', () => nav.push('bill')],
    ['history', History, BRAND.words.statement, 'open_statement', () => nav.push('statement')],
  ];

  return (
    <div className="ng" style={{ '--accent': BRAND.color }}>
      <Screen nav={nav}>
        <div className="ng-head">
          <StatusBar dark bg="transparent" />
          <div className="bk-head-row">
            <span className="bk-avatar"><UserRound size={22} /></span>
            <span className="bk-hello"><strong>{t('Amma', 'আম্মা', 'अम्मा', 'Mẹ')}</strong><BalancePill balance={wallet.balance} brand={BRAND} /></span>
            <Tap className="sim-icon-btn" style={{ color: '#fff' }} act="open_notifications" onClick={() => setTab('inbox')} label={t('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')}><Bell size={22} /></Tap>
            <span className="ng-logo">নগদ</span>
          </div>
        </div>
        <div className="sim-scroll" style={{ paddingTop: 14 }}>
          {tab === 'home' ? (
            <>
              <div className="ng-grid">
                {services.map(([id, Icon, label, act, fn]) => (
                  <Tap key={id} className="bk-tile" act={act} onClick={fn} explain={label}>
                    <span className="ng-tile-icon"><Icon size={24} /></span><span>{t(...label)}</span>
                  </Tap>
                ))}
              </div>
              <div className="bk-offer" style={{ background: 'linear-gradient(120deg,#fff3e0,#ffe0b2)', color: '#7a3d00' }}><Gift size={20} />{t('Nagad Islamic savings: ask a family member before you sign up.', 'নগদ ইসলামিক সেভিংস: শুরুর আগে পরিবারের কাউকে জিজ্ঞেস করুন।', 'Nagad इस्लामिक सेविंग्स: शुरू करने से पहले परिवार से पूछें।', 'Tiết kiệm Nagad: hỏi người thân trước khi đăng ký.')}</div>
              <p className="sim-safety" style={{ margin: '4px 16px 90px' }}><ShieldAlert size={16} />{t('Nagad staff never ask for your PIN or OTP. Anyone who does is a scammer.', 'নগদের কর্মীরা কখনো পিন বা ওটিপি চান না। যে চায় সে প্রতারক।', 'Nagad के कर्मचारी कभी पिन या ओटीपी नहीं मांगते। जो मांगे वह धोखेबाज़ है।', 'Nhân viên Nagad không bao giờ hỏi PIN hay OTP. Ai hỏi là kẻ lừa đảo.')}</p>
            </>
          ) : (
            <div>
              <p className="wa-section">{t('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')}</p>
              <div className="sim-row" style={{ alignItems: 'flex-start' }}>
                <span className="sim-avatar sm" style={{ background: '#e53935' }}><ShieldAlert size={18} /></span>
                <span className="sim-row-main"><span className="sim-row-title">{t('Your OTP is 482915', 'আপনার ওটিপি 482915', 'आपका ओटीपी 482915 है', 'Mã OTP của bạn là 482915')}</span><span className="sim-row-sub" style={{ whiteSpace: 'normal' }}>{t('Never share this code with anyone — not even Nagad staff.', 'এই কোড কাউকে দেবেন না — নগদের কর্মীদেরও না।', 'यह कोड किसी को न दें — Nagad के कर्मचारियों को भी नहीं।', 'Đừng đưa mã này cho ai — kể cả nhân viên Nagad.')}</span></span>
              </div>
            </div>
          )}
        </div>
        <nav className="bk-nav">
          <Tap className="bk-nav-item" aria-selected={tab === 'home'} act="tab_home" onClick={() => setTab('home')} style={{ '--sel': BRAND.color }}><Home size={22} />{t('Home', 'হোম', 'होम', 'Trang chủ')}</Tap>
          <Tap className="bk-qr" style={{ background: BRAND.color }} act="open_scan" onClick={() => nav.push('scan')} label={t('Scan QR', 'কিউআর স্ক্যান', 'QR स्कैन', 'Quét QR')}><QrCode size={28} /></Tap>
          <Tap className="bk-nav-item" aria-selected={tab === 'inbox'} act="tab_inbox" onClick={() => setTab('inbox')}><Bell size={22} />{t('Alerts', 'অ্যালার্ট', 'अलर्ट', 'Thông báo')}</Tap>
        </nav>
      </Screen>
      {scam && <ScamCall brand={BRAND} caller={t('"Nagad Head Office"', '"নগদ হেড অফিস"', '"Nagad हेड ऑफ़िस"', '"Trụ sở Nagad"')} onEnd={() => setScam(false)} />}
    </div>
  );
}
