// Scam Practice — synthetic training messages. None of these are real
// incidents, numbers or links. Genuine messages are included on purpose:
// spotting what is NOT a scam matters as much as spotting what is.

export const TACTICS = {
  URGENCY: ['It rushes you ("now", "today", "urgent")', 'তাড়াহুড়ো করায় ("এখনই", "আজই", "জরুরি")', 'जल्दबाज़ी करवाता है ("अभी", "आज ही", "जरूरी")', 'Hối thúc bạn ("ngay", "hôm nay", "khẩn cấp")'],
  ASKS_OTP: ['It asks for a code, PIN or password', 'কোড, পিন বা পাসওয়ার্ড চায়', 'कोड, पिन या पासवर्ड मांगता है', 'Đòi mã, mã PIN hoặc mật khẩu'],
  ASKS_MONEY: ['It asks you to send or pay money', 'টাকা পাঠাতে বা দিতে বলে', 'पैसे भेजने या देने को कहता है', 'Yêu cầu bạn chuyển hoặc trả tiền'],
  IMPERSONATION: ['It pretends to be a company or official', 'কোনো প্রতিষ্ঠান বা কর্মকর্তা সেজে আছে', 'किसी कंपनी या अधिकारी होने का दिखावा करता है', 'Giả làm công ty hoặc cơ quan'],
  PRIZE: ['A prize you never entered for', 'এমন পুরস্কার যেটার জন্য আপনি অংশই নেননি', 'ऐसा इनाम जिसके लिए आपने भाग ही नहीं लिया', 'Giải thưởng bạn chưa từng tham gia'],
  SUSPICIOUS_LINK: ['A strange or shortened link', 'অদ্ভুত বা ছোট করা লিংক', 'अजीब या छोटा किया हुआ लिंक', 'Đường link lạ hoặc rút gọn'],
  FAMILY_EMERGENCY: ['A "family member" in sudden trouble', 'হঠাৎ বিপদে পড়া "পরিবারের সদস্য"', 'अचानक मुसीबत में "परिवार का सदस्य"', '"Người thân" gặp chuyện bất ngờ'],
  NEW_NUMBER: ['"This is my new number" — you can\'t check who it is', '"এটা আমার নতুন নম্বর" — কে তা যাচাই করা যায় না', '"यह मेरा नया नंबर है" — पता नहीं चल सकता कौन है', '"Đây là số mới của con" — không kiểm tra được là ai'],
  SECRECY: ['It asks you to keep it secret', 'গোপন রাখতে বলে', 'इसे छिपाकर रखने को कहता है', 'Yêu cầu bạn giữ bí mật'],
  NO_ASK: ['It asks for nothing sensitive', 'কোনো গোপন তথ্য চায় না', 'कोई गोपनीय जानकारी नहीं मांगता', 'Không đòi thông tin nhạy cảm nào'],
  WARNS_YOU: ['It warns you not to share the code — a good sign', 'কোড কাউকে না দিতে সতর্ক করে — ভালো লক্ষণ', 'कोड किसी को न देने की चेतावनी देता है — अच्छा संकेत', 'Nhắc bạn không chia sẻ mã — dấu hiệu tốt'],
  EXPECTED: ['It is something you were expecting', 'এটি আপনি আশা করছিলেন', 'यह आप उम्मीद कर रहे थे', 'Đó là điều bạn đang chờ'],
};

