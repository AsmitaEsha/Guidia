import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GuidiaLogo from '../../components/GuidiaLogo';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordRequirements from '../../components/auth/PasswordRequirements';
import { isPasswordStrong } from '../../components/auth/passwordRules';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', preferredLanguage: 'en',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const canSubmit = form.fullName && form.email && isPasswordStrong(form.password) && passwordsMatch && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message || "That didn't work. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-theme="light" style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#eef4f9,#e8f4f0)', display: 'flex', flexDirection: 'column', color: 'var(--text-1)' }}>
      <Link to="/" className="flex items-center gap-12 anim-up" style={{ padding: '24px 36px', width: 'fit-content' }}>
        <GuidiaLogo size={42} />
        <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-1)' }}>Guidia</span>
      </Link>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 16px 48px' }}>
        <div className="auth-card anim-up d1" style={{ maxWidth: 460, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 className="t-title">Create your Guidia account</h1>
            <p className="t-sub" style={{ marginTop: 6 }}>A simpler, safer way to become more confident with technology.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="fullName" style={{ fontWeight: 700 }}>Full name</label>
              <input id="fullName" className="input-field" required value={form.fullName} onChange={update('fullName')} placeholder="Enter your name" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="email" style={{ fontWeight: 700 }}>Email</label>
              <input id="email" className="input-field" type="email" autoComplete="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="password" style={{ fontWeight: 700 }}>Password</label>
              <PasswordInput id="password" autoComplete="new-password" required value={form.password} onChange={update('password')} placeholder="Create a strong password" />
              <PasswordRequirements password={form.password} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="confirmPassword" style={{ fontWeight: 700 }}>Confirm password</label>
              <PasswordInput id="confirmPassword" autoComplete="new-password" required value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Re-enter your password" />
              {form.confirmPassword.length > 0 && (
                <p style={{ fontSize: 13, fontWeight: 700, color: passwordsMatch ? 'var(--success)' : 'var(--text-3)' }}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
            <p className="t-tiny">You'll choose your preferred language and comfort level right after this.</p>

            {error && (
              <p role="alert" style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 15 }}>{error}</p>
            )}

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={!canSubmit}>
              {submitting ? 'Creating account…' : (<>Create Account <ArrowRight size={22} /></>)}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-3)' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
