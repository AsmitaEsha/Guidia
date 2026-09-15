// All hardcoded data for the Guideia platform simulation

// Real app logo URLs (Wikipedia Commons SVGs — no hotlink restrictions)
export const APP_LOGOS = {
  whatsapp:  'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
  facebook:  'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
  messenger: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg',
  gmail:     'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
  googlepay: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
  paypal:    'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
  booking:   'https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg',
  amazon:    'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  practo:    null,
  youtube:   'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
  chrome:    'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg',
  bkash:     'https://download.logo.wine/logo/BKash/BKash-Icon-Logo.wine.png',
  nagad:     'https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png',
};


export const USERS = {
  elderly: { id: 'u1', name: 'Abdul Karim', phone: '017XXXXXX45', avatar: '👴', role: 'user', mode: 'scared', progress: { messaging:60, banking:30, socialMedia:20, email:10, safety:70 } },
  beginner:{ id: 'u2', name: 'Fatema Begum', phone: '018XXXXXX72', avatar: '👵', role: 'user', mode: 'unsure', progress: { messaging:40, banking:20, socialMedia:50, email:15, safety:55 } },
  guardian:{ id: 'u3', name: 'Karim\'s Son (Dhaka)', phone: '019XXXXXX88', avatar: '👨', role: 'guardian', status: 'online' },
};

export const FAKE_CONTACTS = [
  { id: 'c1', name: 'Rupa (Daughter)', avatar: '👩', lastSeen: '2 min ago', phone: '018XXXXXX33' },
  { id: 'c2', name: 'Dr. Ahmed', avatar: '👨‍⚕️', lastSeen: '1 hour ago', phone: '017XXXXXX91' },
  { id: 'c3', name: 'Family Group', avatar: '👨‍👩‍👧‍👦', members: 5, lastSeen: 'just now' },
  { id: 'c4', name: 'Mosque Neighbour', avatar: '🕌', lastSeen: 'yesterday', phone: '016XXXXXX02' },
];

export const FAKE_WHATSAPP_MESSAGES = {
  c1: [
    { id: 'm1', from: 'them', text: 'Abba, how are you?', time: '10:02 AM' },
    { id: 'm2', from: 'me',   text: 'I am fine, how are you my dear?', time: '10:05 AM' },
    { id: 'm3', from: 'them', text: 'Great! Did you eat lunch?', time: '10:06 AM' },
  ],
  c3: [
    { id: 'm1', from: 'them', text: 'Good morning everyone!', time: '8:00 AM', sender: 'Rupa' },
    { id: 'm2', from: 'them', text: 'Today is Eid Mubarak! 🌙', time: '8:15 AM', sender: 'Dr. Ahmed' },
    { id: 'm3', from: 'me',   text: 'Eid Mubarak to all!', time: '9:00 AM' },
  ],
};

export const FAKE_FACEBOOK_POSTS = [
  { id: 'p1', author: 'Rupa (Daughter)', avatar: '👩', time: '2 hours ago', text: 'Beautiful sunset from our rooftop today! 🌅 Thinking of everyone.', likes: 24, comments: 5, image: true },
  { id: 'p2', author: 'Dr. Ahmed', avatar: '👨‍⚕️', time: 'Yesterday', text: 'Health tip: Walking 30 minutes a day keeps the heart strong. Stay healthy everyone!', likes: 41, comments: 8 },
  { id: 'p3', author: 'Mosque Neighbour', avatar: '🕌', time: '3 days ago', text: 'Jummah Mubarak to all brothers and sisters. May Allah bless you all.', likes: 67, comments: 14 },
];

export const FAKE_GMAIL_INBOX = [
  { id: 'e1', from: 'Brac Bank', subject: 'Your monthly statement is ready', time: '9:00 AM', read: false, safe: true, body: 'Dear Customer, Your monthly bank statement for April is ready to view in your account. Please log in to your official account to access it.' },
  { id: 'e2', from: 'Rupa Ahmed', subject: 'Photo from yesterday', time: 'Yesterday', read: true, safe: true, body: 'Abba, I am sending you the photo we took at the garden. Hope you like it! Love, Rupa.' },
  { id: 'e3', from: 'LOTTERY PRIZE !!!', subject: 'YOU WON 500,000 TAKA CLICK NOW', time: '2 days ago', read: false, safe: false, body: 'Congratulations! You have been selected to receive 500,000 Taka prize money. Click this link immediately to claim before it expires...' },
];

export const FAKE_TRANSACTIONS = [
  { id: 't1', type: 'send',    to: 'Rupa (Daughter)', amount: 1000, date: 'Today, 11:00 AM',   status: 'completed', safe: true },
  { id: 't2', type: 'receive', from: 'Family Son',    amount: 5000, date: 'Yesterday',          status: 'completed', safe: true },
  { id: 't3', type: 'send',    to: 'Unknown Number',  amount: 2000, date: '3 days ago',          status: 'blocked',   safe: false, blockedReason: 'Guardian rejected — number not in contacts' },
  { id: 't4', type: 'cashout', agent: 'Agora Agent',  amount: 3000, date: 'Last Week',           status: 'completed', safe: true },
];

export const GUARDIAN_ALERTS = [
  { id: 'a1', type: 'transaction', msg: 'Transfer request: 5,000 BDT to unknown number', time: '5 min ago', status: 'pending', userId: 'u1' },
  { id: 'a2', type: 'scam',        msg: 'Possible scam link detected in WhatsApp message', time: '1 hour ago', status: 'resolved', userId: 'u1' },
  { id: 'a3', type: 'login',       msg: 'Successful login from Dhaka, Bangladesh', time: '2 hours ago', status: 'info', userId: 'u1' },
];

export const MEMORY_ENTRIES = [
  { id: 'mem1', title: 'How to send a WhatsApp photo', icon: '📸', date: 'Today', category: 'messaging', starred: true, summary: 'Tap the camera icon in the chat, select a photo, and press send.' },
  { id: 'mem2', title: 'Recognized my first scam message', icon: '🛡️', date: 'Yesterday', category: 'safety', starred: true, summary: 'Urgent banking messages asking for links are almost always scams.' },
  { id: 'mem3', title: 'Safe mobile banking lesson', icon: '💳', date: '3 days ago', category: 'banking', starred: false, summary: 'Always double-check the recipient number before confirming any transfer.' },
  { id: 'mem4', title: 'Video call practice with Rupa', icon: '📹', date: 'Last week', category: 'messaging', starred: false, summary: 'Open the contact, tap the video camera icon, and wait for the answer.' },
  { id: 'mem5', title: 'How to post a Facebook photo', icon: '📱', date: 'Last week', category: 'social', starred: false, summary: 'Tap the "Photo" button on your Feed, choose a photo, write a caption, tap Post.' },
];

