import { useState } from 'react';
import { Calendar, CalendarCheck, Check, MapPin, Pill, Search, ShieldAlert, Star, Stethoscope, Video, PhoneOff, Mic, Trash2 } from 'lucide-react';
import { AppBar, Screen, StatusBar, T, Tap, money, useSim, useStack } from './kit/SimKit';

// Practo (India): find a doctor, book a clinic visit, consult online on
// video, and reschedule or cancel an appointment. Pretend health bookings.

const PURPLE = '#28328c';
const DOCTORS = [
  { id: 'mehta', name: 'Dr. Anjali Mehta', spec: T('General physician', 'সাধারণ চিকিৎসক', 'जनरल फ़िज़िशियन', 'Bác sĩ đa khoa'), years: 18, fee: 500, rating: 96, clinic: 'Care Clinic, Lajpat Nagar' },
  { id: 'rao', name: 'Dr. Vikram Rao', spec: T('General physician', 'সাধারণ চিকিৎসক', 'जनरल फ़िज़िशियन', 'Bác sĩ đa khoa'), years: 11, fee: 400, rating: 92, clinic: 'HealthFirst, Saket' },
];
const SLOTS = ['10:00 AM', '10:30 AM', '11:00 AM', '4:00 PM', '4:30 PM'];

export default function PractoSim() {
  const { t, language, showToast, emit } = useSim();
  const nav = useStack('home');
  const [appts, setAppts] = useState([]);
  const [slot, setSlot] = useState(null);
  const rs = (n) => money(n, 'INR', language);
  const doc = DOCTORS.find((d) => d.id === nav.params.id);

  if (nav.screen === 'results') {
    return (
      <div className="pr">
        <StatusBar dark bg={PURPLE} />
        <AppBar bg={PURPLE} onBack={nav.back} title={t('General physicians near you', 'কাছাকাছি সাধারণ চিকিৎসক', 'पास के जनरल फ़िज़िशियन', 'Bác sĩ đa khoa gần bạn')} />
        <div className="sim-scroll" style={{ background: '#f5f6fa' }}>
          {DOCTORS.map((d) => (
            <Tap key={d.id} className="pr-card" act={`open_doctor open_doctor_${d.id}`} onClick={() => nav.push('doctor', { id: d.id })}>
              <span className="sim-avatar" style={{ background: '#5c6bc0' }}><Stethoscope size={22} /></span>
              <span className="sim-row-main" style={{ gap: 2 }}>
                <span className="sim-row-title">{d.name}</span>
                <span className="sim-row-sub">{t(...d.spec)} · {d.years} {t('years experience', 'বছরের অভিজ্ঞতা', 'साल का अनुभव', 'năm kinh nghiệm')}</span>
                <span className="sim-row-sub"><MapPin size={12} /> {d.clinic}</span>
                <span className="pr-meta"><span className="pr-rating"><Star size={12} fill="#fff" /> {d.rating}%</span> {rs(d.fee)} {t('consultation fee', 'পরামর্শের ফি', 'सलाह शुल्क', 'phí khám')}</span>
              </span>
            </Tap>
          ))}
        </div>
      </div>
    );
  }

  if (nav.screen === 'doctor' && doc) {
    return (
      <div className="pr" style={{ background: '#fff' }}>
        <StatusBar dark bg={PURPLE} />
        <AppBar bg={PURPLE} onBack={nav.back} title={doc.name} />
        <div className="sim-scroll sim-pad sim-stack">
          <p className="sim-row-sub" style={{ whiteSpace: 'normal' }}>{t(...doc.spec)} · {doc.years} {t('years experience', 'বছরের অভিজ্ঞতা', 'साल का अनुभव', 'năm kinh nghiệm')} · {doc.clinic}</p>
          <p className="sim-label">{t('Choose a time tomorrow', 'আগামীকালের সময় বেছে নিন', 'कल का समय चुनें', 'Chọn giờ ngày mai')}</p>
          <div className="pr-slots">
            {SLOTS.map((s) => <Tap key={s} className="pr-slot" aria-pressed={slot === s} act="choose_slot" onClick={() => setSlot(s)}>{s}</Tap>)}
          </div>
          <Tap className="pr-btn" act="book_visit" disabled={!slot} onClick={() => nav.push('confirm', { id: doc.id })} explain={T('Book Clinic Visit: reserves the time you chose.', 'বুক ক্লিনিক ভিজিট: বেছে নেওয়া সময়টা রাখে।', 'बुक क्लिनिक विज़िट: चुना हुआ समय बुक करता है।', 'Đặt lịch khám: giữ giờ bạn đã chọn.')}><CalendarCheck size={18} /> {t('Book Clinic Visit', 'ক্লিনিক ভিজিট বুক করুন', 'क्लिनिक विज़िट बुक करें', 'Đặt lịch khám')}</Tap>
        </div>
      </div>
    );
  }

  if (nav.screen === 'confirm' && doc) {
    return (
      <div className="pr" style={{ background: '#fff' }}>
        <StatusBar dark bg={PURPLE} />
        <AppBar bg={PURPLE} onBack={nav.back} title={t('Confirm appointment', 'অ্যাপয়েন্টমেন্ট নিশ্চিত করুন', 'अपॉइंटमेंट पक्की करें', 'Xác nhận lịch hẹn')} />
        <div className="sim-scroll sim-pad sim-stack">
          <div className="mk-receipt" style={{ margin: 0 }}>
            <div className="mk-receipt-row"><span>{t('Doctor', 'ডাক্তার', 'डॉक्टर', 'Bác sĩ')}</span><strong>{doc.name}</strong></div>
            <div className="mk-receipt-row"><span>{t('Time', 'সময়', 'समय', 'Giờ')}</span><strong>{t('Tomorrow', 'আগামীকাল', 'कल', 'Ngày mai')}, {slot}</strong></div>
            <div className="mk-receipt-row"><span>{t('Pay at clinic', 'ক্লিনিকে দিন', 'क्लिनिक पर दें', 'Trả tại phòng khám')}</span><strong>{rs(doc.fee)}</strong></div>
          </div>
          <label className="sim-label" htmlFor="pr-phone">{t('Mobile number for SMS', 'এসএমএসের জন্য মোবাইল নম্বর', 'एसएमएस के लिए मोबाइल नंबर', 'Số điện thoại nhận SMS')}</label>
          <input id="pr-phone" className="sim-field" defaultValue="98110 00000" inputMode="tel" />
          <Tap className="pr-btn" act="confirm_booking" onClick={() => { setAppts((a) => [...a, { id: `A${Date.now()}`, doc: doc.id, slot, status: 'booked' }]); nav.replace('booked', { id: doc.id }); }}>{t('Confirm', 'নিশ্চিত করুন', 'पक्का करें', 'Xác nhận')}</Tap>
        </div>
      </div>
    );
  }

  if (nav.screen === 'booked') {
    return (
      <div className="pr" style={{ background: '#fff' }}>
        <StatusBar dark bg={PURPLE} />
        <div className="sim-success">
          <span className="sim-success-icon" style={{ background: '#1e8e3e' }}><Check size={40} strokeWidth={3} /></span>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{t('Appointment booked', 'অ্যাপয়েন্টমেন্ট হয়েছে', 'अपॉइंटमेंट बुक हो गई', 'Đã đặt lịch')}</p>
          <p style={{ margin: 0, color: '#555' }}>{t('Details are on their way by SMS (practice).', 'তথ্য এসএমএসে আসছে (অনুশীলন)।', 'जानकारी एसएमएस से आ रही है (अभ्यास)।', 'Thông tin đang gửi qua SMS (luyện tập).')}</p>
          <Tap className="pr-btn" style={{ maxWidth: 260 }} act="open_appointments" onClick={() => { nav.reset('home'); nav.push('appointments'); }}>{t('My appointments', 'আমার অ্যাপয়েন্টমেন্ট', 'मेरी अपॉइंटमेंट', 'Lịch hẹn của tôi')}</Tap>
        </div>
      </div>
    );
  }

  if (nav.screen === 'appointments') {
    return (
      <div className="pr" style={{ background: '#fff' }}>
        <StatusBar dark bg={PURPLE} />
        <AppBar bg={PURPLE} onBack={nav.back} title={t('Appointments', 'অ্যাপয়েন্টমেন্ট', 'अपॉइंटमेंट', 'Lịch hẹn')} />
        <div className="sim-scroll sim-pad sim-stack">
          {[...appts, ...(appts.length ? [] : [{ id: 'demo', doc: 'rao', slot: '4:30 PM', status: 'booked' }])].map((a) => { const d = DOCTORS.find((x) => x.id === a.doc); return (
            <div key={a.id} className="pr-appt">
              <p className="sim-row-title" style={{ margin: 0 }}>{d.name}</p>
              <p className="sim-row-sub" style={{ margin: 0 }}>{a.status === 'cancelled' ? t('Cancelled', 'বাতিল', 'रद्द', 'Đã hủy') : `${t('Tomorrow', 'আগামীকাল', 'कल', 'Ngày mai')}, ${a.slot}`}</p>
              {a.status !== 'cancelled' && (
                <div className="pr-appt-btns">
                  <Tap className="pr-outline" act="reschedule" onClick={() => { setAppts((all) => (all.length ? all : [a]).map((x) => (x.id === a.id ? { ...x, slot: '11:00 AM' } : x))); showToast(t('Moved to tomorrow 11:00 AM.', 'আগামীকাল সকাল ১১টায় সরানো হয়েছে।', 'कल सुबह 11 बजे पर कर दिया।', 'Đã dời sang 11 giờ sáng mai.')); }}
                    explain={T('Reschedule: move it to another time.', 'সময় বদলান: অন্য সময়ে সরান।', 'समय बदलें: दूसरे समय पर करें।', 'Đổi lịch: dời sang giờ khác.')}><Calendar size={16} /> {t('Reschedule', 'সময় বদলান', 'समय बदलें', 'Đổi lịch')}</Tap>
                  <Tap className="pr-outline pr-red" act="cancel_appointment" onClick={() => { setAppts((all) => (all.length ? all : [a]).map((x) => (x.id === a.id ? { ...x, status: 'cancelled' } : x))); showToast(t('Cancelled. The time is free for another patient.', 'বাতিল হয়েছে। সময়টা অন্য রোগী পাবেন।', 'रद्द हो गया। समय दूसरे मरीज़ को मिलेगा।', 'Đã hủy. Giờ khám dành cho bệnh nhân khác.')); }}><Trash2 size={16} /> {t('Cancel', 'বাতিল', 'रद्द करें', 'Hủy')}</Tap>
                </div>
              )}
            </div>
          ); })}
        </div>
      </div>
    );
  }

  if (nav.screen === 'consult') return <Consult t={t} nav={nav} rs={rs} />;

  return (
    <div className="pr">
      <Screen nav={nav}>
        <StatusBar dark bg={PURPLE} />
        <div className="pr-top">
          <span className="pr-logo">practo</span>
          <label className="pr-search"><Search size={18} /><input data-act="search_doctor" placeholder={t('Search doctors, clinics…', 'ডাক্তার, ক্লিনিক খুঁজুন…', 'डॉक्टर, क्लिनिक खोजें…', 'Tìm bác sĩ, phòng khám…')} onKeyDown={(e) => { if (e.key === 'Enter') { emit('search_doctor'); nav.push('results'); } }} /></label>
        </div>
        <div className="sim-scroll" style={{ background: '#f5f6fa' }}>
          <div className="pr-grid">
            <Tap className="pr-tile" act="find_doctor" onClick={() => nav.push('results')} explain={T('Book a clinic visit with a doctor near you.', 'কাছের ডাক্তারের কাছে ক্লিনিক ভিজিট বুক করুন।', 'पास के डॉक्टर के साथ क्लिनिक विज़िट बुक करें।', 'Đặt lịch khám với bác sĩ gần bạn.')}><Stethoscope size={26} /><span>{t('Book Clinic Visit', 'ক্লিনিক ভিজিট বুক', 'क्लिनिक विज़िट बुक', 'Đặt lịch khám')}</span></Tap>
            <Tap className="pr-tile" act="consult_online" onClick={() => nav.push('consult')} explain={T('Talk to a doctor on video from home.', 'বাড়ি থেকেই ভিডিওতে ডাক্তারের সাথে কথা বলুন।', 'घर से ही वीडियो पर डॉक्टर से बात करें।', 'Nói chuyện với bác sĩ qua video tại nhà.')}><Video size={26} /><span>{t('Consult online', 'অনলাইনে পরামর্শ', 'ऑनलाइन सलाह', 'Tư vấn trực tuyến')}</span></Tap>
            <Tap className="pr-tile" onClick={() => showToast(t('Order medicines only with a doctor\'s prescription.', 'শুধু ডাক্তারের প্রেসক্রিপশন দিয়েই ওষুধ অর্ডার করুন।', 'दवाइयां सिर्फ़ डॉक्टर के पर्चे से ही ऑर्डर करें।', 'Chỉ đặt thuốc khi có đơn của bác sĩ.'))}><Pill size={26} /><span>{t('Medicines', 'ওষুধ', 'दवाइयां', 'Thuốc')}</span></Tap>
            <Tap className="pr-tile" act="open_appointments" onClick={() => nav.push('appointments')} explain={T('Your appointments: reschedule or cancel.', 'আপনার অ্যাপয়েন্টমেন্ট: সময় বদলান বা বাতিল করুন।', 'आपकी अपॉइंटमेंट: समय बदलें या रद्द करें।', 'Lịch hẹn của bạn: đổi lịch hoặc hủy.')}><CalendarCheck size={26} /><span>{t('Appointments', 'অ্যাপয়েন্টমেন্ট', 'अपॉइंटमेंट', 'Lịch hẹn')}</span></Tap>
          </div>
          <p className="sim-safety" style={{ margin: 16 }}><ShieldAlert size={16} />{t('In an emergency, call your local emergency number — don\'t wait for an online booking.', 'জরুরি অবস্থায় এলাকার জরুরি নম্বরে ফোন করুন — অনলাইন বুকিংয়ের অপেক্ষা করবেন না।', 'आपात स्थिति में स्थानीय आपातकालीन नंबर पर फोन करें — ऑनलाइन बुकिंग का इंतज़ार न करें।', 'Khi cấp cứu, gọi số khẩn cấp — đừng chờ đặt lịch trực tuyến.')}</p>
        </div>
      </Screen>
    </div>
  );
}

