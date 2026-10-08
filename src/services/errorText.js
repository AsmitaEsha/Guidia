// The API answers in English. This turns its user-facing messages into the
// person's language: exact message first, then a friendly line per error
// code, then a plain "something went wrong". English is passed through.

// English message → [Bengali, Hindi, Vietnamese]
const MESSAGES = {
  "Guidia's server isn't answering right now. Please try again in a moment.": ['গাইডিয়ার সার্ভার এখন সাড়া দিচ্ছে না। একটু পরে আবার চেষ্টা করুন।', 'गाइडिया का सर्वर अभी जवाब नहीं दे रहा। थोड़ी देर में फिर कोशिश करें।', 'Máy chủ Guidia đang không phản hồi. Vui lòng thử lại sau ít phút.'],
  "Guidia can't reach the internet right now. Please check your connection and try again.": ['গাইডিয়া এখন ইন্টারনেটে যেতে পারছে না। কানেকশন দেখে আবার চেষ্টা করুন।', 'गाइडिया अभी इंटरनेट से नहीं जुड़ पा रहा। कनेक्शन देखकर फिर कोशिश करें।', 'Guidia không kết nối được Internet. Hãy kiểm tra kết nối rồi thử lại.'],
  'Something went wrong. Please try again.': ['কিছু একটা গোলমাল হয়েছে। আবার চেষ্টা করুন।', 'कुछ गड़बड़ हो गई। फिर से कोशिश करें।', 'Đã có lỗi xảy ra. Vui lòng thử lại.'],
  'Incorrect email or password.': ['ইমেইল বা পাসওয়ার্ড ভুল।', 'ईमेल या पासवर्ड गलत है।', 'Email hoặc mật khẩu không đúng.'],
  'That password is not correct.': ['পাসওয়ার্ডটা ঠিক নয়।', 'यह पासवर्ड सही नहीं है।', 'Mật khẩu không đúng.'],
  'An account with this email already exists.': ['এই ইমেইলে আগেই একটা অ্যাকাউন্ট আছে।', 'इस ईमेल से पहले से एक खाता है।', 'Email này đã có tài khoản.'],
  'Please choose a stronger password (at least 8 characters, with an uppercase letter, a lowercase letter, and a number).': ['আরও শক্ত পাসওয়ার্ড দিন (অন্তত ৮ অক্ষর, একটা বড় হাতের অক্ষর, একটা ছোট হাতের অক্ষর আর একটা সংখ্যা)।', 'मज़बूत पासवर्ड चुनें (कम से कम 8 अक्षर, एक बड़ा अक्षर, एक छोटा अक्षर और एक अंक)।', 'Hãy chọn mật khẩu mạnh hơn (ít nhất 8 ký tự, có chữ hoa, chữ thường và số).'],
  'Those passwords do not match.': ['দুটো পাসওয়ার্ড মিলছে না।', 'दोनों पासवर्ड मेल नहीं खाते।', 'Hai mật khẩu không khớp.'],
  'Please enter a valid email address.': ['সঠিক ইমেইল ঠিকানা দিন।', 'सही ईमेल पता डालें।', 'Vui lòng nhập email hợp lệ.'],
  'Please enter your full name.': ['আপনার পুরো নাম লিখুন।', 'अपना पूरा नाम लिखें।', 'Vui lòng nhập họ và tên.'],
  'Please enter a name.': ['একটা নাম লিখুন।', 'एक नाम लिखें।', 'Vui lòng nhập tên.'],
  'Please enter your password.': ['আপনার পাসওয়ার্ড দিন।', 'अपना पासवर्ड डालें।', 'Vui lòng nhập mật khẩu.'],
  'Please enter a valid age.': ['সঠিক বয়স লিখুন।', 'सही उम्र लिखें।', 'Vui lòng nhập tuổi hợp lệ.'],
  'Please enter the family code.': ['পরিবারের কোডটা দিন।', 'परिवार कोड डालें।', 'Vui lòng nhập mã gia đình.'],
  "That family code didn't work. Please check it, or ask for a new one.": ['পরিবারের কোডটা কাজ করেনি। আবার দেখে নিন, বা নতুন কোড চেয়ে নিন।', 'परिवार कोड काम नहीं किया। जांच लें या नया कोड मांग लें।', 'Mã gia đình không đúng. Hãy kiểm tra lại hoặc xin mã mới.'],
  'This is your own family code. Share it with your family instead.': ['এটা আপনার নিজের কোড। এটা পরিবারের সাথে শেয়ার করুন।', 'यह आपका अपना कोड है। इसे परिवार के साथ शेयर करें।', 'Đây là mã của chính bạn. Hãy gửi nó cho gia đình.'],
  "You can't add yourself as your own trusted person.": ['নিজেকে নিজের বিশ্বস্ত মানুষ হিসেবে যোগ করা যায় না।', 'आप खुद को अपना भरोसेमंद व्यक्ति नहीं बना सकते।', 'Bạn không thể tự thêm mình làm người tin cậy.'],
  'Could not create a family code right now. Please try again.': ['এখন পরিবারের কোড বানানো গেল না। আবার চেষ্টা করুন।', 'अभी परिवार कोड नहीं बन सका। फिर कोशिश करें।', 'Chưa tạo được mã gia đình. Vui lòng thử lại.'],
  'Please add a phone number or an email so they can be reached.': ['যোগাযোগের জন্য একটা ফোন নম্বর বা ইমেইল দিন।', 'संपर्क के लिए फ़ोन नंबर या ईमेल डालें।', 'Hãy thêm số điện thoại hoặc email để liên lạc.'],
  'This person is already invited or connected.': ['এই মানুষটিকে আগেই আমন্ত্রণ জানানো হয়েছে বা যুক্ত আছেন।', 'यह व्यक्ति पहले से आमंत्रित या जुड़ा हुआ है।', 'Người này đã được mời hoặc đã kết nối.'],
  'Your session has expired. Please sign in again.': ['আপনার সেশন শেষ হয়ে গেছে। আবার সাইন ইন করুন।', 'आपका सेशन खत्म हो गया। फिर से साइन इन करें।', 'Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.'],
  'You need to be signed in to do that.': ['এটা করতে সাইন ইন করতে হবে।', 'इसके लिए साइन इन करना होगा।', 'Bạn cần đăng nhập để làm việc này.'],
  "You don't have access to that.": ['এটা দেখার অনুমতি আপনার নেই।', 'आपको इसकी अनुमति नहीं है।', 'Bạn không có quyền truy cập.'],
  'That reset link is invalid or has expired. Please request a new one.': ['রিসেট লিংকটা ঠিক নয় বা মেয়াদ শেষ। নতুন লিংক চেয়ে নিন।', 'रीसेट लिंक गलत है या उसकी मियाद खत्म हो गई। नया लिंक मांगें।', 'Link đặt lại không hợp lệ hoặc đã hết hạn. Hãy yêu cầu link mới.'],
  'Your password has been reset. Please sign in with your new password.': ['পাসওয়ার্ড বদলানো হয়েছে। নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।', 'पासवर्ड बदल गया है। नए पासवर्ड से साइन इन करें।', 'Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.'],
  'Too many attempts. Please wait a few minutes and try again.': ['অনেকবার চেষ্টা হয়েছে। কয়েক মিনিট পরে আবার চেষ্টা করুন।', 'बहुत बार कोशिश हुई। कुछ मिनट बाद फिर कोशिश करें।', 'Thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.'],
  'Too many reset requests. Please try again later.': ['অনেকবার রিসেট চাওয়া হয়েছে। পরে আবার চেষ্টা করুন।', 'बहुत बार रीसेट मांगा गया। बाद में कोशिश करें।', 'Yêu cầu đặt lại quá nhiều. Vui lòng thử lại sau.'],
  'Please slow down a little before asking again.': ['আবার জিজ্ঞেস করার আগে একটু থামুন।', 'दोबारा पूछने से पहले थोड़ा रुकें।', 'Vui lòng chờ một chút trước khi hỏi tiếp.'],
  'Please slow down a little before checking again.': ['আবার যাচাই করার আগে একটু থামুন।', 'दोबारा जांचने से पहले थोड़ा रुकें।', 'Vui lòng chờ một chút trước khi kiểm tra tiếp.'],
  'Please wait a moment before analysing another screenshot.': ['আরেকটা স্ক্রিনশট দেখানোর আগে একটু অপেক্ষা করুন।', 'दूसरा स्क्रीनशॉट दिखाने से पहले थोड़ा रुकें।', 'Vui lòng chờ một chút trước khi gửi ảnh màn hình khác.'],
  'Please wait a moment before requesting more voice playback.': ['আবার শোনার আগে একটু অপেক্ষা করুন।', 'फिर से सुनने से पहले थोड़ा रुकें।', 'Vui lòng chờ một chút trước khi nghe tiếp.'],
  'Please wait a moment and try again.': ['একটু অপেক্ষা করে আবার চেষ্টা করুন।', 'थोड़ा रुककर फिर कोशिश करें।', 'Vui lòng chờ một chút rồi thử lại.'],
  'Your help request is already on its way.': ['আপনার সাহায্যের অনুরোধ আগেই পাঠানো হয়েছে।', 'आपका मदद का अनुरोध पहले ही भेजा जा चुका है।', 'Yêu cầu trợ giúp của bạn đã được gửi đi.'],
  "Screen explanations aren't available right now. You can still ask Guidia in text, or use the scam checker.": ['স্ক্রিন বোঝানো এখন বন্ধ আছে। তবু লিখে গাইডিয়াকে জিজ্ঞেস করতে পারেন, বা প্রতারণা যাচাই ব্যবহার করতে পারেন।', 'स्क्रीन समझाना अभी उपलब्ध नहीं है। आप लिखकर गाइडिया से पूछ सकते हैं या धोखा जांच इस्तेमाल कर सकते हैं।', 'Chưa giải thích được màn hình lúc này. Bạn vẫn có thể hỏi Guidia bằng chữ hoặc dùng công cụ kiểm tra lừa đảo.'],
  "Screen explanations aren't available right now.": ['স্ক্রিন বোঝানো এখন বন্ধ আছে।', 'स्क्रीन समझाना अभी उपलब्ध नहीं है।', 'Chưa giải thích được màn hình lúc này.'],
  "Guidia's AI helper isn't set up yet. You can still use lessons, practice and safety checks.": ['গাইডিয়ার এআই সহকারী এখনো চালু হয়নি। পাঠ, অনুশীলন আর নিরাপত্তা যাচাই ব্যবহার করতে পারেন।', 'गाइडिया का AI सहायक अभी चालू नहीं है। आप पाठ, अभ्यास और सुरक्षा जांच इस्तेमाल कर सकते हैं।', 'Trợ lý AI của Guidia chưa được bật. Bạn vẫn dùng được bài học, luyện tập và kiểm tra an toàn.'],
  "Guidia's AI helper is switched off right now. You can still open Learn, Practice and the scam checker.": ['গাইডিয়ার এআই সহকারী এখন বন্ধ। শেখা, অনুশীলন আর প্রতারণা যাচাই খোলা আছে।', 'गाइडिया का AI सहायक अभी बंद है। सीखें, अभ्यास और धोखा जांच खुले हैं।', 'Trợ lý AI đang tắt. Bạn vẫn mở được Học, Luyện tập và Kiểm tra lừa đảo.'],
  "Guidia's AI helper is not responding right now. Please try again in a moment.": ['গাইডিয়ার এআই সহকারী এখন সাড়া দিচ্ছে না। একটু পরে আবার চেষ্টা করুন।', 'गाइडिया का AI सहायक अभी जवाब नहीं दे रहा। थोड़ी देर में फिर कोशिश करें।', 'Trợ lý AI chưa phản hồi. Vui lòng thử lại sau ít phút.'],
  "Guidia couldn't understand the AI's answer this time. Please try again.": ['এবার এআই-এর উত্তর বোঝা গেল না। আবার চেষ্টা করুন।', 'इस बार AI का जवाब समझ नहीं आया। फिर कोशिश करें।', 'Lần này Guidia không hiểu câu trả lời của AI. Vui lòng thử lại.'],
  "Guidia's own voice isn't available, so your device's voice will be used.": ['গাইডিয়ার নিজের কণ্ঠ এখন নেই, তাই আপনার ফোনের কণ্ঠ ব্যবহার হবে।', 'गाइडिया की अपनी आवाज़ अभी नहीं है, इसलिए आपके फ़ोन की आवाज़ इस्तेमाल होगी।', 'Giọng của Guidia chưa sẵn sàng, nên sẽ dùng giọng của thiết bị.'],
  'Spoken answers are not available right now.': ['এখন উত্তর শুনিয়ে বলা যাচ্ছে না।', 'अभी जवाब बोलकर नहीं सुनाए जा सकते।', 'Chưa đọc to câu trả lời được lúc này.'],
  'Voice input is not available right now. Please type your question.': ['এখন কথা বলে প্রশ্ন করা যাচ্ছে না। প্রশ্নটা লিখে দিন।', 'अभी बोलकर सवाल नहीं पूछ सकते। सवाल लिख दें।', 'Chưa nói được lúc này. Vui lòng gõ câu hỏi.'],
  'Please type a question.': ['একটা প্রশ্ন লিখুন।', 'एक सवाल लिखें।', 'Vui lòng gõ câu hỏi.'],
  'Please paste a link or message to check.': ['যাচাই করতে একটা লিংক বা মেসেজ পেস্ট করুন।', 'जांचने के लिए लिंक या मैसेज पेस्ट करें।', 'Hãy dán link hoặc tin nhắn cần kiểm tra.'],
  'Please choose a screenshot to upload.': ['আপলোড করতে একটা স্ক্রিনশট বেছে নিন।', 'अपलोड करने के लिए स्क्रीनशॉट चुनें।', 'Hãy chọn ảnh màn hình để tải lên.'],
  'Please upload a PNG, JPEG or WEBP screenshot.': ['PNG, JPEG বা WEBP স্ক্রিনশট দিন।', 'PNG, JPEG या WEBP स्क्रीनशॉट डालें।', 'Hãy tải ảnh PNG, JPEG hoặc WEBP.'],
  'That image is too large (max 8 MB).': ['ছবিটা খুব বড় (সর্বোচ্চ ৮ এমবি)।', 'तस्वीर बहुत बड़ी है (ज़्यादा से ज़्यादा 8 MB)।', 'Ảnh quá lớn (tối đa 8 MB).'],
  'That image could not be read. Please try another screenshot.': ['ছবিটা পড়া গেল না। অন্য একটা স্ক্রিনশট দিন।', 'तस्वीर पढ़ी नहीं जा सकी। दूसरा स्क्रीनशॉट डालें।', 'Không đọc được ảnh. Hãy thử ảnh khác.'],
  'This screenshot has been deleted for your privacy. Please take a new one.': ['আপনার গোপনীয়তার জন্য স্ক্রিনশটটা মুছে ফেলা হয়েছে। নতুন একটা নিন।', 'आपकी निजता के लिए स्क्रीनशॉट मिटा दिया गया। नया लें।', 'Ảnh đã được xóa để bảo vệ riêng tư. Hãy chụp ảnh mới.'],
  'This screenshot has been deleted for your privacy.': ['আপনার গোপনীয়তার জন্য স্ক্রিনশটটা মুছে ফেলা হয়েছে।', 'आपकी निजता के लिए स्क्रीनशॉट मिटा दिया गया।', 'Ảnh đã được xóa để bảo vệ riêng tư.'],
  'That recording is too long. Please try a shorter question.': ['রেকর্ডিংটা অনেক লম্বা। আরেকটু ছোট করে বলুন।', 'रिकॉर्डिंग बहुत लंबी है। छोटा सवाल पूछें।', 'Đoạn ghi âm quá dài. Hãy hỏi ngắn hơn.'],
  'No recording was received.': ['কোনো রেকর্ডিং পাওয়া যায়নি।', 'कोई रिकॉर्डिंग नहीं मिली।', 'Không nhận được ghi âm.'],
  'There is not enough practice money in this account.': ['এই অ্যাকাউন্টে যথেষ্ট অনুশীলনের টাকা নেই।', 'इस खाते में अभ्यास के पैसे कम हैं।', 'Tài khoản luyện tập không đủ tiền.'],
  'This task is already finished.': ['এই অনুশীলনটা আগেই শেষ হয়েছে।', 'यह अभ्यास पहले ही पूरा हो चुका है।', 'Bài luyện tập này đã xong.'],
  'This task changed in another window. Please refresh.': ['অন্য একটা উইন্ডোতে এটা বদলেছে। পেজটা রিফ্রেশ করুন।', 'यह दूसरी विंडो में बदल गया। पेज रिफ़्रेश करें।', 'Mục này đã thay đổi ở cửa sổ khác. Hãy tải lại trang.'],
  'This help request was just updated. Please refresh.': ['সাহায্যের অনুরোধটা এইমাত্র বদলেছে। রিফ্রেশ করুন।', 'मदद का अनुरोध अभी बदला है। रिफ़्रेश करें।', 'Yêu cầu trợ giúp vừa được cập nhật. Hãy tải lại.'],
  'This help request has already moved on.': ['এই সাহায্যের অনুরোধ নিয়ে আগেই কাজ হয়েছে।', 'इस मदद के अनुरोध पर पहले ही काम हो चुका है।', 'Yêu cầu trợ giúp này đã được xử lý.'],
  'This request was already answered.': ['এই অনুরোধের উত্তর আগেই দেওয়া হয়েছে।', 'इस अनुरोध का जवाब पहले ही दिया जा चुका है।', 'Yêu cầu này đã được trả lời.'],
  'Guidia only carries out practice actions. Real payments happen in the official app.': ['গাইডিয়া শুধু অনুশীলন করায়। আসল পেমেন্ট হয় আসল অ্যাপে।', 'गाइडिया सिर्फ़ अभ्यास कराता है। असली भुगतान असली ऐप में होता है।', 'Guidia chỉ cho luyện tập. Thanh toán thật diễn ra trong ứng dụng chính thức.'],
  'Practice payments are paused right now.': ['অনুশীলনের পেমেন্ট এখন বন্ধ আছে।', 'अभ्यास भुगतान अभी रुके हुए हैं।', 'Thanh toán luyện tập đang tạm dừng.'],
  'Nothing to update.': ['বদলানোর মতো কিছু নেই।', 'बदलने के लिए कुछ नहीं है।', 'Không có gì để cập nhật.'],
};

