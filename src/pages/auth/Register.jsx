import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, HeartHandshake, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordRequirements from '../../components/auth/PasswordRequirements';
import { isPasswordStrong } from '../../components/auth/passwordRules';
import { Alert, Button, ChoiceCard, Field } from '../../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { language, t } = usePreferences();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Who is this account for? A learner, or a family member who follows a
  // learner and answers their help requests. ?as=family preselects.
  const [accountType, setAccountType] = useState(params.get('as') === 'family' ? 'FAMILY' : 'LEARNER');
  const [familyCode, setFamilyCode] = useState(params.get('code') || '');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [state, setState] = useState('idle');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((tt) => ({ ...tt, [field]: true }));
  const emailOk = EMAIL_RE.test(form.email.trim());
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const canSubmit = form.fullName.trim() && emailOk && isPasswordStrong(form.password) && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, confirmPassword: true });
    if (!canSubmit) return;
    setError('');
    setState('loading');
    try {
      const isFamily = accountType === 'FAMILY';
      await register({ ...form, fullName: form.fullName.trim(), email: form.email.trim(), preferredLanguage: language, accountType, ...(isFamily && familyCode.trim() ? { familyCode: familyCode.trim() } : {}) });
      setState('success');
      setTimeout(() => navigate(isFamily ? '/app/family' : '/onboarding', { replace: true }), 450);
    } catch (err) {
      setError(err.message || t("That didn't work. Please try again.", 'হয়নি। আবার চেষ্টা করুন।', 'नहीं हुआ। फिर कोशिश करें।', 'Chưa được. Vui lòng thử lại.'));
      setState('idle');
    }
  };

  return (
    <AuthLayout statement={t('A simpler, safer way to feel at home with technology.', 'প্রযুক্তিকে আপন করে নেওয়ার সহজ, নিরাপদ পথ।', 'तकनीक के साथ सहज होने का आसान, सुरक्षित तरीका।', 'Cách đơn giản, an toàn để quen thuộc với công nghệ.')}>
      <div className="auth-card">
        <header className="stack" style={{ '--gap': 'var(--s-2)' }}>
          <h1 className="auth-title">{t('Create your Guidia account', 'আপনার Guidia অ্যাকাউন্ট খুলুন', 'अपना Guidia खाता बनाएं', 'Tạo tài khoản Guidia')}</h1>
          <p className="lead">{accountType === 'FAMILY'
            ? t('Follow your parent’s progress and get their help requests the moment they ask.', 'বাবা-মায়ের অগ্রগতি দেখুন, আর তাঁরা সাহায্য চাইলেই সঙ্গে সঙ্গে জানুন।', 'माता-पिता की प्रगति देखें, और मदद मांगते ही तुरंत जानें।', 'Theo dõi tiến độ của bố mẹ và nhận ngay yêu cầu giúp đỡ của họ.')
            : t('Learn your apps at your own pace, with a calm guide beside you.', 'নিজের গতিতে অ্যাপ শিখুন, পাশে থাকবে এক শান্ত সহায়ক।', 'अपनी रफ़्तार से ऐप सीखें, साथ में एक शांत मार्गदर्शक।', 'Học ứng dụng theo nhịp của bạn, có người hướng dẫn điềm tĩnh bên cạnh.')}</p>
        </header>

        <form className="stack" style={{ '--gap': 'var(--s-4)' }} onSubmit={handleSubmit} noValidate>
          <fieldset className="stack" style={{ '--gap': 'var(--s-2)', border: 0, padding: 0, margin: 0 }}>
            <legend className="label" style={{ marginBottom: 'var(--s-2)' }}>{t('This account is for', 'এই অ্যাকাউন্টটি কার জন্য', 'यह खाता किसके लिए है', 'Tài khoản này dành cho')}</legend>
            <div className="account-type" role="radiogroup">
              <ChoiceCard icon={BookOpen} selected={accountType === 'LEARNER'} onSelect={() => setAccountType('LEARNER')}
                title={t('I want to learn', 'আমি শিখতে চাই', 'मैं सीखना चाहता हूँ', 'Tôi muốn học')}
                body={t('Lessons, practice and help for me', 'আমার জন্য পাঠ, অনুশীলন আর সাহায্য', 'मेरे लिए पाठ, अभ्यास और मदद', 'Bài học, luyện tập và trợ giúp cho tôi')} />
              <ChoiceCard icon={HeartHandshake} selected={accountType === 'FAMILY'} onSelect={() => setAccountType('FAMILY')}
                title={t('I help a family member', 'আমি পরিবারের কাউকে সাহায্য করি', 'मैं परिवार के किसी की मदद करता हूँ', 'Tôi giúp người thân')}
                body={t('For a son, daughter or carer', 'ছেলে, মেয়ে বা দেখাশোনাকারীর জন্য', 'बेटे, बेटी या देखभाल करने वाले के लिए', 'Dành cho con cái hoặc người chăm sóc')} />
            </div>
          </fieldset>
          <Field label={t('Full name', 'পুরো নাম', 'पूरा नाम', 'Họ và tên')} error={touched.fullName && !form.fullName.trim() ? t('Please enter your name.', 'আপনার নাম লিখুন।', 'अपना नाम लिखें।', 'Vui lòng nhập tên.') : null}>
            {(p) => <input {...p} className="input input-lg" autoComplete="name" required value={form.fullName} onChange={update('fullName')} onBlur={blur('fullName')} />}
          </Field>
          <Field label={t('Email address', 'ইমেইল ঠিকানা', 'ईमेल पता', 'Địa chỉ email')} error={touched.email && form.email && !emailOk ? t('Please check the email address — it looks incomplete.', 'ইমেইল ঠিকানাটি দেখে নিন — অসম্পূর্ণ মনে হচ্ছে।', 'ईमेल पता जांचें — अधूरा लग रहा है।', 'Hãy kiểm tra email — có vẻ chưa đầy đủ.') : null}>
            {(p) => <input {...p} className="input input-lg" type="email" autoComplete="email" inputMode="email" required value={form.email} onChange={update('email')} onBlur={blur('email')} placeholder="you@example.com" />}
          </Field>
          <div className="field">
            <label htmlFor="password" className="label">{t('Password', 'পাসওয়ার্ড', 'पासवर्ड', 'Mật khẩu')}</label>
            <PasswordInput id="password" autoComplete="new-password" required value={form.password} onChange={update('password')} describedBy="pw-req" />
            <PasswordRequirements password={form.password} id="pw-req" />
          </div>
          <Field label={t('Confirm password', 'পাসওয়ার্ড আবার লিখুন', 'पासवर्ड दोबारा लिखें', 'Nhập lại mật khẩu')}
            error={touched.confirmPassword && form.confirmPassword && !passwordsMatch ? t('The passwords are not the same yet.', 'পাসওয়ার্ড দুটি এখনো মেলেনি।', 'दोनों पासवर्ड अभी एक जैसे नहीं हैं।', 'Hai mật khẩu chưa giống nhau.') : null}
            success={passwordsMatch ? t('Passwords match', 'পাসওয়ার্ড মিলেছে', 'पासवर्ड मेल खाते हैं', 'Mật khẩu khớp') : null}>
            {(p) => <PasswordInput id={p.id} autoComplete="new-password" required value={form.confirmPassword} onChange={update('confirmPassword')} onBlur={blur('confirmPassword')} invalid={p['aria-invalid']} describedBy={p['aria-describedby']} />}
          </Field>

          {accountType === 'FAMILY' && (
            <Field label={t('Family code from your parent', 'বাবা-মায়ের দেওয়া ফ্যামিলি কোড', 'माता-पिता का फैमिली कोड', 'Mã gia đình từ bố mẹ')} optional={t('optional — you can add it later', 'ঐচ্ছিক — পরেও দিতে পারবেন', 'वैकल्पिक — बाद में भी डाल सकते हैं', 'không bắt buộc — có thể thêm sau')}
              hint={t('They find it in Guidia → Trusted people. Entering it connects you straight away.', 'তাঁরা Guidia → বিশ্বস্ত মানুষ-এ এটি পাবেন। কোডটি দিলে সঙ্গে সঙ্গে যুক্ত হবেন।', 'उन्हें यह Guidia → भरोसेमंद लोग में मिलेगा। कोड डालते ही आप जुड़ जाएंगे।', 'Họ tìm mã trong Guidia → Người tin cậy. Nhập mã là kết nối ngay.')}>
              {(p) => <input {...p} className="input input-lg family-code-input" value={familyCode} maxLength={9} autoComplete="off" autoCapitalize="characters" spellCheck="false" placeholder="ABC123" onChange={(e) => setFamilyCode(e.target.value.toUpperCase().replace(/[^A-Z0-9 -]/g, ''))} />}
            </Field>
          )}

          {error && <Alert tone="warn">{error}</Alert>}

          <Button type="submit" size="lg" block icon={state === 'idle' ? UserPlus : undefined} disabled={!canSubmit} state={state}
            loadingLabel={t('Creating your account…', 'অ্যাকাউন্ট তৈরি হচ্ছে…', 'खाता बन रहा है…', 'Đang tạo tài khoản…')} successLabel={t('Account created', 'অ্যাকাউন্ট তৈরি হয়েছে', 'खाता बन गया', 'Đã tạo tài khoản')}>
            {t('Create account', 'অ্যাকাউন্ট খুলুন', 'खाता बनाएं', 'Tạo tài khoản')}
          </Button>
        </form>

        <p className="auth-switch">{t('Already have an account?', 'আগে থেকেই অ্যাকাউন্ট আছে?', 'पहले से खाता है?', 'Đã có tài khoản?')} <Link to="/login" className="text-strong">{t('Sign in', 'সাইন ইন', 'साइन इन', 'Đăng nhập')}</Link></p>
      </div>
    </AuthLayout>
  );
}
