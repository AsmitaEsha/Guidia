import { useState } from 'react';
import {
  AlertOctagon, Archive, ArrowLeft, File, Inbox, Mail, Menu, MoreVertical, Paperclip, Pencil, Reply, Search, Send, ShieldAlert, Star, Trash2, X,
} from 'lucide-react';
import { Photo, Screen, Sheet, StatusBar, T, Tap, useSim, useStack } from './kit/SimKit';

// Gmail (Android): inbox, reading, reply, star, archive, delete, report
// spam, a phishing email with Gmail's red warning, and compose with an
// attachment. Pretend email only.

const RED = '#d93025';

function mails(t) {
  return [
    { id: 'rupa', from: t('Rupa (Daughter)', 'রূপা (মেয়ে)', 'रूपा (बेटी)', 'Lan (con gái)'), addr: 'rupa.family@gmail.com', color: '#e57373', time: '9:14',
      subject: t('Photos from the wedding', 'বিয়ের ছবি', 'शादी की तस्वीरें', 'Ảnh đám cưới'), body: t('Hi Ma, I\'ve attached some photos from Shila\'s wedding. Reply and tell me which one you like best!', 'মা, শিলার বিয়ের কয়েকটা ছবি দিলাম। কোনটা সবচেয়ে ভালো লাগল উত্তরে জানিও!', 'माँ, शिला की शादी की कुछ तस्वीरें भेजी हैं। जवाब में बताना कौन सी सबसे अच्छी लगी!', 'Mẹ ơi, con gửi vài ảnh đám cưới của Thảo. Mẹ trả lời xem thích ảnh nào nhất nhé!'), unread: true },
    { id: 'phish', from: 'Bank Security Team', addr: 'security@mybank-verify-login.com', color: '#9e9e9e', time: '8:02', phish: true,
      subject: t('URGENT: Your account will be suspended', 'জরুরি: আপনার অ্যাকাউন্ট বন্ধ হয়ে যাবে', 'ज़रूरी: आपका खाता बंद हो जाएगा', 'KHẨN: Tài khoản của bạn sẽ bị khóa'), body: t('Dear customer, unusual activity was detected. Verify your password within 24 hours using the link below or lose access.', 'প্রিয় গ্রাহক, অস্বাভাবিক লেনদেন ধরা পড়েছে। ২৪ ঘণ্টার মধ্যে নিচের লিংকে পাসওয়ার্ড যাচাই করুন, নইলে অ্যাকাউন্ট বন্ধ।', 'प्रिय ग्राहक, असामान्य गतिविधि मिली है। 24 घंटे में नीचे दिए लिंक से पासवर्ड सत्यापित करें वरना खाता बंद।', 'Kính gửi khách hàng, phát hiện hoạt động bất thường. Xác minh mật khẩu trong 24 giờ qua đường link bên dưới nếu không sẽ mất quyền truy cập.'), unread: true },
    { id: 'clinic', from: t('City Clinic', 'সিটি ক্লিনিক', 'सिटी क्लिनिक', 'Phòng khám Thành phố'), addr: 'appointments@cityclinic.example', color: '#ba68c8', time: t('Yesterday', 'গতকাল', 'कल', 'Hôm qua'),
      subject: t('Your test results are ready', 'আপনার পরীক্ষার ফল তৈরি', 'आपकी जांच की रिपोर्ट तैयार है', 'Kết quả xét nghiệm đã có'), body: t('Please visit the clinic or log in to the patient portal to see them.', 'দেখতে ক্লিনিকে আসুন বা পেশেন্ট পোর্টালে লগইন করুন।', 'देखने के लिए क्लिनिक आएं या पेशेंट पोर्टल में लॉगिन करें।', 'Vui lòng đến phòng khám hoặc đăng nhập cổng bệnh nhân để xem.') },
  ];
}

