/**
 * Authentic brand-accurate button replicas for the UI Guide.
 * Each component renders the ACTUAL visual button as it appears in the real app.
 */
import React from 'react';

/* ─── Brand SVG Icons ─────────────────────────────────────────── */

const WASendSVG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const WAMicSVG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23" strokeWidth="2" stroke="white" fill="none"/>
    <line x1="8" y1="23" x2="16" y2="23" strokeWidth="2" stroke="white" fill="none"/>
  </svg>
);

const WAAttachSVG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);

const FBLikeSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    <path d="M21 10.5a1.5 1.5 0 0 0-1.5-1.5h-4.5V5a2 2 0 0 0-4 0v5.5L7 11v9h12.5a1.5 1.5 0 0 0 1.5-1.5V16a1.5 1.5 0 0 0-.5-1.1 1.5 1.5 0 0 0 .5-1.1v-1a1.5 1.5 0 0 0-.5-1.1 1.5 1.5 0 0 0 .5-1.1z"/>
  </svg>
);

const ShareArrowSVG = ({ color = 'white' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
    <polyline points="15 8 20 3 20 8"/>
    <path d="M10 3h10"/>
    <path d="M20 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>
  </svg>
);

const BkashSendSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
    <path d="M12 8l4 4-4 4M8 12h8" strokeLinecap="round"/>
  </svg>
);