export const SCAM_PRACTICE = [
  {
    id: 'bank-suspend', isScam: true, channel: 'SMS', from: 'bKash-Alert',
    tactics: ['URGENCY', 'SUSPICIOUS_LINK', 'IMPERSONATION'],
    message: {
      en: 'URGENT: Your account will be blocked TODAY. Verify now: http://bkash-verify-now.example',
      bn: 'জরুরি: আজই আপনার অ্যাকাউন্ট বন্ধ হয়ে যাবে। এখনই যাচাই করুন: http://bkash-verify-now.example',
      hi: 'जरूरी: आपका खाता आज ही बंद हो जाएगा। अभी सत्यापित करें: http://bank-verify-now.example',
      vi: 'KHẨN: Tài khoản của bạn sẽ bị khóa HÔM NAY. Xác minh ngay: http://vi-verify-now.example',
    },
  },
  {
    id: 'new-number', isScam: true, channel: 'WhatsApp', from: '+880 1XX XXX XXX',
    tactics: ['FAMILY_EMERGENCY', 'NEW_NUMBER', 'ASKS_MONEY', 'URGENCY'],
    message: {
      en: 'Abba it\'s me, my phone broke so this is my new number. I\'m in trouble, please send 15,000 taka right now, I\'ll explain later.',
      bn: 'আব্বা আমি, আমার ফোন নষ্ট তাই এটা নতুন নম্বর। আমি বিপদে আছি, এখনই ১৫,০০০ টাকা পাঠাও, পরে বলব।',
      hi: 'पापा मैं हूँ, मेरा फोन टूट गया, यह मेरा नया नंबर है। मैं मुसीबत में हूँ, अभी 15,000 रुपये भेज दो, बाद में बताऊंगा।',
      vi: 'Bố ơi con đây, điện thoại con hỏng nên đây là số mới. Con đang gặp chuyện, bố chuyển ngay 5 triệu nhé, con giải thích sau.',
    },
  },
  {
    id: 'real-otp', isScam: false, channel: 'SMS', from: 'YourBank',
    tactics: ['WARNS_YOU', 'EXPECTED'],
    message: {
      en: 'Your one-time code is 482913. It expires in 5 minutes. Never share this code with anyone, including bank staff.',
      bn: 'আপনার ওয়ান-টাইম কোড 482913। ৫ মিনিটে মেয়াদ শেষ হবে। ব্যাংকের কর্মীসহ কাউকে এই কোড দেবেন না।',
      hi: 'आपका वन-टाइम कोड 482913 है। यह 5 मिनट में खत्म हो जाएगा। बैंक कर्मचारी समेत किसी को यह कोड न बताएं।',
      vi: 'Mã dùng một lần của bạn là 482913, hết hạn sau 5 phút. Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên ngân hàng.',
    },
    note: ['This is safe ONLY if you just asked for a code yourself. Use it in the app — never read it out to anyone.', 'এটি নিরাপদ শুধু তখনই যদি আপনি নিজেই কোড চেয়ে থাকেন। অ্যাপে ব্যবহার করুন — কাউকে বলবেন না।', 'यह तभी सुरक्षित है जब आपने खुद अभी कोड मांगा हो। ऐप में इस्तेमाल करें — किसी को न बताएं।', 'Chỉ an toàn nếu chính bạn vừa yêu cầu mã. Hãy dùng trong ứng dụng — đừng đọc cho ai nghe.'],
  },
  {
    id: 'prize', isScam: true, channel: 'SMS', from: 'Lucky Draw',
    tactics: ['PRIZE', 'ASKS_MONEY'],
    message: {
      en: 'Congratulations! Your number won a new phone. Pay a 500 taka delivery fee to receive it today.',
      bn: 'অভিনন্দন! আপনার নম্বর একটি নতুন ফোন জিতেছে। আজই পেতে ৫০০ টাকা ডেলিভারি চার্জ দিন।',
      hi: 'बधाई हो! आपके नंबर ने नया फोन जीता है। आज पाने के लिए 500 रुपये डिलीवरी शुल्क दें।',
      vi: 'Chúc mừng! Số của bạn trúng một điện thoại mới. Trả 50.000đ phí giao hàng để nhận hôm nay.',
    },
  },
  {
    id: 'support-code', isScam: true, channel: 'Phone call', from: 'Customer support',
    tactics: ['ASKS_OTP', 'IMPERSONATION'],
    message: {
      en: '"Hello, I\'m calling from customer support. We sent you a code — please tell me the code so we can fix your account."',
      bn: '"হ্যালো, আমি কাস্টমার সাপোর্ট থেকে বলছি। আপনাকে একটা কোড পাঠিয়েছি — অ্যাকাউন্ট ঠিক করতে কোডটা বলুন।"',
      hi: '"नमस्ते, मैं कस्टमर सपोर्ट से बोल रहा हूँ। हमने आपको एक कोड भेजा है — खाता ठीक करने के लिए कोड बताइए।"',
      vi: '"Xin chào, tôi gọi từ bộ phận chăm sóc khách hàng. Chúng tôi vừa gửi mã — bác đọc mã giúp để sửa tài khoản nhé."',
    },
  },
  {
    id: 'appointment', isScam: false, channel: 'SMS', from: 'City Clinic',
    tactics: ['NO_ASK', 'EXPECTED'],
    message: {
      en: 'Reminder: your appointment with Dr. Rahman is on Tuesday at 10:00. Reply C to cancel.',
      bn: 'মনে করিয়ে দিচ্ছি: মঙ্গলবার সকাল ১০টায় ডা. রহমানের সাথে আপনার অ্যাপয়েন্টমেন্ট। বাতিল করতে C লিখে উত্তর দিন।',
      hi: 'याद दिलाना: मंगलवार सुबह 10 बजे डॉ. रहमान के साथ आपका अपॉइंटमेंट है। रद्द करने के लिए C लिखकर जवाब दें।',
      vi: 'Nhắc lịch: bạn có hẹn với bác sĩ Rahman vào thứ Ba lúc 10:00. Trả lời C để hủy.',
    },
    note: ['Safe if you booked it. Even so, never send money or codes in reply.', 'আপনি বুক করে থাকলে নিরাপদ। তবুও উত্তরে টাকা বা কোড পাঠাবেন না।', 'अगर आपने बुक किया है तो सुरक्षित। फिर भी जवाब में पैसे या कोड न भेजें।', 'An toàn nếu chính bạn đã đặt lịch. Dù vậy, đừng gửi tiền hay mã khi trả lời.'],
  },
  {
    id: 'parcel', isScam: true, channel: 'SMS', from: 'Courier',
    tactics: ['SUSPICIOUS_LINK', 'ASKS_MONEY', 'IMPERSONATION'],
    message: {
      en: 'Your parcel is on hold. Pay a small customs fee to release it: https://bit.ly/parcel-fee-example',
      bn: 'আপনার পার্সেল আটকে আছে। ছাড়াতে সামান্য কাস্টমস ফি দিন: https://bit.ly/parcel-fee-example',
      hi: 'आपका पार्सल रुका हुआ है। छुड़ाने के लिए थोड़ा कस्टम शुल्क दें: https://bit.ly/parcel-fee-example',
      vi: 'Bưu kiện của bạn đang bị giữ. Trả một khoản phí hải quan nhỏ để nhận: https://bit.ly/parcel-fee-example',
    },
  },
  {
    id: 'voice-clone', isScam: true, channel: 'Phone call', from: 'Unknown number',
    tactics: ['FAMILY_EMERGENCY', 'SECRECY', 'URGENCY', 'ASKS_MONEY'],
    message: {
      en: '"Grandma, it\'s me! I\'ve had an accident. Please don\'t tell Mum — just send the money quickly." (The voice sounds just like your grandson.)',
      bn: '"নানু, আমি! আমার দুর্ঘটনা হয়েছে। আম্মুকে বোলো না — শুধু তাড়াতাড়ি টাকা পাঠাও।" (গলাটা ঠিক আপনার নাতির মতো।)',
      hi: '"दादी, मैं हूँ! मेरा एक्सीडेंट हो गया। मम्मी को मत बताना — बस जल्दी पैसे भेज दो।" (आवाज़ बिल्कुल आपके पोते जैसी है।)',
      vi: '"Bà ơi, cháu đây! Cháu bị tai nạn. Bà đừng nói với mẹ — gửi tiền cho cháu nhanh nhé." (Giọng nghe y hệt cháu bạn.)',
    },
    note: ['AI can copy a voice. Hang up and call your grandson back on the number you already have.', 'এআই কণ্ঠ নকল করতে পারে। ফোন কেটে নাতির জানা নম্বরে নিজে ফোন করুন।', 'AI आवाज़ की नकल कर सकता है। फोन काटें और पोते के जाने-पहचाने नंबर पर खुद फोन करें।', 'AI có thể bắt chước giọng nói. Hãy cúp máy và tự gọi lại số của cháu mà bạn đã có.'],
  },
];

