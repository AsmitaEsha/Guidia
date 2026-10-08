import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Ban, Camera, Check, CheckCheck, ChevronRight, CircleDashed, Contact, File, Flag, Forward, Headphones, Image as ImageIcon,
  Key, Lock, MapPin, MessageSquarePlus, Mic, MicOff, MoreVertical, Paperclip, Phone, PhoneIncoming, PhoneMissed,
  PhoneOff, Play, Reply, Search, Send, ShieldAlert, SmilePlus, SwitchCamera, Trash2, Users, Video, VideoOff, Volume2, X,
} from 'lucide-react';
import { AppBar, Photo, Screen, Sheet, StatusBar, T, Tap, useSim, useStack } from './kit/SimKit';

// WhatsApp, as it looks on Android: chats, a chat with real input bar,
// attachments, photos, voice notes, calls, contact info (block/report),
// updates, calls history and privacy settings. Everything is pretend.

const GREEN = '#008069';
const BRIGHT = '#25D366';
const CHAT_BG = '#efeae2';

const PHOTOS = [
  { id: 'p1', kind: 'cake', label: T('Birthday cake', 'জন্মদিনের কেক', 'जन्मदिन का केक', 'Bánh sinh nhật') },
  { id: 'p2', kind: 'sunrise', label: T('Sunrise', 'সূর্যোদয়', 'सूर्योदय', 'Bình minh') },
  { id: 'p3', kind: 'garden', label: T('Garden', 'বাগান', 'बगीचा', 'Khu vườn') },
  { id: 'p4', kind: 'family', label: T('Family', 'পরিবার', 'परिवार', 'Gia đình') },
  { id: 'p5', kind: 'food', label: T('Lunch', 'দুপুরের খাবার', 'दोपहर का खाना', 'Bữa trưa') },
  { id: 'p6', kind: 'market', label: T('Market', 'বাজার', 'बाज़ार', 'Chợ') },
];

function contactsFor(t) {
  return [
    { id: 'rupa', name: t('Rupa (Daughter)', 'রূপা (মেয়ে)', 'रूपा (बेटी)', 'Lan (con gái)'), color: '#e57373', online: true,
      msgs: [
        { id: 1, me: false, text: t('Good morning Ma! Did you take your medicine?', 'সুপ্রভাত মা! ওষুধ খেয়েছ?', 'सुप्रभात माँ! दवा ले ली?', 'Chào buổi sáng mẹ! Mẹ uống thuốc chưa?'), time: '08:12' },
        { id: 2, me: false, text: t('Send me a photo of the garden when you can', 'সময় পেলে বাগানের একটা ছবি পাঠিও', 'समय मिले तो बगीचे की एक फोटो भेजना', 'Rảnh thì gửi con tấm ảnh khu vườn nhé'), time: '08:13' },
      ] },
    { id: 'rahim', name: t('Rahim (Son)', 'রহিম (ছেলে)', 'राहुल (बेटा)', 'Minh (con trai)'), color: '#64b5f6',
      msgs: [{ id: 1, me: false, text: t('I will call you this evening.', 'আজ সন্ধ্যায় ফোন করব।', 'आज शाम को फोन करूंगा।', 'Tối nay con gọi mẹ nhé.'), time: t('Yesterday', 'গতকাল', 'कल', 'Hôm qua') }] },
    { id: 'family', name: t('Family group', 'পরিবারের গ্রুপ', 'परिवार ग्रुप', 'Nhóm gia đình'), color: '#81c784', group: true,
      msgs: [{ id: 1, me: false, author: 'Rahim', text: t('Lunch at Ma\'s on Friday?', 'শুক্রবার মায়ের বাসায় দুপুরে খাওয়া?', 'शुक्रवार को माँ के घर लंच?', 'Thứ Sáu ăn trưa ở nhà mẹ nhé?'), time: t('Yesterday', 'গতকাল', 'कल', 'Hôm qua') }] },
    { id: 'unknown', name: '+880 1812-555 019', color: '#9e9e9e', unknown: true,
      msgs: [
        { id: 1, me: false, text: t('Hi Mum, this is my new number. I lost my phone', 'মা, এটা আমার নতুন নম্বর। আমার ফোন হারিয়ে গেছে', 'मम्मी, यह मेरा नया नंबर है। मेरा फोन खो गया', 'Mẹ ơi, đây là số mới của con. Con mất điện thoại rồi'), time: '09:40' },
        { id: 2, me: false, text: t('I need 5,000 urgently for a bill. Please send it now, I will explain later.', 'একটা বিলের জন্য এখনই ৫,০০০ টাকা লাগবে। এখনই পাঠাও, পরে বুঝিয়ে বলব।', 'एक बिल के लिए अभी 5,000 चाहिए। अभी भेज दो, बाद में बताऊंगा।', 'Con cần gấp 5 triệu trả hóa đơn. Mẹ chuyển ngay nhé, con giải thích sau.'), time: '09:41', scam: true },
      ] },
    { id: 'doctor', name: t('Dr. Karim (Clinic)', 'ডা. করিম (ক্লিনিক)', 'डॉ. करीम (क्लिनिक)', 'BS. Khải (Phòng khám)'), color: '#ba68c8',
      msgs: [{ id: 1, me: false, text: t('Your appointment is on Monday at 10 am.', 'আপনার অ্যাপয়েন্টমেন্ট সোমবার সকাল ১০টায়।', 'आपका अपॉइंटमेंट सोमवार सुबह 10 बजे है।', 'Lịch khám của bác vào 10 giờ sáng thứ Hai.'), time: t('Mon', 'সোম', 'सोम', 'T2') }] },
  ];
}

const initials = (name) => String(name).replace(/\(.*\)/, '').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function Avatar({ c, size = '' }) {
  return <span className={`sim-avatar ${size}`} style={{ background: c.color }}>{c.group ? <Users size={20} /> : c.unknown ? <Contact size={20} /> : initials(c.name)}</span>;
}

