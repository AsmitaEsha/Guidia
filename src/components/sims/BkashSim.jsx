import { useState } from 'react';
import { useApp } from '../../context/AppStateContext';
import { ArrowLeft, ShieldCheck, Send, Smartphone, Store, ArrowUpCircle, Banknote, UserCircle, ArrowDownCircle } from 'lucide-react';
import GuidiaSafetyPanel from '../GuidiaSafetyPanel';

const BK = '#E2136E';
const BK_LIGHT = '#FFF0F7';

const MENU_ITEMS = [
  { icon:<Send size={24}/>, labelEn:'Send Money', labelBn:'টাকা পাঠান', step:'send' },
  { icon:<Smartphone size={24}/>, labelEn:'Mobile Recharge', labelBn:'মোবাইল রিচার্জ', step:'recharge'},
  { icon:<Store size={24}/>, labelEn:'Payment', labelBn:'পেমেন্ট', step:'pay' },
  { icon:<ArrowUpCircle size={24}/>, labelEn:'Add Money', labelBn:'টাকা যোগ করুন', step:'add' },
  { icon:<Banknote size={24}/>, labelEn:'Cash Out', labelBn:'ক্যাশ আউট', step:'cashout' },
  { icon:<UserCircle size={24}/>, labelEn:'My bKash', labelBn:'আমার bKash', step:'profile' },
];

const SAVED_CONTACTS = [
  { id:'c1', name:'Rupa (Daughter)', phone:'018XXXXXX33', avatar:'' },
  { id:'c2', name:'Karim (Son)', phone:'019XXXXXX88', avatar:'' },
  { id:'c3', name:'Dr. Ahmed', phone:'017XXXXXX91', avatar:'' },
];

