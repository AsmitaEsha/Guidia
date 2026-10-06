import { Check, Circle } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { PASSWORD_RULES, passwordStrength } from './passwordRules';

const LEVELS = [
  ['', '', '', ''],
  ['Weak', 'দুর্বল', 'कमज़ोर', 'Yếu'],
  ['Getting there', 'আরেকটু', 'ठीक-ठाक', 'Tạm được'],
  ['Good', 'ভালো', 'अच्छा', 'Tốt'],
  ['Strong', 'শক্ত', 'मज़बूत', 'Mạnh'],
];

// Neutral while empty/typing, success once met — never a jarring red
// error state while the user is still typing.
export default function PasswordRequirements({ password, id }) {
  const { t } = usePreferences();
  const strength = passwordStrength(password);
  return (
    <div className="pw-req" id={id}>
      <div className="pw-meter" aria-hidden="true" data-level={strength}>
        {[1, 2, 3, 4].map((n) => <span key={n} data-on={strength >= n} />)}
      </div>
      {password && <p className="pw-level" aria-live="polite">{t('Strength', 'শক্তি', 'मज़बूती', 'Độ mạnh')}: <strong>{t(...LEVELS[strength])}</strong></p>}
      <ul className="pw-rules">
        {PASSWORD_RULES.map((rule) => {
          const met = password.length > 0 && rule.test(password);
          return (
            <li key={rule.label[0]} data-met={met}>
              {met ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
              <span>{t(...rule.label)}</span>
              <span className="sr-only">{met ? t('(done)', '(হয়েছে)', '(हो गया)', '(đạt)') : t('(not yet)', '(এখনো নয়)', '(अभी नहीं)', '(chưa)')}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
