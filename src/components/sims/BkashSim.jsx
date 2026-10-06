import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bell,
  CheckCircle2,
  Clock,
  CreditCard,
  Gift,
  Home,
  Landmark,
  Lock,
  PiggyBank,
  ReceiptText,
  Send,
  ShieldCheck,
  Smartphone,
  Store,
  UserCircle,
  UserCog,
  Users,
  WalletCards,
} from 'lucide-react';
import { useApp } from '../../context/AppStateContext';
import GuidiaSafetyPanel from '../GuidiaSafetyPanel';

const BKASH = '#e2136e';

const MENU_ITEMS = [
  { icon: <Send size={26}/>, label: 'Send Money', step: 'send', tone: 'pink', explain: 'Send Money lets you send taka to another bKash number. Always check the number twice before confirming.' },
  { icon: <Smartphone size={26}/>, label: 'Mobile Recharge', step: 'recharge', tone: 'green', explain: 'Mobile Recharge adds phone balance for you or a family member. Check the phone number and operator first.' },
  { icon: <Banknote size={26}/>, label: 'Cash Out', step: 'cashout', tone: 'blue', explain: 'Cash Out is for taking physical cash from an agent. Confirm the agent number before using it.' },
  { icon: <Store size={26}/>, label: 'Make Payment', step: 'pay', tone: 'orange', explain: 'Make Payment is for paying shops or merchants. Match the shop name on screen before confirming.' },
  { icon: <WalletCards size={26}/>, label: 'Add Money', step: 'add', tone: 'purple', explain: 'Add Money brings money into bKash from a bank or card. Use only your own trusted bank account.' },
  { icon: <ReceiptText size={26}/>, label: 'Pay Bill', step: 'bill', tone: 'gray', explain: 'Pay Bill helps pay electricity, gas, water, internet, or other bills. Copy the customer number from the real bill.' },
  { icon: <PiggyBank size={26}/>, label: 'Savings', step: 'savings', tone: 'pink', explain: 'Savings helps keep money aside for future needs. Read the plan time and charges before starting.' },
  { icon: <Landmark size={26}/>, label: 'Loan', step: 'loan', tone: 'brown', explain: 'Loan shows borrowing options. Read all charges carefully and ask family before taking any loan.' },
  { icon: <ShieldCheck size={26}/>, label: 'Insurance', step: 'insurance', tone: 'teal', explain: 'Insurance can protect against certain risks. Read what is covered before buying.' },
  { icon: <ArrowRight size={26}/>, label: 'bKash to Bank', step: 'bank', tone: 'pink', explain: 'bKash to Bank moves money to a bank account. Check the bank account name and number carefully.' },
  { icon: <Landmark size={26}/>, label: 'Education Fee', step: 'education', tone: 'green', explain: 'Education Fee is for school or college payments. Use the official student ID or bill number.' },
  { icon: <Users size={26}/>, label: 'Microfinance', step: 'microfinance', tone: 'blue', explain: 'Microfinance payments are for partner organizations. Confirm the organization name before paying.' },
  { icon: <CreditCard size={26}/>, label: 'Toll', step: 'toll', tone: 'blue', explain: 'Toll is for road or bridge toll payments. Check vehicle and toll details before payment.' },
  { icon: <Gift size={26}/>, label: 'Request Money', step: 'request', tone: 'pink', explain: 'Request Money asks someone to send you money. Only request from people you know.' },
  { icon: <ArrowRight size={26}/>, label: 'Remittance', step: 'remittance', tone: 'green', explain: 'Remittance helps receive money sent from abroad. Never share your PIN to receive money.' },
  { icon: <Users size={26}/>, label: 'Donation', step: 'donation', tone: 'orange', explain: 'Donation sends money to a cause. Make sure the organization is real before donating.' },
];

const SAVED_CONTACTS = [
  { id: 'c1', name: 'Rupa', detail: 'Daughter', phone: '01844553333' },
  { id: 'c2', name: 'Karim', detail: 'Son', phone: '01944888888' },
  { id: 'c3', name: 'Dr. Ahmed', detail: 'Doctor', phone: '01722999991' },
];