export default function WhatsAppSim() {
  const { t, showToast } = useSim();
  const nav = useStack('home');
  const base = useMemo(() => contactsFor(t), [t]);
  const [threads, setThreads] = useState(() => Object.fromEntries(base.map((c) => [c.id, c.msgs])));
  const [blocked, setBlocked] = useState({});
  const [tab, setTab] = useState('chats');
  const [call, setCall] = useState(null); // { contact, video }
  const contact = base.find((c) => c.id === nav.params.id);

  const send = (id, msg) => setThreads((th) => ({ ...th, [id]: [...th[id], { id: Date.now(), me: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), status: 'sent', ...msg }] }));
  // Ticks go grey → blue after a moment, like a real reply arriving.
  useEffect(() => {
    const pending = Object.entries(threads).some(([, list]) => list.some((m) => m.me && m.status === 'sent'));
    if (!pending) return undefined;
    const id = setTimeout(() => setThreads((th) => Object.fromEntries(Object.entries(th).map(([k, list]) => [k, list.map((m) => (m.me && m.status === 'sent' ? { ...m, status: 'read' } : m))]))), 1800);
    return () => clearTimeout(id);
  }, [threads]);

  return (
    <div className="wa" style={{ '--accent': GREEN }}>
      {nav.screen === 'home' && (
        <Screen nav={nav}>
          <StatusBar bg="#fff" />
          <AppBar bg="#fff" fg="#111b21"
            actions={<>
              <Tap className="sim-icon-btn" label={t('Camera', 'ক্যামেরা', 'कैमरा', 'Máy ảnh')} act="open_camera" onClick={() => nav.push('camera', { id: 'rupa' })} explain={T('Camera: take a photo to send to someone.', 'ক্যামেরা: কাউকে পাঠানোর জন্য ছবি তুলুন।', 'कैमरा: किसी को भेजने के लिए फोटो खींचें।', 'Máy ảnh: chụp ảnh để gửi cho ai đó.')}><Camera size={22} /></Tap>
              <Tap className="sim-icon-btn" label={t('Menu', 'মেনু', 'मेनू', 'Menu')} act="open_settings" onClick={() => nav.push('settings')} explain={T('Menu: opens Settings, where you find privacy and security options.', 'মেনু: সেটিংস খোলে, সেখানে প্রাইভেসি ও নিরাপত্তার অপশন আছে।', 'मेनू: सेटिंग्स खोलता है, जहां प्राइवेसी और सुरक्षा के विकल्प हैं।', 'Menu: mở Cài đặt, nơi có các tùy chọn riêng tư và bảo mật.')}><MoreVertical size={22} /></Tap>
            </>}>
            <div className="sim-appbar-title"><span className="wa-brand">WhatsApp</span></div>
          </AppBar>
          <div className="sim-scroll">
            {tab === 'chats' && (
              <>
                <div className="wa-search"><Search size={18} /><span>{t('Ask Meta AI or Search', 'সার্চ করুন', 'सर्च करें', 'Tìm kiếm')}</span></div>
                {base.map((c) => {
                  const list = threads[c.id];
                  const last = list[list.length - 1];
                  const unread = !c.unknown && c.id === 'rupa' && list.every((m) => !m.me) ? 2 : c.unknown && list.every((m) => !m.me) ? 2 : 0;
                  return (
                    <Tap key={c.id} className="sim-row" act={`open_chat open_chat_${c.id}`} onClick={() => nav.push('chat', { id: c.id })}
                      explain={T('A chat. Tap it to open the conversation.', 'একটি চ্যাট। কথোপকথন খুলতে চাপুন।', 'एक चैट। बातचीत खोलने के लिए टैप करें।', 'Một cuộc trò chuyện. Chạm để mở.')}>
                      <Avatar c={c} />
                      <span className="sim-row-main">
                        <span className="sim-row-title">{c.name}</span>
                        <span className="sim-row-sub">{last.me && <CheckCheck size={15} color={last.status === 'read' ? '#53bdeb' : '#8696a0'} style={{ verticalAlign: '-3px', marginRight: 3 }} />}{last.photo ? t('Photo', 'ছবি', 'फोटो', 'Ảnh') : last.voice ? `${t('Voice message', 'ভয়েস মেসেজ', 'वॉइस मैसेज', 'Tin nhắn thoại')}` : last.text}</span>
                      </span>
                      <span className="sim-row-meta">
                        <span style={{ color: unread ? BRIGHT : undefined }}>{last.time}</span>
                        {unread > 0 && <span className="sim-badge" style={{ background: BRIGHT }}>{unread}</span>}
                      </span>
                    </Tap>
                  );
                })}
                <p className="wa-e2e"><Lock size={12} /> {t('Your personal messages are end-to-end encrypted', 'আপনার ব্যক্তিগত মেসেজ এন্ড-টু-এন্ড এনক্রিপ্টেড', 'आपके निजी मैसेज एंड-टू-एंड एन्क्रिप्टेड हैं', 'Tin nhắn cá nhân được mã hóa đầu cuối')}</p>
              </>
            )}
            {tab === 'updates' && <Updates t={t} contacts={base} onOpen={(c) => nav.push('status', { id: c.id })} />}
            {tab === 'communities' && (
              <div className="sim-pad sim-stack" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 40 }}>
                <span className="sim-avatar lg" style={{ background: '#dfe5e7', color: GREEN }}><Users size={40} /></span>
                <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{t('Stay connected with a community', 'কমিউনিটির সাথে যুক্ত থাকুন', 'कम्युनिटी से जुड़े रहें', 'Kết nối với cộng đồng')}</p>
                <p style={{ color: '#667781', margin: 0 }}>{t('Communities bring members together in topic-based groups.', 'কমিউনিটি একই বিষয়ের গ্রুপে সদস্যদের একসাথে আনে।', 'कम्युनिटी एक विषय के ग्रुप में सदस्यों को साथ लाती है।', 'Cộng đồng gom các thành viên vào các nhóm theo chủ đề.')}</p>
                <Tap className="sim-primary" style={{ maxWidth: 260 }} onClick={() => showToast(t('Ask a family member before joining big groups.', 'বড় গ্রুপে যোগ দেওয়ার আগে পরিবারের কাউকে জিজ্ঞেস করুন।', 'बड़े ग्रुप में जुड़ने से पहले परिवार से पूछें।', 'Hỏi người thân trước khi vào nhóm lớn.'))}>{t('Start your community', 'কমিউনিটি শুরু করুন', 'कम्युनिटी शुरू करें', 'Tạo cộng đồng')}</Tap>
              </div>
            )}
            {tab === 'calls' && (
              <div>
                <p className="wa-section">{t('Recent', 'সাম্প্রতিক', 'हाल के', 'Gần đây')}</p>
                {[[base[0], 'in', true, '08:30'], [base[1], 'missed', false, t('Yesterday', 'গতকাল', 'कल', 'Hôm qua')], [base[4], 'out', false, t('Mon', 'সোম', 'सोम', 'T2')]].map(([c, kind, video, when]) => (
                  <div key={c.id} className="sim-row">
                    <Avatar c={c} />
                    <span className="sim-row-main">
                      <span className="sim-row-title" style={{ color: kind === 'missed' ? '#e53935' : undefined }}>{c.name}</span>
                      <span className="sim-row-sub">{kind === 'missed' ? <PhoneMissed size={14} color="#e53935" /> : <PhoneIncoming size={14} color={GREEN} />} {when}</span>
                    </span>
                    <Tap className="sim-icon-btn" act={video ? 'start_video_call' : 'start_voice_call'} onClick={() => setCall({ contact: c, video })} label={t('Call', 'কল', 'कॉल', 'Gọi')} style={{ color: GREEN }}
                      explain={T('Calls this person again.', 'এই মানুষটিকে আবার কল করে।', 'इस व्यक्ति को फिर से कॉल करता है।', 'Gọi lại cho người này.')}>
                      {video ? <Video size={22} /> : <Phone size={20} />}
                    </Tap>
                  </div>
                ))}
              </div>
            )}
          </div>
          {tab === 'chats' && (
            <Tap className="wa-fab" act="open_new_chat" onClick={() => nav.push('new_chat')} label={t('New chat', 'নতুন চ্যাট', 'नई चैट', 'Đoạn chat mới')}
              explain={T('New chat: pick someone from your contacts to start writing to them.', 'নতুন চ্যাট: কন্টাক্ট থেকে কাউকে বেছে লেখা শুরু করুন।', 'नई चैट: कॉन्टैक्ट से किसी को चुनकर लिखना शुरू करें।', 'Đoạn chat mới: chọn một người trong danh bạ để bắt đầu nhắn.')}>
              <MessageSquarePlus size={24} />
            </Tap>
          )}
          <nav className="sim-tabs wa-tabs" role="tablist">
            {[['chats', MessageSquarePlus, T('Chats', 'চ্যাট', 'चैट', 'Đoạn chat')], ['updates', CircleDashed, T('Updates', 'আপডেট', 'अपडेट', 'Cập nhật')], ['communities', Users, T('Communities', 'কমিউনিটি', 'कम्युनिटी', 'Cộng đồng')], ['calls', Phone, T('Calls', 'কল', 'कॉल', 'Cuộc gọi')]].map(([id, Icon, label]) => (
              <Tap key={id} className="sim-tab" role="tab" aria-selected={tab === id} act={`tab_${id}`} onClick={() => setTab(id)} explain={label}>
                <span className="wa-tab-pill" data-on={tab === id}><Icon size={20} /></span>
                {t(...label)}
              </Tap>
            ))}
          </nav>
        </Screen>
      )}

      {nav.screen === 'chat' && contact && (
        <Chat key={contact.id} contact={contact} t={t} nav={nav} msgs={threads[contact.id]} blocked={blocked[contact.id]}
          onSend={(m) => send(contact.id, m)} onCall={(video) => setCall({ contact, video })}
          onDelete={(mid) => setThreads((th) => ({ ...th, [contact.id]: th[contact.id].map((m) => (m.id === mid ? { ...m, deleted: true } : m)) }))} />
      )}

      {nav.screen === 'gallery' && contact && (
        <Gallery t={t} nav={nav} onPick={(p) => nav.push('preview', { id: contact.id, photo: p.id })} />
      )}
      {nav.screen === 'camera' && (
        <CameraScreen t={t} nav={nav} onShot={() => nav.replace('preview', { id: nav.params.id || 'rupa', photo: 'p3' })} />
      )}
      {nav.screen === 'preview' && (
        <Preview t={t} nav={nav} photo={PHOTOS.find((p) => p.id === nav.params.photo)} contact={base.find((c) => c.id === nav.params.id)}
          onSend={(caption) => { send(nav.params.id, { photo: nav.params.photo, text: caption }); nav.reset('home'); nav.push('chat', { id: nav.params.id }); }} />
      )}
      {nav.screen === 'info' && contact && (
        <ContactInfo t={t} nav={nav} contact={contact} blocked={blocked[contact.id]} onCall={(video) => setCall({ contact, video })}
          onBlock={(v) => setBlocked((b) => ({ ...b, [contact.id]: v }))} />
      )}
      {nav.screen === 'new_chat' && (
        <Screen nav={nav}>
          <StatusBar bg="#fff" />
          <AppBar bg="#fff" fg="#111b21" onBack={nav.back} title={t('Select contact', 'কন্টাক্ট বেছে নিন', 'कॉन्टैक्ट चुनें', 'Chọn liên hệ')} subtitle={`${base.length} ${t('contacts', 'কন্টাক্ট', 'कॉन्टैक्ट', 'liên hệ')}`} />
          <div className="sim-scroll">
            {base.filter((c) => !c.unknown && !c.group).map((c) => (
              <Tap key={c.id} className="sim-row" act={`pick_contact open_chat_${c.id}`} onClick={() => nav.replace('chat', { id: c.id })}>
                <Avatar c={c} /><span className="sim-row-main"><span className="sim-row-title">{c.name}</span><span className="sim-row-sub">{t('Hey there! I am using WhatsApp.', 'হাই! আমি হোয়াটসঅ্যাপ ব্যবহার করছি।', 'हाय! मैं व्हाट्सऐप इस्तेमाल कर रहा हूं।', 'Xin chào! Tôi đang dùng WhatsApp.')}</span></span>
              </Tap>
            ))}
          </div>
        </Screen>
      )}
      {nav.screen === 'status' && <StatusViewer t={t} nav={nav} contact={base.find((c) => c.id === nav.params.id)} />}
      {nav.screen === 'settings' && <Settings t={t} nav={nav} />}

      {call && <CallScreen t={t} call={call} onEnd={() => setCall(null)} />}
    </div>
  );
}

