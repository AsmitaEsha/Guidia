import React, { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, Search, Scan, Smartphone, Banknote, UserPlus, CreditCard, History, QrCode } from 'lucide-react';

const GP_BLUE = '#1A73E8';
const GP_BG = '#F8F9FA';

export default function GPaySim({ onClose }) {
  const { t, showToast } = useApp();

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:GP_BG }}>
      {/* Header */}
      <div style={{ background:'#fff', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <button onClick={onClose} style={{ padding:4, border:'none', background:'none', cursor:'pointer' }}><ArrowLeft size={22} color="#5F6368"/></button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Scan size={24} color="#5F6368" />
          <div style={{ width:34, height:34, borderRadius:'50%', background:GP_BLUE, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>K</div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 20px' }}>
        {/* Banner */}
        <div style={{ position:'relative', borderRadius:16, overflow:'hidden', height:180, marginBottom:20, background:'linear-gradient(135deg, #1A73E8, #8AB4F8)' }}>
           <div style={{ position:'absolute', top:20, left:20, color:'#fff' }}>
              <p style={{ fontWeight:800, fontSize:22 }}>GPay</p>
              <p style={{ fontSize:16, marginTop:8, maxWidth:200 }}>{t('Pay anyone, everywhere.','যে কাউকে, সব জায়গায় পে করুন।')}</p>
           </div>
        </div>

        {/* Transfer Methods Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:24 }}>
           {[
             { icon:<QrCode size={24} color={GP_BLUE}/>, label:t('Scan QR','স্ক্যান QR') },
             { icon:<Smartphone size={24} color={GP_BLUE}/>, label:t('Pay Contacts','কন্টাক্ট পে') },
             { icon:<Phone size={24} color={GP_BLUE}/>, label:t('Pay Phone','ফোন নম্বর') },
             { icon:<Banknote size={24} color={GP_BLUE}/>, label:t('Bank Transfer','ব্যাংক ট্রান্সফার') },
             { icon:<UserPlus size={24} color={GP_BLUE}/>, label:t('Pay UPI ID','UPI আইডি') },
             { icon:<CreditCard size={24} color={GP_BLUE}/>, label:t('Self Transfer','নিজস্ব ট্রান্সফার') },
             { icon:<History size={24} color={GP_BLUE}/>, label:t('Pay Bills','বিল পে') },
             { icon:<Smartphone size={24} color={GP_BLUE}/>, label:t('Mobile Recharge','রিচার্জ') },
           ].map((item, i) => (
             <button key={i} onClick={() => showToast(t('Practice mode only','শুধুমাত্র অনুশীলন মোড'))} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, border:'none', background:'none', cursor:'pointer' }}>
               <div style={{ width:52, height:52, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
                 {item.icon}
               </div>
               <p style={{ fontSize:12, fontWeight:600, textAlign:'center', color:'#3C4043', lineHeight:1.2 }}>{item.label}</p>
             </button>
           ))}
        </div>

        {/* People */}
        <p style={{ fontWeight:700, fontSize:18, marginBottom:16, color:'#202124' }}>{t('People','মানুষ')}</p>
        <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:10 }}>
           {['Rupa', 'Karim', 'Dr. Ahmed', 'Shop'].map((name, i) => (
             <button key={i} onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, border:'none', background:'none', cursor:'pointer' }}>
               <div style={{ width:56, height:56, borderRadius:'50%', background:`hsl(${i*80},70%,50%)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:24, fontWeight:700 }}>
                 {name[0]}
               </div>
               <p style={{ fontSize:13, fontWeight:600, color:'#3C4043' }}>{name}</p>
             </button>
           ))}
        </div>

        {/* History / Check Balance */}
        <div style={{ marginTop:24, background:'#fff', borderRadius:16, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.1)' }}>
           <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ display:'flex', alignItems:'center', gap:16, width:'100%', padding:'12px 0', border:'none', borderBottom:'1px solid #F1F3F4', background:'none', cursor:'pointer', textAlign:'left' }}>
             <History size={24} color={GP_BLUE} />
             <p style={{ fontWeight:600, fontSize:15, color:'#3C4043' }}>{t('Show transaction history','লেনদেনের ইতিহাস দেখুন')}</p>
           </button>
           <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ display:'flex', alignItems:'center', gap:16, width:'100%', padding:'12px 0', border:'none', background:'none', cursor:'pointer', textAlign:'left' }}>
             <Banknote size={24} color={GP_BLUE} />
             <p style={{ fontWeight:600, fontSize:15, color:'#3C4043' }}>{t('Check bank balance','ব্যাংক ব্যালেন্স চেক করুন')}</p>
           </button>
        </div>
      </div>
    </div>
  );
}

// Temporary Phone icon since it wasn't imported directly at top
function Phone(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
}