// Why each clue matters — shown when a learner taps a clue chip.
export const TACTIC_WHY = {
  URGENCY: ['Pressure stops you thinking. Real organisations give you time to check.', 'চাপ দিলে ভাবার সময় থাকে না। আসল প্রতিষ্ঠান যাচাইয়ের সময় দেয়।', 'दबाव सोचने नहीं देता। असली संस्थाएं जांचने का समय देती हैं।', 'Sự hối thúc khiến bạn không kịp suy nghĩ. Tổ chức thật luôn cho bạn thời gian kiểm tra.'],
  ASKS_OTP: ['A code or PIN is the key to your account. No real company ever asks for it.', 'কোড বা পিন আপনার অ্যাকাউন্টের চাবি। কোনো আসল প্রতিষ্ঠান কখনো তা চায় না।', 'कोड या पिन आपके खाते की चाबी है। कोई असली कंपनी इसे कभी नहीं मांगती।', 'Mã hay PIN là chìa khóa tài khoản. Không công ty thật nào hỏi mã này.'],
  ASKS_MONEY: ['Once money is sent it is very hard to get back. Always check first.', 'টাকা একবার চলে গেলে ফেরত পাওয়া খুব কঠিন। সবসময় আগে যাচাই করুন।', 'पैसा एक बार गया तो वापस पाना बहुत मुश्किल है। हमेशा पहले जांचें।', 'Tiền đã chuyển thì rất khó lấy lại. Luôn kiểm tra trước.'],
  IMPERSONATION: ['Anyone can type a company name. Contact the company yourself using its official app or number.', 'যে কেউ প্রতিষ্ঠানের নাম লিখতে পারে। অফিসিয়াল অ্যাপ বা নম্বরে নিজে যোগাযোগ করুন।', 'कोई भी कंपनी का नाम लिख सकता है। आधिकारिक ऐप या नंबर से खुद संपर्क करें।', 'Ai cũng có thể ghi tên công ty. Hãy tự liên hệ qua ứng dụng hoặc số chính thức.'],
  PRIZE: ['If you never entered, you cannot have won. "Prizes" are bait to get money or details.', 'অংশ না নিলে জেতা সম্ভব নয়। "পুরস্কার" হলো টাকা বা তথ্য নেওয়ার টোপ।', 'भाग नहीं लिया तो जीत नहीं सकते। "इनाम" पैसे या जानकारी का चारा है।', 'Không tham gia thì không thể trúng. "Giải thưởng" là mồi để lấy tiền hoặc thông tin.'],
  SUSPICIOUS_LINK: ['Strange links can lead to fake pages that copy real ones. Open the official app instead.', 'অদ্ভুত লিংক আসলের মতো দেখতে ভুয়া পেজে নিয়ে যেতে পারে। তার বদলে অফিসিয়াল অ্যাপ খুলুন।', 'अजीब लिंक असली जैसे दिखने वाले नकली पेज पर ले जा सकते हैं। इसके बजाय आधिकारिक ऐप खोलें।', 'Link lạ có thể dẫn tới trang giả trông như thật. Hãy mở ứng dụng chính thức.'],
  FAMILY_EMERGENCY: ['Scammers use love and fear. Call the family member on the number you already have.', 'প্রতারকেরা ভালোবাসা ও ভয় কাজে লাগায়। আগে থেকে থাকা নম্বরে পরিবারের সদস্যকে ফোন করুন।', 'धोखेबाज़ प्यार और डर का फायदा उठाते हैं। पहले से मौजूद नंबर पर परिवार को फोन करें।', 'Kẻ gian lợi dụng tình thương và nỗi sợ. Hãy gọi người thân bằng số bạn đã có.'],
  NEW_NUMBER: ['A new number cannot prove who it is. Check by calling the old, saved number.', 'নতুন নম্বর দিয়ে প্রমাণ হয় না কে। পুরোনো সেভ করা নম্বরে ফোন করে যাচাই করুন।', 'नया नंबर साबित नहीं करता कि कौन है। पुराने सेव नंबर पर फोन करके जांचें।', 'Số mới không chứng minh được là ai. Hãy gọi vào số cũ đã lưu để kiểm tra.'],
  SECRECY: ['"Don\'t tell anyone" is how scammers stop you from getting help. Tell someone you trust.', '"কাউকে বলবেন না" — এভাবে প্রতারক আপনাকে সাহায্য পেতে বাধা দেয়। বিশ্বস্ত কাউকে বলুন।', '"किसी को मत बताना" — ऐसे धोखेबाज़ आपको मदद लेने से रोकते हैं। किसी भरोसेमंद को बताएं।', '"Đừng nói với ai" là cách kẻ gian ngăn bạn tìm trợ giúp. Hãy kể với người bạn tin.'],
  NO_ASK: ['It does not ask for money, codes or details — a good sign it is genuine.', 'টাকা, কোড বা তথ্য চায় না — আসল হওয়ার ভালো লক্ষণ।', 'पैसे, कोड या जानकारी नहीं मांगता — असली होने का अच्छा संकेत।', 'Không đòi tiền, mã hay thông tin — dấu hiệu tốt cho thấy là thật.'],
  WARNS_YOU: ['Real services remind you never to share your code. Scammers never do.', 'আসল সেবা কোড না দিতে মনে করিয়ে দেয়। প্রতারক কখনো তা করে না।', 'असली सेवाएं कोड न बताने की याद दिलाती हैं। धोखेबाज़ कभी नहीं।', 'Dịch vụ thật luôn nhắc bạn không chia sẻ mã. Kẻ gian thì không bao giờ.'],
  EXPECTED: ['You started this yourself, so the message makes sense.', 'এটি আপনিই শুরু করেছেন, তাই মেসেজটি স্বাভাবিক।', 'यह आपने खुद शुरू किया था, इसलिए मैसेज स्वाभाविक है।', 'Chính bạn bắt đầu việc này nên tin nhắn là hợp lý.'],
};
