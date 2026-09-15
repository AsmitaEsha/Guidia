import React, { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, Search, Calendar, Users, MapPin, Star, BedDouble } from 'lucide-react';

const BK_BLUE = '#003580';
const BK_YELLOW = '#feba02';

export default function BookingSim({ onClose }) {
  const { t, showToast } = useApp();

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f5f5f5' }}>
      {/* Header */}
      <div style={{ background:BK_BLUE, padding:'16px 20px 40px', display:'flex', flexDirection:'column', color:'#fff', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <button onClick={onClose} style={{ padding:4, border:'none', background:'none', cursor:'pointer', color:'#fff' }}><ArrowLeft size={24} /></button>
          <p style={{ fontWeight:800, fontSize:20 }}>Booking.com</p>
          <div style={{ width:24 }} />
        </div>
        <p style={{ fontSize:24, fontWeight:800 }}>{t('Find your next stay','আপনার পরবর্তী গন্তব্য খুঁজুন')}</p>
        <p style={{ fontSize:15, marginTop:4 }}>{t('Search low prices on hotels, homes and much more...','হোটেল, বাড়ি এবং আরও অনেক কিছু খুঁজুন...')}</p>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 16px 20px', marginTop:'-24px' }}>
        {/* Search Box */}
        <div style={{ background:BK_YELLOW, padding:4, borderRadius:8, marginBottom:24 }}>
          <div style={{ background:'#fff', borderRadius:4, overflow:'hidden' }}>
            <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 12px', border:'none', borderBottom:'1px solid #e7e7e7', background:'#fff', cursor:'pointer', textAlign:'left' }}>
              <Search size={22} color="#444" />
              <span style={{ fontSize:16, color:'#444', fontWeight:500 }}>{t('Around current location','বর্তমান অবস্থানের আশেপাশে')}</span>
            </button>
            <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 12px', border:'none', borderBottom:'1px solid #e7e7e7', background:'#fff', cursor:'pointer', textAlign:'left' }}>
              <Calendar size={22} color="#444" />
              <span style={{ fontSize:16, color:'#444', fontWeight:500 }}>{t('Select dates','তারিখ নির্বাচন করুন')}</span>
            </button>
            <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 12px', border:'none', background:'#fff', cursor:'pointer', textAlign:'left' }}>
              <Users size={22} color="#444" />
              <span style={{ fontSize:16, color:'#444', fontWeight:500 }}>{t('1 room · 2 adults · 0 children','১ রুম · ২ প্রাপ্তবয়স্ক')}</span>
            </button>
          </div>
          <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ width:'100%', background:BK_BLUE, color:'#fff', padding:'14px', border:'none', borderRadius:4, fontWeight:700, fontSize:18, marginTop:4, cursor:'pointer' }}>
            {t('Search','খুঁজুন')}
          </button>
        </div>

        {/* Featured Properties */}
        <p style={{ fontWeight:700, fontSize:18, marginBottom:12, color:'#333' }}>{t('Explore nearby','আশেপাশে দেখুন')}</p>
        
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { name:'Grand Palace Hotel', rating:8.9, reviews:420, price:'$120', img:'🏨' },
            { name:'Ocean View Resort', rating:9.2, reviews:850, price:'$250', img:'🏖️' },
            { name:'City Center Inn', rating:7.5, reviews:120, price:'$60', img:'🏢' },
          ].map((hotel, i) => (
            <div key={i} style={{ background:'#fff', borderRadius:8, overflow:'hidden', display:'flex', border:'1px solid #e7e7e7' }}>
              <div style={{ width:120, background:'#eef2f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, flexShrink:0 }}>
                {hotel.img}
              </div>
              <div style={{ padding:12, flex:1 }}>
                <p style={{ fontWeight:700, fontSize:16, color:'#0071c2', marginBottom:4 }}>{hotel.name}</p>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <div style={{ background:BK_BLUE, color:'#fff', padding:'2px 6px', borderRadius:4, fontWeight:700, fontSize:12 }}>{hotel.rating}</div>
                  <span style={{ fontSize:12, color:'#666' }}>{hotel.reviews} {t('reviews','রিভিউ')}</span>
                </div>
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', mt:8 }}>
                  <div>
                    <p style={{ fontSize:12, color:'#666', textDecoration:'line-through' }}>${parseInt(hotel.price.substring(1)) + 40}</p>
                    <p style={{ fontWeight:800, fontSize:18, color:'#333' }}>{hotel.price}</p>
                  </div>
                  <button onClick={() => showToast(t('Practice mode','অনুশীলন'))} style={{ background:BK_BLUE, color:'#fff', padding:'6px 12px', border:'none', borderRadius:4, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                    {t('See prices','দাম দেখুন')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
