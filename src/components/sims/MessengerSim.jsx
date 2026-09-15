import React, { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, Phone, Video, Info, Send, Smile, Image, Mic, ThumbsUp } from 'lucide-react';

export default function MessengerSim({ onClose }) {
  const { t, speak } = useApp();
  const [chat, setChat] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [calling, setCalling] = useState(false);

  const CONTACTS = [
    { id:'c1', name:t('Rupa (Daughter)','রুপা (মেয়ে)'), avatar:'', color:'#0084FF', active:true, preview:t('Tap to chat!','চ্যাট শুরু করুন!') },
    { id:'c2', name:t('Karim Jr (Son)','করিম জুনিয়র (ছেলে)'), avatar:'', color:'#44BCD8', active:false, preview:t('Seen yesterday','গতকাল দেখেছে') },
    { id:'c3', name:t('Mosque Group','মসজিদ গ্রুপ'), avatar:'', color:'#9B59B6', active:false, preview:t('Meeting at 5pm','বিকেল ৫টায় বৈঠক') },
  ];

  const openChat = (c) => {
    setChat(c);
    setMsgs([
      { id:'m0', from:'them', text:t('Hello Abba! How are you feeling today? ','হ্যালো আব্বা! আজ কেমন আছেন? '), time:'10:00 AM' },
      { id:'m1', from:'me', text:t('I am doing well, alhamdulillah! ','ভালো আছি, আলহামদুলিল্লাহ! '), time:'10:02 AM' },
    ]);
    speak(t(`Chat with ${c.name} opened.`,`${c.name} এর সাথে চ্যাট খোলা হয়েছে।`));
  };

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p=>[...p,{id:`u${Date.now()}`,from:'me',text:input,time:'Now'}]);
    setInput('');
    speak(t('Message sent on Messenger!','Messenger-এ মেসেজ পাঠানো হয়েছে!'));
    setTimeout(()=>setMsgs(p=>[...p,{id:`r${Date.now()}`,from:'them',text:t(' Seen!',' দেখেছি!'),time:'Now'}]),1800);
  };

  const startCall = () => {
    setCalling(true);
    speak(t('Starting video call…','ভিডিও কল শুরু হচ্ছে…'));
    setTimeout(()=>{
      setCalling(false);
      setMsgs(p=>[...p,{id:`c${Date.now()}`,from:'system',text:t(' Video call · 2m 14s',' ভিডিও কল · ২ মিনিট ১৪ সেকেন্ড'),time:'Now'}]);
      speak(t('Call ended. Great job!','কল শেষ হয়েছে!'));
    },3500);
  };

  /* ─ Calling Screen ─ */
  if (calling) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', background:'#1C1C1C', color:'#fff', gap:24, padding:32 }}>
      <div style={{ fontSize:80 }} className="anim-pulse">{chat?.avatar||''}</div>
      <p style={{ fontWeight:800, fontSize:24 }}>{chat?.name}</p>
      <p style={{ color:'rgba(255,255,255,0.7)', fontSize:16 }}>{t('Calling…','কল হচ্ছে…')}</p>
      <div className="spinner" style={{ borderTopColor:'#0084FF', borderColor:'rgba(255,255,255,0.2)', width:40, height:40, borderWidth:4 }}/>
      <button onClick={()=>{setCalling(false);speak(t('Call ended.','কল শেষ।'));}} style={{ width:60, height:60, borderRadius:'50%', background:'#E53935', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginTop:20 }}>
        <Phone size={28} color="#fff" style={{ transform:'rotate(135deg)' }}/>
      </button>
    </div>
  );

  /* ─ Chat View ─ */
  if (chat) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E4E6EB', padding:'10px 14px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <button onClick={()=>setChat(null)} style={{ padding:4 }}><ArrowLeft size={22} color="#0084FF"/></button>
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:chat.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{chat.avatar}</div>
          {chat.active && <div style={{ position:'absolute', bottom:1, right:1, width:12, height:12, borderRadius:'50%', background:'#44B700', border:'2px solid #fff' }}/>}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700, fontSize:16 }}>{chat.name}</p>
          <p style={{ fontSize:12, color:chat.active?'#44B700':'#65676B' }}>{chat.active?t('Active now','এখন অনলাইন'):t('Active yesterday','গতকাল সক্রিয়')}</p>
        </div>
        <button onClick={startCall} style={{ padding:8, borderRadius:'50%', background:'#F0F2F5', border:'none', cursor:'pointer' }}><Phone size={20} color="#0084FF"/></button>
        <button onClick={startCall} style={{ padding:8, borderRadius:'50%', background:'#F0F2F5', border:'none', cursor:'pointer' }}><Video size={20} color="#0084FF"/></button>
        <button style={{ padding:8, borderRadius:'50%', background:'#F0F2F5', border:'none', cursor:'pointer' }}><Info size={20} color="#0084FF"/></button>
      </div>
      {/* Practice tip */}
      <div style={{ background:'#E8F4FE', padding:'6px 14px', fontSize:12, color:'#0057AD', fontWeight:600, flexShrink:0 }}>
         {t('Practice mode — safe simulation','অনুশীলন মোড — নিরাপদ সিমুলেশন')}
      </div>
      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display:'flex', justifyContent:m.from==='me'?'flex-end':m.from==='system'?'center':'flex-start', alignItems:'flex-end', gap:8 }}>
            {m.from==='them' && <div style={{ width:28, height:28, borderRadius:'50%', background:chat.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{chat.avatar}</div>}
            {m.from==='system'
              ? <p style={{ fontSize:12, color:'#8E8E8E', background:'#F0F2F5', padding:'6px 12px', borderRadius:12 }}>{m.text}</p>
              : <div style={{ background:m.from==='me'?'linear-gradient(135deg,#0084FF,#0066CC)':'#F0F2F5', color:m.from==='me'?'#fff':'#000', borderRadius:m.from==='me'?'18px 18px 4px 18px':'18px 18px 18px 4px', padding:'10px 14px', maxWidth:'72%', boxShadow:'0 1px 2px rgba(0,0,0,0.08)' }}>
                  <p style={{ fontSize:16, lineHeight:1.4 }}>{m.text}</p>
                  <p style={{ fontSize:10, opacity:0.65, marginTop:4, textAlign:'right' }}>{m.time}</p>
                </div>
            }
          </div>
        ))}
      </div>
      {/* Input */}
      <div style={{ padding:'8px 10px', background:'#fff', borderTop:'1px solid #E4E6EB', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <button style={{ padding:8, borderRadius:'50%', background:'#F0F2F5', border:'none', cursor:'pointer' }}><Image size={20} color="#0084FF"/></button>
        <div style={{ flex:1, background:'#F0F2F5', borderRadius:22, display:'flex', alignItems:'center', padding:'8px 14px', gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="Aa" style={{ flex:1, border:'none', outline:'none', fontSize:16, background:'transparent' }}/>
          <Smile size={20} color="#0084FF"/>
        </div>
        {input.trim()
          ? <button onClick={send} style={{ padding:10, borderRadius:'50%', background:'#0084FF', border:'none', cursor:'pointer', display:'flex' }}><Send size={18} color="#fff"/></button>
          : <>
              <button style={{ padding:8, borderRadius:'50%', background:'#F0F2F5', border:'none', cursor:'pointer' }}><Mic size={20} color="#0084FF"/></button>
              <button onClick={()=>{setMsgs(p=>[...p,{id:`l${Date.now()}`,from:'me',text:'',time:'Now'}]);speak(t('Thumbs up sent!','থাম্বস আপ পাঠানো হয়েছে!'));}} style={{ padding:8, borderRadius:'50%', background:'#F0F2F5', border:'none', cursor:'pointer' }}><ThumbsUp size={20} color="#0084FF"/></button>
            </>
        }
      </div>
    </div>
  );

  /* ─ Chat List ─ */
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      {/* Top Bar */}
      <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={onClose} style={{ padding:4 }}><ArrowLeft size={22} color="#0084FF"/></button>
          <p style={{ fontWeight:900, fontSize:24, background:'linear-gradient(90deg,#0084FF,#A033FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Chats</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'#F0F2F5', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0084FF"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </div>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'#F0F2F5', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0084FF"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div style={{ background:'#EEF3FF', padding:'8px 16px', fontSize:13, color:'#0057AD', fontWeight:600, flexShrink:0 }}>
         {t('Tap a contact to practice chatting or video calling.','পরিচিতিতে চাপ দিয়ে চ্যাট বা ভিডিও কল অনুশীলন করুন।')}
      </div>

      {/* Active Now */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid #F0F2F5', flexShrink:0 }}>
        <p style={{ fontSize:14, color:'#65676B', fontWeight:600, marginBottom:10 }}>{t('Active Now','এখন অনলাইন')}</p>
        <div style={{ display:'flex', gap:16, overflowX:'auto' }}>
          {CONTACTS.filter(c=>c.active).map(c => (
            <button key={c.id} onClick={()=>openChat(c)} style={{ textAlign:'center', background:'none', border:'none', cursor:'pointer', flexShrink:0 }}>
              <div style={{ position:'relative', display:'inline-block' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{c.avatar}</div>
                <div style={{ position:'absolute', bottom:2, right:2, width:14, height:14, borderRadius:'50%', background:'#44B700', border:'2px solid #fff' }}/>
              </div>
              <p style={{ fontSize:12, marginTop:4, fontWeight:600, maxWidth:60, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name.split(' ')[0]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {CONTACTS.map((c,i) => (
          <button key={c.id} onClick={()=>openChat(c)} style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'12px 16px', borderBottom:'1px solid #F0F2F5', background:'#fff', textAlign:'left', border:'none', borderBottom:'1px solid #F0F2F5', cursor:'pointer' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:54, height:54, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{c.avatar}</div>
              {c.active && <div style={{ position:'absolute', bottom:2, right:2, width:14, height:14, borderRadius:'50%', background:'#44B700', border:'2px solid #fff' }}/>}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, fontSize:16 }}>{c.name}</p>
              <p style={{ fontSize:13, color:'#65676B', marginTop:2 }}>{c.preview}</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
              <p style={{ fontSize:12, color:'#65676B' }}>{i===0?t('Now','এখন'):'Yesterday'}</p>
              {i===0 && <div style={{ width:10, height:10, borderRadius:'50%', background:'#0084FF' }}/>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
