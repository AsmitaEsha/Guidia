import React, { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, Search, User, Video, Pill, FileText, ChevronRight, MapPin } from 'lucide-react';

const PR_BLUE = '#28328C';
const PR_CYAN = '#14BEF0';

export default function PractoSim({ onClose }) {
  const { t, showToast } = useApp();

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f8f9fa' }}>
      {/* Header */}
      <div style={{ background:'#fff', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, borderBottom:'1px solid #eee' }}>
        <button onClick={onClose} style={{ padding:4, border:'none', background:'none', cursor:'pointer', color:'#333' }}><ArrowLeft size={24} /></button>
        <p style={{ fontWeight:800, fontSize:22, color:PR_BLUE, letterSpacing:-0.5 }}>practo</p>
        <User size={24} color="#333" />
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 16px' }}>
        
        {/* Location & Search */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, color:'#666' }}>
          <MapPin size={18} />
          <span style={{ fontSize:14, fontWeight:600 }}>{t('Dhaka, Bangladesh','ঢাকা, বাংলাদেশ')}</span>
        </div>

        <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, display:'flex', alignItems:'center', padding:'12px 16px', gap:12, marginBottom:24, boxShadow:'0 2px 4px rgba(0,0,0,0.05)' }}>
          <Search size={20} color="#888" />
          <span style={{ color:'#888', fontSize:15 }}>{t('Search doctors, clinics, hospitals...','ডাক্তার, ক্লিনিক খুঁজুন...')}</span>
        </div>

        {/* Main Services Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
           <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:12, padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:12, cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
             <div style={{ width:56, height:56, borderRadius:'50%', background:'#E6F6FE', display:'flex', alignItems:'center', justifyContent:'center', color:PR_CYAN }}>
               <User size={28} />
             </div>
             <div style={{ textAlign:'center' }}>
               <p style={{ fontWeight:700, color:'#333', fontSize:15 }}>{t('Find Doctors','ডাক্তার খুঁজুন')}</p>
               <p style={{ fontSize:12, color:'#888', marginTop:4 }}>{t('Book appointment','অ্যাপয়েন্টমেন্ট নিন')}</p>
             </div>
           </button>

           <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:12, padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:12, cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
             <div style={{ width:56, height:56, borderRadius:'50%', background:'#E6F6FE', display:'flex', alignItems:'center', justifyContent:'center', color:PR_CYAN }}>
               <Video size={28} />
             </div>
             <div style={{ textAlign:'center' }}>
               <p style={{ fontWeight:700, color:'#333', fontSize:15 }}>{t('Video Consult','ভিডিও কল')}</p>
               <p style={{ fontSize:12, color:'#888', marginTop:4 }}>{t('Talk within 15m','১৫ মিনিটে কথা বলুন')}</p>
             </div>
           </button>
        </div>

        {/* Secondary Services */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
           <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
             <Pill size={24} color={PR_CYAN} />
             <span style={{ fontWeight:600, color:'#333', fontSize:14 }}>{t('Medicines','ওষুধ')}</span>
           </button>
           <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
             <FileText size={24} color={PR_CYAN} />
             <span style={{ fontWeight:600, color:'#333', fontSize:14 }}>{t('Lab Tests','ল্যাব টেস্ট')}</span>
           </button>
        </div>

        {/* Common Symptoms */}
        <p style={{ fontWeight:700, fontSize:18, marginBottom:16, color:'#333' }}>{t('Consult top doctors by specialty','বিশেষজ্ঞ ডাক্তার দেখান')}</p>
        <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:8 }}>
           {[
             { name: t('Fever','জ্বর'), icon: '' },
             { name: t('Heart','হার্ট'), icon: '' },
             { name: t('Diabetes','ডায়াবেটিস'), icon: '' },
             { name: t('Eye','চোখ'), icon: '' },
           ].map((item, i) => (
             <button key={i} onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ minWidth:100, background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:12, cursor:'pointer' }}>
               <div style={{ fontSize:32 }}>{item.icon}</div>
               <p style={{ fontSize:13, fontWeight:600, color:'#333' }}>{item.name}</p>
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}