// Error code → [English, Bengali, Hindi, Vietnamese] when the exact message isn't listed.
const CODES = {
  NOT_FOUND: ["That couldn't be found. It may have been removed.", 'এটা খুঁজে পাওয়া গেল না। হয়তো মুছে ফেলা হয়েছে।', 'यह नहीं मिला। शायद हटा दिया गया है।', 'Không tìm thấy. Có thể đã bị xóa.'],
  VALIDATION_ERROR: ['Please check what you typed and try again.', 'যা লিখেছেন একবার দেখে আবার চেষ্টা করুন।', 'जो लिखा है उसे एक बार जांचकर फिर कोशिश करें।', 'Hãy kiểm tra lại thông tin rồi thử lại.'],
  RATE_LIMITED: ['Please wait a moment and try again.', 'একটু অপেক্ষা করে আবার চেষ্টা করুন।', 'थोड़ा रुककर फिर कोशिश करें।', 'Vui lòng chờ một chút rồi thử lại.'],
  FORBIDDEN: ["You don't have access to that.", 'এটা দেখার অনুমতি আপনার নেই।', 'आपको इसकी अनुमति नहीं है।', 'Bạn không có quyền truy cập.'],
  GUARDIAN_SCOPE_REQUIRED: ["You don't have permission to see that yet. The person you help can allow it in their settings.", 'এটা দেখার অনুমতি এখনো নেই। যাঁকে সাহায্য করেন তিনি সেটিংসে অনুমতি দিতে পারেন।', 'अभी यह देखने की अनुमति नहीं है। जिनकी आप मदद करते हैं, वे सेटिंग्स में अनुमति दे सकते हैं।', 'Bạn chưa có quyền xem. Người bạn giúp có thể cho phép trong phần cài đặt.'],
  INVALID_STATE: ['This has already changed. Please refresh.', 'এটা আগেই বদলে গেছে। রিফ্রেশ করুন।', 'यह पहले ही बदल चुका है। रिफ़्रेश करें।', 'Mục này đã thay đổi. Hãy tải lại.'],
  AI_NOT_CONFIGURED: ["The AI helper isn't available right now.", 'এআই সহকারী এখন পাওয়া যাচ্ছে না।', 'AI सहायक अभी उपलब्ध नहीं है।', 'Trợ lý AI chưa sẵn sàng.'],
  VOICE_UNAVAILABLE: ["Voice isn't available right now.", 'কণ্ঠ এখন পাওয়া যাচ্ছে না।', 'आवाज़ अभी उपलब्ध नहीं है।', 'Giọng nói chưa sẵn sàng.'],
};

const INDEX = { bn: 0, hi: 1, vi: 2 };

export function currentLanguage() {
  if (typeof document === 'undefined') return 'en';
  return (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
}

/** The message in the person's language (English passes through). */
export function localizeError(message, code, language = currentLanguage()) {
  const i = INDEX[language];
  if (i === undefined) return message;
  if (MESSAGES[message]) return MESSAGES[message][i];
  // Messages built with numbers, e.g. "You can keep up to 10 people here."
  const keep = /^You can keep up to (\d+) people here\.$/.exec(message || '');
  if (keep) return [`এখানে সর্বোচ্চ ${keep[1]} জন রাখা যায়।`, `यहां ज़्यादा से ज़्यादा ${keep[1]} लोग रख सकते हैं।`, `Bạn có thể lưu tối đa ${keep[1]} người.`][i];
  if (CODES[code]) return CODES[code][i + 1];
  return MESSAGES['Something went wrong. Please try again.'][i];
}
