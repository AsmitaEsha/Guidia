import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ShieldCheck, GraduationCap, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GuidiaLogo from '../../components/GuidiaLogo';
import PasswordInput from '../../components/auth/PasswordInput';

const PANEL_POINTS = [
  { icon: <GraduationCap size={17} />, label: 'Pick up right where you left off' },
  { icon: <ShieldCheck size={17} />, label: 'Your safety checks and Guardian stay connected' },
  { icon: <HeartHandshake size={17} />, label: 'Saved lessons are waiting in your Memory Book' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login({ email, password, rememberMe });
      const needsOnboarding = !loggedInUser?.preference?.onboardingDone;
      const redirectTo = needsOnboarding ? '/onboarding' : (location.state?.from?.pathname || '/app/home');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // ApiError messages are already human-friendly (never raw
      // "401 Unauthorized"/stack-trace text) — see apiClient.js/backend
      // errorHandler.js, which strip technical detail before it reaches here.
      setError(err.message || "We couldn't sign you in. Please check your email and password and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-theme="light" style={{ minHeight: '100vh', color: 'var(--text-1)', display: 'flex' }}>
      {/* Brand panel — hidden on narrow viewports */}
      <div className="lp-auth-panel" style={{ flex: 1, background: 'var(--gradient-brand)', color: '#fff', padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Link to="/" className="flex items-center gap-12" style={{ color: '#fff' }}>
          <GuidiaLogo size={38} />
          <span style={{ fontWeight: 800, fontSize: 19 }}>Guidia</span>
        </Link>
        <div>
          <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.3, marginBottom: 16, maxWidth: 380 }}>
            Technology should feel understandable.
          </p>
          <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 360, marginBottom: 32 }}>
            Sign in to continue learning, practicing, and navigating digital experiences with Guidia.
          </p>
          <div className="flex-col gap-14">
            {PANEL_POINTS.map((p) => (
              <div key={p.label} className="flex items-center gap-12">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.icon}</div>
                <span style={{ fontSize: 14, opacity: 0.9 }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div />
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 16px 48px', background: 'var(--warm-white)' }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <Link to="/" className="lp-auth-mobile-logo flex items-center gap-12" style={{ marginBottom: 32, color: 'var(--text-1)' }}>
            <GuidiaLogo size={38} />
            <span style={{ fontWeight: 800, fontSize: 19 }}>Guidia</span>
          </Link>

          <div style={{ marginBottom: 32 }}>
            <h1 className="t-title">Welcome back</h1>
            <p className="t-sub" style={{ marginTop: 6 }}>Continue where you left off.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="email" style={{ fontWeight: 700 }}>Email</label>
              <input
                id="email" className="input-field" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="flex items-center justify-between">
                <label htmlFor="password" style={{ fontWeight: 700 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)' }}>Forgot password?</Link>
              </div>
              <PasswordInput id="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            </div>

            <label className="flex items-center gap-8" style={{ fontSize: 15, color: 'var(--text-2)' }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember me
            </label>

            {error && (
              <p id="login-error" role="alert" style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 15 }}>{error}</p>
            )}

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={submitting || !email || !password}>
              {submitting ? 'Signing in…' : (<>Sign In <ArrowRight size={22} /></>)}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-3)' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 700 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
