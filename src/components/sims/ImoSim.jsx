import { useEffect, useRef, useState } from 'react';
import {
  ChevronRight, Contact, Lock, Play, MessageCircle, Mic, MicOff, Phone, PhoneOff, Plus, Search, SendHorizontal, Settings, ShieldAlert, ShieldCheck, Smile, Users, Video, VideoOff,
} from 'lucide-react';
import { AppBar, Photo, PinPad, Screen, StatusBar, T, Tap, useSim, useStack } from './kit/SimKit';

// imo: chats, video and voice calls that work on slow internet, voice
// messages, contacts, and the privacy lock in Settings.

const IMO = '#1D8CF0';

function chats(t) {
  return [
    { id: 'rupa', name: t('Rupa (Daughter)', 'রূপা (মেয়ে)', 'रूपा (बेटी)', 'Lan (con gái)'), color: '#e57373', text: t('Call me when you are free, Ma', 'সময় পেলে ফোন দিও মা', 'फ्री हो तो फोन करना माँ', 'Mẹ rảnh thì gọi con nhé'), time: '10:05' },
    { id: 'abroad', name: t('Rahim (in Dubai)', 'রহিম (দুবাইয়ে)', 'राहुल (दुबई में)', 'Minh (ở Dubai)'), color: '#64b5f6', text: t('Voice message', 'ভয়েস মেসেজ', 'वॉइस मैसेज', 'Tin nhắn thoại'), time: t('Yesterday', 'গতকাল', 'कल', 'Hôm qua'), voice: true },
    { id: 'family', name: t('Family', 'পরিবার', 'परिवार', 'Gia đình'), color: '#81c784', text: t('Eid photos', 'ঈদের ছবি', 'ईद की तस्वीरें', 'Ảnh ngày lễ'), time: t('Mon', 'সোম', 'सोम', 'T2'), group: true },
  ];
}

