// Practice-simulator fixtures. Fictional people and messages used only
// inside Guidia's pretend apps — never shown as real user data.

export const FAKE_CONTACTS = [
  { id: 'c1', name: 'Rupa (Daughter)', avatar: '', lastSeen: '2 min ago', phone: '018XXXXXX33' },
  { id: 'c2', name: 'Dr. Ahmed', avatar: '', lastSeen: '1 hour ago', phone: '017XXXXXX91' },
  { id: 'c3', name: 'Family Group', avatar: '', members: 5, lastSeen: 'just now' },
  { id: 'c4', name: 'Mosque Neighbour', avatar: '', lastSeen: 'yesterday', phone: '016XXXXXX02' },
];

export const FAKE_WHATSAPP_MESSAGES = {
  c1: [
    { id: 'm1', from: 'them', text: 'Abba, how are you?', time: '10:02 AM' },
    { id: 'm2', from: 'me', text: 'I am fine, how are you my dear?', time: '10:05 AM' },
    { id: 'm3', from: 'them', text: 'Great! Did you eat lunch?', time: '10:06 AM' },
  ],
  c3: [
    { id: 'm1', from: 'them', text: 'Good morning everyone!', time: '8:00 AM', sender: 'Rupa' },
    { id: 'm2', from: 'them', text: 'Today is Eid Mubarak! ', time: '8:15 AM', sender: 'Dr. Ahmed' },
    { id: 'm3', from: 'me', text: 'Eid Mubarak to all!', time: '9:00 AM' },
  ],
};

export const FAKE_FACEBOOK_POSTS = [
  { id: 'p1', author: 'Rupa (Daughter)', avatar: '', time: '2 hours ago', text: 'Beautiful sunset from our rooftop today! Thinking of everyone.', likes: 24, comments: 5, image: true },
  { id: 'p2', author: 'Dr. Ahmed', avatar: '', time: 'Yesterday', text: 'Health tip: Walking 30 minutes a day keeps the heart strong. Stay healthy everyone!', likes: 41, comments: 8 },
  { id: 'p3', author: 'Mosque Neighbour', avatar: '', time: '3 days ago', text: 'Jummah Mubarak to all brothers and sisters. May Allah bless you all.', likes: 67, comments: 14 },
];

export const FAKE_GMAIL_INBOX = [
  { id: 'e1', from: 'Brac Bank', subject: 'Your monthly statement is ready', time: '9:00 AM', read: false, safe: true, body: 'Dear Customer, Your monthly bank statement for April is ready to view in your account. Please log in to your official account to access it.' },
  { id: 'e2', from: 'Rupa Ahmed', subject: 'Photo from yesterday', time: 'Yesterday', read: true, safe: true, body: 'Abba, I am sending you the photo we took at the garden. Hope you like it! Love, Rupa.' },
  { id: 'e3', from: 'LOTTERY PRIZE !!!', subject: 'YOU WON 500,000 TAKA CLICK NOW', time: '2 days ago', read: false, safe: false, body: 'Congratulations! You have been selected to receive 500,000 Taka prize money. Click this link immediately to claim before it expires...' },
];
