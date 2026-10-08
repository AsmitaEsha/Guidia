import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Bell, ChevronRight, CreditCard, Flag, Heart, Home, Mail, Send, ShieldAlert, Tag, Wallet } from 'lucide-react';
import { AppBar, Screen, Sheet, StatusBar, T, Tap, money, useSim, useStack } from './kit/SimKit';
import { SendMoneyFlow, useWallet } from './kit/MoneyKit';

// PayPal: balance, Send / Request, "friend or purchase?", Activity with
// Report a problem, and a phishing email to spot.

const BRAND = {
  name: 'PayPal', color: '#003087', currency: 'USD', symbol: '$', locale: 'en-US', region: 'US', pinLength: 4, confirm: 'button',
  quickAmounts: [20, 50, 100, 250], rechargeAmounts: [], sendFee: () => 0,
  pinTitle: T('Confirm with your PayPal PIN', 'পেপ্যাল পিন দিয়ে নিশ্চিত করুন', 'PayPal पिन से पुष्टि करें', 'Xác nhận bằng PIN PayPal'),
  words: {
    sendMoney: T('Send', 'সেন্ড', 'भेजें', 'Gửi'),
    statement: T('Activity', 'অ্যাক্টিভিটি', 'एक्टिविटी', 'Hoạt động'),
    tapBalance: T('Show balance', 'ব্যালেন্স দেখুন', 'बैलेंस दिखाएं', 'Hiện số dư'),
    confirm: T('Send Now', 'সেন্ড নাউ', 'अभी भेजें', 'Gửi ngay'),
  },
};