export default function ImoSim() {
  const { t, showToast, emit } = useSim();
  const nav = useStack('home');
  const [tab, setTab] = useState('chats');
  const [call, setCall] = useState(null);
  const [lock, setLock] = useState(false);
  const [setting, setSetting] = useState(false);
  const list = chats(t);
  const person = list.find((c) => c.id === nav.params.id);

  return (
    <div className="im" style={{ '--accent': IMO }}>
      {nav.screen === 'home' && (
        <Screen nav={nav}>
          <StatusBar dark bg={IMO} />
          <div className="im-top">
            <span className="im-logo">imo</span>
            <Tap className="sim-icon-btn" style={{ color: '#fff' }} onClick={() => showToast(t('Search chats and contacts.', 'চ্যাট ও কন্টাক্ট খুঁজুন।', 'चैट और कॉन्टैक्ट खोजें।', 'Tìm đoạn chat và liên hệ.'))} label={t('Search', 'সার্চ', 'सर्च', 'Tìm')}><Search size={22} /></Tap>
            <Tap className="sim-icon-btn" style={{ color: '#fff' }} act="open_settings" onClick={() => nav.push('settings')} label={t('Settings', 'সেটিংস', 'सेटिंग्स', 'Cài đặt')}
              explain={T('Settings: privacy lock, account and more.', 'সেটিংস: প্রাইভেসি লক, অ্যাকাউন্ট ও আরও।', 'सेटिंग्स: प्राइवेसी लॉक, खाता और भी।', 'Cài đặt: khóa riêng tư, tài khoản và hơn nữa.')}><Settings size={22} /></Tap>
          </div>
          <div className="im-tabs" role="tablist">
            {[['chats', MessageCircle, T('Chats', 'চ্যাট', 'चैट', 'Trò chuyện')], ['contacts', Contact, T('Contacts', 'কন্টাক্ট', 'कॉन्टैक्ट', 'Danh bạ')]].map(([id, Icon, label]) => (
              <Tap key={id} className="im-tab" role="tab" aria-selected={tab === id} act={`tab_${id}`} onClick={() => setTab(id)}><Icon size={18} />{t(...label)}</Tap>
            ))}
          </div>
          <div className="sim-scroll">
            {tab === 'chats' && list.map((c) => (
              <Tap key={c.id} className="sim-row" act={`open_chat open_chat_${c.id}`} onClick={() => nav.push('chat', { id: c.id })} explain={T('A chat. Tap to open it.', 'একটি চ্যাট। খুলতে চাপুন।', 'एक चैट। खोलने के लिए टैप करें।', 'Một đoạn chat. Chạm để mở.')}>
                <span className="sim-avatar" style={{ background: c.color }}>{c.group ? <Users size={20} /> : c.name.slice(0, 1)}</span>
                <span className="sim-row-main"><span className="sim-row-title">{c.name}</span><span className="sim-row-sub">{c.text}</span></span>
                <span className="sim-row-meta">{c.time}</span>
              </Tap>
            ))}
            {tab === 'contacts' && list.filter((c) => !c.group).map((c) => (
              <div key={c.id} className="sim-row">
                <span className="sim-avatar sm" style={{ background: c.color }}>{c.name.slice(0, 1)}</span>
                <span className="sim-row-main"><span className="sim-row-title">{c.name}</span></span>
                <Tap className="sim-icon-btn" style={{ color: IMO }} act="start_voice_call" onClick={() => setCall({ person: c, video: false })} label={t('Call', 'কল', 'कॉल', 'Gọi')}><Phone size={20} /></Tap>
                <Tap className="sim-icon-btn" style={{ color: IMO }} act="start_video_call" onClick={() => setCall({ person: c, video: true })} label={t('Video call', 'ভিডিও কল', 'वीडियो कॉल', 'Gọi video')}><Video size={22} /></Tap>
              </div>
            ))}
            <p className="sim-safety" style={{ margin: 16 }}><ShieldAlert size={16} />{t('imo will never ask you for the code it sends by SMS. Never share it.', 'imo এসএমএসে পাঠানো কোড কখনো চায় না। কাউকে দেবেন না।', 'imo एसएमएस से भेजा कोड कभी नहीं मांगता। किसी को न दें।', 'imo không bao giờ hỏi mã gửi qua SMS. Đừng đưa cho ai.')}</p>
          </div>
        </Screen>
      )}

      {nav.screen === 'chat' && person && <Chat t={t} nav={nav} person={person} onCall={(video) => setCall({ person, video })} />}

      {nav.screen === 'settings' && (
        <Screen nav={nav} style={{ background: '#f4f8fc' }}>
          <StatusBar dark bg={IMO} />
          <AppBar bg={IMO} onBack={setting ? () => setSetting(false) : nav.back} title={setting ? t('Set a privacy code', 'প্রাইভেসি কোড ঠিক করুন', 'प्राइवेसी कोड सेट करें', 'Đặt mã riêng tư') : t('Settings', 'সেটিংস', 'सेटिंग्स', 'Cài đặt')} />
          {setting ? (
            <PinPad length={4} color={IMO} act="set_lock_code" title={t('Choose a 4-digit code you will remember', 'মনে রাখতে পারবেন এমন ৪ সংখ্যার কোড বেছে নিন', 'याद रहने वाला 4 अंकों का कोड चुनें', 'Chọn mã 4 số bạn nhớ được')}
              onDone={() => { setLock(true); setSetting(false); emit('lock_on'); showToast(t('Privacy lock is on. imo now asks for your code when it opens.', 'প্রাইভেসি লক চালু। এখন imo খুলতে কোড চাইবে।', 'प्राइवेसी लॉक चालू। अब imo खुलने पर कोड मांगेगा।', 'Đã bật khóa. imo sẽ hỏi mã khi mở.')); }} />
          ) : (
            <div className="sim-scroll">
              <Tap className="sim-row" act="toggle_privacy_lock" onClick={() => (lock ? setLock(false) : setSetting(true))}
                explain={T('Privacy lock: asks for your code before imo opens, so others can\'t read your chats.', 'প্রাইভেসি লক: imo খোলার আগে কোড চায়, তাই অন্যরা চ্যাট পড়তে পারে না।', 'प्राइवेसी लॉक: imo खुलने से पहले कोड मांगता है, ताकि दूसरे चैट न पढ़ सकें।', 'Khóa riêng tư: hỏi mã trước khi mở imo, người khác không đọc được tin nhắn.')}>
                <Lock size={22} color={IMO} />
                <span className="sim-row-main"><span className="sim-row-title">{t('Privacy lock', 'প্রাইভেসি লক', 'प्राइवेसी लॉक', 'Khóa riêng tư')}</span><span className="sim-row-sub">{lock ? t('On', 'চালু', 'चालू', 'Bật') : t('Off', 'বন্ধ', 'बंद', 'Tắt')}</span></span>
                <span className={`rp-toggle ${lock ? 'is-on' : ''}`} style={{ '--on': IMO }}><i /></span>
              </Tap>
              <div className="sim-row"><ShieldCheck size={22} color="#2e7d32" /><span className="sim-row-main"><span className="sim-row-title">{t('Account security', 'অ্যাকাউন্ট নিরাপত্তা', 'खाता सुरक्षा', 'Bảo mật tài khoản')}</span><span className="sim-row-sub" style={{ whiteSpace: 'normal' }}>{t('Only log in with the code imo sends to YOUR phone — never read it to anyone.', 'imo শুধু আপনার ফোনে যে কোড পাঠায় তা দিয়েই লগইন করুন — কাউকে বলবেন না।', 'imo सिर्फ़ आपके फोन पर जो कोड भेजे उसी से लॉगिन करें — किसी को न बताएं।', 'Chỉ đăng nhập bằng mã imo gửi tới máy BẠN — đừng đọc cho ai.')}</span></span></div>
              <Tap className="sim-row" onClick={() => showToast(t('Blocked contacts appear here.', 'ব্লক করা কন্টাক্ট এখানে দেখাবে।', 'ब्लॉक किए कॉन्टैक्ट यहां दिखेंगे।', 'Liên hệ bị chặn hiện ở đây.'))}><Users size={22} color="#78909c" /><span className="sim-row-main"><span className="sim-row-title">{t('Blocked contacts', 'ব্লক করা কন্টাক্ট', 'ब्लॉक किए कॉन्टैक्ट', 'Liên hệ bị chặn')}</span></span><ChevronRight size={18} color="#9aa5ab" /></Tap>
            </div>
          )}
        </Screen>
      )}

      {call && <ImoCall t={t} call={call} onEnd={() => setCall(null)} />}
    </div>
  );
}

