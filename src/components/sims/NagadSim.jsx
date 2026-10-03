import { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, ShieldCheck, Send, ArrowDownCircle, Banknote, Smartphone, FileText, Store, Bell, Gift, Heart, QrCode, CreditCard, UserCircle, Landmark, PlusCircle, Home, History, MessageCircle, Menu, Info, Phone } from 'lucide-react';
import GuidiaSafetyPanel from '../GuidiaSafetyPanel';

const NG = '#F05A22';
const NG_LIGHT = '#FFF3EE';

const SERVICES = [
  { icon:<Send size={24}/>, en:'Send Money', bn:'টাকা পাঠান', step:'send', explain:'Send Money lets you send taka to another Nagad number. Check the number twice before sending.' },
  { icon:<Banknote size={24}/>, en:'Cash Out', bn:'ক্যাশ আউট', step:'otp', explain:'Cash Out helps withdraw cash from an agent. Confirm the agent number before continuing.' },
  { icon:<Smartphone size={24}/>, en:'Mobile Recharge', bn:'মোবাইল রিচার্জ', step:'recharge', explain:'Mobile Recharge adds phone balance. Check the number and operator first.'},
  { icon:<PlusCircle size={24}/>, en:'Add Money', bn:'অ্যাড মানি', step:'add', explain:'Add Money brings money into Nagad from a bank or card. Use your own trusted account.' },
  { icon:<ArrowDownCircle size={24}/>, en:'Transfer Money', bn:'ট্রান্সফার মানি', step:'transfer', explain:'Transfer Money moves money to another service or account. Check all details first.' },
  { icon:<ShieldCheck size={24}/>, en:'Insurance', bn:'ইনস্যুরেন্স', step:'insurance', explain:'Insurance can protect against certain risks. Read coverage and charges first.' },
  { icon:<Gift size={24}/>, en:'Nagad Mela', bn:'নগদ মেলা', step:'mela', explain:'Nagad Mela shows offers and campaigns. Read conditions before joining.' },
  { icon:<Landmark size={24}/>, en:'Savings', bn:'সেভিংস', step:'savings', explain:'Savings helps set money aside. Read time, fees, and withdrawal rules.' },
];

const PAYMENTS = [
  { icon:<Store size={24}/>, en:'Merchant Pay', bn:'মার্চেন্ট পে', step:'pay', explain:'Merchant Pay pays a shop. Match the shop name before confirming.' },
  { icon:<FileText size={24}/>, en:'Bill Pay', bn:'বিল পে', step:'bill', explain:'Bill Pay pays utility or service bills. Copy the customer number from the real bill.' },
  { icon:<CreditCard size={24}/>, en:'EMI Collection', bn:'EMI কালেকশন', step:'emi', explain:'EMI Collection pays a monthly installment. Check the lender and amount first.' },
  { icon:<Heart size={24}/>, en:'Donation', bn:'ডোনেশন', step:'donation', explain:'Donation sends money to a cause. Make sure the organization is real.' },
  { icon:<FileText size={24}/>, en:'Income Tax', bn:'ইনকাম ট্যাক্স', step:'tax', explain:'Income Tax is for official tax payments. Use only official tax information.' },
];

const OTHERS = [
  { icon:<Store size={24}/>, en:'Nagad Sheba', bn:'নগদ সেবা', step:'sheba', explain:'Nagad Sheba shows support services and help options.' },
  { icon:<Phone size={24}/>, en:'Contact Us', bn:'যোগাযোগ', step:'contact', explain:'Contact Us shows official Nagad support options. Use official support only.' },
  { icon:<Info size={24}/>, en:'Limits and Charge', bn:'লিমিট ও চার্জ', step:'limits', explain:'Limits and Charge explains transaction limits and fees. Read this before sending money.' },
];

