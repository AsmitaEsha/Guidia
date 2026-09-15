import { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, ShieldCheck, Send, ArrowDownCircle, Banknote, Smartphone, FileText, Store } from 'lucide-react';
import GuidiaSafetyPanel from '../GuidiaSafetyPanel';

const NG = '#F05A22';
const NG_LIGHT = '#FFF3EE';

const MENU = [
  { icon:<Send size={24}/>, en:'Send Money', bn:'টাকা পাঠান', step:'send' },
  { icon:<ArrowDownCircle size={24}/>, en:'Cash In', bn:'ক্যাশ ইন', step:'otp' },
  { icon:<Banknote size={24}/>, en:'Cash Out', bn:'ক্যাশ আউট', step:'otp' },
  { icon:<Smartphone size={24}/>, en:'Mobile Recharge', bn:'মোবাইল রিচার্জ', step:'recharge'},
  { icon:<FileText size={24}/>, en:'Pay Bill', bn:'বিল দিন', step:'bill' },
  { icon:<Store size={24}/>, en:'Merchant Pay', bn:'মার্চেন্ট পেমেন্ট',step:'pay' },
];

export default function NagadSim({ onClose }) {
  const { t, speak, showToast } = useApp();
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
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#F5F5F5' }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${NG},#ff7a3d)`, color:'#fff', flexShrink:0 }}>
        <div style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={onClose} style={{ color:'#fff', padding:4 }}><ArrowLeft size={20}/></button>
            <p style={{ fontWeight:900, fontSize:24, letterSpacing:-0.5 }}>nagad</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:12, opacity:0.85 }}>{t('Balance','ব্যালেন্স')}</p>
            <p style={{ fontWeight:900, fontSize:22 }}>৳ 8,200.00</p>
          </div>
        </div>
        <div style={{ background:'rgba(0,0,0,0.12)', padding:'8px 18px', display:'flex', justifyContent:'space-between' }}>
          <p style={{ fontSize:13 }}>01XXXXXXXX</p>
          <span style={{ fontSize:12, background:'rgba(255,255,255,0.25)', padding:'3px 10px', borderRadius:12 }}> {t('Active','সক্রিয়')}</span>
        </div>
      </div>

      {/* Tip */}
      <div style={{ background:'#FFF3E0', padding:'8px 14px', fontSize:13, color:'#E65100', fontWeight:600, flexShrink:0 }}>
         {t('Tap "Cash In" to learn about OTP safety!','"ক্যাশ ইন" চাপ দিয়ে OTP নিরাপত্তা শিখুন!')}
      </div>

      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        {/* Menu Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {MENU.map(m => (
            <button key={m.step+m.en} onClick={() => m.step==='send'?setStep('send'):m.step==='otp'?setStep('otp'):showToast(t(`${m.en} — Practice mode`,`${m.bn} — অনুশীলন`))}
              style={{ background:'#fff', borderRadius:12, padding:'18px 8px', textAlign:'center', border:'1px solid #E8EAED', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{m.icon}</div>
              <p style={{ fontSize:13, fontWeight:700, color:'#202124', lineHeight:1.3 }}>{t(m.en, m.bn)}</p>
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8EAED', overflow:'hidden' }}>
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
    </div>
  );
}