function Chat({ t, nav, person, onCall }) {
  const { emit, showToast } = useSim();
  const [msgs, setMsgs] = useState([{ id: 1, me: false, text: person.text }]);
  const [text, setText] = useState('');
  const [rec, setRec] = useState(false);
  const start = useRef(0);
  const scroller = useRef(null);
  useEffect(() => { scroller.current?.scrollTo({ top: 1e6, behavior: 'smooth' }); }, [msgs.length]);
  const send = () => { if (!text.trim()) return; setMsgs((m) => [...m, { id: Date.now(), me: true, text }]); setText(''); };
  const beginRec = () => {
    start.current = Date.now();
    setRec(true);
    emit('record_voice');
    window.addEventListener('pointerup', () => {
      const ms = Date.now() - start.current;
      setRec(false);
      if (ms < 900) { showToast(t('Hold the microphone while you speak', 'কথা বলার সময় মাইক্রোফোন চেপে ধরে রাখুন', 'बोलते समय माइक दबाए रखें', 'Giữ nút micro trong lúc nói')); return; }
      setMsgs((m) => [...m, { id: Date.now(), me: true, voice: Math.round(ms / 1000) }]);
      emit('voice_sent');
    }, { once: true });
  };
  return (
    <Screen nav={nav} style={{ background: '#eef4fb' }}>
      <StatusBar dark bg={IMO} />
      <AppBar bg={IMO} onBack={nav.back} title={person.name} subtitle={t('online', 'অনলাইন', 'ऑनलाइन', 'trực tuyến')}
        actions={<>
          <Tap className="sim-icon-btn" style={{ color: '#fff' }} act="start_voice_call" onClick={() => onCall(false)} label={t('Call', 'কল', 'कॉल', 'Gọi')} explain={T('Voice call over the internet — free.', 'ইন্টারনেটে ভয়েস কল — ফ্রি।', 'इंटरनेट पर वॉइस कॉल — मुफ़्त।', 'Gọi thoại qua internet — miễn phí.')}><Phone size={21} /></Tap>
          <Tap className="sim-icon-btn" style={{ color: '#fff' }} act="start_video_call" onClick={() => onCall(true)} label={t('Video call', 'ভিডিও কল', 'वीडियो कॉल', 'Gọi video')} explain={T('Video call: works even on slow internet.', 'ভিডিও কল: ধীর ইন্টারনেটেও চলে।', 'वीडियो कॉल: धीमे इंटरनेट पर भी चलता है।', 'Gọi video: mạng chậm vẫn gọi được.')}><Video size={23} /></Tap>
        </>} />
      <div ref={scroller} className="sim-scroll ms-thread">
        {msgs.map((m) => (
          <div key={m.id} className={`im-msg ${m.me ? 'me' : 'them'}`}>{m.voice ? <span className="wa-voice" style={{ minWidth: 150, color: 'inherit' }}><span className="wa-play" style={{ background: m.me ? '#fff' : IMO, color: m.me ? IMO : '#fff' }}><Play size={14} fill="currentColor" /></span><span className="wa-wave" /><span>0:{String(m.voice).padStart(2, '0')}</span></span> : m.photo ? <Photo kind={m.photo} className="wa-photo" style={{ width: 180, height: 140 }} size={40} /> : m.text}</div>
        ))}
      </div>
      <div className="im-bar">
        <Tap className="sim-icon-btn" style={{ color: '#7a8794' }} act="open_attach" onClick={() => { setMsgs((m) => [...m, { id: Date.now(), me: true, photo: 'garden' }]); emit('send_photo'); }} label={t('Photos and files', 'ছবি ও ফাইল', 'फोटो और फ़ाइल', 'Ảnh và tệp')} explain={T('Plus: send photos, files and stickers.', 'প্লাস: ছবি, ফাইল আর স্টিকার পাঠান।', 'प्लस: फोटो, फ़ाइल और स्टिकर भेजें।', 'Dấu cộng: gửi ảnh, tệp và nhãn dán.')}><Plus size={24} /></Tap>
        {rec ? <span className="wa-rec"><span className="wa-rec-dot" /> {t('Recording… release to send', 'রেকর্ড হচ্ছে… ছাড়লে চলে যাবে', 'रिकॉर्ड हो रहा है… छोड़ते ही जाएगा', 'Đang ghi… thả tay để gửi')}</span>
          : <input className="ms-input" data-act="type_message" value={text} onChange={(e) => { if (!text && e.target.value) emit('type_message'); setText(e.target.value); }} onKeyDown={(e) => { if (e.key === 'Enter') { send(); emit('send_message'); } }} placeholder={t('Type a message', 'মেসেজ লিখুন', 'मैसेज लिखें', 'Nhập tin nhắn')} />}
        <Tap className="sim-icon-btn" style={{ color: '#7a8794' }} onClick={() => showToast(t('Your emoji keyboard opens here on a real phone.', 'আসল ফোনে এখানে ইমোজির কিবোর্ড খোলে।', 'असली फ़ोन में यहां इमोजी कीबोर्ड खुलता है।', 'Trên điện thoại thật, bàn phím biểu tượng mở ở đây.'))} label={t('Emoji', 'ইমোজি', 'इमोजी', 'Biểu tượng cảm xúc')}><Smile size={22} /></Tap>
        {text ? (
          <Tap className="im-round" act="send_message" onClick={send} label={t('Send', 'পাঠান', 'भेजें', 'Gửi')}><SendHorizontal size={20} /></Tap>
        ) : (
          <button type="button" className={`im-round ${rec ? 'is-rec' : ''}`} data-act="record_voice voice_sent" data-hold="" onPointerDown={beginRec} onContextMenu={(e) => e.preventDefault()} aria-label={t('Hold to record', 'রেকর্ড করতে চেপে ধরুন', 'रिकॉर्ड के लिए दबाए रखें', 'Giữ để ghi âm')}><Mic size={22} /></button>
        )}
      </div>
    </Screen>
  );
}

