import React from 'react';
import { APP_LOGOS } from '../data/hardcoded';



function MessengerLogo({ size, radius }) {
  // Messenger uses gradient icon
  return (
    <div style={{ width:size, height:size, borderRadius:radius, background:'linear-gradient(45deg,#0099FF,#A033FF)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width={size*0.62} height={size*0.62} viewBox="0 0 48 48" fill="white">
        <path d="M24 2C11.85 2 2 11.27 2 22.6c0 6.37 3.17 12.05 8.15 15.81V46l7.38-4.05c1.97.54 4.06.84 6.47.84 12.15 0 22-9.27 22-20.6C46 11.27 36.15 2 24 2zm2.19 27.72l-5.59-5.96-10.92 5.96 12.02-12.76 5.72 5.96 10.78-5.96-12.01 12.76z"/>
      </svg>
    </div>
  );
}

function PractoLogo({ size, radius }) {
  return (
    <div style={{ width:size, height:size, borderRadius:radius, background:'#28328C', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
      <svg width={size*0.6} height={size*0.6} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    </div>
  );
}

export default function AppLogo({ app, size = 48, radius = 14, style = {} }) {
  const src = APP_LOGOS[app];

  // Custom inline SVG logos for apps without free Wikipedia SVGs
  if (app === 'messenger') return <MessengerLogo size={size} radius={radius}/>;
  if (app === 'practo')    return <PractoLogo    size={size} radius={radius}/>;

  if (src) {
    return (
      <div style={{ width:size, height:size, borderRadius:radius, background:'#fff', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', ...style }}>
        <img src={src} alt={app}
          style={{ width:'80%', height:'80%', objectFit:'contain' }}
          onError={e => { e.target.style.display='none'; }}
        />
      </div>
    );
  }
  return null;
}