// ── A conversation ────────────────────────────────────────────────────────
function Chat({ contact, t, nav, msgs, blocked, onSend, onCall, onDelete }) {
  const { emit, showToast } = useSim();
  const [text, setText] = useState('');
  const [attach, setAttach] = useState(false);
  const [menu, setMenu] = useState(null); // message
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const typed = useRef(false);
  const scroller = useRef(null);
  const recStart = useRef(0);

  useEffect(() => { scroller.current?.scrollTo({ top: 1e6, behavior: 'smooth' }); }, [msgs.length]);
  useEffect(() => {
    if (!recording) return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const doSend = () => {
    if (!text.trim()) return;
    onSend({ text: text.trim() });
    setText('');
    typed.current = false;
  };
  // Hold the microphone to record; lifting the finger anywhere sends it.
  // Under a second is treated as a tap and explains how it works.
  const startRecording = () => {
    recStart.current = Date.now();
    setRecording(true);
    setSeconds(0);
    emit('record_voice');
    window.addEventListener('pointerup', () => {
      const ms = Date.now() - recStart.current;
      setRecording(false);
      setSeconds(0);
      if (ms < 900) { showToast(t('Hold to record, release to send', 'রেকর্ড করতে চেপে ধরুন, পাঠাতে ছেড়ে দিন', 'रिकॉर्ड करने के लिए दबाए रखें, भेजने के लिए छोड़ें', 'Giữ để ghi âm, thả ra để gửi')); return; }
      onSend({ voice: Math.max(1, Math.round(ms / 1000)) });
      emit('voice_sent');
    }, { once: true });
  };

  return (
    <Screen nav={nav} style={{ background: CHAT_BG }}>
      <StatusBar dark bg={GREEN} />
      <AppBar bg={GREEN} onBack={nav.back}
        leading={<Tap className="wa-chat-head" act="open_contact_info" onClick={() => nav.push('info', { id: contact.id })} explain={T('Their name: tap to see contact info, and to Block or Report.', 'নাম: চাপলে কন্টাক্টের তথ্য দেখবেন, আর ব্লক বা রিপোর্ট করতে পারবেন।', 'नाम: टैप करें तो कॉन्टैक्ट की जानकारी दिखेगी, और ब्लॉक या रिपोर्ट कर सकेंगे।', 'Tên: chạm để xem thông tin, Chặn hoặc Báo cáo.')}>
          <Avatar c={contact} size="sm" />
          <span className="sim-appbar-title"><span>{contact.name}</span><small>{blocked ? t('Blocked', 'ব্লক করা', 'ब्लॉक किया', 'Đã chặn') : contact.online ? t('online', 'অনলাইন', 'ऑनलाइन', 'đang hoạt động') : t('tap here for contact info', 'তথ্যের জন্য এখানে চাপুন', 'जानकारी के लिए यहां टैप करें', 'chạm để xem thông tin')}</small></span>
        </Tap>}
        actions={<>
          <Tap className="sim-icon-btn" act="start_video_call" onClick={() => onCall(true)} label={t('Video call', 'ভিডিও কল', 'वीडियो कॉल', 'Gọi video')} explain={T('Video call: they can see you and you can see them.', 'ভিডিও কল: দুজন দুজনকে দেখতে পাবেন।', 'वीडियो कॉल: आप एक-दूसरे को देख सकेंगे।', 'Gọi video: hai bên thấy nhau.')}><Video size={22} /></Tap>
          <Tap className="sim-icon-btn" act="start_voice_call" onClick={() => onCall(false)} label={t('Voice call', 'ভয়েস কল', 'वॉइस कॉल', 'Gọi thoại')} explain={T('Voice call: a normal phone call over the internet.', 'ভয়েস কল: ইন্টারনেটের মাধ্যমে সাধারণ ফোন কল।', 'वॉइस कॉल: इंटरनेट से सामान्य फोन कॉल।', 'Gọi thoại: cuộc gọi thường qua internet.')}><Phone size={20} /></Tap>
          <Tap className="sim-icon-btn" act="open_contact_info" onClick={() => nav.push('info', { id: contact.id })} label={t('More', 'আরও', 'और', 'Thêm')} explain={T('More: contact info, search, mute, block and report.', 'আরও: কন্টাক্টের তথ্য, সার্চ, মিউট, ব্লক ও রিপোর্ট।', 'और: कॉन्टैक्ट जानकारी, सर्च, म्यूट, ब्लॉक और रिपोर्ट।', 'Thêm: thông tin, tìm, tắt tiếng, chặn và báo cáo.')}><MoreVertical size={22} /></Tap>
        </>}
      />
      <div ref={scroller} className="sim-scroll wa-thread">
        <p className="wa-day">{t('Today', 'আজ', 'आज', 'Hôm nay')}</p>
        {contact.unknown && (
          <div className="wa-unknown">
            <ShieldAlert size={18} />
            <span>{t('This number is not in your contacts. Be careful with requests for money.', 'এই নম্বরটি আপনার কন্টাক্টে নেই। টাকা চাইলে সাবধান।', 'यह नंबर आपके कॉन्टैक्ट में नहीं है। पैसे मांगे तो सावधान।', 'Số này không có trong danh bạ. Cẩn thận khi bị hỏi tiền.')}</span>
          </div>
        )}
        {msgs.map((m) => (
          <Tap as="div" key={m.id} className={`wa-msg ${m.me ? 'me' : 'them'}`} onHold={() => setMenu(m)} act={m.me ? 'hold_message' : undefined}
            explain={m.scam ? T('Warning signs: a new number, urgency, and a request for money. Call your child on their old number first.', 'সতর্ক সংকেত: নতুন নম্বর, তাড়াহুড়ো, আর টাকা চাওয়া। আগে সন্তানের পুরোনো নম্বরে ফোন করুন।', 'चेतावनी: नया नंबर, जल्दबाज़ी, और पैसे की मांग। पहले बच्चे के पुराने नंबर पर फोन करें।', 'Dấu hiệu: số mới, gấp gáp và đòi tiền. Hãy gọi số cũ của con trước.') : undefined}>
            {m.author && <span className="wa-author">{m.author}</span>}
            {m.deleted ? <em className="wa-deleted"><Ban size={14} /> {t('You deleted this message', 'আপনি মেসেজটি মুছেছেন', 'आपने यह मैसेज हटा दिया', 'Bạn đã xóa tin nhắn này')}</em> : (
              <>
                {m.photo && <Photo kind={PHOTOS.find((p) => p.id === m.photo)?.kind} className="wa-photo" size={44} />}
                {m.voice && <span className="wa-voice"><span className="wa-play"><Play size={14} fill="currentColor" /></span><span className="wa-wave" /><span>0:{String(m.voice).padStart(2, '0')}</span></span>}
                {m.text && <span>{m.text}</span>}
              </>
            )}
            <span className="wa-time">{m.time}{m.me && !m.deleted && <CheckCheck size={15} color={m.status === 'read' ? '#53bdeb' : '#8696a0'} />}</span>
          </Tap>
        ))}
      </div>

      {blocked ? (
        <div className="wa-blocked">{t('You blocked this contact. Tap to unblock in contact info.', 'আপনি এই কন্টাক্ট ব্লক করেছেন। আনব্লক করতে কন্টাক্টের তথ্যে যান।', 'आपने इस कॉन्टैक्ट को ब्लॉक किया है। अनब्लॉक के लिए कॉन्टैक्ट जानकारी में जाएं।', 'Bạn đã chặn liên hệ này. Bỏ chặn trong phần thông tin.')}</div>
      ) : (
        <div className="wa-inputbar">
          <div className="wa-input">
            {recording ? (
              <span className="wa-rec"><span className="wa-rec-dot" /> 0:{String(seconds).padStart(2, '0')} <span className="wa-rec-hint">‹ {t('release to send', 'ছাড়লে চলে যাবে', 'छोड़ते ही जाएगा', 'thả tay để gửi')}</span></span>
            ) : (
              <>
                <Tap className="sim-icon-btn wa-in-icon" onClick={() => showToast(t('Your emoji keyboard opens here on a real phone.', 'আসল ফোনে এখানে ইমোজির কিবোর্ড খোলে।', 'असली फ़ोन में यहां इमोजी कीबोर्ड खुलता है।', 'Trên điện thoại thật, bàn phím biểu tượng mở ở đây.'))} label={t('Emoji', 'ইমোজি', 'इमोजी', 'Biểu tượng cảm xúc')} explain={T('Emoji: opens small pictures you can add to your message.', 'ইমোজি: মেসেজে যোগ করার মতো ছোট ছবি খোলে।', 'इमोजी: मैसेज में जोड़ने वाली छोटी तस्वीरें खोलता है।', 'Biểu tượng cảm xúc: mở các hình nhỏ để thêm vào tin nhắn.')}><SmilePlus size={22} /></Tap>
                <input className="wa-text" data-act="type_message" value={text} placeholder={t('Message', 'মেসেজ', 'मैसेज', 'Tin nhắn')} aria-label={t('Message', 'মেসেজ', 'मैसेज', 'Tin nhắn')}
                  onChange={(e) => { setText(e.target.value); if (!typed.current && e.target.value.trim()) { typed.current = true; emit('type_message'); } }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doSend(); emit('send_message'); } }} />
                <Tap className="sim-icon-btn wa-in-icon" act="open_attach" onClick={() => setAttach(true)} label={t('Attach', 'সংযুক্ত করুন', 'अटैच करें', 'Đính kèm')}
                  explain={T('Paperclip: opens Gallery, Document, Location and more to send.', 'পেপারক্লিপ: গ্যালারি, ডকুমেন্ট, লোকেশন ইত্যাদি পাঠানোর মেনু খোলে।', 'पेपरक्लिप: गैलरी, डॉक्यूमेंट, लोकेशन वगैरह भेजने का मेनू खोलता है।', 'Kẹp giấy: mở Thư viện, Tài liệu, Vị trí… để gửi.')}><Paperclip size={21} style={{ transform: 'rotate(-45deg)' }} /></Tap>
                {!text && <Tap className="sim-icon-btn wa-in-icon" act="open_camera" onClick={() => nav.push('camera', { id: contact.id })} label={t('Camera', 'ক্যামেরা', 'कैमरा', 'Máy ảnh')} explain={T('Camera: take a new photo to send.', 'ক্যামেরা: পাঠানোর জন্য নতুন ছবি তুলুন।', 'कैमरा: भेजने के लिए नई फोटो लें।', 'Máy ảnh: chụp ảnh mới để gửi.')}><Camera size={21} /></Tap>}
              </>
            )}
          </div>
          {text ? (
            <Tap className="wa-round" act="send_message" onClick={doSend} label={t('Send', 'পাঠান', 'भेजें', 'Gửi')} explain={T('Send: sends your message.', 'পাঠান: আপনার মেসেজ পাঠিয়ে দেয়।', 'भेजें: आपका मैसेज भेज देता है।', 'Gửi: gửi tin nhắn của bạn.')}><Send size={20} /></Tap>
          ) : (
            <button type="button" className={`wa-round ${recording ? "is-rec" : ""}`} data-act="record_voice voice_sent" aria-label={t('Hold to record a voice message', 'ভয়েস মেসেজ রেকর্ড করতে চেপে ধরুন', 'वॉइस मैसेज के लिए दबाए रखें', 'Giữ để ghi âm')}
              onPointerDown={startRecording} onContextMenu={(e) => e.preventDefault()}>
              <Mic size={22} />
            </button>
          )}
        </div>
      )}

      <Sheet open={attach} onClose={() => setAttach(false)}>
        <div className="wa-attach-grid">
          {[
            ['document', File, '#7f66ff', T('Document', 'ডকুমেন্ট', 'डॉक्यूमेंट', 'Tài liệu')],
            ['camera', Camera, '#ff2e74', T('Camera', 'ক্যামেরা', 'कैमरा', 'Máy ảnh')],
            ['gallery', ImageIcon, '#c861fa', T('Gallery', 'গ্যালারি', 'गैलरी', 'Thư viện')],
            ['audio', Headphones, '#ff8a3d', T('Audio', 'অডিও', 'ऑडियो', 'Âm thanh')],
            ['location', MapPin, '#1fa855', T('Location', 'লোকেশন', 'लोकेशन', 'Vị trí')],
            ['contact', Contact, '#009de2', T('Contact', 'কন্টাক্ট', 'कॉन्टैक्ट', 'Liên hệ')],
          ].map(([id, Icon, color, label]) => (
            <Tap key={id} className="wa-attach" act={`open_${id}`} onClick={() => {
              setAttach(false);
              if (id === 'gallery') nav.push('gallery', { id: contact.id });
              else if (id === 'camera') nav.push('camera', { id: contact.id });
              else if (id === 'location') { onSend({ text: `${t('Current location', 'বর্তমান লোকেশন', 'मौजूदा लोकेशन', 'Vị trí hiện tại')}` }); showToast(t('Only share your location with people you trust.', 'শুধু বিশ্বস্ত মানুষের সাথে লোকেশন শেয়ার করুন।', 'लोकेशन सिर्फ़ भरोसेमंद लोगों से शेयर करें।', 'Chỉ chia sẻ vị trí với người bạn tin.')); }
              else showToast(t('Practice tip: choose Gallery to send a photo.', 'অনুশীলনের টিপস: ছবি পাঠাতে গ্যালারি বেছে নিন।', 'अभ्यास टिप: फोटो भेजने के लिए गैलरी चुनें।', 'Mẹo: chọn Thư viện để gửi ảnh.'));
            }} explain={label}>
              <span className="wa-attach-icon" style={{ background: color }}><Icon size={24} /></span>
              <span>{t(...label)}</span>
            </Tap>
          ))}
        </div>
      </Sheet>

      <Sheet open={Boolean(menu)} onClose={() => setMenu(null)}>
        <div className="sim-stack" style={{ gap: 0 }}>
          {[
            ['reply', Reply, T('Reply', 'রিপ্লাই', 'रिप्लाई', 'Trả lời'), () => showToast(t('Type your reply in the message box.', 'মেসেজের ঘরে উত্তর লিখুন।', 'मैसेज बॉक्स में जवाब लिखें।', 'Gõ câu trả lời vào ô tin nhắn.'))],
            ['forward', Forward, T('Forward', 'ফরোয়ার্ড', 'फॉरवर्ड', 'Chuyển tiếp'), () => showToast(t('Forwarded messages are marked "Forwarded". Check news before forwarding.', 'ফরোয়ার্ড করা মেসেজে "Forwarded" লেখা থাকে। ফরোয়ার্ডের আগে খবর যাচাই করুন।', 'फॉरवर्ड मैसेज पर "Forwarded" लिखा होता है। फॉरवर्ड से पहले खबर जांचें।', 'Tin chuyển tiếp có nhãn "Đã chuyển tiếp". Kiểm tra tin trước khi chuyển.'))],
            ...(menu?.me ? [['delete_message', Trash2, T('Delete for everyone', 'সবার জন্য মুছুন', 'सबके लिए डिलीट', 'Xóa với mọi người'), () => onDelete(menu.id)]] : []),
          ].map(([id, Icon, label, fn]) => (
            <Tap key={id} className="sim-row" act={id} onClick={() => { fn(); setMenu(null); }}>
              <Icon size={20} color={id === 'delete_message' ? '#e53935' : '#54656f'} /><span className="sim-row-title" style={{ color: id === 'delete_message' ? '#e53935' : undefined }}>{t(...label)}</span>
            </Tap>
          ))}
        </div>
      </Sheet>
    </Screen>
  );
}

