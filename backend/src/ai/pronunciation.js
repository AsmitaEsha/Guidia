// How Bengali and Hindi voices should say the English words that appear in
// Guidia's text ("Guidia", "OTP", "bKash", button names…). A Bengali or
// Hindi voice guesses at Latin letters and often garbles them, so the
// spoken copy (never the text on screen) gets native-script spellings.
// Longer phrases come first so "Send Money" wins over "Send".

const WORDS = {
  bn: [
    ['Tap for Balance', 'ট্যাপ ফর ব্যালেন্স'], ['Send Money', 'সেন্ড মানি'], ['Cash Out', 'ক্যাশ আউট'], ['Add Money', 'অ্যাড মানি'],
    ['Mobile Recharge', 'মোবাইল রিচার্জ'], ['Add to Cart', 'অ্যাড টু কার্ট'], ['Buy Now', 'বাই নাউ'], ['Only me', 'ওনলি মি'],
    ['Google Pay', 'গুগল পে'], ['Booking.com', 'বুকিং ডট কম'], ['My bKash', 'মাই বিকাশ'],
    ['Guidia', 'গাইডিয়া'], ['bKash', 'বিকাশ'], ['Nagad', 'নগদ'], ['imo', 'ইমো'], ['WhatsApp', 'হোয়াটসঅ্যাপ'],
    ['Facebook', 'ফেসবুক'], ['Messenger', 'মেসেঞ্জার'], ['Gmail', 'জিমেইল'], ['YouTube', 'ইউটিউব'], ['Google', 'গুগল'],
    ['Amazon', 'অ্যামাজন'], ['MoMo', 'মোমো'], ['Rocket', 'রকেট'], ['Daraz', 'দারাজ'], ['Pathao', 'পাঠাও'],
    ['OTP', 'ও টি পি'], ['PIN', 'পিন'], ['SMS', 'এস এম এস'], ['QR', 'কিউ আর'], ['UPI', 'ইউ পি আই'], ['AI', 'এ আই'],
    ['ID', 'আইডি'], ['OK', 'ওকে'], ['Wi-Fi', 'ওয়াইফাই'], ['app', 'অ্যাপ'], ['apps', 'অ্যাপস'], ['link', 'লিংক'],
    ['Send', 'সেন্ড'], ['Balance', 'ব্যালেন্স'], ['Report', 'রিপোর্ট'], ['Friends', 'ফ্রেন্ডস'], ['Public', 'পাবলিক'],
    ['Post', 'পোস্ট'], ['Reply', 'রিপ্লাই'], ['Settings', 'সেটিংস'], ['Tap', 'ট্যাপ'], ['Like', 'লাইক'], ['Save', 'সেভ'],
    ['Menu', 'মেনু'], ['Login', 'লগইন'], ['Privacy', 'প্রাইভেসি'], ['Block', 'ব্লক'], ['Compose', 'কম্পোজ'], ['Statement', 'স্টেটমেন্ট'],
    ['Button', 'বাটন'], ['number', 'নম্বর'], ['code', 'কোড'], ['request', 'রিকোয়েস্ট'], ['step', 'স্টেপ'], ['total', 'টোটাল'],
    ['spam', 'স্প্যাম'], ['alert', 'অ্যালার্ট'], ['customer', 'কাস্টমার'], ['English', 'ইংলিশ'], ['Inbox', 'ইনবক্স'],
  ],
  hi: [
    ['Tap for Balance', 'टैप फ़ॉर बैलेंस'], ['Send Money', 'सेंड मनी'], ['Cash Out', 'कैश आउट'], ['Add Money', 'ऐड मनी'],
    ['Mobile Recharge', 'मोबाइल रिचार्ज'], ['Add to Cart', 'ऐड टू कार्ट'], ['Buy Now', 'बाय नाउ'], ['Only me', 'ओनली मी'],
    ['Google Pay', 'गूगल पे'], ['Booking.com', 'बुकिंग डॉट कॉम'], ['My bKash', 'माय बिकाश'],
    ['Guidia', 'गाइडिया'], ['bKash', 'बिकाश'], ['Nagad', 'नगद'], ['imo', 'इमो'], ['WhatsApp', 'व्हाट्सऐप'],
    ['Facebook', 'फ़ेसबुक'], ['Messenger', 'मैसेंजर'], ['Gmail', 'जीमेल'], ['YouTube', 'यूट्यूब'], ['Google', 'गूगल'],
    ['Amazon', 'ऐमज़ॉन'], ['MoMo', 'मोमो'], ['Paytm', 'पेटीएम'], ['PhonePe', 'फ़ोनपे'],
    ['OTP', 'ओ टी पी'], ['PIN', 'पिन'], ['SMS', 'एस एम एस'], ['QR', 'क्यू आर'], ['UPI', 'यू पी आई'], ['AI', 'ए आई'],
    ['ID', 'आईडी'], ['OK', 'ओके'], ['Wi-Fi', 'वाईफ़ाई'], ['app', 'ऐप'], ['apps', 'ऐप्स'], ['link', 'लिंक'],
    ['Send', 'सेंड'], ['Balance', 'बैलेंस'], ['Report', 'रिपोर्ट'], ['Friends', 'फ़्रेंड्स'], ['Public', 'पब्लिक'],
    ['Post', 'पोस्ट'], ['Reply', 'रिप्लाई'], ['Settings', 'सेटिंग्स'], ['Tap', 'टैप'], ['Like', 'लाइक'], ['Save', 'सेव'],
    ['Menu', 'मेन्यू'], ['Login', 'लॉगिन'], ['Privacy', 'प्राइवेसी'], ['Block', 'ब्लॉक'], ['Compose', 'कंपोज़'], ['Statement', 'स्टेटमेंट'],
    ['Button', 'बटन'], ['number', 'नंबर'], ['code', 'कोड'], ['request', 'रिक्वेस्ट'], ['step', 'स्टेप'], ['total', 'टोटल'],
    ['spam', 'स्पैम'], ['alert', 'अलर्ट'], ['customer', 'कस्टमर'], ['English', 'इंग्लिश'], ['Inbox', 'इनबॉक्स'],
  ],
  // English and Vietnamese voices read "Guidia" as "gwee-dia"; it is said
  // "guide-ee-uh", so they get a spelling that sounds right.
  en: [['Guidia', 'Guydia']],
  vi: [['Guidia', 'Gai đi a']],
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// One regex per language: whole words only, case-insensitive, longest first.
const RULES = Object.fromEntries(Object.entries(WORDS).map(([lang, pairs]) => {
  const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);
  const map = new Map(sorted.map(([en, native]) => [en.toLowerCase(), native]));
  const re = new RegExp(`(?<![A-Za-z])(${sorted.map(([en]) => escape(en)).join('|')})(?![A-Za-z])`, 'gi');
  return [lang, { re, map }];
}));

/** Spoken copy of `text` for the voice of `lang` (never shown on screen). */
export function forSpeech(text, lang) {
  const rule = RULES[lang];
  if (!rule) return text;
  return text
    .replace(rule.re, (m) => rule.map.get(m.toLowerCase()) ?? m)
    // "গাইডিয়া-কে" → "গাইডিয়াকে": the hyphen only existed to join Latin to Bengali.
    .replace(/([ऀ-৿])-(?=[ऀ-৿])/g, '$1');
}
