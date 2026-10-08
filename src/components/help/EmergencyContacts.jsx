import { useState } from 'react';
import { Mail, MessageCircle, Pencil, Phone, Plus, Star, Trash2, UserRound } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useToast } from '../../context/ToastContext';
import { useResource } from '../../hooks/useResource';
import { del, post, put } from '../../services/apiClient';
import { Alert, Avatar, Badge, Button, ConfirmDialog, Dialog, Field, IconButton, Skeleton, Switch } from '../ui';

const RELATIONS = [
  ['Son', 'ছেলে', 'बेटा', 'Con trai'],
  ['Daughter', 'মেয়ে', 'बेटी', 'Con gái'],
  ['Husband', 'স্বামী', 'पति', 'Chồng'],
  ['Wife', 'স্ত্রী', 'पत्नी', 'Vợ'],
  ['Brother', 'ভাই', 'भाई', 'Anh/em trai'],
  ['Sister', 'বোন', 'बहन', 'Chị/em gái'],
  ['Grandchild', 'নাতি-নাতনি', 'पोता-पोती', 'Cháu'],
  ['Neighbour', 'প্রতিবেশী', 'पड़ोसी', 'Hàng xóm'],
  ['Carer', 'দেখাশোনাকারী', 'देखभाल करने वाले', 'Người chăm sóc'],
  ['Friend', 'বন্ধু', 'दोस्त', 'Bạn bè'],
];
const digits = (phone) => String(phone || '').replace(/[^\d+]/g, '');
const EMPTY = { name: '', relationship: '', phone: '', email: '', isPrimary: false };

// Add or edit one person to reach in an emergency.
function ContactDialog({ open, onClose, initial, onSaved, t }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));
  const canSave = form.name.trim() && (form.phone.trim() || form.email.trim());

  const save = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setBusy(true);
    setError('');
    try {
      const body = { name: form.name.trim(), relationship: form.relationship.trim(), phone: form.phone.trim(), email: form.email.trim(), isPrimary: form.isPrimary };
      if (initial?.id) await put(`/emergency/contacts/${initial.id}`, body);
      else await post('/emergency/contacts', body);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} icon={UserRound}
      title={initial?.id ? t('Edit this person', 'এই মানুষটির তথ্য বদলান', 'इस व्यक्ति की जानकारी बदलें', 'Sửa thông tin người này') : t('Add someone to call', 'ফোন করার জন্য কাউকে যোগ করুন', 'फोन के लिए किसी को जोड़ें', 'Thêm người để gọi')}
      description={t('When you press "I need help", Guidia shows a big Call button for them.', '"আমার সাহায্য দরকার" চাপলে Guidia তাঁকে ফোন করার বড় বোতাম দেখাবে।', '"मुझे मदद चाहिए" दबाने पर Guidia उन्हें फोन करने का बड़ा बटन दिखाएगा।', 'Khi bạn bấm "Tôi cần giúp đỡ", Guidia sẽ hiện nút Gọi lớn cho họ.')}>
      <form className="stack" style={{ '--gap': 'var(--s-4)' }} onSubmit={save} noValidate>
        <Field label={t('Their name', 'তাঁর নাম', 'उनका नाम', 'Tên của họ')}>
          {(p) => <input {...p} className="input input-lg" value={form.name} onChange={set('name')} maxLength={80} autoComplete="off" placeholder={t('e.g. Rupa', 'যেমন: রূপা', 'जैसे: रूपा', 'ví dụ: Lan')} />}
        </Field>
        <div className="field">
          <span className="label" id="rel-l">{t('Who are they to you?', 'তিনি আপনার কে?', 'वे आपके क्या लगते हैं?', 'Họ là gì của bạn?')}</span>
          <div className="row" style={{ '--gap': '6px' }} role="group" aria-labelledby="rel-l">
            {RELATIONS.map((r) => {
              const label = t(...r);
              return <button key={r[0]} type="button" className="chip" aria-pressed={form.relationship === label} onClick={() => set('relationship')(form.relationship === label ? '' : label)}>{label}</button>;
            })}
          </div>
        </div>
        <Field label={t('Phone number', 'ফোন নম্বর', 'फोन नंबर', 'Số điện thoại')} hint={t('With country code if they live abroad, e.g. +44…', 'বিদেশে থাকলে দেশের কোডসহ, যেমন +৪৪…', 'विदेश में हों तो देश कोड के साथ, जैसे +44…', 'Kèm mã quốc gia nếu họ ở nước ngoài, ví dụ +44…')}>
          {(p) => <input {...p} className="input input-lg" type="tel" inputMode="tel" autoComplete="off" value={form.phone} onChange={set('phone')} maxLength={24} placeholder="+880 17…" />}
        </Field>
        <Field label={t('Email', 'ইমেইল', 'ईमेल', 'Email')} optional={t('optional', 'ঐচ্ছিক', 'वैकल्पिक', 'không bắt buộc')}>
          {(p) => <input {...p} className="input" type="email" inputMode="email" autoComplete="off" value={form.email} onChange={set('email')} maxLength={120} />}
        </Field>
        <div className="setting-row">
          <span className="stack" style={{ '--gap': '2px' }}>
            <span className="label" id="primary-l">{t('Call this person first', 'প্রথমে এঁকে ফোন করুন', 'सबसे पहले इन्हें फोन करें', 'Gọi người này trước')}</span>
            <span className="hint">{t('Their button appears at the top.', 'তাঁর বোতাম সবার ওপরে থাকবে।', 'उनका बटन सबसे ऊपर दिखेगा।', 'Nút của họ hiện trên cùng.')}</span>
          </span>
          <Switch checked={form.isPrimary} onChange={(v) => setForm((f) => ({ ...f, isPrimary: v }))} labelledBy="primary-l" />
        </div>
        {error && <Alert tone="warn">{error}</Alert>}
        {!canSave && form.name.trim() && <p className="hint">{t('Add a phone number or an email so they can be reached.', 'ফোন নম্বর বা ইমেইল দিন যাতে যোগাযোগ করা যায়।', 'फोन नंबर या ईमेल डालें ताकि संपर्क हो सके।', 'Thêm số điện thoại hoặc email để liên lạc được.')}</p>}
        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>{t('Cancel', 'বাতিল', 'रद्द करें', 'Hủy')}</Button>
          <Button type="submit" disabled={!canSave} state={busy ? 'loading' : 'idle'}>{t('Save', 'সেভ করুন', 'सेव करें', 'Lưu')}</Button>
        </div>
      </form>
    </Dialog>
  );
}

