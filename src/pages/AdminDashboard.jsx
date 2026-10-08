import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowDownUp, BookOpen, ChevronLeft, ChevronRight, Cpu, FileClock, Hand, HeartHandshake, LogOut, RefreshCw,
  Search, ShieldAlert, ShieldCheck, ToggleLeft, Users, UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { get } from '../services/apiClient';
import { formatDate, formatRelative } from '../i18n';
import { Badge, Button, EmptyState, ErrorState, IconButton, Skeleton, Tabs } from '../components/ui';
import { GuidiaMark } from '../components/GuidiaLogo';

const SEVERITY = [
  { key: 'SAFE', label: ['Safe', 'নিরাপদ', 'सुरक्षित', 'An toàn'], cls: 'sev-safe' },
  { key: 'WARNING', label: ['Warning', 'সতর্কতা', 'चेतावनी', 'Cảnh báo'], cls: 'sev-warn' },
  { key: 'HIGH_RISK', label: ['High risk', 'উচ্চ ঝুঁকি', 'ज़्यादा खतरा', 'Rủi ro cao'], cls: 'sev-risk' },
  { key: 'CRITICAL', label: ['Critical', 'গুরুতর', 'गंभीर', 'Nghiêm trọng'], cls: 'sev-danger' },
];
const ROLE_TONE = { ADMIN: 'danger', GUARDIAN: 'info', SENIOR: 'ok' };
const PAGE_SIZE = 20;

function Metric({ icon: Icon, value, label, context, tone }) {
  return (
    <div className="card admin-metric">
      <span className={`icon-chip icon-chip-sm ${tone ? `tone-${tone}` : ''}`} aria-hidden="true"><Icon /></span>
      <p className="admin-metric-value num">{value ?? '—'}</p>
      <p className="admin-metric-label">{label}</p>
      {context && <p className="text-subtle">{context}</p>}
    </div>
  );
}

