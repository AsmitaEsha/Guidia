import React, { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, Search, ShoppingCart, Menu, Home, User, Star } from 'lucide-react';

const AMZ_DARK = '#232f3e';
const AMZ_ORANGE = '#f3a847';

export default function AmazonSim({ onClose }) {
  const { t, showToast } = useApp();

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#eaeded' }}>
      {/* Header */}
      <div style={{ background:AMZ_DARK, padding:'12px 16px', display:'flex', flexDirection:'column', gap:12, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', color:'#fff' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button onClick={onClose} style={{ padding:4, border:'none', background:'none', cursor:'pointer', color:'#fff' }}><ArrowLeft size={24} /></button>
            <p style={{ fontWeight:800, fontSize:22, fontFamily:'serif' }}>amazon</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ position:'relative' }}>
              <ShoppingCart size={24} />
              <span style={{ position:'absolute', top:-8, right:-8, color:AMZ_ORANGE, fontWeight:800, fontSize:14 }}>2</span>
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div style={{ display:'flex', alignItems:'center', background:'#fff', borderRadius:4, overflow:'hidden', paddingRight:8 }}>
          <input type="text" placeholder={t('Search Amazon','আমাজনে খুঁজুন')} style={{ flex:1, padding:'10px 12px', border:'none', outline:'none', fontSize:16 }} />
          <div style={{ background:'#fed813', padding:6, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }} onClick={() => showToast(t('Practice mode','অনুশীলন'))}>
             <Search size={20} color="#333" />
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        
        {/* Delivery location */}
        <div style={{ background:'#37475a', color:'#fff', padding:'10px 16px', display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
          <span style={{ opacity:0.8 }}>{t('Deliver to Abdul - Dhaka 1200','আব্দুলের কাছে ডেলিভারি - ঢাকা ১২০০')}</span>
        </div>

        {/* Categories */}
        <div style={{ display:'flex', overflowX:'auto', background:'#fff', padding:'12px 16px', gap:20, marginBottom:8 }}>
          {['Electronics', 'Fashion', 'Home', 'Groceries', 'Mobiles'].map((cat, i) => (
            <button key={i} onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', minWidth:60 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'#f2f2f2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                 {i===0?'💻':i===1?'👗':i===2?'🏠':i===3?'🍎':'📱'}
              </div>
              <span style={{ fontSize:12, color:'#333' }}>{t(cat, cat)}</span>
            </button>
          ))}
        </div>

        {/* Deal of the Day */}
        <div style={{ background:'#fff', padding:'16px', marginBottom:8 }}>
          <p style={{ fontSize:20, fontWeight:400, color:'#0f1111', marginBottom:16 }}>{t('Deal of the Day','আজকের ডিল')}</p>
          <div style={{ position:'relative' }}>
             <div style={{ width:'100%', height:200, background:'#e7f3ff', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:80 }}>📱</div>
             <div style={{ background:'#cc0c39', color:'#fff', padding:'6px 10px', borderRadius:2, position:'absolute', bottom:10, left:10, fontSize:13, fontWeight:700 }}>{t('Up to 40% off','৪০% পর্যন্ত ছাড়')}</div>
          </div>
          <p style={{ marginTop:12, fontSize:15, color:'#0f1111' }}>{t('Smartphones & Accessories','স্মার্টফোন এবং অ্যাকসেসরিজ')}</p>
        </div>

        {/* Product listing */}
        <div style={{ background:'#fff', padding:'16px' }}>
          <p style={{ fontSize:20, fontWeight:400, color:'#0f1111', marginBottom:16 }}>{t('Recommended for you','আপনার জন্য প্রস্তাবিত')}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { name:'Samsung Galaxy M34', price:'$250', rating:4.2, reviews:8420, img:'📱' },
              { name:'Digital Blood Pressure Monitor', price:'$45', rating:4.5, reviews:3210, img:'⚕️' },
            ].map((prod, i) => (
              <div key={i} style={{ display:'flex', gap:16 }}>
                 <div style={{ width:100, height:100, background:'#f2f2f2', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>{prod.img}</div>
                 <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, color:'#0f1111', lineHeight:1.3 }}>{prod.name}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4, marginBottom:4 }}>
                      <Star size={14} fill="#ffa41c" color="#ffa41c" />
                      <Star size={14} fill="#ffa41c" color="#ffa41c" />
                      <Star size={14} fill="#ffa41c" color="#ffa41c" />
                      <Star size={14} fill="#ffa41c" color="#ffa41c" />
                      <span style={{ fontSize:12, color:'#007185' }}>{prod.reviews}</span>
                    </div>
                    <p style={{ fontSize:20, fontWeight:400, color:'#0f1111' }}>{prod.price}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
