import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Eye, MousePointerClick, ShieldCheck, Volume2 } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { buildButtons, guideApps } from '../../data/guideCatalog';
import { Button, Dialog, ProgressBar } from '../ui';
import AppLogo from '../AppLogo';
import ButtonReplica from './ButtonReplica';

// How careful to be → plain words + tone (never colour alone).
const LEVEL = {
  safe: { tone: 'ok', Icon: ShieldCheck, label: ['Safe to tap', 'নিশ্চিন্তে চাপুন', 'बेझिझक दबाएं', 'Chạm thoải mái'] },
  check: { tone: 'warn', Icon: Eye, label: ['Check before you tap', 'চাপার আগে মিলিয়ে নিন', 'दबाने से पहले जांच लें', 'Kiểm tra trước khi chạm'] },
  careful: { tone: 'danger', Icon: AlertTriangle, label: ['Be careful — this can’t be undone', 'সাবধান — এটা আর ফেরানো যায় না', 'सावधान — यह वापस नहीं होता', 'Cẩn thận — không hoàn tác được'] },
};

export default function ButtonGuideExplainer({ appKey, open, onClose }) {
  const { t } = usePreferences();
  const { speak, voiceControls } = useVoice();
  const buttons = useMemo(() => (appKey ? buildButtons(appKey) : []), [appKey]);
  const [index, setIndex] = useState(0);
  const app = guideApps().find((a) => a.key === appKey);

  useEffect(() => voiceControls.stop, [index, voiceControls.stop]);

  // Left/right arrows move between buttons as soon as the guide is open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(buttons.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, buttons.length]);

  if (!open || !app) return null;
  const b = buttons[index];
  const level = LEVEL[b?.level] || LEVEL.safe;
  const name = b ? t(...b.name) : '';
  const does = b ? t(...b.does) : '';
  const desc = b ? t(...b.desc) : '';

  const go = (n) => setIndex(Math.max(0, Math.min(buttons.length - 1, n)));

  return (
    <Dialog open={open} onClose={onClose} size="lg" title={`${app.name} — ${t('buttons explained', 'বোতামের ব্যাখ্যা', 'बटन समझें', 'giải thích các nút')}`}>
      {b && (
        <div className="guide-explainer" role="group" aria-roledescription={t('button guide', 'বোতাম গাইড', 'बटन गाइड', 'hướng dẫn nút')}>
          <div className="row-between">
            <span className="row" style={{ '--gap': 'var(--s-2)' }}>
              <AppLogo app={appKey} name={app.name} size={36} />
              <span className="text-strong num">{t(`${index + 1} of ${buttons.length}`, `${index + 1} / ${buttons.length}`, `${index + 1} / ${buttons.length}`, `${index + 1} / ${buttons.length}`)}</span>
            </span>
            {b.section && <span className="badge">{t(...b.section)}</span>}
          </div>
          <ProgressBar value={((index + 1) / buttons.length) * 100} size="sm" label={t('Guide progress', 'গাইডের অগ্রগতি', 'गाइड प्रगति', 'Tiến độ')} />

          <div key={index} className="guide-stage step-in">
            <div className="guide-visual" aria-hidden="true">
              <ButtonReplica spec={b.replica} />
              <span className="guide-visual-caption">{t('How it looks in the app', 'অ্যাপে যেমন দেখায়', 'ऐप में ऐसा दिखता है', 'Trông như thế này trong ứng dụng')}</span>
            </div>
            <div className="stack" style={{ '--gap': 'var(--s-3)' }}>
              <h3 className="h-section">{name}</h3>
              <p className="guide-does"><MousePointerClick aria-hidden="true" /><span><span className="sr-only">{t('What it does', 'এটি কী করে', 'यह क्या करता है', 'Nút này làm gì')}: </span>{does}</span></p>
              <span className={`badge badge-${level.tone} self-start`}><level.Icon aria-hidden="true" /> {t(...level.label)}</span>
              <p className="guide-desc">{desc}</p>
              <Button variant="secondary" icon={Volume2} className="self-start" onClick={() => speak(`${name}. ${does}. ${desc}`)}>{t('Listen', 'শুনুন', 'सुनें', 'Nghe')}</Button>
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
