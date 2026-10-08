import { useState } from 'react';
import { Contrast, Eye, ListOrdered, Volume2, Wind } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { Button, Switch } from '../ui';
import GuidiaDemoFrame from './GuidiaDemoFrame';

// The controls change only the preview card, so a visitor can feel the
// difference without changing their own settings.
export default function AccessibilityDemo() {
  const { t } = usePreferences();
  const { speak } = useVoice();
  const [size, setSize] = useState(18);
  const [contrast, setContrast] = useState(false);
  const [calm, setCalm] = useState(false);
  const [simple, setSimple] = useState(false);

  const steps = [
    t('Open the chat with your daughter.', 'মেয়ের সাথে চ্যাট খুলুন।', 'बेटी की चैट खोलें।', 'Mở cuộc trò chuyện với con gái.'),
    t('Tap the paperclip, then choose the photo.', 'পেপারক্লিপে চাপুন, তারপর ছবি বেছে নিন।', 'पेपरक्लिप दबाएं, फिर फोटो चुनें।', 'Chạm kẹp giấy, rồi chọn ảnh.'),
    t('Press the green arrow to send.', 'পাঠাতে সবুজ তীরে চাপুন।', 'भेजने के लिए हरा तीर दबाएं।', 'Bấm mũi tên xanh để gửi.'),
  ];

  return (
    <GuidiaDemoFrame title={t('Accessibility', 'সহজলভ্যতা', 'सुलभता', 'Trợ năng')} state="active" onReset={size !== 18 || contrast || calm || simple ? () => { setSize(18); setContrast(false); setCalm(false); setSimple(false); } : undefined}>
      <div className="demo-a11y">
        <div className="a11y-controls">
          <div className="field">
            <label className="label row" style={{ '--gap': '8px' }} htmlFor="a11y-size"><Eye size={18} aria-hidden="true" /> {t('Text size', 'লেখার আকার', 'अक्षर का आकार', 'Cỡ chữ')}</label>
            <input id="a11y-size" type="range" className="range" min={16} max={26} value={size} onChange={(e) => setSize(Number(e.target.value))} aria-valuetext={`${size}px`} />
          </div>
          <div className="setting-row"><span className="row" style={{ '--gap': '8px' }} id="a11y-c"><Contrast size={18} aria-hidden="true" />{t('High contrast', 'উচ্চ কনট্রাস্ট', 'उच्च कंट्रास्ट', 'Tương phản cao')}</span><Switch checked={contrast} onChange={setContrast} labelledBy="a11y-c" /></div>
          <div className="setting-row"><span className="row" style={{ '--gap': '8px' }} id="a11y-m"><Wind size={18} aria-hidden="true" />{t('Reduce movement', 'নড়াচড়া কমান', 'हलचल कम करें', 'Giảm chuyển động')}</span><Switch checked={calm} onChange={setCalm} labelledBy="a11y-m" /></div>
          <div className="setting-row"><span className="row" style={{ '--gap': '8px' }} id="a11y-s"><ListOrdered size={18} aria-hidden="true" />{t('One step at a time', 'এক এক ধাপে', 'एक-एक कदम', 'Từng bước một')}</span><Switch checked={simple} onChange={setSimple} labelledBy="a11y-s" /></div>
          <Button size="sm" variant="tonal" icon={Volume2} onClick={() => speak(steps.join(' '))}>{t('Hear it read aloud', 'পড়ে শুনুন', 'पढ़कर सुनें', 'Nghe đọc to')}</Button>
        </div>
        <div className={`a11y-preview ${contrast ? 'is-contrast' : ''} ${calm ? 'is-calm' : ''}`} style={{ fontSize: size }} aria-label={t('Preview', 'নমুনা', 'झलक', 'Xem trước')}>
          <p className="a11y-preview-title">{t('Send a photo to your family', 'পরিবারকে ছবি পাঠান', 'परिवार को फोटो भेजें', 'Gửi ảnh cho gia đình')}</p>
          <ol>
            {(simple ? steps.slice(0, 1) : steps).map((s, i) => <li key={i}><span>{i + 1}</span>{s}</li>)}
          </ol>
          {simple && <p className="a11y-next">{t('Next step appears when you are ready →', 'প্রস্তুত হলে পরের ধাপ আসবে →', 'तैयार होने पर अगला कदम आएगा →', 'Bước tiếp sẽ hiện khi bạn sẵn sàng →')}</p>}
          <span className="a11y-pulse" aria-hidden="true" />
        </div>
      </div>
    </GuidiaDemoFrame>
  );
}