function Gallery({ t, nav, onPick }) {
  return (
    <Screen nav={nav}>
      <StatusBar bg="#fff" />
      <AppBar bg="#fff" fg="#111b21" onBack={nav.back} title={t('Gallery', 'গ্যালারি', 'गैलरी', 'Thư viện')} subtitle={t('Tap a photo to choose it', 'বাছতে ছবিতে চাপুন', 'चुनने के लिए फोटो पर टैप करें', 'Chạm vào ảnh để chọn')} />
      <div className="sim-scroll wa-gallery">
        {PHOTOS.map((p, i) => (
          <Tap key={p.id} className="wa-thumb" act={i === 0 ? 'pick_photo' : 'pick_photo_other'} onClick={() => onPick(p)} label={t(...p.label)}
            explain={T('A photo from your phone. Tap to choose it — you can still check it before sending.', 'ফোনের একটি ছবি। বাছতে চাপুন — পাঠানোর আগে দেখে নিতে পারবেন।', 'फोन की एक फोटो। चुनने के लिए टैप करें — भेजने से पहले देख सकेंगे।', 'Ảnh trong máy. Chạm để chọn — vẫn xem lại được trước khi gửi.')}>
            <Photo kind={p.kind} style={{ width: '100%', height: '100%' }} size={30} />
          </Tap>
        ))}
      </div>
    </Screen>
  );
}