/**
 * The people a learner wants to reach, with one-tap Call / WhatsApp / Email.
 * `urgent` makes the call buttons large (shown right after asking for help).
 */
export default function EmergencyContacts({ urgent = false }) {
  const { t } = usePreferences();
  const { showToast } = useToast();
  const { data: contacts, loading, reload } = useResource('/emergency/contacts', { select: (d) => d.contacts });
  const [editing, setEditing] = useState(null); // null | 'new' | contact
  const [removing, setRemoving] = useState(null);

  const remove = async () => {
    try {
      await del(`/emergency/contacts/${removing.id}`);
      showToast(t('Removed.', 'সরানো হয়েছে।', 'हटा दिया।', 'Đã xóa.'), 'success');
      reload();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section className={`card stack help-contacts ${urgent ? 'is-urgent' : ''}`} style={{ '--gap': 'var(--s-4)' }} aria-labelledby="contacts-h">
      <div className="row-between">
        <span className="stack" style={{ '--gap': '2px' }}>
          <h2 id="contacts-h" className="h-section">{urgent ? t('Call someone now', 'এখনই কাউকে ফোন করুন', 'अभी किसी को फोन करें', 'Gọi cho ai đó ngay') : t('Who should I call?', 'কাকে ফোন করব?', 'मैं किसे फोन करूं?', 'Tôi nên gọi ai?')}</h2>
          <span className="text-muted">{t('The people you want to reach when you need help.', 'সাহায্য দরকার হলে যাঁদের সাথে যোগাযোগ করতে চান।', 'मदद चाहिए तो जिनसे संपर्क करना चाहते हैं।', 'Những người bạn muốn liên lạc khi cần giúp.')}</span>
        </span>
        <Button variant="secondary" size="sm" icon={Plus} onClick={() => setEditing('new')}>{t('Add', 'যোগ করুন', 'जोड़ें', 'Thêm')}</Button>
      </div>

      {loading && !contacts ? <Skeleton height={72} /> : (contacts || []).length === 0 ? (
        <button type="button" className="help-contact-empty" onClick={() => setEditing('new')}>
          <Plus aria-hidden="true" />
          <span>{t('Add your son, daughter or a neighbour, so a Call button is ready when you need it.', 'ছেলে, মেয়ে বা প্রতিবেশীকে যোগ করুন, যাতে দরকারের সময় ফোনের বোতাম তৈরি থাকে।', 'बेटे, बेटी या पड़ोसी को जोड़ें, ताकि ज़रूरत पर फोन का बटन तैयार रहे।', 'Thêm con hoặc hàng xóm để nút Gọi luôn sẵn khi bạn cần.')}</span>
        </button>
      ) : (
        <ul className="help-contact-list">
          {contacts.map((c) => (
            <li key={c.id} className="help-contact">
              <span className="row" style={{ '--gap': 'var(--s-3)' }}>
                <Avatar name={c.name} tone={c.isPrimary ? 'coral' : undefined} />
                <span className="stack" style={{ '--gap': 0 }}>
                  <span className="text-strong row" style={{ '--gap': '6px' }}>{c.name}{c.isPrimary && <Badge tone="warn" icon={Star}>{t('First', 'প্রথম', 'पहले', 'Đầu tiên')}</Badge>}</span>
                  <span className="text-subtle">{[c.relationship, c.phone].filter(Boolean).join(' · ')}</span>
                </span>
              </span>
              <span className="help-contact-actions">
                {c.phone && <Button size={urgent ? 'lg' : 'sm'} variant={urgent ? 'help' : 'primary'} icon={Phone} href={`tel:${digits(c.phone)}`}>{t('Call', 'ফোন করুন', 'फोन करें', 'Gọi')}</Button>}
                {c.phone && <Button size={urgent ? 'lg' : 'sm'} variant="secondary" icon={MessageCircle} href={`https://wa.me/${digits(c.phone).replace(/^\+/, '')}`} target="_blank" rel="noreferrer">WhatsApp</Button>}
                {!c.phone && c.email && <Button size="sm" variant="secondary" icon={Mail} href={`mailto:${c.email}`}>{t('Email', 'ইমেইল', 'ईमेल', 'Email')}</Button>}
                {!urgent && <IconButton icon={Pencil} size="sm" variant="quiet" label={t(`Edit ${c.name}`, `${c.name}-এর তথ্য বদলান`, `${c.name} की जानकारी बदलें`, `Sửa ${c.name}`)} onClick={() => setEditing(c)} />}
                {!urgent && <IconButton icon={Trash2} size="sm" variant="quiet" label={t(`Remove ${c.name}`, `${c.name}-কে সরান`, `${c.name} को हटाएं`, `Xóa ${c.name}`)} onClick={() => setRemoving(c)} />}
              </span>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ContactDialog
          key={editing === 'new' ? 'new' : editing.id} open onClose={() => setEditing(null)} onSaved={reload} t={t}
          initial={editing === 'new' ? null : { ...EMPTY, ...editing, relationship: editing.relationship || '', phone: editing.phone || '', email: editing.email || '' }}
        />
      )}
      <ConfirmDialog
        open={Boolean(removing)} onClose={() => setRemoving(null)} onConfirm={remove}
        title={t(`Remove ${removing?.name || ''}?`, `${removing?.name || ''}-কে সরাবেন?`, `${removing?.name || ''} को हटाएं?`, `Xóa ${removing?.name || ''}?`)}
        consequences={[t('Their call button will no longer appear on this page.', 'তাঁর ফোনের বোতাম আর এই পেজে দেখাবে না।', 'उनका फोन बटन अब इस पेज पर नहीं दिखेगा।', 'Nút gọi của họ sẽ không còn hiện trên trang này.')]}
        confirmLabel={t('Remove', 'সরান', 'हटाएं', 'Xóa')}
      />
    </section>
  );
}