export default function BkashSim({ onClose }) {
  const { t, speak, showToast } = useApp();
  const [step, setStep] = useState('home');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [guardianWait, setGuardianWait] = useState(false);
  const [showSafetyPanel, setShowSafetyPanel] = useState(false);

  const back = () => {
    if (step !== 'home') setStep('home');
    else onClose();
  };

  const handleSend = () => {
    if (!recipient || !amount) return;
    setStep('confirm');
    setShowSafetyPanel(true);
  };

  const handleGuardianApprove = () => {
    setShowSafetyPanel(false);
    setGuardianWait(true);
    speak(t('Notifying guardian for approval…','গার্ডিয়ানকে অনুমোদনের জন্য জানানো হচ্ছে…'));
    setTimeout(() => { setGuardianWait(false); setStep('done'); speak(t('Guardian approved! Transfer successful.','গার্ডিয়ান অনুমোদন দিয়েছেন! স্থানান্তর সফল।')); }, 3000);
  };

  const handleEditFromSafetyPanel = () => {
    setShowSafetyPanel(false);
    setStep('send');
  };

  const handleHelpFromSafetyPanel = () => {
    setShowSafetyPanel(false);
    setStep('send');
    speak(t("It's okay to ask for help. Consider asking Guidia's AI Assistant or a trusted family member before sending.", 'সাহায্য চাওয়া ঠিক আছে। পাঠানোর আগে Guidia সহকারী বা বিশ্বস্ত পরিবারকে জিজ্ঞাসা করুন।'));
    showToast(t('No problem — take your time. Ask the AI Assistant if you need help.', 'কোনো সমস্যা নেই — সময় নিন। প্রয়োজনে AI সহকারীকে জিজ্ঞাসা করুন।'), 'info');
  };

  /* ─ Done Screen ─ */
  if (step === 'done') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:BK_LIGHT }}>
      <div style={{ background:BK, padding:'16px 20px', display:'flex', alignItems:'center', gap:12, color:'#fff', flexShrink:0 }}>
        <button onClick={()=>setStep('home')} style={{ color:'#fff' }}><ArrowLeft size={22}/></button>
        <p style={{ fontWeight:800, fontSize:18 }}>bKash</p>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:32, textAlign:'center' }} className="anim-scale">
        <div style={{ width:100, height:100, borderRadius:'50%', background:'var(--success-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ShieldCheck size={56} color="var(--success)"/>
        </div>
        <div>
          <p style={{ fontWeight:900, fontSize:26, color:'var(--success)' }}> {t('Transfer Complete!','স্থানান্তর সম্পন্ন!')}</p>
          <p style={{ marginTop:8, color:'#5F6368', fontSize:16 }}>৳ {amount} → {recipient}</p>
          <p style={{ marginTop:4, color:'var(--success)', fontWeight:600 }}>{t('Approved by Guardian','গার্ডিয়ান অনুমোদিত')}</p>
        </div>
        <button onClick={()=>setStep('home')} style={{ background:BK, color:'#fff', padding:'14px 36px', borderRadius:8, fontWeight:800, fontSize:16, border:'none', cursor:'pointer' }}>
          {t('Back to Home','হোমে ফিরুন')}
        </button>
      </div>
    </div>
  );

  /* ─ Guardian Wait ─ */
  if (guardianWait) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:24, padding:32, textAlign:'center', background:BK_LIGHT }}>
      <div className="icon-wrap iw-xl ic-blue anim-pulse" style={{ margin: '0 auto' }}><ShieldCheck size={36}/></div>
      <p style={{ fontWeight:800, fontSize:22 }}>{t('Waiting for Guardian…','গার্ডিয়ানের জন্য অপেক্ষা…')}</p>
      <p style={{ color:'#5F6368', fontSize:16 }}>{t('Your guardian is reviewing this transfer on their phone.','আপনার গার্ডিয়ান তাদের ফোনে এই লেনদেন দেখছেন।')}</p>
      <div className="spinner" style={{ width:40, height:40, borderWidth:4 }}/>
    </div>
  );

  /* ─ Confirm Screen — the Psychological Safety Net (GuidiaSafetyPanel)
     handles the actual review/decision; this screen is just the backdrop. ─ */
  if (step === 'confirm') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      <div style={{ background:BK, padding:'16px 20px', display:'flex', alignItems:'center', gap:12, color:'#fff', flexShrink:0 }}>
        <button onClick={handleEditFromSafetyPanel} style={{ color:'#fff' }}><ArrowLeft size={22}/></button>
        <p style={{ fontWeight:800, fontSize:18 }}>{t('Confirm Transfer','স্থানান্তর নিশ্চিত করুন')}</p>
      </div>
      <div style={{ flex:1, padding:20 }}>
        <div style={{ background:'#F8F9FA', borderRadius:10, padding:20, border:'1px solid #E8EAED' }}>
          <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:12, borderBottom:'1px solid #E8EAED', marginBottom:12 }}>
            <p style={{ color:'#5F6368', fontSize:15 }}>{t('Recipient','প্রাপক')}</p>
            <p style={{ fontWeight:700, fontSize:15 }}>{recipient}</p>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <p style={{ color:'#5F6368', fontSize:15 }}>{t('Amount','পরিমাণ')}</p>
            <p style={{ fontWeight:800, fontSize:20, color:BK }}>৳ {amount}</p>
          </div>
        </div>
      </div>

      <GuidiaSafetyPanel
        open={showSafetyPanel}
        actionType="bkash_send_money"
        title={t('Review before you send', 'পাঠানোর আগে যাচাই করুন')}
        what={t('Send money via bKash', 'bKash এর মাধ্যমে টাকা পাঠানো')}
        who={recipient}
        amountOrData={`৳ ${amount}`}
        consequence={t(
          'Once your guardian approves, the money leaves your account and cannot be undone.',
          'আপনার গার্ডিয়ান অনুমোদন দিলে টাকা আপনার অ্যাকাউন্ট থেকে চলে যাবে এবং তা ফেরত আনা যাবে না।'
        )}
        onProceed={handleGuardianApprove}
        onEdit={handleEditFromSafetyPanel}
        onRequestHelp={handleHelpFromSafetyPanel}
      />
    </div>
  );

  /* ─ Send Money Form ─ */
  if (step === 'send') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      <div style={{ background:BK, padding:'16px 20px', display:'flex', alignItems:'center', gap:12, color:'#fff', flexShrink:0 }}>
        <button onClick={back} style={{ color:'#fff' }}><ArrowLeft size={22}/></button>
        <p style={{ fontWeight:800, fontSize:18 }}>{t('Send Money','টাকা পাঠান')}</p>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:18 }}>
        <div style={{ background:'#FFF3E0', borderRadius:10, padding:14, border:'1px solid #FFB74D' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#E65100' }}> {t('Always double-check the number before sending money!','টাকা পাঠানোর আগে সবসময় নম্বর দুইবার যাচাই করুন!')}</p>
        </div>
        {/* Saved contacts */}
        <div>
          <p style={{ fontWeight:700, fontSize:15, marginBottom:10, color:'#5F6368' }}>{t('Saved Contacts','সংরক্ষিত পরিচিতি')}</p>
          <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:4 }}>
            {SAVED_CONTACTS.map(c => (
              <button key={c.id} onClick={() => setRecipient(c.phone)} style={{ flexShrink:0, textAlign:'center', background: recipient===c.phone?BK_LIGHT:'#F8F9FA', border:`2px solid ${recipient===c.phone?BK:'#E8EAED'}`, borderRadius:12, padding:'12px 14px', cursor:'pointer', minWidth:80 }}>
                <div style={{ fontSize:28, marginBottom:4 }}>{c.avatar}</div>
                <p style={{ fontSize:12, fontWeight:700, color: recipient===c.phone?BK:'#3C4043' }}>{c.name.split(' ')[0]}</p>
              </button>
            ))}
          </div>
        </div>
        {/* Number input */}
        <div>
          <label style={{ fontWeight:700, fontSize:15, display:'block', marginBottom:8 }}>{t('Mobile Number','মোবাইল নম্বর')}</label>
          <input className="input-field" type="tel" placeholder="01XXXXXXXXX" value={recipient} onChange={e=>setRecipient(e.target.value)}
            style={{ borderColor: recipient?BK:'#DADCE0', fontSize:18 }}/>
        </div>
        <div>
          <label style={{ fontWeight:700, fontSize:15, display:'block', marginBottom:8 }}>{t('Amount (BDT ৳)','পরিমাণ (টাকা ৳)')}</label>
          <input className="input-field" type="number" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)}
            style={{ borderColor: amount?BK:'#DADCE0', fontSize:24, fontWeight:800, color:BK }}/>
        </div>
        <button onClick={handleSend} disabled={!recipient||!amount}
          style={{ width:'100%', background: recipient&&amount?BK:'#CCC', color:'#fff', padding:'16px', borderRadius:8, fontWeight:800, fontSize:18, border:'none', cursor: recipient&&amount?'pointer':'default', marginTop:'auto' }}>
          {t('Next →','পরবর্তী →')}
        </button>
      </div>
    </div>
  );

  /* ─ Home Screen ─ */
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#F5F5F5' }}>
      {/* Header */}
      <div style={{ background:BK, color:'#fff', flexShrink:0 }}>
        <div style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={onClose} style={{ color:'#fff', padding:4 }}><ArrowLeft size={20}/></button>
            <div>
              {/* bKash logo text */}
              <p style={{ fontWeight:900, fontSize:22, letterSpacing:-0.5 }}>b<span style={{ fontWeight:400 }}>Kash</span></p>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:12, opacity:0.8 }}>{t('Available Balance','উপলব্ধ ব্যালেন্স')}</p>
            <p style={{ fontWeight:900, fontSize:22 }}>৳ 12,450.00</p>
          </div>
        </div>
        {/* Account number bar */}
        <div style={{ background:'rgba(0,0,0,0.15)', padding:'8px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ fontSize:13, opacity:0.9 }}>01XXXXXXXX ({t('Practice Account','অনুশীলন অ্যাকাউন্ট')})</p>
          <span style={{ fontSize:12, background:'rgba(255,255,255,0.2)', padding:'3px 10px', borderRadius:12 }}>{t('Verified ','যাচাইকৃত ')}</span>
        </div>
      </div>

      {/* Practice tip */}
      <div style={{ background:'#FCE4EC', padding:'8px 14px', fontSize:13, color:'#880E4F', fontWeight:600, flexShrink:0 }}>
         {t('Practice mode — no real money will move.','অনুশীলন মোড — আসল টাকা যাবে না।')}
      </div>

      {/* Menu Grid */}
      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {MENU_ITEMS.map(m => (
            <button key={m.step} onClick={() => m.step==='send'?setStep('send'):showToast(t(`${m.labelEn} — Practice mode`,`${m.labelBn} — অনুশীলন`))}
              style={{ background:'#fff', borderRadius:12, padding:'18px 8px', textAlign:'center', border:'1px solid #E8EAED', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize:30, marginBottom:8 }}>{m.icon}</div>
              <p style={{ fontSize:13, fontWeight:700, color:'#202124', lineHeight:1.3 }}>{t(m.labelEn, m.labelBn)}</p>
            </button>
          ))}
        </div>

        {/* Recent transactions */}
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8EAED', overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #E8EAED', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ fontWeight:700, fontSize:16 }}>{t('Recent Transactions','সাম্প্রতিক লেনদেন')}</p>
            <p style={{ fontSize:13, color:BK, fontWeight:600 }}>{t('See All','সব দেখুন')}</p>
          </div>
          {[
            { icon:<Send size={20}/>, label:t('Send Money to Rupa','রুপাকে টাকা পাঠানো'), amount:'-৳ 1,000', date:t('Yesterday','গতকাল'), color:'var(--danger)' },
            { icon:<ArrowDownCircle size={20}/>, label:t('Add Money from Bank','ব্যাংক থেকে টাকা যোগ'), amount:'+৳ 5,000', date:'2 days ago', color:'var(--success)' },
            { icon:<Smartphone size={20}/>, label:t('Mobile Recharge','মোবাইল রিচার্জ'), amount:'-৳ 100', date:'3 days ago', color:'var(--danger)' },
          ].map((tx,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom:i<2?'1px solid #F0F0F0':'none' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${BK}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{tx.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600, fontSize:15 }}>{tx.label}</p>
                <p style={{ fontSize:12, color:'#8E8E8E', marginTop:2 }}>{tx.date}</p>
              </div>
              <p style={{ fontWeight:800, fontSize:15, color:tx.color }}>{tx.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
