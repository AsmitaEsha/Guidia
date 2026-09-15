import React from 'react';
import { 
  Send, Edit2, Paperclip, Mic, Video, Trash2, Ban, Circle,
  ThumbsUp, Share2, Camera, MessageSquare, Flag, UserPlus, UserMinus,
  Reply, AlertOctagon, Star, Archive, AlertTriangle, PlusCircle,
  LogOut, Store, Lock, CheckCircle, X, Clock, Smartphone, Key, CheckCircle2,
  QrCode, Users, Landmark, Receipt, User, ArrowDownToLine, CreditCard,
  Activity, Settings, AlertCircle, Search, Sliders, Calendar, CheckSquare,
  Square, Stethoscope, CalendarPlus, Pill, FlaskConical, DollarSign,
  ShoppingCart, Zap, RotateCcw, Heart, Banknote
} from 'lucide-react';

export const BUTTON_GUIDES = {
  whatsapp: {
    name: 'WhatsApp',
    color: '#25D366',
    image: 'https://images.unsplash.com/photo-1633354931133-27ac1ee5d853?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Send Message', bn:'মেসেজ পাঠানো', hi:'संदेश भेजें'}, color: '#25D366', intensity: 'safe', icon: <Send size={20}/>, desc: {en:'Green circular button. Tap to safely send your message. No going back after this!', bn:'সবুজ গোল বাটন। মেসেজ পাঠাতে চাপুন। এরপর আর ফেরানো যাবে না!', hi:'हरा गोल बटन। संदेश भेजने के लिए टैप करें। इसके बाद वापस नहीं लिया जा सकता!'} },
      { label: {en:'New Chat', bn:'নতুন চ্যাট', hi:'नया चैट'}, color: '#25D366', intensity: 'safe', icon: <MessageSquare size={20}/>, desc: {en:'Green message icon at the bottom right — starts a brand new conversation.', bn:'নিচে ডানদিকে সবুজ মেসেজ আইকন — নতুন চ্যাট শুরু করে।', hi:'नीचे दाईं ओर हरा संदेश आइकन — नई बातचीत शुरू करता है।'} },
      { label: {en:'Attach File', bn:'ফাইল সংযুক্ত', hi:'फ़ाइल संलग्न'}, color: '#0084FF', intensity: 'action', icon: <Paperclip size={20}/>, desc: {en:'Paperclip icon — attach a photo from your gallery, a document, or your location.', bn:'ক্লিপ আইকন — গ্যালারি থেকে ছবি, ডকুমেন্ট বা লোকেশন পাঠাতে চাপুন।', hi:'क्लिप आइकन — गैलरी से फ़ोटो, दस्तावेज़ या स्थान संलग्न करें।'} },
      { label: {en:'Voice Record', bn:'ভয়েস রেকর্ড', hi:'वॉयस रिकॉर्ड'}, color: '#0084FF', intensity: 'action', icon: <Mic size={20}/>, desc: {en:'Microphone icon. Hold it down to record your voice. Release to send it immediately.', bn:'মাইক্রোফোন আইকন। চেপে ধরে কথা বলুন। ছেড়ে দিলে পাঠানো হবে।', hi:'माइक्रोफ़ोन आइकन। दबाकर बोलें। छोड़ने पर भेज जाएगा।'} },
      { label: {en:'Video Call', bn:'ভিডিও কল', hi:'वीडियो कॉल'}, color: '#25D366', intensity: 'safe', icon: <Video size={20}/>, desc: {en:'Tap the green camera at the top right of any chat to start a video call.', bn:'উপরে ডানদিকে সবুজ ক্যামেরায় চাপ দিলে ভিডিও কল শুরু হবে।', hi:'ऊपर दाईं ओर हरे कैमरे पर टैप करके वीडियो कॉल शुरू करें।'} },
      { label: {en:'Delete Message', bn:'মেসেজ মুছুন', hi:'संदेश हटाएं'}, color: '#EA4335', intensity: 'danger', icon: <Trash2 size={20}/>, desc: {en:'Red warning — this DELETES a message permanently. Be careful.', bn:'লাল সতর্কতা — এটি স্থায়ীভাবে মেসেজ মুছে ফেলে। সাবধান।', hi:'लाल चेतावनी — यह संदेश को स्थायी रूप से हटा देता है। सावधान रहें।'} },
      { label: {en:'Block Contact', bn:'ব্লক করুন', hi:'ब्लॉक करें'}, color: '#EA4335', intensity: 'danger', icon: <Ban size={20}/>, desc: {en:'Red — blocks the person. They cannot message you anymore. Use this for scammers!', bn:'লাল — ব্যক্তিকে ব্লক করে। প্রতারকদের জন্য ব্যবহার করুন!', hi:'लाल — व्यक्ति को ब्लॉक करता है। वे आपको संदेश नहीं भेज सकते। ठगों के लिए उपयोग करें!'} },
      { label: {en:'Status Tab', bn:'স্ট্যাটাস', hi:'स्टेटस टैब'}, color: '#8B5CF6', intensity: 'info', icon: <Circle size={20}/>, desc: {en:'Circle icon — view temporary 24-hour updates from your contacts.', bn:'বৃত্ত আইকন — কন্টাক্টদের ২৪ ঘণ্টার আপডেট দেখুন।', hi:'वृत्त आइकन — संपर्कों के 24 घंटे के अपडेट देखें।'} },
    ]
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Like', bn:'লাইক', hi:'लाइक'}, color: '#1877F2', intensity: 'action', icon: <ThumbsUp size={20}/>, desc: {en:'Thumbs up — shows appreciation for a post. Completely safe to tap.', bn:'থাম্বস আপ — পোস্ট পছন্দ হলে চাপুন। সম্পূর্ণ নিরাপদ।', hi:'अंगूठा ऊपर — पोस्ट पसंद करने के लिए टैप करें। पूरी तरह सुरक्षित।'} },
      { label: {en:'Share', bn:'শেয়ার', hi:'शेयर'}, color: '#1877F2', intensity: 'action', icon: <Share2 size={20}/>, desc: {en:'Share arrow — shares a post to your own page. Think before sharing public posts!', bn:'শেয়ার তীর — আপনার টাইমলাইনে পোস্ট শেয়ার করে। শেয়ার করার আগে ভাবুন!', hi:'शेयर तीर — पोस्ट अपनी टाइमलाइन पर शेयर करें। शेयर करने से पहले सोचें!'} },
      { label: {en:'Post Button', bn:'পোস্ট বাটন', hi:'पोस्ट बटन'}, color: '#1877F2', intensity: 'action', icon: <Send size={20}/>, desc: {en:'Blue "Post" button — publishes what you wrote for all your friends to see.', bn:'নীল Post বাটন — বন্ধুদের দেখার জন্য লেখা প্রকাশ করে।', hi:'नीला Post बटन — जो आपने लिखा उसे दोस्तों को दिखाने के लिए प्रकाशित करता है।'} },
      { label: {en:'Photo/Video', bn:'ছবি/ভিডিও', hi:'फ़ोटो/वीडियो'}, color: '#25D366', intensity: 'safe', icon: <Camera size={20}/>, desc: {en:'Camera icon — safely browse your gallery to add a photo to your post.', bn:'ক্যামেরা আইকন — আপনার পোস্টে ছবি যোগ করতে গ্যালারি দেখুন।', hi:'कैमरा आइकन — पोस्ट में फ़ोटो जोड़ने के लिए गैलरी देखें।'} },
      { label: {en:'Comment', bn:'কমেন্ট', hi:'कमेंट'}, color: '#8B5CF6', intensity: 'info', icon: <MessageSquare size={20}/>, desc: {en:'Speech bubble — write a public reply under someone else\'s post.', bn:'স্পিচ বাবল — অন্যের পোস্টে সর্বজনীন উত্তর লিখুন।', hi:'स्पीच बबल — दूसरे की पोस्ट पर सार्वजनिक उत्तर लिखें।'} },
      { label: {en:'Report Post', bn:'রিপোর্ট পোস্ট', hi:'रिपोर्ट पोस्ट'}, color: '#EA4335', intensity: 'danger', icon: <Flag size={20}/>, desc: {en:'Flag icon — report a harmful or fake post to Facebook. Very important for safety!', bn:'পতাকা আইকন — ক্ষতিকর পোস্ট রিপোর্ট করুন। নিরাপত্তার জন্য গুরুত্বপূর্ণ!', hi:'झंडा आइकन — हानिकारक पोस्ट की रिपोर्ट करें। सुरक्षा के लिए महत्वपूर्ण!'} },
      { label: {en:'Add Friend', bn:'বন্ধু যোগ করুন', hi:'दोस्त जोड़ें'}, color: '#1877F2', intensity: 'action', icon: <UserPlus size={20}/>, desc: {en:'Add user icon — sends a friend request. Only add people you actually know!', bn:'বন্ধু যোগ আইকন — ফ্রেন্ড রিকোয়েস্ট পাঠায়। শুধু পরিচিতদের যোগ করুন!', hi:'दोस्त जोड़ें आइकन — फ्रेंड रिक्वेस्ट भेजता है। केवल परिचितों को जोड़ें!'} },
      { label: {en:'Unfriend / Block', bn:'আনফ্রেন্ড/ব্লক', hi:'अनफ्रेंड/ब्लॉक'}, color: '#EA4335', intensity: 'danger', icon: <UserMinus size={20}/>, desc: {en:'Remove user icon — removes or blocks someone. Prevents them from seeing your posts.', bn:'ব্যবহারকারী অপসারণ — কাউকে ব্লক করে। তারা আপনার পোস্ট দেখতে পারবে না।', hi:'उपयोगकर्ता हटाएं — किसी को ब्लॉक करता है। वे आपकी पोस्ट नहीं देख पाएंगे।'} },
    ]
  },
  gmail: {
    name: 'Gmail',
    color: '#EA4335',
    image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Compose', bn:'নতুন ইমেইল', hi:'लिखें'}, color: '#EA4335', intensity: 'action', icon: <Edit2 size={20}/>, desc: {en:'Pencil button — starts writing a brand new email.', bn:'পেন্সিল বাটন — নতুন ইমেইল লিখতে শুরু করে।', hi:'पेंसिल बटन — नया ईमेल लिखना शुरू करता है।'} },
      { label: {en:'Send', bn:'পাঠান', hi:'भेजें'}, color: '#EA4335', intensity: 'action', icon: <Send size={20}/>, desc: {en:'Paper plane icon. Tap to send your email. Make sure the email address is correct first!', bn:'কাগজের বিমান আইকন। ইমেইল পাঠাতে চাপুন। আগে ঠিকানা যাচাই করুন!', hi:'कागज का विमान आइकन। ईमेल भेजने के लिए टैप करें। पहले पता जांचें!'} },
      { label: {en:'Reply', bn:'রিপ্লাই', hi:'जवाब दें'}, color: '#1877F2', intensity: 'action', icon: <Reply size={20}/>, desc: {en:'Curved arrow — sends your response back to that specific person.', bn:'বাঁকানো তীর — নির্দিষ্ট ব্যক্তিকে আপনার উত্তর পাঠায়।', hi:'मुड़ा हुआ तीर — विशिष्ट व्यक्ति को आपका उत्तर भेजता है।'} },
      { label: {en:'Report Spam', bn:'স্প্যাম রিপোর্ট', hi:'स्पैम रिपोर्ट'}, color: '#F97316', intensity: 'warn', icon: <AlertOctagon size={20}/>, desc: {en:'Stop sign — marks the email as spam so you get no more from that sender.', bn:'স্টপ সাইন — ইমেইল স্প্যাম হিসেবে চিহ্নিত করে।', hi:'स्टॉप साइन — ईमेल को स्पैम के रूप में चिह्नित करता है।'} },
      { label: {en:'Delete', bn:'মুছুন', hi:'हटाएं'}, color: '#EA4335', intensity: 'danger', icon: <Trash2 size={20}/>, desc: {en:'Trash can icon — permanently deletes the email after 30 days.', bn:'ট্র্যাশ আইকন — ৩০ দিন পর স্থায়ীভাবে ইমেইল মুছে ফেলে।', hi:'ट्रैश आइकन — 30 दिन बाद स्थायी रूप से ईमेल हटा देता है।'} },
      { label: {en:'Star', bn:'স্টার', hi:'स्टार'}, color: '#F59E0B', intensity: 'info', icon: <Star size={20}/>, desc: {en:'Star icon — marks an email as important so you can find it quickly.', bn:'স্টার আইকন — ইমেইলটি গুরুত্বপূর্ণ হিসেবে চিহ্নিত করে।', hi:'स्टार आइकन — ईमेल को महत्वपूर्ण के रूप में चिह्नित करता है।'} },
      { label: {en:'Archive', bn:'আর্কাইভ', hi:'संग्रह'}, color: '#8B5CF6', intensity: 'info', icon: <Archive size={20}/>, desc: {en:'Box with arrow — Hides email from inbox without deleting it.', bn:'তীরসহ বাক্স — না মুছেই ইনবক্স থেকে ইমেইল লুকিয়ে রাখে।', hi:'तीर वाला बॉक्स — हटाए बिना इनबॉक्स से ईमेल छिपाता है।'} },
      { label: {en:'Phishing Alert', bn:'ফিশিং অ্যালার্ট', hi:'फ़िशिंग अलर्ट'}, color: '#EA4335', intensity: 'danger', icon: <AlertTriangle size={20}/>, desc: {en:'Red warning triangle — STOP! Gmail detected this email may be a scam.', bn:'লাল সতর্কীকরণ ত্রিভুজ — থামুন! এটি একটি প্রতারণা হতে পারে।', hi:'लाल चेतावनी त्रिकोण — रुकें! यह धोखाधड़ी हो सकती है।'} },
    ]
  },
  bkash: {
    name: 'bKash',
    color: '#E2136E',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Send Money', bn:'সেন্ড মানি', hi:'पैसे भेजें'}, color: '#E2136E', intensity: 'action', icon: <Send size={20}/>, desc: {en:'The main pink action button. Enter number very carefully. CANNOT be reversed!', bn:'প্রধান গোলাপি বাটন। সাবধানে নম্বর লিখুন। ফেরানো যাবে না!', hi:'मुख्य गुलाबी बटन। ध्यान से नंबर दर्ज करें। वापस नहीं किया जा सकता!'} },
      { label: {en:'Add Money', bn:'অ্যাড মানি', hi:'पैसे जोड़ें'}, color: '#25D366', intensity: 'safe', icon: <PlusCircle size={20}/>, desc: {en:'Adds money to your bKash from your bank card. Safe to use.', bn:'ব্যাংক কার্ড থেকে আপনার বিকাশে টাকা যোগ করে। নিরাপদ।', hi:'बैंक कार्ड से आपके bKash में पैसे जोड़ता है। सुरक्षित।'} },
      { label: {en:'Cash Out', bn:'ক্যাশ আউট', hi:'कैश आउट'}, color: '#F97316', intensity: 'warn', icon: <Banknote size={20}/>, desc: {en:'Withdraws physical cash at an agent. Double-check the agent number.', bn:'এজেন্টের কাছে নগদ টাকা উত্তোলন। এজেন্ট নম্বর দুবার চেক করুন।', hi:'एजेंट पर नकद निकासी। एजेंट नंबर दोबारा जांचें।'} },
      { label: {en:'Payment', bn:'পেমেন্ট', hi:'भुगतान'}, color: '#1877F2', intensity: 'action', icon: <Store size={20}/>, desc: {en:'Pay to a merchant or shop. Always confirm the shop name shown on screen.', bn:'দোকানে পে করুন। স্ক্রিনে দেখানো দোকানের নাম নিশ্চিত করুন।', hi:'दुकान पर भुगतान करें। स्क्रीन पर दुकान के नाम की पुष्टि करें।'} },
      { label: {en:'PIN Entry', bn:'পিন এন্ট্রি', hi:'PIN दर्ज करें'}, color: '#EA4335', intensity: 'danger', icon: <Lock size={20}/>, desc: {en:'RED zone — your secret 5-digit PIN. NEVER share with anyone, ever!', bn:'লাল জোন — আপনার ৫-সংখ্যার গোপন পিন। কখনো কাউকে দেবেন না!', hi:'लाल ज़ोन — आपका 5 अंकों का गुप्त PIN। कभी किसी को न बताएं!'} },
      { label: {en:'Tap and Hold', bn:'চেপে ধরে রাখুন', hi:'दबाकर रखें'}, color: '#E2136E', intensity: 'action', icon: <CheckCircle size={20}/>, desc: {en:'Press and hold the bottom section to complete transaction. Long press = final confirmation.', bn:'লেনদেন সম্পন্ন করতে নিচে চেপে ধরুন। দীর্ঘ চাপ = চূড়ান্ত নিশ্চিতকরণ।', hi:'लेनदेन पूरा करने के लिए नीचे दबाकर रखें। लंबी प्रेस = अंतिम पुष्टि।'} },
      { label: {en:'Transaction History', bn:'স্টেটমেন্ট', hi:'इतिहास'}, color: '#8B5CF6', intensity: 'info', icon: <Clock size={20}/>, desc: {en:'Shows your past payments. Always check this to spot unauthorized activity.', bn:'অতীতের পেমেন্ট দেখায়। অননুমোদিত কাজ ধরতে এটি পরীক্ষা করুন।', hi:'पिछले भुगतान दिखाता है। अनधिकृत गतिविधि पकड़ने के लिए इसे जांचें।'} },
    ]
  },
  nagad: {
    name: 'Nagad',
    color: '#F05A22',
    image: 'https://images.unsplash.com/photo-1607703703520-bb638e84caf2?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Send Money', bn:'সেন্ড মানি', hi:'पैसे भेजें'}, color: '#F05A22', intensity: 'action', icon: <Send size={20}/>, desc: {en:'Main orange send button — double-check the recipient number before tapping.', bn:'প্রধান কমলা সেন্ড বাটন — প্রাপকের নম্বর যাচাই করুন।', hi:'मुख्य नारंगी सेंड बटन — प्राप्तकर्ता का नंबर दोबारा जांचें।'} },
      { label: {en:'Mobile Recharge', bn:'মোবাইল রিচার্জ', hi:'मोबाइल रिचार्ज'}, color: '#25D366', intensity: 'safe', icon: <Smartphone size={20}/>, desc: {en:'Safely tops up a mobile phone balance directly from your app.', bn:'অ্যাপ থেকে সরাসরি মোবাইল ব্যালেন্স রিচার্জ করুন। নিরাপদ।', hi:'ऐप से सीधे मोबाइल फोन रिचार्ज करें। सुरक्षित।'} },
      { label: {en:'OTP Input Box', bn:'OTP বক্স', hi:'OTP बॉक्स'}, color: '#EA4335', intensity: 'danger', icon: <Key size={20}/>, desc: {en:'RED ALERT — this box is where you type your OTP. NEVER give this to anyone on a phone call!', bn:'রেড অ্যালার্ট — এখানে আপনার OTP দিন। ফোনে কাউকে দেবেন না!', hi:'रेड अलर्ट — यहाँ अपना OTP टाइप करें। फ़ोन पर किसी को न बताएं!'} },
      { label: {en:'Confirm Transfer', bn:'কনফার্ম করুন', hi:'पुष्टि करें'}, color: '#F05A22', intensity: 'action', icon: <CheckCircle2 size={20}/>, desc: {en:'Orange confirm — final step. Once pressed, money is sent instantly.', bn:'কমলা কনফার্ম — শেষ ধাপ। চাপলেই সাথে সাথে টাকা চলে যাবে।', hi:'नारंगी पुष्टि — अंतिम चरण। दबाते ही पैसे तुरंत भेज दिए जाएंगे।'} },
    ]
  },
  googlepay: {
    name: 'Google Pay',
    color: '#1A73E8',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Scan QR', bn:'QR স্ক্যান', hi:'QR स्कैन'}, color: '#1A73E8', intensity: 'action', icon: <QrCode size={20}/>, desc: {en:'QR scanner — scan a shop\'s QR code to pay. Fast and very safe.', bn:'QR স্ক্যানার — দোকানে স্ক্যান করে পে করুন। দ্রুত এবং নিরাপদ।', hi:'QR स्कैनर — दुकान का QR स्कैन करके भुगतान करें। तेज़ और सुरक्षित।'} },
      { label: {en:'Pay Contacts', bn:'কন্টাক্টকে পে করুন', hi:'संपर्कों को भुगतान'}, color: '#25D366', intensity: 'safe', icon: <Users size={20}/>, desc: {en:'Pay someone saved in your phonebook. Always verifies their real name.', bn:'ফোনবুকে সেভ থাকা কাউকে পে করুন। সর্বদা আসল নাম যাচাই করে।', hi:'फ़ोनबुक में सेव किसी व्यक्ति को भुगतान करें। हमेशा उनका असली नाम जांचें।'} },
      { label: {en:'Bank Transfer', bn:'ব্যাংক ট্রান্সফার', hi:'बैंक ट्रांसफर'}, color: '#1A73E8', intensity: 'action', icon: <Landmark size={20}/>, desc: {en:'Send directly to any bank account. You need their Account Number and IFSC.', bn:'যেকোনো ব্যাংক অ্যাকাউন্টে সরাসরি পাঠান। অ্যাকাউন্ট নম্বর ও IFSC লাগবে।', hi:'सीधे किसी भी बैंक खाते में भेजें। आपको उनका खाता नंबर और IFSC चाहिए।'} },
      { label: {en:'UPI PIN Entry', bn:'UPI পিন', hi:'UPI PIN'}, color: '#EA4335', intensity: 'danger', icon: <Lock size={20}/>, desc: {en:'RED — your secret PIN. Enter ONLY to SEND money. NEVER enter a PIN to receive money!', bn:'লাল — আপনার গোপন পিন। শুধু টাকা পাঠাতে দিন। টাকা পেতে কখনো পিন দেবেন না!', hi:'लाल — आपका गुप्त PIN। केवल पैसे भेजने के लिए दर्ज करें। पैसे प्राप्त करने के लिए कभी नहीं!'} },
      { label: {en:'Pay Bills', bn:'বিল পে করুন', hi:'बिल भुगतान'}, color: '#1A73E8', intensity: 'action', icon: <Receipt size={20}/>, desc: {en:'Pay electricity, water, or mobile recharge. Completely safe.', bn:'বিদ্যুৎ, পানি বা মোবাইল বিল পে করুন। সম্পূর্ণ নিরাপদ।', hi:'बिजली, पानी या मोबाइल बिल का भुगतान करें। पूरी तरह सुरक्षित।'} },
      { label: {en:'Check Balance', bn:'ব্যালেন্স চেক', hi:'बैलेंस जांचें'}, color: '#25D366', intensity: 'safe', icon: <Landmark size={20}/>, desc: {en:'Safely shows how much money is in your linked bank account.', bn:'আপনার ব্যাংক অ্যাকাউন্টে কত টাকা আছে তা নিরাপদে দেখায়।', hi:'सुरक्षित रूप से दिखाता है कि आपके बैंक खाते में कितने पैसे हैं।'} },
      { label: {en:'Profile Settings', bn:'প্রোফাইল সেটিংস', hi:'प्रोफ़ाइल सेटिंग्स'}, color: '#8B5CF6', intensity: 'info', icon: <User size={20}/>, desc: {en:'Tap your photo to see your personal UPI ID and linked bank accounts.', bn:'আপনার ব্যক্তিগত UPI ID ও লিংক করা ব্যাংক দেখতে ছবিতে চাপুন।', hi:'अपनी UPI ID और बैंक खाते देखने के लिए अपनी फ़ोटो पर टैप करें।'} },
    ]
  },
  paypal: {
    name: 'PayPal',
    color: '#003087',
    image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Send Payment', bn:'পেমেন্ট পাঠান', hi:'भुगतान भेजें'}, color: '#003087', intensity: 'action', icon: <Send size={20}/>, desc: {en:'Navy blue button — sends money to an email address. Verify the address first!', bn:'নেভি ব্লু বাটন — ইমেইলে টাকা পাঠায়। আগে ঠিকানা যাচাই করুন!', hi:'गहरा नीला बटन — ईमेल पर पैसे भेजता है। पहले पता जांचें!'} },
      { label: {en:'Request Money', bn:'টাকা রিকোয়েস্ট করুন', hi:'पैसे का अनुरोध'}, color: '#0070BA', intensity: 'action', icon: <ArrowDownToLine size={20}/>, desc: {en:'Sends a secure notification asking someone else to pay you.', bn:'অন্যকে আপনাকে পে করতে নিরাপদ বিজ্ঞপ্তি পাঠায়।', hi:'सुरक्षित सूचना भेजकर किसी को आपको भुगतान करने के लिए कहता है।'} },
      { label: {en:'Wallet', bn:'ওয়ালেট', hi:'वॉलेट'}, color: '#25D366', intensity: 'safe', icon: <CreditCard size={20}/>, desc: {en:'Manage your linked bank accounts and credit cards safely.', bn:'আপনার লিংক করা ব্যাংক অ্যাকাউন্ট ও কার্ড নিরাপদে ম্যানেজ করুন।', hi:'अपने लिंक किए गए बैंक खातों और क्रेडिट कार्ड को सुरक्षित रूप से प्रबंधित करें।'} },
      { label: {en:'Activity', bn:'অ্যাক্টিভিটি', hi:'गतिविधि'}, color: '#8B5CF6', intensity: 'info', icon: <Activity size={20}/>, desc: {en:'Shows all past transactions and refunds. Check this regularly.', bn:'সব অতীত লেনদেন ও রিফান্ড দেখায়। নিয়মিত চেক করুন।', hi:'सभी पिछले लेनदेन और रिफंड दिखाता है। नियमित रूप से जांचें।'} },
      { label: {en:'Settings', bn:'সেটিংস', hi:'सेटिंग्स'}, color: '#8B5CF6', intensity: 'info', icon: <Settings size={20}/>, desc: {en:'Gear icon — manage your password, address, and security questions.', bn:'গিয়ার আইকন — আপনার পাসওয়ার্ড, ঠিকানা ও নিরাপত্তা প্রশ্ন ম্যানেজ করুন।', hi:'गियर आइकन — अपना पासवर्ड, पता और सुरक्षा प्रश्न प्रबंधित करें।'} },
      { label: {en:'Report Problem', bn:'সমস্যা রিপোর্ট করুন', hi:'समस्या रिपोर्ट'}, color: '#EA4335', intensity: 'danger', icon: <AlertCircle size={20}/>, desc: {en:'Report an unauthorised payment. Use this IMMEDIATELY if scammed.', bn:'অননুমোদিত পেমেন্ট রিপোর্ট করুন। প্রতারণার শিকার হলে সাথে সাথে ব্যবহার করুন।', hi:'अनधिकृत भुगतान की रिपोर्ट करें। धोखाधड़ी होने पर तुरंत उपयोग करें।'} },
    ]
  },
  booking: {
    name: 'Booking.com',
    color: '#003580',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Search', bn:'সার্চ', hi:'खोजें'}, color: '#003580', intensity: 'action', icon: <Search size={20}/>, desc: {en:'Navy blue button — searches for available hotels in a city. Safe to tap.', bn:'নেভি ব্লু বাটন — শহরে হোটেল খোঁজে। নিরাপদ।', hi:'गहरा नीला बटन — शहर में होटल खोजता है। सुरक्षित।'} },
      { label: {en:'Filter Options', bn:'ফিল্টার', hi:'फ़िल्टर'}, color: '#1877F2', intensity: 'action', icon: <Sliders size={20}/>, desc: {en:'Narrow search results by price, stars, or whether it has free cancellation.', bn:'দাম, স্টার বা ফ্রি ক্যান্সেল দিয়ে সার্চ রেজাল্ট কমান।', hi:'कीमत, स्टार या मुफ़्त कैंसिलेशन से खोज परिणाम कम करें।'} },
      { label: {en:'Select Dates', bn:'তারিখ বেছে নিন', hi:'तारीख चुनें'}, color: '#003580', intensity: 'action', icon: <Calendar size={20}/>, desc: {en:'Opens a calendar view to select your check-in and check-out days.', bn:'ক্যালেন্ডার খুলে চেক-ইন ও চেক-আউট তারিখ নির্বাচন করুন।', hi:'कैलेंडर खोलकर चेक-इन और चेक-आउट के दिन चुनें।'} },
      { label: {en:'Reserve Now', bn:'রিজার্ভ', hi:'रिज़र्व करें'}, color: '#F97316', intensity: 'warn', icon: <CheckSquare size={20}/>, desc: {en:'Orange reserve button — this starts the payment process. READ all terms first!', bn:'কমলা রিজার্ভ বাটন — পেমেন্ট শুরু করে। আগে সব শর্ত পড়ুন!', hi:'नारंगी रिज़र्व बटन — भुगतान शुरू करता है। पहले सभी शर्तें पढ़ें!'} },
      { label: {en:'Free Cancellation', bn:'ফ্রি ক্যান্সেল', hi:'मुफ़्त कैंसिलेशन'}, color: '#25D366', intensity: 'safe', icon: <CheckCircle2 size={20}/>, desc: {en:'Green badge — means you can cancel for free before a certain date. Always prefer this!', bn:'সবুজ ব্যাজ — বিনামূল্যে বাতিল করা যায়। সর্বদা এটি পছন্দ করুন!', hi:'हरा बैज — मुफ़्त में रद्द किया जा सकता है। हमेशा इसे चुनें!'} },
      { label: {en:'Star Ratings', bn:'স্টার রেটিং', hi:'स्टार रेटिंग'}, color: '#F59E0B', intensity: 'info', icon: <Star size={20}/>, desc: {en:'Yellow stars — indicates the hotel category (1-5). Higher = more luxurious.', bn:'হলুদ তারা — হোটেল ক্যাটাগরি বোঝায়। বেশি তারা মানে বেশি বিলাসবহুল।', hi:'पीले तारे — होटल श्रेणी (1-5) दर्शाते हैं। अधिक = अधिक शानदार।'} },
      { label: {en:'Guest Score', bn:'গেস্ট স্কোর', hi:'गेस्ट स्कोर'}, color: '#003580', intensity: 'info', icon: <Square size={20}/>, desc: {en:'Blue score out of 10 — rated by real guests. 8+ is generally a good sign.', bn:'১০ এর মধ্যে নীল স্কোর — আসল অতিথিদের দেওয়া। ৮+ ভালো লক্ষণ।', hi:'10 में से नीला स्कोर — असली मेहमानों द्वारा दिया गया। 8+ अच्छा संकेत है।'} },
    ]
  },
  practo: {
    name: 'Practo',
    color: '#28328C',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Find Doctors', bn:'ডাক্তার খুঁজুন', hi:'डॉक्टर खोजें'}, color: '#28328C', intensity: 'action', icon: <Stethoscope size={20}/>, desc: {en:'Search for doctors near you or by specialty (like Cardiologist).', bn:'আপনার কাছে বা বিভাগ অনুযায়ী (যেমন কার্ডিওলজিস্ট) ডাক্তার খুঁজুন।', hi:'अपने आस-पास या विशेषता (जैसे कार्डियोलॉजिस्ट) के अनुसार डॉक्टर खोजें।'} },
      { label: {en:'Video Consult', bn:'ভিডিও কল', hi:'वीडियो परामर्श'}, color: '#14BEF0', intensity: 'safe', icon: <Video size={20}/>, desc: {en:'Book an instant video call with a certified doctor directly from home. Very safe.', bn:'বাসা থেকে সরাসরি ভিডিও কল বুক করুন। খুব নিরাপদ।', hi:'घर बैठे प्रमाणित डॉक्टर के साथ वीडियो कॉल बुक करें। सुरक्षित।'} },
      { label: {en:'Book Appointment', bn:'বুক অ্যাপয়েন্টমেন্ট', hi:'अपॉइंटमेंट बुक'}, color: '#25D366', intensity: 'safe', icon: <CalendarPlus size={20}/>, desc: {en:'Schedule a physical or online doctor visit for a specific time and date.', bn:'নির্দিষ্ট সময়ে ডাক্তার দেখানোর সময়সূচি তৈরি করুন।', hi:'विशिष्ट समय के लिए डॉक्टर के पास जाने का समय निर्धारित करें।'} },
      { label: {en:'Order Medicines', bn:'ওষুধ অর্ডার', hi:'दवा ऑर्डर'}, color: '#1877F2', intensity: 'action', icon: <Pill size={20}/>, desc: {en:'Upload your doctor\'s prescription and order medicines for home delivery.', bn:'প্রেসক্রিপশন আপলোড করে বাসায় ওষুধ আনান।', hi:'पर्चे अपलोड करें और घर पर दवा मंगाएं।'} },
      { label: {en:'Lab Tests', bn:'ল্যাব টেস্ট', hi:'लैब टेस्ट'}, color: '#8B5CF6', intensity: 'info', icon: <FlaskConical size={20}/>, desc: {en:'Book blood tests with safe home sample collection.', bn:'বাসায় স্যাম্পল কালেকশন সহ রক্ত পরীক্ষার বুকিং করুন।', hi:'घर पर सुरक्षित सैंपल कलेक्शन के साथ ब्लड टेस्ट बुक करें।'} },
      { label: {en:'Consult Fee', bn:'ফি', hi:'शुल्क'}, color: '#F97316', intensity: 'warn', icon: <DollarSign size={20}/>, desc: {en:'This is how much the doctor charges. Always check the fee before confirming!', bn:'এটি ডাক্তারের ফি। নিশ্চিত করার আগে সর্বদা চেক করুন!', hi:'यह डॉक्टर की फीस है। पुष्टि करने से पहले हमेशा जांचें!'} },
      { label: {en:'Patient Reviews', bn:'রিভিউ', hi:'रिव्यू'}, color: '#F59E0B', intensity: 'info', icon: <Star size={20}/>, desc: {en:'Ratings from previous patients about the doctor\'s behavior. Read these carefully.', bn:'আগের রোগীদের রেটিং। সাবধানে পড়ুন।', hi:'पिछले मरीजों की रेटिंग। इन्हें ध्यान से पढ़ें।'} },
    ]
  },
  amazon: {
    name: 'Amazon',
    color: '#FF9900',
    image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400&auto=format&fit=crop',
    buttons: [
      { label: {en:'Search Bar', bn:'সার্চ বার', hi:'खोज बार'}, color: '#FF9900', intensity: 'action', icon: <Search size={20}/>, desc: {en:'Type the product name here. Be specific (e.g., "size 9 white shoes").', bn:'পণ্যের নাম লিখুন। নির্দিষ্ট করে লিখুন (যেমন: "size 9 white shoes")।', hi:'उत्पाद का नाम लिखें। विशिष्ट रहें (जैसे: "size 9 white shoes")।'} },
      { label: {en:'Add to Cart', bn:'কার্টে যোগ', hi:'कार्ट में जोड़ें'}, color: '#FF9900', intensity: 'action', icon: <ShoppingCart size={20}/>, desc: {en:'Orange button — saves an item to your cart. You can still review before paying.', bn:'কমলা বাটন — জিনিস কার্টে সেভ করে। পেমেন্টের আগে চেক করতে পারবেন।', hi:'नारंगी बटन — कार्ट में आइटम सेव करता है। भुगतान से पहले जांच सकते हैं।'} },
      { label: {en:'Buy Now', bn:'এখনই কিনুন', hi:'अभी खरीदें'}, color: '#F59E0B', intensity: 'warn', icon: <Zap size={20}/>, desc: {en:'Yellow "Buy Now" button — skips the cart and goes STRAIGHT to payment. Be careful!', bn:'হলুদ "Buy Now" সরাসরি পেমেন্টে নিয়ে যায়। সাবধানে ব্যবহার করুন!', hi:'पीला "Buy Now" सीधे भुगतान पर ले जाता है। सावधान रहें!'} },
      { label: {en:'Product Ratings', bn:'রেটিং', hi:'रेटिंग'}, color: '#F59E0B', intensity: 'info', icon: <Star size={20}/>, desc: {en:'Always check stars. Only buy items with 4+ stars and more than 100 reviews.', bn:'সর্বদা ৪+ তারা এবং ১০০+ রিভিউ আছে এমন পণ্য কিনুন।', hi:'हमेशा 4+ स्टार और 100+ रिव्यू वाले उत्पाद ही खरीदें।'} },
      { label: {en:'Proceed to Checkout', bn:'অর্ডার দিন', hi:'चेकआउट करें'}, color: '#EA4335', intensity: 'danger', icon: <CreditCard size={20}/>, desc: {en:'Final checkout button — this takes your money. Final review of price and address here!', bn:'চূড়ান্ত বাটন — টাকা কেটে নেবে। দাম এবং ঠিকানা শেষবারের মতো চেক করুন!', hi:'अंतिम बटन — पैसे काट लिए जाएंगे। कीमत और पता अंतिम बार जांचें!'} },
      { label: {en:'Returns', bn:'রিটার্ন', hi:'वापसी'}, color: '#1877F2', intensity: 'safe', icon: <RotateCcw size={20}/>, desc: {en:'Request a return within a specific window if the item is damaged or wrong.', bn:'পণ্য নষ্ট বা ভুল হলে নির্দিষ্ট সময়ের মধ্যে ফেরত দিন।', hi:'सामान खराब या गलत होने पर নির্দিষ্ট समय में वापस करें।'} },
      { label: {en:'Wishlist', bn:'উইশলিস্ট', hi:'विशलिस्ट'}, color: '#EA4335', intensity: 'info', icon: <Heart size={20}/>, desc: {en:'Heart icon — safely saves an item to look at later without buying it.', bn:'হার্ট আইকন — না কিনেই পরে দেখার জন্য সেভ করে রাখে।', hi:'हार्ट आइकन — बिना खरीदे बाद में देखने के लिए सेव करता है।'} },
    ]
  }
};
