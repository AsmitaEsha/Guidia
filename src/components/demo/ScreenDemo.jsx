import { useState } from 'react';
import { ArrowRight, CircleHelp, Lock, ShieldAlert, Volume2, X } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { Button, RiskBadge } from '../ui';
import GuidiaDemoFrame from './GuidiaDemoFrame';

// A pretend phone screen that copies a common scam: a "verify your
// account" page asking for a PIN. Numbered clues match Guidia's real
// screen-explanation layout. Each marker is rendered inside the element it
// describes, so it stays on target at any size or language.
const CLUES = [
  { tone: 'warn', label: ['Strange web address', 'অদ্ভুত ওয়েব ঠিকানা', 'अजीब वेब पता', 'Địa chỉ web lạ'],
    why: ['The address is not the company\'s real website. Fake pages copy the look, not the address.', 'ঠিকানাটি প্রতিষ্ঠানের আসল ওয়েবসাইট নয়। ভুয়া পেজ চেহারা নকল করে, ঠিকানা নয়।', 'पता कंपनी की असली वेबसाइट नहीं है। नकली पेज रूप की नकल करते हैं, पते की नहीं।', 'Địa chỉ không phải trang thật của công ty. Trang giả bắt chước giao diện, không phải địa chỉ.'] },
  { tone: 'danger', label: ['Urgent warning banner', 'জরুরি সতর্কবার্তা', 'जरूरी चेतावनी बैनर', 'Biểu ngữ cảnh báo gấp'],
    why: ['Pressure like "suspended today" is designed to rush you. Real services give you time.', '"আজই বন্ধ" ধরনের চাপ আপনাকে তাড়াহুড়ো করাতে চায়। আসল সেবা সময় দেয়।', '"आज ही बंद" जैसा दबाव आपको जल्दबाज़ी कराने के लिए है। असली सेवाएं समय देती हैं।', 'Áp lực như "khóa hôm nay" nhằm hối thúc bạn. Dịch vụ thật luôn cho bạn thời gian.'] },
  { tone: 'danger', label: ['PIN box', 'পিনের ঘর', 'पिन का बॉक्स', 'Ô nhập mã PIN'],
    why: ['Never type your PIN on a page you opened from a message. This is how money is stolen.', 'মেসেজ থেকে খোলা পেজে কখনো পিন লিখবেন না। এভাবেই টাকা চুরি হয়।', 'संदेश से खुले पेज पर कभी पिन न लिखें। ऐसे ही पैसे चुराए जाते हैं।', 'Đừng bao giờ nhập PIN trên trang mở từ tin nhắn. Tiền bị lấy cắp theo cách này.'] },
  { tone: 'brand', label: ['Close / Cancel', 'বন্ধ / বাতিল', 'बंद / रद्द', 'Đóng / Hủy'],
    why: ['This is the safe choice. Close the page and open the official app yourself.', 'এটাই নিরাপদ পথ। পেজটি বন্ধ করে নিজে অফিসিয়াল অ্যাপ খুলুন।', 'यही सुरक्षित विकल्प है। पेज बंद करें और खुद आधिकारिक ऐप खोलें।', 'Đây là lựa chọn an toàn. Đóng trang và tự mở ứng dụng chính thức.'] },
];

