import { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import GuidiaSafetyPanel from '../GuidiaSafetyPanel';
import {
  ArrowLeft,
  Barcode,
  Bell,
  BatteryFull,
  Clapperboard,
  CreditCard,
  Droplets,
  Eye,
  FileText,
  Gift,
  Globe2,
  History,
  Landmark,
  Lightbulb,
  LogIn,
  Newspaper,
  PiggyBank,
  Plane,
  Power,
  QrCode,
  Receipt,
  ScanLine,
  Search,
  Send,
  ShieldCheck,
  Signal,
  Smartphone,
  Store,
  Ticket,
  UserCircle,
  Wallet,
  Wifi,
} from 'lucide-react';

const MOMO = '#A50064';
const MOMO_DARK = '#7D004C';
const MOMO_LIGHT = '#FFF0F8';

const ACTIONS = [
  { icon:<QrCode size={24}/>, label:'Scan QR', step:'pay', tone:'#A50064', desc:'Scan a shop QR code. Always check the shop name and amount before paying.' },
  { icon:<Send size={24}/>, label:'Transfer', step:'pay', tone:'#E91E80', desc:'Send money to another MoMo wallet. Confirm the phone number twice.' },
  { icon:<Smartphone size={24}/>, label:'Top Up', step:'topup', tone:'#F59E0B', desc:'Add mobile phone credit. Check the phone number and carrier first.' },
  { icon:<Receipt size={24}/>, label:'Pay Bills', step:'bill', tone:'#2563EB', desc:'Pay electricity, water, internet, or service bills from a real bill notice.' },
  { icon:<CreditCard size={24}/>, label:'Bank Link', step:'bank', tone:'#16A34A', desc:'Manage linked bank cards. Only link your own trusted bank account.' },
  { icon:<Store size={24}/>, label:'Services', step:'services', tone:'#7C3AED', desc:'Browse MoMo services and mini apps. Read fees before using a service.' },
  { icon:<Gift size={24}/>, label:'Offers', step:'offers', tone:'#DB2777', desc:'View promotions. Do not join offers that ask for OTP or password.' },
  { icon:<History size={24}/>, label:'History', step:'history', tone:'#475569', desc:'Review past transactions and report anything you do not recognize.' },
];

const HISTORY_ITEMS = [
  { label:'Highlands Coffee', detail:'QR payment', amount:'- 65,000 VND', color:'#DC2626' },
  { label:'Top up mobile', detail:'Viettel 090****321', amount:'- 50,000 VND', color:'#DC2626' },
  { label:'Received from Linh', detail:'Family transfer', amount:'+ 200,000 VND', color:'#16A34A' },
];

const QUICK_ACTIONS = [
  { icon:<LogIn size={24}/>, label:'TOP UP', desc:'Add money to your MoMo wallet before paying.' },
  { icon:<Wallet size={24}/>, label:'WITHDRAW', desc:'Withdraw wallet money only at trusted places.' },
  { icon:<Barcode size={24}/>, label:'PAYMENT\nOFFLINE CODE', desc:'Show a payment code only to the shop cashier.' },
  { icon:<ScanLine size={24}/>, label:'SCAN CODE', step:'pay', desc:'Scan a QR code. Check the shop and amount before confirming.' },
];

const SERVICE_ROWS = [
  [
    { icon:<Send size={23}/>, label:'Money\nTransfer', tone:'#EF4B69', step:'pay' },
    { icon:<UserCircle size={23}/>, label:'Money\nRequest', tone:'#44C4A1' },
    { icon:<Smartphone size={23}/>, label:'Prepaid top-\nup', tone:'#35BBD4' },
    { icon:<CreditCard size={23}/>, label:'Mua ma the', tone:'#E75066' },
  ],
  [
    { icon:<Landmark size={23}/>, label:'Loan\nPayment', tone:'#F7A62B' },
    { icon:<Signal size={23}/>, label:'Data Top-up', tone:'#329ADF' },
    { icon:<PiggyBank size={23}/>, label:'MoMo Piggy\nBank', tone:'#F2B029' },
    { icon:<Receipt size={23}/>, label:'Bill Payment', tone:'#24B89F' },
  ],
  [
    { icon:<Ticket size={23}/>, label:'Vietlott\nLottery', tone:'#BB1D21' },
    { icon:<Clapperboard size={23}/>, label:'Cinema', tone:'#F3A849' },
    { icon:<Plane size={23}/>, label:'Travel', tone:'#49B9D9' },
    { icon:<Newspaper size={23}/>, label:'Nhu Chua He\nCo Cuoc C...', tone:'#EC4560', badge:'New' },
  ],
  [
    { icon:<Lightbulb size={23}/>, label:'Electricity', tone:'#D85757' },
    { icon:<Droplets size={23}/>, label:'Water', tone:'#2FA9DD' },
    { icon:<Globe2 size={23}/>, label:'Internet', tone:'#2CBF9A' },
    { icon:<Smartphone size={23}/>, label:'Postpaid', tone:'#42B7A1' },
  ],
];

const BOTTOM_TABS = [
  { icon:<Wallet size={19}/>, label:'MOMO', active:true },
  { icon:<Gift size={19}/>, label:'PROMO', badge:'11' },
  { icon:<History size={19}/>, label:'LICH SU GD', step:'history' },
  { icon:<FileText size={19}/>, label:'BAN BE' },
  { icon:<UserCircle size={19}/>, label:'VI CUA TOI' },
];

export default function MoMoSim({ onClose }) {
  const { t, speak, showToast } = useApp();
  const [screen, setScreen] = useState('home');
  const [recipient, setRecipient] = useState('090 123 4567');
  const [amount, setAmount] = useState('65000');
  const [showSafetyPanel, setShowSafetyPanel] = useState(false);

  const explainAction = (action) => {
    speak(`${action.label}. ${action.desc}`);
    if (action.step === 'pay') {
      setScreen('pay');
      return;
    }
    if (action.step === 'history') {
      setScreen('history');
      return;
    }
    showToast(`${action.label}: practice mode only`, 'info');
  };

  const explainMoMoFeature = (item) => {
    const normalizedLabel = item.label.replace(/\n/g, ' ');
    speak(`${normalizedLabel}. Practice mode only. Always check receiver, amount, and any fee before using this feature.`);
    if (item.step === 'pay') {
      setScreen('pay');
      return;
    }
    if (item.step === 'history') {
      setScreen('history');
      return;
    }
    showToast(`${normalizedLabel}: practice mode only`, 'info');
  };

  if (screen === 'pay') {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
        <div style={{ background:MOMO, color:'#fff', padding:'16px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <button onClick={() => setScreen('home')} style={{ color:'#fff' }} aria-label="Back to MoMo home"><ArrowLeft size={22}/></button>
          <p style={{ fontWeight:900, fontSize:18 }}>{t('MoMo Payment', 'MoMo Payment')}</p>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:MOMO_LIGHT, border:`1px solid ${MOMO}33`, color:MOMO_DARK, borderRadius:12, padding:14, fontWeight:800, fontSize:14 }}>
            {t('Training only: no real money moves here.', 'Training only: no real money moves here.')}
          </div>
          <label style={{ display:'block' }}>
            <span style={{ display:'block', fontWeight:800, marginBottom:8 }}>{t('Shop or Phone Number', 'Shop or Phone Number')}</span>
            <input className="input-field" value={recipient} onChange={(event) => setRecipient(event.target.value)} />
          </label>
          <label style={{ display:'block' }}>
            <span style={{ display:'block', fontWeight:800, marginBottom:8 }}>{t('Amount (VND)', 'Amount (VND)')}</span>
            <input className="input-field" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} style={{ fontSize:28, fontWeight:900, color:MOMO }} />
          </label>
          <section style={{ border:'1px solid #eee', borderRadius:14, padding:16, background:'#fafafa' }}>
            <p style={{ fontWeight:900, marginBottom:10 }}>{t('Before paying', 'Before paying')}</p>
            <div style={{ display:'grid', gap:10 }}>
              {[
                'Check the receiver name',
                'Check the amount',
                'Never share OTP or password',
              ].map((item) => (
                <div key={item} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, fontWeight:700, color:'#374151' }}>
                  <ShieldCheck size={18} color="#16A34A" />
                  {item}
                </div>
              ))}
            </div>
          </section>
          <button
            onClick={() => recipient && amount && setShowSafetyPanel(true)}
            disabled={!recipient || !amount}
            style={{ marginTop:'auto', minHeight:58, borderRadius:999, background:recipient && amount ? MOMO : '#ccc', color:'#fff', fontSize:19, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
          >
            <Wallet size={22}/> {t('Review Payment', 'Review Payment')}
          </button>
        </div>
        <GuidiaSafetyPanel
          open={showSafetyPanel}
          actionType="momo_payment"
          title={t('Review before you pay', 'Review before you pay')}
          what={t('MoMo wallet payment', 'MoMo wallet payment')}
          who={recipient}
          amountOrData={`${Number(amount || 0).toLocaleString()} VND`}
          consequence={t('After confirming in a real app, money leaves your wallet and may not be reversible.', 'After confirming in a real app, money leaves your wallet and may not be reversible.')}
          onProceed={() => {
            setShowSafetyPanel(false);
            showToast('Practice payment completed safely.', 'success');
            speak('Practice payment completed safely.');
            setScreen('home');
          }}
          onEdit={() => setShowSafetyPanel(false)}
          onRequestHelp={() => {
            setShowSafetyPanel(false);
            showToast('Good choice. Ask a trusted person before paying if unsure.', 'info');
          }}
        />
      </div>
    );
  }

  if (screen === 'history') {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#F7F7F7' }}>
        <div style={{ background:'#fff', padding:'16px 20px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid #eee' }}>
          <button onClick={() => setScreen('home')} aria-label="Back to MoMo home"><ArrowLeft size={22}/></button>
          <p style={{ fontWeight:900, fontSize:18 }}>{t('Transaction History', 'Transaction History')}</p>
        </div>
        <div style={{ padding:18, display:'grid', gap:12 }}>
          {HISTORY_ITEMS.map((item) => (
            <div key={item.label} style={{ background:'#fff', borderRadius:14, padding:16, display:'grid', gridTemplateColumns:'44px 1fr auto', alignItems:'center', gap:12, boxShadow:'0 1px 5px rgba(0,0,0,0.06)' }}>
              <div style={{ width:44, height:44, borderRadius:14, background:MOMO_LIGHT, color:MOMO, display:'flex', alignItems:'center', justifyContent:'center' }}><Receipt size={22}/></div>
              <div>
                <strong style={{ display:'block', fontSize:15 }}>{item.label}</strong>
                <span style={{ display:'block', marginTop:3, color:'#64748B', fontSize:13 }}>{item.detail}</span>
              </div>
              <strong style={{ color:item.color, whiteSpace:'nowrap' }}>{item.amount}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:'100%', minHeight:0, background:'#F3F4F4', color:'#4B4F56', position:'relative', overflow:'hidden', fontFamily:'Arial, Helvetica, sans-serif' }}>
      <div style={{ height:'100%', overflowY:'auto', paddingBottom:60 }}>
        <div style={{ background:'#294F36', color:'#fff', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(31,68,48,0.98) 0%,rgba(44,84,57,0.88) 42%,rgba(73,100,42,0.84) 100%)' }} />
          <div style={{ position:'absolute', left:54, top:-72, width:244, height:178, borderRadius:'54% 46% 58% 42%', transform:'rotate(-14deg)', background:'radial-gradient(circle at 18% 52%, rgba(255,255,255,0.18) 0 1px, transparent 2px), linear-gradient(115deg,rgba(128,166,64,0.94),rgba(70,106,44,0.92) 54%,rgba(36,78,45,0.84))', boxShadow:'inset 22px -12px 36px rgba(21,60,32,0.4)' }} />
          <div style={{ position:'absolute', left:104, top:-58, width:2, height:216, transform:'rotate(62deg)', background:'rgba(218,236,150,0.3)' }} />
          <div style={{ position:'absolute', left:6, top:68, width:210, height:118, background:'radial-gradient(ellipse at center, rgba(72,101,31,0.55), transparent 68%)' }} />
          <div style={{ position:'relative', zIndex:1, padding:'3px 8px 2px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, fontWeight:700, lineHeight:1 }}>
            <button onClick={onClose} aria-label="Close MoMo practice" style={{ display:'flex', alignItems:'center', gap:5, color:'#fff', fontSize:12, fontWeight:700 }}>
              <ArrowLeft size={14}/>
              <Signal size={13}/>
              Viettel
              <Wifi size={13}/>
            </button>
            <div style={{ fontSize:13, fontWeight:800 }}>15:17</div>
            <BatteryFull size={20}/>
          </div>

          <div style={{ position:'relative', zIndex:1, padding:'8px 10px 15px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 36px 36px', alignItems:'center', gap:9 }}>
              <button onClick={() => showToast('Search is practice mode only.', 'info')} style={{ height:36, borderRadius:4, background:'rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.74)', display:'flex', alignItems:'center', gap:8, padding:'0 12px', fontSize:16, fontWeight:600, textAlign:'left', boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
                <Search size={19}/>
                Search
              </button>
              <button onClick={() => showToast('Notifications are practice mode only.', 'info')} aria-label="MoMo notifications" style={{ height:35, position:'relative', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Bell size={23}/>
                <div style={{ position:'absolute', top:-2, right:1, minWidth:20, height:20, padding:'0 4px', borderRadius:999, background:'#E83358', color:'#fff', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>60</div>
              </button>
              <button onClick={() => showToast('Power button is disabled in practice mode.', 'info')} aria-label="Power" style={{ height:35, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Power size={26}/>
              </button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:13, marginTop:13 }}>
              {QUICK_ACTIONS.map((action) => (
                <button key={action.label} onClick={() => explainMoMoFeature(action)} style={{ minHeight:84, color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', gap:8, textAlign:'center' }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:'#fff', color:'#4E5A43', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.28)' }}>
                    {action.icon}
                  </div>
                  <div style={{ minHeight:29, whiteSpace:'pre-line', fontSize:12, lineHeight:1.13, fontWeight:900, letterSpacing:0 }}>{action.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => showToast('Balance hidden. Never show your wallet balance to strangers.', 'info')} style={{ width:'100%', background:'#fff', minHeight:57, borderBottom:'1px solid #E3E4E6', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', padding:'0 13px', color:'#8A8A8A', textAlign:'left' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:16 }}>
            <div style={{ width:20, height:20, borderRadius:999, border:'1px solid #CED3D6', display:'flex', alignItems:'center', justifyContent:'center', color:'#B8BEC2' }}><Eye size={14}/></div>
            Wallet Balance
          </div>
          <div style={{ color:'#4B4F56', fontSize:31, lineHeight:1, fontWeight:300, letterSpacing:0 }}>231.624 VND</div>
        </button>

        <div style={{ background:'#fff', display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid #ECEEF0', borderLeft:'1px solid #ECEEF0' }}>
          {SERVICE_ROWS.slice(0, 3).flat().map((item) => (
            <button key={item.label} onClick={() => explainMoMoFeature(item)} style={{ minHeight:95, borderRight:'1px solid #ECEEF0', borderBottom:'1px solid #ECEEF0', background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:7, position:'relative', textAlign:'center', color:'#5E5E5E', padding:'7px 4px' }}>
              <div style={{ width:32, height:32, borderRadius:7, color:item.tone, background:`${item.tone}14`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {item.icon}
              </div>
              {item.badge && (
                <div style={{ position:'absolute', top:14, right:9, background:'#FF314F', color:'#fff', borderRadius:999, padding:'2px 6px', fontSize:10, lineHeight:1, fontWeight:900 }}>{item.badge}</div>
              )}
              <div style={{ whiteSpace:'pre-line', fontSize:16, lineHeight:1.08, fontWeight:500, letterSpacing:0 }}>{item.label}</div>
            </button>
          ))}
        </div>

        <button onClick={() => explainAction(ACTIONS.find((action) => action.step === 'offers'))} style={{ width:'100%', padding:'11px 16px', background:'#fff', position:'relative', overflow:'hidden' }}>
          <div aria-hidden="true" style={{ position:'absolute', left:-22, top:17, width:28, height:80, borderRadius:7, background:'#980056' }} />
          <div aria-hidden="true" style={{ position:'absolute', right:-22, top:17, width:28, height:80, borderRadius:7, background:'#980056' }} />
          <div style={{ minHeight:91, borderRadius:8, overflow:'hidden', background:'linear-gradient(90deg,#9D005E 0%,#B50069 18%,#F13475 48%,#FCB521 100%)', color:'#fff', display:'grid', gridTemplateColumns:'78px 1fr', alignItems:'center', boxShadow:'0 1px 5px rgba(0,0,0,0.18)' }}>
            <div style={{ alignSelf:'stretch', background:'#8B0055', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:20, lineHeight:0.85 }}>
              <div>mo</div>
              <div>mo</div>
              <div style={{ marginTop:7, fontSize:13 }}>Jingle Deal</div>
            </div>
            <div style={{ padding:'8px 10px', textAlign:'left', position:'relative', minWidth:0, overflow:'hidden' }}>
              <div style={{ fontSize:14, fontWeight:900, letterSpacing:0 }}>KHUYEN MAI MOBIPHONE</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:7, color:'#FFE32E', textShadow:'0 2px 0 rgba(135,0,75,0.35)' }}>
                <strong style={{ fontSize:49, lineHeight:0.95 }}>20%</strong>
                <strong style={{ fontSize:41, lineHeight:0.95 }}>3%</strong>
              </div>
              <div style={{ display:'inline-block', marginTop:2, padding:'2px 8px', borderRadius:999, background:'#3CA9D9', color:'#fff', fontSize:11, fontWeight:900 }}>09 - 12 - 2020</div>
              <div style={{ position:'absolute', right:-4, bottom:6, width:72, height:43, borderRadius:'48% 48% 18% 18%', background:'rgba(255,255,255,0.6)' }} />
              <div style={{ position:'absolute', right:13, bottom:17, width:44, height:10, borderRadius:999, background:'#F04A70', transform:'rotate(-7deg)' }} />
            </div>
          </div>
        </button>

        <div style={{ background:'#fff', display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid #ECEEF0', borderLeft:'1px solid #ECEEF0' }}>
          {SERVICE_ROWS.slice(3).flat().map((item) => (
            <button key={item.label} onClick={() => explainMoMoFeature(item)} style={{ minHeight:95, borderRight:'1px solid #ECEEF0', borderBottom:'1px solid #ECEEF0', background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:7, position:'relative', textAlign:'center', color:'#5E5E5E', padding:'7px 4px' }}>
              <div style={{ width:32, height:32, borderRadius:7, color:item.tone, background:`${item.tone}14`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {item.icon}
              </div>
              <div style={{ whiteSpace:'pre-line', fontSize:16, lineHeight:1.08, fontWeight:500, letterSpacing:0 }}>{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      <nav style={{ position:'absolute', left:0, right:0, bottom:0, minHeight:55, background:'#fff', borderTop:'1px solid #E1E3E5', display:'grid', gridTemplateColumns:'repeat(5,1fr)' }}>
        {BOTTOM_TABS.map((item) => (
          <button key={item.label} onClick={() => explainMoMoFeature(item)} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, color:item.active ? MOMO : '#8A8E94', position:'relative', fontSize:10, fontWeight:800 }}>
            <div style={{ position:'relative', display:'flex' }}>
              {item.icon}
              {item.badge && <div style={{ position:'absolute', top:-8, right:-10, width:17, height:17, borderRadius:999, background:'#EB244F', color:'#fff', fontSize:10, lineHeight:'17px', fontWeight:900 }}>{item.badge}</div>}
            </div>
            <div style={{ fontSize:10, lineHeight:1, fontWeight:900 }}>{item.label}</div>
          </button>
        ))}
      </nav>
    </div>
  );
}