export const TUTORIALS = {
  messaging: [
    { id: 'tut1', title: 'Send a WhatsApp Message', duration: '3 min', level: 'Beginner', completed: true,
      steps: {
        en: ['Open the green WhatsApp app on your phone.', 'Tap the name of the person you want to chat with.', 'Tap the text box at the bottom of the screen.', 'Type your message.', 'Tap the green arrow button to send. Done! 🎉'],
        bn: ['আপনার ফোনে সবুজ WhatsApp অ্যাপটি খুলুন।', 'যার সাথে কথা বলতে চান তার নামে চাপ দিন।', 'স্ক্রিনের নিচে টেক্সট বক্সে চাপ দিন।', 'আপনার মেসেজ লিখুন।', 'সবুজ তীর বাটনে চাপ দিন। হয়ে গেছে! 🎉'],
      }
    },
    { id: 'tut2', title: 'Send a Photo on WhatsApp', duration: '4 min', level: 'Beginner', completed: true,
      steps: {
        en: ['Open the chat with the person you want to send a photo to.', 'Look for the camera or paperclip icon near the text box.', 'Tap it and choose "Photo Library".', 'Select the photo you want to send.', 'Tap the send button. Your photo is sent safely! 📸'],
        bn: ['যার কাছে ছবি পাঠাতে চান তার চ্যাট খুলুন।', 'টেক্সট বক্সের পাশে ক্যামেরা বা ক্লিপ আইকন দেখুন।', 'সেটিতে চাপ দিয়ে "Photo Library" বেছে নিন।', 'যে ছবি পাঠাতে চান সেটি বেছে নিন।', 'পাঠানোর বাটনে চাপ দিন। ছবি পাঠানো হয়ে গেছে! 📸'],
      }
    },
    { id: 'tut3', title: 'Make a Video Call', duration: '5 min', level: 'Intermediate', completed: false,
      steps: {
        en: ['Open WhatsApp and find the contact you want to call.', 'Open the chat with them.', 'At the top right, look for the video camera icon.', 'Tap it. The call will start ringing.', 'When they answer, you can see each other! 🎥'],
        bn: ['WhatsApp খুলুন এবং যাকে কল করতে চান তাকে খুঁজুন।', 'তার সাথে চ্যাট খুলুন।', 'উপরে ডানদিকে ভিডিও ক্যামেরা আইকন খুঁজুন।', 'সেটিতে চাপ দিন। কল বাজতে শুরু করবে।', 'তারা ধরলে একে অপরকে দেখতে পাবেন! 🎥'],
      }
    },
  ],
  banking: [
    { id: 'tut4', title: 'Send Money on bKash Safely', duration: '6 min', level: 'Intermediate', completed: false,
      steps: {
        en: ['Open the bKash app. Make sure you are on the official pink bKash app.', 'Tap "Send Money".', 'Enter the recipient\'s phone number VERY carefully. Check it twice.', 'Enter the amount.', 'Enter your 5-digit PIN. Never share this PIN with anyone.', 'Check all details one more time, then tap Confirm.'],
        bn: ['bKash অ্যাপ খুলুন। নিশ্চিত করুন এটি আসল গোলাপি bKash অ্যাপ।', '"Send Money" তে চাপ দিন।', 'প্রাপকের ফোন নম্বর খুব সাবধানে লিখুন। দুইবার দেখুন।', 'পরিমাণ লিখুন।', 'আপনার ৫ সংখ্যার পিন দিন। এই পিন কাউকে দেবেন না।', 'সব তথ্য আরেকবার দেখুন, তারপর Confirm এ চাপ দিন।'],
      }
    },
    { id: 'tut_gp', title: 'Pay using Google Pay', duration: '4 min', level: 'Intermediate', completed: false,
      steps: {
        en: ['Open Google Pay.', 'Look for the "Scan QR" icon (a square with a line in it) to pay a shop, or the "Pay Contacts" icon (a smartphone with a person) for friends.', 'Enter the exact amount.', 'Enter your secure UPI PIN. Only enter PIN to send money.', 'Wait for the green checkmark to confirm payment.'],
        bn: ['Google Pay খুলুন।', 'দোকানে পে করতে "Scan QR" আইকন (একটি স্কয়ার) খুঁজুন, অথবা বন্ধুদের জন্য "Pay Contacts" আইকন (একটি ফোন ও মানুষ)।', 'সঠিক পরিমাণ লিখুন।', 'আপনার নিরাপদ UPI পিন লিখুন। শুধু টাকা পাঠাতে পিন লাগে।', 'পেমেন্ট নিশ্চিত করতে সবুজ চেকমার্কের জন্য অপেক্ষা করুন।'],
      }
    },
  ],
  shopping: [
    { id: 'tut_amz', title: 'Order Safely on Amazon', duration: '5 min', level: 'Beginner', completed: false,
      steps: {
        en: ['Open the Amazon app.', 'Type what you want to buy in the top search bar.', 'Look at the Star icons (⭐) to check product reviews before buying. Only buy 4-star or higher.', 'Tap the "Add to Cart" button (shopping cart icon).', 'Select your delivery address and pay securely. Always check the final price.'],
        bn: ['Amazon অ্যাপ খুলুন।', 'উপরের সার্চ বারে যা কিনতে চান তা লিখুন।', 'কেনার আগে স্টার আইকন (⭐) দেখে পণ্যের রিভিউ চেক করুন।', '"Add to Cart" বাটনে (শপিং কার্ট আইকন) চাপ দিন।', 'আপনার ডেলিভারি ঠিকানা বেছে নিন এবং নিরাপদে পে করুন। চূড়ান্ত দাম চেক করুন।'],
      }
    }
  ],
  health: [
    { id: 'tut_prac', title: 'Book a Doctor Online', duration: '5 min', level: 'Beginner', completed: false,
      steps: {
        en: ['Open the Practo app.', 'Tap "Find Doctors" (User icon) or "Video Consult" (Camera icon).', 'Choose the doctor\'s specialty, like "Heart" (❤️) or "Eye" (👁️).', 'Select a doctor based on their experience and fee.', 'Pick a time slot and confirm your appointment. You can talk via video from home!'],
        bn: ['Practo অ্যাপ খুলুন।', '"Find Doctors" (মানুষের আইকন) বা "Video Consult" (ক্যামেরা আইকন) এ চাপ দিন।', 'ডাক্তারের বিভাগ বেছে নিন, যেমন "Heart" (❤️) বা "Eye" (👁️)।', 'অভিজ্ঞতা ও ফি দেখে একজন ডাক্তার বেছে নিন।', 'সময় বেছে নিন এবং অ্যাপয়েন্টমেন্ট নিশ্চিত করুন। আপনি বাসা থেকে ভিডিওতে কথা বলতে পারেন!'],
      }
    }
  ],
  travel: [
    { id: 'tut_book', title: 'Find a Safe Hotel', duration: '4 min', level: 'Intermediate', completed: false,
      steps: {
        en: ['Open Booking.com.', 'Enter the city you are traveling to in the search box (magnifying glass icon).', 'Select your check-in and check-out dates (calendar icon).', 'Choose guests and rooms (people icon), then tap "Search".', 'Always read guest reviews to ensure the hotel is safe and clean before paying.'],
        bn: ['Booking.com খুলুন।', 'সার্চ বক্সে (ম্যাগনিফাইং গ্লাস আইকন) আপনি যে শহরে যাচ্ছেন তার নাম লিখুন।', 'ক্যালেন্ডার আইকনে চাপ দিয়ে যাওয়ার এবং আসার তারিখ বেছে নিন।', 'মানুষের আইকনে চাপ দিয়ে অতিথি ও রুম বেছে নিন, তারপর "Search" এ চাপ দিন।', 'পেমেন্ট করার আগে হোটেলটি নিরাপদ কিনা তা জানতে গেস্ট রিভিউ পড়ে নিন।'],
      }
    }
  ],
  safety: [
    { id: 'tut5', title: 'Recognizing Scam Messages', duration: '5 min', level: 'Beginner', completed: true,
      steps: {
        en: ['Scam messages usually create URGENCY — "Act now!" or "Your account is closing today!"', 'They ask for your PIN, OTP, or password. Real banks NEVER do this.', 'They contain suspicious links (web addresses). Never tap unknown links.', 'They offer prizes you never entered for — "You won 50,000 taka!"', 'If unsure, always call your guardian or family before doing anything.'],
        bn: ['প্রতারণামূলক মেসেজ সাধারণত জরুরি অবস্থা তৈরি করে — "এখনই করুন!" বা "আজই আপনার অ্যাকাউন্ট বন্ধ হবে!"', 'তারা আপনার পিন, ওটিপি বা পাসওয়ার্ড চায়। আসল ব্যাংক কখনো এটা করে না।', 'এতে সন্দেহজনক লিংক থাকে। অজানা লিংকে কখনো চাপ দেবেন না।', 'তারা এমন পুরস্কার দেওয়ার কথা বলে যার জন্য আপনি কখনো চেষ্টা করেননি।', 'সন্দেহ হলে, কিছু করার আগে সবসময় পরিবারকে ডাকুন।'],
      }
    },
  ],
};

