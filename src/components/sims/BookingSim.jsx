import { useState } from 'react';
import { BedDouble, Calendar, Check, Heart, MapPin, MessageSquare, Search, ShieldAlert, ShieldCheck, User, Users } from 'lucide-react';
import { AppBar, Photo, Screen, StatusBar, T, Tap, money, useSim, useStack } from './kit/SimKit';

// Booking.com: search, results with review scores and free cancellation,
// a property page, reserve, your bookings, free cancellation, and a fake
// "pay again" message from a scammer posing as the hotel.

const NAVY = '#003b95';
const HOTELS = [
  { id: 'lake', name: 'Lakeview Residency', area: T('2 km from centre', 'কেন্দ্র থেকে ২ কিমি', 'केंद्र से 2 किमी', 'Cách trung tâm 2 km'), score: 8.7, word: T('Excellent', 'চমৎকার', 'बहुत बढ़िया', 'Tuyệt vời'), reviews: 1843, price: 58, free: true, kind: 'hotel' },
  { id: 'garden', name: 'Garden Inn', area: T('Near the station', 'স্টেশনের কাছে', 'स्टेशन के पास', 'Gần nhà ga'), score: 7.9, word: T('Good', 'ভালো', 'अच्छा', 'Tốt'), reviews: 612, price: 41, free: true, kind: 'building' },
  { id: 'cheap', name: 'Luxury Palace (best price!!)', area: T('Address not shown', 'ঠিকানা দেওয়া নেই', 'पता नहीं दिखाया', 'Không hiện địa chỉ'), score: 5.2, word: T('Review score low', 'রিভিউ স্কোর কম', 'रिव्यू स्कोर कम', 'Điểm thấp'), reviews: 9, price: 12, free: false, kind: 'palace' },
];

