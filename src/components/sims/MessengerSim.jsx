import { useEffect, useRef, useState } from 'react';
import {
  Ban, Camera, CirclePlus, Edit, Flag, Image as ImageIcon, Inbox, Mic, MicOff, Phone, PhoneOff, Search, Send, ShieldAlert, ThumbsUp, Video, VideoOff, Volume2,
} from 'lucide-react';
import { AppBar, Photo, Reaction, Screen, Sheet, StatusBar, T, Tap, useSim, useStack } from './kit/SimKit';

// Messenger: chats with stories, a chat with the "Aa" box, photos, thumbs-up,
// video calls, message requests from strangers, and block / report.

const BLUE = '#0084FF';

function people(t) {
  return [
    { id: 'rupa', name: t('Rupa (Daughter)', 'রূপা (মেয়ে)', 'रूपा (बेटी)', 'Lan (con gái)'), color: '#e57373', active: true,
      msgs: [{ id: 1, me: false, text: t('Ma, are you coming on Sunday?', 'মা, রবিবার আসছ তো?', 'माँ, रविवार को आ रही हो?', 'Mẹ ơi, Chủ nhật mẹ qua không?') }] },
    { id: 'meena', name: t('Meena (neighbour)', 'মীনা (প্রতিবেশী)', 'मीना (पड़ोसी)', 'Mai (hàng xóm)'), color: '#ffb74d',
      msgs: [{ id: 1, me: false, text: t('Thank you for the mangoes!', 'আমের জন্য ধন্যবাদ!', 'आमों के लिए धन्यवाद!', 'Cảm ơn chị vì mấy quả xoài!') }] },
    { id: 'fake', name: t('Rahim (Son)', 'রহিম (ছেলে)', 'राहुल (बेटा)', 'Minh (con trai)'), color: '#64b5f6', fake: true,
      msgs: [
        { id: 1, me: false, text: t('Ma I\'m in trouble, I can\'t talk on the phone right now.', 'মা আমি বিপদে আছি, এখন ফোনে কথা বলতে পারছি না।', 'माँ मैं मुसीबत में हूं, अभी फोन पर बात नहीं कर सकता।', 'Mẹ ơi con gặp chuyện, giờ con không nghe máy được.') },
        { id: 2, me: false, text: t('Please send 8,000 to this new number urgently. I\'ll pay you back tomorrow.', 'খুব জরুরি, এই নতুন নম্বরে ৮,০০০ টাকা পাঠাও। কাল ফেরত দেব।', 'जल्दी इस नए नंबर पर 8,000 भेज दो। कल लौटा दूंगा।', 'Mẹ chuyển gấp 8 triệu vào số mới này nhé. Mai con trả.'), scam: true },
      ] },
  ];
}