export const NOTIFICATIONS = [
  { id: 'n1', type: 'guardian', icon: '🛡️', title: 'Guardian Notification', msg: 'Your son approved your 1,000 BDT transfer to Rupa.', time: '5 min ago', read: false },
  { id: 'n2', type: 'lesson',   icon: '🎓', title: 'Lesson Complete!',      msg: 'You completed "Send a WhatsApp Message". Wonderful progress!', time: '1 hour ago', read: false },
  { id: 'n3', type: 'scam',     icon: '⚠️', title: 'Scam Alert',            msg: 'A suspicious message was detected. Tap to learn more.', time: '2 hours ago', read: true },
  { id: 'n4', type: 'reminder', icon: '📚', title: 'Daily Lesson Ready',    msg: '"Video Calls" lesson is waiting for you. Take your time!', time: 'Yesterday', read: true },
];

export const SCAM_EXAMPLES = [
  {
    id: 's1', severity: 'critical', type: 'Banking Scam', icon: '🏦',
    message: '"URGENT: Your bKash account will be suspended TODAY unless you verify immediately. Click: http://bkash-verify-now.com/urgent"',
    tactics: ['Artificial urgency ("TODAY", "URGENT")', 'Fake website link (not the real bKash)', 'Fear of losing account access'],
    safetyTips: { en: ['Real bKash will never ask you to click a link via SMS.', 'bKash only communicates through their official app or 16247.', 'Delete this message and tell your family.'], bn: ['আসল bKash কখনো SMS-এ লিংক দিয়ে যোগাযোগ করে না।', 'bKash শুধু তাদের অফিসিয়াল অ্যাপ বা 16247 নম্বরে যোগাযোগ করে।', 'এই মেসেজটি মুছুন এবং পরিবারকে জানান।'] },
  },
  {
    id: 's2', severity: 'high', type: 'OTP Scam', icon: '🔢',
    message: '"Hi, I am calling from your bank. There is suspicious activity on your account. Please tell me the OTP you just received to verify your identity."',
    tactics: ['Phone call impersonating bank', 'Asking for OTP (One-Time Password)', 'Creating panic about account security'],
    safetyTips: { en: ['No real bank will ever ask for your OTP over the phone.', 'OTP is only for YOU. Never share it.', 'Hang up immediately and call your family.'], bn: ['কোনো আসল ব্যাংক কখনো ফোনে OTP চাইবে না।', 'OTP শুধুমাত্র আপনার জন্য। কাউকে দেবেন না।', 'সঙ্গে সঙ্গে ফোন কেটে পরিবারকে ডাকুন।'] },
  },
  {
    id: 's3', severity: 'warning', type: 'Prize Scam', icon: '🏆',
    message: '"Congratulations! You have been selected to win 50,000 Taka! To claim your prize, send 500 Taka processing fee to this number: 017XXXXXXXX"',
    tactics: ['Unrealistic prize offer', 'Requesting upfront payment', 'Fake sense of being specially selected'],
    safetyTips: { en: ['If you never entered a contest, you cannot win a prize.', 'Legitimate prizes never require an upfront fee.', 'Block the number and inform your family.'], bn: ['আপনি যদি কোনো প্রতিযোগিতায় অংশ না নিয়ে থাকেন, তাহলে পুরস্কার জেতার প্রশ্নই আসে না।', 'আসল পুরস্কারে কখনো আগে টাকা পাঠাতে হয় না।', 'নম্বরটি ব্লক করুন এবং পরিবারকে জানান।'] },
  },
];

