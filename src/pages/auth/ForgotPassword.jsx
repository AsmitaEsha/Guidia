import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GuidiaLogo from '../../components/GuidiaLogo';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      // requestPasswordReset never fails based on whether the account
      // exists — only real errors (network, validation) land here.
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
        <div className="auth-card anim-up d1" style={{ maxWidth: 440, width: '100%' }}>
          {!sent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 className="t-title">Reset your password</h1>
                <p className="t-sub" style={{ marginTop: 6 }}>Enter your email address and we'll help you get back into your account.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="email" style={{ fontWeight: 700 }}>Email</label>
                  <input
                    id="email" className="input-field" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  />
                </div>

                {error && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 15 }}>{error}</p>}

                <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="icon-wrap iw-lg ic-blue" style={{ margin: '0 auto 20px' }}><Mail size={28} /></div>
              <h1 className="t-title">Check your email</h1>
              <p className="t-sub" style={{ marginTop: 10, marginBottom: 28 }}>
                If an account exists for <strong>{email}</strong>, we've sent instructions to reset your password.
              </p>
              <button className="btn btn-ghost btn-full" onClick={() => setSent(false)}>Resend email</button>
            </div>
          )}

          <Link to="/login" className="flex items-center justify-center gap-6" style={{ marginTop: 24, color: 'var(--text-3)', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
