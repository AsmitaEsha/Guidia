import {
  ArrowDownToLine, ArrowLeftRight, Archive, Ban, Calendar, CalendarCheck, Camera, CirclePlus, Clock, Eye, Flag,
  Globe, Heart, History, Image, Inbox, Lock, Mail, Menu, MessageCircle, Mic, MoreVertical, Package, Paperclip,
  Pencil, Phone, Plus, QrCode, Receipt, Reply, Search, Send, Share2, ShieldAlert, ShieldCheck,
  ShoppingCart, Smartphone, SmilePlus, Star, Tag, ThumbsUp, Trash2, Undo2, UserPlus, Users, Video, Wallet, Zap,
} from 'lucide-react';

// Button guides for every practice app. Each button is drawn as it looks in
// the real app (see ButtonReplica), with:
//   level — safe | check | careful   (how careful to be; shown with words)
//   does  — a few words: exactly what pressing it does
//   desc  — where to find it and what happens next
// Labels are [en, bn, hi, vi] for t().

const T = (en, bn, hi, vi) => [en, bn, hi, vi];

// ── WhatsApp ────────────────────────────────────────────────────────────
const WA = '#25D366';
const waBar = (active) => ({
  type: 'bar', canvas: '#efeae2', bg: '#fff', fg: '#54656f', accent: WA, items: [
    { icon: SmilePlus }, { label: 'Message', fg: '#8696a0' }, { icon: Paperclip, active: active === 'clip' }, { icon: Camera, active: active === 'cam' },
    { icon: Mic, round: true, active: active === 'mic' },
  ],
});

const whatsapp = {
  name: 'WhatsApp',
  sections: [
    {
      title: T('In a chat', 'চ্যাটের ভেতরে', 'चैट के अंदर', 'Trong cuộc trò chuyện'),
      buttons: [
        { replica: waBar('clip'), level: 'safe', name: T('Paperclip (attach)', 'পেপারক্লিপ (সংযুক্ত করুন)', 'पेपरक्लिप (अटैच)', 'Kẹp giấy (đính kèm)'),
          does: T('Opens photos, documents and location to send', 'ছবি, ডকুমেন্ট আর লোকেশন পাঠানোর মেনু খোলে', 'फोटो, डॉक्यूमेंट और लोकेशन भेजने का मेनू खोलता है', 'Mở ảnh, tài liệu và vị trí để gửi'),
          desc: T('Inside the message box, next to the camera. Tapping it only opens a menu — nothing is sent until you pick something and press the green arrow.', 'মেসেজের ঘরের ভেতরে, ক্যামেরার পাশে। চাপলে শুধু একটা মেনু খোলে — কিছু বেছে নিয়ে সবুজ তীর না চাপলে কিছুই যায় না।', 'मैसेज बॉक्स के अंदर, कैमरे के बगल में। दबाने पर बस एक मेनू खुलता है — कुछ चुनकर हरा तीर दबाए बिना कुछ नहीं जाता।', 'Nằm trong ô tin nhắn, cạnh máy ảnh. Chạm vào chỉ mở menu — chưa có gì được gửi cho đến khi bạn chọn và bấm mũi tên xanh.') },
        { replica: waBar('cam'), level: 'safe', name: T('Camera', 'ক্যামেরা', 'कैमरा', 'Máy ảnh'),
          does: T('Takes a new photo to send', 'নতুন ছবি তুলে পাঠাতে দেয়', 'नई फोटो खींचकर भेजने देता है', 'Chụp ảnh mới để gửi'),
          desc: T('Tap it, take the picture, and you get a chance to look before sending.', 'চেপে ছবি তুলুন, পাঠানোর আগে দেখে নেওয়ার সুযোগ পাবেন।', 'दबाकर फोटो लें, भेजने से पहले देखने का मौका मिलेगा।', 'Chạm vào, chụp ảnh, bạn sẽ được xem lại trước khi gửi.') },
        { replica: waBar('mic'), level: 'safe', name: T('Microphone (voice message)', 'মাইক্রোফোন (ভয়েস মেসেজ)', 'माइक (वॉइस मैसेज)', 'Micro (tin nhắn thoại)'),
          does: T('Records your voice while you hold it', 'চেপে ধরে রাখলে আপনার কথা রেকর্ড করে', 'दबाकर रखने पर आपकी आवाज़ रिकॉर्ड करता है', 'Ghi âm giọng bạn khi giữ nút'),
          desc: T('Press and hold, speak, then let go to send. Slide left before letting go to cancel.', 'চেপে ধরে কথা বলুন, ছেড়ে দিলে চলে যাবে। বাতিল করতে ছাড়ার আগে বাঁদিকে টানুন।', 'दबाकर बोलें, छोड़ते ही चला जाएगा। रद्द करना हो तो छोड़ने से पहले बाईं ओर खिसकाएं।', 'Nhấn giữ, nói, rồi thả tay để gửi. Muốn hủy thì vuốt sang trái trước khi thả.') },
        { replica: { type: 'button', canvas: '#efeae2', shape: 'round', bg: WA, icon: Send }, level: 'check', name: T('Send (green arrow)', 'সেন্ড (সবুজ তীর)', 'भेजें (हरा तीर)', 'Gửi (mũi tên xanh)'),
          does: T('Sends your message or photo', 'আপনার মেসেজ বা ছবি পাঠিয়ে দেয়', 'आपका मैसेज या फोटो भेज देता है', 'Gửi tin nhắn hoặc ảnh của bạn'),
          desc: T('Appears once you start typing. Read your message first — after a while it cannot be taken back.', 'লেখা শুরু করলেই দেখা যায়। আগে মেসেজটা পড়ে নিন — কিছুক্ষণ পর আর ফেরানো যায় না।', 'लिखना शुरू करते ही दिखता है। पहले मैसेज पढ़ लें — थोड़ी देर बाद वापस नहीं लिया जा सकता।', 'Xuất hiện khi bạn bắt đầu gõ. Đọc lại trước — sau một lúc sẽ không thu hồi được.') },
      ],
    },
    {
      title: T('Top of a chat', 'চ্যাটের ওপরে', 'चैट के ऊपर', 'Phía trên cuộc trò chuyện'),
      buttons: [
        { replica: { type: 'bar', canvas: '#efeae2', bg: '#075E54', fg: '#fff', radius: 0, items: [{ label: 'Rupa', fg: '#fff' }, { icon: Video, active: true }, { icon: Phone }, { icon: MoreVertical }] }, level: 'safe',
          name: T('Video call', 'ভিডিও কল', 'वीडियो कॉल', 'Gọi video'),
          does: T('Calls them with video', 'ভিডিওসহ কল করে', 'वीडियो के साथ कॉल करता है', 'Gọi có hình'),
          desc: T('The camera icon at the top right. They can see you once they answer.', 'ওপরে ডানদিকের ক্যামেরা চিহ্ন। তিনি ধরলে আপনাকে দেখতে পাবেন।', 'ऊपर दाईं ओर कैमरे का निशान। उठाते ही वे आपको देख सकेंगे।', 'Biểu tượng máy quay ở góc trên phải. Họ nghe máy là thấy bạn.') },
        { replica: { type: 'bar', canvas: '#efeae2', bg: '#075E54', fg: '#fff', radius: 0, items: [{ label: 'Rupa', fg: '#fff' }, { icon: Video }, { icon: Phone, active: true }, { icon: MoreVertical }] }, level: 'safe',
          name: T('Voice call', 'ভয়েস কল', 'वॉइस कॉल', 'Gọi thoại'),
          does: T('Calls them, voice only', 'শুধু কথা বলার কল করে', 'सिर्फ़ आवाज़ वाली कॉल करता है', 'Gọi chỉ có tiếng'),
          desc: T('The phone icon. Free over Wi-Fi; uses a little mobile data otherwise.', 'ফোনের চিহ্ন। ওয়াইফাইয়ে ফ্রি; নইলে অল্প মোবাইল ডেটা লাগে।', 'फोन का निशान। वाईफ़ाई पर मुफ़्त; वरना थोड़ा मोबाइल डेटा लगता है।', 'Biểu tượng điện thoại. Miễn phí khi dùng Wi-Fi; nếu không sẽ tốn chút dữ liệu.') },
      ],
    },
    {
      title: T('Staying safe', 'নিরাপদ থাকা', 'सुरक्षित रहना', 'Giữ an toàn'),
      buttons: [
        { replica: { type: 'button', shape: 'rect', bg: '#fff', fg: '#ea0038', border: '#ea0038', icon: Ban, label: 'Block' }, level: 'careful',
          name: T('Block', 'ব্লক', 'ब्लॉक', 'Chặn'),
          does: T('Stops this person contacting you', 'এই মানুষটি আর যোগাযোগ করতে পারবে না', 'यह व्यक्ति आपसे संपर्क नहीं कर पाएगा', 'Người này không liên lạc được với bạn nữa'),
          desc: T('Tap their name at the top, scroll down to Block. Use it for scammers. You can unblock later.', 'ওপরে নামে চেপে নিচে Block পর্যন্ত যান। প্রতারকদের জন্য ব্যবহার করুন। পরে আনব্লক করা যায়।', 'ऊपर नाम पर टैप करके नीचे Block तक जाएं। धोखेबाज़ों के लिए इस्तेमाल करें। बाद में अनब्लॉक कर सकते हैं।', 'Chạm tên ở trên, kéo xuống Chặn. Dùng cho kẻ lừa đảo. Có thể bỏ chặn sau.') },
        { replica: { type: 'button', shape: 'rect', bg: '#fff', fg: '#ea0038', border: '#ea0038', icon: Flag, label: 'Report' }, level: 'check',
          name: T('Report', 'রিপোর্ট', 'रिपोर्ट', 'Báo cáo'),
          does: T('Tells WhatsApp about a scam or abuse', 'প্রতারণা বা হয়রানির কথা হোয়াটসঅ্যাপকে জানায়', 'धोखे या परेशान करने की बात व्हाट्सऐप को बताता है', 'Báo WhatsApp về lừa đảo hoặc quấy rối'),
          desc: T('Next to Block. WhatsApp sees the last few messages, not your whole chat history.', 'Block-এর পাশে। হোয়াটসঅ্যাপ শুধু শেষ কয়েকটা মেসেজ দেখে, পুরো চ্যাট নয়।', 'Block के पास। व्हाट्सऐप सिर्फ़ आख़िरी कुछ मैसेज देखता है, पूरी चैट नहीं।', 'Cạnh nút Chặn. WhatsApp chỉ xem vài tin nhắn cuối, không phải toàn bộ.') },
        { replica: { type: 'button', shape: 'rect', bg: '#fff', fg: '#ea0038', border: '#ea0038', icon: Trash2, label: 'Delete for everyone' }, level: 'careful',
          name: T('Delete for everyone', 'সবার জন্য মুছুন', 'सबके लिए डिलीट', 'Xóa với mọi người'),
          does: T('Removes a message you sent from both phones', 'আপনার পাঠানো মেসেজ দুই ফোন থেকেই মুছে দেয়', 'आपका भेजा मैसेज दोनों फोन से हटा देता है', 'Xóa tin bạn đã gửi khỏi cả hai điện thoại'),
          desc: T('Press and hold your message, tap the bin, then this. Only works for a short time after sending.', 'নিজের মেসেজ চেপে ধরে বিনের চিহ্নে চাপুন, তারপর এটি। পাঠানোর অল্প সময়ের মধ্যেই কাজ করে।', 'अपना मैसेज दबाकर रखें, कूड़ेदान पर टैप करें, फिर यह। भेजने के थोड़ी देर बाद तक ही काम करता है।', 'Nhấn giữ tin của bạn, chạm thùng rác, rồi chọn mục này. Chỉ làm được trong thời gian ngắn sau khi gửi.') },
      ],
    },
  ],
};