export const AI_RESPONSES = {
  en: {
    greetings: ["Hello! I'm here to help you safely. Take your time.", "Welcome back! You're doing wonderfully. How can I help?"],
    whatsapp:  "To send a message on WhatsApp:\n1. Open the green WhatsApp app.\n2. Tap the name of the person you want to chat with.\n3. Type your message in the white box at the bottom.\n4. Press the green arrow to send.\n\nYou cannot break anything. Take your time. 😊",
    photo:     "To send a photo:\n1. Open the chat with the person.\n2. Tap the 📎 or 📷 icon next to the text box.\n3. Choose 'Gallery' or 'Photos'.\n4. Tap the photo you want to send.\n5. Press the send button.\n\nWonderful! You did it safely.",
    facebook:  "For Facebook:\n1. Open the blue Facebook app.\n2. Tap the box that says 'What's on your mind?'\n3. Type what you want to share.\n4. Tap 'Post' button at the bottom.\n\nYou're doing great! 👍",
    gmail:     "For Gmail emails:\n1. Open the red Gmail app.\n2. Look for the 'Compose' button (pencil icon).\n3. Type the person's email address in 'To'.\n4. Write your subject and message.\n5. Press the send button (arrow).\n\nRemember: Never click suspicious links in emails. You're safe here.",
    bkash:     "For bKash money transfer:\n1. Open the pink bKash app.\n2. Tap 'Send Money'.\n3. Enter the recipient's number VERY carefully.\n4. Enter the amount.\n5. Enter your secret PIN (never share it!).\n6. Tap Confirm.\n\nIf unsure, always ask your guardian first. Nothing will happen without your confirmation.",
    googlepay: "On Google Pay, remember: You ONLY need to enter your UPI PIN when you are SENDING money. If someone asks you to enter your PIN to 'receive' money, they are trying to steal from you. Stop and call your family.",
    paypal:    "To send money through PayPal:\n1. Open the PayPal app.\n2. Tap 'Send' at the bottom.\n3. Enter the receiver's email address or name.\n4. Enter the amount to send.\n5. Select 'Sending to a friend' for personal transfers.\n6. Tap 'Send'.\n\nAlways double-check the email address before sending!",
    amazon:    "When shopping on Amazon, always check the star ratings. A product with many 4 or 5-star reviews is generally safe. If a price seems 'too good to be true' (like a 50,000 taka phone for 5,000), it is likely a fake seller.",
    booking:   "On Booking.com, you can search for hotels by entering your destination. Always read the guest reviews before booking to ensure the place is clean and safe.",
    practo:    "With Practo, you can talk to a real doctor from home! Tap 'Video Consult', choose what kind of doctor you need, and pick a time. It's very safe and easy.",
    whatsapp_save: "To save a contact in WhatsApp:\n1. Open WhatsApp.\n2. Tap the 'New Chat' icon at the bottom right.\n3. Tap 'New Contact'.\n4. Enter the person's name and phone number.\n5. Tap 'Save' at the top right.\n\nThe new contact will now appear in your WhatsApp list.",
    scam:      "That sounds like a scam. Here is how to stay safe:\n• Real banks never ask for your PIN or OTP via phone or SMS.\n• Urgent messages designed to scare you are almost always fake.\n• Never click links from unknown senders.\n• When in doubt — stop, don't do anything, and call your family.\n\nYou did the right thing by asking! You're being very smart. 🛡️",
    otp:       "IMPORTANT — Never share your OTP with anyone!\n\nAn OTP (One-Time Password) is a secret code sent only to you. If anyone calls asking for it — even if they say they are from your bank — it is a SCAM.\n\nHang up immediately. You are safe. ✅",
    fallback:  "I'm here to help you. You can ask me about:\n• Sending messages on WhatsApp\n• Using Facebook\n• Reading Gmail emails\n• bKash or mobile banking\n• How to recognize scams\n\nTake your time. What would you like to know? 😊",
  },
  bn: {
    greetings: ["হ্যালো! আমি আপনাকে নিরাপদে সাহায্য করতে এখানে আছি। ধীরে সুস্থে করুন।", "আবার স্বাগতম! আপনি দারুণ করছেন। আমি কীভাবে সাহায্য করতে পারি?"],
    whatsapp:  "WhatsApp-এ মেসেজ পাঠাতে:\n১. সবুজ WhatsApp অ্যাপ খুলুন।\n২. যার সাথে কথা বলতে চান তার নামে চাপ দিন।\n৩. নিচের সাদা বক্সে আপনার মেসেজ লিখুন।\n৪. সবুজ তীর বাটনে চাপ দিন।\n\nকিছুই নষ্ট হবে না। ধীরে সুস্থে করুন। 😊",
    photo:     "ছবি পাঠাতে:\n১. যার কাছে পাঠাবেন তার চ্যাট খুলুন।\n২. টেক্সট বক্সের পাশের 📎 বা 📷 আইকনে চাপ দিন।\n৩. 'গ্যালারি' বা 'ছবি' বেছে নিন।\n৪. যে ছবি পাঠাবেন সেটিতে চাপ দিন।\n৫. পাঠানোর বাটনে চাপ দিন।\n\nচমৎকার! নিরাপদে হয়ে গেছে।",
    facebook:  "Facebook-এ পোস্ট করতে:\n১. নীল Facebook অ্যাপ খুলুন।\n২. 'What's on your mind?' লেখা বক্সে চাপ দিন।\n৩. আপনি কী শেয়ার করতে চান তা লিখুন।\n৪. নিচের 'Post' বাটনে চাপ দিন।\n\nআপনি দারুণ করছেন! 👍",
    gmail:     "Gmail ইমেইলে:\n১. লাল Gmail অ্যাপ খুলুন।\n২. 'Compose' বাটন (পেন্সিল আইকন) খুঁজুন।\n৩. 'To' তে ব্যক্তির ইমেইল ঠিকানা লিখুন।\n৪. বিষয় ও বার্তা লিখুন।\n৫. সেন্ড বাটনে চাপ দিন।\n\nমনে রাখবেন: ইমেইলে সন্দেহজনক লিংকে কখনো চাপ দেবেন না।",
    bkash:     "bKash-এ টাকা পাঠাতে:\n১. গোলাপি bKash অ্যাপ খুলুন।\n২. 'Send Money' তে চাপ দিন।\n৩. প্রাপকের নম্বর খুব সাবধানে লিখুন।\n৪. পরিমাণ লিখুন।\n৫. আপনার গোপন পিন দিন (কাউকে দেবেন না!)।\n৬. Confirm এ চাপ দিন।\n\nসন্দেহ হলে আগে গার্ডিয়ানকে জিজ্ঞেস করুন।",
    googlepay: "Google Pay-তে মনে রাখবেন: শুধু টাকা পাঠানোর সময়ই আপনার UPI পিন দিতে হয়। যদি কেউ 'টাকা পাওয়ার জন্য' আপনাকে পিন দিতে বলে, তবে সে আপনাকে ঠকাচ্ছে। সাথে সাথে পরিবারকে জানান।",
    paypal:    "PayPal দিয়ে টাকা পাঠাতে:\n১. PayPal অ্যাপ খুলুন।\n২. নিচে 'Send' বাটনে চাপ দিন।\n৩. প্রাপকের ইমেইল ঠিকানা বা নাম লিখুন।\n৪. পরিমাণ লিখুন।\n৫. ব্যক্তিগত লেনদেনের জন্য 'Sending to a friend' বেছে নিন।\n৬. 'Send' এ চাপ দিন。\n\nপাঠানোর আগে সবসময় ইমেইল ঠিকানা যাচাই করবেন!",
    amazon:    "Amazon-এ কেনাকাটা করার সময় সবসময় স্টার রেটিং (⭐) চেক করবেন। ৪ বা ৫ স্টার থাকা জিনিসগুলো সাধারণত ভালো হয়। অবিশ্বাস্য কম দাম দেখলে সতর্ক হোন।",
    booking:   "Booking.com-এ আপনি শহর লিখে হোটেল খুঁজতে পারেন। বুক করার আগে অন্য অতিথিদের রিভিউ পড়ে নিন, যাতে জায়গাটি নিরাপদ হয়।",
    practo:    "Practo দিয়ে আপনি বাসা থেকেই আসল ডাক্তারের সাথে কথা বলতে পারেন! 'Video Consult' এ চাপ দিন এবং ডাক্তার বেছে নিন। এটি খুবই নিরাপদ।",
    whatsapp_save: "WhatsApp এ কন্টাক্ট সেভ করতে:\n১. WhatsApp খুলুন।\n২. নিচে ডানদিকে 'New Chat' আইকনে চাপ দিন।\n৩. 'New Contact' এ চাপ দিন।\n৪. ব্যক্তির নাম এবং ফোন নম্বর লিখুন।\n৫. উপরে ডানদিকে 'Save' বাটনে চাপ দিন。\n\nনতুন কন্টাক্ট এখন আপনার WhatsApp তালিকায় দেখা যাবে।",
    scam:      "এটি একটি প্রতারণার মতো লাগছে। নিরাপদ থাকতে:\n• আসল ব্যাংক কখনো ফোন বা SMS-এ পিন বা OTP চায় না।\n• আপনাকে ভয় দেখানো জরুরি মেসেজ প্রায় সবসময় ভুয়া।\n• অজানা প্রেরকের লিংকে কখনো চাপ দেবেন না।\n• সন্দেহ হলে — থামুন, কিছু করবেন বায়, পরিবারকে ডাকুন।\n\nজিজ্ঞেস করে আপনি সঠিক কাজ করেছেন! আপনি খুব বুদ্ধিমান। 🛡️",
    otp:       "গুরুত্বপূর্ণ — কাউকে আপনার OTP দেবেন না!\n\nOTP (ওয়ান-টাইম পাসওয়ার্ড) শুধুমাত্র আপনার জন্য পাঠানো একটি গোপন কোড। যদি কেউ ফোন করে এটি চায় — এমনকি যদি বলে ব্যাংক থেকে বলছেন — এটি একটি প্রতারণা।\n\nসঙ্গে সঙ্গে ফোন রাখুন। আপনি নিরাপদ। ✅",
    fallback:  "আমি সাহায্য করতে এখানে আছি। আপনি জিজ্ঞেস করতে পারেন:\n• WhatsApp বা Facebook\n• bKash, Google Pay বা PayPal\n• Amazon, Booking বা Practo\n• প্রতারণা চেনার উপায়\n\nধীরে সুস্থে করুন। আপনি কী জানতে চান?",
  },
  hi: {
    greetings: ["नमस्ते! मैं यहाँ आपकी सुरक्षित मदद के लिए हूँ। अपना समय लें।", "वापसी पर स्वागत! आप बहुत अच्छा कर रहे हैं। मैं कैसे मदद करूँ?"],
    whatsapp:  "WhatsApp पर संदेश भेजने के लिए:\n१. हरा WhatsApp ऐप खोलें।\n२. जिसे संदेश भेजना है उसके नाम पर टैप करें।\n३. नीचे सफेद बॉक्स में संदेश लिखें।\n४. हरे तीर बटन पर टैप करें।\n\nकुछ भी खराब नहीं होगा। अपना समय लें।",
    photo:     "फ़ोटो भेजने के लिए:\n१. उस व्यक्ति की चैट खोलें।\n२. टेक्स्ट बॉक्स के पास क्लिप या कैमरा आइकन टैप करें।\n३. 'गैलरी' चुनें।\n४. जो फ़ोटो भेजनी है उसे टैप करें।\n५. भेजें बटन दबाएं।",
    facebook:  "Facebook पर पोस्ट करने के लिए:\n१. नीला Facebook ऐप खोलें।\n२. 'What's on your mind?' बॉक्स पर टैप करें।\n३. जो लिखना है वो लिखें।\n४. नीचे 'Post' बटन दबाएं।\n\nआप बहुत अच्छा कर रहे हैं!",
    gmail:     "Gmail के लिए:\n१. लाल Gmail ऐप खोलें।\n२. 'Compose' बटन (पेंसिल आइकन) ढूंढें।\n३. 'To' में ईमेल पता लिखें।\n४. विषय और संदेश लिखें।\n५. भेजें (तीर) बटन दबाएं।\n\nयाद रखें: संदिग्ध लिंक पर कभी टैप न करें।",
    bkash:     "bKash से पैसे भेजने के लिए:\n१. गुलाबी bKash ऐप खोलें।\n२. 'Send Money' पर टैप करें।\n३. प्राप्तकर्ता का नंबर बहुत ध्यान से डालें।\n४. राशि डालें।\n५. अपना गुप्त PIN डालें (किसी को न बताएं!)।\n६. Confirm दबाएं।\n\nसंदेह हो तो पहले परिवार से पूछें।",
    googlepay: "Google Pay पर याद रखें: आप केवल पैसे भेजते समय अपना UPI PIN डालें। अगर कोई 'पैसे पाने के लिए' PIN मांगे — वह धोखाधड़ी है। तुरंत फ़ोन काटें और परिवार को बताएं।",
    paypal:    "PayPal के माध्यम से पैसे भेजने के लिए:\n१. PayPal ऐप खोलें।\n२. नीचे 'Send' पर टैप करें।\n३. प्राप्तकर्ता का ईमेल पता या नाम दर्ज करें।\n४. भेजने के लिए राशि दर्ज करें।\n५. व्यक्तिगत स्थानांतरण के लिए 'Sending to a friend' चुनें।\n६. 'Send' पर टैप करें।\n\nभेजने से पहले हमेशा ईमेल पते की दोबारा जांच करें!",
    amazon:    "Amazon पर खरीदारी करते समय हमेशा स्टार रेटिंग देखें। 4 या 5 स्टार वाले उत्पाद आमतौर पर अच्छे होते हैं। बहुत कम कीमत देखें तो सतर्क रहें।",
    booking:   "Booking.com पर शहर का नाम डालकर होटल खोजें। बुक करने से पहले अतिथि समीक्षाएं पढ़ें।",
    practo:    "Practo से घर बैठे डॉक्टर से बात करें! 'Video Consult' पर टैप करें, डॉक्टर चुनें और समय बुक करें। यह बिल्कुल सुरक्षित है।",
    whatsapp_save: "WhatsApp में संपर्क सहेजने के लिए:\n१. WhatsApp खोलें।\n२. नीचे दाईं ओर 'New Chat' आइकन पर टैप करें।\n३. 'New Contact' पर टैप करें।\n४. व्यक्ति का नाम और फ़ोन नंबर दर्ज करें।\n५. ऊपर दाईं ओर 'Save' पर टैप करें।\n\nनया संपर्क अब आपकी WhatsApp सूची में दिखाई देगा।",
    scam:      "यह धोखाधड़ी जैसा लगता है। सुरक्षित रहने के लिए:\n• असली बैंक कभी फ़ोन या SMS पर PIN या OTP नहीं मांगता।\n• घबराहट पैदा करने वाले संदेश लगभग हमेशा नकली होते हैं।\n• अज्ञात लिंक पर कभी टैप न करें।\n• संदेह हो — रुकें, कुछ न करें, परिवार को बुलाएं।\n\nपूछकर आपने बिल्कुल सही किया!",
    otp:       "महत्वपूर्ण — अपना OTP किसी को न बताएं!\n\nOTP केवल आपके लिए भेजा गया गुप्त कोड है। कोई भी इसे मांगे — चाहे बैंक से कहे — यह धोखाधड़ी है।\n\nतुरंत फ़ोन काटें। आप सुरक्षित हैं।",
    fallback:  "मैं यहाँ मदद के लिए हूँ। आप पूछ सकते हैं:\n• WhatsApp या Facebook\n• bKash, Google Pay\n• Amazon, Booking\n• धोखाधड़ी पहचानने के तरीके\n\nअपना समय लें। आप क्या जानना चाहते हैं?",
  }
};

