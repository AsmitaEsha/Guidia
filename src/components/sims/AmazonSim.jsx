import { useState } from 'react';
import { Check, ChevronRight, Home, MapPin, Menu, Package, Search, ShieldAlert, ShoppingCart, Star, Truck, Undo2, User } from 'lucide-react';
import { AppBar, Photo, Screen, StatusBar, T, Tap, money, useSim, useStack } from './kit/SimKit';

// Amazon (India): search, results, product page (rating, seller), cart,
// checkout with cash on delivery, orders, tracking and returns — plus a
// too-cheap fake listing to spot. Pretend shopping only.

const PRODUCTS = [
  { id: 'glasses', name: T('Reading glasses +2.0, pack of 2', 'পড়ার চশমা +২.০, ২টি', 'पढ़ने का चश्मा +2.0, 2 का पैक', 'Kính đọc sách +2.0, bộ 2 chiếc'), price: 499, mrp: 999, rating: 4.3, reviews: 12873, seller: 'Clara Optics', kind: 'glasses' },
  { id: 'fake', name: T('Smartphone Pro Max 256GB — 95% OFF', 'স্মার্টফোন প্রো ম্যাক্স ২৫৬জিবি — ৯৫% ছাড়', 'स्मार्टफोन प्रो मैक्स 256GB — 95% छूट', 'Điện thoại Pro Max 256GB — GIẢM 95%'), price: 3999, mrp: 79999, rating: 2.1, reviews: 14, seller: 'BestDealz4U', kind: 'device', fake: true },
  { id: 'kettle', name: T('Electric kettle 1.5 L', 'ইলেকট্রিক কেটলি ১.৫ লিটার', 'इलेक्ट्रिक केतली 1.5 लीटर', 'Ấm siêu tốc 1,5 lít'), price: 1199, mrp: 1899, rating: 4.4, reviews: 45210, seller: 'Amazon Retail', kind: 'kettle' },
];

