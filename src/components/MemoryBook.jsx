import { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { PlayCircle, Star, BookMarked, MessageSquare, ShieldCheck, CreditCard, BookOpen, Smartphone } from 'lucide-react';
import GuidiaLoadingState from './ui/GuidiaLoadingState';

const CAT_COLORS = { messaging:'var(--blue)', safety:'var(--sage)', banking:'#e2136e', learning:'var(--teal)', social:'var(--blue)' };

const CAT_ICON_MAP = {
  messaging: <MessageSquare size={22}/>,
  safety:    <ShieldCheck size={22}/>,
  banking:   <CreditCard size={22}/>,
  learning:  <BookOpen size={22}/>,
  social:    <Smartphone size={22}/>,
};

const CAT_LABELS = {
  en: { all:'All', messaging:'Messaging', safety:'Safety', banking:'Banking', learning:'Learning', social:'Social' },
  bn: { all:'সব', messaging:'মেসেজিং', safety:'নিরাপত্তা', banking:'ব্যাংকিং', learning:'শিক্ষা', social:'সোশ্যাল' },
  hi: { all:'सभी', messaging:'मैसेजिंग', safety:'सुरक्षा', banking:'बैंकिंग', learning:'शिक्षा', social:'सोशल' },
};

export default function MemoryBook() {
  const { memoryEntries, memoryLoading, speak, t, language } = useApp();
  const [filter, setFilter] = useState('all');

  const labels = CAT_LABELS[language] || CAT_LABELS.en;
  const categories = ['all','messaging','safety','banking','learning'];
  const filtered = filter === 'all' ? memoryEntries : memoryEntries.filter(m => m.category === filter);

  if (memoryLoading) {
    return <GuidiaLoadingState/>;
  }

  return (
    <div className="page-scroll">
      <div style={{ padding:'28px 24px 16px' }}>
        <div className="flex items-center gap-14 anim-up">
          <div className="icon-wrap iw-md ic-blue"><BookMarked size={24}/></div>
          <div>
            <h1 className="t-title">{t('My Memory Book','আমার স্মৃতির বই','मेरी स्मृति पुस्तक')}</h1>
            <p className="t-sub">{t('Replay your saved lessons anytime.','যেকোনো সময় সংরক্ষিত পাঠ পুনরায় দেখুন।','कभी भी अपने सहेजे पाठ दोबारा देखें।')}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'8px 24px' }}>
        <div className="segment anim-up d1" style={{ overflowX:'auto' }}>
          {categories.map(c => (
            <button key={c} className={`seg-btn ${filter===c?'active':''}`} onClick={() => setFilter(c)}>
              {labels[c] || c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 24px 32px', display:'flex', flexDirection:'column', gap:14 }}>
        {filtered.length === 0 && (
          <div className="card text-center" style={{ padding:40 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <BookMarked size={28} color="var(--text-3)"/>
            </div>
            <p className="t-body">{t('No memories yet. Complete a lesson to save it here!','এখনো কোনো স্মৃতি নেই। এখানে সংরক্ষণ করতে একটি পাঠ সম্পন্ন করুন!','अभी तक कोई स्मृति नहीं। यहाँ सहेजने के लिए कोई पाठ पूरा करें!')}</p>
          </div>
        )}

        {filtered.map((entry, i) => {
          const col = CAT_COLORS[entry.category] || 'var(--blue)';
          const catIcon = CAT_ICON_MAP[entry.category] || <BookOpen size={22}/>;
          return (
            <div key={entry.id} className={`card anim-up d${i+1}`} style={{ padding:18, borderLeft:`3px solid ${col}` }}>
              <div className="flex items-start gap-14">
                <div style={{ width:48, height:48, borderRadius:12, background:`${col}18`, color:col, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {catIcon}
                </div>
                <div style={{ flex:1 }}>
                  <div className="flex items-center gap-8" style={{ marginBottom:4 }}>
                    <p style={{ fontWeight:700, fontSize:16 }}>{entry.title}</p>
                    {entry.starred && <Star size={14} fill="var(--peach)" color="var(--peach)"/>}
                  </div>
                  <p className="t-tiny" style={{ marginBottom:6 }}>{entry.date} · {labels[entry.category] || entry.category}</p>
                  <p className="t-sub" style={{ fontSize:14, lineHeight:1.6 }}>{entry.summary}</p>
                </div>
              </div>
              <div style={{ marginTop:12, display:'flex', gap:10 }}>
                <button className="btn btn-sm btn-ghost flex items-center gap-6" onClick={() => speak(`${entry.title}. ${entry.summary}`)}>
                  <PlayCircle size={16}/> {t('Replay','পুনরায় শুনুন','दोबारा सुनें')}
                </button>
                {entry.starred && (
                  <span className="badge badge-sage"><Star size={12}/> {t('Starred','তারাচিহ্নিত','स्टार किया')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