export default function BookingSim() {
  const { t, language, showToast, emit } = useSim();
  const nav = useStack('search');
  const [tab, setTab] = useState('search');
  const [city, setCity] = useState('');
  const [nights, setNights] = useState(2);
  const [bookings, setBookings] = useState([]);
  const [report, setReport] = useState(false);
  const usd = (n) => money(n, 'USD', language);
  const hotel = HOTELS.find((h) => h.id === nav.params.id);

  const tabs = (
    <nav className="bc-nav">
      {[['search', Search, T('Search', 'সার্চ', 'सर्च', 'Tìm kiếm')], ['saved', Heart, T('Saved', 'সেভ করা', 'सेव किए', 'Đã lưu')], ['bookings', BedDouble, T('Bookings', 'বুকিং', 'बुकिंग', 'Đặt chỗ')], ['inbox', MessageSquare, T('Messages', 'মেসেজ', 'मैसेज', 'Tin nhắn')]].map(([id, Icon, label]) => (
        <Tap key={id} className="bc-nav-item" aria-selected={tab === id} act={`tab_${id} ${id === 'bookings' ? 'open_bookings' : id === 'inbox' ? 'open_messages' : ''}`.trim()} onClick={() => { setTab(id); nav.reset('search'); }}><Icon size={21} />{t(...label)}</Tap>
      ))}
    </nav>
  );

  if (nav.screen === 'results') {
    return (
      <div className="bc">
        <StatusBar dark bg={NAVY} />
        <AppBar bg={NAVY} onBack={nav.back} title={city || 'Kolkata'} subtitle={t(`${nights} nights · 2 adults`, `${nights} রাত · ২ জন`, `${nights} रातें · 2 वयस्क`, `${nights} đêm · 2 người lớn`)} />
        <div className="sim-scroll" style={{ background: '#f2f2f2' }}>
          {HOTELS.map((h) => (
            <Tap key={h.id} className="bc-card" act={`open_hotel open_hotel_${h.id}`} onClick={() => nav.push('hotel', { id: h.id })}>
              <Photo kind={h.kind} className="bc-img" size={40} />
              <span className="sim-row-main" style={{ gap: 3 }}>
                <span className="bc-name">{h.name}</span>
                <span className="bc-score"><b data-low={h.score < 7}>{h.score}</b> {t(...h.word)} · {h.reviews} {t('reviews', 'রিভিউ', 'रिव्यू', 'đánh giá')}</span>
                <span className="sim-row-sub"><MapPin size={12} /> {t(...h.area)}</span>
                {h.free ? <span className="bc-free"><Check size={13} /> {t('Free cancellation', 'ফ্রি ক্যানসেলেশন', 'फ़्री कैंसलेशन', 'Miễn phí hủy')}</span> : <span className="bc-nofree">{t('Non-refundable', 'টাকা ফেরত হয় না', 'पैसे वापस नहीं होंगे', 'Không hoàn tiền')}</span>}
                <strong className="bc-price">{usd(h.price * nights)}</strong>
              </span>
            </Tap>
          ))}
        </div>
      </div>
    );
  }

  if (nav.screen === 'hotel' && hotel) {
    return (
      <div className="bc" style={{ background: '#fff' }}>
        <StatusBar dark bg={NAVY} />
        <AppBar bg={NAVY} onBack={nav.back} title={hotel.name} />
        <div className="sim-scroll">
          <Photo kind={hotel.kind} className="bc-hero" size={80} />
          <div className="sim-pad sim-stack">
            <p className="bc-name" style={{ fontSize: 20 }}>{hotel.name}</p>
            <Tap className="bc-score bc-score-big" act="read_reviews" onClick={() => showToast(hotel.score < 7 ? t('Recent guests: "Photos were fake", "Asked us to pay again on WhatsApp".', 'সাম্প্রতিক অতিথি: "ছবিগুলো ভুয়া", "হোয়াটসঅ্যাপে আবার টাকা চেয়েছে"।', 'हाल के मेहमान: "फ़ोटो नकली थीं", "व्हाट्सऐप पर दोबारा पैसे मांगे"।', 'Khách gần đây: "Ảnh là giả", "Đòi trả lại tiền qua WhatsApp".') : t('Recent guests: "Very clean", "Helpful staff", "Quiet at night".', 'সাম্প্রতিক অতিথি: "খুব পরিষ্কার", "কর্মীরা সাহায্য করেন", "রাতে শান্ত"।', 'हाल के मेहमान: "बहुत साफ़", "मददगार स्टाफ़", "रात में शांत"।', 'Khách gần đây: "Rất sạch", "Nhân viên nhiệt tình", "Yên tĩnh".'), 4200)}
              explain={T('Review score: what recent guests thought. 8 or more is usually good.', 'রিভিউ স্কোর: সাম্প্রতিক অতিথিদের মতামত। ৮ বা বেশি সাধারণত ভালো।', 'रिव्यू स्कोर: हाल के मेहमानों की राय। 8 या ज़्यादा आमतौर पर अच्छा।', 'Điểm đánh giá: ý kiến khách gần đây. Từ 8 trở lên thường tốt.')}>
              <b data-low={hotel.score < 7}>{hotel.score}</b> {t(...hotel.word)} · {t('read reviews', 'রিভিউ পড়ুন', 'रिव्यू पढ़ें', 'đọc đánh giá')}
            </Tap>
            {hotel.free ? <p className="bc-free"><ShieldCheck size={15} /> {t('Free cancellation until 2 days before check-in', 'চেক-ইনের ২ দিন আগ পর্যন্ত ফ্রি ক্যানসেলেশন', 'चेक-इन से 2 दिन पहले तक फ़्री कैंसलेशन', 'Miễn phí hủy đến 2 ngày trước khi nhận phòng')}</p>
              : <p className="sim-danger-note"><ShieldAlert size={16} />{t('Very low price, few reviews, no address and no free cancellation — be very careful.', 'খুব কম দাম, অল্প রিভিউ, ঠিকানা নেই, ফ্রি ক্যানসেলেশনও নেই — খুব সাবধান।', 'बहुत कम दाम, कम रिव्यू, पता नहीं और फ़्री कैंसलेशन भी नहीं — बहुत सावधान रहें।', 'Giá rất thấp, ít đánh giá, không địa chỉ, không miễn phí hủy — hãy rất cẩn thận.')}</p>}
            <p className="bc-price" style={{ fontSize: 22 }}>{usd(hotel.price * nights)} <small style={{ color: '#595959', fontWeight: 400, fontSize: 13 }}>{t(`for ${nights} nights`, `${nights} রাতের জন্য`, `${nights} रातों के लिए`, `cho ${nights} đêm`)}</small></p>
            <Tap className="bc-btn" act="reserve" onClick={() => nav.push('details', { id: hotel.id })} explain={T('Reserve: books the room. You check everything on the next screen.', 'রিজার্ভ: রুম বুক করে। পরের স্ক্রিনে সব মিলিয়ে নেবেন।', 'रिज़र्व: कमरा बुक करता है। अगली स्क्रीन पर सब जांचेंगे।', 'Đặt: đặt phòng. Bạn kiểm tra mọi thứ ở màn hình tiếp theo.')}>{t('Reserve', 'রিজার্ভ করুন', 'रिज़र्व करें', 'Đặt ngay')}</Tap>
          </div>
        </div>
      </div>
    );
  }

  if (nav.screen === 'details' && hotel) {
    return (
      <div className="bc" style={{ background: '#fff' }}>
        <StatusBar dark bg={NAVY} />
        <AppBar bg={NAVY} onBack={nav.back} title={t('Your details', 'আপনার তথ্য', 'आपकी जानकारी', 'Thông tin của bạn')} />
        <div className="sim-scroll sim-pad sim-stack">
          <label className="sim-label" htmlFor="bc-name">{t('Full name', 'পুরো নাম', 'पूरा नाम', 'Họ và tên')}</label>
          <input id="bc-name" className="sim-field" defaultValue="Amma Rahman" />
          <label className="sim-label" htmlFor="bc-mail">{t('Email', 'ইমেইল', 'ईमेल', 'Email')}</label>
          <input id="bc-mail" className="sim-field" defaultValue="amma@example.com" />
          <div className="mk-receipt" style={{ margin: 0 }}>
            <div className="mk-receipt-row"><span>{t('Hotel', 'হোটেল', 'होटल', 'Khách sạn')}</span><strong>{hotel.name}</strong></div>
            <div className="mk-receipt-row"><span>{t('Nights', 'রাত', 'रातें', 'Số đêm')}</span><strong>{nights}</strong></div>
            <div className="mk-receipt-row mk-total"><span>{t('Total', 'মোট', 'कुल', 'Tổng')}</span><strong>{usd(hotel.price * nights)}</strong></div>
          </div>
          <p className="sim-safety"><ShieldCheck size={16} />{t('Pay only inside Booking.com. Never pay a hotel through a WhatsApp link.', 'শুধু বুকিং ডট কমের ভেতরে টাকা দিন। হোয়াটসঅ্যাপ লিংকে কখনো হোটেলকে টাকা দেবেন না।', 'भुगतान सिर्फ़ Booking.com के अंदर करें। व्हाट्सऐप लिंक से कभी होटल को पैसे न दें।', 'Chỉ trả tiền trong Booking.com. Đừng bao giờ trả khách sạn qua link WhatsApp.')}</p>
          <Tap className="bc-btn" act="complete_booking" onClick={() => { setBookings((b) => [...b, { id: `B${Date.now()}`, hotel: hotel.id, status: 'confirmed' }]); nav.replace('confirmed', { id: hotel.id }); }}>{t('Complete booking', 'বুকিং শেষ করুন', 'बुकिंग पूरी करें', 'Hoàn tất đặt phòng')}</Tap>
        </div>
      </div>
    );
  }

  if (nav.screen === 'confirmed' && hotel) {
    return (
      <div className="bc" style={{ background: '#fff' }}>
        <StatusBar dark bg={NAVY} />
        <div className="sim-success">
          <span className="sim-success-icon" style={{ background: '#008234' }}><Check size={40} strokeWidth={3} /></span>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{t('Your booking is confirmed', 'আপনার বুকিং নিশ্চিত', 'आपकी बुकिंग पक्की है', 'Đặt phòng đã được xác nhận')}</p>
          <p style={{ margin: 0, color: '#595959' }}>{hotel.name} · {t('Practice only', 'শুধু অনুশীলন', 'सिर्फ़ अभ्यास', 'Chỉ luyện tập')}</p>
          <Tap className="bc-btn" style={{ maxWidth: 260 }} act="open_bookings" onClick={() => { setTab('bookings'); nav.reset('search'); }}>{t('See my bookings', 'আমার বুকিং দেখুন', 'मेरी बुकिंग देखें', 'Xem đặt chỗ của tôi')}</Tap>
        </div>
      </div>
    );
  }

  if (nav.screen === 'booking') {
    const b = bookings.find((x) => x.id === nav.params.id) || { hotel: 'lake', status: 'confirmed' };
    const h = HOTELS.find((x) => x.id === b.hotel);
    return (
      <div className="bc" style={{ background: '#fff' }}>
        <StatusBar dark bg={NAVY} />
        <AppBar bg={NAVY} onBack={nav.back} title={h.name} />
        <div className="sim-scroll sim-pad sim-stack">
          <p className="bc-free"><ShieldCheck size={15} /> {t('Free cancellation until 2 days before check-in', 'চেক-ইনের ২ দিন আগ পর্যন্ত ফ্রি ক্যানসেলেশন', 'चेक-इन से 2 दिन पहले तक फ़्री कैंसलेशन', 'Miễn phí hủy đến 2 ngày trước khi nhận phòng')}</p>
          {b.status === 'cancelled' ? <p className="sim-safety"><Check size={16} />{t('Cancelled free of charge. A confirmation email is on its way.', 'বিনা খরচে বাতিল হয়েছে। নিশ্চিতকরণ ইমেইল আসছে।', 'मुफ़्त में रद्द हो गया। पुष्टि का ईमेल आ रहा है।', 'Đã hủy miễn phí. Email xác nhận đang được gửi.')}</p> : (
            <Tap className="bc-btn bc-danger" act="cancel_booking" onClick={() => { setBookings((all) => all.map((x) => (x.id === b.id ? { ...x, status: 'cancelled' } : x))); showToast(t('Booking cancelled — no charge.', 'বুকিং বাতিল — কোনো খরচ নেই।', 'बुकिंग रद्द — कोई शुल्क नहीं।', 'Đã hủy — không mất phí.')); }}
              explain={T('Cancel booking: free before the date shown above.', 'বুকিং বাতিল: ওপরের তারিখের আগে ফ্রি।', 'बुकिंग रद्द: ऊपर दी तारीख से पहले मुफ़्त।', 'Hủy đặt phòng: miễn phí trước ngày ghi ở trên.')}>{t('Cancel booking', 'বুকিং বাতিল করুন', 'बुकिंग रद्द करें', 'Hủy đặt phòng')}</Tap>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bc">
      <Screen nav={nav}>
        <StatusBar dark bg={NAVY} />
        <div className="bc-top"><span className="bc-logo">Booking<span>.com</span></span><User size={22} /></div>
        <div className="sim-scroll" style={{ background: '#fff' }}>
          {tab === 'search' && (
            <div className="bc-form">
              <label className="bc-field"><Search size={18} /><input data-act="enter_city" value={city} onChange={(e) => { if (!city && e.target.value) emit('enter_city'); setCity(e.target.value); }} placeholder={t('Where are you going?', 'কোথায় যাচ্ছেন?', 'कहां जा रहे हैं?', 'Bạn muốn đi đâu?')} /></label>
              <div className="bc-field"><Calendar size={18} />
                <span style={{ flex: 1 }}>{t('Fri 17 Oct', 'শুক্র ১৭ অক্টো', 'शुक्र 17 अक्टू', 'T6 17/10')} — {t(`${nights} nights`, `${nights} রাত`, `${nights} रातें`, `${nights} đêm`)}</span>
                <Tap className="bc-step" act="change_nights" onClick={() => setNights((n) => Math.max(1, n - 1))} label="−">−</Tap><Tap className="bc-step" act="change_nights" onClick={() => setNights((n) => Math.min(14, n + 1))} label="+">+</Tap>
              </div>
              <div className="bc-field"><Users size={18} /><span>{t('2 adults · 1 room', '২ জন · ১টি রুম', '2 वयस्क · 1 कमरा', '2 người lớn · 1 phòng')}</span></div>
              <Tap className="bc-btn" act="run_search" onClick={() => nav.push('results')} explain={T('Search: shows places for your city and dates.', 'সার্চ: আপনার শহর ও তারিখের জায়গা দেখায়।', 'सर्च: आपके शहर और तारीख़ों की जगहें दिखाता है।', 'Tìm: hiện chỗ ở theo thành phố và ngày.')}>{t('Search', 'সার্চ', 'सर्च', 'Tìm')}</Tap>
            </div>
          )}
          {tab === 'saved' && <p className="sim-pad" style={{ color: '#595959' }}>{t('Tap the heart on a hotel to save it for later.', 'পরে দেখতে হোটেলের হৃদয় চিহ্নে চাপুন।', 'बाद में देखने के लिए होटल के दिल पर टैप करें।', 'Chạm trái tim trên khách sạn để lưu lại.')}</p>}
          {tab === 'bookings' && (
            <div>
              {bookings.length === 0 && <p className="sim-pad" style={{ color: '#595959' }}>{t('Your trips will appear here.', 'আপনার ভ্রমণ এখানে দেখাবে।', 'आपकी यात्राएं यहां दिखेंगी।', 'Chuyến đi của bạn sẽ hiện ở đây.')}</p>}
              {bookings.map((b) => { const h = HOTELS.find((x) => x.id === b.hotel); return (
                <Tap key={b.id} className="sim-row" act="open_booking" onClick={() => nav.push('booking', { id: b.id })}>
                  <Photo kind={h.kind} className="bc-img" style={{ width: 56, height: 56 }} size={26} />
                  <span className="sim-row-main"><span className="sim-row-title">{h.name}</span><span className="sim-row-sub">{b.status === 'cancelled' ? t('Cancelled', 'বাতিল', 'रद्द', 'Đã hủy') : t('Confirmed', 'নিশ্চিত', 'पक्की', 'Đã xác nhận')}</span></span>
                </Tap>
              ); })}
            </div>
          )}
          {tab === 'inbox' && (
            <div className="sim-pad sim-stack">
              <div className="bc-msg">
                <p className="sim-row-title" style={{ margin: 0 }}>“Lakeview Residency Reception” · WhatsApp</p>
                <p style={{ margin: '4px 0 0' }}>{t('Your card payment FAILED. Pay again within 24 hours at bit.ly/lakeview-pay or your booking will be cancelled.', 'আপনার কার্ড পেমেন্ট ব্যর্থ হয়েছে। ২৪ ঘণ্টার মধ্যে bit.ly/lakeview-pay-এ আবার টাকা দিন, নইলে বুকিং বাতিল।', 'आपका कार्ड भुगतान फ़ेल हुआ। 24 घंटे में bit.ly/lakeview-pay पर दोबारा भुगतान करें वरना बुकिंग रद्द।', 'Thanh toán thẻ THẤT BẠI. Trả lại trong 24 giờ tại bit.ly/lakeview-pay nếu không đặt phòng sẽ bị hủy.')}</p>
              </div>
              <p className="sim-danger-note"><ShieldAlert size={16} />{t('Booking.com never asks you to pay through a link on WhatsApp. Check your booking in the app — it says Confirmed.', 'বুকিং ডট কম কখনো হোয়াটসঅ্যাপের লিংকে টাকা চায় না। অ্যাপে বুকিং দেখুন — সেখানে নিশ্চিত লেখা।', 'Booking.com कभी व्हाट्सऐप लिंक से पैसे नहीं मांगता। ऐप में बुकिंग देखें — वहां पक्की लिखा है।', 'Booking.com không bao giờ đòi trả qua link WhatsApp. Xem trong ứng dụng — ghi Đã xác nhận.')}</p>
              {report ? <p className="sim-safety"><Check size={16} />{t('Reported. Thank you — you protected other guests too.', 'রিপোর্ট হয়েছে। ধন্যবাদ — আপনি অন্য অতিথিদেরও রক্ষা করলেন।', 'रिपोर्ट हो गई। धन्यवाद — आपने दूसरे मेहमानों को भी बचाया।', 'Đã báo cáo. Cảm ơn — bạn đã bảo vệ cả khách khác.')}</p>
                : <Tap className="bc-btn bc-danger" act="report_fake_message" onClick={() => setReport(true)}>{t('Report this message', 'মেসেজটি রিপোর্ট করুন', 'इस मैसेज की रिपोर्ट करें', 'Báo cáo tin nhắn này')}</Tap>}
              <Tap className="bc-btn" style={{ background: '#fff', color: NAVY, border: `1.5px solid ${NAVY}` }} act="mistake_pay_link" onClick={() => showToast(t('Stop! That link is a fake payment page. Real payments happen only inside Booking.com.', 'থামুন! লিংকটা ভুয়া পেমেন্ট পেজ। আসল পেমেন্ট শুধু বুকিং ডট কমের ভেতরে।', 'रुकिए! वह लिंक नकली भुगतान पेज है। असली भुगतान सिर्फ़ Booking.com के अंदर होता है।', 'Dừng lại! Đó là trang thanh toán giả. Thanh toán thật chỉ ở trong Booking.com.'), 4600)}>{t('Open the payment link', 'পেমেন্টের লিংক খুলুন', 'भुगतान लिंक खोलें', 'Mở link thanh toán')}</Tap>
            </div>
          )}
        </div>
        {tabs}
      </Screen>
    </div>
  );
}