function CameraScreen({ t, nav, onShot }) {
  return (
    <Screen nav={nav} style={{ background: '#000', color: '#fff' }}>
      <StatusBar dark bg="#000" />
      <div className="wa-viewfinder">
        <Tap className="sim-icon-btn" style={{ position: 'absolute', top: 10, left: 10, color: '#fff' }} onClick={nav.back} label={t('Close camera', 'ক্যামেরা বন্ধ', 'कैमरा बंद', 'Đóng máy ảnh')}><X size={26} /></Tap>
        <Photo kind="garden" className="wa-vf-scene" size={64} />
        <p className="wa-vf-hint">{t('Point at what you want, then tap the big circle', 'যা তুলতে চান তার দিকে ধরুন, তারপর বড় গোল বোতামে চাপুন', 'जो खींचना है उसकी ओर रखें, फिर बड़े गोल बटन पर टैप करें', 'Hướng máy vào cảnh muốn chụp rồi chạm vòng tròn lớn')}</p>
      </div>
      <div className="wa-shutter-row">
        <span />
        <Tap className="wa-shutter" act="take_photo" onClick={onShot} label={t('Take photo', 'ছবি তুলুন', 'फोटो लें', 'Chụp ảnh')} explain={T('Shutter: takes the photo.', 'শাটার: ছবি তোলে।', 'शटर: फोटो खींचता है।', 'Nút chụp: chụp ảnh.')} />
        <Tap className="sim-icon-btn" style={{ color: '#fff' }} onClick={() => {}} label={t('Switch camera', 'ক্যামেরা বদলান', 'कैमरा बदलें', 'Đổi camera')} explain={T('Switches between the front and back camera.', 'সামনের ও পেছনের ক্যামেরার মধ্যে বদলায়।', 'आगे और पीछे के कैमरे के बीच बदलता है।', 'Đổi giữa camera trước và sau.')}><SwitchCamera size={26} /></Tap>
      </div>
    </Screen>
  );
}