export const PROGRESS_CATEGORIES = [
  { id: 'messaging',   label: { en: 'Messaging',    bn: 'মেসেজিং' },       icon: '💬', color: '#5b9bd5' },
  { id: 'banking',     label: { en: 'Banking',       bn: 'ব্যাংকিং' },       icon: '💳', color: '#e2136e' },
  { id: 'socialMedia', label: { en: 'Social Media',  bn: 'সোশ্যাল মিডিয়া' }, icon: '📱', color: '#1877f2' },
  { id: 'email',       label: { en: 'Email',         bn: 'ইমেইল' },          icon: '📧', color: '#ea4335' },
  { id: 'safety',      label: { en: 'Online Safety', bn: 'অনলাইন নিরাপত্তা' }, icon: '🛡️', color: '#5aab78' },
];

export const getAIResponse = (query, lang) => {
  const q = query.toLowerCase();
  const r = AI_RESPONSES[lang] || AI_RESPONSES.en;

  // Audit Flows
  if ((q.includes('send') || q.includes('transfer')) && (q.includes('tk') || q.includes('taka') || q.includes('টাকা') || q.includes('পাঠাব'))) {
    return {
      text: lang === 'bn' ? "আমি আপনার লেনদেনের একটি সেফটি অডিট তৈরি করেছি। সবকিছু ঠিক থাকলে 'Proceed' চাপুন।" : lang === 'hi' ? "मैंने आपके लेनदेन का सुरक्षा ऑडिट बनाया है। सब सही हो तो 'Proceed' दबाएं।" : "I have created a safety audit for your transaction. If everything looks correct, tap Proceed.",
      audit: {
        type: 'transaction',
        action: lang === 'bn' ? 'bKash এ টাকা পাঠানো' : lang === 'hi' ? 'bKash से पैसे भेजें' : 'Send Money via bKash',
        details: [
          { label: lang === 'bn' ? 'পরিমাণ' : lang === 'hi' ? 'राशि' : 'Amount', val: '500 TK', safe: true },
          { label: lang === 'bn' ? 'প্রাপক' : lang === 'hi' ? 'प्राप्तकर्ता' : 'Recipient', val: '01711223344', safe: false, warn: lang === 'bn' ? 'আপনি আগে কখনো এই নম্বরে টাকা পাঠাননি।' : lang === 'hi' ? 'आपने पहले इस नंबर पर पैसे नहीं भेजे हैं। क्या आप सुनिश्चित हैं?' : 'You have never sent money to this number before. Are you sure?' }
        ]
      }
    };
  }

  if (q.includes('post') && (q.includes('facebook') || q.includes('fb') || q.includes('শেয়ার'))) {
    return {
      text: lang === 'bn' ? "আপনার পোস্টের জন্য একটি অডিট নিচে দেওয়া হলো।" : lang === 'hi' ? "आपकी पोस्ट का ऑडिट नीचे है। तैयार होने पर शेयर करें।" : "Here is an audit of your intended post. Share when you are ready.",
      audit: {
        type: 'post',
        action: lang === 'bn' ? 'পাবলিক পোস্ট শেয়ার' : lang === 'hi' ? 'सार्वजनिक पोस्ट शेयर' : 'Share Public Post',
        details: [
          { label: lang === 'bn' ? 'বিষয়বস্তু' : lang === 'hi' ? 'सामग्री' : 'Content', val: lang === 'bn' ? 'টেক্সট আপডেট' : lang === 'hi' ? 'टेक्स्ट अपडेट' : 'Text update', safe: true },
          { label: lang === 'bn' ? 'প্রাইভেসি' : lang === 'hi' ? 'गोपनीयता' : 'Privacy', val: lang === 'bn' ? 'পাবলিক' : lang === 'hi' ? 'सार्वजनिक' : 'Public', safe: false, warn: lang === 'bn' ? 'এটি অপরিচিতরাও দেখতে পারবে।' : lang === 'hi' ? 'यह अजनबी भी देख सकते हैं। "केवल मित्र" करने पर विचार करें।' : 'This will be visible to strangers. Consider "Friends Only".' }
        ]
      }
    };
  }

  if ((q.includes('book') && (q.includes('doctor') || q.includes('appointment'))) || 
      (q.includes('ডাক্তার') && (q.includes('দেখাব') || q.includes('অ্যাপয়েন্টমেন্ট'))) || 
      (q.includes('डॉक्टर') && (q.includes('अपॉइंटमेंट') || q.includes('बुक')))) {
    return {
      text: lang === 'bn' ? "কীভাবে অ্যাপয়েন্টমেন্ট বুক করবেন তার ধাপ নিচে দেওয়া হলো:\n১. Practo অ্যাপ খুলুন।\n২. 'Find Doctors' বা 'Video Consult' এ চাপ দিন।\n৩. বিভাগ বেছে নিন (যেমন, সাধারণ চিকিৎসক, কার্ডিওলজিস্ট)।\n৪. রিভিউ এবং ফি দেখে ডাক্তার বেছে নিন।\n৫. সময় বেছে নিন এবং নিশ্চিত করুন।\n\nডাক্তার দেখানোর অ্যাপয়েন্টমেন্টের সারসংক্ষেপ নিচে দেওয়া হলো:" : lang === 'hi' ? "अपॉइंटमेंट बुक करने का चरण-दर-चरण तरीका यहाँ है:\n१. Practo ऐप खोलें।\n२. 'Find Doctors' या 'Video Consult' पर टैप करें।\n३. विशेषज्ञता चुनें (जैसे, सामान्य चिकित्सक, कार्डियोलॉजिस्ट)।\n४. समीक्षाओं और फीस के आधार पर डॉक्टर चुनें।\n५. उपलब्ध समय चुनें और पुष्टि करें।\n\nआपकी डॉक्टर अपॉइंटमेंट का सारांश नीचे है:" : "Here is how to book an appointment step by step:\n1. Open the Practo app.\n2. Tap 'Find Doctors' or 'Video Consult'.\n3. Select the specialty (e.g., General Physician, Cardiologist).\n4. Choose a doctor based on reviews and fees.\n5. Select an available time slot and confirm.\n\nHere is a summary of your intended doctor appointment:",
      audit: {
        type: 'booking',
        action: lang === 'bn' ? 'ডাক্তারের অ্যাপয়েন্টমেন্ট' : lang === 'hi' ? 'डॉक्टर अपॉइंटमेंट' : 'Book Doctor Appointment',
        details: [
          { label: lang === 'bn' ? 'ডাক্তার' : lang === 'hi' ? 'डॉक्टर' : 'Doctor', val: 'Dr. Rahman (Cardiologist)', safe: true },
          { label: lang === 'bn' ? 'সময়' : lang === 'hi' ? 'समय' : 'Time', val: lang === 'bn' ? 'আগামীকাল, সকাল ১০:০০' : lang === 'hi' ? 'कल, सुबह 10:00 बजे' : 'Tomorrow, 10:00 AM', safe: true },
          { label: lang === 'bn' ? 'ফি' : lang === 'hi' ? 'शुल्क' : 'Fee', val: lang === 'bn' ? '১০০০ টাকা (ক্লিনিকে দিন)' : lang === 'hi' ? '1000 TK (क्लिनिक में दें)' : '1000 TK (Pay at clinic)', safe: true }
        ]
      }
    };
  }

  if ((q.includes('save') && q.includes('contact') && (q.includes('whatsapp') || q.includes('phone'))) || 
      (q.includes('whatsapp') && q.includes('কন্টাক্ট') && q.includes('সেভ')) || 
      (q.includes('whatsapp') && q.includes('संपर्क') && q.includes('सहेजें'))) return r.whatsapp_save;

  if (q.includes('whatsapp') && (q.includes('photo') || q.includes('picture') || q.includes('ছবি'))) return r.photo;
  if (q.includes('whatsapp') || q.includes('message') || q.includes('মেসেজ')) return r.whatsapp;
  if (q.includes('facebook') || q.includes('fb') || q.includes('ফেসবুক')) return r.facebook;
  if (q.includes('gmail') || q.includes('email') || q.includes('ইমেইল')) return r.gmail;
  if (q.includes('bkash') || q.includes('bKash') || q.includes('বিকাশ')) return r.bkash;
  if (q.includes('google pay') || q.includes('gpay') || q.includes('গুগল পে')) return r.googlepay;
  if (q.includes('paypal') || q.includes('পেপ্যাল')) return r.paypal;
  if (q.includes('amazon') || q.includes('শপিং') || q.includes('shopping')) return r.amazon;
  if (q.includes('booking') || q.includes('হোটেল') || q.includes('hotel')) return r.booking;
  if (q.includes('practo') || q.includes('doctor') || q.includes('ডাক্তার')) return r.practo;
  if (q.includes('otp') || q.includes('code') || q.includes('কোড')) return r.otp;
  if (q.includes('scam') || q.includes('fraud') || q.includes('safe') || q.includes('প্রতারণা') || q.includes('সন্দেহজনক')) return r.scam;
  return r.fallback;
};