export default function MessengerSim() {
  const { t, showToast } = useSim();
  const nav = useStack('chats');
  const [threads, setThreads] = useState(() => Object.fromEntries(people(t).map((p) => [p.id, p.msgs])));
  const [blocked, setBlocked] = useState({});
  const [call, setCall] = useState(null);
  const list = people(t);
  const person = list.find((p) => p.id === nav.params.id);
  const add = (id, m) => setThreads((th) => ({ ...th, [id]: [...th[id], { id: Date.now(), me: true, ...m }] }));

  return (
    <div className="ms" style={{ '--accent': BLUE }}>
      {nav.screen === 'chats' && (
        <Screen nav={nav}>
          <StatusBar bg="#fff" />
          <div className="ms-top">
            <span className="ms-title">{t('Chats', 'চ্যাট', 'चैट', 'Đoạn chat')}</span>
            <Tap className="fb-round" act="open_new_chat" onClick={() => nav.push('chat', { id: 'rupa' })} label={t('New message', 'নতুন মেসেজ', 'नया मैसेज', 'Tin nhắn mới')} explain={T('New message: pick someone to write to.', 'নতুন মেসেজ: কাউকে লেখার জন্য বেছে নিন।', 'नया मैसेज: लिखने के लिए किसी को चुनें।', 'Tin nhắn mới: chọn người để nhắn.')}><Edit size={20} /></Tap>
          </div>
          <div className="wa-search" style={{ margin: '4px 14px 10px' }}><Search size={18} /><span>{t('Search', 'সার্চ', 'सर्च', 'Tìm kiếm')}</span></div>
          <div className="sim-scroll">
            <div className="ms-stories">
              {list.filter((p) => !p.fake).map((p) => <span key={p.id} className="ms-story"><span className="sim-avatar" style={{ background: p.color }}>{p.name.slice(0, 1)}</span>{p.active && <i />}<small>{p.name.split(' ')[0]}</small></span>)}
            </div>
            {list.map((p) => {
              const last = threads[p.id][threads[p.id].length - 1];
              return (
                <Tap key={p.id} className="sim-row" act={`open_chat open_chat_${p.id}`} onClick={() => nav.push('chat', { id: p.id })} explain={T('A conversation. Tap to open it.', 'একটি কথোপকথন। খুলতে চাপুন।', 'एक बातचीत। खोलने के लिए टैप करें।', 'Một cuộc trò chuyện. Chạm để mở.')}>
                  <span className="sim-avatar" style={{ background: p.color }}>{p.name.slice(0, 1)}</span>
                  <span className="sim-row-main"><span className="sim-row-title">{p.name}</span><span className="sim-row-sub" style={{ fontWeight: last.me ? 400 : 700, color: last.me ? undefined : '#050505' }}>{last.me ? `${t('You', 'আপনি', 'आप', 'Bạn')}: ` : ''}{last.photo ? t('Photo', 'ছবি', 'फोटो', 'Ảnh') : last.like ? t('Like', 'লাইক', 'लाइक', 'Thích') : last.text}</span></span>
                  {!last.me && <span className="ms-unread" />}
                </Tap>
              );
            })}
            <Tap className="sim-row" act="open_requests" onClick={() => nav.push('requests')} explain={T('Message requests: messages from people you don\'t know wait here.', 'মেসেজ রিকোয়েস্ট: অচেনা মানুষের মেসেজ এখানে অপেক্ষা করে।', 'मैसेज रिक्वेस्ट: अनजान लोगों के मैसेज यहां इंतज़ार करते हैं।', 'Tin nhắn chờ: tin của người lạ nằm ở đây.')}>
              <span className="sim-avatar" style={{ background: '#e4e6eb', color: '#050505' }}><Inbox size={22} /></span>
              <span className="sim-row-main"><span className="sim-row-title">{t('Message requests', 'মেসেজ রিকোয়েস্ট', 'मैसेज रिक्वेस्ट', 'Tin nhắn chờ')}</span><span className="sim-row-sub">1 {t('new', 'নতুন', 'नया', 'mới')}</span></span>
            </Tap>
          </div>
        </Screen>
      )}

      {nav.screen === 'chat' && person && (
        <Chat key={person.id} t={t} nav={nav} person={person} msgs={threads[person.id]} blocked={blocked[person.id]}
          onSend={(m) => add(person.id, m)} onCall={(video) => setCall({ person, video })} />
      )}

      {nav.screen === 'info' && person && (
        <Screen nav={nav}>
          <StatusBar bg="#fff" />
          <AppBar bg="#fff" fg="#050505" onBack={nav.back} title="" />
          <div className="sim-scroll sim-pad sim-stack" style={{ alignItems: 'center' }}>
            <span className="sim-avatar lg" style={{ background: person.color }}>{person.name.slice(0, 1)}</span>
            <p className="wa-info-name">{person.name}</p>
            {person.fake && <p className="sim-danger-note"><ShieldAlert size={16} />{t('This account was created 3 days ago. Your real son has a different account.', 'এই অ্যাকাউন্ট ৩ দিন আগে খোলা হয়েছে। আপনার আসল ছেলের অন্য অ্যাকাউন্ট আছে।', 'यह खाता 3 दिन पहले बना। आपके असली बेटे का दूसरा खाता है।', 'Tài khoản này tạo 3 ngày trước. Con trai thật của bạn có tài khoản khác.')}</p>}
            <Tap className="sim-row wa-danger" act="block_contact" onClick={() => { setBlocked((b) => ({ ...b, [person.id]: true })); showToast(t('Blocked. They can\'t message or call you now.', 'ব্লক হয়েছে। এখন আর মেসেজ বা কল করতে পারবে না।', 'ब्लॉक हो गया। अब मैसेज या कॉल नहीं कर पाएंगे।', 'Đã chặn. Họ không nhắn hay gọi được nữa.')); }}
              explain={T('Block: they can no longer message or call you.', 'ব্লক: আর মেসেজ বা কল করতে পারবে না।', 'ब्लॉक: अब मैसेज या कॉल नहीं कर पाएंगे।', 'Chặn: họ không nhắn hay gọi cho bạn được nữa.')}><Ban size={20} />{t('Block', 'ব্লক', 'ब्लॉक', 'Chặn')}</Tap>
            <Tap className="sim-row wa-danger" act="report_contact" onClick={() => showToast(t('Reported to Messenger. Thank you for keeping others safe.', 'মেসেঞ্জারে রিপোর্ট হয়েছে। অন্যদের নিরাপদ রাখার জন্য ধন্যবাদ।', 'मैसेंजर को रिपोर्ट हो गया। दूसरों को सुरक्षित रखने के लिए धन्यवाद।', 'Đã báo cáo Messenger. Cảm ơn bạn đã giúp mọi người an toàn.'))}><Flag size={20} />{t('Report', 'রিপোর্ট', 'रिपोर्ट', 'Báo cáo')}</Tap>
          </div>
        </Screen>
      )}

      {nav.screen === 'requests' && (
        <Screen nav={nav}>
          <StatusBar bg="#fff" />
          <AppBar bg="#fff" fg="#050505" onBack={nav.back} title={t('Message requests', 'মেসেজ রিকোয়েস্ট', 'मैसेज रिक्वेस्ट', 'Tin nhắn chờ')} />
          <div className="sim-scroll sim-pad sim-stack">
            <p style={{ margin: 0, color: '#65676b' }}>{t('They don\'t know you\'ve seen their message until you reply.', 'আপনি উত্তর না দেওয়া পর্যন্ত তারা জানবে না আপনি মেসেজ দেখেছেন।', 'जब तक आप जवाब न दें, उन्हें पता नहीं चलता कि आपने मैसेज देखा।', 'Họ không biết bạn đã xem cho đến khi bạn trả lời.')}</p>
            <div className="sim-row" style={{ padding: 0, alignItems: 'flex-start' }}>
              <span className="sim-avatar" style={{ background: '#9e9e9e' }}>L</span>
              <span className="sim-row-main"><span className="sim-row-title">Lucky Draw Center</span><span className="sim-row-sub" style={{ whiteSpace: 'normal' }}>{t('You won ৳50,000! Send your bKash PIN to claim.', 'আপনি ৳৫০,০০০ জিতেছেন! পেতে বিকাশ পিন পাঠান।', 'आपने ₹50,000 जीते! पाने के लिए अपना पिन भेजें।', 'Bạn trúng 50 triệu! Gửi mã PIN để nhận.')}</span></span>
            </div>
            <p className="sim-danger-note"><ShieldAlert size={16} />{t('No real prize ever asks for your PIN. Delete it.', 'কোনো আসল পুরস্কার কখনো পিন চায় না। মুছে দিন।', 'कोई असली इनाम कभी पिन नहीं मांगता। डिलीट करें।', 'Giải thưởng thật không bao giờ hỏi PIN. Hãy xóa.')}</p>
            <Tap className="sim-primary" style={{ background: '#e41e3f' }} act="delete_request" onClick={() => { nav.back(); showToast(t('Deleted.', 'মুছে দেওয়া হয়েছে।', 'डिलीट कर दिया।', 'Đã xóa.')); }}>{t('Delete', 'মুছুন', 'डिलीट करें', 'Xóa')}</Tap>
          </div>
        </Screen>
      )}

      {call && <CallOverlay t={t} call={call} onEnd={() => setCall(null)} />}
    </div>
  );
}