export default function PayPalSim() {
  const { t, language, showToast, emit } = useSim();
  const nav = useStack('home');
  const wallet = useWallet(1240.5);
  const [purpose, setPurpose] = useState(null);
  const [problem, setProblem] = useState(null);
  const [mailOpen, setMailOpen] = useState(false);
  const back = () => nav.reset('home');

  if (nav.screen === 'send') return <SendMoneyFlow brand={BRAND} wallet={wallet} onExit={back} region="US" title={purpose === 'item' ? t('Paying for an item', 'জিনিসের দাম দিচ্ছেন', 'सामान का भुगतान', 'Thanh toán hàng hóa') : t('Sending to a friend', 'বন্ধুকে পাঠাচ্ছেন', 'दोस्त को भेज रहे हैं', 'Gửi cho bạn bè')} />;

  const activity = [
    ...wallet.history.map((h) => ({ id: h.id, who: h.to, amount: -h.amount, when: t('Today', 'আজ', 'आज', 'Hôm nay') })),
    { id: 'a1', who: 'Corner Books', amount: -18.99, when: 'Sep 30' },
    { id: 'a2', who: 'Emma (Daughter)', amount: 50, when: 'Sep 28' },
    { id: 'a3', who: 'QuickPrize Rewards', amount: -1.0, when: 'Sep 27', odd: true },
  ];

  return (
    <div className="pp" style={{ '--accent': BRAND.color }}>
      {nav.screen === 'home' && (
        <Screen nav={nav}>
          <StatusBar bg="#fff" />
          <div className="pp-top">
            <span className="pp-logo"><b>Pay</b>Pal</span>
            <Tap className="sim-icon-btn" act="open_mail" onClick={() => setMailOpen(true)} label={t('Email', 'ইমেইল', 'ईमेल', 'Email')}><Mail size={22} /></Tap>
            <Tap className="sim-icon-btn" act="open_notifications" onClick={() => setMailOpen(true)} label={t('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')}><Bell size={22} /></Tap>
          </div>
          <div className="sim-scroll">
            <div className="pp-balance">
              <span>{t('PayPal balance', 'পেপ্যাল ব্যালেন্স', 'PayPal बैलेंस', 'Số dư PayPal')}</span>
              <strong>{money(wallet.balance, 'USD', language)}</strong>
              <small>{t('Available', 'ব্যবহারযোগ্য', 'उपलब्ध', 'Khả dụng')}</small>
            </div>
            <div className="pp-actions">
              <Tap className="pp-action" act="open_send_money" onClick={() => setPurpose('ask')} explain={T('Send: start sending money to an email or phone.', 'সেন্ড: ইমেইল বা ফোনে টাকা পাঠানো শুরু করুন।', 'भेजें: ईमेल या फोन पर पैसे भेजना शुरू करें।', 'Gửi: bắt đầu gửi tiền tới email hoặc số điện thoại.')}><span className="pp-action-icon"><Send size={22} /></span>{t('Send', 'সেন্ড', 'भेजें', 'Gửi')}</Tap>
              <Tap className="pp-action" act="open_request" onClick={() => showToast(t('Request asks someone to send YOU money. Only request from people you know.', 'রিকোয়েস্ট অন্য কাউকে আপনাকে টাকা পাঠাতে বলে। শুধু চেনা মানুষের কাছে চান।', 'रिक्वेस्ट किसी और से आपको पैसे भेजने को कहता है। सिर्फ़ जानने वालों से मांगें।', 'Yêu cầu là nhờ người khác gửi tiền CHO BẠN. Chỉ yêu cầu người quen.'), 4000)}><span className="pp-action-icon"><ArrowDownLeft size={22} /></span>{t('Request', 'রিকোয়েস্ট', 'रिक्वेस्ट', 'Yêu cầu')}</Tap>
              <Tap className="pp-action" act="open_wallet" onClick={() => showToast(t('Wallet: your linked bank account and card.', 'ওয়ালেট: আপনার যুক্ত ব্যাংক অ্যাকাউন্ট ও কার্ড।', 'वॉलेट: आपका जुड़ा बैंक खाता और कार्ड।', 'Ví: tài khoản ngân hàng và thẻ đã liên kết.'))}><span className="pp-action-icon"><Wallet size={22} /></span>{t('Wallet', 'ওয়ালেট', 'वॉलेट', 'Ví')}</Tap>
            </div>
            <div className="pp-card">
              <div className="pp-card-head"><span>{t('Recent activity', 'সাম্প্রতিক লেনদেন', 'हाल के लेन-देन', 'Hoạt động gần đây')}</span><Tap className="pp-link" act="open_activity" onClick={() => nav.push('activity')}>{t('Show all', 'সব দেখুন', 'सब देखें', 'Xem tất cả')}</Tap></div>
              {activity.slice(0, 3).map((a) => (
                <div key={a.id} className="sim-row" style={{ padding: '10px 0' }}>
                  <span className="sim-avatar sm" style={{ background: '#e8eef8', color: BRAND.color }}>{a.amount < 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}</span>
                  <span className="sim-row-main"><span className="sim-row-title">{a.who}</span><span className="sim-row-sub">{a.when}</span></span>
                  <strong style={{ color: a.amount < 0 ? '#111' : '#1e7e34' }}>{a.amount < 0 ? '−' : '+'}{money(Math.abs(a.amount), 'USD', language)}</strong>
                </div>
              ))}
            </div>
            <p className="sim-safety" style={{ margin: '0 16px 24px' }}><ShieldAlert size={16} />{t('Real PayPal emails use your full name and come from @paypal.com.', 'আসল পেপ্যাল ইমেইলে আপনার পুরো নাম থাকে আর @paypal.com থেকে আসে।', 'असली PayPal ईमेल में आपका पूरा नाम होता है और @paypal.com से आते हैं।', 'Email PayPal thật gọi đúng họ tên bạn và đến từ @paypal.com.')}</p>
          </div>
          <nav className="pp-nav">
            <span className="pp-nav-item is-on"><Home size={22} />{t('Home', 'হোম', 'होम', 'Trang chủ')}</span>
            <Tap className="pp-nav-item" act="open_send_money" onClick={() => setPurpose('ask')}><Send size={22} />{t('Payments', 'পেমেন্ট', 'भुगतान', 'Thanh toán')}</Tap>
            <Tap className="pp-nav-item" act="open_activity" onClick={() => nav.push('activity')}><CreditCard size={22} />{t('Activity', 'অ্যাক্টিভিটি', 'एक्टिविटी', 'Hoạt động')}</Tap>
          </nav>
        </Screen>
      )}

      {nav.screen === 'activity' && (
        <Screen nav={nav}>
          <StatusBar bg="#fff" />
          <AppBar bg="#fff" fg="#111" onBack={nav.back} title={t('Activity', 'অ্যাক্টিভিটি', 'एक्टिविटी', 'Hoạt động')} />
          <div className="sim-scroll">
            {activity.map((a) => (
              <Tap key={a.id} className="sim-row" act={a.odd ? 'open_odd_payment' : 'open_payment'} onClick={() => setProblem(a)}>
                <span className="sim-avatar sm" style={{ background: a.odd ? '#fdecea' : '#e8eef8', color: a.odd ? '#c62828' : BRAND.color }}>{a.amount < 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}</span>
                <span className="sim-row-main"><span className="sim-row-title">{a.who}</span><span className="sim-row-sub">{a.when}{a.odd ? ` · ${t('Not recognised?', 'চেনেন না?', 'पहचान नहीं?', 'Không nhận ra?')}` : ''}</span></span>
                <strong>{a.amount < 0 ? '−' : '+'}{money(Math.abs(a.amount), 'USD', language)}</strong><ChevronRight size={18} color="#9aa5ab" />
              </Tap>
            ))}
          </div>
        </Screen>
      )}

      <Sheet open={purpose === 'ask'} onClose={() => setPurpose(null)} title={t('What is this payment for?', 'এই পেমেন্ট কিসের জন্য?', 'यह भुगतान किसके लिए है?', 'Khoản này để làm gì?')}>
        <div className="sim-stack">
          <Tap className="pp-purpose" act="choose_friend" onClick={() => { setPurpose('friend'); nav.push('send'); }}>
            <Heart size={22} color="#e91e63" /><span className="sim-row-main"><span className="sim-row-title">{t('Sending to a friend', 'বন্ধুকে পাঠাচ্ছি', 'दोस्त को भेज रहा हूं', 'Gửi cho bạn bè')}</span><span className="sim-row-sub" style={{ whiteSpace: 'normal' }}>{t('Family and friends you know — no purchase protection.', 'চেনা পরিবার ও বন্ধু — কেনাকাটার সুরক্ষা নেই।', 'जानने वाले परिवार और दोस्त — खरीदारी सुरक्षा नहीं।', 'Người thân, bạn bè quen — không có bảo vệ mua hàng.')}</span></span>
          </Tap>
          <Tap className="pp-purpose" act="choose_item" onClick={() => { setPurpose('item'); nav.push('send'); }}>
            <Tag size={22} color={BRAND.color} /><span className="sim-row-main"><span className="sim-row-title">{t('Paying for an item or service', 'জিনিস বা সেবার দাম দিচ্ছি', 'सामान या सेवा का भुगतान', 'Trả tiền hàng hóa hoặc dịch vụ')}</span><span className="sim-row-sub" style={{ whiteSpace: 'normal' }}>{t('Buying from a seller — you can get your money back if it never arrives.', 'বিক্রেতার কাছ থেকে কেনা — জিনিস না এলে টাকা ফেরত পাবেন।', 'विक्रेता से खरीदारी — सामान न आए तो पैसे वापस मिल सकते हैं।', 'Mua của người bán — được hoàn tiền nếu không nhận hàng.')}</span></span>
          </Tap>
        </div>
      </Sheet>

      <Sheet open={Boolean(problem)} onClose={() => setProblem(null)} title={problem?.who}>
        <div className="sim-stack">
          <div className="mk-receipt" style={{ margin: 0 }}>
            <div className="mk-receipt-row"><span>{t('Amount', 'পরিমাণ', 'रकम', 'Số tiền')}</span><strong>{problem ? money(Math.abs(problem.amount), 'USD', language) : ''}</strong></div>
            <div className="mk-receipt-row"><span>{t('Date', 'তারিখ', 'तारीख', 'Ngày')}</span><strong>{problem?.when}</strong></div>
          </div>
          {problem?.odd && <p className="sim-danger-note"><ShieldAlert size={16} />{t('A small payment you don\'t recognise is often a test before a bigger theft.', 'অচেনা ছোট পেমেন্ট প্রায়ই বড় চুরির আগে পরীক্ষা।', 'अनजान छोटा भुगतान अक्सर बड़ी चोरी से पहले की जांच होता है।', 'Khoản nhỏ lạ thường là bước thử trước vụ lấy cắp lớn.')}</p>}
          <Tap className="sim-primary" style={{ background: '#c62828' }} act="report_problem" onClick={() => { setProblem(null); emit('report_problem'); showToast(t('Reported. PayPal will look into it and keep you updated.', 'রিপোর্ট হয়েছে। পেপ্যাল খতিয়ে দেখবে আর আপনাকে জানাবে।', 'रिपोर्ट हो गई। PayPal जांच करके आपको बताएगा।', 'Đã báo cáo. PayPal sẽ xem xét và báo cho bạn.')); }}><Flag size={18} /> {t('Report a problem', 'সমস্যা জানান', 'समस्या बताएं', 'Báo cáo sự cố')}</Tap>
          <Tap className="sim-secondary" onClick={() => setProblem(null)}>{t('Close', 'বন্ধ করুন', 'बंद करें', 'Đóng')}</Tap>
        </div>
      </Sheet>

      <Sheet open={mailOpen} onClose={() => setMailOpen(false)} title={t('New email', 'নতুন ইমেইল', 'नया ईमेल', 'Email mới')}>
        <div className="sim-stack">
          <div className="pp-mail">
            <p className="pp-mail-from"><strong>PayPal Service</strong> &lt;service@paypa1-secure.com&gt;</p>
            <p className="pp-mail-subject">{t('Your account has been limited!', 'আপনার অ্যাকাউন্ট সীমিত করা হয়েছে!', 'आपका खाता सीमित कर दिया गया है!', 'Tài khoản của bạn đã bị giới hạn!')}</p>
            <p>{t('Dear customer, confirm your details within 24 hours or your account will be closed.', 'প্রিয় গ্রাহক, ২৪ ঘণ্টার মধ্যে তথ্য নিশ্চিত করুন, নইলে অ্যাকাউন্ট বন্ধ হয়ে যাবে।', 'प्रिय ग्राहक, 24 घंटे में जानकारी की पुष्टि करें वरना खाता बंद हो जाएगा।', 'Kính gửi khách hàng, hãy xác nhận thông tin trong 24 giờ nếu không tài khoản sẽ bị đóng.')}</p>
            <span className="pp-mail-btn">{t('Confirm now', 'এখনই নিশ্চিত করুন', 'अभी पुष्टि करें', 'Xác nhận ngay')}</span>
          </div>
          <p className="sim-danger-note"><ShieldAlert size={16} />{t('Fake: "Dear customer", a 24-hour threat, and the sender is paypa1-secure.com (a number 1, not the letter l).', 'ভুয়া: "প্রিয় গ্রাহক", ২৪ ঘণ্টার হুমকি, আর প্রেরক paypa1-secure.com (l নয়, সংখ্যা 1)।', 'नकली: "प्रिय ग्राहक", 24 घंटे की धमकी, और भेजने वाला paypa1-secure.com (l नहीं, अंक 1)।', 'Giả: "Kính gửi khách hàng", dọa 24 giờ, và người gửi là paypa1-secure.com (số 1, không phải chữ l).')}</p>
          <Tap className="sim-primary" style={{ background: BRAND.color }} act="delete_phishing" onClick={() => { setMailOpen(false); showToast(t('Deleted. The real PayPal app shows no problem — you were right.', 'মুছে দিয়েছেন। আসল পেপ্যাল অ্যাপে কোনো সমস্যা নেই — আপনি ঠিক ছিলেন।', 'डिलीट कर दिया। असली PayPal ऐप में कोई दिक्कत नहीं — आप सही थे।', 'Đã xóa. Ứng dụng PayPal thật không có vấn đề gì — bạn đã đúng.')); }}>{t('Delete this email', 'ইমেইলটি মুছুন', 'यह ईमेल डिलीट करें', 'Xóa email này')}</Tap>
          <Tap className="sim-secondary" act="mistake_open_phishing" onClick={() => showToast(t('Never tap buttons in suspicious emails. Open the PayPal app yourself instead.', 'সন্দেহজনক ইমেইলের বোতামে কখনো চাপবেন না। বরং নিজে পেপ্যাল অ্যাপ খুলুন।', 'संदिग्ध ईमेल के बटन कभी न दबाएं। इसके बजाय खुद PayPal ऐप खोलें।', 'Đừng chạm nút trong email đáng ngờ. Hãy tự mở ứng dụng PayPal.'), 4200)}>{t('Tap "Confirm now"', '"এখনই নিশ্চিত করুন" চাপুন', '"अभी पुष्टि करें" दबाएं', 'Chạm "Xác nhận ngay"')}</Tap>
        </div>
      </Sheet>
    </div>
  );
}

