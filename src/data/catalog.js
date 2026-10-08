// Shared, localized product vocabulary: skills, mastery levels, learning
// domains, app categories and everyday safety tips. Labels are
// [en, bn, hi, vi] for t(). One place, so every page says the same thing.

export const MASTERY = {
  NEW: ['Just starting', 'শুরু হচ্ছে', 'अभी शुरुआत', 'Mới bắt đầu'],
  GUIDED: ['With some help', 'একটু সাহায্যে', 'थोड़ी मदद से', 'Có trợ giúp'],
  PRACTICING: ['Practising', 'অনুশীলন চলছে', 'अभ्यास जारी', 'Đang luyện'],
  INDEPENDENT: ['On your own', 'নিজে নিজে', 'खुद से', 'Tự làm được'],
  RETAINED: ['Remembered', 'মনে আছে', 'याद है', 'Đã nhớ'],
  MASTERED: ['Mastered', 'দক্ষ', 'महारत', 'Thành thạo'],
};
export const MASTERY_ORDER = Object.keys(MASTERY);

const SKILL_NAMES = {
  'messaging.send_message': ['Sending a message', 'মেসেজ পাঠানো', 'मैसेज भेजना', 'Gửi tin nhắn'],
  'messaging.share_photo': ['Sharing a photo', 'ছবি পাঠানো', 'फोटो भेजना', 'Gửi ảnh'],
  'messaging.video_call': ['Video calls', 'ভিডিও কল', 'वीडियो कॉल', 'Gọi video'],
  'messaging.voice_message': ['Voice messages', 'ভয়েস মেসেজ', 'वॉइस मैसेज', 'Tin nhắn thoại'],
  'messaging.share_document': ['Sending a document', 'ডকুমেন্ট পাঠানো', 'दस्तावेज़ भेजना', 'Gửi tài liệu'],
  'payments.send_money': ['Sending money safely', 'নিরাপদে টাকা পাঠানো', 'सुरक्षित पैसे भेजना', 'Chuyển tiền an toàn'],
  'payments.pay_merchant': ['Paying a shop', 'দোকানে পেমেন্ট', 'दुकान पर भुगतान', 'Thanh toán cửa hàng'],
  'payments.check_balance': ['Checking your balance', 'ব্যালেন্স দেখা', 'बैलेंस देखना', 'Xem số dư'],
  'payments.recharge': ['Mobile recharge', 'মোবাইল রিচার্জ', 'मोबाइल रिचार्ज', 'Nạp tiền điện thoại'],
  'payments.pay_bill': ['Paying a bill', 'বিল পরিশোধ', 'बिल भरना', 'Thanh toán hóa đơn'],
  'safety.recognise_scam': ['Spotting scams', 'প্রতারণা চেনা', 'धोखा पहचानना', 'Nhận biết lừa đảo'],
  'safety.recognise_phishing': ['Spotting fake emails', 'ভুয়া ইমেইল চেনা', 'नकली ईमेल पहचानना', 'Nhận ra email giả'],
  'safety.verify_identity': ['Checking who is really asking', 'আসলে কে চাইছে যাচাই', 'असल में कौन मांग रहा है जांचना', 'Kiểm tra ai đang thật sự hỏi'],
  'safety.otp_scam': ['Keeping codes secret', 'কোড গোপন রাখা', 'कोड गुप्त रखना', 'Giữ bí mật mã OTP'],
  'safety.report_scam': ['Reporting a scam', 'প্রতারণা রিপোর্ট করা', 'धोखे की रिपोर्ट करना', 'Báo cáo lừa đảo'],
  'safety.account_security': ['Protecting your account', 'অ্যাকাউন্ট সুরক্ষা', 'अकाउंट सुरक्षा', 'Bảo vệ tài khoản'],
  'social.group_chat': ['Group chats', 'গ্রুপ চ্যাট', 'ग्रुप चैट', 'Trò chuyện nhóm'],
  'social.friend_requests': ['Friend requests', 'ফ্রেন্ড রিকোয়েস্ট', 'फ्रेंड रिक्वेस्ट', 'Lời mời kết bạn'],
  'social.post_photo': ['Posting a photo', 'ছবি পোস্ট করা', 'फोटो पोस्ट करना', 'Đăng ảnh'],
  'social.react_post': ['Reacting to posts', 'পোস্টে প্রতিক্রিয়া', 'पोस्ट पर प्रतिक्रिया', 'Bày tỏ cảm xúc'],
  'email.read': ['Reading and replying to email', 'ইমেইল পড়া ও উত্তর দেওয়া', 'ईमेल पढ़ना और जवाब देना', 'Đọc và trả lời email'],
  'email.attach_file': ['Attaching a file', 'ফাইল যুক্ত করা', 'फ़ाइल जोड़ना', 'Đính kèm tệp'],
  'info.check_forward': ['Checking forwarded news', 'ফরোয়ার্ড খবর যাচাই', 'फॉरवर्ड खबर जांचना', 'Kiểm tra tin chuyển tiếp'],
  'ai.basics': ['Understanding AI', 'এআই বোঝা', 'AI समझना', 'Hiểu về AI'],
  'privacy.post_audience': ['Who sees your posts', 'কে পোস্ট দেখে', 'पोस्ट कौन देखता है', 'Ai xem bài đăng'],
  'health.book_appointment': ['Booking a doctor', 'ডাক্তার বুক করা', 'डॉक्टर बुक करना', 'Đặt lịch bác sĩ'],
  'shopping.order_safely': ['Ordering online safely', 'নিরাপদে অনলাইন অর্ডার', 'सुरक्षित ऑनलाइन ऑर्डर', 'Mua hàng trực tuyến an toàn'],
  'travel.book_hotel': ['Finding a hotel', 'হোটেল খোঁজা', 'होटल ढूंढना', 'Tìm khách sạn'],
  'travel.cancel_booking': ['Cancelling a booking', 'বুকিং বাতিল করা', 'बुकिंग रद्द करना', 'Hủy đặt phòng'],
  'shopping.track_order': ['Tracking an order', 'অর্ডার কোথায় আছে দেখা', 'ऑर्डर ट्रैक करना', 'Theo dõi đơn hàng'],
  'shopping.return_item': ['Returning an item', 'জিনিস ফেরত দেওয়া', 'सामान लौटाना', 'Trả lại hàng'],
  'health.video_consult': ['Seeing a doctor on video', 'ভিডিওতে ডাক্তার দেখানো', 'वीडियो पर डॉक्टर को दिखाना', 'Khám bác sĩ qua video'],
  'health.cancel_appointment': ['Changing an appointment', 'অ্যাপয়েন্টমেন্ট বদলানো', 'अपॉइंटमेंट बदलना', 'Đổi lịch khám'],
  'social.save_post': ['Saving a post', 'পোস্ট সেভ করা', 'पोस्ट सेव करना', 'Lưu bài viết'],
};