function Chat({ t, nav, person, msgs, blocked, onSend, onCall }) {
  const { emit } = useSim();
  const [text, setText] = useState('');
  const [more, setMore] = useState(false);
  const typed = useRef(false);
  const scroller = useRef(null);
  useEffect(() => { scroller.current?.scrollTo({ top: 1e6, behavior: 'smooth' }); }, [msgs.length]);
  const send = () => { if (!text.trim()) return; onSend({ text: text.trim() }); setText(''); typed.current = false; };
  return (
    <Screen nav={nav} style={{ background: '#fff' }}>
      <StatusBar bg="#fff" />
      <AppBar bg="#fff" fg={BLUE} onBack={nav.back}
        leading={<Tap className="wa-chat-head" style={{ color: '#050505' }} act="open_contact_info" onClick={() => nav.push('info', { id: person.id })} explain={T('Their name: tap for options like Block and Report.', 'নাম: ব্লক ও রিপোর্টের মতো অপশনের জন্য চাপুন।', 'नाम: ब्लॉक और रिपोर्ट जैसे विकल्पों के लिए टैप करें।', 'Tên: chạm để có các tùy chọn như Chặn và Báo cáo.')}>
          <span className="sim-avatar sm" style={{ background: person.color }}>{person.name.slice(0, 1)}</span>
          <span className="sim-appbar-title"><span style={{ fontSize: 16 }}>{person.name}</span><small style={{ color: '#65676b' }}>{person.active ? t('Active now', 'এখন সক্রিয়', 'अभी सक्रिय', 'Đang hoạt động') : t('Messenger', 'মেসেঞ্জার', 'मैसेंजर', 'Messenger')}</small></span>
        </Tap>}
        actions={<>
          <Tap className="sim-icon-btn" act="start_voice_call" onClick={() => onCall(false)} label={t('Call', 'কল', 'कॉल', 'Gọi')}><Phone size={21} /></Tap>
          <Tap className="sim-icon-btn" act="start_video_call" onClick={() => onCall(true)} label={t('Video call', 'ভিডিও কল', 'वीडियो कॉल', 'Gọi video')} explain={T('Video call: talk face to face.', 'ভিডিও কল: মুখোমুখি কথা বলুন।', 'वीडियो कॉल: आमने-सामने बात करें।', 'Gọi video: nói chuyện mặt đối mặt.')}><Video size={23} /></Tap>
        </>} />
      <div ref={scroller} className="sim-scroll ms-thread">
        {person.fake && <p className="ms-warn"><ShieldAlert size={16} />{t('Messages asking for money urgently — even from family — can be scams. Call them on a number you know.', 'জরুরি টাকা চাওয়া মেসেজ — পরিবার থেকেও — প্রতারণা হতে পারে। চেনা নম্বরে ফোন করুন।', 'जल्दी पैसे मांगने वाले मैसेज — परिवार से भी — धोखा हो सकते हैं। पहचाने नंबर पर फोन करें।', 'Tin nhắn đòi tiền gấp — kể cả từ người thân — có thể là lừa đảo. Hãy gọi số bạn biết.')}</p>}
        {msgs.map((m) => (
          <div key={m.id} className={`ms-msg ${m.me ? 'me' : 'them'}`}>
            {m.photo ? <Photo kind="garden" className="wa-photo" style={{ width: 180, height: 140 }} size={40} /> : m.like ? <Reaction kind="like" size={40} /> : m.text}
          </div>
        ))}
      </div>
      {blocked ? <div className="wa-blocked">{t('You blocked this account.', 'আপনি এই অ্যাকাউন্ট ব্লক করেছেন।', 'आपने यह खाता ब्लॉक किया है।', 'Bạn đã chặn tài khoản này.')}</div> : (
        <div className="ms-bar">
          <Tap className="sim-icon-btn" style={{ color: BLUE }} act="open_more" onClick={() => setMore(true)} label={t('More', 'আরও', 'और', 'Thêm')}><CirclePlus size={24} /></Tap>
          <Tap className="sim-icon-btn" style={{ color: BLUE }} act="open_camera" onClick={() => { onSend({ photo: true }); emit('send_photo'); }} label={t('Camera', 'ক্যামেরা', 'कैमरा', 'Máy ảnh')}><Camera size={23} /></Tap>
          <Tap className="sim-icon-btn" style={{ color: BLUE }} act="open_gallery send_photo" onClick={() => onSend({ photo: true })} label={t('Gallery', 'গ্যালারি', 'गैलरी', 'Thư viện')} explain={T('Gallery: send a photo from your phone.', 'গ্যালারি: ফোন থেকে ছবি পাঠান।', 'गैलरी: फोन से फोटो भेजें।', 'Thư viện: gửi ảnh trong máy.')}><ImageIcon size={23} /></Tap>
          {!text && <Tap className="sim-icon-btn" style={{ color: BLUE }} act="record_voice" onClick={() => emit('record_voice')} label={t('Voice clip', 'ভয়েস ক্লিপ', 'वॉइस क्लिप', 'Ghi âm')}><Mic size={23} /></Tap>}
          <input className="ms-input" data-act="type_message" value={text} placeholder="Aa" aria-label={t('Message', 'মেসেজ', 'मैसेज', 'Tin nhắn')}
            onChange={(e) => { setText(e.target.value); if (!typed.current && e.target.value.trim()) { typed.current = true; emit('type_message'); } }}
            onKeyDown={(e) => { if (e.key === 'Enter') { send(); emit('send_message'); } }} />
          {text ? (
            <Tap className="sim-icon-btn" style={{ color: BLUE }} act="send_message" onClick={send} label={t('Send', 'পাঠান', 'भेजें', 'Gửi')} explain={T('Send: sends your message.', 'পাঠান: মেসেজ পাঠিয়ে দেয়।', 'भेजें: मैसेज भेज देता है।', 'Gửi: gửi tin nhắn.')}><Send size={23} /></Tap>
          ) : (
            <Tap className="sim-icon-btn" style={{ color: BLUE }} act="send_like send_message" onClick={() => onSend({ like: true })} label={t('Like', 'লাইক', 'लाइक', 'Thích')} explain={T('Thumbs up: sends a quick "like".', 'বুড়ো আঙুল: দ্রুত একটা "লাইক" পাঠায়।', 'अंगूठा: झटपट एक "लाइक" भेजता है।', 'Ngón cái: gửi nhanh một lượt thích.')}><ThumbsUp size={23} /></Tap>
          )}
        </div>
      )}
      <Sheet open={more} onClose={() => setMore(false)}>
        <div className="wa-attach-grid">
          {[[ImageIcon, '#0084FF', T('Photo', 'ছবি', 'फोटो', 'Ảnh')], [Camera, '#e91e63', T('Camera', 'ক্যামেরা', 'कैमरा', 'Máy ảnh')], [Mic, '#ff9800', T('Voice', 'ভয়েস', 'वॉइस', 'Giọng nói')]].map(([Icon, color, label], i) => (
            <Tap key={i} className="wa-attach" act={i === 0 ? 'send_photo' : undefined} onClick={() => { setMore(false); if (i < 2) onSend({ photo: true }); }}>
              <span className="wa-attach-icon" style={{ background: color }}><Icon size={24} /></span><span>{t(...label)}</span>
            </Tap>
          ))}
        </div>
      </Sheet>
    </Screen>
  );
}