export default function AmazonSim() {
  const { t, language, showToast, emit } = useSim();
  const nav = useStack('home');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([{ id: 'O-401', product: 'kettle', status: 2 }]);
  const [pay, setPay] = useState('cod');
  const product = PRODUCTS.find((p) => p.id === nav.params.id);
  const rs = (n) => money(n, 'INR', language);
  const cartTotal = cart.reduce((s, id) => s + PRODUCTS.find((p) => p.id === id).price, 0);
  const header = (
    <div className="az-head">
      <StatusBar dark bg="transparent" />
      <div className="az-search-row">
        {nav.depth > 1 && <Tap className="sim-icon-btn" style={{ color: '#111' }} onClick={nav.back} label={t('Back', 'পেছনে', 'पीछे', 'Quay lại')}>‹</Tap>}
        <label className="az-search">
          <Search size={18} />
          <input data-act="type_search" value={query} placeholder={t('Search Amazon.in', 'Amazon.in-এ খুঁজুন', 'Amazon.in पर खोजें', 'Tìm trên Amazon.in')} onChange={(e) => { if (!query && e.target.value) emit('type_search'); setQuery(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { emit('run_search'); nav.push('results'); } }} />
          <Tap className="az-go" act="run_search" onClick={() => nav.push('results')} label={t('Search', 'খুঁজুন', 'खोजें', 'Tìm')}><Search size={16} /></Tap>
        </label>
      </div>
      <p className="az-deliver"><MapPin size={14} /> {t('Deliver to Amma — Delhi 110001', 'আম্মার কাছে ডেলিভারি — দিল্লি ১১০০০১', 'अम्मा को डिलीवरी — दिल्ली 110001', 'Giao tới Mẹ — Delhi 110001')}</p>
    </div>
  );

  const tabs = (
    <nav className="az-nav">
      <Tap className="az-nav-item" onClick={() => nav.reset('home')}><Home size={22} />{t('Home', 'হোম', 'होम', 'Trang chủ')}</Tap>
      <Tap className="az-nav-item" act="open_orders" onClick={() => nav.push('orders')} explain={T('Your orders: track parcels and return items.', 'আপনার অর্ডার: পার্সেল ট্র্যাক আর জিনিস ফেরত।', 'आपके ऑर्डर: पार्सल ट्रैक करें और सामान लौटाएं।', 'Đơn hàng: theo dõi kiện hàng và trả hàng.')}><User size={20} />{t('You', 'আপনি', 'आप', 'Bạn')}</Tap>
      <Tap className="az-nav-item" act="open_cart" onClick={() => nav.push('cart')} explain={T('Cart: the items you plan to buy. Nothing is paid until you place the order.', 'কার্ট: যা কিনবেন। অর্ডার না দেওয়া পর্যন্ত টাকা যায় না।', 'कार्ट: जो खरीदना है। ऑर्डर देने तक पैसे नहीं जाते।', 'Giỏ hàng: món bạn định mua. Chưa trả tiền cho đến khi đặt hàng.')}><ShoppingCart size={20} /><b>{cart.length}</b>{t('Cart', 'কার্ট', 'कार्ट', 'Giỏ')}</Tap>
      <Tap className="az-nav-item" onClick={() => showToast(t('Menu: categories, settings and customer service.', 'মেনু: ক্যাটাগরি, সেটিংস ও কাস্টমার সার্ভিস।', 'मेनू: श्रेणियां, सेटिंग्स और ग्राहक सेवा।', 'Menu: danh mục, cài đặt và chăm sóc khách hàng.'))}><Menu size={20} />{t('Menu', 'মেনু', 'मेनू', 'Menu')}</Tap>
    </nav>
  );

  return (
    <div className="az" style={{ '--accent': '#FF9900' }}>
      {nav.screen === 'home' && (
        <Screen nav={nav}>
          {header}
          <div className="sim-scroll">
            <div className="az-banner">{t('Great Indian Festival · up to 60% off', 'দারুণ উৎসব · ৬০% পর্যন্ত ছাড়', 'ग्रेट इंडियन फ़ेस्टिवल · 60% तक छूट', 'Lễ hội mua sắm · giảm đến 60%')}</div>
            <p className="az-h">{t('Picked for you', 'আপনার জন্য বাছাই', 'आपके लिए चुना', 'Gợi ý cho bạn')}</p>
            <div className="az-grid">
              {PRODUCTS.map((p) => (
                <Tap key={p.id} className="az-card" act={`open_product open_product_${p.id}`} onClick={() => nav.push('product', { id: p.id })}>
                  <Photo kind={p.kind} className="az-card-img" size={48} /><span className="az-card-name">{t(...p.name)}</span><strong>{rs(p.price)}</strong>
                </Tap>
              ))}
            </div>
          </div>
          {tabs}
        </Screen>
      )}

      {nav.screen === 'results' && (
        <Screen nav={nav}>
          {header}
          <div className="sim-scroll">
            <p className="az-h">{t('Results', 'ফলাফল', 'नतीजे', 'Kết quả')}{query ? ` · "${query}"` : ''}</p>
            {PRODUCTS.map((p) => (
              <Tap key={p.id} className="az-result" act={`open_product open_product_${p.id}`} onClick={() => nav.push('product', { id: p.id })}>
                <Photo kind={p.kind} className="az-card-img" size={40} />
                <span className="sim-row-main"><span className="az-card-name">{t(...p.name)}</span><span className="az-stars">{'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))} <small>{p.reviews.toLocaleString()}</small></span><strong>{rs(p.price)} <s>{rs(p.mrp)}</s></strong></span>
              </Tap>
            ))}
          </div>
          {tabs}
        </Screen>
      )}

      {nav.screen === 'product' && product && (
        <Screen nav={nav} style={{ background: '#fff' }}>
          {header}
          <div className="sim-scroll sim-pad sim-stack">
            <Tap className="az-seller" act="check_seller" onClick={() => showToast(product.fake ? t('New seller, 14 ratings, mostly 1 star. Avoid.', 'নতুন বিক্রেতা, ১৪টি রেটিং, বেশিরভাগ ১ তারা। এড়িয়ে চলুন।', 'नया विक्रेता, 14 रेटिंग, ज़्यादातर 1 स्टार। बचें।', 'Người bán mới, 14 đánh giá, chủ yếu 1 sao. Tránh xa.') : t('Trusted seller with thousands of good ratings.', 'হাজার হাজার ভালো রেটিং পাওয়া বিশ্বস্ত বিক্রেতা।', 'हज़ारों अच्छी रेटिंग वाला भरोसेमंद विक्रेता।', 'Người bán uy tín với hàng nghìn đánh giá tốt.'), 3800)}
              explain={T('The seller: check their rating before you buy.', 'বিক্রেতা: কেনার আগে তার রেটিং দেখুন।', 'विक्रेता: खरीदने से पहले रेटिंग देखें।', 'Người bán: xem đánh giá trước khi mua.')}>{t('Visit the store', 'স্টোরে যান', 'स्टोर देखें', 'Xem cửa hàng')}: {product.seller}</Tap>
            <p className="az-title">{t(...product.name)}</p>
            <Tap className="az-stars az-rating" act="read_reviews" onClick={() => showToast(product.fake ? t('Reviews: "Never arrived", "Fake product", "Seller disappeared".', 'রিভিউ: "আসেনি", "ভুয়া পণ্য", "বিক্রেতা উধাও"।', 'रिव्यू: "पहुंचा ही नहीं", "नकली सामान", "विक्रेता गायब"।', 'Đánh giá: "Không nhận được", "Hàng giả", "Người bán biến mất".') : t('Reviews: "Good quality", "Arrived on time", "Clear vision".', 'রিভিউ: "ভালো মান", "সময়মতো এসেছে", "পরিষ্কার দেখা যায়"।', 'रिव्यू: "अच्छी क्वालिटी", "समय पर आया", "साफ़ दिखता है"।', 'Đánh giá: "Chất lượng tốt", "Giao đúng hẹn", "Nhìn rõ".'), 4200)}>
              <Star size={16} fill="#ffa41c" color="#ffa41c" /> {product.rating} · {product.reviews.toLocaleString()} {t('ratings', 'রেটিং', 'रेटिंग', 'đánh giá')}
            </Tap>
            <Photo kind={product.kind} className="az-hero" size={96} />
            <p className="az-price"><span>-{Math.round((1 - product.price / product.mrp) * 100)}%</span> {rs(product.price)} <s>{rs(product.mrp)}</s></p>
            {product.fake && <p className="sim-danger-note"><ShieldAlert size={16} />{t('95% off, a new seller and 2-star reviews: this is almost certainly a fake listing. Don\'t buy it.', '৯৫% ছাড়, নতুন বিক্রেতা আর ২ তারার রিভিউ: এটা প্রায় নিশ্চিতভাবেই ভুয়া। কিনবেন না।', '95% छूट, नया विक्रेता और 2 स्टार रिव्यू: यह लगभग पक्का नकली है। न खरीदें।', 'Giảm 95%, người bán mới và đánh giá 2 sao: gần như chắc chắn là giả. Đừng mua.')}</p>}
            <p className="az-cod"><Truck size={16} /> {t('Free delivery Friday · Cash on Delivery available', 'শুক্রবার ফ্রি ডেলিভারি · ক্যাশ অন ডেলিভারি আছে', 'शुक्रवार मुफ़्त डिलीवरी · कैश ऑन डिलीवरी उपलब्ध', 'Giao miễn phí thứ Sáu · Có thanh toán khi nhận hàng')}</p>
            <Tap className="az-btn az-cart" act="add_to_cart" onClick={() => { setCart((c) => [...c, product.id]); showToast(t('Added to Cart', 'কার্টে যোগ হয়েছে', 'कार्ट में जुड़ गया', 'Đã thêm vào giỏ')); if (product.fake) showToast(t('Added — but this listing looks fake. Remove it from your cart.', 'যোগ হয়েছে — তবে এটা ভুয়া মনে হচ্ছে। কার্ট থেকে সরিয়ে দিন।', 'जुड़ गया — पर यह नकली लगता है। कार्ट से हटा दें।', 'Đã thêm — nhưng tin này có vẻ giả. Hãy bỏ khỏi giỏ.'), 4200); }}
              explain={T('Add to Cart: puts it in your basket. Nothing is paid yet.', 'অ্যাড টু কার্ট: ঝুড়িতে রাখে। এখনো টাকা যায় না।', 'ऐड टू कार्ट: टोकरी में डालता है। अभी पैसे नहीं जाते।', 'Thêm vào giỏ: bỏ vào giỏ. Chưa trả tiền.')}>{t('Add to Cart', 'অ্যাড টু কার্ট', 'ऐड टू कार्ट', 'Thêm vào giỏ')}</Tap>
            <Tap className="az-btn az-buy" act="buy_now" onClick={() => { setCart([product.id]); nav.push('checkout'); }} explain={T('Buy Now: goes straight to checkout for this item.', 'বাই নাউ: সরাসরি এই জিনিসের চেকআউটে যায়।', 'बाय नाउ: सीधे इस सामान के चेकआउट पर ले जाता है।', 'Mua ngay: đi thẳng tới thanh toán món này.')}>{t('Buy Now', 'বাই নাউ', 'बाय नाउ', 'Mua ngay')}</Tap>
          </div>
          {tabs}
        </Screen>
      )}

      {nav.screen === 'cart' && (
        <Screen nav={nav} style={{ background: '#fff' }}>
          {header}
          <div className="sim-scroll sim-pad sim-stack">
            <p className="az-title">{t('Subtotal', 'মোট', 'सबटोटल', 'Tạm tính')}: <strong>{rs(cartTotal)}</strong></p>
            {cart.length > 0 && <Tap className="az-btn az-cart" act="proceed_to_buy" onClick={() => nav.push('checkout')}>{t(`Proceed to Buy (${cart.length} item${cart.length === 1 ? '' : 's'})`, `কিনতে এগিয়ে যান (${cart.length}টি)`, `खरीदने के लिए आगे बढ़ें (${cart.length})`, `Tiến hành mua (${cart.length} món)`)}</Tap>}
            {cart.length === 0 && <p style={{ color: '#565959' }}>{t('Your cart is empty.', 'আপনার কার্ট খালি।', 'आपका कार्ट खाली है।', 'Giỏ hàng trống.')}</p>}
            {cart.map((id, i) => { const p = PRODUCTS.find((x) => x.id === id); return (
              <div key={`${id}${i}`} className="az-result" style={{ padding: 0 }}>
                <Photo kind={p.kind} className="az-card-img" size={40} />
                <span className="sim-row-main"><span className="az-card-name">{t(...p.name)}</span><strong>{rs(p.price)}</strong>
                  <Tap className="az-link" act="remove_from_cart" onClick={() => setCart((c) => c.filter((_, j) => j !== i))}>{t('Delete', 'মুছুন', 'हटाएं', 'Xóa')}</Tap></span>
              </div>
            ); })}
          </div>
          {tabs}
        </Screen>
      )}

      {nav.screen === 'checkout' && (
        <Screen nav={nav} style={{ background: '#fff' }}>
          <StatusBar bg="#fff" />
          <AppBar bg="#fff" fg="#111" onBack={nav.back} title={t('Checkout', 'চেকআউট', 'चेकआउट', 'Thanh toán')} />
          <div className="sim-scroll sim-pad sim-stack">
            <div className="az-box"><MapPin size={18} /><span>{t('Amma, 12 Lodhi Road, New Delhi 110001', 'আম্মা, ১২ লোধি রোড, নয়াদিল্লি ১১০০০১', 'अम्मा, 12 लोधी रोड, नई दिल्ली 110001', 'Mẹ, 12 Lodhi Road, New Delhi 110001')}</span></div>
            <p className="sim-label">{t('Payment method', 'পেমেন্টের ধরন', 'भुगतान का तरीका', 'Phương thức thanh toán')}</p>
            {[['cod', T('Cash on Delivery — pay when it arrives', 'ক্যাশ অন ডেলিভারি — হাতে পেয়ে টাকা দিন', 'कैश ऑन डिलीवरी — मिलने पर पैसे दें', 'Thanh toán khi nhận hàng')], ['upi', T('UPI (Google Pay, PhonePe)', 'ইউপিআই (গুগল পে, ফোনপে)', 'UPI (गूगल पे, फ़ोनपे)', 'UPI (Google Pay, PhonePe)')]].map(([id, label]) => (
              <Tap key={id} className="az-box az-radio" aria-pressed={pay === id} act={`choose_payment choose_${id}`} onClick={() => setPay(id)}><span className="az-dot" data-on={pay === id} />{t(...label)}</Tap>
            ))}
            <p className="az-title">{t('Order total', 'মোট টাকা', 'कुल रकम', 'Tổng đơn')}: <strong style={{ color: '#B12704' }}>{rs(cartTotal)}</strong></p>
            <Tap className="az-btn az-cart" act="place_order" onClick={() => { setOrders((o) => [{ id: `O-${Math.floor(Math.random() * 900 + 100)}`, product: cart[0], status: 0 }, ...o]); setCart([]); nav.replace('placed'); }}
              explain={T('Place your order: confirms the purchase. Check address, payment and total first.', 'প্লেস ইওর অর্ডার: কেনাকাটা পাকা করে। আগে ঠিকানা, পেমেন্ট আর মোট দেখে নিন।', 'प्लेस योर ऑर्डर: खरीदारी पक्की करता है। पहले पता, भुगतान और कुल रकम देखें।', 'Đặt hàng: xác nhận mua. Kiểm tra địa chỉ, thanh toán và tổng tiền trước.')}>{t('Place your order', 'অর্ডার দিন', 'ऑर्डर दें', 'Đặt hàng')}</Tap>
          </div>
        </Screen>
      )}

      {nav.screen === 'placed' && (
        <Screen nav={nav} style={{ background: '#fff' }}>
          <StatusBar bg="#fff" />
          <div className="sim-success">
            <span className="sim-success-icon" style={{ background: '#067D62' }}><Check size={40} strokeWidth={3} /></span>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{t('Order placed, thank you!', 'অর্ডার হয়েছে, ধন্যবাদ!', 'ऑर्डर हो गया, धन्यवाद!', 'Đã đặt hàng, cảm ơn bạn!')}</p>
            <p style={{ margin: 0, color: '#565959' }}>{t('Practice only — nothing will be delivered.', 'শুধু অনুশীলন — কিছুই ডেলিভারি হবে না।', 'सिर्फ़ अभ्यास — कुछ भी डिलीवर नहीं होगा।', 'Chỉ luyện tập — không có hàng nào được giao.')}</p>
            <Tap className="az-btn az-cart" act="open_orders" onClick={() => { nav.reset('home'); nav.push('orders'); }} style={{ maxWidth: 260 }}>{t('See your orders', 'আপনার অর্ডার দেখুন', 'अपने ऑर्डर देखें', 'Xem đơn hàng')}</Tap>
          </div>
        </Screen>
      )}

      {nav.screen === 'orders' && (
        <Screen nav={nav} style={{ background: '#fff' }}>
          <StatusBar bg="#fff" />
          <AppBar bg="#fff" fg="#111" onBack={nav.back} title={t('Your Orders', 'আপনার অর্ডার', 'आपके ऑर्डर', 'Đơn hàng của bạn')} />
          <div className="sim-scroll">
            {orders.map((o) => { const p = PRODUCTS.find((x) => x.id === o.product) || PRODUCTS[0]; return (
              <Tap key={o.id} className="sim-row" act={`open_order open_order_${o.product}`} onClick={() => nav.push('order', { id: o.id })}>
                <Photo kind={p.kind} className="az-card-img" style={{ width: 54, height: 54 }} size={26} />
                <span className="sim-row-main"><span className="sim-row-title">{t(...p.name)}</span><span className="sim-row-sub">{[t('Ordered', 'অর্ডার হয়েছে', 'ऑर्डर हुआ', 'Đã đặt'), t('Shipped', 'পাঠানো হয়েছে', 'भेजा गया', 'Đã gửi'), t('Out for delivery', 'ডেলিভারির পথে', 'डिलीवरी के लिए निकला', 'Đang giao')][o.status]}</span></span><ChevronRight size={18} color="#888" />
              </Tap>
            ); })}
          </div>
        </Screen>
      )}

      {nav.screen === 'order' && (() => {
        const o = orders.find((x) => x.id === nav.params.id) || orders[0];
        const p = PRODUCTS.find((x) => x.id === o.product) || PRODUCTS[0];
        const steps = [T('Ordered', 'অর্ডার হয়েছে', 'ऑर्डर हुआ', 'Đã đặt'), T('Shipped', 'পাঠানো হয়েছে', 'भेजा गया', 'Đã gửi'), T('Out for delivery', 'ডেলিভারির পথে', 'डिलीवरी के लिए निकला', 'Đang giao'), T('Delivered', 'পৌঁছে গেছে', 'पहुंच गया', 'Đã giao')];
        return (
          <Screen nav={nav} style={{ background: '#fff' }}>
            <StatusBar bg="#fff" />
            <AppBar bg="#fff" fg="#111" onBack={nav.back} title={t('Order details', 'অর্ডারের বিস্তারিত', 'ऑर्डर की जानकारी', 'Chi tiết đơn hàng')} />
            <div className="sim-scroll sim-pad sim-stack">
              <Photo kind={p.kind} className="az-hero" style={{ height: 140 }} size={64} />
              <p className="az-title">{t(...p.name)}</p>
              <Tap className="az-btn az-cart" act="track_package" onClick={() => showToast(t('Arriving tomorrow by 9 pm.', 'আগামীকাল রাত ৯টার মধ্যে পৌঁছাবে।', 'कल रात 9 बजे तक पहुंचेगा।', 'Sẽ tới trước 9 giờ tối mai.'))}><Package size={18} /> {t('Track package', 'প্যাকেজ ট্র্যাক করুন', 'पैकेज ट्रैक करें', 'Theo dõi kiện hàng')}</Tap>
              <ol className="az-track">{steps.map((s, i) => <li key={i} data-done={i <= o.status}>{t(...s)}</li>)}</ol>
              <Tap className="az-btn az-plain" act="return_item" onClick={() => nav.push('return', { id: o.id })} explain={T('Return or replace: send it back if it is broken or wrong.', 'রিটার্ন বা রিপ্লেস: ভাঙা বা ভুল হলে ফেরত পাঠান।', 'रिटर्न या रिप्लेस: टूटा या गलत हो तो लौटाएं।', 'Trả hoặc đổi: gửi lại nếu hỏng hoặc sai.')}><Undo2 size={18} /> {t('Return or replace items', 'জিনিস ফেরত বা বদল', 'सामान लौटाएं या बदलें', 'Trả lại hoặc đổi hàng')}</Tap>
              <p className="sim-safety"><ShieldAlert size={16} />{t('Messages asking you to pay a "re-delivery fee" through a link are scams. Real updates are here, in the app.', 'লিংকে "রি-ডেলিভারি ফি" চাওয়া মেসেজ প্রতারণা। আসল খবর এখানে, অ্যাপের ভেতরেই।', 'लिंक से "री-डिलीवरी फ़ीस" मांगने वाले मैसेज धोखा हैं। असली जानकारी यहीं ऐप में है।', 'Tin nhắn đòi "phí giao lại" qua link là lừa đảo. Thông tin thật nằm ở đây, trong ứng dụng.')}</p>
            </div>
          </Screen>
        );
      })()}

      {nav.screen === 'return' && <ReturnFlow t={t} nav={nav} onDone={() => { emit('return_done'); nav.reset('home'); showToast(t('Return booked. Pickup on Thursday; refund goes back automatically.', 'ফেরত বুক হয়েছে। বৃহস্পতিবার নিতে আসবে; টাকা নিজে থেকেই ফেরত আসবে।', 'वापसी बुक हो गई। गुरुवार को पिकअप; पैसे अपने आप लौटेंगे।', 'Đã đặt trả hàng. Thứ Năm đến lấy; tiền tự hoàn lại.'), 4200); }} />}
    </div>
  );
}

function ReturnFlow({ t, nav, onDone }) {
  const [reason, setReason] = useState(null);
  return (
    <Screen nav={nav} style={{ background: '#fff' }}>
      <StatusBar bg="#fff" />
      <AppBar bg="#fff" fg="#111" onBack={nav.back} title={t('Why are you returning this?', 'কেন ফেরত দিচ্ছেন?', 'आप इसे क्यों लौटा रहे हैं?', 'Vì sao bạn trả hàng?')} />
      <div className="sim-scroll sim-pad sim-stack">
        {[['damaged', T('Item arrived damaged', 'জিনিস ভাঙা অবস্থায় এসেছে', 'सामान टूटा हुआ आया', 'Hàng đến bị hỏng')], ['wrong', T('Wrong item was sent', 'ভুল জিনিস পাঠানো হয়েছে', 'गलत सामान भेजा गया', 'Gửi nhầm hàng')], ['nolonger', T('No longer needed', 'আর দরকার নেই', 'अब ज़रूरत नहीं', 'Không cần nữa')]].map(([id, label]) => (
          <Tap key={id} className="az-box az-radio" aria-pressed={reason === id} act={`choose_return_reason choose_${id}`} onClick={() => setReason(id)}><span className="az-dot" data-on={reason === id} />{t(...label)}</Tap>
        ))}
        <Tap className="az-btn az-cart" act="confirm_return" disabled={!reason} onClick={onDone}>{t('Confirm return', 'ফেরত নিশ্চিত করুন', 'वापसी पक्की करें', 'Xác nhận trả hàng')}</Tap>
      </div>
    </Screen>
  );
}