export function skillName(key, t) {
  if (SKILL_NAMES[key]) return t(...SKILL_NAMES[key]);
  const tail = String(key || '').split('.').pop().replace(/_/g, ' ');
  return tail.charAt(0).toUpperCase() + tail.slice(1);
}

// Learning domains (Learn page sections).
export const DOMAINS = [
  { id: 'SOCIAL_COMMUNICATION', label: ['Talking with people', 'মানুষের সঙ্গে কথা', 'लोगों से बातचीत', 'Trò chuyện với mọi người'], tone: 'brand' },
  { id: 'DIGITAL_OPERATIONS', label: ['Everyday tasks', 'প্রতিদিনের কাজ', 'रोज़ के काम', 'Việc hằng ngày'], tone: 'gold' },
  { id: 'DIGITAL_SAFETY', label: ['Staying safe', 'নিরাপদ থাকা', 'सुरक्षित रहना', 'Giữ an toàn'], tone: 'coral' },
  { id: 'INFORMATION_LITERACY', label: ['Is it true?', 'এটা কি সত্যি?', 'क्या यह सच है?', 'Có thật không?'], tone: 'info' },
  { id: 'AI_PRIVACY_LITERACY', label: ['AI & privacy', 'এআই ও গোপনীয়তা', 'AI और निजता', 'AI & quyền riêng tư'], tone: 'neutral' },
];

export const APP_CATEGORIES = {
  MESSAGING: ['Messaging', 'মেসেজিং', 'मैसेजिंग', 'Nhắn tin'],
  SOCIAL: ['Social', 'সামাজিক', 'सोशल', 'Mạng xã hội'],
  EMAIL: ['Email', 'ইমেইল', 'ईमेल', 'Email'],
  PAYMENT: ['Payments', 'পেমেন্ট', 'भुगतान', 'Thanh toán'],
  SHOPPING: ['Shopping', 'কেনাকাটা', 'खरीदारी', 'Mua sắm'],
  HEALTHCARE: ['Health appointments', 'স্বাস্থ্য অ্যাপয়েন্টমেন্ট', 'स्वास्थ्य अपॉइंटमेंट', 'Đặt lịch khám'],
  TRAVEL: ['Travel', 'ভ্রমণ', 'यात्रा', 'Du lịch'],
};
export const APP_CATEGORY_ORDER = ['MESSAGING', 'SOCIAL', 'EMAIL', 'PAYMENT', 'SHOPPING', 'HEALTHCARE', 'TRAVEL'];

export const DIFFICULTY = {
  BEGINNER: ['Beginner', 'শুরুর স্তর', 'शुरुआती', 'Cơ bản'],
  INTERMEDIATE: ['Intermediate', 'মাঝারি', 'मध्यम', 'Trung bình'],
  ADVANCED: ['Advanced', 'উন্নত', 'उन्नत', 'Nâng cao'],
};

