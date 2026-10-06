import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CircleDot, Info, MousePointerClick, ShieldCheck, Volume2 } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { localize } from '../../i18n';
import { buildButtons, guideApps } from '../../data/guideCatalog';
import { Button, Dialog, ProgressBar } from '../ui';
import AppLogo from '../AppLogo';

// Safety level → plain words + tone (never colour alone).
const LEVEL = {
  safe: { tone: 'ok', Icon: ShieldCheck, label: ['Safe to tap', 'নিরাপদে চাপা যায়', 'दबाना सुरक्षित', 'Chạm an toàn'] },
  action: { tone: 'info', Icon: MousePointerClick, label: ['Does something', 'কিছু একটা করে', 'कुछ करता है', 'Thực hiện thao tác'] },
  info: { tone: 'brand', Icon: Info, label: ['Shows information', 'তথ্য দেখায়', 'जानकारी दिखाता है', 'Hiển thị thông tin'] },
  warn: { tone: 'warn', Icon: AlertTriangle, label: ['Check before tapping', 'চাপার আগে দেখে নিন', 'दबाने से पहले जांचें', 'Kiểm tra trước khi chạm'] },
  danger: { tone: 'danger', Icon: AlertTriangle, label: ['Be careful — hard to undo', 'সাবধান — ফেরানো কঠিন', 'सावधान — वापस करना मुश्किल', 'Cẩn thận — khó hoàn tác'] },
};

export default function ButtonGuideExplainer({ appKey, open, onClose }) {
  const { t, language } = usePreferences();
  const { speak, voiceControls } = useVoice();
  const buttons = useMemo(() => (appKey ? buildButtons(appKey) : []), [appKey]);
  const [index, setIndex] = useState(0);
  const app = guideApps().find((a) => a.key === appKey);

  useEffect(() => voiceControls.stop, [index, voiceControls.stop]);

  if (!open || !app) return null;
  const b = buttons[index];
  const level = LEVEL[b?.level] || LEVEL.info;
  const name = localize(b?.name, language);
  const desc = localize(b?.desc, language);
  const englishOnly = language === 'vi' || (b?.name && typeof b.name === 'object' && !b.name[language] && language !== 'en');

  const go = (n) => setIndex(Math.max(0, Math.min(buttons.length - 1, n)));
  const onKeyDown = (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg" title={`${app.name} — ${t('buttons explained', 'বোতামের ব্যাখ্যা', 'बटन समझें', 'giải thích các nút')}`}>
      {b && (
        <div className="guide-explainer" onKeyDown={onKeyDown} role="group" aria-roledescription={t('button guide', 'বোতাম গাইড', 'बटन गाइड', 'hướng dẫn nút')}>
          <div className="row-between">
            <span className="row" style={{ '--gap': 'var(--s-2)' }}>
              <AppLogo app={appKey} name={app.name} size={36} />
              <span className="text-strong num">{t(`${index + 1} of ${buttons.length}`, `${index + 1} / ${buttons.length}`, `${index + 1} / ${buttons.length}`, `${index + 1} / ${buttons.length}`)}</span>
            </span>
            {b.section && <span className="badge">{localize(b.section, language)}</span>}
          </div>
          <ProgressBar value={((index + 1) / buttons.length) * 100} size="sm" label={t('Guide progress', 'গাইডের অগ্রগতি', 'गाइड प्रगति', 'Tiến độ')} />

          <div key={index} className="guide-stage step-in">
            <div className="guide-visual" aria-hidden="true">
              {b.replica || (
                <span className="guide-icon" style={{ '--c': b.color || 'var(--primary)' }}>{b.icon || <CircleDot />}</span>
              )}
            </div>
            <div className="stack" style={{ '--gap': 'var(--s-3)' }}>
              <span className={`badge badge-${level.tone}`}><level.Icon aria-hidden="true" /> {t(...level.label)}</span>
              <h3 className="h-section">{name}</h3>
              <div className="stack" style={{ '--gap': '4px' }}>
                <p className="eyebrow">{t('What it does', 'এটি কী করে', 'यह क्या करता है', 'Nút này làm gì')}</p>
                <p className="guide-desc">{desc}</p>
              </div>
              {b.tip && localize(b.tip, language) !== desc && (
                <div className="stack" style={{ '--gap': '4px' }}>
                  <p className="eyebrow">{t('Good to know', 'জেনে রাখুন', 'जानने लायक', 'Nên biết')}</p>
                  <p className="text-muted">{localize(b.tip, language)}</p>
                </div>
              )}
              {englishOnly && <p className="text-subtle">{t('Shown in English for now.', 'আপাতত ইংরেজিতে দেখানো হচ্ছে।', 'अभी अंग्रेज़ी में दिखाया जा रहा है।', 'Phần hướng dẫn này hiện chỉ có bằng tiếng Anh.')}</p>}
              <Button variant="secondary" icon={Volume2} className="self-start" onClick={() => speak(`${name}. ${desc}`)}>{t('Listen', 'শুনুন', 'सुनें', 'Nghe')}</Button>
            </div>
          </div>

          <div className="row-between">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => go(index - 1)} disabled={index === 0}>{t('Previous', 'আগের', 'पिछला', 'Trước')}</Button>
            {index < buttons.length - 1 ? (
              <Button arrow onClick={() => go(index + 1)}>{t('Next button', 'পরের বোতাম', 'अगला बटन', 'Nút tiếp theo')}</Button>
            ) : (
              <Button icon={ArrowRight} onClick={onClose}>{t('Finish', 'শেষ', 'समाप्त', 'Xong')}</Button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