export default function ScreenDemo() {
  const { t } = usePreferences();
  const { speak } = useVoice();
  const [active, setActive] = useState(-1);
  const [showWhy, setShowWhy] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const reset = () => { setActive(-1); setShowWhy(false); setShowNext(false); };
  const next = () => { setActive((a) => (a + 1) % CLUES.length); setShowWhy(false); };
  const clue = CLUES[active];
  const marker = (i) => {
    const c = CLUES[i];
    return (
      <button type="button" className={`screen-marker is-anchored mk-${c.tone}`} data-active={active === i} aria-pressed={active === i}
        onClick={() => { setActive(i); setShowWhy(true); }} aria-label={`${i + 1}. ${t(...c.label)}`}>{i + 1}</button>
    );
  };

  const summary = t('A page asking you to "verify" your account by typing your PIN.', 'একটি পেজ যা পিন লিখে অ্যাকাউন্ট "যাচাই" করতে বলছে।', 'एक पेज जो पिन लिखकर खाता "सत्यापित" करने को कह रहा है।', 'Một trang yêu cầu bạn "xác minh" tài khoản bằng cách nhập PIN.');
  const nextStep = t('Close this page. Open the official app yourself — never from a link.', 'পেজটি বন্ধ করুন। নিজে অফিসিয়াল অ্যাপ খুলুন — কখনো লিংক থেকে নয়।', 'यह पेज बंद करें। खुद आधिकारिक ऐप खोलें — कभी लिंक से नहीं।', 'Đóng trang này. Tự mở ứng dụng chính thức — đừng mở từ link.');

  return (
    <GuidiaDemoFrame title={t('Understand my screen', 'আমার স্ক্রিন বুঝুন', 'मेरी स्क्रीन समझें', 'Hiểu màn hình của tôi')} state={showNext ? 'complete' : active >= 0 ? 'active' : 'ready'} onReset={active >= 0 || showNext ? reset : undefined}>
      <div className="demo-screen">
        <div className="demo-phone" role="group" aria-label={t('Example screenshot of a fake verification page', 'ভুয়া যাচাই পেজের উদাহরণ স্ক্রিনশট', 'नकली सत्यापन पेज का उदाहरण स्क्रीनशॉट', 'Ảnh ví dụ về trang xác minh giả')}>
          <div className="dp-url dp-anchor"><Lock aria-hidden="true" /><span>secure-wallet-verify.example</span>{marker(0)}</div>
          <div className="dp-banner dp-anchor">⚠ {t('Your account will be SUSPENDED today! Verify now', 'আজই আপনার অ্যাকাউন্ট বন্ধ হবে! এখনই যাচাই করুন', 'आज आपका खाता बंद होगा! अभी सत्यापित करें', 'Tài khoản sẽ bị KHÓA hôm nay! Xác minh ngay')}{marker(1)}</div>
          <div className="dp-body">
            <p className="dp-h">{t('Account verification', 'অ্যাকাউন্ট যাচাই', 'खाता सत्यापन', 'Xác minh tài khoản')}</p>
            <div className="dp-field"><span>{t('Mobile number', 'মোবাইল নম্বর', 'मोबाइल नंबर', 'Số điện thoại')}</span><b>01X-XXXX-XX12</b></div>
            <div className="dp-field is-pin dp-anchor"><span>{t('Enter PIN to continue', 'এগোতে পিন দিন', 'आगे बढ़ने के लिए पिन डालें', 'Nhập PIN để tiếp tục')}</span><b>• • • • •</b>{marker(2)}</div>
            <div className="dp-btn">{t('Verify now', 'এখনই যাচাই', 'अभी सत्यापित करें', 'Xác minh ngay')}</div>
            <div className="dp-cancel dp-anchor"><X aria-hidden="true" /> {t('Cancel', 'বাতিল', 'रद्द करें', 'Hủy')}{marker(3)}</div>
          </div>
        </div>

        <div className="demo-explain">
          <RiskBadge severity="CRITICAL" t={t} size="lg" />
          <div className="stack" style={{ '--gap': '4px' }}>
            <p className="eyebrow">{t("What you're seeing", 'আপনি যা দেখছেন', 'आप क्या देख रहे हैं', 'Bạn đang thấy gì')}</p>
            <p className="text-strong">{summary}</p>
          </div>
          <div className="demo-clue" aria-live="polite">
            {clue ? (
              <>
                <p className="eyebrow">{t('What to check', 'কী দেখবেন', 'क्या जांचें', 'Cần kiểm tra')} · {active + 1}/{CLUES.length}</p>
                <p className="text-strong">{active + 1}. {t(...clue.label)}</p>
                {showWhy && <p className="fade">{t(...clue.why)}</p>}
              </>
            ) : <p className="text-muted">{t('Tap a number on the screen, or press "See the next clue".', 'স্ক্রিনে একটি নম্বরে চাপুন, বা "পরের সূত্র" চাপুন।', 'स्क्रीन पर किसी नंबर को दबाएं, या "अगला सुराग" दबाएं।', 'Chạm một số trên màn hình, hoặc bấm "Dấu hiệu tiếp theo".')}</p>}
          </div>
          {showNext && (
            <div className="next-step fade">
              <p className="eyebrow">{t('Next safe step', 'পরের নিরাপদ ধাপ', 'अगला सुरक्षित कदम', 'Bước an toàn tiếp theo')}</p>
              <p className="text-strong">{nextStep}</p>
            </div>
          )}
          <div className="demo-actions">
            <Button size="sm" iconRight={ArrowRight} onClick={next}>{t('See the next clue', 'পরের সূত্র দেখুন', 'अगला सुराग देखें', 'Dấu hiệu tiếp theo')}</Button>
            <Button size="sm" variant="secondary" icon={CircleHelp} onClick={() => { if (active < 0) setActive(0); setShowWhy(true); }}>{t('Why does this matter?', 'এটা কেন জরুরি?', 'यह क्यों ज़रूरी है?', 'Vì sao điều này quan trọng?')}</Button>
            <Button size="sm" variant="secondary" icon={ShieldAlert} onClick={() => setShowNext(true)}>{t('What should I do?', 'আমি কী করব?', 'मुझे क्या करना चाहिए?', 'Tôi nên làm gì?')}</Button>
            <Button size="sm" variant="ghost" icon={Volume2} onClick={() => speak(`${summary} ${nextStep}`)}>{t('Listen', 'শুনুন', 'सुनें', 'Nghe')}</Button>
          </div>
        </div>
      </div>
    </GuidiaDemoFrame>
  );
}