function Preview({ t, nav, photo, contact, onSend }) {
  const [caption, setCaption] = useState('');
  if (!photo) return null;
  return (
    <Screen nav={nav} style={{ background: '#0b141a', color: '#fff' }}>
      <StatusBar dark bg="#0b141a" />
      <AppBar bg="#0b141a" onBack={nav.back} title="" />
      <Photo kind={photo.kind} className="wa-preview" size={80} />
      <div className="wa-caption-row">
        <input className="wa-caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={t('Add a caption…', 'ক্যাপশন যোগ করুন…', 'कैप्शन जोड़ें…', 'Thêm chú thích…')} aria-label={t('Caption', 'ক্যাপশন', 'कैप्शन', 'Chú thích')} />
      </div>
      <div className="wa-preview-foot">
        <span className="wa-to">{contact?.name}</span>
        <Tap className="wa-round" act="send_photo" onClick={() => onSend(caption.trim())} label={t('Send', 'পাঠান', 'भेजें', 'Gửi')} explain={T('Send: sends the photo (and caption).', 'পাঠান: ছবি (আর ক্যাপশন) পাঠিয়ে দেয়।', 'भेजें: फोटो (और कैप्शन) भेज देता है।', 'Gửi: gửi ảnh (kèm chú thích).')}><Send size={20} /></Tap>
      </div>
    </Screen>
  );
}

function ContactInfo({ t, nav, contact, blocked, onCall, onBlock }) {
  const { showToast, emit } = useSim();
  const [confirm, setConfirm] = useState(null); // 'block' | 'report'
  return (
    <Screen nav={nav} style={{ background: '#f7f8fa' }}>
      <StatusBar bg="#fff" />
      <AppBar bg="#fff" fg="#111b21" onBack={nav.back} title="" />
      <div className="sim-scroll">
        <div className="wa-info-head">
          <Avatar c={contact} size="lg" />
          <p className="wa-info-name">{contact.name}</p>
          {contact.unknown && <p className="wa-info-sub">{t('Not in your contacts', 'আপনার কন্টাক্টে নেই', 'आपके कॉन्टैक्ट में नहीं', 'Không có trong danh bạ')}</p>}
          <div className="wa-info-actions">
            <Tap className="wa-info-act" act="start_voice_call" onClick={() => onCall(false)}><Phone size={20} />{t('Audio', 'অডিও', 'ऑडियो', 'Thoại')}</Tap>
            <Tap className="wa-info-act" act="start_video_call" onClick={() => onCall(true)}><Video size={20} />{t('Video', 'ভিডিও', 'वीडियो', 'Video')}</Tap>
            <Tap className="wa-info-act" onClick={() => showToast(t('Search inside this chat.', 'এই চ্যাটের ভেতরে খুঁজুন।', 'इस चैट के अंदर खोजें।', 'Tìm trong đoạn chat này.'))}><Search size={20} />{t('Search', 'সার্চ', 'सर्च', 'Tìm')}</Tap>
          </div>
        </div>
        <div className="wa-info-card">
          <div className="sim-row"><Lock size={20} color="#54656f" /><span className="sim-row-main"><span className="sim-row-title">{t('Encryption', 'এনক্রিপশন', 'एन्क्रिप्शन', 'Mã hóa')}</span><span className="sim-row-sub">{t('Messages and calls are end-to-end encrypted.', 'মেসেজ ও কল এন্ড-টু-এন্ড এনক্রিপ্টেড।', 'मैसेज और कॉल एंड-टू-एंड एन्क्रिप्टेड हैं।', 'Tin nhắn và cuộc gọi được mã hóa đầu cuối.')}</span></span></div>
        </div>
        <div className="wa-info-card">
          {blocked ? (
            <Tap className="sim-row wa-danger" act="unblock_contact" onClick={() => { onBlock(false); showToast(t('Unblocked', 'আনব্লক করা হয়েছে', 'अनब्लॉक किया', 'Đã bỏ chặn')); }}><Ban size={20} />{t(`Unblock ${contact.name}`, `${contact.name}-কে আনব্লক করুন`, `${contact.name} को अनब्लॉक करें`, `Bỏ chặn ${contact.name}`)}</Tap>
          ) : (
            <Tap className="sim-row wa-danger" act="block_contact" onClick={() => setConfirm('block')} explain={T('Block: they can no longer call or message you.', 'ব্লক: তারা আর আপনাকে কল বা মেসেজ করতে পারবে না।', 'ब्लॉक: वे अब आपको कॉल या मैसेज नहीं कर पाएंगे।', 'Chặn: họ không gọi hay nhắn cho bạn được nữa.')}><Ban size={20} />{t(`Block ${contact.name}`, `${contact.name}-কে ব্লক করুন`, `${contact.name} को ब्लॉक करें`, `Chặn ${contact.name}`)}</Tap>
          )}
          <Tap className="sim-row wa-danger" act="report_contact" onClick={() => setConfirm('report')} explain={T('Report: tells WhatsApp about scams or abuse.', 'রিপোর্ট: প্রতারণা বা হয়রানির কথা হোয়াটসঅ্যাপকে জানায়।', 'रिपोर्ट: धोखे या परेशानी की बात व्हाट्सऐप को बताता है।', 'Báo cáo: báo WhatsApp về lừa đảo hoặc quấy rối.')}><Flag size={20} />{t(`Report ${contact.name}`, `${contact.name}-কে রিপোর্ট করুন`, `${contact.name} की रिपोर्ट करें`, `Báo cáo ${contact.name}`)}</Tap>
        </div>
      </div>
      <Sheet open={Boolean(confirm)} onClose={() => setConfirm(null)} title={confirm === 'block' ? t(`Block ${contact.name}?`, `${contact.name}-কে ব্লক করবেন?`, `${contact.name} को ब्लॉक करें?`, `Chặn ${contact.name}?`) : t(`Report ${contact.name} to WhatsApp?`, `${contact.name}-কে হোয়াটসঅ্যাপে রিপোর্ট করবেন?`, `${contact.name} की व्हाट्सऐप को रिपोर्ट करें?`, `Báo cáo ${contact.name} với WhatsApp?`)}>
        <p style={{ margin: '0 0 16px', color: '#54656f' }}>{confirm === 'block'
          ? t('Blocked contacts can no longer call you or send you messages.', 'ব্লক করা কন্টাক্ট আর আপনাকে কল বা মেসেজ পাঠাতে পারবে না।', 'ब्लॉक किए कॉन्टैक्ट अब आपको कॉल या मैसेज नहीं कर पाएंगे।', 'Liên hệ bị chặn sẽ không gọi hay nhắn cho bạn được nữa.')
          : t('The last 5 messages from this contact will be sent to WhatsApp. They will not be notified.', 'এই কন্টাক্টের শেষ ৫টি মেসেজ হোয়াটসঅ্যাপে পাঠানো হবে। তাকে জানানো হবে না।', 'इस कॉन्टैक्ट के आख़िरी 5 मैसेज व्हाट्सऐप को भेजे जाएंगे। उन्हें पता नहीं चलेगा।', '5 tin nhắn gần nhất sẽ được gửi tới WhatsApp. Họ sẽ không được báo.')}</p>
        <div className="sim-stack">
          <Tap className="sim-primary" style={{ background: '#e53935' }} act={confirm === 'block' ? 'confirm_block' : 'confirm_report'} onClick={() => {
            if (confirm === 'block') { onBlock(true); showToast(t(`${contact.name} is blocked`, `${contact.name} ব্লক হয়েছে`, `${contact.name} ब्लॉक हो गया`, `Đã chặn ${contact.name}`)); }
            else { onBlock(true); emit('confirm_block'); showToast(t('Reported and blocked. Well done for staying safe.', 'রিপোর্ট ও ব্লক করা হয়েছে। নিরাপদ থাকার জন্য শাবাশ।', 'रिपोर्ट और ब्लॉक हो गया। सुरक्षित रहने के लिए शाबाश।', 'Đã báo cáo và chặn. Làm tốt lắm!')); }
            setConfirm(null);
          }}>{confirm === 'block' ? t('Block', 'ব্লক', 'ब्लॉक', 'Chặn') : t('Report and block', 'রিপোর্ট ও ব্লক', 'रिपोर्ट और ब्लॉक', 'Báo cáo và chặn')}</Tap>
          <Tap className="sim-secondary" onClick={() => setConfirm(null)}>{t('Cancel', 'বাতিল', 'रद्द करें', 'Hủy')}</Tap>
        </div>
      </Sheet>
    </Screen>
  );
}

