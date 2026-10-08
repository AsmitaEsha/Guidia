import { RotateCcw, Sparkles } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { IconButton, ModeLabel, cx } from '../ui';

// Frame for every interactive demo on the landing page and in /showcase.
// Always labelled "Guided demo" so a demonstration is never mistaken for
// a live account or real data. state: ready | active | complete.
export default function GuidiaDemoFrame({ title, state = 'ready', onReset, children, className, bare }) {
  const { t } = usePreferences();
  return (
    <div className={cx('demo-frame', bare && 'is-bare', className)} data-state={state}>
      <div className="demo-frame-bar">
        <ModeLabel kind="demo" icon={Sparkles}>{t('Guided demo', 'নির্দেশিত ডেমো', 'निर्देशित डेमो', 'Bản demo có hướng dẫn')}</ModeLabel>
        {title && <span className="demo-frame-title truncate">{title}</span>}
        {onReset && <IconButton icon={RotateCcw} size="sm" variant="ghost" className="ml-auto" label={t('Start this demo again', 'ডেমোটি আবার শুরু করুন', 'डेमो फिर से शुरू करें', 'Bắt đầu lại bản demo')} onClick={onReset} />}
      </div>
      <div className="demo-frame-body">{children}</div>
    </div>
  );
}
