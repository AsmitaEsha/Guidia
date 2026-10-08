import { useState } from 'react';
import {
  Bell, Bookmark, Check, ChevronRight, EyeOff, Flag, Globe, Home, Image as ImageIcon, Lock, Menu, MessageCircle, MoreHorizontal, Plus, Search,
  Send, Settings, Smile, Share2, ShieldAlert, ShoppingBag, ThumbsUp, UserCheck, Users, Video, X,
} from 'lucide-react';
import { AppBar, Photo, Reaction, Screen, Sheet, StatusBar, T, Tap, useSim, useStack } from './kit/SimKit';

// Facebook (Android): feed, reactions, comments, share, create post with
// audience, saved posts, report a scam post, friend requests (including a
// copied account), notifications and privacy settings.

const BLUE = '#1877F2';
const REACTIONS = [
  ['like', T('Like', 'লাইক', 'लाइक', 'Thích')], ['love', T('Love', 'লাভ', 'लव', 'Yêu thích')], ['care', T('Care', 'কেয়ার', 'केयर', 'Thương thương')],
  ['haha', T('Haha', 'হাহা', 'हाहा', 'Haha')], ['wow', T('Wow', 'ওয়াও', 'वाओ', 'Wow')], ['sad', T('Sad', 'স্যাড', 'सैड', 'Buồn')], ['angry', T('Angry', 'অ্যাংরি', 'एंग्री', 'Phẫn nộ')],
];

function posts(t) {
  return [
    { id: 'rupa', author: t('Rupa (Daughter)', 'রূপা (মেয়ে)', 'रूपा (बेटी)', 'Lan (con gái)'), color: '#e57373', time: t('2 h', '২ ঘণ্টা', '2 घंटे', '2 giờ'), audience: 'friends',
      text: t('Grandchildren\'s first day at school!', 'নাতি-নাতনিদের স্কুলের প্রথম দিন!', 'पोते-पोतियों का स्कूल में पहला दिन!', 'Ngày đầu tiên đi học của các cháu!'), photo: { kind: 'school' }, likes: 34, comments: 6 },
    { id: 'scam', author: 'Free iPhone Giveaway 2026', color: '#455a64', time: t('Sponsored', 'স্পনসরড', 'प्रायोजित', 'Được tài trợ'), audience: 'public', scam: true,
      text: t('CONGRATULATIONS! You are selected for a FREE iPhone. Click the link and pay only ৳99 delivery!', 'অভিনন্দন! আপনি ফ্রি আইফোনের জন্য নির্বাচিত। লিংকে ক্লিক করে শুধু ৳৯৯ ডেলিভারি দিন!', 'बधाई हो! आप मुफ़्त आईफ़ोन के लिए चुने गए। लिंक पर क्लिक करें और सिर्फ़ ₹99 डिलीवरी दें!', 'CHÚC MỪNG! Bạn được chọn nhận iPhone MIỄN PHÍ. Bấm link và chỉ trả 99k phí giao hàng!'), photo: { kind: 'gift' }, likes: 1200, comments: 840 },
    { id: 'rahim', author: t('Rahim (Son)', 'রহিম (ছেলে)', 'राहुल (बेटा)', 'Minh (con trai)'), color: '#64b5f6', time: t('Yesterday', 'গতকাল', 'कल', 'Hôm qua'), audience: 'friends',
      text: t('Easy recipe: lentil soup for cold evenings. Saving this for Ma!', 'সহজ রেসিপি: ঠান্ডা সন্ধ্যার জন্য ডালের স্যুপ। মায়ের জন্য রেখে দিলাম!', 'आसान रेसिपी: ठंडी शाम के लिए दाल का सूप। माँ के लिए सेव किया!', 'Công thức dễ: súp đậu cho buổi tối lạnh. Lưu lại cho mẹ!'), photo: { kind: 'food' }, likes: 18, comments: 3 },
  ];
}

