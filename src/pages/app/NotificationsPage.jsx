import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, BookOpen, Check, CheckCheck, ChevronRight, HeartHandshake, MailX, Settings2, ShieldCheck, Users } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate, formatRelative } from '../../i18n';
import { notificationText } from '../../data/notificationText';
import { Button, EmptyState, ErrorState, IconButton, PageHeader, Segmented, Skeleton } from '../../components/ui';

// type → category, icon and where tapping should go.
const TYPE = {
  EMERGENCY: { cat: 'help', icon: AlertTriangle, to: '/app/people' },
  EMERGENCY_UPDATE: { cat: 'help', icon: HeartHandshake, to: '/app/help' },
  APPROVAL_REQUEST: { cat: 'safety', icon: ShieldCheck, to: '/app/people' },
  APPROVAL_RESULT: { cat: 'safety', icon: ShieldCheck, to: '/app/practice' },
  GUARDIAN_INVITE: { cat: 'people', icon: Users, to: '/app/people' },
  GUARDIAN_CONNECTED: { cat: 'people', icon: Users, to: '/app/people' },
  GUARDIAN_REVOKED: { cat: 'people', icon: Users, to: '/app/people' },
  PERMISSION_CHANGED: { cat: 'people', icon: Settings2, to: '/app/people' },
};
const CATS = [
  ['all', ['All', 'সব', 'सभी', 'Tất cả']],
  ['help', ['Help', 'সাহায্য', 'मदद', 'Giúp đỡ']],
  ['safety', ['Safety', 'নিরাপত্তা', 'सुरक्षा', 'An toàn']],
  ['people', ['Trusted people', 'বিশ্বস্ত মানুষ', 'भरोसेमंद लोग', 'Người tin cậy']],
  ['learning', ['Learning', 'শেখা', 'सीखना', 'Học tập']],
  ['system', ['System', 'সিস্টেম', 'सिस्टम', 'Hệ thống']],
];
const RANK = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

function dayGroup(iso) {
  const d = new Date(iso);
  const start = new Date(); start.setHours(0, 0, 0, 0);
  if (d >= start) return 'today';
  if (d >= new Date(start.getTime() - 86_400_000)) return 'yesterday';
  return 'earlier';
}

