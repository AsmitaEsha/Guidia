import { useApp } from '../context/AppStateContext';
import { Bell, Shield, BookOpen, AlertTriangle, Info } from 'lucide-react';

const TYPE_ICONS = { guardian:<Shield size={20}/>, lesson:<BookOpen size={20}/>, scam:<AlertTriangle size={20}/>, reminder:<Info size={20}/> };
const TYPE_COLORS = { guardian:'var(--blue)', lesson:'var(--success)', scam:'var(--danger)', reminder:'var(--teal)' };

export default function Notifications() {
  const { notifications, markNotifRead, speak, t } = useApp();

  return (
    <div className="page-scroll">
      <div style={{ padding:'28px 24px 16px' }}>
        <div className="flex items-center gap-14 anim-up">
          <div className="icon-wrap iw-md ic-blue"><Bell size={24}/></div>
          <div>
            <h1 className="t-title">{t('Notifications','নোটিফিকেশন')}</h1>
            <p className="t-sub">{notifications.filter(n=>!n.read).length} {t('unread','অপঠিত')}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'8px 24px 40px', display:'flex', flexDirection:'column', gap:10 }}>
        {notifications.length === 0 && (
          <div className="card text-center" style={{ padding:40 }}>
            <p className="t-body">{t('No notifications yet. They will appear here as you use Guidia.','এখনো কোনো নোটিফিকেশন নেই। Guidia ব্যবহারের সাথে সাথে এখানে দেখাবে।')}</p>
          </div>
        )}
        {notifications.map((n, i) => {
          const col = TYPE_COLORS[n.type] || 'var(--blue)';
          return (
            <button key={n.id} className={`card anim-up d${i+1}`} onClick={() => { markNotifRead(n.id); speak(n.msg); }}
              style={{ padding:18, borderLeft:`4px solid ${col}`, background: n.read ? 'var(--surface)' : 'var(--blue-light)', textAlign:'left' }}>
              <div className="flex items-start gap-14">
                <div className="icon-wrap iw-sm" style={{ background:`${col}20`, color:col, borderRadius:10, flexShrink:0 }}>
                  {TYPE_ICONS[n.type] || <Bell size={18}/>}
                </div>
                <div style={{ flex:1 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom:4 }}>
                    <p style={{ fontWeight: n.read?600:800, fontSize:16 }}>{n.title}</p>
                    {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', background:col }}/>}
                  </div>
                  <p className="t-sub" style={{ fontSize:15, marginBottom:4 }}>{n.msg}</p>
                  <p className="t-tiny">{n.time}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