function ImoCall({ t, call, onEnd }) {
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  useEffect(() => { const id = setTimeout(() => setConnected(true), 1500); return () => clearTimeout(id); }, []);
  return (
    <div className="sim-call" style={{ background: 'linear-gradient(180deg,#1D8CF0,#0b3c6b)' }}>
      <div className="wa-call-top">
        <span className="sim-avatar lg" style={{ background: call.person.color }}>{call.person.name.slice(0, 1)}</span>
        <p className="wa-call-name">{call.person.name}</p>
        <p className="wa-call-state">{connected ? t('Connected · HD', 'সংযুক্ত · এইচডি', 'जुड़ गए · HD', 'Đã kết nối · HD') : t('Calling…', 'কল হচ্ছে…', 'कॉल हो रही है…', 'Đang gọi…')}</p>
      </div>
      <div className="sim-call-controls">
        {call.video && <Tap className={`sim-call-btn ${camOff ? 'is-off' : ''}`} onClick={() => setCamOff((v) => !v)} label={t('Camera', 'ক্যামেরা', 'कैमरा', 'Camera')}>{camOff ? <VideoOff size={24} /> : <Video size={24} />}</Tap>}
        <Tap className={`sim-call-btn ${muted ? 'is-off' : ''}`} onClick={() => setMuted((v) => !v)} label={t('Mute', 'মিউট', 'म्यूट', 'Tắt tiếng')}>{muted ? <MicOff size={24} /> : <Mic size={24} />}</Tap>
        <Tap className="sim-call-btn end" act="end_call" onClick={onEnd} label={t('End call', 'কল শেষ', 'कॉल खत्म', 'Kết thúc')} explain={T('End call: hangs up.', 'কল শেষ: ফোন রেখে দেয়।', 'कॉल खत्म: फोन काट देता है।', 'Kết thúc: cúp máy.')}><PhoneOff size={24} /></Tap>
      </div>
    </div>
  );
}
