import React, { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { ChevronDown, ChevronUp, Volume2, ArrowLeft, Search } from 'lucide-react';
import { UI_GUIDES } from '../data/uiGuides';
import { BUTTON_REPLICAS } from '../data/buttonReplicas';

const SAFETY_STYLE = {
  safe:   { bg:'#dcfce7', border:'#16a34a', text:'#15803d', label:{en:'SAFE',bn:'নিরাপদ',hi:'सुरक्षित'} },
  action: { bg:'#dbeafe', border:'#2563eb', text:'#1d4ed8', label:{en:'ACTION',bn:'অ্যাকশন',hi:'कार्रवाई'} },
  warn:   { bg:'#ffedd5', border:'#ea580c', text:'#c2410c', label:{en:'CAUTION',bn:'সতর্কতা',hi:'सावधानी'} },
  danger: { bg:'#fee2e2', border:'#dc2626', text:'#b91c1c', label:{en:'DANGER',bn:'বিপদ',hi:'खतरा'} },
  info:   { bg:'#f3e8ff', border:'#7c3aed', text:'#6d28d9', label:{en:'INFO',bn:'তথ্য',hi:'जानकारी'} },
};

function ButtonCard({ btn, language, onSpeak }) {
  const [open, setOpen] = useState(false);
  const s = SAFETY_STYLE[btn.safety] || SAFETY_STYLE.info;
  const desc = btn.desc[language] || btn.desc.en;
  const name = btn.name[language] || btn.name.en;
  const replica = BUTTON_REPLICAS[btn.replicaKey];

  return (
    <div style={{ border:`2px solid ${open ? s.border : 'var(--border)'}`, borderRadius:'var(--r-sm)', overflow:'hidden', marginBottom:10, transition:'border-color 0.2s' }}>
      <button onClick={() => { setOpen(!open); if (!open) onSpeak(name + '. ' + desc); }}
        style={{ width:'100%', display:'flex', alignItems:'center', gap:16, padding:'14px 16px', background: open ? s.bg : 'var(--surface)', border:'none', cursor:'pointer', textAlign:'left' }}>

        {/* Actual button replica */}
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', minWidth:60 }}>
          {replica || (
            <div style={{ width:44, height:44, borderRadius:10, background:s.bg, border:`2px solid ${s.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:11, fontWeight:800, color:s.text }}>{(typeof s.label === 'string' ? s.label : s.label[language] || s.label.en)[0]}</span>
            </div>
          )}
        </div>

        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{name}</p>
          <span style={{ padding:'2px 9px', borderRadius:12, background:s.bg, color:s.text, fontSize:11, fontWeight:700, border:`1px solid ${s.border}` }}>
            {typeof s.label === 'string' ? s.label : s.label[language] || s.label.en}
          </span>
        </div>

        <button onClick={e => { e.stopPropagation(); onSpeak(desc); }}
          style={{ background:'var(--blue-light)', color:'var(--blue)', border:'none', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
          <Volume2 size={15}/>
        </button>
        {open ? <ChevronUp size={17} color="var(--text-3)"/> : <ChevronDown size={17} color="var(--text-3)"/>}
      </button>

      {open && (
        <div style={{ padding:'12px 16px 16px', background:s.bg, borderTop:`1px solid ${s.border}40` }}>
          <p style={{ fontSize:15, lineHeight:1.75, color:'var(--text-1)' }}>{desc}</p>
        </div>
      )}
    </div>
  );
}

function AppDetail({ guide, language, onBack, speak }) {
  const [activeSection, setActiveSection] = useState(0);
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div style={{ padding:'14px 18px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'var(--surface-2)', border:'none', borderRadius:'50%', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ArrowLeft size={18}/>
        </button>
        <img src={guide.logo} alt={guide.name}
          onError={e => e.target.style.display='none'}
          style={{ height:32, objectFit:'contain' }}/>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:800, fontSize:17 }}>{guide.name}</p>
          <p style={{ fontSize:13, color:'var(--text-3)' }}>
            {language==='bn' ? 'বাটন গাইড ও ব্যাখ্যা' : language==='hi' ? 'बटन गाइड और व्याख्या' : 'Button Guide & Explanations'}
          </p>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 18px' }}>
        {/* Screenshot */}
        <div style={{ borderRadius:'var(--r-sm)', overflow:'hidden', marginBottom:16, height:180, position:'relative', background:`${guide.color}18` }}>
          <img src={imgError ? '' : guide.screenshot} alt={guide.name + ' UI'}
            onError={() => setImgError(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${guide.brandColor}ee 0%, transparent 55%)` }}/>
          <div style={{ position:'absolute', bottom:12, left:14, color:'#fff' }}>
            <p style={{ fontWeight:900, fontSize:18 }}>{guide.name}</p>
            <p style={{ fontSize:12, opacity:0.8 }}>
              {language==='bn' ? 'অফিশিয়াল ইন্টারফেস' : language==='hi' ? 'आधिकारिक इंटरफ़ेस' : 'Official Interface'}
            </p>
          </div>
        </div>

        {/* Safety legend */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
          {Object.entries(SAFETY_STYLE).map(([k,v]) => (
            <span key={k} style={{ padding:'2px 9px', borderRadius:20, background:v.bg, color:v.text, fontSize:11, fontWeight:700, border:`1.5px solid ${v.border}` }}>
              {typeof v.label === 'string' ? v.label : v.label[language] || v.label.en}
            </span>
          ))}
        </div>

        {/* Section tabs */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', marginBottom:14, paddingBottom:2 }}>
          {guide.sections.map((sec, i) => (
            <button key={i} onClick={() => setActiveSection(i)}
              style={{ padding:'7px 14px', borderRadius:100, border:`2px solid ${activeSection===i ? guide.color : 'var(--border)'}`, background:activeSection===i ? guide.color+'18' : 'var(--surface)', color:activeSection===i ? guide.color : 'var(--text-2)', fontWeight:700, fontSize:13, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s' }}>
              {sec.title[language] || sec.title.en}
            </button>
          ))}
        </div>

        {/* Button cards */}
        {guide.sections[activeSection]?.buttons.map((btn, i) => (
          <ButtonCard key={i} btn={btn} language={language} onSpeak={speak}/>
        ))}
      </div>
    </div>
  );
}

export default function UIExplainer() {
  const { language, speak, t } = useApp();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  if (selected) {
    return <AppDetail guide={selected} language={language} onBack={() => setSelected(null)} speak={speak}/>;
  }

  const filtered = UI_GUIDES.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ overflowY:'auto', height:'100%' }}>
      {/* Header */}
      <div style={{ padding:'22px 20px 16px', background:'linear-gradient(135deg,var(--blue-light),var(--teal-light))', marginBottom:0 }}>
        <h1 style={{ fontWeight:900, fontSize:20, marginBottom:4, letterSpacing:'-0.02em' }}>
          {t('App UI Guide', 'অ্যাপ UI গাইড', 'ऐप UI गाइड')}
        </h1>
        <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:14 }}>
          {t('Select an app to see what every button does — in plain language.', 'যেকোনো অ্যাপ বেছে নিন এবং প্রতিটি বাটনের কাজ জানুন।', 'कोई ऐप चुनें और हर बटन का काम जानें।')}
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--surface)', borderRadius:100, padding:'9px 16px', boxShadow:'var(--sh-xs)' }}>
          <Search size={16} color="var(--text-3)"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('Search apps…', 'অ্যাপ খুঁজুন…', 'ऐप खोजें…')}
            style={{ border:'none', outline:'none', flex:1, fontSize:15, background:'transparent' }}/>
        </div>
      </div>

      {/* App Grid */}
      <div style={{ padding:'14px 18px 32px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
        {filtered.map(guide => (
          <button key={guide.id}
            onClick={() => { setSelected(guide); speak(t(`Opening ${guide.name} guide`, `${guide.name} গাইড খুলছি`, `${guide.name} गाइड खोल रहे हैं`)); }}
            style={{ border:`1.5px solid ${guide.color}30`, borderRadius:'var(--r-sm)', overflow:'hidden', cursor:'pointer', background:'var(--surface)', textAlign:'left', transition:'transform 0.15s, box-shadow 0.15s', boxShadow:'var(--sh-xs)' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--sh-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--sh-xs)'; }}>

            {/* Banner with real screenshot + logo */}
            <div style={{ height:100, position:'relative', background:`${guide.color}18`, overflow:'hidden' }}>
              <img src={guide.screenshot} alt={guide.name}
                onError={e => e.target.style.display='none'}
                style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              <div style={{ position:'absolute', inset:0, background:`linear-gradient(to right, ${guide.brandColor}cc, transparent)` }}/>
              <img src={guide.logo} alt={guide.name + ' logo'}
                onError={e => e.target.style.display='none'}
                style={{ position:'absolute', top:10, left:12, height:28, objectFit:'contain', filter:'brightness(0) invert(1)', opacity:0.95 }}/>
            </div>

            {/* Info */}
            <div style={{ padding:'12px 14px' }}>
              <p style={{ fontWeight:800, fontSize:16, color:guide.color, marginBottom:3 }}>{guide.name}</p>
              <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:8 }}>
                {guide.sections.reduce((a, s) => a + s.buttons.length, 0)} {t('buttons explained', 'টি বাটনের ব্যাখ্যা', 'बटन समझाए गए')}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {guide.sections.map((s, i) => (
                  <span key={i} style={{ padding:'2px 9px', borderRadius:100, background:`${guide.color}18`, color:guide.color, fontSize:11, fontWeight:700 }}>
                    {s.title[language] || s.title.en}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ padding:'9px 14px 12px', borderTop:'1px solid var(--border)', background:`${guide.color}08` }}>
              <p style={{ fontWeight:700, fontSize:13, color:guide.color }}>
                {t('Tap to explore', 'দেখতে চাপুন', 'देखने के लिए टैप करें')} →
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