function Consult({ t, nav, rs }) {
  const [problem, setProblem] = useState(null);
  const [stage, setStage] = useState('pick'); // pick | waiting | call | done
  if (stage === 'call') {
    return (
      <div className="sim-call" style={{ background: 'linear-gradient(180deg,#28328c,#0e1440)' }}>
        <div className="wa-call-top"><span className="sim-avatar lg" style={{ background: '#5c6bc0' }}><Stethoscope size={36} /></span><p className="wa-call-name">Dr. Anjali Mehta</p><p className="wa-call-state">{t('Video consultation', 'ভিডিও পরামর্শ', 'वीडियो सलाह', 'Tư vấn video')}</p></div>
        <div className="sim-call-controls">
          <Tap className="sim-call-btn" onClick={() => {}} label={t('Mute', 'মিউট', 'म्यूट', 'Tắt tiếng')}><Mic size={24} /></Tap>
          <Tap className="sim-call-btn end" act="end_call" onClick={() => setStage('done')} label={t('End', 'শেষ', 'खत्म', 'Kết thúc')}><PhoneOff size={24} /></Tap>
        </div>
      </div>
    );
  }
  return (
    <div className="pr" style={{ background: '#fff' }}>
      <StatusBar dark bg={PURPLE} />
      <AppBar bg={PURPLE} onBack={nav.back} title={t('Consult online', 'অনলাইনে পরামর্শ', 'ऑनलाइन सलाह', 'Tư vấn trực tuyến')} />
      <div className="sim-scroll sim-pad sim-stack">
        {stage === 'pick' && (
          <>
            <p className="sim-label">{t('What do you need help with?', 'কী নিয়ে সাহায্য দরকার?', 'किस बारे में मदद चाहिए?', 'Bạn cần giúp về vấn đề gì?')}</p>
            <div className="pr-slots">
              {[['fever', T('Fever', 'জ্বর', 'बुखार', 'Sốt')], ['bp', T('Blood pressure', 'রক্তচাপ', 'ब्लड प्रेशर', 'Huyết áp')], ['sugar', T('Diabetes', 'ডায়াবেটিস', 'डायबिटीज़', 'Tiểu đường')], ['cough', T('Cough & cold', 'কাশি ও সর্দি', 'खांसी-ज़ुकाम', 'Ho và cảm')]].map(([id, label]) => (
                <Tap key={id} className="pr-slot" aria-pressed={problem === id} act="choose_problem" onClick={() => setProblem(id)}>{t(...label)}</Tap>
              ))}
            </div>
            <p className="sim-safety"><ShieldAlert size={16} />{t('Pay only inside the app. A real doctor never asks for extra money by bank transfer.', 'শুধু অ্যাপের ভেতরে টাকা দিন। আসল ডাক্তার ব্যাংক ট্রান্সফারে বাড়তি টাকা চান না।', 'भुगतान सिर्फ़ ऐप के अंदर करें। असली डॉक्टर बैंक ट्रांसफ़र से अलग पैसे नहीं मांगते।', 'Chỉ trả tiền trong ứng dụng. Bác sĩ thật không đòi chuyển khoản thêm.')}</p>
            <Tap className="pr-btn" act="pay_consult" disabled={!problem} onClick={() => setStage('waiting')}>{t(`Pay ${rs(399)} and consult now`, `${rs(399)} দিয়ে এখনই পরামর্শ নিন`, `${rs(399)} देकर अभी सलाह लें`, `Trả ${rs(399)} và tư vấn ngay`)}</Tap>
          </>
        )}
        {stage === 'waiting' && (
          <>
            <p className="sim-row-title">{t('A doctor will call you in about 2 minutes.', 'প্রায় ২ মিনিটের মধ্যে একজন ডাক্তার ফোন করবেন।', 'लगभग 2 मिनट में डॉक्टर फोन करेंगे।', 'Bác sĩ sẽ gọi cho bạn trong khoảng 2 phút.')}</p>
            <p style={{ margin: 0, color: '#555' }}>{t('Sit somewhere quiet with good light, and keep your medicines nearby.', 'আলো আছে এমন শান্ত জায়গায় বসুন, ওষুধ হাতের কাছে রাখুন।', 'अच्छी रोशनी वाली शांत जगह बैठें, दवाइयां पास रखें।', 'Ngồi nơi yên tĩnh, đủ sáng, để thuốc gần bên.')}</p>
            <Tap className="pr-btn" act="join_call" onClick={() => setStage('call')}><Video size={18} /> {t('Join the call', 'কলে যোগ দিন', 'कॉल में जुड़ें', 'Vào cuộc gọi')}</Tap>
          </>
        )}
        {stage === 'done' && <p className="sim-safety"><Check size={16} />{t('Consultation finished. Your prescription is in "Consultations".', 'পরামর্শ শেষ। আপনার প্রেসক্রিপশন "Consultations"-এ আছে।', 'सलाह पूरी हुई। आपका पर्चा "Consultations" में है।', 'Đã tư vấn xong. Đơn thuốc nằm trong mục "Tư vấn".')}</p>}
      </div>
    </div>
  );
}