function CallScreen({ t, call, onEnd }) {
  const [connected, setConnected] = useState(false);
  const [secs, setSecs] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  useEffect(() => { const id = setTimeout(() => setConnected(true), 1800); return () => clearTimeout(id); }, []);
  useEffect(() => { if (!connected) return undefined; const id = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(id); }, [connected]);
  const c = call.contact;
  return (
    <div className="sim-call" style={call.video && connected && !camOff ? { background: `linear-gradient(160deg, ${c.color}, #1b262c)` } : undefined}>
      <div className="wa-call-top">
        <Lock size={14} /> <span>{t('End-to-end encrypted', 'এন্ড-টু-এন্ড এনক্রিপ্টেড', 'एंड-टू-एंड एन्क्रिप्टेड', 'Mã hóa đầu cuối')}</span>
        <span className="sim-avatar lg" style={{ background: c.color, marginTop: 18 }}>{initials(c.name)}</span>
        <p className="wa-call-name">{c.name}</p>
        <p className="wa-call-state">{connected ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : t('Ringing…', 'রিং হচ্ছে…', 'रिंग हो रही है…', 'Đang đổ chuông…')}</p>
      </div>
      {call.video && connected && <div className="wa-self-view" data-off={camOff}>{camOff ? <VideoOff size={22} /> : t('You', 'আপনি', 'आप', 'Bạn')}</div>}
      <div className="sim-call-controls">
        {call.video && <Tap className={`sim-call-btn ${camOff ? 'is-off' : ''}`} act="toggle_camera" onClick={() => setCamOff((v) => !v)} label={t('Camera on/off', 'ক্যামেরা চালু/বন্ধ', 'कैमरा चालू/बंद', 'Bật/tắt camera')} explain={T('Turns your camera off or on. They will not see you while it is off.', 'আপনার ক্যামেরা বন্ধ বা চালু করে। বন্ধ থাকলে তাঁরা আপনাকে দেখবেন না।', 'आपका कैमरा बंद या चालू करता है। बंद रहने पर वे आपको नहीं देखेंगे।', 'Bật hoặc tắt camera. Khi tắt, họ không thấy bạn.')}>{camOff ? <VideoOff size={24} /> : <Video size={24} />}</Tap>}
        <Tap className={`sim-call-btn ${speaker ? 'is-off' : ''}`} onClick={() => setSpeaker((v) => !v)} label={t('Speaker', 'স্পিকার', 'स्पीकर', 'Loa ngoài')} explain={T('Speaker: plays the call out loud.', 'স্পিকার: কলের আওয়াজ জোরে শোনায়।', 'स्पीकर: कॉल की आवाज़ ज़ोर से सुनाता है।', 'Loa ngoài: phát âm thanh to.')}><Volume2 size={24} /></Tap>
        <Tap className={`sim-call-btn ${muted ? 'is-off' : ''}`} act="toggle_mute" onClick={() => setMuted((v) => !v)} label={t('Mute', 'মিউট', 'म्यूट', 'Tắt tiếng')} explain={T('Mute: they cannot hear you until you tap it again.', 'মিউট: আবার না চাপা পর্যন্ত তাঁরা আপনার কথা শুনবেন না।', 'म्यूट: फिर से दबाने तक वे आपकी आवाज़ नहीं सुनेंगे।', 'Tắt tiếng: họ không nghe bạn cho đến khi bạn chạm lại.')}>{muted ? <MicOff size={24} /> : <Mic size={24} />}</Tap>
        <Tap className="sim-call-btn end" act="end_call" onClick={onEnd} label={t('End call', 'কল শেষ', 'कॉल खत्म करें', 'Kết thúc')} explain={T('End call: hangs up.', 'কল শেষ: ফোন রেখে দেয়।', 'कॉल खत्म: फोन काट देता है।', 'Kết thúc: cúp máy.')}><PhoneOff size={24} /></Tap>
      </div>
    </div>
  );
}

function Updates({ t, contacts, onOpen }) {
  return (
    <div>
      <p className="wa-section">{t('Status', 'স্ট্যাটাস', 'स्टेटस', 'Trạng thái')}</p>
      <div className="wa-status-row">
        {contacts.filter((c) => !c.unknown).slice(0, 3).map((c) => (
          <Tap key={c.id} className="wa-status" act="open_status" onClick={() => onOpen(c)} explain={T('A status: a photo or note that disappears after 24 hours.', 'স্ট্যাটাস: ২৪ ঘণ্টা পর মুছে যাওয়া ছবি বা লেখা।', 'स्टेटस: 24 घंटे बाद गायब होने वाली फोटो या लिखावट।', 'Trạng thái: ảnh hoặc ghi chú tự mất sau 24 giờ.')}>
            <span className="wa-status-ring"><Avatar c={c} /></span>
            <span>{c.name.split(' ')[0]}</span>
          </Tap>
        ))}
      </div>
      <p className="wa-section">{t('Channels', 'চ্যানেল', 'चैनल', 'Kênh')}</p>
      <p style={{ padding: '0 16px', color: '#667781' }}>{t('Follow channels for news and updates. Be careful: anyone can create a channel.', 'খবর ও আপডেটের জন্য চ্যানেল ফলো করুন। সাবধান: যে কেউ চ্যানেল খুলতে পারে।', 'खबरों के लिए चैनल फॉलो करें। सावधान: कोई भी चैनल बना सकता है।', 'Theo dõi kênh để xem tin tức. Lưu ý: ai cũng tạo được kênh.')}</p>
    </div>
  );
}