export default function NagadSim({ onClose }) {
  const { t, speak, showToast, user } = useApp();
  const [step, setStep] = useState('home');
  const [otp, setOtp] = useState(['','','','','','']);
  const [otpSent, setOtpSent] = useState(false);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [showSafetyPanel, setShowSafetyPanel] = useState(false);

  const sendOTP = () => {
    setOtpSent(true);
    speak(t('OTP sent! Remember: NEVER share your OTP with anyone, even Nagad staff.','OTP পাঠানো হয়েছে! মনে রাখুন: কখনো OTP কাউকে দেবেন না।'));
    showToast(t('Demo OTP: 7-7-7-4-2-1 (Never share real OTPs!)', 'ডেমো OTP: 7-7-7-4-2-1 (আসল OTP শেয়ার করবেন না!)'), 'danger');
  };

  const verified = otp.join('') === '777421';
  const displayName = user?.name || t('Guidia Learner', 'Guidia শিক্ষার্থী', 'Guidia विद्यार्थी');
  const explainBalance = () => {
    speak(t('Tap for Balance shows your current Nagad balance. In the real app, enter your PIN only on the official Nagad screen, and never share it with anyone.', 'Tap for Balance আপনার বর্তমান Nagad ব্যালেন্স দেখায়। আসল অ্যাপে শুধু অফিসিয়াল Nagad স্ক্রিনে PIN দিন এবং কাউকে বলবেন না।'));
    showToast(t('Tap for Balance checks your Nagad balance safely.', 'Tap for Balance নিরাপদে Nagad ব্যালেন্স দেখায়।'), 'info');
  };
  const handleMenu = (m) => {
    speak(`${t(m.en, m.bn)}. ${m.explain}`);
    if (m.step === 'send') setStep('send');
    else if (m.step === 'otp') setStep('otp');
    else showToast(t(`${m.en} — Practice explanation`, `${m.bn} — অনুশীলন ব্যাখ্যা`), 'info');
  };

  /* ─ OTP Screen ─ */
  if (step === 'otp') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      <div style={{ background:NG, padding:'16px 20px', display:'flex', alignItems:'center', gap:12, color:'#fff', flexShrink:0 }}>
        <button onClick={()=>setStep('home')} style={{ color:'#fff' }}><ArrowLeft size={22}/></button>
        <p style={{ fontWeight:800, fontSize:18 }}> {t('OTP Lesson','OTP পাঠ')}</p>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ background:'#FCE8E6', borderRadius:12, padding:18, border:'1px solid #F28B82' }}>
          <p style={{ fontWeight:800, fontSize:17, color:'#C62828', marginBottom:8 }}> {t('What is an OTP?','OTP কী?')}</p>
          <p style={{ fontSize:15, lineHeight:1.7, color:'#B71C1C' }}>
            {t('An OTP (One-Time Password) is a 6-digit secret code sent ONLY to your phone. No bank, Nagad agent, or company ever needs your OTP. If anyone asks — it\'s a SCAM!',
               'OTP (ওয়ান-টাইম পাসওয়ার্ড) শুধুমাত্র আপনার ফোনে পাঠানো ৬ সংখ্যার গোপন কোড। কোনো ব্যাংক, এজেন্ট বা কোম্পানি কখনো OTP চায় না। কেউ চাইলে — সেটি প্রতারণা!')}
          </p>
        </div>
        {!otpSent ? (
          <button onClick={sendOTP} style={{ width:'100%', background:NG, color:'#fff', padding:'16px', borderRadius:10, fontWeight:800, fontSize:17, border:'none', cursor:'pointer' }}>
             {t('Send Demo OTP to My Phone','ডেমো OTP ফোনে পাঠান')}
          </button>
        ) : (
          <>
            <div>
              <p style={{ fontWeight:700, fontSize:15, marginBottom:12, color:'#202124' }}>
                {t('Enter OTP (demo: 777421):','OTP লিখুন (ডেমো: 777421):')}
              </p>
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                {otp.map((v,i) => (
                  <input key={i} id={`notp-${i}`} type="tel" maxLength={1} value={v}
                    onChange={e => {
                      if (!/^\d*$/.test(e.target.value)) return;
                      const n=[...otp]; n[i]=e.target.value.slice(-1); setOtp(n);
                      if (e.target.value && i<5) document.getElementById(`notp-${i+1}`)?.focus();
                    }}
                    style={{ width:50, height:60, borderRadius:10, border:`2px solid ${v?(verified?'var(--success)':NG):'#DADCE0'}`, fontSize:28, fontWeight:800, textAlign:'center', outline:'none', background: v&&verified?'var(--success-light)':v?NG_LIGHT:'#fff' }}/>
                ))}
              </div>
            </div>
            {verified && (
              <div style={{ background:'var(--success-light)', borderRadius:12, padding:20, textAlign:'center', border:'1px solid var(--success)' }} className="anim-scale">
                <ShieldCheck size={52} color="var(--success)" style={{ margin:'0 auto 12px' }}/>
                <p style={{ fontWeight:800, fontSize:20, color:'var(--success)', marginBottom:8 }}>{t(' OTP Verified!',' OTP যাচাই হয়েছে!')}</p>
                <p style={{ fontSize:15, color:'#388E3C', lineHeight:1.6 }}>
                  {t('Great work! Remember: In real life, NEVER share your OTP. Not even with people claiming to be from Nagad!',
                     'দারুণ! মনে রাখুন: বাস্তবে কখনো OTP কাউকে দেবেন না। Nagad-এর লোক বলেও না!')}
                </p>
              </div>
            )}
          </>
        )}
        <button onClick={()=>setStep('home')} style={{ background:'none', border:'1px solid #DADCE0', padding:'12px', borderRadius:8, fontWeight:600, fontSize:15, cursor:'pointer', color:'#5F6368' }}>
          ← {t('Back to Nagad Home','নাগাদ হোমে ফিরুন')}
        </button>
      </div>
    </div>
  );

  /* ─ Send Money Form ─ */
  if (step === 'send') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      <div style={{ background:NG, padding:'16px 20px', display:'flex', alignItems:'center', gap:12, color:'#fff', flexShrink:0 }}>
        <button onClick={()=>setStep('home')} style={{ color:'#fff' }}><ArrowLeft size={22}/></button>
        <p style={{ fontWeight:800, fontSize:18 }}>{t('Send Money','টাকা পাঠান')}</p>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ background:'#FFF3E0', borderRadius:10, padding:14, border:'1px solid #FFB74D' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#E65100' }}> {t('Always confirm the number before sending!','পাঠানোর আগে নম্বর নিশ্চিত করুন!')}</p>
        </div>
        <div>
          <label style={{ fontWeight:700, fontSize:15, display:'block', marginBottom:8 }}>{t('Recipient Number','প্রাপকের নম্বর')}</label>
          <input className="input-field" type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={e=>setPhone(e.target.value)} style={{ fontSize:18 }}/>
        </div>
        <div>
          <label style={{ fontWeight:700, fontSize:15, display:'block', marginBottom:8 }}>{t('Amount ৳','পরিমাণ ৳')}</label>
          <input className="input-field" type="number" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)} style={{ fontSize:24, fontWeight:800, color:NG }}/>
        </div>
        <button onClick={() => phone&&amount&&setShowSafetyPanel(true)} disabled={!phone||!amount}
          style={{ width:'100%', background:phone&&amount?NG:'#CCC', color:'#fff', padding:'16px', borderRadius:8, fontWeight:800, fontSize:17, border:'none', cursor:phone&&amount?'pointer':'default', marginTop:'auto' }}>
          {t('Review & Send →','পর্যালোচনা ও পাঠান →')}
        </button>
      </div>

      <GuidiaSafetyPanel
        open={showSafetyPanel}
        actionType="nagad_send_money"
        title={t('Review before you send', 'পাঠানোর আগে যাচাই করুন')}
        what={t('Send money via Nagad', 'Nagad এর মাধ্যমে টাকা পাঠানো')}
        who={phone}
        amountOrData={`৳ ${amount}`}
        consequence={t(
          'After OTP verification, the money leaves your account and cannot be undone.',
          'OTP যাচাইয়ের পর টাকা আপনার অ্যাকাউন্ট থেকে চলে যাবে এবং তা ফেরত আনা যাবে না।'
        )}
        onProceed={() => { setShowSafetyPanel(false); setStep('otp'); }}
        onEdit={() => setShowSafetyPanel(false)}
        onRequestHelp={() => {
          setShowSafetyPanel(false);
          speak(t("It's okay to ask for help. Consider asking Guidia's AI Assistant or a trusted family member before sending.", 'সাহায্য চাওয়া ঠিক আছে। পাঠানোর আগে Guidia সহকারী বা বিশ্বস্ত পরিবারকে জিজ্ঞাসা করুন।'));
          showToast(t('No problem — take your time. Ask the AI Assistant if you need help.', 'কোনো সমস্যা নেই — সময় নিন। প্রয়োজনে AI সহকারীকে জিজ্ঞাসা করুন।'), 'info');
        }}
      />
    </div>
  );

  /* ─ Home Screen ─ */
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#F7F7F7', position:'relative', overflow:'hidden' }}>
      <div style={{ background:`linear-gradient(155deg,${NG},#ff6f3f 76%,#ff8b5c)`, color:'#fff', flexShrink:0, padding:'10px 14px 22px', position:'relative', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <button onClick={onClose} style={{ color:'#fff', padding:4 }}><ArrowLeft size={20}/></button>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontWeight:900, fontSize:24, lineHeight:1 }}>নগদ</p>
            <p style={{ fontSize:9, fontWeight:800, opacity:0.9 }}>ডাক বিভাগের ডিজিটাল লেনদেন</p>
          </div>
          <Bell size={20}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(255,255,255,0.22)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(255,255,255,0.35)' }}><UserCircle size={38}/></div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:10, opacity:0.86 }}>স্বাগতম</p>
            <strong style={{ display:'block', fontSize:15, fontWeight:900 }}>{displayName}</strong>
            <button onClick={explainBalance} style={{ marginTop:5, background:'#fff', color:NG, border:0, borderRadius:999, padding:'6px 12px', fontWeight:900, fontSize:11 }}>Tap for Balance</button>
          </div>
        </div>
        <div style={{ position:'absolute', right:-28, bottom:-30, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.12)' }}/>
        <div style={{ position:'absolute', right:35, top:42, width:96, height:96, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.12)' }}/>
      </div>

      {/* Tip */}
      <div style={{ background:'#FFF3E0', padding:'8px 14px', fontSize:13, color:'#E65100', fontWeight:600, flexShrink:0 }}>
         {t('Tap "Cash In" to learn about OTP safety!','"ক্যাশ ইন" চাপ দিয়ে OTP নিরাপত্তা শিখুন!')}
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'10px 12px 82px' }}>
        {[
          { title:t('Services','সার্ভিস'), items:SERVICES.slice(0, 4) },
          { title:t('Payments','পেমেন্ট'), items:PAYMENTS },
          { title:t('Others','অন্যান্য'), items:OTHERS },
        ].map((section) => (
          <section key={section.title} style={{ marginBottom:12 }}>
            <p style={{ fontWeight:900, fontSize:12, color:'#777', margin:'0 0 8px 2px' }}>{section.title}</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {section.items.map(m => (
                <button key={m.step+m.en} onClick={() => handleMenu(m)}
                  style={{ background:'#fff', borderRadius:12, minHeight:82, padding:'8px 3px', textAlign:'center', border:'1px solid #ededed', cursor:'pointer', boxShadow:'0 1px 5px rgba(0,0,0,0.06)' }}>
                  <div style={{ width:42, height:42, margin:'0 auto 6px', borderRadius:11, background:NG, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>{m.icon}</div>
                  <p style={{ fontSize:9.5, fontWeight:800, color:'#202124', lineHeight:1.12 }}>{t(m.en, m.bn)}</p>
                </button>
              ))}
            </div>
          </section>
        ))}

        {/* Transactions */}
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8EAED', overflow:'hidden', display:'none' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #F0F0F0', display:'flex', justifyContent:'space-between' }}>
            <p style={{ fontWeight:700, fontSize:16 }}>{t('Transactions','লেনদেন')}</p>
            <p style={{ fontSize:13, color:NG, fontWeight:600 }}>{t('See All','সব দেখুন')}</p>
          </div>
          {[
            { icon:<Smartphone size={20}/>, label:t('Recharge 01XXXXXXXX','রিচার্জ 01XXXXXXXX'), amount:'-৳ 100', date:t('Today','আজ'), c:'var(--danger)' },
            { icon:<Send size={20}/>, label:t('Sent to Rupa','রুপাকে পাঠানো'), amount:'-৳ 500', date:t('Yesterday','গতকাল'), c:'var(--danger)' },
            { icon:<ArrowDownCircle size={20}/>, label:t('Cash In','ক্যাশ ইন'), amount:'+৳ 3,000', date:'3 days ago', c:'var(--success)' },
          ].map((tx,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom:i<2?'1px solid #F5F5F5':'none' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${NG}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{tx.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600, fontSize:15 }}>{tx.label}</p>
                <p style={{ fontSize:12, color:'#8E8E8E', marginTop:2 }}>{tx.date}</p>
              </div>
              <p style={{ fontWeight:800, fontSize:15, color:tx.c }}>{tx.amount}</p>
            </div>
          ))}
        </div>
      </div>
      <nav style={{ position:'absolute', left:0, right:0, bottom:0, minHeight:64, background:'#fff', borderTop:'1px solid #e8e8e8', display:'grid', gridTemplateColumns:'repeat(5,1fr)', boxShadow:'0 -6px 18px rgba(0,0,0,0.08)' }}>
        {[
          { icon:<Home size={20}/>, label:'Home', active:true },
          { icon:<History size={20}/>, label:'Transactions' },
          { icon:<QrCode size={20}/>, label:'People' },
          { icon:<MessageCircle size={20}/>, label:'My Nagad' },
          { icon:<Menu size={20}/>, label:'More' },
        ].map((item) => (
          <button key={item.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, color:item.active?NG:'#777', fontSize:9, fontWeight:800 }}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
