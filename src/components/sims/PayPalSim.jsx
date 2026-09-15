import React, { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, Bell, Settings, Send, Download, Plus, ChevronRight } from 'lucide-react';

const PP_BLUE = '#003087';
const PP_LIGHT = '#0079C1';

export default function PayPalSim({ onClose }) {
  const { t, showToast } = useApp();

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f5f7fa' }}>
      {/* Header */}
      <div style={{ background:PP_BLUE, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', color:'#fff', flexShrink:0 }}>
        <button onClick={onClose} style={{ padding:4, border:'none', background:'none', cursor:'pointer', color:'#fff' }}><ArrowLeft size={24} /></button>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Bell size={22} />
          <Settings size={22} />
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 16px' }}>
        {/* Balance Card */}
        <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', marginBottom:20 }}>
          <p style={{ fontSize:15, color:'#4C5661', fontWeight:600 }}>{t('PayPal Balance','পেপ্যাল ব্যালেন্স')}</p>
          <p style={{ fontSize:36, fontWeight:800, color:'#001435', marginTop:8, marginBottom:16 }}>$150.00</p>
          
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:PP_LIGHT, color:'#fff', padding:'12px', borderRadius:24, fontWeight:700, fontSize:15, border:'none', cursor:'pointer' }}>
              <Download size={18} /> {t('Transfer','ট্রান্সফার')}
            </button>
            <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#F5F7FA', color:PP_BLUE, padding:'12px', borderRadius:24, fontWeight:700, fontSize:15, border:'none', cursor:'pointer' }}>
              <Plus size={18} /> {t('Add Money','অ্যাড মানি')}
            </button>
          </div>
        </div>

        {/* Send & Request */}
        <div style={{ background:'#fff', borderRadius:16, padding:16, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', marginBottom:20, display:'flex', gap:16 }}>
           <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8, border:'none', background:'none', cursor:'pointer' }}>
             <div style={{ width:56, height:56, borderRadius:'50%', background:'#EBF5FF', color:PP_LIGHT, display:'flex', alignItems:'center', justifyContent:'center' }}>
               <Send size={24} />
             </div>
             <p style={{ fontWeight:700, color:'#001435' }}>{t('Send','সেন্ড')}</p>
           </button>
           <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8, border:'none', background:'none', cursor:'pointer' }}>
             <div style={{ width:56, height:56, borderRadius:'50%', background:'#EBF5FF', color:PP_LIGHT, display:'flex', alignItems:'center', justifyContent:'center' }}>
               <Download size={24} style={{ transform:'rotate(180deg)' }} />
             </div>
             <p style={{ fontWeight:700, color:'#001435' }}>{t('Request','রিকোয়েস্ট')}</p>
           </button>
        </div>

        {/* Recent Activity */}
        <div style={{ background:'#fff', borderRadius:16, padding:'16px 0', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ padding:'0 20px 12px', borderBottom:'1px solid #E3E8EE', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ fontWeight:700, fontSize:16, color:'#001435' }}>{t('Recent Activity','সাম্প্রতিক লেনদেন')}</p>
            <button style={{ border:'none', background:'none', color:PP_LIGHT, fontWeight:600, fontSize:14, cursor:'pointer' }}>{t('See All','সব দেখুন')}</button>
          </div>
          
          {[
            { name:'Netflix', type:t('Automatic Payment','অটোমেটিক পেমেন্ট'), amount:'-$15.99', date:'Today' },
            { name:'John Doe', type:t('Money Sent','টাকা পাঠানো হয়েছে'), amount:'-$50.00', date:'Yesterday' },
            { name:'Upwork', type:t('Payment Received','পেমেন্ট এসেছে'), amount:'+$200.00', date:'3 days ago' }
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom: i<2 ? '1px solid #E3E8EE' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'#EBF5FF', display:'flex', alignItems:'center', justifyContent:'center', color:PP_LIGHT, fontWeight:700 }}>
                  {item.name[0]}
                </div>
                <div>
                  <p style={{ fontWeight:700, color:'#001435', fontSize:15 }}>{item.name}</p>
                  <p style={{ color:'#4C5661', fontSize:13 }}>{item.date} · {item.type}</p>
                </div>
              </div>
              <p style={{ fontWeight:600, fontSize:16, color: item.amount.startsWith('+') ? '#00704A' : '#001435' }}>{item.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
