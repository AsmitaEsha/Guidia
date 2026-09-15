import React, { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, Search, Bell, MessageCircle, Home, Users, PlaySquare, Menu, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { FAKE_FACEBOOK_POSTS } from '../../data/hardcoded';

const FB_BLUE = '#1877F2';

export default function FacebookSim({ onClose }) {
  const { t, speak } = useApp();
  const [liked, setLiked]     = useState({});
  const [activeNav, setActiveNav] = useState('home');
  const [friendReqs] = useState([
    { id:'f1', name:'Kamal Hossain',  mutual:'3 mutual friends',  avatar:'👨' },
    { id:'f2', name:'Nasreen Akter',  mutual:'7 mutual friends',  avatar:'👩' },
  ]);

  const stories = [
    { name:t('Your Story','আপনার স্টোরি'), avatar:'➕', bg:'#e4e6eb' },
    { name:'Rupa',   avatar:'👩', bg:'#ffcccc' },
    { name:'Dr. Ahmed', avatar:'👨‍⚕️', bg:'#ccffdd' },
    { name:'Mosque', avatar:'🕌', bg:'#cce0ff' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#F0F2F5' }}>
      {/* Top Bar */}
      <div style={{ background:'#fff', padding:'10px 14px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid #CDD0D4', flexShrink:0 }}>
        <button onClick={onClose} style={{ padding:4 }}><ArrowLeft size={20} color="#606770"/></button>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:8 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill={FB_BLUE}><path d="M36 18C36 8.059 27.941 0 18 0S0 8.059 0 18c0 8.984 6.584 16.43 15.188 17.779V23.25H10.617V18h4.57v-3.967c0-4.512 2.687-7.004 6.797-7.004 1.968 0 4.028.351 4.028.351v4.43h-2.27c-2.235 0-2.93 1.386-2.93 2.808V18h4.988l-.797 5.25H20.81v12.529C29.416 34.43 36 26.984 36 18z"/></svg>
          <div style={{ flex:1, background:'#F0F2F5', borderRadius:20, padding:'8px 14px', display:'flex', alignItems:'center', gap:6 }}>
            <Search size={14} color="#606770"/>
            <span style={{ fontSize:15, color:'#606770' }}>{t('Search Facebook','Facebook খুঁজুন')}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'#E4E6EB', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <MessageCircle size={18} color="#1C1E21"/>
            <span style={{ position:'absolute', top:0, right:0, width:16, height:16, background:'#E41E3F', borderRadius:'50%', fontSize:10, color:'#fff', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>3</span>
          </div>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'#E4E6EB', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <Bell size={18} color="#1C1E21"/>
            <span style={{ position:'absolute', top:0, right:0, width:16, height:16, background:'#E41E3F', borderRadius:'50%', fontSize:10, color:'#fff', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>5</span>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{ background:'#fff', display:'flex', borderBottom:'1px solid #CDD0D4', flexShrink:0 }}>
        {[
          { id:'home', icon:<Home size={22}/> },
          { id:'friends', icon:<Users size={22}/> },
          { id:'video', icon:<PlaySquare size={22}/> },
          { id:'menu', icon:<Menu size={22}/> },
        ].map(n => (
          <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ flex:1, padding:'12px 0', display:'flex', justifyContent:'center', background:'none', border:'none', cursor:'pointer',
            borderBottom: activeNav===n.id ? `3px solid ${FB_BLUE}` : '3px solid transparent',
            color: activeNav===n.id ? FB_BLUE : '#606770' }}>
            {n.icon}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {/* Practice tip */}
        <div style={{ background:'#E7F3FF', padding:'8px 14px', fontSize:13, color:FB_BLUE, fontWeight:600 }}>
          💡 {t('Tap 👍 to like posts. Practice social media safely.','👍 চাপ দিয়ে পোস্ট লাইক করুন।')}
        </div>

        {/* Stories */}
        <div style={{ background:'#fff', padding:'12px 14px', marginBottom:8 }}>
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
            {stories.map((s,i) => (
              <div key={i} style={{ flexShrink:0, width:90, textAlign:'center', cursor:'pointer' }}>
                <div style={{ width:90, height:130, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, border: i>0 ?`3px solid ${FB_BLUE}`:'none', overflow:'hidden', position:'relative' }}>
                  {i===0 && <div style={{ position:'absolute', bottom:8, right:8, width:26, height:26, borderRadius:'50%', background:FB_BLUE, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:18, fontWeight:700, border:'2px solid #fff' }}>+</div>}
                  <span style={{ fontSize:36 }}>{s.avatar}</span>
                </div>
                <p style={{ fontSize:11, fontWeight:700, marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Post Composer */}
        <div style={{ background:'#fff', padding:'12px 14px', marginBottom:8, borderBottom:'1px solid #CDD0D4', borderTop:'1px solid #CDD0D4' }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'#5a8f7a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>👴</div>
            <div style={{ flex:1, background:'#F0F2F5', borderRadius:20, padding:'10px 16px', fontSize:15, color:'#65676B', cursor:'text' }}>
              {t("What's on your mind?","কী ভাবছেন?")}
            </div>
          </div>
          <div style={{ display:'flex', borderTop:'1px solid #CDD0D4', paddingTop:8, gap:0 }}>
            <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'6px 0', border:'none', background:'none', fontSize:13, fontWeight:600, color:'#65676B', cursor:'pointer' }}>📹 {t('Video','ভিডিও')}</button>
            <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'6px 0', border:'none', background:'none', fontSize:13, fontWeight:600, color:'#65676B', cursor:'pointer' }}>📷 {t('Photo','ছবি')}</button>
            <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'6px 0', border:'none', background:'none', fontSize:13, fontWeight:600, color:'#65676B', cursor:'pointer' }}>😊 {t('Feeling','অনুভূতি')}</button>
          </div>
        </div>

        {/* Feed Posts */}
        {FAKE_FACEBOOK_POSTS.map((p, i) => (
          <div key={p.id} style={{ background:'#fff', marginBottom:8 }}>
            {/* Post Header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px' }}>
              <div style={{ width:42, height:42, borderRadius:'50%', background:`hsl(${i*80},55%,60%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{p.avatar}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:15 }}>{p.author}</p>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <p style={{ fontSize:12, color:'#65676B' }}>{p.time}</p>
                  <span style={{ color:'#65676B', fontSize:12 }}>· 🌐</span>
                </div>
              </div>
              <span style={{ fontSize:20, color:'#65676B' }}>···</span>
            </div>
            {/* Post Text */}
            <p style={{ padding:'0 14px 12px', fontSize:16, lineHeight:1.5 }}>{p.text}</p>
            {/* Post Image */}
            {p.image && <div style={{ background:'linear-gradient(135deg,#ffd89b,#19547b)', height:200, display:'flex', alignItems:'center', justifyContent:'center', fontSize:60 }}>🌅</div>}
            {/* Reaction counts */}
            <div style={{ padding:'8px 14px', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #E4E6EB' }}>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ display:'flex', marginRight:4 }}>
                  {['👍','❤️','😂'].map((e,j) => <span key={j} style={{ width:20, height:20, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, marginLeft:j>0?-4:0, border:'1px solid #fff', zIndex:3-j }}>{e}</span>)}
                </div>
                <span style={{ fontSize:14, color:'#65676B' }}>{liked[p.id]?p.likes+1:p.likes}</span>
              </div>
              <span style={{ fontSize:14, color:'#65676B' }}>{p.comments} {t('comments','মন্তব্য')}</span>
            </div>
            {/* Action Buttons */}
            <div style={{ display:'flex', padding:'4px 8px' }}>
              <button onClick={() => { setLiked(v=>({...v,[p.id]:!v[p.id]})); speak(t('You liked this!','লাইক দিয়েছেন!')); }}
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', border:'none', background:'none', fontSize:14, fontWeight:700, color:liked[p.id]?FB_BLUE:'#65676B', cursor:'pointer' }}>
                <ThumbsUp size={18} fill={liked[p.id]?FB_BLUE:'none'} color={liked[p.id]?FB_BLUE:'#65676B'}/> {t('Like','লাইক')}
              </button>
              <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', border:'none', background:'none', fontSize:14, fontWeight:700, color:'#65676B', cursor:'pointer' }}>
                <MessageSquare size={18}/> {t('Comment','মন্তব্য')}
              </button>
              <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', border:'none', background:'none', fontSize:14, fontWeight:700, color:'#65676B', cursor:'pointer' }}>
                <Share2 size={18}/> {t('Share','শেয়ার')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