const TRANSACTIONS = [
  { label: 'Send Money', detail: 'Rupa', amount: '- Tk 1,000.00', type: 'out' },
  { label: 'Received Money', detail: 'Karim', amount: '+ Tk 800.00', type: 'in' },
  { label: 'Mobile Recharge', detail: '01722*****91', amount: '- Tk 100.00', type: 'out' },
];

const FEATURE_GUIDES = {
  recharge: {
    title: 'Mobile Recharge',
    icon: <Smartphone size={38}/>,
    accent: '#16a34a',
    note: 'Recharge your own or a family member phone number. In practice mode, no money will move.',
    fields: [
      { label: 'Mobile Number', value: '01722 999991' },
      { label: 'Operator', value: 'Grameenphone' },
      { label: 'Amount', value: 'Tk 100' },
    ],
    steps: [
      'Choose Mobile Recharge from the home screen.',
      'Type the phone number carefully and check the operator name.',
      'Choose the amount, then review once before confirming.',
      'Never recharge a stranger who calls and pressures you.',
    ],
  },
  bill: {
    title: 'Pay Bill',
    icon: <ReceiptText size={38}/>,
    accent: '#2563eb',
    note: 'Pay electricity, gas, water, internet, or school bills from one place.',
    fields: [
      { label: 'Bill Type', value: 'Electricity' },
      { label: 'Customer Number', value: '1234 5678 90' },
      { label: 'Amount', value: 'Tk 850' },
    ],
    steps: [
      'Choose Pay Bill from the home screen.',
      'Pick the correct bill company before typing any number.',
      'Enter the customer or meter number from the official bill paper.',
      'Match the name and amount before payment.',
    ],
  },
  savings: {
    title: 'Savings',
    icon: <PiggyBank size={38}/>,
    accent: BKASH,
    note: 'Savings helps you set money aside little by little for future needs.',
    fields: [
      { label: 'Goal', value: 'Medicine fund' },
      { label: 'Monthly Save', value: 'Tk 500' },
      { label: 'Duration', value: '6 months' },
    ],
    steps: [
      'Choose Savings from the home screen.',
      'Read the plan name, duration, and any charges slowly.',
      'Start with a small amount you are comfortable saving.',
      'Ask family before opening a long-term savings plan.',
    ],
  },
  profile: {
    title: 'Create Profile',
    icon: <UserCog size={38}/>,
    accent: '#7c3aed',
    note: 'Your profile keeps your name, mobile number, photo, and security settings in one safe place.',
    fields: [
      { label: 'Name', value: 'Nayeem Raihan' },
      { label: 'Mobile', value: '01722 999991' },
      { label: 'Security', value: 'PIN and trusted device' },
    ],
    steps: [
      'Tap your photo or My Profile from the bKash home screen.',
      'Check that your name and phone number are correct.',
      'Add a clear profile photo only if you want to.',
      'Set a secret PIN and never tell it to anyone.',
      'Turn on login alerts so you know if someone tries to use your account.',
    ],
  },
};

function BkashHeader({ title = 'bKash', onBack, right }) {
  return (
    <div className="bkash-header">
      <button className="bkash-header-btn" onClick={onBack} aria-label="Go back">
        <ArrowLeft size={28}/>
      </button>
      <strong>{title}</strong>
      <div className="bkash-header-right">{right || <Bell size={26}/>}</div>
    </div>
  );
}

function PhoneFrame({ children, className = '' }) {
  return <div className={`bkash-phone ${className}`}>{children}</div>;
}