function CallOverlay({ t, call, onEnd }) {
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  useEffect(() => { const id = setTimeout(() => setConnected(true), 1600); return () => clearTimeout(id); }, []);
  return (
    <div className="sim-call" style={{ background: call.video && connected && !camOff ? `linear-gradient(160deg, ${call.person.color}, #10202f)` : 'radial-gradient(circle at 50% 30%, #3a4a6b, #0e1626)' }}>
      <div className="wa-call-top">
        <span className="sim-avatar lg" style={{ background: call.person.color }}>{call.person.name.slice(0, 1)}</span>
        <p className="wa-call-name">{call.person.name}</p>
        <p className="wa-call-state">{connected ? t('Connected', 'সংযুক্ত', 'जुड़ गए', 'Đã kết nối') : t('Calling…', 'কল হচ্ছে…', 'कॉल हो रही है…', 'Đang gọi…')}</p>
      </div>
      <div className="sim-call-controls">
        {call.video && <Tap className={`sim-call-btn ${camOff ? 'is-off' : ''}`} onClick={() => setCamOff((v) => !v)} label={t('Camera', 'ক্যামেরা', 'कैमरा', 'Camera')}>{camOff ? <VideoOff size={24} /> : <Video size={24} />}</Tap>}
        <Tap className="sim-call-btn" onClick={() => {}} label={t('Speaker', 'স্পিকার', 'स्पीकर', 'Loa')}><Volume2 size={24} /></Tap>
        <Tap className={`sim-call-btn ${muted ? 'is-off' : ''}`} onClick={() => setMuted((v) => !v)} label={t('Mute', 'মিউট', 'म्यूट', 'Tắt tiếng')}>{muted ? <MicOff size={24} /> : <Mic size={24} />}</Tap>
        <Tap className="sim-call-btn end" act="end_call" onClick={onEnd} label={t('End call', 'কল শেষ', 'कॉल खत्म', 'Kết thúc')}><PhoneOff size={24} /></Tap>
      </div>
    </div>
  );
}
