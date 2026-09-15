import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GuidiaLogo from '../../components/GuidiaLogo';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordRequirements from '../../components/auth/PasswordRequirements';
import { isPasswordStrong } from '../../components/auth/passwordRules';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = token && isPasswordStrong(password) && passwordsMatch && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      setDone(true);
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
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div className="icon-wrap iw-lg ic-success" style={{ margin: '0 auto 20px' }}><CheckCircle2 size={28} /></div>
              <h1 className="t-title">Password reset</h1>
              <p className="t-sub" style={{ marginTop: 10, marginBottom: 28 }}>Your password has been changed. Please sign in with your new password.</p>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/login', { replace: true })}>Sign In</button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 className="t-title">Choose a new password</h1>
                <p className="t-sub" style={{ marginTop: 6 }}>Make it something you haven't used before.</p>
              </div>

              {!token && (
                <p role="alert" style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 15, marginBottom: 20, textAlign: 'center' }}>
                  This reset link is invalid or incomplete. Please request a new one.
                </p>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="password" style={{ fontWeight: 700 }}>New password</label>
                  <PasswordInput id="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a new password" />
                  <PasswordRequirements password={password} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="confirmPassword" style={{ fontWeight: 700 }}>Confirm new password</label>
                  <PasswordInput id="confirmPassword" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your new password" />
                  {confirmPassword.length > 0 && (
                    <p style={{ fontSize: 13, fontWeight: 700, color: passwordsMatch ? 'var(--success)' : 'var(--text-3)' }}>
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>

                {error && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 15 }}>{error}</p>}

                <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={!canSubmit}>
                  {submitting ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <Link to="/login" className="flex items-center justify-center gap-6" style={{ marginTop: 24, color: 'var(--text-3)', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
