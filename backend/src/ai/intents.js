// Guidia intent labels — shared with ml/labels/intent_labels.json.
export const INTENTS = [
  'LEARN_APP', 'START_LESSON', 'CONTINUE_LEARNING',
  'SEND_MONEY', 'RECEIVE_MONEY', 'BOOK_APPOINTMENT',
  'SEND_MESSAGE', 'READ_MESSAGE', 'SEND_EMAIL', 'READ_EMAIL', 'SHOP_ONLINE',
  'CHECK_SCREEN', 'EXPLAIN_SCREEN', 'SAFETY_CHECK', 'SCAM_CHECK',
  'CONTACT_GUARDIAN', 'REQUEST_HELP', 'NAVIGATION', 'UNKNOWN',
];

// Intents that touch money or credentials — the orchestrator always runs
// the Safety Engine for these regardless of model confidence.
export const SENSITIVE_INTENTS = new Set(['SEND_MONEY', 'RECEIVE_MONEY', 'SHOP_ONLINE', 'BOOK_APPOINTMENT']);

// Deterministic fallback used when the ML service is unavailable. Covers
// English, Bengali, Banglish (romanised Bengali), Hindi and Vietnamese.
// Order matters: earlier rules win. Results are marked degraded with no
// confidence number — a keyword hit is not a probability.
const RULES = [
  ['CONTACT_GUARDIAN', [/\b(guardian|my (son|daughter)|call (my )?family)\b/i, /গার্ডিয়ান|ছেলেকে|মেয়েকে/, /abba|ammu ke|chele ke|meye ke/i, /अभिभावक|बेटे को|बेटी को/, /người giám hộ|gọi con/i]],
  ['REQUEST_HELP', [/\b(i need help|help me|i('m| am) (stuck|lost|confused))\b/i, /সাহায্য|আটকে গেছি|বুঝতে পারছি না/, /help lagbe|bujhtesi na|atke gesi/i, /मदद|समझ नहीं/, /giúp tôi|tôi không hiểu/i]],
  ['SCAM_CHECK', [/\b(scam|fraud|fake|phishing|is this (message|sms|link) (real|safe))\b/i, /প্রতারণা|ভুয়া|স্ক্যাম/, /scam|fraud|vua|bhua/i, /धोखा|फर्जी|ठगी/, /lừa đảo|giả mạo/i]],
  ['SAFETY_CHECK', [/\b(safe|unsafe|danger|otp|pin|password)\b/i, /নিরাপদ|ওটিপি|পিন/, /nirapod|safe ki/i, /सुरक्षित|ओटीपी/, /an toàn|mã otp/i]],
  ['CHECK_SCREEN', [/\b(what (should|do) i (press|tap|click)|which button|my screen)\b/i, /কোথায় চাপ|কোন বাটন|স্ক্রিনে/, /kothay chap|kon button/i, /कहाँ दबाऊं|कौन सा बटन|स्क्रीन/, /bấm vào đâu|nút nào|màn hình/i]],
  ['EXPLAIN_SCREEN', [/\b(what is this (screen|page)|explain (this|the) (screen|page))\b/i, /এটা কী|এই পেজ/, /eta ki|ei page/i, /यह क्या है|यह पेज/, /đây là gì|trang này/i]],
  ['SEND_MONEY', [/\b(send|transfer|pay)\b.*\b(money|taka|tk|rupees?|dong|bkash|nagad|gpay|paypal|momo)\b/i, /টাকা পাঠা|সেন্ড মানি|বিকাশে টাকা/, /taka path|send money|bkash e taka/i, /पैसे भेज|ट्रांसफर/, /chuyển tiền|gửi tiền/i]],
  ['RECEIVE_MONEY', [/\b(receive|get) (money|payment)\b/i, /টাকা পাব|টাকা আসবে/, /taka pabo/i, /पैसे (कैसे )?मिल/, /nhận tiền/i]],
  ['BOOK_APPOINTMENT', [/\b(book|appointment|doctor|hotel)\b/i, /অ্যাপয়েন্টমেন্ট|ডাক্তার|বুক/, /doctor dekhabo|appointment/i, /अपॉइंटमेंट|डॉक्टर|बुक/, /đặt lịch|bác sĩ|đặt phòng/i]],
  ['SEND_EMAIL', [/\b(send|write) (an )?e-?mail\b/i, /ইমেইল পাঠা/, /email pathabo/i, /ईमेल भेज/, /gửi email/i]],
  ['READ_EMAIL', [/\b(read|open|check) (my )?e-?mail\b/i, /ইমেইল দেখ|ইমেইল পড়/, /email dekhbo/i, /ईमेल पढ़|ईमेल देख/, /đọc email/i]],
  ['SEND_MESSAGE', [/\b(send|write) (a )?(message|text|whatsapp|photo)\b/i, /মেসেজ পাঠা|ছবি পাঠা/, /message pathabo|chobi pathabo/i, /संदेश भेज|मैसेज भेज/, /gửi tin nhắn|nhắn tin/i]],
  ['READ_MESSAGE', [/\b(read|open) (a |my )?(message|text)\b/i, /মেসেজ পড়/, /message porbo/i, /संदेश पढ़/, /đọc tin nhắn/i]],
  ['SHOP_ONLINE', [/\b(buy|shop|order|amazon|cart)\b/i, /কিনব|অর্ডার/, /kinbo|order dibo/i, /खरीद|ऑर्डर/, /mua|đặt hàng/i]],
  ['CONTINUE_LEARNING', [/\b(continue|resume|where was i)\b/i, /আবার শুরু|চালিয়ে যাই/, /continue/i, /जारी रख/, /tiếp tục/i]],
  ['START_LESSON', [/\b(start|begin) (a )?(lesson|course)\b/i, /পাঠ শুরু/, /lesson shuru/i, /पाठ शुरू/, /bắt đầu bài/i]],
  ['LEARN_APP', [/\b(how (do|can) i|teach me|learn)\b/i, /কীভাবে|কিভাবে|শিখতে/, /kivabe|kibhabe|shikhte/i, /कैसे|सीख/, /làm sao|học/i]],
  ['NAVIGATION', [/\b(go (home|back)|open settings|next step)\b/i, /হোমে যাও|পেছনে যাও|পরের ধাপ/, /home e jao|porer dhap/i, /होम पर|वापस जाओ|अगला/, /về trang chủ|quay lại|bước tiếp/i]],
];

export function classifyIntentDeterministic(text) {
  const input = String(text || '');
  for (const [intent, patterns] of RULES) {
    if (patterns.some((p) => p.test(input))) return { intent, confidence: null, source: 'rules', degraded: true };
  }
  return { intent: 'UNKNOWN', confidence: null, source: 'rules', degraded: true };
}
