export const UI_GUIDES = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    color: '#25D366',
    brandColor: '#075E54',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/120px-WhatsApp.svg.png',
    screenshot: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=360&h=640&fit=crop',
    sections: [
      {
        title: { en: 'Sending Messages', bn: 'মেসেজ পাঠানো', hi: 'संदेश भेजना' },
        buttons: [
          { replicaKey:'wa-send',   safety:'safe',   name:{en:'Send Button (Green Arrow)',    bn:'সেন্ড বাটন (সবুজ তীর)',    hi:'सेंड बटन (हरा तीर)'},    desc:{en:'The green circle at the bottom-right of your chat. Tap it to send your typed message. Nothing is sent until you tap this.',                                   bn:'চ্যাটের নিচে ডান কোণে সবুজ বৃত্ত। এটিতে চাপ দিলে আপনার লেখা মেসেজ পাঠানো হবে।',                                            hi:'चैट के नीचे दाईं ओर हरा वृत्त। इसे टैप करने पर आपका टाइप किया संदेश भेजा जाएगा।'} },
          { replicaKey:'wa-attach', safety:'action', name:{en:'Attach (Paperclip)',           bn:'অ্যাটাচ (ক্লিপ)',          hi:'अटैच (क्लिप)'},           desc:{en:'The paperclip icon next to the text box. Tap it to send a photo from your gallery, a document, or share your location.',                                    bn:'টেক্সট বক্সের পাশে ক্লিপ আইকন। ছবি, ডকুমেন্ট বা লোকেশন শেয়ার করতে চাপুন।',                                               hi:'टेक्स्ट बॉक्स के पास क्लिप आइकन। फ़ोटो, दस्तावेज़ या स्थान साझा करने के लिए टैप करें।'} },
          { replicaKey:'wa-mic',    safety:'action', name:{en:'Microphone (Voice Note)',      bn:'মাইক্রোফোন (ভয়েস নোট)',   hi:'माइक्रोफ़ोन (वॉयस नोट)'}, desc:{en:'Hold down the microphone to record your voice. Release to send. Great if typing is difficult for you.',                                                     bn:'মাইক্রোফোন চেপে ধরে কথা বলুন। ছেড়ে দিলে পাঠানো হবে। টাইপ কঠিন হলে ব্যবহার করুন।',                                          hi:'माइक्रोफ़ोन दबाकर बोलें। छोड़ने पर भेज जाएगा। टाइप करना मुश्किल हो तो उपयोग करें।'} },
        ]
      },
      {
        title: { en: 'Calling', bn: 'কল করা', hi: 'कॉल करना' },
        buttons: [
          { replicaKey:'wa-call',  safety:'safe',   name:{en:'Voice Call (Phone icon)',      bn:'ভয়েস কল',                hi:'वॉयस कॉल'},              desc:{en:'Inside any chat, tap the phone icon at the top to make a free voice call over Wi-Fi. No regular call charge.',                                              bn:'যেকোনো চ্যাটে, উপরে ফোন আইকনে চাপ দিন। ওয়াই-ফাইতে বিনামূল্যে কল করুন।',                                                  hi:'किसी भी चैट में, ऊपर फ़ोन आइकन टैप करें। Wi-Fi पर निःशुल्क कॉल करें।'} },
          { replicaKey:'wa-video', safety:'safe',   name:{en:'Video Call (Camera icon)',     bn:'ভিডিও কল',                hi:'वीडियो कॉल'},             desc:{en:'Tap the camera icon to start a video call so the other person can see you face to face.',                                                                  bn:'ক্যামেরা আইকনে চাপ দিলে ভিডিও কলে মুখ দেখা যাবে।',                                                                           hi:'कैमरा आइकन टैप करें तो सामने वाला आपका चेहरा देख सकेगा।'} },
        ]
      },
      {
        title: { en: 'Safety', bn: 'নিরাপত্তা', hi: 'सुरक्षा' },
        buttons: [
          { replicaKey:'wa-block',  safety:'danger', name:{en:'Block Contact',               bn:'ব্লক করুন',               hi:'ब्लॉक करें'},             desc:{en:"Tap the person's name at the top → scroll to the bottom → Block. This stops them from messaging you. Use this for scammers.",                                bn:'ব্যক্তির নামে চাপ দিন → নিচে স্ক্রল করুন → Block করুন। প্রতারকদের জন্য ব্যবহার করুন।',                                      hi:'व्यक्ति के नाम पर टैप करें → नीचे स्क्रॉल करें → Block। ठगों के लिए उपयोग करें।'} },
        ]
      }
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    brandColor: '#0d5bba',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/120px-Facebook_Logo_%282019%29.png',
    screenshot: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=360&h=640&fit=crop',
    sections: [
      {
        title: { en: 'Posts & Feed', bn: 'পোস্ট ও ফিড', hi: 'पोस्ट और फ़ीड' },
        buttons: [
          { replicaKey:'fb-like',     safety:'safe',   name:{en:'Like Button',    bn:'লাইক বাটন',  hi:'लाइक बटन'},  desc:{en:'The blue thumbs-up under every post. Tap it to show you liked something. Completely safe — it only shows appreciation.',                               bn:'প্রতিটি পোস্টের নিচে নীল থাম্বস-আপ। চাপ দিলে পছন্দ জানানো হয়।',                                              hi:'हर पोस्ट के नीचे नीला अंगूठा। पसंद दिखाने के लिए टैप करें।'} },
          { replicaKey:'fb-comment',  safety:'action', name:{en:'Comment',        bn:'কমেন্ট',     hi:'कमेंट'},      desc:{en:"Tap the speech bubble to write a public reply on someone's post. Remember: everyone in their friend list can read it.",                               bn:'স্পিচ বাবলে চাপ দিয়ে পোস্টে সর্বজনীন মন্তব্য করুন। মনে রাখবেন, সবাই দেখতে পাবে।',                             hi:'स्पीच बबल टैप करें। आपकी टिप्पणी सभी पढ़ सकते हैं।'} },
          { replicaKey:'fb-share',    safety:'action', name:{en:'Share',          bn:'শেয়ার',      hi:'शेयर'},       desc:{en:'Share a post to your own timeline. Always think before sharing — is the information true and from a trusted source?',                                 bn:'পোস্ট আপনার টাইমলাইনে শেয়ার করুন। শেয়ার করার আগে ভাবুন — তথ্যটি কি সত্য?',                                  hi:'पोस्ट अपनी टाइमलाइन पर शेयर करें। शेयर करने से पहले सोचें — जानकारी सच है?'} },
          { replicaKey:'fb-post',     safety:'action', name:{en:'Post Button',    bn:'পোস্ট বাটন', hi:'पोस्ट बटन'}, desc:{en:'The blue Post button after writing something. Tap it to publish your text for your friends or the public to see.',                                    bn:'কিছু লেখার পর নীল Post বাটন। এটিতে চাপ দিলে বন্ধুরা দেখতে পাবে।',                                              hi:'कुछ लिखने के बाद नीला Post बटन। दोस्तों को दिखाने के लिए टैप करें।'} },
        ]
      },
      {
        title: { en: 'Safety & Privacy', bn: 'নিরাপত্তা', hi: 'सुरक्षा और गोपनीयता' },
        buttons: [
          { replicaKey:'fb-report',   safety:'warn',   name:{en:'Report Post',   bn:'রিপোর্ট',    hi:'रिपोर्ट'},    desc:{en:'Tap the three dots (…) on any post → Report. Use this for fake news, scam posts, or harmful content. Facebook will review it.',                    bn:'পোস্টের তিনটি বিন্দুতে → Report। ভুয়া খবর বা প্রতারণামূলক পোস্টের জন্য ব্যবহার করুন।',                        hi:'पोस्ट पर तीन बिंदु → Report। फर्ज़ी खबर या स्कैम पोस्ट के लिए उपयोग करें।'} },
          { replicaKey:'fb-settings', safety:'info',   name:{en:'Menu (≡)',       bn:'মেনু (≡)',    hi:'मेनू (≡)'},   desc:{en:'The three horizontal lines at the top-right. Tap them → Settings & Privacy → to change your password, who sees your posts, and privacy.',             bn:'উপরে তিন লাইন → Settings & Privacy। পাসওয়ার্ড এবং পোস্ট দেখার সেটিং এখানে পাবেন।',                              hi:'ऊपर तीन रेखाएं → Settings & Privacy। पासवर्ड और पोस्ट की दृश्यता यहाँ बदलें।'} },
          { replicaKey:'fb-password', safety:'danger', name:{en:'Change Password',bn:'পাসওয়ার্ড',  hi:'पासवर्ड बदलें'},desc:{en:'Settings → Security & Login → Change Password. Use letters and numbers together. Never share your password with anyone, ever.',                      bn:'Settings → Security & Login → Change Password। কখনো পাসওয়ার্ড কাউকে দেবেন না।',                                hi:'Settings → Security & Login → पासवर्ड बदलें। किसी को भी पासवर्ड न बताएं।'} },
        ]
      }
    ]
  },
  {
    id: 'bkash',
    name: 'bKash',
    color: '#E2136E',
    brandColor: '#b00e56',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/46/BKash_logo.svg/120px-BKash_logo.svg',
    screenshot: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=360&h=640&fit=crop',
    sections: [
      {
        title: { en: 'Sending Money', bn: 'টাকা পাঠানো', hi: 'पैसे भेजना' },
        buttons: [
          { replicaKey:'bkash-send',    safety:'action', name:{en:'Send Money',          bn:'সেন্ড মানি',    hi:'पैसे भेजें'},         desc:{en:'The pink Send Money button on the home screen. Enter the number carefully. Double-check the name shown before confirming.',                         bn:'হোম স্ক্রিনে গোলাপি Send Money বাটন। নম্বর সাবধানে লিখুন। নিশ্চিত করার আগে নাম যাচাই করুন।',                hi:'होम स्क्रीन पर गुलाबी Send Money बटन। नंबर ध्यान से डालें। पुष्टि से पहले नाम जांचें।'} },
          { replicaKey:'bkash-confirm', safety:'warn',   name:{en:'Confirm (Hold)',       bn:'নিশ্চিত করুন',  hi:'पुष्टि करें'},        desc:{en:'The final step — press and hold the button to confirm a transaction. This is the point of no return. Money will be sent immediately.',               bn:'শেষ ধাপ — বাটন চেপে ধরুন। এরপর টাকা চলে যাবে। ফেরানো যাবে না।',                                                hi:'अंतिम चरण — बटन दबाकर रखें। इसके बाद पैसे चले जाएंगे। वापस नहीं होंगे।'} },
          { replicaKey:'bkash-pin',     safety:'danger', name:{en:'PIN Entry',            bn:'পিন এন্ট্রি',   hi:'PIN दर्ज करें'},      desc:{en:'The 5-digit secret PIN. Enter it ONLY to complete YOUR OWN transactions. NEVER type your PIN if someone asks you to receive money — it is a scam.', bn:'৫ সংখ্যার গোপন পিন। শুধু নিজের লেনদেনে দিন। "টাকা পেতে" পিন চাইলে সেটি প্রতারণা।',                             hi:'5 अंकों का गुप्त PIN। केवल अपने लेनदेन के लिए दें। "पैसे पाने" के लिए PIN मांगे तो धोखा है।'} },
        ]
      },
      {
        title: { en: 'Checking Transactions', bn: 'লেনদেন যাচাই', hi: 'लेनदेन जांचें' },
        buttons: [
          { replicaKey:'bkash-history', safety:'info', name:{en:'Statement (History)',   bn:'স্টেটমেন্ট',    hi:'विवरण (इतिहास)'},     desc:{en:'Tap your profile/account icon → Statement. See all past transactions. Check this regularly to spot any unauthorised activity.',                   bn:'প্রোফাইল আইকনে → Statement। সমস্ত লেনদেন দেখুন। অননুমোদিত কার্যকলাপ ধরতে নিয়মিত দেখুন।',                  hi:'प्रोफ़ाइल आइकन → Statement। सभी लेनदेन देखें। अनधिकृत गतिविधि पकड़ने के लिए नियमित जांचें।'} },
        ]
      }
    ]
  },
  {
    id: 'gmail',
    name: 'Gmail',
    color: '#EA4335',
    brandColor: '#c5221f',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/120px-Gmail_icon_%282020%29.svg.png',
    screenshot: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=360&h=640&fit=crop',
    sections: [
      {
        title: { en: 'Reading & Sending', bn: 'পড়া ও পাঠানো', hi: 'पढ़ना और भेजना' },
        buttons: [
          { replicaKey:'gmail-compose', safety:'action', name:{en:'Compose',    bn:'নতুন ইমেইল', hi:'लिखें'},       desc:{en:'The Compose button at the bottom-right. Tap it to start writing a brand new email from scratch.',                                                    bn:'নিচে ডানে Compose বাটন। নতুন ইমেইল লিখতে চাপুন।',                                                              hi:'नीचे दाईं ओर Compose बटन। नई ईमेल लिखने के लिए टैप करें।'} },
          { replicaKey:'gmail-reply',   safety:'action', name:{en:'Reply',      bn:'রিপ্লাই',    hi:'जवाब दें'},    desc:{en:'Open any email → tap the Reply arrow. Your response goes ONLY to the sender, not to everyone.',                                                        bn:'ইমেইল খুলুন → Reply তীরে চাপ দিন। শুধু প্রেরকের কাছে যাবে।',                                                   hi:'ईमेल खोलें → Reply तीर टैप करें। जवाब केवल भेजने वाले को जाएगा।'} },
          { replicaKey:'gmail-star',    safety:'info',   name:{en:'Star',       bn:'স্টার',       hi:'स्टार'},       desc:{en:'Tap the star on any email to mark it as important. Starred emails are easy to find later under the Starred folder.',                               bn:'ইমেইলে স্টার চিহ্নে চাপ দিলে গুরুত্বপূর্ণ হিসেবে চিহ্নিত হয়।',                                               hi:'ईमेल पर स्टार टैप करें। Starred फ़ोल्डर में आसानी से मिलेगी।'} },
        ]
      },
      {
        title: { en: 'Safety & Spam', bn: 'নিরাপত্তা', hi: 'सुरक्षा और स्पैम' },
        buttons: [
          { replicaKey:'gmail-spam', safety:'warn', name:{en:'Report Spam', bn:'স্প্যাম রিপোর্ট', hi:'स्पैम रिपोर्ट'}, desc:{en:'Three dots (⋮) → Report spam. Marks suspicious emails so you stop receiving them. Very important — suspicious emails often contain scam links.', bn:'তিনটি বিন্দু → Report spam। সন্দেহজনক ইমেইল চিহ্নিত করুন।',                                                 hi:'तीन बिंदु → Report spam। संदिग्ध ईमेल को चिह्नित करें।'} },
        ]
      }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon',
    color: '#FF9900',
    brandColor: '#e47911',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png',
    screenshot: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=360&h=640&fit=crop',
    sections: [
      {
        title: { en: 'Shopping Safely', bn: 'নিরাপদ কেনাকাটা', hi: 'सुरक्षित खरीदारी' },
        buttons: [
          { replicaKey:'amazon-cart',     safety:'action', name:{en:'Add to Cart',   bn:'কার্টে যোগ',    hi:'कार्ट में जोड़ें'}, desc:{en:'The orange Add to Cart button. Adds item to your basket — you can review everything before paying. Safe to tap.',                                 bn:'কমলা Add to Cart বাটন। জিনিস ঝুড়িতে যোগ হয়। টাকা দেওয়ার আগে পর্যালোচনা করতে পারবেন।',                        hi:'नारंगी Add to Cart बटन। सामान टोकरी में जाता है। भुगतान से पहले समीक्षा कर सकते हैं।'} },
          { replicaKey:'amazon-buy',      safety:'warn',   name:{en:'Buy Now',       bn:'এখনই কিনুন',   hi:'अभी खरीदें'},       desc:{en:'The yellow Buy Now button goes STRAIGHT to payment — skipping the cart. Use Add to Cart instead so you can review everything first.',              bn:'হলুদ Buy Now সরাসরি পেমেন্টে নিয়ে যায়। পরিবর্তে Add to Cart ব্যবহার করুন।',                                   hi:'पीला Buy Now सीधे भुगतान पर ले जाता है। पहले समीक्षा के लिए Add to Cart उपयोग करें।'} },
          { replicaKey:'amazon-stars',    safety:'info',   name:{en:'Star Ratings',  bn:'রেটিং',         hi:'स्टार रेटिंग'},     desc:{en:'Yellow stars below a product (out of 5). Always prefer products with 4 or more stars and over 100 reviews for good quality assurance.',         bn:'পণ্যের নিচে হলুদ তারা। সর্বদা ৪+ তারা ও ১০০+ রিভিউ আছে এমন পণ্য কিনুন।',                                      hi:'उत्पाद के नीचे पीले तारे। हमेशा 4+ तारे और 100+ समीक्षाओं वाला उत्पाद चुनें।'} },
          { replicaKey:'amazon-checkout', safety:'danger', name:{en:'Place Order',   bn:'অর্ডার দিন',    hi:'ऑर्डर दें'},        desc:{en:'The final Place your order button — this charges your payment. Check the price, delivery address, and the item one last time before tapping.',      bn:'চূড়ান্ত বাটন — টাকা কেটে নেবে। মূল্য, ঠিকানা ও পণ্য একবার শেষ দেখে নিন।',                                    hi:'अंतिम बटन — भुगतान होगा। कीमत, पता और सामान एक बार जांचें।'} },
        ]
      }
    ]
  },
  {
    id: 'booking',
    name: 'Booking.com',
    color: '#003580',
    brandColor: '#00224f',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/200px-Booking.com_logo.svg.png',
    screenshot: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=360&h=640&fit=crop',
    sections: [
      {
        title: { en: 'Booking Hotels', bn: 'হোটেল বুকিং', hi: 'होटल बुकिंग' },
        buttons: [
          { replicaKey:'booking-search',  safety:'safe',   name:{en:'Search',              bn:'সার্চ',          hi:'खोजें'},          desc:{en:'Type the city name in the search box. Then choose your check-in and check-out dates using the calendar.',                                           bn:'সার্চ বক্সে শহরের নাম লিখুন। তারপর চেক-ইন ও চেক-আউটের তারিখ বেছে নিন।',                                         hi:'खोज बॉक्स में शहर का नाम टाइप करें। फिर चेक-इन और चेक-आउट तारीख चुनें।'} },
          { replicaKey:'booking-free',    safety:'safe',   name:{en:'Free Cancellation',   bn:'ফ্রি ক্যান্সেল',  hi:'निःशुल्क रद्द'},  desc:{en:'A green label on a hotel means you can cancel for free before a certain date. ALWAYS prefer this option for safety.',                                 bn:'হোটেলে সবুজ লেবেল মানে নির্দিষ্ট তারিখের আগে বিনামূল্যে বাতিল করা যাবে।',                                       hi:'हरा लेबल मतलब एक निश्चित तारीख से पहले निःशुल्क रद्द हो सकता है।'} },
          { replicaKey:'booking-reserve', safety:'warn',   name:{en:'Reserve',             bn:'রিজার্ভ',         hi:'रिज़र्व करें'},   desc:{en:'The blue Reserve button starts the booking process and may charge your card. Read all terms carefully before tapping.',                            bn:'নীল Reserve বাটন বুকিং শুরু করে। চাপার আগে সব শর্ত পড়ুন।',                                                      hi:'नीला Reserve बटन बुकिंग शुरू करता है। टैप करने से पहले सभी शर्तें पढ़ें।'} },
        ]
      }
    ]
  }
];