export default function BkashSim({ onClose }) {
  const { t, speak, showToast, user } = useApp();
  const [step, setStep] = useState('home');
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [guardianApproved, setGuardianApproved] = useState(false);
  const [showSafetyPanel, setShowSafetyPanel] = useState(false);

  const back = () => {
    if (step !== 'home') setStep('home');
    else onClose();
  };

  const chooseContact = (contact) => {
    setRecipient(contact.phone);
    setRecipientName(`${contact.name} (${contact.detail})`);
  };

  const handleSend = () => {
    if (!recipient || !amount) return;
    setStep('confirm');
    setShowSafetyPanel(true);
  };

  // Called by the Safety Net only after the server executed the practice
  // transfer (including a real guardian approval when one was required).
  const handleGuardianApprove = (proposal) => {
    setShowSafetyPanel(false);
    setGuardianApproved(proposal?.guardianApproval?.status === 'APPROVED');
    setStep('done');
    speak(t('Practice transfer complete. No real money was moved.', 'অনুশীলনের টাকা পাঠানো সম্পন্ন। কোনো আসল টাকা যায়নি।'));
  };

  const handleEditFromSafetyPanel = () => {
    setShowSafetyPanel(false);
    setStep('send');
  };

  const handleHelpFromSafetyPanel = () => {
    setShowSafetyPanel(false);
    setStep('send');
    speak(t(
      "It's okay to ask for help. Consider asking Guidia's AI Assistant or a trusted family member before sending.",
      'সাহায্য চাওয়া ঠিক আছে। পাঠানোর আগে Guidia সহকারী বা বিশ্বস্ত পরিবারকে জিজ্ঞাসা করুন।'
    ));
    showToast(t('No problem. Take your time before sending.', 'কোনো সমস্যা নেই। পাঠানোর আগে সময় নিন।'), 'info');
  };

  const displayName = user?.name || t('Guidia Learner', 'Guidia শিক্ষার্থী', 'Guidia विद्यार्थी');
  const explainBalance = () => {
    speak(t(
      'Tap for Balance shows your current bKash balance. In the real app, tap it and enter your PIN only on the official bKash screen. Never share your PIN with anyone.',
      'Tap for Balance আপনার বর্তমান bKash ব্যালেন্স দেখায়। আসল অ্যাপে এটি চাপুন এবং শুধু অফিসিয়াল bKash স্ক্রিনে PIN দিন। কাউকে PIN বলবেন না।',
      'Tap for Balance आपका bKash बैलेंस दिखाता है। असली ऐप में इसे दबाएं और केवल आधिकारिक bKash स्क्रीन पर PIN डालें। PIN किसी को न बताएं।'
    ));
    showToast(t('Tap for Balance checks your bKash balance safely.', 'Tap for Balance নিরাপদে bKash ব্যালেন্স দেখায়।', 'Tap for Balance सुरक्षित रूप से bKash बैलेंस दिखाता है।'), 'info');
  };

  const explainMenuItem = (item) => {
    speak(`${item.label}. ${item.explain}`);
    if (['send', 'recharge', 'bill', 'savings', 'profile'].includes(item.step)) {
      setStep(item.step);
      return;
    }
    showToast(`${item.label} - practice explanation`, 'info');
  };

  const renderFeatureGuide = (featureKey) => {
    const feature = FEATURE_GUIDES[featureKey];
    if (!feature) return null;

    return (
      <PhoneFrame>
        <BkashHeader title={feature.title} onBack={back} right={feature.icon}/>
        <div className="bkash-screen-body">
          <div className="bkash-info-strip" style={{ color: feature.accent }}>
            <ShieldCheck size={24}/>
            <span>{feature.note}</span>
          </div>

          <section className="bkash-card">
            <div className="bkash-person-row">
              <div className="bkash-avatar" style={{ color: feature.accent }}>{feature.icon}</div>
              <div>
                <strong>{feature.title} Practice</strong>
                <p>No real transaction will happen here.</p>
              </div>
            </div>
            <div className="bkash-amount-grid">
              {feature.fields.map((field) => (
                <div key={field.label}>
                  <span>{field.label}</span>
                  <strong>{featureKey === 'profile' && field.label === 'Name' ? displayName : field.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="bkash-card">
            <p className="bkash-section-title">Learning steps</p>
            <div className="bkash-contact-list" style={{ flexDirection: 'column' }}>
              {feature.steps.map((item, index) => (
                <button
                  key={item}
                  className="bkash-contact selected"
                  onClick={() => speak(`${index + 1}. ${item}`)}
                  style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  <span className="bkash-menu-icon pink" style={{ width: 34, height: 34 }}>{index + 1}</span>
                  <strong>{item}</strong>
                </button>
              ))}
            </div>
          </section>

          <button
            className="bkash-primary-action"
            onClick={() => {
              showToast(`${feature.title} practice completed.`, 'success');
              speak(`${feature.title} practice completed safely.`);
              setStep('home');
            }}
          >
            Finish Practice <CheckCircle2 size={22}/>
          </button>
        </div>
      </PhoneFrame>
    );
  };

  if (step === 'done') {
    return (
      <PhoneFrame>
        <BkashHeader title="Transfer Complete" onBack={() => setStep('home')} right={<CheckCircle2 size={28}/>}/>
        <div className="bkash-success">
          <div className="bkash-success-icon">
            <CheckCircle2 size={78}/>
          </div>
          <h2>{t('Transfer Complete', 'টাকা পাঠানো সম্পন্ন')}</h2>
          <p>{recipientName || recipient}</p>
          <strong>Tk {amount}</strong>
          <span>{guardianApproved ? t('Approved by your guardian · Practice only', 'আপনার গার্ডিয়ান অনুমোদিত · শুধু অনুশীলন') : t('Practice only — no real money moved', 'শুধু অনুশীলন — আসল টাকা যায়নি')}</span>
          <button className="bkash-primary-action" onClick={() => setStep('home')}>
            Back to Home <ArrowRight size={22}/>
          </button>
        </div>
      </PhoneFrame>
    );
  }

  if (step === 'confirm') {
    return (
      <PhoneFrame>
        <BkashHeader title="Send Money" onBack={handleEditFromSafetyPanel} right={<ShieldCheck size={28}/>}/>
        <div className="bkash-screen-body">
          <div className="bkash-review-card">
            <p className="bkash-section-title">To</p>
            <div className="bkash-person-row">
              <div className="bkash-avatar"><UserCircle size={42}/></div>
              <div>
                <strong>{recipientName || 'Selected Recipient'}</strong>
                <p>{recipient}</p>
              </div>
            </div>
            <div className="bkash-amount-grid">
              <div>
                <span>Amount</span>
                <strong>Tk {amount}</strong>
              </div>
              <div>
                <span>Charge</span>
                <strong>Tk 0.00</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>Tk {amount}</strong>
              </div>
            </div>
            <div className="bkash-pin-row">
              <Lock size={20}/>
              <span>•••••</span>
              <ArrowRight size={24}/>
            </div>
          </div>
        </div>
        <GuidiaSafetyPanel
          open={showSafetyPanel}
          actionType="bkash_send_money"
          title={t('Review before you send', 'পাঠানোর আগে যাচাই করুন')}
          what={t('Send money via bKash', 'bKash এর মাধ্যমে টাকা পাঠানো')}
          who={recipientName || recipient}
          amountOrData={`Tk ${amount}`}
          consequence={t(
            'In the real app, sent money usually cannot be taken back. Here it is practice money only.',
            'আসল অ্যাপে পাঠানো টাকা সাধারণত ফেরত আনা যায় না। এখানে শুধু অনুশীলনের টাকা।'
          )}
          onProceed={handleGuardianApprove}
          onEdit={handleEditFromSafetyPanel}
          onRequestHelp={handleHelpFromSafetyPanel}
        />
      </PhoneFrame>
    );
  }

  if (step === 'send') {
    return (
      <PhoneFrame>
        <BkashHeader title="Send Money" onBack={back} right={<ShieldCheck size={28}/>}/>
        <div className="bkash-screen-body">
          <div className="bkash-info-strip">
            <ShieldCheck size={24}/>
            <span>{t('Check the number twice before sending money.', 'টাকা পাঠানোর আগে নম্বর দুইবার যাচাই করুন।')}</span>
          </div>

          <section className="bkash-card">
            <p className="bkash-section-title">Saved Contacts</p>
            <div className="bkash-contact-list">
              {SAVED_CONTACTS.map((contact) => (
                <button
                  key={contact.id}
                  className={`bkash-contact ${recipient === contact.phone ? 'selected' : ''}`}
                  onClick={() => chooseContact(contact)}
                >
                  <UserCircle size={42}/>
                  <strong>{contact.name}</strong>
                  <span>{contact.detail}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bkash-card">
            <label className="bkash-label" htmlFor="bkash-number">Mobile Number</label>
            <input
              id="bkash-number"
              className="bkash-input"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value); setRecipientName(''); }}
            />
          </section>

          <section className="bkash-card">
            <label className="bkash-label" htmlFor="bkash-amount">Amount</label>
            <div className="bkash-money-input">
              <span>Tk</span>
              <input
                id="bkash-amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <ArrowRight size={28}/>
            </div>
          </section>

          <button className="bkash-primary-action" onClick={handleSend} disabled={!recipient || !amount}>
            Next <ArrowRight size={22}/>
          </button>
        </div>
      </PhoneFrame>
    );
  }

  if (['recharge', 'bill', 'savings', 'profile'].includes(step)) {
    return renderFeatureGuide(step);
  }

  return (
    <PhoneFrame>
      <div className="bkash-home-header">
        <div className="bkash-home-top">
          <button className="bkash-back-btn" onClick={onClose} aria-label="Close bKash practice">
            <ArrowLeft size={26}/>
          </button>
          <button className="bkash-profile" onClick={() => setStep('profile')} style={{ border: 0, textAlign: 'left' }}>
            <div className="bkash-profile-pic"><UserCircle size={42}/></div>
            <div>
              <strong>{displayName}</strong>
              <span onClick={(event) => { event.stopPropagation(); explainBalance(); }}>Tap for Balance</span>
            </div>
          </button>
          <Bell size={27}/>
        </div>
        <div className="bkash-hills" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div className="bkash-practice-strip">
        {t('Practice mode. No real money will move.', 'অনুশীলন মোড। আসল টাকা যাবে না।')}
      </div>

      <div className="bkash-pin-warning">
        <strong>{t('Safety notice', 'নিরাপত্তা সতর্কতা', 'सुरक्षा सूचना')}</strong>
        <span>{t('Never share your 5-digit PIN with anyone', 'আপনার ৫-সংখ্যার PIN কখনো কারও সাথে শেয়ার করবেন না', 'अपना 5 अंकों का PIN कभी किसी के साथ साझा न करें')}</span>
      </div>

      <div className="bkash-screen-body bkash-home-body">
        <section className="bkash-menu-card">
          <div className="bkash-menu-grid">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.label}
                className="bkash-menu-item"
                onClick={() => explainMenuItem(item)}
              >
                <span className={`bkash-menu-icon ${item.tone}`}>{item.icon}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </div>
          <button className="bkash-close-menu">Close ^</button>
        </section>

        <section className="bkash-ad-banner">
          <div>
            <strong>Learn first. Pay safely.</strong>
            <span>Practice every bKash option with voice help.</span>
          </div>
          <Gift size={42}/>
        </section>

        <section className="bkash-transactions-card">
          <div className="bkash-card-heading">
            <strong>Transactions</strong>
            <button>See All</button>
          </div>
          {TRANSACTIONS.map((tx) => (
            <div className="bkash-transaction" key={`${tx.label}-${tx.detail}`}>
              <div className="bkash-transaction-icon"><Clock size={24}/></div>
              <div>
                <strong>{tx.label}</strong>
                <p>{tx.detail}</p>
              </div>
              <span className={tx.type}>{tx.amount}</span>
            </div>
          ))}
        </section>
      </div>

      <nav className="bkash-bottom-nav">
        <button className="active"><Home size={27}/><span>Home</span></button>
        <button onClick={() => { speak('My bKash shows your profile, saved services, and account options.'); setStep('profile'); }}><UserCog size={27}/><span>My bKash</span></button>
        <button className="bkash-scan"><CreditCard size={30}/></button>
        <button><Bell size={27}/><span>Inbox</span></button>
      </nav>
    </PhoneFrame>
  );
}
