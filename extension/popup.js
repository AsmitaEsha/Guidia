const $ = (id) => document.getElementById(id);
const send = (message) => chrome.runtime.sendMessage(message);

// Popup copy in Guidia's four languages; the language comes from the
// connected account (English until connected).
const STRINGS = {
  en: {
    notConnected: 'Not connected', connected: 'Connected', connectTitle: 'Connect Guidia',
    connectStep1: 'Open Guidia → Settings → Browser helper.', connectStep2: 'Press “Connect the extension”.', connectStep3: 'Type the 8-character code below.',
    codeLabel: 'Code', connect: 'Connect', openSettings: 'Open Guidia settings',
    readyTitle: 'Understand this page', privacy: 'Guidia will capture the visible page only when you press the button. Banking and password pages are never captured.',
    questionLabel: 'Your question (optional)', questionPlaceholder: 'What should I press next?', capture: 'Capture & explain',
    openApp: 'Open Guidia', disconnect: 'Disconnect', pairing: 'Connecting…', paired: 'Connected. You can explain a page now.',
    capturing: 'Capturing page…', opening: 'Opening Guidia…', hello: (n) => `Hello ${n} — understand this page?`, codeShort: 'Please type all 8 characters of the code.',
  },
  bn: {
    notConnected: 'যুক্ত নয়', connected: 'যুক্ত', connectTitle: 'Guidia যুক্ত করুন',
    connectStep1: 'Guidia খুলুন → সেটিংস → ব্রাউজার সহায়ক।', connectStep2: '“এক্সটেনশন যুক্ত করুন” চাপুন।', connectStep3: 'নিচে ৮ অক্ষরের কোডটি লিখুন।',
    codeLabel: 'কোড', connect: 'যুক্ত করুন', openSettings: 'Guidia সেটিংস খুলুন',
    readyTitle: 'এই পেজটি বুঝুন', privacy: 'আপনি বোতাম চাপলেই শুধু Guidia দেখা অংশের ছবি নেবে। ব্যাংক ও পাসওয়ার্ডের পেজ কখনো নেওয়া হয় না।',
    questionLabel: 'আপনার প্রশ্ন (ঐচ্ছিক)', questionPlaceholder: 'এরপর কোথায় চাপব?', capture: 'ছবি নিন ও বুঝিয়ে দিন',
    openApp: 'Guidia খুলুন', disconnect: 'সংযোগ বিচ্ছিন্ন', pairing: 'যুক্ত হচ্ছে…', paired: 'যুক্ত হয়েছে। এবার পেজ বোঝাতে পারবেন।',
    capturing: 'পেজের ছবি নেওয়া হচ্ছে…', opening: 'Guidia খুলছে…', hello: (n) => `নমস্কার ${n} — এই পেজটি বুঝবেন?`, codeShort: 'কোডের ৮টি অক্ষরই লিখুন।',
  },
  hi: {
    notConnected: 'जुड़ा नहीं', connected: 'जुड़ा हुआ', connectTitle: 'Guidia जोड़ें',
    connectStep1: 'Guidia खोलें → सेटिंग्स → ब्राउज़र सहायक।', connectStep2: '“एक्सटेंशन जोड़ें” दबाएं।', connectStep3: 'नीचे 8 अक्षरों का कोड लिखें।',
    codeLabel: 'कोड', connect: 'जोड़ें', openSettings: 'Guidia सेटिंग्स खोलें',
    readyTitle: 'यह पेज समझें', privacy: 'बटन दबाने पर ही Guidia दिख रहे पेज की तस्वीर लेगा। बैंक और पासवर्ड वाले पेज कभी नहीं लिए जाते।',
    questionLabel: 'आपका सवाल (वैकल्पिक)', questionPlaceholder: 'आगे क्या दबाऊं?', capture: 'तस्वीर लें और समझाएं',
    openApp: 'Guidia खोलें', disconnect: 'डिस्कनेक्ट', pairing: 'जोड़ा जा रहा है…', paired: 'जुड़ गया। अब पेज समझा सकते हैं।',
    capturing: 'पेज की तस्वीर ली जा रही है…', opening: 'Guidia खुल रहा है…', hello: (n) => `नमस्ते ${n} — यह पेज समझें?`, codeShort: 'कोड के सभी 8 अक्षर लिखें।',
  },
  vi: {
    notConnected: 'Chưa kết nối', connected: 'Đã kết nối', connectTitle: 'Kết nối Guidia',
    connectStep1: 'Mở Guidia → Cài đặt → Tiện ích trình duyệt.', connectStep2: 'Bấm “Kết nối tiện ích”.', connectStep3: 'Nhập mã 8 ký tự bên dưới.',
    codeLabel: 'Mã', connect: 'Kết nối', openSettings: 'Mở cài đặt Guidia',
    readyTitle: 'Hiểu trang này', privacy: 'Guidia chỉ chụp phần trang đang hiện khi bạn bấm nút. Không bao giờ chụp trang ngân hàng hay mật khẩu.',
    questionLabel: 'Câu hỏi của bạn (không bắt buộc)', questionPlaceholder: 'Tiếp theo tôi nên bấm gì?', capture: 'Chụp & giải thích',
    openApp: 'Mở Guidia', disconnect: 'Ngắt kết nối', pairing: 'Đang kết nối…', paired: 'Đã kết nối. Bạn có thể giải thích trang ngay.',
    capturing: 'Đang chụp trang…', opening: 'Đang mở Guidia…', hello: (n) => `Xin chào ${n} — hiểu trang này nhé?`, codeShort: 'Hãy nhập đủ 8 ký tự của mã.',
  },
};
let S = STRINGS.en;