// ── Facebook ────────────────────────────────────────────────────────────
const FB = '#1877F2';
const fbActions = (active) => ({
  type: 'bar', canvas: '#f0f2f5', bg: '#fff', fg: '#65676b', radius: 10, items: [
    { icon: ThumbsUp, label: 'Like', active: active === 'like', fg: active === 'like' ? FB : undefined },
    { icon: MessageCircle, label: 'Comment', active: active === 'comment' },
    { icon: Share2, label: 'Share', active: active === 'share' },
  ],
});
const facebook = {
  name: 'Facebook',
  sections: [
    {
      title: T('Under every post', 'প্রতিটি পোস্টের নিচে', 'हर पोस्ट के नीचे', 'Dưới mỗi bài viết'),
      buttons: [
        { replica: fbActions('like'), level: 'safe', name: T('Like', 'লাইক', 'लाइक', 'Thích'),
          does: T('Shows you liked the post', 'পোস্টটি পছন্দ হয়েছে জানায়', 'बताता है कि पोस्ट पसंद आई', 'Cho biết bạn thích bài viết'),
          desc: T('Tap once to like. Press and hold to choose Love, Care, Haha, Wow, Sad or Angry. Tap again to undo.', 'একবার চাপলে লাইক। চেপে ধরে রাখলে লাভ, কেয়ার, হাহা, ওয়াও, স্যাড বা অ্যাংরি বেছে নিতে পারবেন। আবার চাপলে ফিরে যায়।', 'एक बार टैप करें तो लाइक। दबाकर रखें तो लव, केयर, हाहा, वाओ, सैड या एंग्री चुनें। फिर टैप करें तो हट जाता है।', 'Chạm một lần để thích. Nhấn giữ để chọn Yêu thích, Thương thương, Haha, Wow, Buồn hoặc Phẫn nộ. Chạm lại để bỏ.') },
        { replica: fbActions('comment'), level: 'check', name: T('Comment', 'কমেন্ট', 'कमेंट', 'Bình luận'),
          does: T('Writes a reply everyone on the post can read', 'এমন উত্তর লেখে যা পোস্টের সবাই পড়তে পারে', 'ऐसा जवाब लिखता है जो पोस्ट पर सब पढ़ सकते हैं', 'Viết trả lời mà ai xem bài cũng đọc được'),
          desc: T('Comments are often public. Never write a phone number, address or PIN in one.', 'কমেন্ট প্রায়ই সবাই দেখতে পায়। এতে কখনো ফোন নম্বর, ঠিকানা বা পিন লিখবেন না।', 'कमेंट अक्सर सबको दिखते हैं। उनमें कभी फोन नंबर, पता या पिन न लिखें।', 'Bình luận thường công khai. Đừng bao giờ ghi số điện thoại, địa chỉ hay mã PIN.') },
        { replica: fbActions('share'), level: 'check', name: T('Share', 'শেয়ার', 'शेयर', 'Chia sẻ'),
          does: T('Puts this post on your own page for others', 'পোস্টটি আপনার নিজের পেজে অন্যদের জন্য দেয়', 'यह पोस्ट आपके अपने पेज पर दूसरों के लिए डालता है', 'Đăng lại bài này lên trang của bạn cho người khác xem'),
          desc: T('Before sharing, ask: is it true, and where did it come from? Fake news spreads through shares.', 'শেয়ারের আগে ভাবুন: এটা কি সত্যি, কোথা থেকে এসেছে? ভুয়া খবর শেয়ারেই ছড়ায়।', 'शेयर से पहले सोचें: क्या यह सच है, कहां से आया? झूठी खबर शेयर से ही फैलती है।', 'Trước khi chia sẻ, hãy hỏi: có thật không, từ đâu ra? Tin giả lan qua những lượt chia sẻ.') },
      ],
    },
    {
      title: T('Posting', 'পোস্ট করা', 'पोस्ट करना', 'Đăng bài'),
      buttons: [
        { replica: { type: 'button', canvas: '#f0f2f5', shape: 'pill', bg: '#e4e6eb', fg: '#050505', icon: Globe, label: 'Public ▾' }, level: 'check',
          name: T('Who can see this (audience)', 'কে দেখতে পাবে', 'कौन देख सकता है', 'Ai có thể xem'),
          does: T('Chooses who can see your post', 'কে আপনার পোস্ট দেখবে তা ঠিক করে', 'तय करता है कि आपकी पोस्ट कौन देखेगा', 'Chọn ai được xem bài của bạn'),
          desc: T('Under your name when you write a post. "Friends" is safer than "Public" for family photos.', 'পোস্ট লেখার সময় আপনার নামের নিচে থাকে। পারিবারিক ছবির জন্য "Public"-এর চেয়ে "Friends" বেশি নিরাপদ।', 'पोस्ट लिखते समय आपके नाम के नीचे होता है। पारिवारिक फोटो के लिए "Public" से "Friends" ज़्यादा सुरक्षित है।', 'Nằm dưới tên bạn khi viết bài. Với ảnh gia đình, "Bạn bè" an toàn hơn "Công khai".') },
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: FB, icon: null, label: 'Post' }, level: 'check',
          name: T('Post', 'পোস্ট', 'पोस्ट', 'Đăng'),
          does: T('Publishes what you wrote', 'আপনার লেখা প্রকাশ করে দেয়', 'आपका लिखा प्रकाशित कर देता है', 'Đăng nội dung bạn đã viết'),
          desc: T('Check the photo and the audience first. You can delete a post later, but others may have seen it.', 'আগে ছবি আর কে দেখবে মিলিয়ে নিন। পরে মুছতে পারবেন, তবে ততক্ষণে অন্যরা দেখে থাকতে পারে।', 'पहले फोटो और कौन देखेगा जांच लें। बाद में मिटा सकते हैं, पर तब तक दूसरे देख चुके हो सकते हैं।', 'Kiểm tra ảnh và người xem trước. Bạn có thể xóa sau, nhưng người khác có thể đã thấy.') },
      ],
    },
    {
      title: T('Friends and safety', 'বন্ধু ও নিরাপত্তা', 'दोस्त और सुरक्षा', 'Bạn bè và an toàn'),
      buttons: [
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: FB, icon: UserPlus, label: 'Confirm' }, level: 'check',
          name: T('Confirm friend request', 'ফ্রেন্ড রিকোয়েস্ট কনফার্ম', 'फ्रेंड रिक्वेस्ट कन्फ़र्म', 'Xác nhận lời mời kết bạn'),
          does: T('Lets this person see your friends-only posts', 'এই মানুষটি আপনার শুধু-বন্ধুদের পোস্ট দেখতে পাবে', 'यह व्यक्ति आपकी सिर्फ़-दोस्तों वाली पोस्ट देख सकेगा', 'Cho người này xem bài chỉ dành cho bạn bè'),
          desc: T('Only accept people you really know. A second request from an existing friend is a warning sign.', 'যাঁদের সত্যি চেনেন শুধু তাঁদের গ্রহণ করুন। পুরোনো বন্ধুর কাছ থেকে আবার রিকোয়েস্ট এলে সাবধান।', 'सिर्फ़ उन्हें स्वीकार करें जिन्हें सच में जानते हैं। पुराने दोस्त की दोबारा रिक्वेस्ट आए तो सावधान।', 'Chỉ đồng ý với người bạn thật sự quen. Bạn cũ gửi lời mời lần nữa là dấu hiệu đáng ngờ.') },
        { replica: { type: 'bar', canvas: '#fff', bg: '#fff', fg: '#050505', radius: 10, items: [{ label: 'Fake prize post', fg: '#65676b' }, { icon: MoreVertical, active: true }] }, level: 'check',
          name: T('Three dots (more options)', 'তিন ডট (আরও অপশন)', 'तीन बिंदु (और विकल्प)', 'Ba chấm (thêm tùy chọn)'),
          does: T('Opens Save, Hide and Report for a post', 'পোস্টের জন্য সেভ, হাইড আর রিপোর্ট খোলে', 'पोस्ट के लिए सेव, हाइड और रिपोर्ट खोलता है', 'Mở Lưu, Ẩn và Báo cáo cho bài viết'),
          desc: T('At the top right of every post. Choose "Report post" for scams and fake prizes.', 'প্রতিটি পোস্টের ওপরে ডানদিকে। প্রতারণা বা ভুয়া পুরস্কারের জন্য "Report post" বেছে নিন।', 'हर पोस्ट के ऊपर दाईं ओर। धोखे या नकली इनाम के लिए "Report post" चुनें।', 'Ở góc trên phải mỗi bài. Chọn "Báo cáo bài viết" với lừa đảo và giải thưởng giả.') },
        { replica: { type: 'bar', canvas: '#fff', bg: '#fff', fg: '#050505', radius: 0, items: [{ icon: Menu, active: true }, { label: 'Menu' }] }, level: 'safe',
          name: T('Menu (three lines)', 'মেনু (তিনটি দাগ)', 'मेनू (तीन लाइन)', 'Menu (ba gạch)'),
          does: T('Opens settings, privacy and your saved posts', 'সেটিংস, প্রাইভেসি আর সেভ করা পোস্ট খোলে', 'सेटिंग्स, प्राइवेसी और सेव की पोस्ट खोलता है', 'Mở cài đặt, quyền riêng tư và bài đã lưu'),
          desc: T('Go to "Settings & privacy" to check who can see your posts and who can send you requests.', '"Settings & privacy"-তে গিয়ে দেখুন কে আপনার পোস্ট দেখে আর কে রিকোয়েস্ট পাঠাতে পারে।', '"Settings & privacy" में जाकर देखें कौन आपकी पोस्ट देखता है और कौन रिक्वेस्ट भेज सकता है।', 'Vào "Cài đặt & quyền riêng tư" để xem ai thấy bài và ai được gửi lời mời.') },
      ],
    },
  ],
};

