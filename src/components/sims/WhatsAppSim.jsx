import React, { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, Phone, Video, Search, MoreVertical, Send, Smile, Paperclip, Camera, Mic } from 'lucide-react';
import { FAKE_CONTACTS, FAKE_WHATSAPP_MESSAGES } from '../../data/hardcoded';

const WA_GREEN      = '#25D366';
const WA_DARK       = '#075E54';
const WA_LIGHT_BG   = '#ECE5DD';
const WA_SENT       = '#DCF8C6';

export default function WhatsAppSim({ onClose }) {
  const { t, speak } = useApp();
  const [chat, setChat]   = useState(null);
  const [msgs, setMsgs]   = useState([]);
  const [input, setInput] = useState('');
  const [tab, setTab]     = useState('chats');

  const openChat = (c) => {
    setChat(c);
    setMsgs(FAKE_WHATSAPP_MESSAGES[c.id] || [
      { id:'m0', from:'them', text: t('Hello! How are you?','হ্যালো! কেমন আছেন?'), time:'10:00 AM' }
    ]);
    speak(t(`Chat opened with ${c.name}.`,`${c.name} এর সাথে চ্যাট।`));
  };

  const send = () => {
    if (!input.trim()) return;
    const m = { id:`u${Date.now()}`, from:'me', text:input, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) };
    setMsgs(p => [...p, m]);
    setInput('');
    speak(t('Message sent!','মেসেজ পাঠানো হয়েছে!'));
    setTimeout(() => setMsgs(p => [...p, { id:`r${Date.now()}`, from:'them', text:t('👍 Thanks!','👍 ধন্যবাদ!'), time:'Now' }]), 1600);
  };

  /* ── Chat View ── */
  if (chat) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:WA_LIGHT_BG }}>
      {/* Header */}
      <div style={{ background:WA_DARK, color:'#fff', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', flexShrink:0 }}>
        <button onClick={() => setChat(null)} style={{ color:'#fff', padding:4 }}><ArrowLeft size={22}/></button>
        <div style={{ width:40, height:40, borderRadius:'50%', background:'#5a8f7a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{chat.avatar}</div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700, fontSize:16, lineHeight:1.2 }}>{chat.name}</p>
          <p style={{ fontSize:12, opacity:0.8 }}>{chat.lastSeen}</p>
        </div>
        <Video size={20} style={{ opacity:0.9, marginRight:8 }}/>
        <Phone size={20} style={{ opacity:0.9, marginRight:8 }}/>
        <Search size={20} style={{ opacity:0.9 }}/>
      </div>
      {/* Practice Banner */}
      <div style={{ background:'#FFF9C4', padding:'6px 14px', textAlign:'center', fontSize:12, color:'#7a6600', fontWeight:600, flexShrink:0 }}>
        🔒 {t('Practice mode — messages are not real','অনুশীলন মোড — বার্তাগুলি আসল নয়')}
      </div>
      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 10px', display:'flex', flexDirection:'column', gap:4 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display:'flex', justifyContent:m.from==='me'?'flex-end':'flex-start' }}>
            <div style={{ background:m.from==='me'?WA_SENT:'#fff', borderRadius:m.from==='me'?'12px 12px 2px 12px':'12px 12px 12px 2px', padding:'7px 12px 4px', maxWidth:'72%', boxShadow:'0 1px 2px rgba(0,0,0,0.12)' }}>
              {m.sender && <p style={{ fontSize:12, fontWeight:700, color:'#128C7E', marginBottom:2 }}>{m.sender}</p>}
              <p style={{ fontSize:16, lineHeight:1.45 }}>{m.text}</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, marginTop:2 }}>
                <span style={{ fontSize:11, color:'#8e8e8e' }}>{m.time}</span>
                {m.from==='me' && <span style={{ fontSize:14, color:'#4FC3F7' }}>✓✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div style={{ background:'#F0F0F0', padding:'8px 10px', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <div style={{ flex:1, background:'#fff', borderRadius:24, display:'flex', alignItems:'center', paddingLeft:14, paddingRight:8, minHeight:44 }}>
          <Smile size={22} color="#888" style={{ flexShrink:0 }}/>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder={t('Type a message','মেসেজ লিখুন')}
            style={{ flex:1, border:'none', outline:'none', fontSize:16, padding:'0 10px', background:'transparent' }}/>
          <Paperclip size={20} color="#888" style={{ flexShrink:0, marginRight:6 }}/>
          <Camera size={20} color="#888" style={{ flexShrink:0 }}/>
        </div>
        <button onClick={send} style={{ width:46, height:46, borderRadius:'50%', background:WA_GREEN, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'none', cursor:'pointer' }}>
          {input.trim() ? <Send size={20} color="#fff"/> : <Mic size={20} color="#fff"/>}
        </button>
      </div>
    </div>
  );

  /* ── Chat List ── */
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      {/* Header */}
      <div style={{ background:WA_DARK, color:'#fff', padding:'14px 16px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={onClose} style={{ color:'#fff', padding:4 }}><ArrowLeft size={20}/></button>
            <p style={{ fontWeight:800, fontSize:20 }}>WhatsApp</p>
          </div>
          <div style={{ display:'flex', gap:18 }}>
            <Search size={20}/><MoreVertical size={20}/>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display:'flex', gap:0 }}>
          {['chats','status','calls'].map(s => (
            <button key={s} onClick={()=>setTab(s)}
              style={{ flex:1, padding:'10px 0', fontSize:13, fontWeight:700, color: tab===s?'#fff':'rgba(255,255,255,0.6)', borderBottom: tab===s?`3px solid ${WA_GREEN}`:'3px solid transparent', background:'none', border:'none', borderBottom: tab===s?`3px solid ${WA_GREEN}`:'3px solid transparent', cursor:'pointer', textTransform:'uppercase', letterSpacing:0.5 }}>
              {s === 'chats' ? t('Chats','চ্যাট') : s === 'status' ? t('Status','স্ট্যাটাস') : t('Calls','কল')}
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div style={{ background:'#E8F5E9', padding:'8px 14px', fontSize:13, color:'#2E7D32', fontWeight:600, flexShrink:0 }}>
        💡 {t('Tap any contact to practice sending a message.','যেকোনো পরিচিতিতে চাপ দিয়ে মেসেজ পাঠানো অনুশীলন করুন।')}
      </div>

      {/* Search bar */}
      <div style={{ padding:'8px 12px', background:'#F0F0F0', flexShrink:0 }}>
        <div style={{ background:'#fff', borderRadius:20, display:'flex', alignItems:'center', padding:'8px 14px', gap:8 }}>
          <Search size={16} color="#888"/><span style={{ color:'#888', fontSize:15 }}>{t('Search…','খুঁজুন…')}</span>
        </div>
      </div>

      {/* Contact list */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {FAKE_CONTACTS.map((c, i) => (
          <button key={c.id} onClick={() => openChat(c)} style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'12px 16px', borderBottom:'1px solid #F0F0F0', background:'#fff', textAlign:'left', cursor:'pointer', border:'none', borderBottom:'1px solid #F0F0F0' }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:`hsl(${i*60},55%,55%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{c.avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <p style={{ fontWeight:700, fontSize:17 }}>{c.name}</p>
                <p style={{ fontSize:12, color: i===0?WA_GREEN:'#8e8e8e' }}>{i===0?'Now':'Yesterday'}</p>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:2 }}>
                <p style={{ fontSize:14, color:'#8e8e8e', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:220 }}>
                  {i===0?t('Tap to start chatting…','চ্যাট শুরু করতে চাপ দিন…'):t('Last message…','শেষ বার্তা…')}
                </p>
                {i===0 && <span style={{ background:WA_GREEN, color:'#fff', borderRadius:'50%', width:20, height:20, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>3</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FAB */}
      <button style={{ position:'absolute', bottom:80, right:20, width:56, height:56, borderRadius:'50%', background:WA_GREEN, border:'none', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(37,211,102,0.4)', cursor:'pointer', zIndex:10 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      </button>
    </div>
  );
}
