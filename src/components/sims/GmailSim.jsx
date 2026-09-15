import React, { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, Search, Edit, Star, AlertTriangle, Inbox, Send as SendIcon, Trash2, ChevronRight } from 'lucide-react';
import { FAKE_GMAIL_INBOX } from '../../data/hardcoded';

const GM_RED = '#EA4335';

const AVATARS = { 'Brac Bank':'B', 'Rupa Ahmed':'R', 'LOTTERY PRIZE !!!':'!' };
const AVATAR_COLORS = { 'Brac Bank':'#1A73E8', 'Rupa Ahmed':'#D93025', 'LOTTERY PRIZE !!!':'#E37400' };

export default function GmailSim({ onClose }) {
  const { t, speak } = useApp();
  const [open, setOpen] = useState(null);
  const [navTab, setNavTab] = useState('primary');
  const [starred, setStarred] = useState({});

  /* ── Email Detail ── */
  if (open) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      <div style={{ background:'#fff', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid #E8EAED', flexShrink:0 }}>
        <button onClick={()=>setOpen(null)} style={{ padding:4 }}><ArrowLeft size={22} color="#5F6368"/></button>
        <p style={{ flex:1, fontWeight:700, fontSize:18 }}>{open.subject}</p>
        <Star size={20} color={starred[open.id]?'#F4B400':'#5F6368'} fill={starred[open.id]?'#F4B400':'none'}
          style={{ cursor:'pointer' }} onClick={()=>setStarred(v=>({...v,[open.id]:!v[open.id]}))}/>
        <Trash2 size={20} color="#5F6368"/>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:20 }}>
        {!open.safe && (
          <div style={{ background:'#FCE8E6', border:'1px solid #F28B82', borderRadius:8, padding:'12px 16px', marginBottom:16, display:'flex', gap:10 }}>
            <AlertTriangle size={20} color={GM_RED} style={{ flexShrink:0, marginTop:2 }}/>
            <div>
              <p style={{ fontWeight:800, color:GM_RED, marginBottom:4, fontSize:15 }}> {t('Suspicious email detected!','সন্দেহজনক ইমেইল শনাক্ত!')}</p>
              <p style={{ fontSize:14, color:'#c62828' }}>{t('This looks like a scam. Do NOT click any links or share personal info.','এটি প্রতারণামূলক মনে হচ্ছে। কোনো লিংকে ক্লিক করবেন না।')}</p>
            </div>
          </div>
        )}
        <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:20 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:AVATAR_COLORS[open.from]||'#1A73E8', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:18, flexShrink:0 }}>
            {AVATARS[open.from]||open.from[0]}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:700, fontSize:16 }}>{open.from}</p>
            <p style={{ fontSize:13, color:'#5F6368' }}>{t('to me','আমাকে')} · {open.time}</p>
          </div>
        </div>
        <p style={{ fontSize:16, lineHeight:1.8, color:'#202124' }}>{open.body}</p>
        {!open.safe && (
          <div style={{ background:'#FFF8E1', border:'1px solid #FDD835', borderRadius:8, padding:'12px 16px', marginTop:20 }}>
            <p style={{ fontWeight:700, color:'#E65100', marginBottom:4 }}> {t('Guidia Safety Tip','Guidia নিরাপত্তা টিপ')}</p>
            <p style={{ fontSize:14, color:'#BF360C' }}>{t('Real prizes never ask for money upfront. This is a scam. Delete this email.','আসল পুরস্কারে কখনো আগে টাকা পাঠাতে হয় না। এটি প্রতারণা। এই ইমেইল মুছুন।')}</p>
          </div>
        )}
        {open.safe && (
          <div style={{ marginTop:24, display:'flex', gap:12, flexWrap:'wrap' }}>
            <button style={{ padding:'10px 24px', border:'1px solid #DADCE0', borderRadius:4, fontSize:14, fontWeight:600, color:'#3C4043', cursor:'pointer', display:'flex', alignItems:'center', gap:6, background:'#fff' }}>
              ↩ {t('Reply','রিপ্লাই')}
            </button>
            <button style={{ padding:'10px 24px', border:'1px solid #DADCE0', borderRadius:4, fontSize:14, fontWeight:600, color:'#3C4043', cursor:'pointer', background:'#fff' }}>
              ↪ {t('Forward','ফরোয়ার্ড')}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /* ── Inbox ── */
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      {/* Top Search Bar (Gmail style) */}
      <div style={{ background:'#fff', padding:'10px 14px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'#F1F3F4', borderRadius:24, padding:'10px 16px' }}>
          <button onClick={onClose} style={{ padding:2 }}><ArrowLeft size={20} color="#5F6368"/></button>
          <Search size={18} color="#5F6368"/>
          <span style={{ flex:1, fontSize:16, color:'#5F6368' }}>{t('Search in mail','মেইলে খুঁজুন')}</span>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'#4285F4', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:15 }}>K</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #E8EAED', background:'#fff', flexShrink:0, overflowX:'auto' }}>
        {['primary','social','promotions'].map(tab => (
          <button key={tab} onClick={()=>setNavTab(tab)}
            style={{ padding:'12px 20px', fontSize:13, fontWeight:700, whiteSpace:'nowrap', cursor:'pointer', border:'none', background:'none',
              borderBottom: navTab===tab?`2px solid #1A73E8`:'2px solid transparent',
              color: navTab===tab?'#1A73E8':'#444746' }}>
            {tab==='primary' ? t('Primary','প্রাইমারি') : tab==='social' ? t('Social','সোশ্যাল') : t('Promotions','প্রমোশন')}
          </button>
        ))}
      </div>

      {/* Tip */}
      <div style={{ background:'#E8F0FE', padding:'8px 16px', fontSize:13, color:'#1967D2', fontWeight:600, flexShrink:0 }}>
         {t('Can you find the scam email? It has a icon!','প্রতারণামূলক ইমেইলটি খুঁজুন! এতে আইকন আছে।')}
      </div>

      {/* Email List */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {FAKE_GMAIL_INBOX.map((e,i) => (
          <button key={e.id} onClick={() => { setOpen(e); speak(e.safe ? t('Opening safe email.','নিরাপদ ইমেইল খোলা হচ্ছে।') : t('Warning! Suspicious email.','সতর্কতা! সন্দেহজনক ইমেইল।')); }}
            style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'12px 16px', background:e.read?'#fff':'#E8F0FE', borderBottom:'1px solid #E8EAED', cursor:'pointer', border:'none', borderBottom:'1px solid #E8EAED', textAlign:'left' }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:e.safe?AVATAR_COLORS[e.from]||'#1A73E8':'#E37400', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:17, flexShrink:0 }}>
              {e.safe ? (AVATARS[e.from]||e.from[0]) : ''}
            </div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <p style={{ fontWeight: e.read?500:700, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>{e.from}</p>
                <p style={{ fontSize:12, color:'#5F6368', flexShrink:0 }}>{e.time}</p>
              </div>
              <p style={{ fontWeight: e.read?400:600, fontSize:14, color:'#202124', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.subject}</p>
              <p style={{ fontSize:13, color:'#5F6368', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.body?.slice(0,60)}…</p>
            </div>
            <Star size={16} color={starred[e.id]?'#F4B400':'#BDC1C6'} fill={starred[e.id]?'#F4B400':'none'} style={{ flexShrink:0 }}
              onClick={ev=>{ev.stopPropagation();setStarred(v=>({...v,[e.id]:!v[e.id]}));}}/>
          </button>
        ))}
      </div>

      {/* FAB Compose */}
      <button style={{ position:'absolute', bottom:80, right:16, background:'#fff', border:'1px solid #DADCE0', borderRadius:16, padding:'12px 20px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 2px 10px rgba(0,0,0,0.15)', cursor:'pointer', zIndex:10, fontSize:15, fontWeight:700, color:'#3C4043' }}>
        <Edit size={20} color={GM_RED}/> {t('Compose','কম্পোজ')}
      </button>
    </div>
  );
}
