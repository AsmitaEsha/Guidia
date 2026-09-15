import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Activity, LogOut, ArrowLeft } from 'lucide-react';
import GuidiaLoadingState from '../components/ui/GuidiaLoadingState';
import GuidiaErrorState from '../components/ui/GuidiaErrorState';

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
      <p style={{ fontSize: 30, fontWeight: 900, color: 'var(--blue)' }}>{value}</p>
      <p className="t-sub">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, authedFetch, logout, ApiError } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    Promise.all([authedFetch('/admin/users'), authedFetch('/admin/analytics')])
      .then(([u, a]) => {
        if (cancelled) return;
        setUsers(u.users);
        setAnalytics(a.analytics);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load admin data.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-icon btn-ghost" onClick={() => navigate('/app')} title="Back to app"><ArrowLeft size={20}/></button>
        <div className="icon-wrap iw-sm ic-blue"><Shield size={20}/></div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 800, fontSize: 18 }}>Guidia Admin</p>
          <p className="t-tiny">{user?.fullName}</p>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={handleLogout}><LogOut size={16}/> Sign Out</button>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {loading && <GuidiaLoadingState label="Loading admin data…" />}
        {!loading && error && <GuidiaErrorState message={error} onRetry={load} />}

        {!loading && !error && analytics && (
          <>
            <h1 className="t-title" style={{ marginBottom: 8 }}>Overview</h1>
            <p className="t-sub" style={{ marginBottom: 20 }}>Live figures from this deployment's own database — not a demo/evaluation dataset.</p>
            <div className="grid-3" style={{ gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Users" value={analytics.totalUsers} />
              <StatCard label="Lessons Completed" value={analytics.totalLessonsCompleted} />
              <StatCard label="Safety Checks Run" value={analytics.totalRiskAssessments} />
              <StatCard label="Risky Messages Flagged" value={(analytics.riskBySeverity.WARNING||0)+(analytics.riskBySeverity.HIGH_RISK||0)+(analytics.riskBySeverity.CRITICAL||0)} />
              <StatCard label="Safety Net Interceptions" value={analytics.totalInterceptions} />
              <StatCard label="Guardian Relationships (Active)" value={`${analytics.activeGuardianRelationships} / ${analytics.totalGuardianRelationships}`} />
            </div>

            <h2 className="t-head" style={{ marginBottom: 12 }}><Users size={18} style={{ verticalAlign: '-3px', marginRight: 6 }}/>Users</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
              {users.map((u, i) => (
                <div key={u.id} className="flex items-center gap-14" style={{ padding: '14px 20px', borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700 }}>{u.fullName}</p>
                    <p className="t-tiny">{u.email}</p>
                  </div>
                  <span className="badge" style={{ background: u.role === 'ADMIN' ? 'var(--danger-light)' : u.role === 'GUARDIAN' ? 'var(--blue-light)' : 'var(--success-light)', color: u.role === 'ADMIN' ? 'var(--danger)' : u.role === 'GUARDIAN' ? 'var(--blue)' : 'var(--success)' }}>{u.role}</span>
                  <p className="t-tiny" style={{ minWidth: 100, textAlign: 'right' }}>{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>

            <h2 className="t-head" style={{ marginBottom: 12 }}><Activity size={18} style={{ verticalAlign: '-3px', marginRight: 6 }}/>Safety Severity Breakdown</h2>
            <div className="card">
              {['SAFE', 'WARNING', 'HIGH_RISK', 'CRITICAL'].map((sev) => (
                <div key={sev} className="flex items-center justify-between" style={{ padding: '8px 0' }}>
                  <p className="t-sub">{sev.replace('_', ' ')}</p>
                  <p style={{ fontWeight: 700 }}>{analytics.riskBySeverity[sev] || 0}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