const LockSVG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const StarSVG = ({ filled = true, color = '#F59E0B' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CartSVG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

/* ─── Authentic Button Replicas ──────────────────────────────── */

export const BUTTON_REPLICAS = {
  // WhatsApp
  'wa-send': (
    <div style={{ display:'flex', alignItems:'center', gap:0 }}>
      <div style={{ width:52, height:52, borderRadius:'50%', background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(37,211,102,0.4)' }}>
        <WASendSVG/>
      </div>
    </div>
  ),
  'wa-attach': (
    <div style={{ width:44, height:44, borderRadius:'50%', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <WAAttachSVG/>
    </div>
  ),
  'wa-mic': (
    <div style={{ width:52, height:52, borderRadius:'50%', background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(37,211,102,0.4)' }}>
      <WAMicSVG/>
    </div>
  ),
  'wa-call': (
    <div style={{ display:'flex', alignItems:'center', gap:4, background:'#25D366', borderRadius:8, padding:'8px 14px' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.01L6.6 10.8z"/></svg>
      <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Voice Call</span>
    </div>
  ),
  'wa-video': (
    <div style={{ display:'flex', alignItems:'center', gap:4, background:'#075E54', borderRadius:8, padding:'8px 14px' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="white"/></svg>
      <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Video Call</span>
    </div>
  ),
  'wa-block': (
    <div style={{ background:'#fee2e2', border:'1px solid #dc2626', borderRadius:8, padding:'8px 14px', display:'flex', alignItems:'center', gap:6 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
      <span style={{ color:'#dc2626', fontWeight:700, fontSize:14 }}>Block</span>
    </div>
  ),
  // Facebook
  'fb-like': (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:'#1877F2', borderRadius:20, padding:'8px 16px', boxShadow:'0 2px 8px rgba(24,119,242,0.35)' }}>
      <FBLikeSVG/>
      <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Like</span>
    </div>
  ),
  'fb-comment': (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f0f2f5', borderRadius:20, padding:'8px 16px', border:'1px solid #e4e6ea' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#65676B"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      <span style={{ color:'#65676B', fontWeight:700, fontSize:14 }}>Comment</span>
    </div>
  ),
  'fb-share': (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f0f2f5', borderRadius:20, padding:'8px 16px', border:'1px solid #e4e6ea' }}>
      <ShareArrowSVG color="#65676B"/>
      <span style={{ color:'#65676B', fontWeight:700, fontSize:14 }}>Share</span>
    </div>
  ),
  'fb-post': (
    <div style={{ background:'#1877F2', borderRadius:6, padding:'9px 20px' }}>
      <span style={{ color:'white', fontWeight:700, fontSize:15 }}>Post</span>
    </div>
  ),
  'fb-report': (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fff3f3', border:'1px solid #dc2626', borderRadius:8, padding:'8px 14px' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626"><path d="M4 5v14.5h2V13h12.5l-3-4 3-4H6V5H4z"/></svg>
      <span style={{ color:'#dc2626', fontWeight:700, fontSize:14 }}>Report</span>
    </div>
  ),
  'fb-settings': (
    <div style={{ display:'flex', flexDirection:'column', gap:3, padding:6 }}>
      {[0,1,2].map(i => <div key={i} style={{ width:20, height:3, background:'#1c1e21', borderRadius:2 }}/>)}
    </div>
  ),
  'fb-password': (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f0f2f5', borderRadius:8, padding:'10px 16px', border:'1px solid #ddd' }}>
      <LockSVG/>
      <span style={{ color:'#1c1e21', fontWeight:700, fontSize:14 }}>Security & Login</span>
    </div>
  ),
  // bKash
  'bkash-send': (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'#E2136E', borderRadius:16, padding:'14px 18px', boxShadow:'0 4px 12px rgba(226,19,110,0.35)', width:80 }}>
      <BkashSendSVG/>
      <span style={{ color:'white', fontWeight:800, fontSize:12, textAlign:'center' }}>Send Money</span>
    </div>
  ),
  'bkash-confirm': (
    <div style={{ background:'#E2136E', borderRadius:30, padding:'12px 28px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 12px rgba(226,19,110,0.35)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span style={{ color:'white', fontWeight:800, fontSize:15 }}>Confirm</span>
    </div>
  ),
  'bkash-pin': (
    <div style={{ background:'#fff', border:'2px solid #E2136E', borderRadius:12, padding:'12px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <div style={{ display:'flex', gap:10 }}>
        {[0,1,2,3,4].map(i => <div key={i} style={{ width:12, height:12, borderRadius:'50%', background:'#E2136E' }}/>)}
      </div>
      <span style={{ color:'#E2136E', fontWeight:700, fontSize:12 }}>Enter PIN</span>
    </div>
  ),
  'bkash-history': (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fce4ef', borderRadius:12, padding:'10px 16px' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E2136E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span style={{ color:'#E2136E', fontWeight:700, fontSize:14 }}>Statement</span>
    </div>
  ),
  // Gmail
  'gmail-compose': (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:'white', borderRadius:20, padding:'12px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', border:'1px solid #e0e0e0' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#EA4335"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
      <span style={{ color:'#444', fontWeight:700, fontSize:15 }}>Compose</span>
    </div>
  ),
  'gmail-reply': (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f1f3f4', borderRadius:8, padding:'8px 14px' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#5f6368"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
      <span style={{ color:'#5f6368', fontWeight:700, fontSize:14 }}>Reply</span>
    </div>
  ),
  'gmail-star': (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      <StarSVG filled={true}/>
      <span style={{ color:'#F59E0B', fontWeight:700, fontSize:14 }}>Starred</span>
    </div>
  ),
  'gmail-spam': (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fff3e0', borderRadius:8, padding:'8px 14px', border:'1px solid #f57c00' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#f57c00"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      <span style={{ color:'#f57c00', fontWeight:700, fontSize:14 }}>Report spam</span>
    </div>
  ),
  // Amazon
  'amazon-cart': (
    <div style={{ background:'#FF9900', borderRadius:8, padding:'10px 18px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 2px 6px rgba(255,153,0,0.4)' }}>
      <CartSVG/>
      <span style={{ color:'#111', fontWeight:800, fontSize:14 }}>Add to Cart</span>
    </div>
  ),
  'amazon-buy': (
    <div style={{ background:'#FFA41C', borderRadius:8, padding:'10px 18px', border:'1px solid #FF8C00', display:'flex', alignItems:'center', gap:8 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#111"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      <span style={{ color:'#111', fontWeight:800, fontSize:14 }}>Buy Now</span>
    </div>
  ),
  'amazon-stars': (
    <div style={{ display:'flex', gap:2, alignItems:'center' }}>
      {[1,2,3,4,5].map(i => <StarSVG key={i} filled={i<=4}/>)}
      <span style={{ color:'#007185', fontWeight:600, fontSize:13, marginLeft:4 }}>4.5 (1,247)</span>
    </div>
  ),
  'amazon-checkout': (
    <div style={{ background:'#FFD814', borderRadius:8, padding:'10px 24px', border:'1px solid #F0C14B', textAlign:'center' }}>
      <span style={{ color:'#111', fontWeight:800, fontSize:14 }}>Place your order</span>
    </div>
  ),
  // Booking.com
  'booking-search': (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:'#003580', borderRadius:8, padding:'10px 18px' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Search</span>
    </div>
  ),
  'booking-free': (
    <div style={{ background:'#008009', borderRadius:6, padding:'6px 12px' }}>
      <span style={{ color:'white', fontWeight:700, fontSize:13 }}>FREE cancellation</span>
    </div>
  ),
  'booking-reserve': (
    <div style={{ background:'#0071C2', borderRadius:8, padding:'10px 22px', boxShadow:'0 2px 8px rgba(0,113,194,0.4)' }}>
      <span style={{ color:'white', fontWeight:800, fontSize:14 }}>Reserve</span>
    </div>
  ),
};