export default function NotificationsPage() {
  const { t, language } = usePreferences();
  const { items, unreadCount, state, reload, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [cat, setCat] = useState('all');

  const groups = useMemo(() => {
    const list = items
      .map((n) => ({ ...n, ...notificationText(n, t), meta: TYPE[n.type] || { cat: 'system', icon: Bell, to: null } }))
      .filter((n) => cat === 'all' || n.meta.cat === cat);
    // Unread urgent first, then newest.
    list.sort((a, b) => (Number(a.read) - Number(b.read)) || ((RANK[a.severity] ?? 3) - (RANK[b.severity] ?? 3)) || (new Date(b.createdAt) - new Date(a.createdAt)));
    const out = { today: [], yesterday: [], earlier: [] };
    for (const n of list) out[dayGroup(n.createdAt)].push(n);
    return out;
  }, [items, cat, t]);

  const open = (n) => {
    if (!n.read) markRead(n.id);
    if (n.meta.to) navigate(n.meta.to);
  };
  const label = { today: t('Today', 'আজ', 'आज', 'Hôm nay'), yesterday: t('Yesterday', 'গতকাল', 'कल', 'Hôm qua'), earlier: t('Earlier', 'আগে', 'पहले', 'Trước đó') };
  const total = groups.today.length + groups.yesterday.length + groups.earlier.length;

  return (
    <div className="page page-narrow notifications-page">
      <PageHeader
        eyebrow={t('Notifications', 'নোটিফিকেশন', 'सूचनाएं', 'Thông báo')}
        title={unreadCount ? t(`${unreadCount} new`, `${unreadCount}টি নতুন`, `${unreadCount} नई`, `${unreadCount} mới`) : t('You are all caught up', 'সব দেখা হয়ে গেছে', 'सब देख लिया', 'Bạn đã xem hết')}
        actions={unreadCount > 0 && <Button variant="quiet" size="sm" icon={CheckCheck} onClick={markAllRead}>{t('Mark all as read', 'সব পড়া হয়েছে', 'सभी पढ़ा हुआ', 'Đánh dấu đã đọc hết')}</Button>}
      />
      <div className="scroll-x"><Segmented label={t('Category', 'বিভাগ', 'श्रेणी', 'Danh mục')} value={cat} onChange={setCat} options={CATS.map(([v, l]) => ({ value: v, label: t(...l) }))} /></div>

      {state === 'loading' && <Skeleton variant="card" height={96} count={4} style={{ marginBottom: 12 }} />}
      {state === 'error' && <ErrorState card title={t('Could not load notifications', 'নোটিফিকেশন লোড হয়নি', 'सूचनाएं लोड नहीं हुईं', 'Không tải được thông báo')} onRetry={reload} />}
      {state === 'ready' && total === 0 && (
        <EmptyState card icon={Bell} title={cat === 'all' ? t('No notifications yet', 'এখনো কোনো নোটিফিকেশন নেই', 'अभी कोई सूचना नहीं', 'Chưa có thông báo') : t('Nothing here', 'এখানে কিছু নেই', 'यहाँ कुछ नहीं', 'Không có gì ở đây')}
          action={cat !== 'all' ? <Button variant="secondary" onClick={() => setCat('all')}>{t('Show all', 'সব দেখুন', 'सब देखें', 'Xem tất cả')}</Button> : <Button variant="secondary" icon={BookOpen} to="/app/learn">{t('Start learning', 'শেখা শুরু করুন', 'सीखना शुरू करें', 'Bắt đầu học')}</Button>}>
          {t('Updates from your trusted people and safety alerts will appear here.', 'বিশ্বস্ত মানুষদের খবর ও নিরাপত্তা সতর্কবার্তা এখানে দেখাবে।', 'भरोसेमंद लोगों की खबर और सुरक्षा अलर्ट यहाँ दिखेंगे।', 'Cập nhật từ người tin cậy và cảnh báo an toàn sẽ hiện ở đây.')}
        </EmptyState>
      )}

      {['today', 'yesterday', 'earlier'].map((g) => groups[g].length > 0 && (
        <section key={g} className="section" aria-labelledby={`ng-${g}`}>
          <h2 id={`ng-${g}`} className="notif-group">{label[g]}</h2>
          <ul className="notif-list">
            {groups[g].map((n) => {
              const Icon = n.meta.icon;
              const urgent = n.severity === 'CRITICAL';
              return (
                <li key={n.id} className={`notif ${n.read ? '' : 'is-unread'} ${urgent ? 'is-urgent' : ''}`}>
                  <button type="button" className="notif-main" onClick={() => open(n)}>
                    <span className={`icon-chip ${urgent ? 'tone-danger' : n.meta.cat === 'people' ? 'tone-info' : n.meta.cat === 'help' ? 'tone-coral' : ''}`} aria-hidden="true"><Icon /></span>
                    <span className="stack grow" style={{ '--gap': '4px', minWidth: 0, textAlign: 'left' }}>
                      <span className="notif-title">{!n.read && <span className="sr-only">{t('New: ', 'নতুন: ', 'नई: ', 'Mới: ')}</span>}{urgent && <span className="sr-only">{t('Urgent: ', 'জরুরি: ', 'ज़रूरी: ', 'Khẩn: ')}</span>}{n.title}</span>
                      {n.body && <span className="text-muted">{n.body}</span>}
                      <span className="text-subtle row" style={{ '--gap': '8px' }}>
                        <time dateTime={n.createdAt} title={formatDate(n.createdAt, language, { dateStyle: 'full', timeStyle: 'short' })}>{formatRelative(n.createdAt, language)}</time>
                        {n.delivery === 'SKIPPED' && <span className="row" style={{ '--gap': '4px' }}><MailX size={14} aria-hidden="true" /> {t('Shown here only — email not set up', 'শুধু এখানে দেখানো — ইমেইল চালু নেই', 'केवल यहाँ — ईमेल चालू नहीं', 'Chỉ hiện ở đây — chưa cài email')}</span>}
                      </span>
                    </span>
                    {n.meta.to && <ChevronRight className="card-arrow" aria-hidden="true" />}
                  </button>
                  {!n.read && <IconButton icon={Check} size="sm" variant="quiet" label={t('Mark as read', 'পড়া হয়েছে', 'पढ़ा हुआ', 'Đánh dấu đã đọc')} onClick={() => markRead(n.id)} className="notif-read" />}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