export const PRACTICE_TASKS = {
  whatsapp: [
    { id:'wa1', level:'Beginner', levelBn:'শুরু', levelHi:'शुरुआती', title:'Send a simple message', titleBn:'সাধারণ মেসেজ পাঠান', titleHi:'सरल संदेश भेजें', steps:{en:['Tap the chat bubble to start a new chat.','Select any contact.','Tap the bottom text box and type "Hello".','Tap the green arrow to send.'],bn:['চ্যাট আইকনে চাপ দিন।','যেকোনো কন্টাক্ট বেছে নিন।','নিচের টেক্সট বক্সে "হ্যালো" লিখুন।','সবুজ তীর চিহ্নে চাপ দিয়ে পাঠান।'],hi:['नया चैट शुरू करने के लिए चैट बबल पर टैप करें।','कोई संपर्क चुनें।','नीचे टेक्स्ट बॉक्स पर टैप करें और "Hello" टाइप करें।','भेजने के लिए हरे तीर पर टैप करें।']} },
    { id:'wa2', level:'Intermediate', levelBn:'মাঝারি', levelHi:'मध्यम', title:'Make a video call', titleBn:'ভিডিও কল করুন', titleHi:'वीडियो कॉल करें', steps:{en:['Open an existing chat.','Look at the top right corner.','Tap the video camera icon.','Wait for the person to answer.'],bn:['একটি চ্যাট খুলুন।','উপরে ডানদিকে তাকান।','ভিডিও ক্যামেরা আইকনে চাপ দিন।','কল ধরার জন্য অপেক্ষা করুন।'],hi:['एक मौजूदा चैट खोलें।','ऊपर दाईं ओर देखें।','वीडियो कैमरा आइकन पर टैप करें।','व्यक्ति के जवाब देने की प्रतीक्षा करें।']} },
    { id:'wa3', level:'Hard', levelBn:'কঠিন', levelHi:'कठिन', title:'Forward a document', titleBn:'ডকুমেন্ট ফরোয়ার্ড করুন', titleHi:'दस्तावेज़ फॉरवर्ड करें', steps:{en:['Open a chat with a document.','Press and hold the document until it is highlighted.','Tap the forward arrow at the top right.','Select another contact and press send.'],bn:['ডকুমেন্ট আছে এমন একটি চ্যাট খুলুন।','ডকুমেন্টটি চেপে ধরে রাখুন।','উপরে ডানদিকে ফরোয়ার্ড তীরে চাপ দিন।','অন্য কন্টাক্ট বেছে নিয়ে পাঠান।'],hi:['दस्तावेज़ वाला एक चैट खोलें।','दस्तावेज़ को तब तक दबाए रखें जब तक वह हाइलाइट न हो जाए।','ऊपर दाईं ओर फॉरवर्ड तीर पर टैप करें।','कोई अन्य संपर्क चुनें और भेजें।']} }
  ],
  facebook: [
    { id:'fb1', level:'Beginner', levelBn:'শুরু', levelHi:'शुरुआती', title:'Like a post', titleBn:'পোস্টে লাইক দিন', titleHi:'पोस्ट लाइक करें', steps:{en:['Scroll down your feed.','Find a post you like.','Tap the "Like" button (thumbs up).'],bn:['আপনার ফিড স্ক্রল করুন।','পছন্দের একটি পোস্ট খুঁজুন।','"Like" বাটনে (থাম্বস আপ) চাপ দিন।'],hi:['अपना फीड स्क्रॉल करें।','पसंद आने वाली पोस्ट ढूंढें।','"Like" बटन (थम्स अप) पर टैप करें।']} },
    { id:'fb2', level:'Intermediate', levelBn:'মাঝারি', levelHi:'मध्यम', title:'Post a photo', titleBn:'ছবি পোস্ট করুন', titleHi:'फोटो पोस्ट करें', steps:{en:['Tap "What\'s on your mind?" at the top.','Tap "Photo/Video".','Select a photo and tap Post.'],bn:['উপরে "What\'s on your mind?" এ চাপ দিন।','"Photo/Video" তে চাপ দিন।','ছবি বেছে নিয়ে Post এ চাপ দিন।'],hi:['ऊपर "What\'s on your mind?" पर टैप करें।','"Photo/Video" पर टैप करें।','एक फोटो चुनें और पोस्ट करें।']} }
  ],
  gmail: [
    { id:'gm1', level:'Beginner', levelBn:'শুরু', levelHi:'शुरुआती', title:'Read an email', titleBn:'ইমেইল পড়ুন', titleHi:'ईमेल पढ़ें', steps:{en:['Look at your inbox list.','Tap on any unread email (bold text).','Read the message safely.'],bn:['ইনবক্সের তালিকা দেখুন।','যেকোনো অপঠিত ইমেইলে চাপ দিন।','নিরাপদে বার্তাটি পড়ুন।'],hi:['अपना इनबॉक्स सूची देखें।','किसी भी अपठित ईमेल (बोल्ड टेक्स्ट) पर टैप करें।','सुरक्षित रूप से संदेश पढ़ें।']} },
    { id:'gm2', level:'Hard', levelBn:'কঠিন', levelHi:'कठिन', title:'Report Scam Email', titleBn:'স্ক্যাম ইমেইল রিপোর্ট করুন', titleHi:'स्कैम ईमेल रिपोर्ट करें', steps:{en:['Open a suspicious email.','Do NOT click any links inside.','Tap the 3 dots at the top right.','Select "Report Spam" or "Report Phishing".'],bn:['সন্দেহজনক ইমেইল খুলুন।','ভেতরের কোনো লিংকে চাপ দেবেন না।','উপরে ডানদিকে ৩টি বিন্দুতে চাপ দিন।','"Report Spam" বেছে নিন।'],hi:['एक संदिग्ध ईमेल खोलें।','अंदर किसी भी लिंक पर क्लिक न करें।','ऊपर दाईं ओर 3 डॉट्स पर टैप करें।','"Report Spam" चुनें।']} }
  ],
  bkash: [
    { id:'bk1', level:'Beginner', levelBn:'শুরু', levelHi:'शुरुआती', title:'Check Balance', titleBn:'ব্যালেন্স চেক করুন', titleHi:'बैलेंस जांचें', steps:{en:['Open the bKash app.','Tap "Tap for Balance" at the top.','Enter your PIN only if asked securely.'],bn:['bKash অ্যাপ খুলুন।','উপরে "Tap for Balance" এ চাপ দিন।','নিরাপদে চাইলে তবেই পিন দিন।'],hi:['bKash ऐप खोलें।','ऊपर "Tap for Balance" पर टैप करें।','सुरक्षित रूप से पूछे जाने पर ही अपना पिन दर्ज करें।']} },
    { id:'bk2', level:'Hard', levelBn:'কঠিন', levelHi:'कठिन', title:'Send Money safely', titleBn:'নিরাপদে টাকা পাঠান', titleHi:'सुरक्षित रूप से पैसे भेजें', steps:{en:['Tap "Send Money".','Enter the recipient number carefully.','Enter amount and your PIN.','Press and hold the bottom button to confirm.'],bn:['"Send Money" তে চাপ দিন।','প্রাপকের নম্বর সাবধানে লিখুন।','পরিমাণ ও পিন দিন।','নিশ্চিত করতে নিচের বাটন চেপে ধরুন।'],hi:['"Send Money" पर टैप करें।','प्राप्तकर्ता का नंबर सावधानी से दर्ज करें।','राशि और अपना पिन दर्ज करें।','पुष्टि करने के लिए नीचे बटन दबाकर रखें।']} }
  ],
  nagad: [
    { id:'ng1', level:'Beginner', levelBn:'শুরু', levelHi:'शुरुआती', title:'Spot an OTP scam', titleBn:'OTP প্রতারণা চিনুন', titleHi:'OTP स्कैम पहचानें', steps:{en:['Read the fake SMS carefully.','Notice it asks for your OTP.','Remember: Never share OTP. Delete the message.'],bn:['ভুয়া SMS টি পড়ুন।','লক্ষ্য করুন এটি OTP চাইছে।','মনে রাখবেন: OTP দেবেন না। মেসেজ মুছুন।'],hi:['नकली SMS को ध्यान से पढ़ें।','ध्यान दें कि यह आपके OTP के लिए पूछता है।','याद रखें: कभी भी OTP शेयर न करें। संदेश हटा दें।']} }
  ],
  googlepay: [
    { id:'gp1', level:'Beginner', levelBn:'শুরু', levelHi:'शुरुआती', title:'Pay a shop (Scan QR)', titleBn:'দোকানে পে করুন (QR)', titleHi:'दुकान पर भुगतान करें (QR)', steps:{en:['Tap "Scan any QR code".','Point your camera at the shop\'s code.','Enter amount and pay.'],bn:['"Scan any QR code" এ চাপ দিন।','দোকানের কোডে ক্যামেরা ধরুন।','পরিমাণ লিখে পে করুন।'],hi:['"Scan any QR code" पर टैप करें।','दुकान के कोड पर अपना कैमरा पॉइंट करें।','राशि दर्ज करें और भुगतान करें।']} },
    { id:'gp2', level:'Hard', levelBn:'কঠিন', levelHi:'कठिन', title:'Pay Contacts safely', titleBn:'নিরাপদে কন্টাক্ট পে করুন', titleHi:'संपर्कों को सुरक्षित भुगतान करें', steps:{en:['Tap "Pay Contacts".','Select a trusted friend.','Enter amount and YOUR PIN. Only enter PIN to send money!'],bn:['"Pay Contacts" এ চাপ দিন।','বিশ্বস্ত বন্ধু বেছে নিন।','পরিমাণ ও পিন দিন। শুধু টাকা পাঠাতে পিন লাগে!'],hi:['"Pay Contacts" पर टैप करें।','एक विश्वसनीय मित्र चुनें।','राशि और अपना पिन दर्ज करें। केवल पैसे भेजने के लिए पिन दर्ज करें!']} }
  ],
  paypal: [
    { id:'pp1', level:'Beginner', levelBn:'শুরু', levelHi:'शुरुआती', title:'Send money', titleBn:'টাকা পাঠান', titleHi:'पैसे भेजें', steps:{en:['Tap the "Send" button.','Enter the email address of the receiver.','Enter the amount and send safely.'],bn:['"Send" বাটনে চাপ দিন।','প্রাপকের ইমেইল লিখুন।','পরিমাণ লিখে নিরাপদে পাঠান।'],hi:['"Send" बटन पर टैप करें।','प्राप्तकर्ता का ईमेल पता दर्ज करें।','राशि दर्ज करें और सुरक्षित रूप से भेजें।']} }
  ],
  booking: [
    { id:'bo1', level:'Beginner', levelBn:'শুরু', levelHi:'शुरुआती', title:'Search a hotel', titleBn:'হোটেল খুঁজুন', titleHi:'होटल खोजें', steps:{en:['Tap the search box and type a city.','Select dates.','Tap the blue Search button.'],bn:['সার্চ বক্সে শহরের নাম লিখুন।','তারিখ বেছে নিন।','নীল সার্চ বাটনে চাপ দিন।'],hi:['खोज बॉक्स पर टैप करें और एक शहर टाइप करें।','तारीखें चुनें।','नीले खोज बटन पर टैप करें।']} },
    { id:'bo2', level:'Intermediate', levelBn:'মাঝারি', levelHi:'मध्यम', title:'Check Reviews', titleBn:'রিভিউ চেক করুন', titleHi:'समीक्षाएं जांचें', steps:{en:['Search for a hotel.','Before booking, tap on the hotel.','Scroll down to read guest reviews.'],bn:['হোটেল খুঁজুন।','বুক করার আগে হোটেলে চাপ দিন।','নিচে গিয়ে গেস্ট রিভিউ পড়ুন।'],hi:['होटल खोजें।','बुकिंग से पहले, होटल पर टैप करें।','अतिथि समीक्षाएं पढ़ने के लिए नीचे स्क्रॉल करें।']} }
  ],
  practo: [
    { id:'pr1', level:'Intermediate', levelBn:'মাঝারি', levelHi:'मध्यम', title:'Book Video Consult', titleBn:'ভিডিও কল বুক করুন', titleHi:'वीडियो कंसल्ट बुक करें', steps:{en:['Tap "Video Consult".','Select a doctor specialty.','Choose a time and confirm your safe home visit.'],bn:['"Video Consult" এ চাপ দিন।','ডাক্তারের বিভাগ বেছে নিন।','সময় বেছে নিয়ে বুকিং নিশ্চিত করুন।'],hi:['"Video Consult" पर टैप करें।','डॉक्टर की विशेषता चुनें।','समय चुनें और सुरक्षित बुकिंग की पुष्टि करें।']} }
  ],
  amazon: [
    { id:'am1', level:'Beginner', levelBn:'শুরু', levelHi:'शुरुआती', title:'Search an item', titleBn:'জিনিস খুঁজুন', titleHi:'आइटम खोजें', steps:{en:['Tap the top search bar.','Type what you want to buy.','Look at the star ratings.'],bn:['উপরের সার্চ বারে চাপ দিন।','যা কিনতে চান তা লিখুন।','স্টার রেটিং দেখুন।'],hi:['ऊपर के सर्च बार पर टैप करें।','जो आप खरीदना चाहते हैं वह टाइप करें।','स्टार रेटिंग देखें।']} },
    { id:'am2', level:'Hard', levelBn:'কঠিন', levelHi:'कठिन', title:'Add to Cart securely', titleBn:'নিরাপদে কার্টে যোগ করুন', titleHi:'सुरक्षित रूप से कार्ट में जोड़ें', steps:{en:['Find a 4 or 5-star product.','Tap it to see details.','Tap "Add to Cart" (not Buy Now) so you can review it first.'],bn:['৪ বা ৫ স্টার পণ্য খুঁজুন।','বিস্তারিত দেখতে চাপ দিন।','আগে যাচাই করতে "Add to Cart" এ চাপ দিন।'],hi:['4 या 5-स्टार उत्पाद खोजें।','विवरण देखने के लिए उस पर टैप करें।','पहले समीक्षा करने के लिए "Add to Cart" पर टैप करें।']} }
  ]
};
