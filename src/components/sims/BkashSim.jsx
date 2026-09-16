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
  ReceiptText,
  Send,
  ShieldCheck,
  Smartphone,
  Store,
  UserCircle,
  Users,
  WalletCards,
} from 'lucide-react';
import { useApp } from '../../context/AppStateContext';
import GuidiaSafetyPanel from '../GuidiaSafetyPanel';

const BKASH = '#e2136e';

const MENU_ITEMS = [
  { icon: <Send size={30}/>, label: 'Send Money', step: 'send', tone: 'pink' },
  { icon: <Smartphone size={30}/>, label: 'Mobile Recharge', step: 'recharge', tone: 'green' },
  { icon: <Banknote size={30}/>, label: 'Cash Out', step: 'cashout', tone: 'blue' },
  { icon: <Store size={30}/>, label: 'Make Payment', step: 'pay', tone: 'orange' },
  { icon: <WalletCards size={30}/>, label: 'Add Money', step: 'add', tone: 'purple' },
  { icon: <ReceiptText size={30}/>, label: 'Pay Bill', step: 'bill', tone: 'gray' },
  { icon: <Gift size={30}/>, label: 'Savings', step: 'savings', tone: 'pink' },
  { icon: <Landmark size={30}/>, label: 'Loan', step: 'loan', tone: 'brown' },
  { icon: <Users size={30}/>, label: 'Split Bill', step: 'split', tone: 'teal' },
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
  const { t, speak, showToast } = useApp();
  const [step, setStep] = useState('home');
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [guardianWait, setGuardianWait] = useState(false);
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

  const handleGuardianApprove = () => {
    setShowSafetyPanel(false);
    setGuardianWait(true);
    speak(t('Notifying guardian for approval...', 'গার্ডিয়ানকে অনুমোদনের জন্য জানানো হচ্ছে...'));
    setTimeout(() => {
      setGuardianWait(false);
      setStep('done');
      speak(t('Guardian approved. Transfer successful.', 'গার্ডিয়ান অনুমোদন দিয়েছেন। টাকা পাঠানো সফল হয়েছে।'));
    }, 3000);
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

  if (guardianWait) {
    return (
      <PhoneFrame className="bkash-wait-screen">
        <div className="bkash-wait-card">
          <ShieldCheck size={64}/>
          <h2>{t('Waiting for Guardian', 'গার্ডিয়ানের জন্য অপেক্ষা')}</h2>
          <p>{t('Your guardian is reviewing this transfer.', 'আপনার গার্ডিয়ান এই লেনদেনটি দেখছেন।')}</p>
          <div className="spinner" style={{ width: 44, height: 44, borderWidth: 4 }}/>
        </div>
      </PhoneFrame>
    );
  }

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
          <span>{t('Approved by Guardian', 'গার্ডিয়ান অনুমোদিত')}</span>
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
            'Once your guardian approves, the money leaves your account and cannot be undone.',
            'আপনার গার্ডিয়ান অনুমোদন দিলে টাকা আপনার অ্যাকাউন্ট থেকে চলে যাবে এবং তা ফেরত আনা যাবে না।'
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

  return (
    <PhoneFrame>
      <div className="bkash-home-header">
        <div className="bkash-home-top">
          <button className="bkash-back-btn" onClick={onClose} aria-label="Close bKash practice">
            <ArrowLeft size={26}/>
          </button>
          <div className="bkash-profile">
            <div className="bkash-profile-pic"><UserCircle size={42}/></div>
            <div>
              <strong>Nayeem Raihan</strong>
              <button>Tap for Balance</button>
            </div>
          </div>
          <Bell size={27}/>
        </div>
      </div>

      <div className="bkash-practice-strip">
        {t('Practice mode. No real money will move.', 'অনুশীলন মোড। আসল টাকা যাবে না।')}
      </div>

      <div className="bkash-screen-body bkash-home-body">
        <section className="bkash-menu-card">
          <div className="bkash-menu-grid">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.label}
                className="bkash-menu-item"
                onClick={() => item.step === 'send'
                  ? setStep('send')
                  : showToast(`${item.label} - practice mode`, 'info')}
              >
                <span className={`bkash-menu-icon ${item.tone}`}>{item.icon}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </div>
          <button className="bkash-close-menu">Close ^</button>
        </section>

        <section className="bkash-offers-card">
          <div className="bkash-card-heading">
            <strong>Offer</strong>
            <button>See All</button>
          </div>
          <div className="bkash-offers-row">
            <div className="bkash-offer pink">10% Cash Back<br/><span>Practice Offer</span></div>
            <div className="bkash-offer yellow">Friday Offer<br/><span>Learn safely</span></div>
            <div className="bkash-offer teal">Mobile Bonus<br/><span>No real money</span></div>
          </div>
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
        <button><ReceiptText size={27}/><span>History</span></button>
        <button className="bkash-scan"><CreditCard size={30}/></button>
        <button><Bell size={27}/><span>Inbox</span></button>
      </nav>
    </PhoneFrame>
  );
}