function StatusTable({ title, rows, empty }) {
  const entries = Object.entries(rows || {});
  return (
    <div className="card stack" style={{ '--gap': 'var(--s-3)' }}>
      <h3 className="h-card">{title}</h3>
      {entries.length === 0 ? <p className="text-muted">{empty}</p> : (
        <table className="admin-table compact">
          <tbody>
            {entries.map(([k, v]) => <tr key={k}><td>{k.replace(/_/g, ' ').toLowerCase()}</td><td className="num right">{v}</td></tr>)}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UsersTable({ users, t, language }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: 'createdAt', dir: 'desc' });
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = users.filter((u) => !needle || `${u.fullName} ${u.email} ${u.role}`.toLowerCase().includes(needle));
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => (a[sort.key] > b[sort.key] ? dir : a[sort.key] < b[sort.key] ? -dir : 0));
  }, [users, q, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = rows.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const header = (key, label) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="th-sort" onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))}>
        {label} <ArrowDownUp size={14} aria-hidden="true" />
      </button>
    </th>
  );

  return (
    <div className="card card-pad-0 admin-users">
      <div className="admin-table-tools">
        <div className="input-icon grow" style={{ maxWidth: 420 }}>
          <Search aria-hidden="true" />
          <label htmlFor="admin-q" className="sr-only">{t('Search users', 'ব্যবহারকারী খুঁজুন', 'उपयोगकर्ता खोजें', 'Tìm người dùng')}</label>
          <input id="admin-q" className="input" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder={t('Search name, email or role', 'নাম, ইমেইল বা ভূমিকা খুঁজুন', 'नाम, ईमेल या भूमिका खोजें', 'Tìm tên, email hoặc vai trò')} />
        </div>
        <span className="text-subtle">{rows.length} {t('users', 'জন', 'उपयोगकर्ता', 'người dùng')}</span>
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              {header('fullName', t('Name', 'নাম', 'नाम', 'Tên'))}
              {header('email', t('Email', 'ইমেইল', 'ईमेल', 'Email'))}
              {header('role', t('Role', 'ভূমিকা', 'भूमिका', 'Vai trò'))}
              {header('preferredLanguage', t('Language', 'ভাষা', 'भाषा', 'Ngôn ngữ'))}
              {header('createdAt', t('Created', 'তৈরি', 'बनाया', 'Ngày tạo'))}
            </tr>
          </thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id}>
                <td className="text-strong">{u.fullName}</td>
                <td className="mono">{u.email}</td>
                <td><Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge></td>
                <td>{u.preferredLanguage}</td>
                <td title={new Date(u.createdAt).toISOString()}>{formatDate(u.createdAt, language)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <EmptyState compact icon={Search} title={t('No users match', 'কোনো ব্যবহারকারী মেলেনি', 'कोई उपयोगकर्ता नहीं मिला', 'Không có người dùng phù hợp')} />}
      </div>
      {pages > 1 && (
        <div className="admin-pager">
          <IconButton icon={ChevronLeft} size="sm" variant="quiet" label={t('Previous page', 'আগের পাতা', 'पिछला पेज', 'Trang trước')} onClick={() => setPage(current - 1)} disabled={current === 0} />
          <span className="num">{current + 1} / {pages}</span>
          <IconButton icon={ChevronRight} size="sm" variant="quiet" label={t('Next page', 'পরের পাতা', 'अगला पेज', 'Trang sau')} onClick={() => setPage(current + 1)} disabled={current >= pages - 1} />
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t, language } = usePreferences();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState({ users: null, analytics: null, audit: null, switches: null });
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [loadedAt, setLoadedAt] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([get('/admin/users'), get('/admin/analytics'), get('/admin/audit'), get('/admin/switches')])
      .then(([u, a, au, sw]) => {
        if (cancelled) return;
        setData({ users: u.users, analytics: a.analytics, audit: au.entries, switches: sw });
        setState('ready');
        setError('');
        setLoadedAt(new Date().toISOString());
      })
      .catch((err) => { if (!cancelled) { setState((s) => (s === 'ready' ? 'ready' : 'error')); setError(err.message); } });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const refresh = () => { setState((s) => (s === 'ready' ? 'refreshing' : 'loading')); setReloadKey((k) => k + 1); };
  const signOut = async () => { await logout().catch(() => {}); navigate('/login', { replace: true }); };

  const a = data.analytics;
  const sevTotal = a ? SEVERITY.reduce((n, s) => n + (a.riskBySeverity[s.key] || 0), 0) : 0;

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <span className="row" style={{ '--gap': 'var(--s-3)' }}>
          <GuidiaMark size={36} title="" />
          <span className="stack" style={{ '--gap': 0 }}>
            <span className="guidia-wordmark" style={{ fontSize: '1.3rem' }}>Guidia</span>
            <span className="text-subtle" style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t('Admin console', 'অ্যাডমিন কনসোল', 'एडमिन कंसोल', 'Bảng quản trị')}</span>
          </span>
        </span>
        <span className="row admin-top-actions" style={{ '--gap': 'var(--s-2)' }}>
          {loadedAt && <span className="text-subtle hide-sm">{t('Updated', 'হালনাগাদ', 'अपडेट', 'Cập nhật')} {formatRelative(loadedAt, language)}</span>}
          <Button variant="quiet" size="sm" icon={RefreshCw} onClick={refresh} state={state === 'refreshing' ? 'loading' : 'idle'}>{t('Refresh', 'রিফ্রেশ', 'रीफ़्रेश', 'Làm mới')}</Button>
          <span className="row hide-sm" style={{ '--gap': 'var(--s-2)' }}><UserRound size={18} aria-hidden="true" /><span className="text-strong">{user?.fullName}</span></span>
          <IconButton icon={LogOut} size="sm" label={t('Sign out', 'সাইন আউট', 'साइन आउट', 'Đăng xuất')} onClick={signOut} />
        </span>
      </header>

      <main className="admin-main" id="main">
        <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
          <h1 className="h-page">{t('Overview', 'সারসংক্ষেপ', 'सारांश', 'Tổng quan')}</h1>
          <p className="text-muted">{t("Live aggregate figures from this deployment's own database. No message content or per-user activity is shown.", 'এই ডিপ্লয়মেন্টের নিজস্ব ডেটাবেসের সমষ্টিগত সংখ্যা। কোনো মেসেজ বা ব্যক্তিগত কার্যকলাপ দেখানো হয় না।', 'इस डिप्लॉयमेंट के अपने डेटाबेस के कुल आंकड़े। कोई मैसेज या व्यक्तिगत गतिविधि नहीं दिखाई जाती।', 'Số liệu tổng hợp trực tiếp từ cơ sở dữ liệu của hệ thống. Không hiển thị nội dung tin nhắn hay hoạt động cá nhân.')}</p>
        </div>

        {state === 'loading' && (
          <div className="stack" aria-busy="true">
            <div className="admin-metrics"><Skeleton variant="card" height={150} count={4} /></div>
            <Skeleton variant="card" height={260} />
          </div>
        )}
        {state === 'error' && (
          <ErrorState card title={t('Admin data could not be loaded', 'অ্যাডমিন ডেটা লোড হয়নি', 'एडमिन डेटा लोड नहीं हुआ', 'Không tải được dữ liệu quản trị')} message={error} onRetry={refresh} />
        )}
        {error && state !== 'error' && <p className="field-error" role="alert">{error}</p>}

        {a && (
          <>
            <Tabs
              label={t('Admin sections', 'অ্যাডমিন বিভাগ', 'एडमिन हिस्से', 'Mục quản trị')} value={tab} onChange={setTab}
              tabs={[
                { id: 'overview', label: t('Overview', 'সারসংক্ষেপ', 'सारांश', 'Tổng quan'), icon: Activity },
                { id: 'users', label: t('Users', 'ব্যবহারকারী', 'उपयोगकर्ता', 'Người dùng'), icon: Users },
                { id: 'safety', label: t('Safety', 'নিরাপত্তা', 'सुरक्षा', 'An toàn'), icon: ShieldCheck },
                { id: 'system', label: t('System', 'সিস্টেম', 'सिस्टम', 'Hệ thống'), icon: Cpu },
                { id: 'audit', label: t('Audit log', 'অডিট লগ', 'ऑडिट लॉग', 'Nhật ký'), icon: FileClock },
              ]}
            />

            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="stack fade" key={tab} style={{ '--gap': 'var(--s-5)' }}>
              {tab === 'overview' && (
                <>
                  <div className="admin-metrics">
                    <Metric icon={Users} value={a.totalUsers} label={t('Total users', 'মোট ব্যবহারকারী', 'कुल उपयोगकर्ता', 'Tổng người dùng')} />
                    <Metric icon={UserRound} tone="ok" value={a.usersByRole.SENIOR ?? 0} label={t('Senior users', 'প্রবীণ ব্যবহারকারী', 'वरिष्ठ उपयोगकर्ता', 'Người cao tuổi')} />
                    <Metric icon={HeartHandshake} tone="info" value={a.usersByRole.GUARDIAN ?? 0} label={t('Guardians', 'অভিভাবক', 'अभिभावक', 'Người giám hộ')} context={`${a.activeGuardianRelationships} ${t('active links', 'সক্রিয় সংযোগ', 'सक्रिय संबंध', 'liên kết hoạt động')}`} />
                    <Metric icon={ShieldCheck} tone="coral" value={sevTotal} label={t('Safety assessments', 'নিরাপত্তা যাচাই', 'सुरक्षा जांच', 'Lượt kiểm tra an toàn')} context={`${a.totalInterceptions} ${t('interceptions', 'বাধা', 'रोक', 'lần chặn')}`} />
                  </div>
                  <div className="admin-metrics">
                    <Metric icon={BookOpen} value={a.lessonsCompleted} label={t('Lessons completed', 'সম্পন্ন পাঠ', 'पूरे पाठ', 'Bài học đã xong')} />
                    <Metric icon={Hand} value={a.practiceAttempts} label={t('Practice attempts', 'অনুশীলনের চেষ্টা', 'अभ्यास प्रयास', 'Lượt luyện tập')} />
                    <Metric icon={Activity} value={a.independentCompletionRate == null ? '—' : `${a.independentCompletionRate}%`} label={t('Done without help', 'সাহায্য ছাড়া করা', 'बिना मदद के किया', 'Tự làm không cần giúp')} />
                    <Metric icon={ShieldAlert} tone="warn" value={(a.riskBySeverity.WARNING || 0) + (a.riskBySeverity.HIGH_RISK || 0) + (a.riskBySeverity.CRITICAL || 0)} label={t('Risky messages flagged', 'চিহ্নিত ঝুঁকিপূর্ণ মেসেজ', 'चिह्नित खतरनाक मैसेज', 'Tin rủi ro được gắn cờ')} />
                  </div>
                </>
              )}

              {tab === 'users' && <UsersTable users={data.users || []} t={t} language={language} />}

              {tab === 'safety' && (
                <>
                  <div className="card stack" style={{ '--gap': 'var(--s-4)' }}>
                    <h2 className="h-section">{t('Risk severity distribution', 'ঝুঁকির মাত্রার বণ্টন', 'जोखिम स्तर का वितरण', 'Phân bố mức rủi ro')}</h2>
                    {sevTotal === 0 ? <p className="text-muted">{t('No safety checks have been run yet.', 'এখনো কোনো নিরাপত্তা যাচাই হয়নি।', 'अभी तक कोई सुरक्षा जांच नहीं हुई।', 'Chưa có lượt kiểm tra an toàn nào.')}</p> : (
                      <>
                        <div className="sev-bar" role="img" aria-label={SEVERITY.map((s) => `${t(...s.label)} ${a.riskBySeverity[s.key] || 0}`).join(', ')}>
                          {SEVERITY.map((s) => {
                            const n = a.riskBySeverity[s.key] || 0;
                            return n ? <span key={s.key} className={s.cls} style={{ flexGrow: n }} title={`${t(...s.label)}: ${n}`} /> : null;
                          })}
                        </div>
                        <table className="admin-table">
                          <thead><tr><th scope="col">{t('Severity', 'মাত্রা', 'स्तर', 'Mức độ')}</th><th scope="col" className="right">{t('Count', 'সংখ্যা', 'गिनती', 'Số lượng')}</th><th scope="col" className="right">{t('Share', 'অংশ', 'हिस्सा', 'Tỷ lệ')}</th></tr></thead>
                          <tbody>
                            {SEVERITY.map((s) => {
                              const n = a.riskBySeverity[s.key] || 0;
                              return (
                                <tr key={s.key}>
                                  <td><span className={`sev-dot ${s.cls}`} aria-hidden="true" /> {t(...s.label)}</td>
                                  <td className="num right">{n}</td>
                                  <td className="num right">{Math.round((100 * n) / sevTotal)}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                  <div className="admin-two">
                    <StatusTable title={t('Guardian approvals', 'অভিভাবকের অনুমোদন', 'अभिभावक मंज़ूरी', 'Phê duyệt của người giám hộ')} rows={a.approvalsByStatus} empty={t('None yet.', 'এখনো নেই।', 'अभी कोई नहीं।', 'Chưa có.')} />
                    <StatusTable title={t('Help requests', 'সাহায্যের অনুরোধ', 'मदद के अनुरोध', 'Yêu cầu giúp đỡ')} rows={a.emergenciesByStatus} empty={t('None yet.', 'এখনো নেই।', 'अभी कोई नहीं।', 'Chưa có.')} />
                  </div>
                </>
              )}

              {tab === 'system' && (
                <>
                  <div className="card card-pad-0">
                    <h2 className="h-section" style={{ padding: 'var(--s-5) var(--s-5) var(--s-3)' }}>{t('AI requests (last 30 days)', 'এআই অনুরোধ (গত ৩০ দিন)', 'AI अनुरोध (पिछले 30 दिन)', 'Yêu cầu AI (30 ngày qua)')}</h2>
                    <div className="admin-table-scroll">
                      {a.aiLast30Days.length === 0 ? <p className="text-muted" style={{ padding: '0 var(--s-5) var(--s-5)' }}>{t('No AI requests yet.', 'এখনো কোনো এআই অনুরোধ নেই।', 'अभी कोई AI अनुरोध नहीं।', 'Chưa có yêu cầu AI.')}</p> : (
                        <table className="admin-table">
                          <thead><tr><th scope="col">{t('Feature', 'ফিচার', 'फ़ीचर', 'Tính năng')}</th><th scope="col">{t('Status', 'অবস্থা', 'स्थिति', 'Trạng thái')}</th><th scope="col" className="right">{t('Requests', 'অনুরোধ', 'अनुरोध', 'Yêu cầu')}</th><th scope="col" className="right">{t('Avg. latency', 'গড় সময়', 'औसत समय', 'Độ trễ TB')}</th></tr></thead>
                          <tbody>
                            {a.aiLast30Days.map((r) => (
                              <tr key={`${r.feature}-${r.status}`}>
                                <td>{r.feature}</td>
                                <td><Badge tone={r.status === 'ok' ? 'ok' : 'warn'}>{r.status}</Badge></td>
                                <td className="num right">{r.count}</td>
                                <td className="num right">{(r.avgLatencyMs / 1000).toFixed(1)} s</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                  <div className="admin-two">
                    <StatusTable title={t('Notification delivery', 'নোটিফিকেশন পাঠানো', 'सूचना वितरण', 'Gửi thông báo')} rows={a.notificationDelivery} empty={t('Nothing sent yet.', 'এখনো কিছু পাঠানো হয়নি।', 'अभी कुछ नहीं भेजा।', 'Chưa gửi gì.')} />
                    <div className="card stack" style={{ '--gap': 'var(--s-3)' }}>
                      <h3 className="h-card row" style={{ '--gap': '8px' }}><ToggleLeft size={20} aria-hidden="true" /> {t('Feature flags & kill switches', 'ফিচার ও কিল সুইচ', 'फ़ीचर और किल स्विच', 'Cờ tính năng & công tắc')}</h3>
                      <ul className="switch-list">
                        {Object.entries({ ...(data.switches?.features || {}), ...Object.fromEntries(Object.entries(data.switches?.killSwitches || {}).map(([k, v]) => [`kill:${k}`, v])) }).map(([k, v]) => (
                          <li key={k}><span className="mono">{k}</span><Badge tone={k.startsWith('kill:') ? (v ? 'danger' : 'ok') : (v ? 'ok' : undefined)}>{k.startsWith('kill:') ? (v ? 'ENGAGED' : 'off') : (v ? 'on' : 'off')}</Badge></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {tab === 'audit' && (
                <div className="card card-pad-0">
                  <div className="admin-table-scroll">
                    {(data.audit || []).length === 0 ? <EmptyState compact icon={FileClock} title={t('No audit entries yet', 'এখনো অডিট এন্ট্রি নেই', 'अभी कोई ऑडिट प्रविष्टि नहीं', 'Chưa có mục nhật ký')} /> : (
                      <table className="admin-table">
                        <thead><tr><th scope="col">{t('When', 'কখন', 'कब', 'Khi nào')}</th><th scope="col">{t('Action', 'কাজ', 'कार्य', 'Hành động')}</th><th scope="col">{t('Actor', 'কর্তা', 'कर्ता', 'Người thực hiện')}</th><th scope="col">{t('Target', 'লক্ষ্য', 'लक्ष्य', 'Đối tượng')}</th><th scope="col">Request</th></tr></thead>
                        <tbody>
                          {data.audit.map((e, i) => (
                            <tr key={`${e.requestId}-${i}`}>
                              <td title={e.createdAt}>{formatRelative(e.createdAt, language)}</td>
                              <td className="mono">{e.action}</td>
                              <td>{e.actorType}</td>
                              <td>{e.targetType || '—'}</td>
                              <td className="mono text-subtle">{e.requestId?.slice(0, 8) || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