// Step-by-step lessons for every everyday app, shown on Learn as one
// tab per app (and used by Home to suggest a first lesson).
export const FEATURED_APPS = [
  { slug: 'whatsapp', lessons: ['whatsapp-send-message', 'whatsapp-send-photo', 'whatsapp-video-call', 'whatsapp-voice-message', 'group-chat-basics'] },
  { slug: 'facebook', lessons: ['facebook-share-photo', 'facebook-friend-request-safely', 'facebook-report-scam', 'who-can-see-my-post'] },
  { slug: 'messenger', lessons: ['messenger-send-message', 'messenger-video-call', 'messenger-spot-fake-friend'] },
  { slug: 'imo', lessons: ['imo-video-call', 'imo-voice-message', 'imo-protect-account'] },
  { slug: 'gmail', lessons: ['gmail-read-reply', 'gmail-send-photo', 'gmail-spot-fake-email'] },
  { slug: 'bkash', lessons: ['bkash-send-money', 'bkash-check-balance', 'bkash-mobile-recharge'] },
  { slug: 'nagad', lessons: ['nagad-send-money-safely', 'nagad-check-balance', 'nagad-otp-call-scam'] },
  { slug: 'momo', lessons: ['momo-transfer-money', 'momo-pay-bill', 'momo-check-balance'] },
  { slug: 'googlepay', lessons: ['googlepay-pay', 'googlepay-send-to-contact', 'googlepay-check-balance'] },
  { slug: 'paypal', lessons: ['paypal-send-money', 'paypal-check-activity', 'paypal-spot-fake-email'] },
  { slug: 'amazon', lessons: ['amazon-order-safely', 'amazon-track-order', 'amazon-return-item'] },
  { slug: 'booking', lessons: ['booking-find-hotel', 'booking-cancel-free', 'booking-fake-payment-message'] },
  { slug: 'practo', lessons: ['practo-book-doctor', 'practo-video-consult', 'practo-cancel-appointment'] },
];

export const SAFETY_TIPS = [
  ['Guidia, your bank, bKash and Nagad will never ask for your PIN or OTP.', 'Guidia, আপনার ব্যাংক, বিকাশ বা নগদ কখনো আপনার পিন বা ওটিপি চাইবে না।', 'Guidia, आपका बैंक या कोई भी भुगतान ऐप कभी आपका पिन या ओटीपी नहीं मांगेगा।', 'Guidia, ngân hàng hay ví điện tử sẽ không bao giờ hỏi mã PIN hoặc OTP của bạn.'],
  ['A name or photo in a message is not proof of who sent it. Call back on a number you already trust.', 'মেসেজে নাম বা ছবি থাকলেই প্রমাণ হয় না কে পাঠিয়েছে। আগে থেকে জানা নম্বরে ফোন করে নিন।', 'मैसेज में नाम या फोटो होना सबूत नहीं है। पहले से भरोसेमंद नंबर पर फोन करें।', 'Tên hay ảnh trong tin nhắn không chứng minh ai đã gửi. Hãy gọi lại số bạn đã tin tưởng.'],
  ['When a message says "urgent", slow down. Real organisations give you time.', 'মেসেজে "জরুরি" লেখা থাকলে ধীরে চলুন। আসল প্রতিষ্ঠান সময় দেয়।', 'जब मैसेज "जरूरी" कहे, तो धीरे चलें। असली संस्थाएं समय देती हैं।', 'Khi tin nhắn ghi "khẩn cấp", hãy chậm lại. Tổ chức thật luôn cho bạn thời gian.'],
  ['If a friend sends a new friend request, call them first. Their account may have been copied.', 'কোনো বন্ধু নতুন ফ্রেন্ড রিকোয়েস্ট পাঠালে আগে ফোন করুন। তাঁর অ্যাকাউন্ট নকল হতে পারে।', 'कोई दोस्त नई फ्रेंड रिक्वेस्ट भेजे तो पहले फोन करें। उसका अकाउंट नकल हो सकता है।', 'Nếu bạn bè gửi lời mời kết bạn mới, hãy gọi hỏi trước. Tài khoản của họ có thể bị giả mạo.'],
  ['Never type a code you received by SMS into a page someone else sent you.', 'এসএমএসে পাওয়া কোড কখনো অন্য কারও পাঠানো পেজে লিখবেন না।', 'SMS में मिला कोड कभी किसी और के भेजे पेज पर न लिखें।', 'Không bao giờ nhập mã nhận qua tin nhắn vào trang do người khác gửi.'],
];

export function tipOfTheDay(offset = 0) {
  const day = Math.floor(Date.now() / 86_400_000);
  return SAFETY_TIPS[(day + offset) % SAFETY_TIPS.length];
}
