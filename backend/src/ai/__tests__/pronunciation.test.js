import test from 'node:test';
import assert from 'node:assert/strict';
import { forSpeech } from '../pronunciation.js';
import { speechSegments, spokenLanguage } from '../speech.js';

test('Bengali voice gets native spellings for English words', () => {
  assert.equal(forSpeech('Guidia-কে শুনুন', 'bn'), 'গাইডিয়াকে শুনুন');
  assert.equal(forSpeech('কাউকে OTP বা PIN বলবেন না', 'bn'), 'কাউকে ও টি পি বা পিন বলবেন না');
  assert.equal(forSpeech('bKash থেকে Send Money চাপুন', 'bn'), 'বিকাশ থেকে সেন্ড মানি চাপুন');
});

test('Hindi voice gets native spellings for English words', () => {
  assert.equal(forSpeech('Guidia को सुनें', 'hi'), 'गाइडिया को सुनें');
  assert.equal(forSpeech('Nagad में Tap for Balance दबाएं', 'hi'), 'नगद में टैप फ़ॉर बैलेंस दबाएं');
});

test('only whole words are replaced, and other languages pass through', () => {
  assert.equal(forSpeech('WhatsAppiness', 'bn'), 'WhatsAppiness');
  assert.equal(forSpeech('Hello, I am Guidia.', 'xx'), 'Hello, I am Guidia.');
  assert.equal(forSpeech('Guidianess', 'en'), 'Guidianess');
});

test('English and Vietnamese voices say Guidia as "guide-ee-uh"', () => {
  assert.equal(forSpeech('Hello, I am Guidia.', 'en'), 'Hello, I am Guydia.');
  assert.equal(speechSegments('Ask Guidia anything', 'en')[0].text, 'Ask Guydia anything');
  assert.equal(forSpeech('Hỏi Guidia', 'vi'), 'Hỏi Gai đi a');
});

test('an English phrase inside Bengali is read by the English voice', () => {
  assert.deepEqual(speechSegments('Send a voice message on imo শুনুন', 'bn'), [
    { lang: 'en', text: 'Send a voice message on imo' },
    { lang: 'bn', text: 'শুনুন' },
  ]);
  // Phrases the dictionary covers stay in one native voice.
  assert.equal(speechSegments('bKash থেকে Send Money চাপুন।', 'bn').length, 1);
});

test('the voice follows the script the text is written in', () => {
  assert.equal(spokenLanguage('পিন লিখবেন না।', 'en'), 'bn');
  assert.equal(spokenLanguage('पिन न लिखें।', 'bn'), 'hi');
  assert.equal(spokenLanguage('Xin chào', 'en'), 'vi');
  assert.equal(spokenLanguage('Practice payment completed.', 'hi'), 'en');
});