export default function FacebookSim() {
  const { t, showToast, emit } = useSim();
  const nav = useStack('feed');
  const [tab, setTab] = useState('home');
  const [feed, setFeed] = useState(() => posts(t));
  const [reaction, setReaction] = useState({});
  const [picker, setPicker] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [shareFor, setShareFor] = useState(null);
  const [report, setReport] = useState(null); // { post, reason, sent }
  const [saved, setSaved] = useState([]);
  const [hidden, setHidden] = useState([]);
  const [requests, setRequests] = useState(['meena', 'copy']);

  const react = (id, key) => {
    setReaction((r) => ({ ...r, [id]: r[id] === key ? null : key }));
    setPicker(null);
    emit(key === 'like' ? 'like_post' : `react_${key}`);
    if (key !== 'like') emit('react_post');
  };

  if (nav.screen === 'composer') {
    return <Composer t={t} nav={nav} onPost={(p) => { setFeed((f) => [{ ...p, id: `me${Date.now()}`, author: t('You', 'আপনি', 'आप', 'Bạn'), color: '#8e24aa', time: t('Just now', 'এইমাত্র', 'अभी', 'Vừa xong'), likes: 0, comments: 0 }, ...f]); nav.reset('feed'); showToast(t('Your post is shared.', 'আপনার পোস্ট শেয়ার হয়েছে।', 'आपकी पोस्ट शेयर हो गई।', 'Bài viết đã được đăng.')); }} />;
  }
  if (nav.screen === 'comments') {
    const post = feed.find((p) => p.id === nav.params.id);
    return <Comments t={t} nav={nav} post={post} />;
  }
  if (nav.screen === 'profile') return <SuspiciousProfile t={t} nav={nav} onDelete={() => { setRequests((r) => r.filter((x) => x !== 'copy')); nav.back(); showToast(t('Request deleted. They are not told.', 'রিকোয়েস্ট মুছে দেওয়া হয়েছে। তাকে জানানো হয় না।', 'रिक्वेस्ट डिलीट हो गई। उन्हें बताया नहीं जाता।', 'Đã xóa lời mời. Họ không được báo.')); }} />;
  if (nav.screen === 'privacy') return <Privacy t={t} nav={nav} />;
  if (nav.screen === 'saved') {
    return (
      <div className="fb">
        <StatusBar bg="#fff" />
        <AppBar bg="#fff" fg="#050505" onBack={nav.back} title={t('Saved', 'সেভ করা', 'सेव किए', 'Đã lưu')} />
        <div className="sim-scroll">
          {saved.length === 0 ? <p className="sim-pad" style={{ color: '#65676b' }}>{t('Nothing saved yet. Use the three dots on a post and choose "Save post".', 'এখনো কিছু সেভ করা নেই। পোস্টের তিন ডটে চেপে "পোস্ট সেভ করুন" বেছে নিন।', 'अभी कुछ सेव नहीं। पोस्ट के तीन बिंदु दबाकर "पोस्ट सेव करें" चुनें।', 'Chưa lưu gì. Chạm ba chấm trên bài viết và chọn "Lưu bài viết".')}</p>
            : saved.map((id) => { const p = feed.find((x) => x.id === id); return p && <div key={id} className="sim-row">{p.photo ? <Photo kind={p.photo.kind} className="fb-thumb" size={22} /> : <span className="fb-thumb" />}<span className="sim-row-main"><span className="sim-row-title">{p.text}</span><span className="sim-row-sub">{p.author}</span></span></div>; })}
        </div>
      </div>
    );
  }

  return (
    <div className="fb" style={{ '--accent': BLUE }}>
      <Screen nav={nav}>
        <StatusBar bg="#fff" />
        <div className="fb-top">
          <span className="fb-logo">facebook</span>
          <Tap className="fb-round" act="open_composer" onClick={() => nav.push('composer')} label={t('Create', 'তৈরি করুন', 'बनाएं', 'Tạo')} explain={T('Create: write a new post.', 'তৈরি করুন: নতুন পোস্ট লিখুন।', 'बनाएं: नई पोस्ट लिखें।', 'Tạo: viết bài mới.')}><Plus size={20} /></Tap>
          <Tap className="fb-round" onClick={() => showToast(t('Search for people, pages and groups.', 'মানুষ, পেজ ও গ্রুপ খুঁজুন।', 'लोग, पेज और ग्रुप खोजें।', 'Tìm người, trang và nhóm.'))} label={t('Search', 'সার্চ', 'सर्च', 'Tìm')}><Search size={20} /></Tap>
          <Tap className="fb-round" onClick={() => showToast(t('This opens Messenger, the chat app for Facebook.', 'এটা মেসেঞ্জার খোলে, ফেসবুকের চ্যাট অ্যাপ।', 'यह मैसेंजर खोलता है, फेसबुक का चैट ऐप।', 'Mở Messenger, ứng dụng nhắn tin của Facebook.'))} label="Messenger"><MessageCircle size={20} /></Tap>
        </div>
        <nav className="fb-tabs" role="tablist">
          {[['home', Home, T('Home', 'হোম', 'होम', 'Trang chủ')], ['friends', Users, T('Friends', 'বন্ধু', 'दोस्त', 'Bạn bè')], ['video', Video, T('Video', 'ভিডিও', 'वीडियो', 'Video')], ['market', ShoppingBag, T('Marketplace', 'মার্কেটপ্লেস', 'मार्केटप्लेस', 'Marketplace')], ['notifications', Bell, T('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')], ['menu', Menu, T('Menu', 'মেনু', 'मेनू', 'Menu')]].map(([id, Icon, label]) => (
            <Tap key={id} className="fb-tab" role="tab" aria-selected={tab === id} act={`tab_${id} ${id === 'friends' ? 'open_friends' : id === 'menu' ? 'open_menu' : ''}`.trim()} onClick={() => setTab(id)} label={t(...label)} explain={label}>
              <Icon size={22} />{id === 'friends' && requests.length > 0 && <span className="fb-dot">{requests.length}</span>}
            </Tap>
          ))}
        </nav>
        <div className="sim-scroll fb-feed">
          {tab === 'home' && (
            <>
              <div className="fb-composer">
                <span className="sim-avatar sm" style={{ background: '#8e24aa' }}>A</span>
                <Tap className="fb-mind" act="open_composer" onClick={() => nav.push('composer')} explain={T('Tap here to write a post.', 'পোস্ট লিখতে এখানে চাপুন।', 'पोस्ट लिखने के लिए यहां टैप करें।', 'Chạm vào đây để viết bài.')}>{t("What's on your mind?", 'আপনার মনে কী আছে?', 'आपके मन में क्या है?', 'Bạn đang nghĩ gì?')}</Tap>
                <Tap className="sim-icon-btn" act="open_composer" onClick={() => nav.push('composer')} label={t('Photo', 'ছবি', 'फोटो', 'Ảnh')} style={{ color: '#45bd62' }}><ImageIcon size={24} /></Tap>
              </div>
              {feed.filter((p) => !hidden.includes(p.id)).map((p) => (
                <article key={p.id} className="fb-post">
                  <div className="fb-post-head">
                    <span className="sim-avatar sm" style={{ background: p.color }}>{p.author.slice(0, 1)}</span>
                    <span className="sim-row-main"><span className="sim-row-title" style={{ fontSize: 15 }}>{p.author}</span><span className="sim-row-sub">{p.time} · {p.audience === 'public' ? <Globe size={11} /> : p.audience === 'only_me' ? <Lock size={11} /> : <Users size={11} />}</span></span>
                    <Tap className="sim-icon-btn" act={`open_post_menu open_post_menu_${p.id}`} onClick={() => setMenuFor(p)} label={t('More options', 'আরও অপশন', 'और विकल्प', 'Thêm tùy chọn')} explain={T('Three dots: Save, Hide or Report this post.', 'তিন ডট: এই পোস্ট সেভ, হাইড বা রিপোর্ট করুন।', 'तीन बिंदु: यह पोस्ट सेव, हाइड या रिपोर्ट करें।', 'Ba chấm: Lưu, Ẩn hoặc Báo cáo bài viết.')}><MoreHorizontal size={20} /></Tap>
                  </div>
                  <p className="fb-text">{p.text}</p>
                  {p.photo && <Photo kind={p.photo.kind} className="fb-photo" size={56} />}
                  {p.scam && <p className="fb-scam-note"><ShieldAlert size={15} />{t('Free prizes that ask you to pay "only delivery" are scams.', '"শুধু ডেলিভারি চার্জ" চাওয়া ফ্রি পুরস্কার মানেই প্রতারণা।', '"सिर्फ़ डिलीवरी" के पैसे मांगने वाले मुफ़्त इनाम धोखा हैं।', 'Quà miễn phí mà bắt trả "phí giao hàng" là lừa đảo.')}</p>}
                  <div className="fb-counts"><span className="fb-count-icons"><Reaction kind="like" size={18} /><Reaction kind="love" size={18} /> {p.likes + (reaction[p.id] ? 1 : 0)}</span><span>{p.comments} {t('comments', 'কমেন্ট', 'कमेंट', 'bình luận')}</span></div>
                  <div className="fb-actions">
                    <Tap className="fb-action" data-on={Boolean(reaction[p.id])} act={`like_post open_reactions like_post_${p.id}`} onClick={() => react(p.id, 'like')} onHold={() => { setPicker(p.id); emit('open_reactions'); }}
                      explain={T('Like: tap once to like. Press and hold to choose another reaction, like Love.', 'লাইক: একবার চাপলে লাইক। চেপে ধরে রাখলে লাভের মতো অন্য রিঅ্যাকশন বেছে নিতে পারবেন।', 'लाइक: एक बार टैप से लाइक। दबाकर रखें तो लव जैसा दूसरा रिएक्शन चुनें।', 'Thích: chạm một lần để thích. Nhấn giữ để chọn cảm xúc khác như Yêu thích.')}>
                      {reaction[p.id] ? <span><Reaction kind={reaction[p.id]} size={18} /> {t(...REACTIONS.find((r) => r[0] === reaction[p.id])[1])}</span> : <><ThumbsUp size={18} />{t('Like', 'লাইক', 'लाइक', 'Thích')}</>}
                    </Tap>
                    <Tap className="fb-action" act="open_comments" onClick={() => nav.push('comments', { id: p.id })} explain={T('Comment: write a reply. Comments may be public.', 'কমেন্ট: উত্তর লিখুন। কমেন্ট সবাই দেখতে পারে।', 'कमेंट: जवाब लिखें। कमेंट सबको दिख सकते हैं।', 'Bình luận: viết trả lời. Bình luận có thể công khai.')}><MessageCircle size={18} />{t('Comment', 'কমেন্ট', 'कमेंट', 'Bình luận')}</Tap>
                    <Tap className="fb-action" act="open_share" onClick={() => setShareFor(p)} explain={T('Share: puts this post on your own page. Check it is true first.', 'শেয়ার: পোস্টটি আপনার নিজের পেজে দেয়। আগে দেখে নিন সত্যি কি না।', 'शेयर: यह पोस्ट आपके पेज पर डालता है। पहले जांचें कि सच है।', 'Chia sẻ: đăng lại lên trang của bạn. Kiểm tra có thật không trước.')}><Share2 size={18} />{t('Share', 'শেয়ার', 'शेयर', 'Chia sẻ')}</Tap>
                  </div>
                  {picker === p.id && (
                    <div className="fb-reactions" role="group" aria-label={t('Reactions', 'রিঅ্যাকশন', 'रिएक्शन', 'Cảm xúc')}>
                      {REACTIONS.map(([key, label]) => <Tap key={key} className="fb-reaction" act={`react_${key} react_post`} onClick={() => react(p.id, key)} label={t(...label)}><Reaction kind={key} size={38} /></Tap>)}
                    </div>
                  )}
                </article>
              ))}
            </>
          )}
          {tab === 'friends' && (
            <div className="sim-pad">
              <p className="fb-h">{t('Friend requests', 'ফ্রেন্ড রিকোয়েস্ট', 'फ्रेंड रिक्वेस्ट', 'Lời mời kết bạn')}</p>
              {requests.length === 0 && <p style={{ color: '#65676b' }}>{t('No new requests.', 'নতুন কোনো রিকোয়েস্ট নেই।', 'कोई नई रिक्वेस्ट नहीं।', 'Không có lời mời mới.')}</p>}
              {requests.includes('meena') && (
                <div className="fb-request">
                  <span className="sim-avatar" style={{ background: '#ffb74d' }}>M</span>
                  <span className="sim-row-main">
                    <span className="sim-row-title">{t('Meena (neighbour)', 'মীনা (প্রতিবেশী)', 'मीना (पड़ोसी)', 'Mai (hàng xóm)')}</span>
                    <span className="sim-row-sub">12 {t('mutual friends', 'মিউচুয়াল ফ্রেন্ড', 'कॉमन दोस्त', 'bạn chung')}</span>
                    <span className="fb-req-btns">
                      <Tap className="fb-btn-blue" act="confirm_request" onClick={() => { setRequests((r) => r.filter((x) => x !== 'meena')); showToast(t('You are now friends.', 'আপনারা এখন বন্ধু।', 'अब आप दोस्त हैं।', 'Hai bạn đã là bạn bè.')); }}>{t('Confirm', 'কনফার্ম', 'कन्फ़र्म', 'Xác nhận')}</Tap>
                      <Tap className="fb-btn-grey" onClick={() => setRequests((r) => r.filter((x) => x !== 'meena'))}>{t('Delete', 'ডিলিট', 'डिलीट', 'Xóa')}</Tap>
                    </span>
                  </span>
                </div>
              )}
              {requests.includes('copy') && (
                <div className="fb-request">
                  <span className="sim-avatar" style={{ background: '#64b5f6' }}>R</span>
                  <span className="sim-row-main">
                    <Tap className="sim-row-title fb-name-link" act="open_request_profile" onClick={() => nav.push('profile')} explain={T('Tap the name to see their profile before deciding.', 'সিদ্ধান্তের আগে নামে চেপে প্রোফাইল দেখুন।', 'फैसले से पहले नाम पर टैप करके प्रोफ़ाइल देखें।', 'Chạm vào tên để xem trang cá nhân trước khi quyết định.')}>{t('Rahim (Son)', 'রহিম (ছেলে)', 'राहुल (बेटा)', 'Minh (con trai)')}</Tap>
                    <span className="sim-row-sub">0 {t('mutual friends', 'মিউচুয়াল ফ্রেন্ড', 'कॉमन दोस्त', 'bạn chung')} · {t('You are already friends with a Rahim', 'রহিম নামে একজন আগেই আপনার বন্ধু', 'राहुल नाम का एक दोस्त पहले से है', 'Bạn đã kết bạn với một Minh khác')}</span>
                    <span className="fb-req-btns">
                      <Tap className="fb-btn-blue" act="mistake_confirm_copy" onClick={() => showToast(t('Careful! Your son is already your friend. A second account is often a copy made by scammers. Check his profile first.', 'সাবধান! আপনার ছেলে আগেই আপনার বন্ধু। দ্বিতীয় অ্যাকাউন্ট প্রায়ই প্রতারকদের বানানো নকল। আগে প্রোফাইল দেখুন।', 'सावधान! आपका बेटा पहले से दोस्त है। दूसरा खाता अक्सर धोखेबाज़ों की नकल होता है। पहले प्रोफ़ाइल देखें।', 'Cẩn thận! Con trai đã là bạn của bạn. Tài khoản thứ hai thường là bản giả. Hãy xem trang cá nhân trước.'), 5200)}>{t('Confirm', 'কনফার্ম', 'कन्फ़र्म', 'Xác nhận')}</Tap>
                      <Tap className="fb-btn-grey" act="delete_request" onClick={() => setRequests((r) => r.filter((x) => x !== 'copy'))}>{t('Delete', 'ডিলিট', 'डिलीट', 'Xóa')}</Tap>
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
          {tab === 'video' && <p className="sim-pad" style={{ color: '#65676b' }}>{t('Videos from pages and friends play here. Tap a video to watch; it may use a lot of data.', 'পেজ ও বন্ধুদের ভিডিও এখানে চলে। দেখতে ভিডিওতে চাপুন; অনেক ডেটা খরচ হতে পারে।', 'पेज और दोस्तों के वीडियो यहां चलते हैं। देखने के लिए टैप करें; बहुत डेटा लग सकता है।', 'Video từ trang và bạn bè phát ở đây. Có thể tốn nhiều dữ liệu.')}</p>}
          {tab === 'market' && <p className="sim-pad sim-safety"><ShieldAlert size={16} />{t('Marketplace: buy and sell locally. Meet in public places and never pay in advance to strangers.', 'মার্কেটপ্লেস: এলাকায় কেনাবেচা। প্রকাশ্য জায়গায় দেখা করুন, অচেনা কাউকে আগে টাকা দেবেন না।', 'मार्केटप्लेस: आसपास खरीद-बिक्री। सार्वजनिक जगह मिलें, अनजान को पहले पैसे न दें।', 'Marketplace: mua bán gần nhà. Gặp ở nơi công cộng và không trả trước cho người lạ.')}</p>}
          {tab === 'notifications' && (
            <div>
              {[[T('Rupa shared a new photo.', 'রূপা নতুন ছবি শেয়ার করেছে।', 'रूपा ने नई फोटो शेयर की।', 'Lan vừa đăng ảnh mới.'), '#e57373'], [T('Meena sent you a friend request.', 'মীনা আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছে।', 'मीना ने आपको फ्रेंड रिक्वेस्ट भेजी।', 'Mai gửi lời mời kết bạn.'), '#ffb74d'], [T('Today is Rahim\'s birthday.', 'আজ রহিমের জন্মদিন।', 'आज राहुल का जन्मदिन है।', 'Hôm nay là sinh nhật Minh.'), '#64b5f6']].map(([text, color], i) => (
                <div key={i} className="sim-row"><span className="sim-avatar sm" style={{ background: color }}><Bell size={16} /></span><span className="sim-row-main"><span className="sim-row-sub" style={{ color: '#050505', whiteSpace: 'normal' }}>{t(...text)}</span></span></div>
              ))}
            </div>
          )}
          {tab === 'menu' && (
            <div className="sim-pad sim-stack">
              <Tap className="fb-menu-row" act="open_saved" onClick={() => nav.push('saved')}><Bookmark size={22} color="#8e24aa" />{t('Saved', 'সেভ করা', 'सेव किए', 'Đã lưu')} <ChevronRight size={18} /></Tap>
              <Tap className="fb-menu-row" act="open_privacy" onClick={() => nav.push('privacy')} explain={T('Settings & privacy: choose who sees your posts and who can send requests.', 'সেটিংস ও প্রাইভেসি: কে পোস্ট দেখবে আর কে রিকোয়েস্ট পাঠাবে ঠিক করুন।', 'सेटिंग्स और प्राइवेसी: कौन पोस्ट देखे और कौन रिक्वेस्ट भेजे तय करें।', 'Cài đặt & quyền riêng tư: chọn ai xem bài và ai gửi lời mời.')}><Settings size={22} color="#65676b" />{t('Settings & privacy', 'সেটিংস ও প্রাইভেসি', 'सेटिंग्स और प्राइवेसी', 'Cài đặt & quyền riêng tư')} <ChevronRight size={18} /></Tap>
            </div>
          )}
        </div>
      </Screen>

      <Sheet open={Boolean(menuFor)} onClose={() => setMenuFor(null)}>
        {[
          ['save_post', Bookmark, T('Save post', 'পোস্ট সেভ করুন', 'पोस्ट सेव करें', 'Lưu bài viết'), T('Add this to your saved items.', 'সেভ করা তালিকায় রাখুন।', 'सेव की गई चीज़ों में जोड़ें।', 'Thêm vào mục đã lưu.'), () => { setSaved((s) => [...new Set([...s, menuFor.id])]); showToast(t('Saved. Find it in Menu → Saved.', 'সেভ হয়েছে। মেনু → সেভ করা-তে পাবেন।', 'सेव हो गया। मेनू → सेव किए में मिलेगा।', 'Đã lưu. Xem trong Menu → Đã lưu.')); }],
          ['hide_post', EyeOff, T('Hide post', 'পোস্ট হাইড করুন', 'पोस्ट हाइड करें', 'Ẩn bài viết'), T('See fewer posts like this.', 'এ ধরনের পোস্ট কম দেখবেন।', 'ऐसी पोस्ट कम दिखेंगी।', 'Ít thấy bài như thế này hơn.'), () => setHidden((h) => [...h, menuFor.id])],
          ['report_post', Flag, T('Report post', 'পোস্ট রিপোর্ট করুন', 'पोस्ट रिपोर्ट करें', 'Báo cáo bài viết'), T("We won't let them know who reported this.", 'কে রিপোর্ট করেছে তাকে জানানো হবে না।', 'किसने रिपोर्ट की, उन्हें नहीं बताया जाएगा।', 'Họ sẽ không biết ai báo cáo.'), () => setReport({ post: menuFor, reason: null, sent: false })],
        ].map(([act, Icon, title, sub, fn]) => (
          <Tap key={act} className="sim-row" act={act} onClick={() => { fn(); setMenuFor(null); }}>
            <Icon size={22} color={act === 'report_post' ? '#e41e3f' : '#050505'} />
            <span className="sim-row-main"><span className="sim-row-title">{t(...title)}</span><span className="sim-row-sub">{t(...sub)}</span></span>
          </Tap>
        ))}
      </Sheet>

      <Sheet open={Boolean(report)} onClose={() => setReport(null)} title={report?.sent ? t('Thanks for reporting', 'রিপোর্ট করার জন্য ধন্যবাদ', 'रिपोर्ट करने के लिए धन्यवाद', 'Cảm ơn bạn đã báo cáo') : t('Why are you reporting this post?', 'কেন এই পোস্ট রিপোর্ট করছেন?', 'यह पोस्ट क्यों रिपोर्ट कर रहे हैं?', 'Vì sao bạn báo cáo bài viết này?')}>
        {report?.sent ? (
          <div className="sim-stack">
            <p style={{ margin: 0, color: '#65676b' }}>{t('Facebook will review it. You helped protect others from this scam.', 'ফেসবুক এটি দেখবে। আপনি অন্যদের এই প্রতারণা থেকে বাঁচাতে সাহায্য করলেন।', 'फेसबुक इसकी जांच करेगा। आपने दूसरों को इस धोखे से बचाने में मदद की।', 'Facebook sẽ xem xét. Bạn đã giúp người khác tránh trò lừa này.')}</p>
            <Tap className="sim-primary" style={{ background: BLUE }} onClick={() => { setHidden((h) => [...h, report.post.id]); setReport(null); }}>{t('Done', 'হয়ে গেছে', 'हो गया', 'Xong')}</Tap>
          </div>
        ) : (
          <div className="sim-stack" style={{ gap: 6 }}>
            {[['scam', T('Scam, fraud or false information', 'প্রতারণা, জালিয়াতি বা মিথ্যা তথ্য', 'धोखा, जालसाज़ी या झूठी जानकारी', 'Lừa đảo hoặc thông tin sai')], ['spam', T('Spam', 'স্প্যাম', 'स्पैम', 'Spam')], ['other', T('Something else', 'অন্য কিছু', 'कुछ और', 'Vấn đề khác')]].map(([id, label]) => (
              <Tap key={id} className="sim-row fb-reason" aria-pressed={report?.reason === id} act={`choose_reason${id === 'scam' ? ' choose_reason_scam' : ''}`} onClick={() => setReport((r) => ({ ...r, reason: id }))}>
                <span className="sim-row-title">{t(...label)}</span>{report?.reason === id && <Check size={18} color={BLUE} />}
              </Tap>
            ))}
            <Tap className="sim-primary" style={{ background: BLUE, marginTop: 8 }} act="submit_report" disabled={!report?.reason} onClick={() => setReport((r) => ({ ...r, sent: true }))}>{t('Submit', 'জমা দিন', 'जमा करें', 'Gửi')}</Tap>
          </div>
        )}
      </Sheet>

      <Sheet open={Boolean(shareFor)} onClose={() => setShareFor(null)} title={t('Share', 'শেয়ার', 'शेयर', 'Chia sẻ')}>
        {shareFor?.scam && <p className="sim-danger-note" style={{ marginBottom: 10 }}><ShieldAlert size={16} />{t('Stop: this looks like a scam. Sharing it would spread it to your friends.', 'থামুন: এটা প্রতারণা মনে হচ্ছে। শেয়ার করলে আপনার বন্ধুদের কাছেও ছড়াবে।', 'रुकिए: यह धोखा लगता है। शेयर करने से आपके दोस्तों तक फैलेगा।', 'Dừng lại: có vẻ là lừa đảo. Chia sẻ sẽ lan tới bạn bè bạn.')}</p>}
        <div className="sim-stack">
          <Tap className="sim-primary" style={{ background: BLUE }} act="share_now" onClick={() => { setShareFor(null); showToast(t('Shared to your page.', 'আপনার পেজে শেয়ার হয়েছে।', 'आपके पेज पर शेयर हो गया।', 'Đã chia sẻ lên trang của bạn.')); }}><Share2 size={18} /> {t('Share now', 'এখনই শেয়ার', 'अभी शेयर करें', 'Chia sẻ ngay')}</Tap>
          <Tap className="sim-secondary" act="send_in_messenger" onClick={() => { setShareFor(null); showToast(t('Sent in Messenger.', 'মেসেঞ্জারে পাঠানো হয়েছে।', 'मैसेंजर में भेज दिया।', 'Đã gửi qua Messenger.')); }}><Send size={18} /> {t('Send in Messenger', 'মেসেঞ্জারে পাঠান', 'मैसेंजर में भेजें', 'Gửi qua Messenger')}</Tap>
          <Tap className="sim-secondary" style={{ color: '#65676b', borderColor: '#ccd0d5' }} onClick={() => setShareFor(null)}><X size={18} /> {t('Cancel', 'বাতিল', 'रद्द करें', 'Hủy')}</Tap>
        </div>
      </Sheet>
    </div>
  );
}

function Composer({ t, nav, onPost }) {
  const { emit } = useSim();
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [audience, setAudience] = useState('public');
  const [choose, setChoose] = useState(false);
  const AUD = { public: [Globe, T('Public', 'পাবলিক', 'पब्लिक', 'Công khai'), T('Anyone on or off Facebook', 'ফেসবুকের ভেতরে-বাইরে যে কেউ', 'फेसबुक पर या बाहर कोई भी', 'Bất kỳ ai')], friends: [Users, T('Friends', 'ফ্রেন্ডস', 'फ्रेंड्स', 'Bạn bè'), T('Your friends on Facebook', 'ফেসবুকে আপনার বন্ধুরা', 'फेसबुक पर आपके दोस्त', 'Bạn bè của bạn trên Facebook')], only_me: [Lock, T('Only me', 'শুধু আমি', 'सिर्फ़ मैं', 'Chỉ mình tôi'), T('Only you can see it', 'শুধু আপনিই দেখবেন', 'सिर्फ़ आप देख सकते हैं', 'Chỉ bạn thấy')] };
  const [AIcon, alabel] = AUD[audience];
  return (
    <div className="fb" style={{ background: '#fff' }}>
      <StatusBar bg="#fff" />
      <AppBar bg="#fff" fg="#050505" onBack={nav.back} title={t('Create post', 'পোস্ট তৈরি করুন', 'पोस्ट बनाएं', 'Tạo bài viết')}
        actions={<Tap className="fb-post-btn" act="publish_post" disabled={!text.trim() && !photo} onClick={() => onPost({ text, photo, audience })} explain={T('Post: publishes it. Check the photo and audience first.', 'পোস্ট: প্রকাশ করে দেয়। আগে ছবি আর কে দেখবে মিলিয়ে নিন।', 'पोस्ट: प्रकाशित कर देता है। पहले फोटो और कौन देखेगा जांचें।', 'Đăng: đăng bài. Kiểm tra ảnh và người xem trước.')}>{t('Post', 'পোস্ট', 'पोस्ट', 'Đăng')}</Tap>} />
      <div className="sim-scroll sim-pad sim-stack">
        <div className="sim-row" style={{ padding: 0 }}>
          <span className="sim-avatar sm" style={{ background: '#8e24aa' }}>A</span>
          <span className="sim-row-main"><span className="sim-row-title">{t('You', 'আপনি', 'आप', 'Bạn')}</span>
            <Tap className="fb-aud" act="open_audience" onClick={() => setChoose(true)} explain={T('Who can see this post. "Friends" is safer than "Public" for family photos.', 'কে এই পোস্ট দেখবে। পারিবারিক ছবির জন্য "পাবলিক"-এর চেয়ে "ফ্রেন্ডস" নিরাপদ।', 'यह पोस्ट कौन देखेगा। पारिवारिक फोटो के लिए "पब्लिक" से "फ्रेंड्स" सुरक्षित है।', 'Ai xem được bài này. Với ảnh gia đình, "Bạn bè" an toàn hơn "Công khai".')}><AIcon size={13} /> {t(...alabel)} ▾</Tap>
          </span>
        </div>
        <textarea className="fb-textarea" value={text} onChange={(e) => { if (!text && e.target.value) emit('type_post'); setText(e.target.value); }} data-act="type_post" placeholder={t("What's on your mind?", 'আপনার মনে কী আছে?', 'आपके मन में क्या है?', 'Bạn đang nghĩ gì?')} />
        {photo ? <Photo kind={photo.kind} className="fb-photo" style={{ borderRadius: 10 }} size={56} /> : null}
        <div className="fb-add">
          <Tap className="sim-row" act="add_photo" onClick={() => { setPhoto({ kind: 'garden' }); emit('pick_photo'); }} explain={T('Photo: add a picture from your gallery.', 'ছবি: গ্যালারি থেকে ছবি যোগ করুন।', 'फोटो: गैलरी से फोटो जोड़ें।', 'Ảnh: thêm ảnh từ thư viện.')}><ImageIcon size={22} color="#45bd62" /><span className="sim-row-title">{t('Photo/video', 'ছবি/ভিডিও', 'फोटो/वीडियो', 'Ảnh/video')}</span></Tap>
          <Tap className="sim-row" onClick={() => setText((v) => (v.includes('—') ? v : `${v} — ${t('feeling thankful', 'কৃতজ্ঞ বোধ করছি', 'आभारी महसूस कर रही हूं', 'cảm thấy biết ơn')}`))}><Smile size={22} color="#f7b928" /><span className="sim-row-title">{t('Feeling/activity', 'অনুভূতি/কাজ', 'भावना/गतिविधि', 'Cảm xúc/hoạt động')}</span></Tap>
        </div>
      </div>
      <Sheet open={choose} onClose={() => setChoose(false)} title={t('Who can see your post?', 'আপনার পোস্ট কে দেখতে পাবে?', 'आपकी पोस्ट कौन देख सकता है?', 'Ai xem được bài của bạn?')}>
        {Object.entries(AUD).map(([id, [Icon, label, sub]]) => (
          <Tap key={id} className="sim-row fb-reason" aria-pressed={audience === id} act={`choose_audience choose_${id}`} onClick={() => { setAudience(id); setChoose(false); }}>
            <Icon size={22} /><span className="sim-row-main"><span className="sim-row-title">{t(...label)}</span><span className="sim-row-sub">{t(...sub)}</span></span>{audience === id && <Check size={18} color={BLUE} />}
          </Tap>
        ))}
      </Sheet>
    </div>
  );
}

function Comments({ t, nav, post }) {
  const { emit } = useSim();
  const [text, setText] = useState('');
  const [list, setList] = useState([{ who: t('Meena', 'মীনা', 'मीना', 'Mai'), text: t('So lovely!', 'খুব সুন্দর!', 'बहुत प्यारा!', 'Dễ thương quá!') }]);
  return (
    <div className="fb" style={{ background: '#fff' }}>
      <StatusBar bg="#fff" />
      <AppBar bg="#fff" fg="#050505" onBack={nav.back} title={t('Comments', 'কমেন্ট', 'कमेंट', 'Bình luận')} />
      <div className="sim-scroll sim-pad sim-stack">
        <p style={{ margin: 0, color: '#65676b' }}>{post?.text}</p>
        {list.map((c, i) => <div key={i} className="fb-comment"><strong>{c.who}</strong><span>{c.text}</span></div>)}
      </div>
      <p className="sim-safety" style={{ margin: '0 12px 6px' }}><ShieldAlert size={15} />{t('Comments can be public. Never write your phone number, address or PIN.', 'কমেন্ট সবাই দেখতে পারে। ফোন নম্বর, ঠিকানা বা পিন লিখবেন না।', 'कमेंट सबको दिख सकते हैं। फोन नंबर, पता या पिन न लिखें।', 'Bình luận có thể công khai. Đừng ghi số điện thoại, địa chỉ hay PIN.')}</p>
      <div className="fb-comment-bar">
        <input className="sim-field" data-act="type_comment" value={text} onChange={(e) => { if (!text && e.target.value) emit('type_comment'); setText(e.target.value); }} placeholder={t('Write a comment…', 'কমেন্ট লিখুন…', 'कमेंट लिखें…', 'Viết bình luận…')} />
        <Tap className="sim-icon-btn" style={{ color: BLUE }} act="send_comment" disabled={!text.trim()} onClick={() => { setList((l) => [...l, { who: t('You', 'আপনি', 'आप', 'Bạn'), text }]); setText(''); }} label={t('Send', 'পাঠান', 'भेजें', 'Gửi')}><Send size={22} /></Tap>
      </div>
    </div>
  );
}

function SuspiciousProfile({ t, nav, onDelete }) {
  return (
    <div className="fb" style={{ background: '#fff' }}>
      <StatusBar bg="#fff" />
      <AppBar bg="#fff" fg="#050505" onBack={nav.back} title={t('Rahim (Son)', 'রহিম (ছেলে)', 'राहुल (बेटा)', 'Minh (con trai)')} />
      <div className="sim-scroll">
        <div className="fb-cover" />
        <div className="sim-pad sim-stack">
          <span className="sim-avatar lg" style={{ background: '#64b5f6', marginTop: -60, border: '4px solid #fff' }}>R</span>
          <p className="fb-h" style={{ margin: 0 }}>{t('Rahim (Son)', 'রহিম (ছেলে)', 'राहुल (बेटा)', 'Minh (con trai)')}</p>
          <div className="sim-danger-note"><ShieldAlert size={16} /><span>{t('Warning signs: joined 2 days ago · 1 photo · 0 mutual friends · your real son is already your friend.', 'সতর্ক সংকেত: ২ দিন আগে খোলা · ১টি ছবি · ০ মিউচুয়াল ফ্রেন্ড · আপনার আসল ছেলে আগেই বন্ধু।', 'चेतावनी: 2 दिन पहले बना · 1 फोटो · 0 कॉमन दोस्त · आपका असली बेटा पहले से दोस्त है।', 'Dấu hiệu: tạo 2 ngày trước · 1 ảnh · 0 bạn chung · con trai thật đã là bạn của bạn.')}</span></div>
          <p style={{ margin: 0, color: '#65676b' }}>{t('This is very likely a copied account. Delete the request and call your son on his usual number.', 'এটা সম্ভবত নকল অ্যাকাউন্ট। রিকোয়েস্ট মুছে দিন আর ছেলেকে তার চেনা নম্বরে ফোন করুন।', 'यह बहुत संभव है कि नकली खाता है। रिक्वेस्ट डिलीट करें और बेटे को उसके पुराने नंबर पर फोन करें।', 'Rất có thể đây là tài khoản giả. Xóa lời mời và gọi con theo số quen thuộc.')}</p>
          <Tap className="sim-primary" style={{ background: '#e4e6eb', color: '#050505' }} act="delete_request" onClick={onDelete}><UserCheck size={18} /> {t('Delete request', 'রিকোয়েস্ট ডিলিট করুন', 'रिक्वेस्ट डिलीट करें', 'Xóa lời mời')}</Tap>
        </div>
      </div>
    </div>
  );
}

function Privacy({ t, nav }) {
  const { emit, showToast } = useSim();
  const [posts, setPosts] = useState('public');
  const [requests, setRequests] = useState('everyone');
  return (
    <div className="fb" style={{ background: '#f0f2f5' }}>
      <StatusBar bg="#fff" />
      <AppBar bg="#fff" fg="#050505" onBack={nav.back} title={t('Settings & privacy', 'সেটিংস ও প্রাইভেসি', 'सेटिंग्स और प्राइवेसी', 'Cài đặt & quyền riêng tư')} />
      <div className="sim-scroll sim-pad sim-stack">
        <p className="sim-label">{t('Who can see your future posts?', 'আপনার ভবিষ্যতের পোস্ট কে দেখবে?', 'आपकी आगे की पोस्ट कौन देखेगा?', 'Ai xem được bài viết sau này?')}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['public', T('Public', 'পাবলিক', 'पब्लिक', 'Công khai')], ['friends', T('Friends', 'ফ্রেন্ডস', 'फ्रेंड्स', 'Bạn bè')]].map(([id, label]) => (
            <Tap key={id} className="sim-chip" aria-pressed={posts === id} act={`privacy_posts_${id}`} onClick={() => { setPosts(id); if (id === 'friends') { emit('privacy_friends'); showToast(t('Saved: only friends will see new posts.', 'সেভ হয়েছে: নতুন পোস্ট শুধু বন্ধুরা দেখবে।', 'सेव हुआ: नई पोस्ट सिर्फ़ दोस्त देखेंगे।', 'Đã lưu: chỉ bạn bè thấy bài mới.')); } }}>{t(...label)}</Tap>
          ))}
        </div>
        <p className="sim-label">{t('Who can send you friend requests?', 'কে আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠাতে পারবে?', 'कौन आपको फ्रेंड रिक्वेस्ट भेज सकता है?', 'Ai được gửi lời mời kết bạn?')}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['everyone', T('Everyone', 'সবাই', 'सभी', 'Mọi người')], ['fof', T('Friends of friends', 'বন্ধুর বন্ধু', 'दोस्तों के दोस्त', 'Bạn của bạn bè')]].map(([id, label]) => (
            <Tap key={id} className="sim-chip" aria-pressed={requests === id} act={`privacy_requests_${id}`} onClick={() => setRequests(id)}>{t(...label)}</Tap>
          ))}
        </div>
        <p className="sim-safety"><Lock size={16} />{t('"Friends" and "Friends of friends" keep strangers and scammers further away.', '"ফ্রেন্ডস" আর "বন্ধুর বন্ধু" দিলে অচেনা মানুষ ও প্রতারক দূরে থাকে।', '"फ्रेंड्स" और "दोस्तों के दोस्त" से अनजान लोग और धोखेबाज़ दूर रहते हैं।', '"Bạn bè" và "Bạn của bạn bè" giúp tránh người lạ và kẻ gian.')}</p>
      </div>
    </div>
  );
}