function applyLanguage(code) {
  S = STRINGS[code] || STRINGS.en;
  document.documentElement.lang = STRINGS[code] ? code : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => { const v = S[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = S[el.dataset.i18nPlaceholder]; });
}

function show(section) {
  $('connect').hidden = section !== 'connect';
  $('ready').hidden = section !== 'ready';
  $('conn').dataset.on = String(section === 'ready');
  $('conn-text').textContent = section === 'ready' ? S.connected : S.notConnected;
}

// kind: busy | ok | error | '' (hidden)
function status(text, kind = 'busy') {
  const el = $('status');
  el.hidden = !text;
  el.className = `status ${kind ? `is-${kind}` : ''}`;
  $('status-text').textContent = text || '';
}

async function refresh() {
  const res = await send({ type: 'status' });
  const user = res?.ok ? res.data.user : null;
  applyLanguage(user?.language || 'en');
  if (res?.ok && res.data.connected) {
    show('ready');
    if (user?.firstName) $('ready-h').textContent = S.hello(user.firstName);
    $('capture').focus();
  } else {
    show('connect');
    $('code').focus();
  }
}

$('code').addEventListener('input', (e) => {
  const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  e.target.value = raw.length > 4 ? `${raw.slice(0, 4)} ${raw.slice(4)}` : raw;
});

$('pair').addEventListener('click', async () => {
  const code = $('code').value.replace(/\s/g, '');
  if (code.length !== 8) return status(S.codeShort, 'error');
  $('pair').disabled = true;
  status(S.pairing);
  const res = await send({ type: 'pair', code });
  $('pair').disabled = false;
  if (!res?.ok) return status(res?.error || 'Could not connect.', 'error');
  await refresh();
  status(S.paired, 'ok');
});

$('capture').addEventListener('click', async () => {
  $('capture').disabled = true;
  status(S.capturing);
  const res = await send({ type: 'capture', question: $('question').value });
  $('capture').disabled = false;
  if (!res?.ok) return status(res?.error || 'Something went wrong.', 'error');
  status(S.opening, 'ok');
  setTimeout(() => window.close(), 600);
});

$('disconnect').addEventListener('click', async () => { await send({ type: 'disconnect' }); status(''); refresh(); });
$('open-settings').addEventListener('click', () => send({ type: 'openGuidia' }));
$('open-app').addEventListener('click', () => send({ type: 'openApp' }));

refresh();