function StatusViewer({ t, nav, contact }) {
  const [p, setP] = useState(0);
  useEffect(() => { const id = setInterval(() => setP((v) => (v >= 1 ? 1 : v + 0.02)), 100); return () => clearInterval(id); }, []);
  useEffect(() => { if (p >= 1) nav.back(); }, [p, nav]);
  return (
    <Screen nav={nav} style={{ background: contact?.color || '#333', color: '#fff' }}>
      <div className="wa-status-bar"><i style={{ transform: `scaleX(${p})` }} /></div>
      <AppBar bg="transparent" onBack={nav.back} title={contact?.name} subtitle={t('Today', 'আজ', 'आज', 'Hôm nay')} />
      <div className="wa-status-body">{t('Have a peaceful day!', 'দিনটি শান্তিতে কাটুক!', 'आपका दिन शांतिपूर्ण हो!', 'Chúc một ngày bình yên!')}</div>
    </Screen>
  );
}

function Settings({ t, nav }) {
  const { showToast, emit } = useSim();
  const [twoStep, setTwoStep] = useState(false);
  const [lastSeen, setLastSeen] = useState('contacts');
  const [page, setPage] = useState('main');
  return (
    <Screen nav={nav} style={{ background: '#fff' }}>
      <StatusBar bg="#fff" />
      <AppBar bg="#fff" fg="#111b21" onBack={page === 'main' ? nav.back : () => setPage('main')} title={page === 'privacy' ? t('Privacy', 'প্রাইভেসি', 'प्राइवेसी', 'Quyền riêng tư') : page === 'account' ? t('Account', 'অ্যাকাউন্ট', 'खाता', 'Tài khoản') : t('Settings', 'সেটিংস', 'सेटिंग्स', 'Cài đặt')} />
      <div className="sim-scroll">
        {page === 'main' && [
          ['account', Key, T('Account', 'অ্যাকাউন্ট', 'खाता', 'Tài khoản'), T('Security, two-step verification', 'নিরাপত্তা, টু-স্টেপ ভেরিফিকেশন', 'सुरक्षा, टू-स्टेप वेरिफ़िकेशन', 'Bảo mật, xác minh hai bước')],
          ['privacy', Lock, T('Privacy', 'প্রাইভেসি', 'प्राइवेसी', 'Quyền riêng tư'), T('Last seen, profile photo, blocked contacts', 'লাস্ট সিন, প্রোফাইল ছবি, ব্লক করা কন্টাক্ট', 'लास्ट सीन, प्रोफ़ाइल फोटो, ब्लॉक किए कॉन्टैक्ट', 'Lần cuối truy cập, ảnh đại diện, liên hệ bị chặn')],
        ].map(([id, Icon, title, sub]) => (
          <Tap key={id} className="sim-row" act={`open_${id}`} onClick={() => setPage(id)}>
            <Icon size={22} color="#54656f" /><span className="sim-row-main"><span className="sim-row-title">{t(...title)}</span><span className="sim-row-sub">{t(...sub)}</span></span><ChevronRight size={18} color="#8696a0" />
          </Tap>
        ))}
        {page === 'account' && (
          <div className="sim-pad sim-stack">
            <Tap className="sim-row" act="toggle_two_step" onClick={() => { setTwoStep((v) => !v); emit(twoStep ? 'two_step_off' : 'two_step_on'); showToast(twoStep ? t('Two-step verification off', 'টু-স্টেপ ভেরিফিকেশন বন্ধ', 'टू-स्टेप वेरिफ़िकेशन बंद', 'Đã tắt xác minh hai bước') : t('Two-step verification on — a 6-digit PIN now protects your account.', 'টু-স্টেপ চালু — এখন ৬ সংখ্যার পিন আপনার অ্যাকাউন্ট সুরক্ষা দেবে।', 'टू-स्टेप चालू — अब 6 अंकों का पिन आपके खाते की रक्षा करेगा।', 'Đã bật — mã PIN 6 số giờ bảo vệ tài khoản.')); }}
              explain={T('Two-step verification: asks for your own 6-digit PIN when someone registers your number on a new phone.', 'টু-স্টেপ ভেরিফিকেশন: কেউ নতুন ফোনে আপনার নম্বর চালু করতে চাইলে আপনার ৬ সংখ্যার পিন চায়।', 'टू-स्टेप वेरिफ़िकेशन: कोई नए फोन पर आपका नंबर चालू करे तो आपका 6 अंकों का पिन मांगता है।', 'Xác minh hai bước: đòi mã PIN 6 số của bạn khi ai đó đăng ký số của bạn trên máy mới.')}>
              <Key size={22} color="#54656f" /><span className="sim-row-main"><span className="sim-row-title">{t('Two-step verification', 'টু-স্টেপ ভেরিফিকেশন', 'टू-स्टेप वेरिफ़िकेशन', 'Xác minh hai bước')}</span><span className="sim-row-sub">{twoStep ? t('On', 'চালু', 'चालू', 'Bật') : t('Off', 'বন্ধ', 'बंद', 'Tắt')}</span></span>
              <span className={`rp-toggle ${twoStep ? 'is-on' : ''}`} style={{ '--on': GREEN }}><i /></span>
            </Tap>
            <p className="sim-safety"><ShieldAlert size={16} />{t('Never share the 6-digit code WhatsApp sends you by SMS. Anyone with it can take your account.', 'হোয়াটসঅ্যাপের পাঠানো ৬ সংখ্যার কোড কখনো কাউকে দেবেন না। কোড যার হাতে, অ্যাকাউন্ট তার।', 'व्हाट्सऐप का भेजा 6 अंकों का कोड कभी किसी को न दें। कोड जिसके पास, खाता उसका।', 'Đừng bao giờ đưa mã 6 số WhatsApp gửi qua SMS. Ai có mã là chiếm được tài khoản.')}</p>
          </div>
        )}
        {page === 'privacy' && (
          <div className="sim-pad sim-stack">
            <p className="sim-label">{t('Who can see my last seen', 'কে আমার লাস্ট সিন দেখবে', 'मेरा लास्ट सीन कौन देखे', 'Ai xem được lần cuối truy cập')}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[['everyone', T('Everyone', 'সবাই', 'सभी', 'Mọi người')], ['contacts', T('My contacts', 'আমার কন্টাক্ট', 'मेरे कॉन्टैक्ट', 'Danh bạ của tôi')], ['nobody', T('Nobody', 'কেউ না', 'कोई नहीं', 'Không ai')]].map(([id, label]) => (
                <Tap key={id} className="sim-chip" aria-pressed={lastSeen === id} act={`last_seen_${id}`} onClick={() => setLastSeen(id)}>{lastSeen === id && <Check size={14} />}{t(...label)}</Tap>
              ))}
            </div>
            <p className="sim-safety"><Lock size={16} />{t('"My contacts" keeps strangers from seeing when you are online.', '"আমার কন্টাক্ট" দিলে অচেনা মানুষ জানবে না আপনি কখন অনলাইনে।', '"मेरे कॉन्टैक्ट" से अनजान लोग नहीं जान पाएंगे कि आप कब ऑनलाइन हैं।', '"Danh bạ của tôi" giúp người lạ không biết khi nào bạn online.')}</p>
          </div>
        )}
      </div>
    </Screen>
  );
}

