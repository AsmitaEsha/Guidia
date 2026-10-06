// Landing-page navigation and walkthrough modes. Labels are [en, bn, hi, vi].
import { BookMarked, Hand, MessageCircle, ScanSearch, ShieldCheck } from 'lucide-react';

export const LANDING_LINKS = [
  ['how', ['How it works', 'কীভাবে কাজ করে', 'कैसे काम करता है', 'Cách hoạt động']],
  ['helps', ['What Guidia helps with', 'Guidia কীসে সাহায্য করে', 'Guidia किसमें मदद करता है', 'Guidia giúp gì']],
  ['safety', ['Safety', 'নিরাপত্তা', 'सुरक्षा', 'An toàn']],
  ['families', ['Families', 'পরিবার', 'परिवार', 'Gia đình']],
  ['accessibility', ['Accessibility', 'সহজলভ্যতা', 'सुलभता', 'Trợ năng']],
];

export const WALKTHROUGH_MODES = [
  { id: 'ask', icon: MessageCircle, label: ['Ask', 'জিজ্ঞাসা', 'पूछें', 'Hỏi'], intro: ['Ask in your own words — by typing or speaking. Guidia answers in short, calm steps.', 'নিজের ভাষায় জিজ্ঞাসা করুন — লিখে বা বলে। Guidia ছোট, শান্ত ধাপে উত্তর দেয়।', 'अपने शब्दों में पूछें — लिखकर या बोलकर। Guidia छोटे, शांत कदमों में जवाब देता है।', 'Hỏi theo cách của bạn — gõ hoặc nói. Guidia trả lời bằng các bước ngắn, bình tĩnh.'] },
  { id: 'see', icon: ScanSearch, label: ['See', 'দেখুন', 'देखें', 'Xem'], intro: ['Share a confusing screen. Guidia explains it and points to what matters.', 'বিভ্রান্তিকর স্ক্রিন দেখান। Guidia বুঝিয়ে দেয় আর জরুরি অংশ দেখায়।', 'उलझन वाली स्क्रीन दिखाएं। Guidia समझाता है और ज़रूरी हिस्सा दिखाता है।', 'Chia sẻ màn hình khó hiểu. Guidia giải thích và chỉ điều quan trọng.'] },
  { id: 'practise', icon: Hand, label: ['Practise', 'অনুশীলন', 'अभ्यास', 'Luyện tập'], intro: ['Try real-looking apps with pretend money. Guidia checks every sensitive step.', 'নকল টাকা দিয়ে আসলের মতো অ্যাপ চেষ্টা করুন। Guidia প্রতিটি সংবেদনশীল ধাপ যাচাই করে।', 'नकली पैसों से असली जैसे ऐप आज़माएं। Guidia हर संवेदनशील कदम जांचता है।', 'Thử ứng dụng giống thật với tiền giả. Guidia kiểm tra mọi bước nhạy cảm.'] },
  { id: 'protect', icon: ShieldCheck, label: ['Protect', 'সুরক্ষা', 'सुरक्षा', 'Bảo vệ'], intro: ['Not sure about a message? Guidia explains the warning signs and the safe response.', 'মেসেজ নিয়ে সন্দেহ? Guidia সতর্কতার চিহ্ন ও নিরাপদ পদক্ষেপ বুঝিয়ে দেয়।', 'संदेश पर शक है? Guidia चेतावनी के संकेत और सुरक्षित कदम समझाता है।', 'Nghi ngờ một tin nhắn? Guidia giải thích dấu hiệu và cách phản hồi an toàn.'] },
  { id: 'remember', icon: BookMarked, label: ['Remember', 'মনে রাখুন', 'याद रखें', 'Ghi nhớ'], intro: ['Every skill moves from guided to independent — and Guidia helps you keep it.', 'প্রতিটি দক্ষতা নির্দেশনা থেকে স্বাধীনতায় যায় — আর Guidia তা ধরে রাখতে সাহায্য করে।', 'हर कौशल मार्गदर्शन से आत्मनिर्भरता तक जाता है — और Guidia उसे बनाए रखने में मदद करता है।', 'Mỗi kỹ năng đi từ có hướng dẫn đến tự lập — và Guidia giúp bạn giữ nó.'] },
];