// ── Messenger ───────────────────────────────────────────────────────────
const MS = '#0084FF';
const messenger = {
  name: 'Messenger',
  sections: [
    {
      title: T('In a chat', 'চ্যাটের ভেতরে', 'चैट के अंदर', 'Trong cuộc trò chuyện'),
      buttons: [
        { replica: { type: 'bar', canvas: '#fff', bg: '#f0f2f5', fg: MS, items: [{ icon: CirclePlus }, { icon: Camera }, { icon: Image, active: true }, { label: 'Aa', fg: '#65676b' }, { icon: ThumbsUp }] }, level: 'safe',
          name: T('Photo (gallery)', 'ছবি (গ্যালারি)', 'फोटो (गैलरी)', 'Ảnh (thư viện)'),
          does: T('Picks a photo from your phone to send', 'ফোন থেকে পাঠানোর জন্য ছবি বেছে নেয়', 'फोन से भेजने के लिए फोटो चुनता है', 'Chọn ảnh trong máy để gửi'),
          desc: T('The picture icon in the bottom bar. Choose a photo, then tap Send.', 'নিচের বারে ছবির চিহ্ন। ছবি বেছে Send চাপুন।', 'नीचे की पट्टी में फोटो का निशान। फोटो चुनकर Send दबाएं।', 'Biểu tượng ảnh ở thanh dưới. Chọn ảnh rồi chạm Gửi.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'round', bg: '#fff', fg: MS, icon: Send }, level: 'check',
          name: T('Send (paper plane)', 'সেন্ড (কাগজের প্লেন)', 'भेजें (कागज़ का जहाज़)', 'Gửi (máy bay giấy)'),
          does: T('Sends what you typed', 'আপনার লেখা পাঠিয়ে দেয়', 'आपका लिखा भेज देता है', 'Gửi nội dung bạn đã gõ'),
          desc: T('Replaces the thumbs-up once you start typing.', 'লেখা শুরু করলে বুড়ো আঙুলের জায়গায় এটি আসে।', 'लिखना शुरू करते ही अंगूठे की जगह यह आ जाता है।', 'Thay cho nút ngón cái khi bạn bắt đầu gõ.') },
        { replica: { type: 'bar', canvas: '#fff', bg: '#fff', fg: MS, radius: 0, items: [{ label: 'Rupa', fg: '#050505' }, { icon: Phone }, { icon: Video, active: true }] }, level: 'safe',
          name: T('Video call', 'ভিডিও কল', 'वीडियो कॉल', 'Gọi video'),
          does: T('Starts a video call', 'ভিডিও কল শুরু করে', 'वीडियो कॉल शुरू करता है', 'Bắt đầu cuộc gọi video'),
          desc: T('At the top right of the chat, next to the phone.', 'চ্যাটের ওপরে ডানদিকে, ফোনের পাশে।', 'चैट के ऊपर दाईं ओर, फोन के बगल में।', 'Ở góc trên phải cuộc trò chuyện, cạnh điện thoại.') },
      ],
    },
    {
      title: T('Strangers and safety', 'অচেনা মানুষ ও নিরাপত্তা', 'अनजान लोग और सुरक्षा', 'Người lạ và an toàn'),
      buttons: [
        { replica: { type: 'text', fg: MS, label: 'Message requests', icon: Inbox, bg: '#fff' }, level: 'check',
          name: T('Message requests', 'মেসেজ রিকোয়েস্ট', 'मैसेज रिक्वेस्ट', 'Tin nhắn chờ'),
          does: T('Shows messages from people you don\'t know', 'অচেনা মানুষের পাঠানো মেসেজ দেখায়', 'अनजान लोगों के मैसेज दिखाता है', 'Hiện tin nhắn từ người bạn không quen'),
          desc: T('They wait here until you accept. You can delete them without replying.', 'আপনি গ্রহণ না করা পর্যন্ত এখানে থাকে। উত্তর না দিয়েই মুছে দিতে পারেন।', 'आपके स्वीकार करने तक यहीं रहते हैं। बिना जवाब दिए मिटा सकते हैं।', 'Chúng nằm ở đây đến khi bạn đồng ý. Bạn có thể xóa mà không cần trả lời.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: '#fff', fg: '#e41e3f', border: '#e41e3f', icon: Ban, label: 'Block' }, level: 'careful',
          name: T('Block', 'ব্লক', 'ब्लॉक', 'Chặn'),
          does: T('Stops this person messaging or calling you', 'এই মানুষটি আর মেসেজ বা কল করতে পারবে না', 'यह व्यक्ति मैसेज या कॉल नहीं कर पाएगा', 'Người này không nhắn hay gọi cho bạn được nữa'),
          desc: T('Tap their name at the top of the chat, then Block.', 'চ্যাটের ওপরে নামে চেপে Block চাপুন।', 'चैट के ऊपर नाम पर टैप करें, फिर Block।', 'Chạm tên ở đầu cuộc trò chuyện, rồi Chặn.') },
      ],
    },
  ],
};

// ── imo ─────────────────────────────────────────────────────────────────
const IMO = '#1D8CF0';
const imo = {
  name: 'imo',
  sections: [
    {
      title: T('Calls and chats', 'কল ও চ্যাট', 'कॉल और चैट', 'Cuộc gọi và trò chuyện'),
      buttons: [
        { replica: { type: 'bar', canvas: '#f4f8fc', bg: '#fff', fg: IMO, radius: 0, items: [{ label: 'Rupa', fg: '#1f2d3a' }, { icon: Phone }, { icon: Video, active: true }] }, level: 'safe',
          name: T('Video call', 'ভিডিও কল', 'वीडियो कॉल', 'Gọi video'),
          does: T('Calls them with video, free on internet', 'ইন্টারনেটে ফ্রিতে ভিডিও কল করে', 'इंटरनेट पर मुफ़्त वीडियो कॉल करता है', 'Gọi video miễn phí qua mạng'),
          desc: T('The camera icon at the top of a chat. Works even on slow connections.', 'চ্যাটের ওপরে ক্যামেরার চিহ্ন। ধীর ইন্টারনেটেও চলে।', 'चैट के ऊपर कैमरे का निशान। धीमे इंटरनेट पर भी चलता है।', 'Biểu tượng máy quay ở đầu cuộc trò chuyện. Mạng chậm vẫn gọi được.') },
        { replica: { type: 'bar', canvas: '#f4f8fc', bg: '#fff', fg: '#7a8794', items: [{ icon: Plus }, { label: 'Type a message', fg: '#a0aab4' }, { icon: Mic, round: true, bg: IMO, active: true }] }, level: 'safe',
          name: T('Voice message', 'ভয়েস মেসেজ', 'वॉइस मैसेज', 'Tin nhắn thoại'),
          does: T('Records your voice while you hold it', 'চেপে ধরে রাখলে আপনার কথা রেকর্ড করে', 'दबाकर रखने पर आपकी आवाज़ रिकॉर्ड करता है', 'Ghi âm giọng bạn khi giữ nút'),
          desc: T('Hold the blue microphone, speak, then let go to send.', 'নীল মাইক্রোফোন চেপে ধরে কথা বলুন, ছেড়ে দিলে চলে যাবে।', 'नीला माइक दबाकर बोलें, छोड़ते ही चला जाएगा।', 'Giữ nút micro xanh, nói, rồi thả tay để gửi.') },
        { replica: { type: 'bar', canvas: '#f4f8fc', bg: '#fff', fg: '#7a8794', items: [{ icon: Plus, active: true }, { label: 'Type a message', fg: '#a0aab4' }, { icon: Mic, round: true, bg: IMO }] }, level: 'safe',
          name: T('Plus (photos and files)', 'প্লাস (ছবি ও ফাইল)', 'प्लस (फोटो और फ़ाइल)', 'Dấu cộng (ảnh và tệp)'),
          does: T('Opens photos, files and stickers to send', 'ছবি, ফাইল আর স্টিকার পাঠানোর মেনু খোলে', 'फोटो, फ़ाइल और स्टिकर भेजने का मेनू खोलता है', 'Mở ảnh, tệp và nhãn dán để gửi'),
          desc: T('Next to the message box. Choose what to send, then press send.', 'মেসেজের ঘরের পাশে। কী পাঠাবেন বেছে নিয়ে সেন্ড চাপুন।', 'मैसेज बॉक्स के पास। क्या भेजना है चुनें, फिर भेजें दबाएं।', 'Cạnh ô tin nhắn. Chọn thứ cần gửi rồi bấm gửi.') },
      ],
    },
    {
      title: T('Protect your account', 'অ্যাকাউন্ট সুরক্ষা', 'खाते की सुरक्षा', 'Bảo vệ tài khoản'),
      buttons: [
        { replica: { type: 'toggle', on: true, label: 'Privacy lock', bg: IMO }, level: 'safe',
          name: T('Privacy lock', 'প্রাইভেসি লক', 'प्राइवेसी लॉक', 'Khóa riêng tư'),
          does: T('Asks for a code before imo opens', 'imo খোলার আগে কোড চায়', 'imo खुलने से पहले कोड मांगता है', 'Đòi mã trước khi mở imo'),
          desc: T('Settings → Privacy. Stops others reading your chats if they pick up your phone.', 'Settings → Privacy। কেউ ফোন হাতে নিলেও আপনার চ্যাট পড়তে পারবে না।', 'Settings → Privacy। कोई फोन उठा ले तब भी आपकी चैट नहीं पढ़ पाएगा।', 'Cài đặt → Riêng tư. Người khác cầm máy cũng không đọc được tin nhắn.') },
        { replica: { type: 'button', canvas: '#f4f8fc', shape: 'rect', bg: '#fff', fg: '#e5484d', border: '#e5484d', icon: ShieldAlert, label: 'Never share the code' }, level: 'careful',
          name: T('Verification code (SMS)', 'ভেরিফিকেশন কোড (এসএমএস)', 'वेरिफ़िकेशन कोड (एसएमएस)', 'Mã xác minh (SMS)'),
          does: T('Logs into YOUR imo — whoever has it takes over', 'আপনার imo-তে ঢোকে — কোড যার হাতে, অ্যাকাউন্ট তার', 'आपके imo में लॉगिन करता है — कोड जिसके पास, खाता उसका', 'Đăng nhập vào imo CỦA BẠN — ai có mã là chiếm được'),
          desc: T('imo sends this code when someone logs in with your number. If you didn\'t ask for it, someone is trying to steal your account.', 'কেউ আপনার নম্বর দিয়ে লগইন করলে imo এই কোড পাঠায়। আপনি না চাইলে কেউ অ্যাকাউন্ট চুরির চেষ্টা করছে।', 'कोई आपके नंबर से लॉगिन करे तो imo यह कोड भेजता है। आपने नहीं मांगा तो कोई खाता चुराने की कोशिश कर रहा है।', 'imo gửi mã này khi có người đăng nhập bằng số của bạn. Nếu bạn không yêu cầu, ai đó đang cố lấy tài khoản.') },
      ],
    },
  ],
};

// ── Gmail ───────────────────────────────────────────────────────────────
const gmail = {
  name: 'Gmail',
  sections: [
    {
      title: T('Writing email', 'ইমেইল লেখা', 'ईमेल लिखना', 'Viết email'),
      buttons: [
        { replica: { type: 'button', canvas: '#f6f8fc', shape: 'rect', bg: '#c2e7ff', fg: '#001d35', icon: Pencil, label: 'Compose' }, level: 'safe',
          name: T('Compose', 'কম্পোজ', 'कंपोज़', 'Soạn thư'),
          does: T('Starts a new email', 'নতুন ইমেইল লেখা শুরু করে', 'नया ईमेल लिखना शुरू करता है', 'Bắt đầu một email mới'),
          desc: T('The pencil button at the bottom right of your inbox.', 'ইনবক্সের নিচে ডানদিকে পেন্সিলের বোতাম।', 'इनबॉक्स के नीचे दाईं ओर पेंसिल वाला बटन।', 'Nút bút chì ở góc dưới phải hộp thư.') },
        { replica: { type: 'bar', canvas: '#fff', bg: '#fff', fg: '#444746', radius: 0, items: [{ label: 'Compose', fg: '#1f1f1f' }, { icon: Paperclip, active: true }, { icon: Send }] }, level: 'safe',
          name: T('Attach (paperclip)', 'অ্যাটাচ (পেপারক্লিপ)', 'अटैच (पेपरक्लिप)', 'Đính kèm (kẹp giấy)'),
          does: T('Adds a photo or file to your email', 'ইমেইলে ছবি বা ফাইল যোগ করে', 'ईमेल में फोटो या फ़ाइल जोड़ता है', 'Thêm ảnh hoặc tệp vào email'),
          desc: T('At the top while writing. Choose "Attach file" and pick from your phone.', 'লেখার সময় ওপরে থাকে। "Attach file" বেছে ফোন থেকে বাছুন।', 'लिखते समय ऊपर रहता है। "Attach file" चुनकर फोन से चुनें।', 'Ở trên cùng khi đang viết. Chọn "Đính kèm tệp" rồi chọn trong máy.') },
        { replica: { type: 'bar', canvas: '#fff', bg: '#fff', fg: '#444746', radius: 0, items: [{ label: 'Compose', fg: '#1f1f1f' }, { icon: Paperclip }, { icon: Send, active: true, fg: '#0b57d0' }] }, level: 'check',
          name: T('Send', 'সেন্ড', 'भेजें', 'Gửi'),
          does: T('Sends the email', 'ইমেইলটি পাঠিয়ে দেয়', 'ईमेल भेज देता है', 'Gửi email'),
          desc: T('The paper plane at the top. Check the "To" address first — a wrong letter sends it to a stranger.', 'ওপরে কাগজের প্লেন। আগে "To" ঠিকানা মিলিয়ে নিন — একটা অক্ষর ভুল হলে অচেনা কারও কাছে যাবে।', 'ऊपर कागज़ का जहाज़। पहले "To" पता जांचें — एक अक्षर गलत हुआ तो किसी अनजान के पास जाएगा।', 'Máy bay giấy ở trên. Kiểm tra địa chỉ "Tới" trước — sai một chữ là gửi nhầm người lạ.') },
      ],
    },
    {
      title: T('Reading email', 'ইমেইল পড়া', 'ईमेल पढ़ना', 'Đọc email'),
      buttons: [
        { replica: { type: 'button', canvas: '#fff', shape: 'pill', bg: '#fff', fg: '#444746', border: '#c4c7c5', icon: Reply, label: 'Reply' }, level: 'safe',
          name: T('Reply', 'রিপ্লাই', 'रिप्लाई', 'Trả lời'),
          does: T('Writes back to the sender only', 'শুধু প্রেরককে উত্তর লেখে', 'सिर्फ़ भेजने वाले को जवाब लिखता है', 'Trả lời riêng người gửi'),
          desc: T('At the bottom of an email. "Reply all" writes to everyone on the email — use it carefully.', 'ইমেইলের নিচে। "Reply all" ইমেইলের সবাইকে লেখে — সাবধানে ব্যবহার করুন।', 'ईमेल के नीचे। "Reply all" ईमेल के सभी लोगों को लिखता है — सावधानी से इस्तेमाल करें।', 'Ở cuối email. "Trả lời tất cả" sẽ gửi cho mọi người — dùng cẩn thận.') },
        { replica: { type: 'bar', canvas: '#fff', bg: '#fff', fg: '#444746', radius: 0, items: [{ icon: Archive }, { icon: Trash2 }, { icon: Star, active: true, fg: '#f4b400' }] }, level: 'safe',
          name: T('Star', 'স্টার', 'स्टार', 'Gắn dấu sao'),
          does: T('Marks an email so you can find it later', 'ইমেইলে চিহ্ন দেয়, পরে সহজে খুঁজে পাবেন', 'ईमेल पर निशान लगाता है, बाद में आसानी से मिलेगा', 'Đánh dấu để dễ tìm lại'),
          desc: T('Starred emails appear under "Starred" in the menu.', 'স্টার দেওয়া ইমেইল মেনুর "Starred"-এ পাবেন।', 'स्टार वाले ईमेल मेनू में "Starred" में मिलेंगे।', 'Email gắn sao nằm trong mục "Có gắn dấu sao".') },
        { replica: { type: 'bar', canvas: '#fff', bg: '#fff', fg: '#444746', radius: 0, items: [{ icon: Archive, active: true }, { icon: Trash2 }, { icon: Mail }] }, level: 'safe',
          name: T('Archive', 'আর্কাইভ', 'आर्काइव', 'Lưu trữ'),
          does: T('Tidies an email away without deleting it', 'না মুছে ইমেইলটি সরিয়ে রাখে', 'बिना मिटाए ईमेल हटा कर रखता है', 'Cất email đi mà không xóa'),
          desc: T('The box with a down arrow. Find it again with the search bar.', 'নিচের দিকে তীরওয়ালা বাক্স। সার্চে আবার খুঁজে পাবেন।', 'नीचे तीर वाला डिब्बा। सर्च से फिर मिल जाएगा।', 'Hộp có mũi tên xuống. Tìm lại bằng ô tìm kiếm.') },
      ],
    },
    {
      title: T('Fake emails', 'ভুয়া ইমেইল', 'नकली ईमेल', 'Email giả'),
      buttons: [
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: '#fef7e0', fg: '#8a5a00', border: '#f9ab00', icon: ShieldAlert, label: 'Report spam' }, level: 'safe',
          name: T('Report spam', 'স্প্যাম রিপোর্ট', 'स्पैम रिपोर्ट', 'Báo cáo thư rác'),
          does: T('Moves it to Spam and warns Gmail', 'স্প্যামে সরায় আর জিমেইলকে সতর্ক করে', 'स्पैम में भेजता है और जीमेल को सावधान करता है', 'Chuyển vào Thư rác và báo cho Gmail'),
          desc: T('Three dots at the top of the email → Report spam. Similar emails will be caught next time.', 'ইমেইলের ওপরে তিন ডট → Report spam। পরের বার এমন ইমেইল আটকে যাবে।', 'ईमेल के ऊपर तीन बिंदु → Report spam। अगली बार ऐसे ईमेल रुक जाएंगे।', 'Ba chấm ở đầu email → Báo cáo thư rác. Lần sau thư tương tự sẽ bị chặn.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: '#fce8e6', fg: '#a50e0e', border: '#d93025', icon: ShieldAlert, label: 'This message seems dangerous' }, level: 'careful',
          name: T('Red warning banner', 'লাল সতর্কবার্তা', 'लाल चेतावनी', 'Biểu ngữ cảnh báo đỏ'),
          does: T('Gmail thinks this email is a scam', 'জিমেইল মনে করছে এটা প্রতারণা', 'जीमेल को लगता है यह धोखा है', 'Gmail cho rằng email này là lừa đảo'),
          desc: T('Don\'t tap links or open attachments in it. Delete it, or ask Guidia to check.', 'এর লিংকে চাপবেন না, ফাইলও খুলবেন না। মুছে দিন, বা Guidia-কে যাচাই করতে বলুন।', 'इसके लिंक न दबाएं, फ़ाइल न खोलें। मिटा दें, या Guidia से जांच करवाएं।', 'Đừng chạm link hay mở tệp đính kèm. Hãy xóa, hoặc nhờ Guidia kiểm tra.') },
      ],
    },
  ],
};

// ── bKash ───────────────────────────────────────────────────────────────
const BK = '#E2136E';
const bkTile = (icon, label) => ({ type: 'tile', canvas: '#fdf2f7', bg: BK, icon, label });
const bkash = {
  name: 'bKash',
  sections: [
    {
      title: T('Home screen', 'হোম স্ক্রিন', 'होम स्क्रीन', 'Màn hình chính'),
      buttons: [
        { replica: bkTile(Send, 'Send Money'), level: 'check', name: T('Send Money', 'সেন্ড মানি', 'सेंड मनी', 'Gửi tiền'),
          does: T('Sends money to another bKash number', 'অন্য বিকাশ নম্বরে টাকা পাঠায়', 'दूसरे bKash नंबर पर पैसे भेजता है', 'Chuyển tiền tới số bKash khác'),
          desc: T('You will check the name, number and amount before your PIN is asked for.', 'পিন চাওয়ার আগে নাম, নম্বর আর টাকার পরিমাণ মিলিয়ে নেওয়ার সুযোগ পাবেন।', 'पिन मांगे जाने से पहले नाम, नंबर और रकम जांचने का मौका मिलेगा।', 'Bạn sẽ được kiểm tra tên, số và số tiền trước khi nhập PIN.') },
        { replica: bkTile(Smartphone, 'Mobile Recharge'), level: 'check', name: T('Mobile Recharge', 'মোবাইল রিচার্জ', 'मोबाइल रिचार्ज', 'Nạp tiền điện thoại'),
          does: T('Tops up talk time or data', 'টকটাইম বা ডেটা রিচার্জ করে', 'टॉकटाइम या डेटा रिचार्ज करता है', 'Nạp tiền gọi hoặc dữ liệu'),
          desc: T('Choose the number and operator, type the amount, confirm with your PIN.', 'নম্বর আর অপারেটর বেছে টাকা লিখুন, পিন দিয়ে নিশ্চিত করুন।', 'नंबर और ऑपरेटर चुनें, रकम लिखें, पिन से पुष्टि करें।', 'Chọn số và nhà mạng, nhập số tiền, xác nhận bằng PIN.') },
        { replica: bkTile(ArrowDownToLine, 'Cash Out'), level: 'check', name: T('Cash Out', 'ক্যাশ আউট', 'कैश आउट', 'Rút tiền mặt'),
          does: T('Turns bKash money into cash at an agent', 'এজেন্টের কাছ থেকে বিকাশের টাকা নগদ তোলে', 'एजेंट से bKash के पैसे नकद निकालता है', 'Đổi tiền bKash thành tiền mặt tại đại lý'),
          desc: T('There is a small fee. Type the agent number shown in their shop — never one given on the phone.', 'অল্প চার্জ লাগে। দোকানে লেখা এজেন্ট নম্বর দিন — ফোনে কেউ বললে সেই নম্বর নয়।', 'थोड़ा शुल्क लगता है। दुकान में लिखा एजेंट नंबर डालें — फोन पर बताया गया नंबर नहीं।', 'Có một khoản phí nhỏ. Nhập số đại lý ghi tại cửa hàng — đừng dùng số ai đó đọc qua điện thoại.') },
        { replica: { type: 'button', canvas: '#fdf2f7', shape: 'pill', bg: '#fff', fg: BK, border: BK, icon: Eye, label: 'Tap for Balance' }, level: 'safe',
          name: T('Tap for Balance', 'ট্যাপ ফর ব্যালেন্স', 'टैप फ़ॉर बैलेंस', 'Chạm để xem số dư'),
          does: T('Shows your balance for a few seconds', 'কয়েক সেকেন্ডের জন্য ব্যালেন্স দেখায়', 'कुछ सेकंड के लिए बैलेंस दिखाता है', 'Hiện số dư trong vài giây'),
          desc: T('At the top of the app. It hides again by itself, so others can\'t read it.', 'অ্যাপের ওপরে। নিজে থেকেই আবার লুকিয়ে যায়, যাতে অন্যরা না দেখে।', 'ऐप के ऊपर। अपने आप फिर छिप जाता है, ताकि दूसरे न देखें।', 'Ở trên cùng ứng dụng. Tự ẩn lại để người khác không đọc được.') },
      ],
    },
    {
      title: T('Confirming a payment', 'পেমেন্ট নিশ্চিত করা', 'भुगतान की पुष्टि', 'Xác nhận thanh toán'),
      buttons: [
        { replica: { type: 'input', canvas: '#fdf2f7', placeholder: '• • • • •', icon: Lock, fg: BK }, level: 'careful',
          name: T('PIN box', 'পিনের ঘর', 'पिन बॉक्स', 'Ô nhập PIN'),
          does: T('Your PIN approves the payment', 'আপনার পিন পেমেন্টের অনুমতি দেয়', 'आपका पिन भुगतान को मंज़ूरी देता है', 'Mã PIN của bạn chấp thuận thanh toán'),
          desc: T('Only type your PIN inside the real bKash app, with nobody watching. bKash never asks for it on a call or in a link.', 'শুধু আসল বিকাশ অ্যাপের ভেতরে, কেউ না দেখে এমনভাবে পিন দিন। বিকাশ কখনো ফোনে বা লিংকে পিন চায় না।', 'पिन सिर्फ़ असली bKash ऐप के अंदर, बिना किसी के देखे डालें। bKash कभी फोन या लिंक पर पिन नहीं मांगता।', 'Chỉ nhập PIN trong ứng dụng bKash thật, không để ai nhìn. bKash không bao giờ hỏi PIN qua điện thoại hay đường link.') },
        { replica: { type: 'button', canvas: '#fdf2f7', shape: 'pill', bg: BK, icon: null, label: 'Tap and hold to confirm', size: 'lg' }, level: 'careful',
          name: T('Tap and hold to confirm', 'চেপে ধরে নিশ্চিত করুন', 'दबाकर रखें और पुष्टि करें', 'Nhấn giữ để xác nhận'),
          does: T('Sends the money — it cannot be undone', 'টাকা পাঠিয়ে দেয় — আর ফেরানো যায় না', 'पैसे भेज देता है — वापस नहीं होते', 'Chuyển tiền đi — không hoàn tác được'),
          desc: T('The last step. Holding it on purpose stops accidental payments.', 'শেষ ধাপ। ইচ্ছে করে চেপে ধরতে হয়, তাই ভুল করে টাকা যায় না।', 'आख़िरी कदम। जानबूझकर दबाकर रखना होता है, इसलिए गलती से पैसे नहीं जाते।', 'Bước cuối cùng. Phải cố ý giữ nút nên không chuyển nhầm được.') },
        { replica: bkTile(History, 'Statement'), level: 'safe', name: T('Statement', 'স্টেটমেন্ট', 'स्टेटमेंट', 'Sao kê'),
          does: T('Lists every payment you made', 'আপনার প্রতিটি লেনদেনের তালিকা দেখায়', 'आपके हर भुगतान की सूची दिखाता है', 'Liệt kê mọi giao dịch của bạn'),
          desc: T('Check it after paying. Report anything you don\'t recognise on 16247.', 'পেমেন্টের পরে দেখে নিন। অচেনা কিছু দেখলে ১৬২৪৭-এ জানান।', 'भुगतान के बाद देख लें। कुछ अनजान दिखे तो 16247 पर बताएं।', 'Xem lại sau khi thanh toán. Thấy giao dịch lạ hãy báo tới 16247.') },
      ],
    },
  ],
};

// ── Nagad ───────────────────────────────────────────────────────────────
const NG = '#EC1C24';
const ngTile = (icon, label) => ({ type: 'tile', canvas: '#fff4ef', bg: '#F7941D', icon, label });
const nagad = {
  name: 'Nagad',
  sections: [
    {
      title: T('Home screen', 'হোম স্ক্রিন', 'होम स्क्रीन', 'Màn hình chính'),
      buttons: [
        { replica: ngTile(Send, 'Send Money'), level: 'check', name: T('Send Money', 'সেন্ড মানি', 'सेंड मनी', 'Gửi tiền'),
          does: T('Sends money to another Nagad number', 'অন্য নগদ নম্বরে টাকা পাঠায়', 'दूसरे Nagad नंबर पर पैसे भेजता है', 'Chuyển tiền tới số Nagad khác'),
          desc: T('Check the name Nagad shows for the number before you enter your PIN.', 'পিন দেওয়ার আগে নম্বরের জন্য নগদ যে নাম দেখায় তা মিলিয়ে নিন।', 'पिन डालने से पहले नंबर के लिए Nagad जो नाम दिखाता है, वह जांच लें।', 'Kiểm tra tên Nagad hiển thị cho số đó trước khi nhập PIN.') },
        { replica: ngTile(ArrowDownToLine, 'Cash Out'), level: 'check', name: T('Cash Out', 'ক্যাশ আউট', 'कैश आउट', 'Rút tiền mặt'),
          does: T('Withdraws cash at a Nagad agent', 'নগদ এজেন্টের কাছ থেকে টাকা তোলে', 'Nagad एजेंट से नकद निकालता है', 'Rút tiền mặt tại đại lý Nagad'),
          desc: T('Use the agent number displayed in the shop.', 'দোকানে লেখা এজেন্ট নম্বর ব্যবহার করুন।', 'दुकान में लिखा एजेंट नंबर इस्तेमाल करें।', 'Dùng số đại lý ghi tại cửa hàng.') },
        { replica: ngTile(Smartphone, 'Mobile Recharge'), level: 'check', name: T('Mobile Recharge', 'মোবাইল রিচার্জ', 'मोबाइल रिचार्ज', 'Nạp tiền điện thoại'),
          does: T('Tops up a phone number', 'ফোন নম্বরে রিচার্জ করে', 'फोन नंबर पर रिचार्ज करता है', 'Nạp tiền cho số điện thoại'),
          desc: T('Choose the number, operator and amount, then confirm with your PIN.', 'নম্বর, অপারেটর আর টাকা বেছে পিন দিয়ে নিশ্চিত করুন।', 'नंबर, ऑपरेटर और रकम चुनें, फिर पिन से पुष्टि करें।', 'Chọn số, nhà mạng và số tiền, rồi xác nhận bằng PIN.') },
        { replica: { type: 'button', canvas: '#fff4ef', shape: 'pill', bg: '#fff', fg: NG, border: NG, icon: Eye, label: 'Tap for Balance' }, level: 'safe',
          name: T('Tap for Balance', 'ট্যাপ ফর ব্যালেন্স', 'टैप फ़ॉर बैलेंस', 'Chạm để xem số dư'),
          does: T('Shows your balance for a moment', 'কিছুক্ষণের জন্য ব্যালেন্স দেখায়', 'थोड़ी देर के लिए बैलेंस दिखाता है', 'Hiện số dư trong giây lát'),
          desc: T('At the top. It hides again by itself.', 'ওপরে থাকে। নিজে থেকেই আবার লুকিয়ে যায়।', 'ऊपर रहता है। अपने आप फिर छिप जाता है।', 'Ở trên cùng. Tự ẩn lại.') },
      ],
    },
    {
      title: T('Codes and PIN', 'কোড ও পিন', 'कोड और पिन', 'Mã và PIN'),
      buttons: [
        { replica: { type: 'input', canvas: '#fff4ef', placeholder: 'OTP • • • • • •', icon: ShieldAlert, fg: NG }, level: 'careful',
          name: T('OTP code (SMS)', 'ওটিপি কোড (এসএমএস)', 'ओटीपी कोड (एसएमएस)', 'Mã OTP (SMS)'),
          does: T('A one-time key to your account — keep it secret', 'আপনার অ্যাকাউন্টের এককালীন চাবি — গোপন রাখুন', 'आपके खाते की एक बार की चाबी — गुप्त रखें', 'Chìa khóa dùng một lần vào tài khoản — giữ bí mật'),
          desc: T('Nagad staff never ask for it. Anyone calling for your OTP is trying to empty your account — hang up.', 'নগদের কর্মীরা কখনো এটা চান না। যে ফোন করে ওটিপি চায়, সে আপনার টাকা নিতে চায় — ফোন কেটে দিন।', 'Nagad के कर्मचारी कभी यह नहीं मांगते। जो फोन करके ओटीपी मांगे, वह आपका खाता खाली करना चाहता है — फोन काट दें।', 'Nhân viên Nagad không bao giờ hỏi mã này. Ai gọi xin OTP là muốn lấy sạch tiền — hãy cúp máy.') },
        { replica: { type: 'button', canvas: '#fff4ef', shape: 'pill', bg: NG, icon: null, label: 'Confirm', size: 'lg' }, level: 'careful',
          name: T('Confirm with PIN', 'পিন দিয়ে নিশ্চিত করুন', 'पिन से पुष्टि', 'Xác nhận bằng PIN'),
          does: T('Sends the money — it cannot be undone', 'টাকা পাঠিয়ে দেয় — আর ফেরানো যায় না', 'पैसे भेज देता है — वापस नहीं होते', 'Chuyển tiền đi — không hoàn tác được'),
          desc: T('Read the summary once more before you press it.', 'চাপার আগে সারসংক্ষেপটা আরেকবার পড়ে নিন।', 'दबाने से पहले सारांश एक बार और पढ़ लें।', 'Đọc lại phần tóm tắt một lần nữa trước khi bấm.') },
      ],
    },
  ],
};

// ── MoMo ────────────────────────────────────────────────────────────────
const MM = '#A50064';
const mmTile = (icon, label) => ({ type: 'tile', canvas: '#fcf1f7', bg: MM, icon, label });
const momo = {
  name: 'MoMo',
  sections: [
    {
      title: T('Home screen', 'হোম স্ক্রিন', 'होम स्क्रीन', 'Màn hình chính'),
      buttons: [
        { replica: mmTile(ArrowLeftRight, 'Chuyển tiền'), level: 'check', name: T('Transfer (Chuyển tiền)', 'ট্রান্সফার (Chuyển tiền)', 'ट्रांसफ़र (Chuyển tiền)', 'Chuyển tiền'),
          does: T('Sends money to another wallet or bank', 'অন্য ওয়ালেট বা ব্যাংকে টাকা পাঠায়', 'दूसरे वॉलेट या बैंक में पैसे भेजता है', 'Chuyển tiền tới ví hoặc ngân hàng khác'),
          desc: T('MoMo shows the receiver\'s name. Check it is the right person before confirming.', 'মোমো প্রাপকের নাম দেখায়। নিশ্চিত করার আগে ঠিক মানুষ কি না দেখে নিন।', 'MoMo पाने वाले का नाम दिखाता है। पुष्टि से पहले देख लें कि सही व्यक्ति है।', 'MoMo hiện tên người nhận. Kiểm tra đúng người trước khi xác nhận.') },
        { replica: mmTile(Receipt, 'Thanh toán hóa đơn'), level: 'check', name: T('Pay bills', 'বিল পরিশোধ', 'बिल भुगतान', 'Thanh toán hóa đơn'),
          does: T('Pays electricity, water or internet bills', 'বিদ্যুৎ, পানি বা ইন্টারনেটের বিল দেয়', 'बिजली, पानी या इंटरनेट का बिल भरता है', 'Trả tiền điện, nước hoặc internet'),
          desc: T('Type the customer code from your paper bill; MoMo shows the amount due.', 'কাগজের বিলের গ্রাহক কোড লিখুন; মোমো বকেয়া টাকা দেখাবে।', 'कागज़ के बिल का ग्राहक कोड लिखें; MoMo बकाया रकम दिखाएगा।', 'Nhập mã khách hàng trên hóa đơn giấy; MoMo hiện số tiền cần trả.') },
        { replica: mmTile(QrCode, 'Quét mã'), level: 'check', name: T('Scan QR (Quét mã)', 'কিউআর স্ক্যান (Quét mã)', 'QR स्कैन (Quét mã)', 'Quét mã'),
          does: T('Pays a shop by scanning its code', 'দোকানের কোড স্ক্যান করে পেমেন্ট করে', 'दुकान का कोड स्कैन करके भुगतान करता है', 'Trả tiền cửa hàng bằng cách quét mã'),
          desc: T('Check the shop name on screen matches where you are.', 'স্ক্রিনের দোকানের নাম আর আপনি যেখানে আছেন, মিলিয়ে নিন।', 'स्क्रीन पर दुकान का नाम और जहां आप हैं, मिलान करें।', 'Kiểm tra tên cửa hàng trên màn hình đúng nơi bạn đang đứng.') },
        { replica: { type: 'button', canvas: '#fcf1f7', shape: 'pill', bg: '#fff', fg: MM, border: MM, icon: Eye, label: '••••• đ' }, level: 'safe',
          name: T('Show balance (eye)', 'ব্যালেন্স দেখান (চোখ)', 'बैलेंस दिखाएं (आंख)', 'Hiện số dư (con mắt)'),
          does: T('Shows or hides your balance', 'ব্যালেন্স দেখায় বা লুকায়', 'बैलेंस दिखाता या छिपाता है', 'Hiện hoặc ẩn số dư'),
          desc: T('Hide it again before you hand your phone to anyone.', 'কারও হাতে ফোন দেওয়ার আগে আবার লুকিয়ে দিন।', 'किसी को फोन देने से पहले फिर छिपा दें।', 'Ẩn lại trước khi đưa điện thoại cho người khác.') },
        { replica: mmTile(History, 'Lịch sử'), level: 'safe', name: T('History (Lịch sử)', 'হিস্ট্রি (Lịch sử)', 'हिस्ट्री (Lịch sử)', 'Lịch sử'),
          does: T('Lists every payment with date and time', 'তারিখ-সময়সহ প্রতিটি লেনদেন দেখায়', 'तारीख और समय के साथ हर भुगतान दिखाता है', 'Liệt kê mọi giao dịch kèm ngày giờ'),
          desc: T('Look here if you\'re unsure whether a payment went through.', 'পেমেন্ট হয়েছে কি না নিশ্চিত না হলে এখানে দেখুন।', 'भुगतान हुआ या नहीं, पक्का न हो तो यहां देखें।', 'Xem ở đây nếu không chắc giao dịch đã thành công.') },
      ],
    },
  ],
};

// ── Google Pay ──────────────────────────────────────────────────────────
const GP = '#1a73e8';
const googlepay = {
  name: 'Google Pay',
  sections: [
    {
      title: T('Paying', 'পেমেন্ট করা', 'भुगतान करना', 'Thanh toán'),
      buttons: [
        { replica: { type: 'button', canvas: '#fff', shape: 'pill', bg: '#d3e3fd', fg: '#041e49', icon: QrCode, label: 'Scan any QR code' }, level: 'check',
          name: T('Scan any QR code', 'যেকোনো কিউআর স্ক্যান', 'कोई भी QR स्कैन', 'Quét mã QR bất kỳ'),
          does: T('Pays a shop by scanning its code', 'দোকানের কোড স্ক্যান করে পেমেন্ট করে', 'दुकान का कोड स्कैन करके भुगतान करता है', 'Trả tiền cửa hàng bằng cách quét mã'),
          desc: T('Check the shop name before you enter the amount.', 'টাকা লেখার আগে দোকানের নাম মিলিয়ে নিন।', 'रकम डालने से पहले दुकान का नाम जांच लें।', 'Kiểm tra tên cửa hàng trước khi nhập số tiền.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'pill', bg: '#d3e3fd', fg: '#041e49', icon: Users, label: 'Pay contacts' }, level: 'check',
          name: T('Pay contacts', 'কন্টাক্টকে পেমেন্ট', 'कॉन्टैक्ट को भुगतान', 'Thanh toán cho người liên hệ'),
          does: T('Sends money to someone in your contacts', 'কন্টাক্টের কাউকে টাকা পাঠায়', 'कॉन्टैक्ट में किसी को पैसे भेजता है', 'Chuyển tiền cho người trong danh bạ'),
          desc: T('Shows their name and bank before you pay. Check both.', 'পেমেন্টের আগে নাম আর ব্যাংক দেখায়। দুটোই মিলিয়ে নিন।', 'भुगतान से पहले नाम और बैंक दिखाता है। दोनों जांचें।', 'Hiện tên và ngân hàng trước khi trả. Hãy kiểm tra cả hai.') },
        { replica: { type: 'input', canvas: '#fff', placeholder: 'ENTER UPI PIN  • • • •', icon: Lock, fg: GP }, level: 'careful',
          name: T('UPI PIN', 'ইউপিআই পিন', 'UPI पिन', 'Mã PIN UPI'),
          does: T('Approves money LEAVING your account', 'আপনার অ্যাকাউন্ট থেকে টাকা যাওয়ার অনুমতি দেয়', 'आपके खाते से पैसे जाने की मंज़ूरी देता है', 'Chấp thuận tiền RA khỏi tài khoản'),
          desc: T('You never need it to receive money. Anyone who says "enter your PIN to get money" is a scammer.', 'টাকা পাওয়ার জন্য কখনো লাগে না। কেউ "টাকা পেতে পিন দিন" বললে সে প্রতারক।', 'पैसे पाने के लिए कभी नहीं लगता। कोई कहे "पैसे पाने के लिए पिन डालो" तो वह धोखेबाज़ है।', 'Nhận tiền không bao giờ cần PIN. Ai bảo "nhập PIN để nhận tiền" là kẻ lừa đảo.') },
      ],
    },
    {
      title: T('Requests and balance', 'রিকোয়েস্ট ও ব্যালেন্স', 'रिक्वेस्ट और बैलेंस', 'Yêu cầu và số dư'),
      buttons: [
        { replica: { type: 'bar', canvas: '#fff', bg: '#fff', fg: '#1f1f1f', radius: 12, items: [{ label: 'Request ₹2,000', fg: '#1f1f1f' }, { label: 'Decline', fg: '#b3261e', active: true }, { label: 'Pay', fg: GP }] }, level: 'careful',
          name: T('Money request (Decline / Pay)', 'টাকার রিকোয়েস্ট (Decline / Pay)', 'पैसे की रिक्वेस्ट (Decline / Pay)', 'Yêu cầu tiền (Từ chối / Trả)'),
          does: T('"Pay" SENDS your money to them', '"Pay" চাপলে আপনার টাকা তাঁর কাছে চলে যায়', '"Pay" दबाने पर आपके पैसे उनके पास चले जाते हैं', 'Bấm "Trả" là bạn GỬI tiền cho họ'),
          desc: T('A request from a stranger is not a gift or refund. Press Decline.', 'অচেনা কারও রিকোয়েস্ট উপহার বা রিফান্ড নয়। Decline চাপুন।', 'अनजान की रिक्वेस्ट तोहफ़ा या रिफ़ंड नहीं है। Decline दबाएं।', 'Yêu cầu từ người lạ không phải quà hay hoàn tiền. Hãy bấm Từ chối.') },
        { replica: { type: 'text', fg: GP, icon: Wallet, label: 'Check bank balance', bg: '#fff' }, level: 'safe',
          name: T('Check bank balance', 'ব্যাংক ব্যালেন্স দেখুন', 'बैंक बैलेंस देखें', 'Kiểm tra số dư ngân hàng'),
          does: T('Shows how much is in your bank account', 'ব্যাংক অ্যাকাউন্টে কত আছে দেখায়', 'बैंक खाते में कितना है दिखाता है', 'Hiện số tiền trong tài khoản ngân hàng'),
          desc: T('Asks for your UPI PIN. Nothing is paid.', 'ইউপিআই পিন চায়। কোনো টাকা যায় না।', 'UPI पिन मांगता है। कोई भुगतान नहीं होता।', 'Sẽ hỏi PIN UPI. Không có khoản nào bị trả.') },
      ],
    },
  ],
};

// ── PayPal ──────────────────────────────────────────────────────────────
const PP = '#003087';
const paypal = {
  name: 'PayPal',
  sections: [
    {
      title: T('Sending money', 'টাকা পাঠানো', 'पैसे भेजना', 'Gửi tiền'),
      buttons: [
        { replica: { type: 'button', canvas: '#f5f7fa', shape: 'pill', bg: PP, icon: Send, label: 'Send' }, level: 'check',
          name: T('Send', 'সেন্ড', 'भेजें', 'Gửi'),
          does: T('Starts sending money to an email or phone', 'ইমেইল বা ফোনে টাকা পাঠানো শুরু করে', 'ईमेल या फोन पर पैसे भेजना शुरू करता है', 'Bắt đầu gửi tiền tới email hoặc số điện thoại'),
          desc: T('Type the address exactly as the person gave it to you.', 'মানুষটি যেভাবে দিয়েছেন হুবহু সেভাবে ঠিকানা লিখুন।', 'पता बिल्कुल वैसा ही लिखें जैसा व्यक्ति ने दिया है।', 'Nhập địa chỉ đúng như người đó đã đưa.') },
        { replica: { type: 'bar', canvas: '#f5f7fa', bg: '#fff', fg: PP, radius: 12, items: [{ icon: Heart, label: 'Sending to a friend', active: true }, { icon: Tag, label: 'Paying for an item' }] }, level: 'check',
          name: T('Friend or purchase?', 'বন্ধু না কেনাকাটা?', 'दोस्त या खरीदारी?', 'Bạn bè hay mua hàng?'),
          does: T('Decides whether you are protected', 'আপনি সুরক্ষা পাবেন কি না ঠিক করে', 'तय करता है कि आपको सुरक्षा मिलेगी या नहीं', 'Quyết định bạn có được bảo vệ hay không'),
          desc: T('"Friend" is for family only. When buying from a seller, choose "Paying for an item" so you can get your money back if something goes wrong.', '"Friend" শুধু পরিবারের জন্য। বিক্রেতার কাছ থেকে কিনলে "Paying for an item" বেছে নিন, সমস্যা হলে টাকা ফেরত পাবেন।', '"Friend" सिर्फ़ परिवार के लिए। विक्रेता से खरीदें तो "Paying for an item" चुनें, गड़बड़ हुई तो पैसे वापस मिलेंगे।', '"Bạn bè" chỉ dành cho người thân. Khi mua hàng, hãy chọn "Thanh toán hàng hóa" để được hoàn tiền nếu có sự cố.') },
        { replica: { type: 'button', canvas: '#f5f7fa', shape: 'pill', bg: '#0070e0', icon: null, label: 'Send Now', size: 'lg' }, level: 'careful',
          name: T('Send Now', 'সেন্ড নাউ', 'सेंड नाउ', 'Gửi ngay'),
          does: T('Sends the money', 'টাকা পাঠিয়ে দেয়', 'पैसे भेज देता है', 'Chuyển tiền đi'),
          desc: T('Check the name, amount and fee shown above it first.', 'আগে ওপরের নাম, টাকা আর ফি মিলিয়ে নিন।', 'पहले ऊपर दिखाया नाम, रकम और शुल्क जांचें।', 'Kiểm tra tên, số tiền và phí phía trên trước.') },
      ],
    },
    {
      title: T('Checking your account', 'অ্যাকাউন্ট দেখা', 'खाता देखना', 'Kiểm tra tài khoản'),
      buttons: [
        { replica: { type: 'text', fg: PP, icon: Clock, label: 'Activity', bg: '#fff' }, level: 'safe',
          name: T('Activity', 'অ্যাক্টিভিটি', 'एक्टिविटी', 'Hoạt động'),
          does: T('Lists every payment in and out', 'আসা-যাওয়া সব লেনদেন দেখায়', 'आने-जाने वाले सारे भुगतान दिखाता है', 'Liệt kê mọi khoản vào và ra'),
          desc: T('Tap one you don\'t recognise and choose "Report a problem".', 'অচেনা কোনোটিতে চেপে "Report a problem" বেছে নিন।', 'किसी अनजान भुगतान पर टैप करके "Report a problem" चुनें।', 'Chạm vào khoản lạ và chọn "Báo cáo sự cố".') },
      ],
    },
  ],
};

// ── Amazon ──────────────────────────────────────────────────────────────
const amazon = {
  name: 'Amazon',
  sections: [
    {
      title: T('Buying', 'কেনাকাটা', 'खरीदना', 'Mua hàng'),
      buttons: [
        { replica: { type: 'input', canvas: '#232f3e', placeholder: 'Search Amazon', icon: Search, fg: '#232f3e' }, level: 'safe',
          name: T('Search', 'সার্চ', 'सर्च', 'Tìm kiếm'),
          does: T('Finds products by name', 'নাম দিয়ে পণ্য খোঁজে', 'नाम से सामान ढूंढता है', 'Tìm sản phẩm theo tên'),
          desc: T('At the top of every screen. Type what you want, e.g. "reading glasses".', 'প্রতিটি স্ক্রিনের ওপরে। যা চান লিখুন, যেমন "reading glasses"।', 'हर स्क्रीन के ऊपर। जो चाहिए लिखें, जैसे "reading glasses"।', 'Ở trên mỗi màn hình. Gõ thứ bạn muốn, ví dụ "kính đọc sách".') },
        { replica: { type: 'button', canvas: '#fff', shape: 'pill', bg: '#FFD814', fg: '#0f1111', icon: ShoppingCart, label: 'Add to Cart' }, level: 'safe',
          name: T('Add to Cart', 'অ্যাড টু কার্ট', 'ऐड टू कार्ट', 'Thêm vào giỏ'),
          does: T('Puts it in your basket — nothing is paid yet', 'ঝুড়িতে রাখে — এখনো টাকা যায় না', 'टोकरी में डालता है — अभी पैसे नहीं जाते', 'Bỏ vào giỏ — chưa trả tiền'),
          desc: T('You can remove items from the cart any time.', 'কার্ট থেকে যেকোনো সময় জিনিস সরাতে পারবেন।', 'कार्ट से कभी भी सामान हटा सकते हैं।', 'Bạn có thể bỏ món khỏi giỏ bất cứ lúc nào.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'pill', bg: '#FFA41C', fg: '#0f1111', icon: Zap, label: 'Buy Now' }, level: 'check',
          name: T('Buy Now', 'বাই নাউ', 'बाय नाउ', 'Mua ngay'),
          does: T('Goes straight to paying for this one item', 'সরাসরি এই একটি জিনিসের পেমেন্টে চলে যায়', 'सीधे इस एक सामान के भुगतान पर ले जाता है', 'Đi thẳng tới thanh toán món này'),
          desc: T('You still see a summary before anything is charged.', 'টাকা কাটার আগে তবুও একটা সারসংক্ষেপ দেখবেন।', 'पैसे कटने से पहले फिर भी एक सारांश दिखेगा।', 'Bạn vẫn thấy phần tóm tắt trước khi bị trừ tiền.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'pill', bg: '#FFD814', fg: '#0f1111', icon: null, label: 'Place your order', size: 'lg' }, level: 'careful',
          name: T('Place your order', 'প্লেস ইওর অর্ডার', 'प्लेस योर ऑर्डर', 'Đặt hàng'),
          does: T('Confirms the purchase', 'কেনাকাটা পাকা করে', 'खरीदारी पक्की करता है', 'Xác nhận mua hàng'),
          desc: T('Check the address, payment method and total first. "Cash on Delivery" lets you pay when it arrives.', 'আগে ঠিকানা, পেমেন্টের ধরন আর মোট টাকা দেখুন। "Cash on Delivery" দিলে জিনিস পেয়ে টাকা দেবেন।', 'पहले पता, भुगतान का तरीका और कुल रकम जांचें। "Cash on Delivery" में सामान मिलने पर पैसे देते हैं।', 'Kiểm tra địa chỉ, cách thanh toán và tổng tiền trước. "Thanh toán khi nhận hàng" cho phép trả tiền lúc nhận.') },
      ],
    },
    {
      title: T('After buying', 'কেনার পরে', 'खरीदने के बाद', 'Sau khi mua'),
      buttons: [
        { replica: { type: 'button', canvas: '#fff', shape: 'pill', bg: '#fff', fg: '#0f1111', border: '#d5d9d9', icon: Package, label: 'Track package' }, level: 'safe',
          name: T('Track package', 'প্যাকেজ ট্র্যাক', 'पैकेज ट्रैक', 'Theo dõi kiện hàng'),
          does: T('Shows where your parcel is', 'আপনার পার্সেল কোথায় আছে দেখায়', 'आपका पार्सल कहां है दिखाता है', 'Cho biết kiện hàng đang ở đâu'),
          desc: T('Your Orders → the order → Track package.', 'Your Orders → অর্ডারটি → Track package।', 'Your Orders → ऑर्डर → Track package।', 'Đơn hàng của bạn → đơn → Theo dõi kiện hàng.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'pill', bg: '#fff', fg: '#0f1111', border: '#d5d9d9', icon: Undo2, label: 'Return or replace items' }, level: 'safe',
          name: T('Return or replace', 'রিটার্ন বা রিপ্লেস', 'रिटर्न या रिप्लेस', 'Trả hoặc đổi hàng'),
          does: T('Sends an item back for a refund', 'জিনিস ফেরত পাঠিয়ে টাকা ফেরত নেয়', 'सामान लौटाकर पैसे वापस लेता है', 'Gửi trả hàng để được hoàn tiền'),
          desc: T('Refunds go back automatically — nobody needs your OTP for them.', 'টাকা নিজে থেকেই ফেরত আসে — এর জন্য কারও আপনার ওটিপি লাগে না।', 'पैसे अपने आप लौटते हैं — इसके लिए किसी को आपका ओटीपी नहीं चाहिए।', 'Tiền hoàn tự động — không ai cần mã OTP của bạn.') },
      ],
    },
  ],
};

// ── Booking.com ─────────────────────────────────────────────────────────
const BC = '#003580';
const booking = {
  name: 'Booking.com',
  sections: [
    {
      title: T('Finding a stay', 'থাকার জায়গা খোঁজা', 'ठहरने की जगह ढूंढना', 'Tìm chỗ ở'),
      buttons: [
        { replica: { type: 'button', canvas: BC, shape: 'rect', bg: '#006ce4', icon: Search, label: 'Search' }, level: 'safe',
          name: T('Search', 'সার্চ', 'सर्च', 'Tìm'),
          does: T('Shows places for your city and dates', 'আপনার শহর ও তারিখের থাকার জায়গা দেখায়', 'आपके शहर और तारीख़ों की जगहें दिखाता है', 'Hiện chỗ ở theo thành phố và ngày của bạn'),
          desc: T('Enter the city, dates and guests first.', 'আগে শহর, তারিখ আর অতিথির সংখ্যা দিন।', 'पहले शहर, तारीख़ और मेहमान डालें।', 'Nhập thành phố, ngày và số khách trước.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: '#e7fde9', fg: '#008234', icon: ShieldCheck, label: 'Free cancellation' }, level: 'safe',
          name: T('Free cancellation', 'ফ্রি ক্যানসেলেশন', 'फ़्री कैंसलेशन', 'Miễn phí hủy'),
          does: T('You can cancel without paying, until a date', 'একটা তারিখ পর্যন্ত বিনা খরচে বাতিল করা যায়', 'एक तारीख तक बिना पैसे दिए रद्द कर सकते हैं', 'Được hủy miễn phí đến một ngày nhất định'),
          desc: T('Read the date next to it — after that, cancelling may cost money.', 'পাশে লেখা তারিখটা পড়ুন — তার পরে বাতিল করলে টাকা লাগতে পারে।', 'बगल में लिखी तारीख पढ़ें — उसके बाद रद्द करने पर पैसे लग सकते हैं।', 'Đọc ngày ghi bên cạnh — sau ngày đó hủy có thể mất phí.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: '#003b95', icon: null, label: '8.7  Excellent' }, level: 'safe',
          name: T('Review score', 'রিভিউ স্কোর', 'रिव्यू स्कोर', 'Điểm đánh giá'),
          does: T('Shows what other guests thought', 'অন্য অতিথিরা কেমন বলেছেন দেখায়', 'दिखाता है दूसरे मेहमानों को कैसा लगा', 'Cho biết khách khác đánh giá thế nào'),
          desc: T('8 or more is usually good. Tap it to read recent reviews.', '৮ বা তার বেশি সাধারণত ভালো। চাপলে সাম্প্রতিক রিভিউ পড়তে পারবেন।', '8 या उससे ज़्यादा आमतौर पर अच्छा है। टैप करके हाल के रिव्यू पढ़ें।', 'Từ 8 trở lên thường là tốt. Chạm vào để đọc đánh giá gần đây.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: '#006ce4', icon: null, label: 'Reserve', size: 'lg' }, level: 'check',
          name: T('Reserve', 'রিজার্ভ', 'रिज़र्व', 'Đặt'),
          does: T('Books the room', 'রুম বুক করে', 'कमरा बुक करता है', 'Đặt phòng'),
          desc: T('Check the total price and cancellation date before confirming. Pay only inside Booking.com.', 'নিশ্চিত করার আগে মোট দাম আর বাতিলের তারিখ দেখুন। শুধু বুকিং ডট কমের ভেতরেই টাকা দিন।', 'पुष्टि से पहले कुल दाम और रद्द करने की तारीख देखें। भुगतान सिर्फ़ Booking.com के अंदर करें।', 'Kiểm tra tổng giá và hạn hủy trước khi xác nhận. Chỉ trả tiền trong Booking.com.') },
      ],
    },
  ],
};

// ── Practo ──────────────────────────────────────────────────────────────
const PR = '#14bef0';
const practo = {
  name: 'Practo',
  sections: [
    {
      title: T('Seeing a doctor', 'ডাক্তার দেখানো', 'डॉक्टर को दिखाना', 'Đi khám bác sĩ'),
      buttons: [
        { replica: { type: 'input', canvas: '#28328c', placeholder: 'Search doctors, clinics…', icon: Search, fg: '#28328c' }, level: 'safe',
          name: T('Search doctors', 'ডাক্তার খুঁজুন', 'डॉक्टर खोजें', 'Tìm bác sĩ'),
          does: T('Finds doctors by speciality and area', 'বিশেষজ্ঞ ও এলাকা দিয়ে ডাক্তার খোঁজে', 'विशेषज्ञता और इलाके से डॉक्टर ढूंढता है', 'Tìm bác sĩ theo chuyên khoa và khu vực'),
          desc: T('Type e.g. "General physician" and choose your area.', 'লিখুন, যেমন "General physician", তারপর এলাকা বেছে নিন।', 'लिखें, जैसे "General physician", फिर इलाका चुनें।', 'Gõ ví dụ "Bác sĩ đa khoa" và chọn khu vực.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: PR, icon: CalendarCheck, label: 'Book Clinic Visit' }, level: 'check',
          name: T('Book Clinic Visit', 'ক্লিনিক ভিজিট বুক', 'क्लिनिक विज़िट बुक', 'Đặt lịch khám'),
          does: T('Reserves a time to see the doctor', 'ডাক্তার দেখানোর একটা সময় রাখে', 'डॉक्टर को दिखाने का समय बुक करता है', 'Giữ một giờ khám với bác sĩ'),
          desc: T('Pick a free time slot, then confirm. Details arrive by SMS.', 'খালি সময় বেছে নিশ্চিত করুন। তথ্য এসএমএসে আসবে।', 'खाली समय चुनें, फिर पुष्टि करें। जानकारी एसएमएस से आएगी।', 'Chọn khung giờ trống rồi xác nhận. Thông tin sẽ gửi qua SMS.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: '#fff', fg: '#28328c', border: '#28328c', icon: Video, label: 'Consult online' }, level: 'check',
          name: T('Consult online', 'অনলাইনে পরামর্শ', 'ऑनलाइन सलाह', 'Tư vấn trực tuyến'),
          does: T('Talks to a doctor on video from home', 'বাড়ি থেকেই ভিডিওতে ডাক্তারের সাথে কথা বলায়', 'घर से ही वीडियो पर डॉक्टर से बात कराता है', 'Nói chuyện với bác sĩ qua video tại nhà'),
          desc: T('Pay only inside the app. A real doctor never asks for extra money by transfer.', 'শুধু অ্যাপের ভেতরেই টাকা দিন। আসল ডাক্তার ট্রান্সফারে বাড়তি টাকা চান না।', 'भुगतान सिर्फ़ ऐप के अंदर करें। असली डॉक्टर ट्रांसफ़र से अलग पैसे नहीं मांगते।', 'Chỉ trả tiền trong ứng dụng. Bác sĩ thật không đòi chuyển khoản thêm.') },
      ],
    },
    {
      title: T('Your appointments', 'আপনার অ্যাপয়েন্টমেন্ট', 'आपके अपॉइंटमेंट', 'Lịch hẹn của bạn'),
      buttons: [
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: '#fff', fg: '#28328c', border: '#c8cbe0', icon: Calendar, label: 'Reschedule' }, level: 'safe',
          name: T('Reschedule', 'সময় বদলান', 'समय बदलें', 'Đổi lịch'),
          does: T('Moves your appointment to a new time', 'অ্যাপয়েন্টমেন্ট নতুন সময়ে সরায়', 'अपॉइंटमेंट को नए समय पर ले जाता है', 'Dời lịch hẹn sang giờ mới'),
          desc: T('Appointments → your booking → Reschedule.', 'Appointments → আপনার বুকিং → Reschedule।', 'Appointments → आपकी बुकिंग → Reschedule।', 'Lịch hẹn → lịch của bạn → Đổi lịch.') },
        { replica: { type: 'button', canvas: '#fff', shape: 'rect', bg: '#fff', fg: '#d93025', border: '#d93025', icon: Trash2, label: 'Cancel' }, level: 'check',
          name: T('Cancel appointment', 'অ্যাপয়েন্টমেন্ট বাতিল', 'अपॉइंटमेंट रद्द', 'Hủy lịch hẹn'),
          does: T('Frees the time for another patient', 'সময়টা অন্য রোগীর জন্য ছেড়ে দেয়', 'समय दूसरे मरीज़ के लिए खाली करता है', 'Nhường giờ khám cho bệnh nhân khác'),
          desc: T('Cancel a few hours before if you can.', 'পারলে কয়েক ঘণ্টা আগে বাতিল করুন।', 'हो सके तो कुछ घंटे पहले रद्द करें।', 'Nếu được, hãy hủy trước vài giờ.') },
      ],
    },
  ],
};

export const APP_BUTTON_GUIDES = { whatsapp, facebook, messenger, imo, gmail, bkash, nagad, momo, googlepay, paypal, amazon, booking, practo };
export const GUIDE_ORDER = Object.keys(APP_BUTTON_GUIDES);
