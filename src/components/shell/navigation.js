import { Bell, BookMarked, BookOpen, Hand, HeartHandshake, Home, LifeBuoy, MessageCircle, ScanSearch, Settings, ShieldCheck, TrendingUp, Users } from 'lucide-react';

// Senior navigation. Labels are [en, bn, hi, vi] for t().
export const NAV_GROUPS = [
  {
    id: 'everyday',
    label: ['Everyday', 'প্রতিদিন', 'रोज़ाना', 'Hằng ngày'],
    items: [
      { to: 'home', icon: Home, label: ['Home', 'হোম', 'होम', 'Trang chủ'] },
      { to: 'ask', icon: MessageCircle, label: ['Ask Guidia', 'Guidia-কে জিজ্ঞাসা', 'Guidia से पूछें', 'Hỏi Guidia'], short: ['Ask', 'জিজ্ঞাসা', 'पूछें', 'Hỏi'] },
      { to: 'screen', icon: ScanSearch, label: ['Understand my screen', 'আমার স্ক্রিন বুঝুন', 'मेरी स्क्रीन समझें', 'Hiểu màn hình của tôi'], short: ['My screen', 'স্ক্রিন', 'स्क्रीन', 'Màn hình'] },
    ],
  },
  {
    id: 'learn',
    label: ['Learn', 'শিখুন', 'सीखें', 'Học'],
    items: [
      { to: 'learn', icon: BookOpen, label: ['Learn', 'শিখুন', 'सीखें', 'Học'] },
      { to: 'practice', icon: Hand, label: ['Practice', 'অনুশীলন', 'अभ्यास', 'Luyện tập'] },
    ],
  },
  {
    id: 'protect',
    label: ['Protect', 'সুরক্ষা', 'सुरक्षा', 'Bảo vệ'],
    items: [
      { to: 'safety', icon: ShieldCheck, label: ['Safety', 'নিরাপত্তা', 'सुरक्षा', 'An toàn'] },
    ],
  },
  {
    id: 'mine',
    label: ['My Guidia', 'আমার Guidia', 'मेरा Guidia', 'Guidia của tôi'],
    items: [
      { to: 'memory', icon: BookMarked, label: ['Memory Book', 'স্মৃতির খাতা', 'याद की किताब', 'Sổ ghi nhớ'] },
      { to: 'progress', icon: TrendingUp, label: ['My progress', 'আমার অগ্রগতি', 'मेरी प्रगति', 'Tiến bộ của tôi'] },
      { to: 'people', icon: Users, label: ['Trusted people', 'বিশ্বস্ত মানুষ', 'भरोसेमंद लोग', 'Người tin cậy'] },
    ],
  },
];

export const UTILITY_NAV = [
  { to: 'notifications', icon: Bell, label: ['Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo'] },
  { to: 'settings', icon: Settings, label: ['Settings', 'সেটিংস', 'सेटिंग्स', 'Cài đặt'] },
];

export const HELP_ITEM = { to: 'help', icon: LifeBuoy, label: ['I need help', 'আমার সাহায্য দরকার', 'मुझे मदद चाहिए', 'Tôi cần giúp đỡ'], short: ['Help', 'সাহায্য', 'मदद', 'Giúp đỡ'] };

// Mobile bottom bar: four destinations + "More".
export const BOTTOM_NAV = ['home', 'learn', 'ask', 'safety'];
// Everything else goes in the "More" sheet, in this order.
export const MORE_NAV = ['practice', 'screen', 'memory', 'progress', 'people', 'notifications', 'settings', 'help'];

// Family accounts (a son, daughter or carer): their dashboard first, plus
// the lessons and safety pages so they can explain things the same way.
export const FAMILY_NAV_GROUPS = [
  {
    id: 'family',
    label: ['My family', 'আমার পরিবার', 'मेरा परिवार', 'Gia đình tôi'],
    items: [
      { to: 'family', icon: HeartHandshake, label: ['Family dashboard', 'পরিবারের ড্যাশবোর্ড', 'परिवार डैशबोर्ड', 'Bảng gia đình'], short: ['Family', 'পরিবার', 'परिवार', 'Gia đình'] },
    ],
  },
  {
    id: 'help-them',
    label: ['Help them learn', 'শিখতে সাহায্য', 'सीखने में मदद', 'Giúp họ học'],
    items: [
      { to: 'learn', icon: BookOpen, label: ['Lessons', 'পাঠ', 'पाठ', 'Bài học'] },
      { to: 'practice', icon: Hand, label: ['Practice apps', 'অনুশীলন অ্যাপ', 'अभ्यास ऐप', 'Ứng dụng luyện tập'] },
      { to: 'safety', icon: ShieldCheck, label: ['Safety', 'নিরাপত্তা', 'सुरक्षा', 'An toàn'] },
    ],
  },
];
export const FAMILY_BOTTOM_NAV = ['family', 'learn', 'safety', 'notifications'];
export const FAMILY_MORE_NAV = ['practice', 'settings'];

/** Navigation for the signed-in role. */
export function navFor(role) {
  if (role === 'GUARDIAN') {
    return { groups: FAMILY_NAV_GROUPS, utility: UTILITY_NAV, help: null, bottom: FAMILY_BOTTOM_NAV, more: FAMILY_MORE_NAV, home: 'family' };
  }
  return { groups: NAV_GROUPS, utility: UTILITY_NAV, help: HELP_ITEM, bottom: BOTTOM_NAV, more: MORE_NAV, home: 'home' };
}

export const ALL_NAV = [
  ...NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g }))),
  ...FAMILY_NAV_GROUPS[0].items.map((i) => ({ ...i, group: FAMILY_NAV_GROUPS[0] })),
  ...UTILITY_NAV, HELP_ITEM,
];

/** The nav entry (and its group) for a pathname like /app/learn/abc. */
export function navForPath(pathname) {
  const key = /^\/app\/([^/]+)/.exec(pathname)?.[1];
  return ALL_NAV.find((i) => i.to === key) || null;
}