export default function GmailSim() {
  const { t, showToast } = useSim();
  const nav = useStack('inbox');
  const [list, setList] = useState(() => mails(t));
  const [starred, setStarred] = useState({});
  const [menu, setMenu] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [folder, setFolder] = useState('inbox');
  const [sent, setSent] = useState([]);
  const mail = list.find((m) => m.id === nav.params.id);
  const remove = (id, msg) => { setList((l) => l.filter((m) => m.id !== id)); nav.reset('inbox'); showToast(msg); };

  if (nav.screen === 'compose') {
    return <Compose t={t} nav={nav} reply={nav.params.reply ? list.find((m) => m.id === nav.params.reply) : null}
      onSent={(m) => { setSent((s) => [m, ...s]); nav.reset('inbox'); showToast(t('Sent', 'পাঠানো হয়েছে', 'भेज दिया', 'Đã gửi')); }} />;
  }

  return (
    <div className="gm" style={{ '--accent': '#0b57d0' }}>
      {nav.screen === 'inbox' && (
        <Screen nav={nav}>
          <StatusBar bg="#f6f8fc" />
          <div className="gm-search">
            <Tap className="sim-icon-btn" act="open_menu" onClick={() => setDrawer(true)} label={t('Menu', 'মেনু', 'मेनू', 'Menu')} explain={T('Menu: Starred, Sent, Spam and other folders.', 'মেনু: স্টার দেওয়া, পাঠানো, স্প্যাম ও অন্য ফোল্ডার।', 'मेनू: स्टार वाले, भेजे गए, स्पैम और दूसरे फ़ोल्डर।', 'Menu: Gắn sao, Đã gửi, Thư rác và các thư mục khác.')}><Menu size={22} /></Tap>
            <span className="gm-search-text"><Search size={16} /> {t('Search in mail', 'মেইলে খুঁজুন', 'मेल में खोजें', 'Tìm trong thư')}</span>
            <span className="sim-avatar sm" style={{ background: '#8e24aa' }}>A</span>
          </div>
          <div className="sim-scroll">
            <p className="gm-folder">{folder === 'inbox' ? t('Primary', 'প্রাইমারি', 'प्राइमरी', 'Chính') : folder === 'sent' ? t('Sent', 'পাঠানো', 'भेजे गए', 'Đã gửi') : t('Starred', 'স্টার দেওয়া', 'स्टार वाले', 'Có gắn dấu sao')}</p>
            {folder === 'sent' ? (sent.length ? sent.map((m, i) => <div key={i} className="sim-row"><span className="sim-avatar sm" style={{ background: '#0b57d0' }}><Send size={16} /></span><span className="sim-row-main"><span className="sim-row-title">{t('To', 'প্রাপক', 'को', 'Tới')}: {m.to}</span><span className="sim-row-sub">{m.subject || m.body}</span></span></div>) : <p className="sim-pad" style={{ color: '#5f6368' }}>{t('Nothing sent yet.', 'এখনো কিছু পাঠানো হয়নি।', 'अभी कुछ नहीं भेजा।', 'Chưa gửi gì.')}</p>)
              : list.filter((m) => folder === 'inbox' || starred[m.id]).map((m) => (
                <Tap key={m.id} as="div" className="sim-row gm-row" data-unread={m.unread} act={`open_email open_email_${m.id}`} onClick={() => { setList((l) => l.map((x) => (x.id === m.id ? { ...x, unread: false } : x))); nav.push('read', { id: m.id }); }}
                  explain={T('An email. Tap to read it.', 'একটি ইমেইল। পড়তে চাপুন।', 'एक ईमेल। पढ़ने के लिए टैप करें।', 'Một email. Chạm để đọc.')}>
                  <span className="sim-avatar sm" style={{ background: m.color }}>{m.from.slice(0, 1)}</span>
                  <span className="sim-row-main"><span className="sim-row-title">{m.from}</span><span className="sim-row-sub" style={{ color: '#1f1f1f' }}>{m.subject}</span><span className="sim-row-sub">{m.body}</span></span>
                  <span className="sim-row-meta"><span>{m.time}</span><Star size={18} fill={starred[m.id] ? '#f4b400' : 'none'} color={starred[m.id] ? '#f4b400' : '#5f6368'} /></span>
                </Tap>
              ))}
          </div>
          <Tap className="gm-compose" act="open_compose" onClick={() => nav.push('compose')} explain={T('Compose: start writing a new email.', 'কম্পোজ: নতুন ইমেইল লেখা শুরু করুন।', 'कंपोज़: नया ईमेल लिखना शुरू करें।', 'Soạn thư: bắt đầu viết email mới.')}><Pencil size={20} />{t('Compose', 'কম্পোজ', 'कंपोज़', 'Soạn thư')}</Tap>
        </Screen>
      )}

      {nav.screen === 'read' && mail && (
        <Screen nav={nav} style={{ background: '#fff' }}>
          <StatusBar bg="#fff" />
          <div className="gm-readbar">
            <Tap className="sim-icon-btn" onClick={nav.back} label={t('Back', 'পেছনে', 'पीछे', 'Quay lại')}><ArrowLeft size={22} /></Tap>
            <span style={{ flex: 1 }} />
            <Tap className="sim-icon-btn" act="archive_email" onClick={() => remove(mail.id, t('Archived', 'আর্কাইভ করা হয়েছে', 'आर्काइव किया', 'Đã lưu trữ'))} label={t('Archive', 'আর্কাইভ', 'आर्काइव', 'Lưu trữ')} explain={T('Archive: tidies the email away without deleting it.', 'আর্কাইভ: না মুছে ইমেইল সরিয়ে রাখে।', 'आर्काइव: बिना मिटाए ईमेल हटा देता है।', 'Lưu trữ: cất email đi mà không xóa.')}><Archive size={21} /></Tap>
            <Tap className="sim-icon-btn" act="delete_email" onClick={() => remove(mail.id, t('Moved to Bin', 'বিনে সরানো হয়েছে', 'बिन में भेजा', 'Đã chuyển vào thùng rác'))} label={t('Delete', 'মুছুন', 'डिलीट', 'Xóa')} explain={T('Delete: moves the email to the Bin.', 'মুছুন: ইমেইলটি বিনে পাঠায়।', 'डिलीट: ईमेल को बिन में भेजता है।', 'Xóa: chuyển email vào thùng rác.')}><Trash2 size={21} /></Tap>
            <Tap className="sim-icon-btn" act="open_more" onClick={() => setMenu(true)} label={t('More', 'আরও', 'और', 'Thêm')} explain={T('More: Report spam, block sender and more.', 'আরও: স্প্যাম রিপোর্ট, প্রেরক ব্লক ইত্যাদি।', 'और: स्पैम रिपोर्ट, भेजने वाले को ब्लॉक वगैरह।', 'Thêm: Báo cáo thư rác, chặn người gửi…')}><MoreVertical size={21} /></Tap>
          </div>
          <div className="sim-scroll gm-read">
            <div className="gm-subject-row"><h3>{mail.subject}</h3>
              <Tap className="sim-icon-btn" act="star_email" onClick={() => setStarred((s) => ({ ...s, [mail.id]: !s[mail.id] }))} label={t('Star', 'স্টার', 'स्टार', 'Gắn sao')} explain={T('Star: marks it so you can find it later.', 'স্টার: চিহ্ন দেয়, পরে সহজে খুঁজে পাবেন।', 'स्टार: निशान लगाता है, बाद में आसानी से मिलेगा।', 'Gắn sao: đánh dấu để tìm lại dễ.')}><Star size={21} fill={starred[mail.id] ? '#f4b400' : 'none'} color={starred[mail.id] ? '#f4b400' : '#5f6368'} /></Tap>
            </div>
            {mail.phish && (
              <div className="gm-warning">
                <AlertOctagon size={22} />
                <div><strong>{t('This message seems dangerous', 'এই মেসেজটি বিপজ্জনক মনে হচ্ছে', 'यह मैसेज खतरनाक लगता है', 'Thư này có vẻ nguy hiểm')}</strong><p>{t('Similar messages were used to steal people\'s personal information. Avoid clicking links or replying.', 'এ ধরনের মেসেজ দিয়ে মানুষের ব্যক্তিগত তথ্য চুরি করা হয়েছে। লিংকে চাপবেন না, উত্তরও দেবেন না।', 'ऐसे मैसेज से लोगों की निजी जानकारी चुराई गई है। लिंक न दबाएं, जवाब न दें।', 'Thư tương tự từng được dùng để lấy cắp thông tin. Tránh bấm link hoặc trả lời.')}</p>
                  <Tap className="gm-warn-btn" act="report_spam" onClick={() => remove(mail.id, t('Reported as spam. Similar emails will be caught next time.', 'স্প্যাম হিসেবে রিপোর্ট হয়েছে। পরের বার এমন ইমেইল আটকে যাবে।', 'स्पैम के रूप में रिपोर्ट हुआ। अगली बार ऐसे ईमेल रुक जाएंगे।', 'Đã báo cáo thư rác. Lần sau thư tương tự sẽ bị chặn.'))}>{t('Report spam', 'স্প্যাম রিপোর্ট করুন', 'स्पैम रिपोर्ट करें', 'Báo cáo thư rác')}</Tap>
                </div>
              </div>
            )}
            <div className="gm-from">
              <span className="sim-avatar sm" style={{ background: mail.color }}>{mail.from.slice(0, 1)}</span>
              <span className="sim-row-main"><span className="sim-row-title">{mail.from}</span><span className="sim-row-sub">{mail.addr}</span></span>
            </div>
            <p className="gm-body">{mail.body}</p>
            {mail.id === 'rupa' && <div className="gm-attach"><Photo kind="flowers" className="gm-att" size={30} /><Photo kind="family" className="gm-att" size={30} /></div>}
            {mail.phish && <Tap className="gm-fake-link" act="mistake_click_phish" onClick={() => showToast(t('Stop! This link leads to a fake page that steals passwords. Never sign in from an email link.', 'থামুন! এই লিংক পাসওয়ার্ড চুরির ভুয়া পেজে নিয়ে যায়। ইমেইলের লিংক থেকে কখনো লগইন করবেন না।', 'रुकिए! यह लिंक पासवर्ड चुराने वाले नकली पेज पर ले जाता है। ईमेल के लिंक से कभी लॉगिन न करें।', 'Dừng lại! Link này dẫn tới trang giả lấy cắp mật khẩu. Đừng đăng nhập từ link trong email.'), 5000)}>https://mybank-verify-login.com/secure</Tap>}
            {!mail.phish && (
              <div className="gm-reply-row">
                <Tap className="gm-pill" act="open_reply" onClick={() => nav.push('compose', { reply: mail.id })} explain={T('Reply: writes back to the sender only.', 'রিপ্লাই: শুধু প্রেরককে উত্তর লেখে।', 'रिप्लाई: सिर्फ़ भेजने वाले को जवाब लिखता है।', 'Trả lời: chỉ gửi lại cho người gửi.')}><Reply size={18} />{t('Reply', 'রিপ্লাই', 'रिप्लाई', 'Trả lời')}</Tap>
              </div>
            )}
          </div>
          <Sheet open={menu} onClose={() => setMenu(false)}>
            {[
              ['report_spam', AlertOctagon, T('Report spam', 'স্প্যাম রিপোর্ট', 'स्पैम रिपोर्ट', 'Báo cáo thư rác'), () => remove(mail.id, t('Reported as spam.', 'স্প্যাম হিসেবে রিপোর্ট হয়েছে।', 'स्पैम के रूप में रिपोर्ट हुआ।', 'Đã báo cáo thư rác.'))],
              ['block_sender', ShieldAlert, T(`Block "${mail.from}"`, `"${mail.from}"-কে ব্লক`, `"${mail.from}" को ब्लॉक`, `Chặn "${mail.from}"`), () => remove(mail.id, t('Sender blocked. Their emails go to Spam.', 'প্রেরক ব্লক হয়েছে। তার ইমেইল স্প্যামে যাবে।', 'भेजने वाला ब्लॉक। उसके ईमेल स्पैम में जाएंगे।', 'Đã chặn người gửi. Email của họ vào Thư rác.'))],
              ['mark_unread', Mail, T('Mark as unread', 'না-পড়া হিসেবে চিহ্নিত', 'अपठित चिह्नित करें', 'Đánh dấu chưa đọc'), () => { setList((l) => l.map((x) => (x.id === mail.id ? { ...x, unread: true } : x))); nav.back(); }],
            ].map(([act, Icon, label, fn]) => (
              <Tap key={act} className="sim-row" act={act} onClick={() => { setMenu(false); fn(); }}><Icon size={20} color={act === 'mark_unread' ? '#5f6368' : RED} /><span className="sim-row-title">{t(...label)}</span></Tap>
            ))}
          </Sheet>
        </Screen>
      )}

      <Sheet open={drawer} onClose={() => setDrawer(false)} title="Gmail">
        {[['inbox', Inbox, T('Inbox', 'ইনবক্স', 'इनबॉक्स', 'Hộp thư đến')], ['starred', Star, T('Starred', 'স্টার দেওয়া', 'स्टार वाले', 'Có gắn dấu sao')], ['sent', Send, T('Sent', 'পাঠানো', 'भेजे गए', 'Đã gửi')]].map(([id, Icon, label]) => (
          <Tap key={id} className="sim-row gm-drawer-row" aria-pressed={folder === id} act={`open_folder_${id}`} onClick={() => { setFolder(id); setDrawer(false); }}><Icon size={20} /><span className="sim-row-title">{t(...label)}</span></Tap>
        ))}
      </Sheet>
    </div>
  );
}

function Compose({ t, nav, reply, onSent }) {
  const { emit, showToast } = useSim();
  const [to, setTo] = useState(reply?.addr || '');
  const [subject, setSubject] = useState(reply ? `Re: ${reply.subject}` : '');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]);
  const [pick, setPick] = useState(false);
  const valid = /^\S+@\S+\.\S+$/.test(to.trim());
  return (
    <div className="gm" style={{ background: '#fff' }}>
      <StatusBar bg="#fff" />
      <div className="gm-readbar">
        <Tap className="sim-icon-btn" onClick={nav.back} label={t('Close', 'বন্ধ', 'बंद करें', 'Đóng')}><X size={22} /></Tap>
        <span style={{ flex: 1, fontSize: 18, fontWeight: 500 }}>{reply ? t('Reply', 'রিপ্লাই', 'रिप्लाई', 'Trả lời') : t('Compose', 'কম্পোজ', 'कंपोज़', 'Soạn thư')}</span>
        <Tap className="sim-icon-btn" act="open_attach" onClick={() => setPick(true)} label={t('Attach', 'অ্যাটাচ', 'अटैच', 'Đính kèm')} explain={T('Paperclip: add a photo or file.', 'পেপারক্লিপ: ছবি বা ফাইল যোগ করুন।', 'पेपरक्लिप: फोटो या फ़ाइल जोड़ें।', 'Kẹp giấy: thêm ảnh hoặc tệp.')}><Paperclip size={21} /></Tap>
        <Tap className="sim-icon-btn" style={{ color: valid ? '#0b57d0' : '#9aa0a6' }} act="send_email" onClick={() => { if (!valid) { showToast(t('Add a valid email address in "To" first.', 'আগে "To"-তে সঠিক ইমেইল ঠিকানা দিন।', 'पहले "To" में सही ईमेल पता डालें।', 'Hãy nhập địa chỉ email hợp lệ ở ô "Tới".')); return; } onSent({ to, subject, body }); }}
          label={t('Send', 'পাঠান', 'भेजें', 'Gửi')} explain={T('Send: sends the email. Check the "To" address first.', 'পাঠান: ইমেইল পাঠায়। আগে "To" ঠিকানা মিলিয়ে নিন।', 'भेजें: ईमेल भेजता है। पहले "To" पता जांचें।', 'Gửi: gửi email. Kiểm tra địa chỉ "Tới" trước.')}><Send size={21} /></Tap>
      </div>
      <div className="sim-scroll">
        <label className="gm-line"><span>{t('To', 'প্রাপক', 'को', 'Tới')}</span><input data-act="enter_to" value={to} onChange={(e) => { if (!to && e.target.value) emit('enter_to'); setTo(e.target.value); }} inputMode="email" placeholder="name@example.com" /></label>
        <label className="gm-line"><span>{t('Subject', 'বিষয়', 'विषय', 'Chủ đề')}</span><input value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
        <textarea className="gm-textarea" data-act="type_email" value={body} onChange={(e) => { if (!body && e.target.value) emit('type_email'); setBody(e.target.value); }} placeholder={t('Compose email', 'ইমেইল লিখুন', 'ईमेल लिखें', 'Soạn email')} />
        {files.map((f, i) => <div key={i} className="gm-file"><File size={18} /> {f}<Tap className="sim-icon-btn" onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} label={t('Remove', 'সরান', 'हटाएं', 'Gỡ')}><X size={16} /></Tap></div>)}
      </div>
      <Sheet open={pick} onClose={() => setPick(false)} title={t('Attach file', 'ফাইল যুক্ত করুন', 'फ़ाइल जोड़ें', 'Đính kèm tệp')}>
        {['garden_photo.jpg', 'prescription.pdf'].map((f) => (
          <Tap key={f} className="sim-row" act="pick_file" onClick={() => { setFiles((x) => [...x, f]); setPick(false); }}><File size={20} color="#0b57d0" /><span className="sim-row-title">{f}</span></Tap>
        ))}
      </Sheet>
    </div>
  );
}
