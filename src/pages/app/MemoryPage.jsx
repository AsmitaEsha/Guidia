import { useEffect, useMemo, useState } from 'react';
import { BookMarked, BookOpen, Hand, Loader2, PlayCircle, Search, Star, Trash2, X } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { useToast } from '../../context/ToastContext';
import { useResource } from '../../hooks/useResource';
import { del, patch } from '../../services/apiClient';
import { formatDate, formatRelative } from '../../i18n';
import { skillName } from '../../data/catalog';
import { announce } from '../../utils/announce';
import { Button, ConfirmDialog, EmptyState, ErrorState, IconButton, PageHeader, Segmented, Skeleton, Tabs } from '../../components/ui';
import AppLogo from '../../components/AppLogo';

const SIMULATED = ['whatsapp', 'facebook', 'messenger', 'gmail', 'bkash', 'nagad', 'momo', 'googlepay', 'paypal', 'booking', 'practo', 'amazon'];

const CATEGORIES = [
  ['ALL', ['All topics', 'সব বিষয়', 'सभी विषय', 'Mọi chủ đề']],
  ['MESSAGING', ['Messages', 'মেসেজ', 'संदेश', 'Tin nhắn']],
  ['SOCIAL', ['Social', 'সামাজিক', 'सोशल', 'Xã hội']],
  ['BANKING', ['Money', 'টাকা', 'पैसे', 'Tiền']],
  ['SAFETY', ['Safety', 'নিরাপত্তা', 'सुरक्षा', 'An toàn']],
  ['PRIVACY', ['Privacy & AI', 'গোপনীয়তা ও এআই', 'निजता और AI', 'Riêng tư & AI']],
  ['LEARNING', ['Other', 'অন্যান্য', 'अन्य', 'Khác']],
];

function MemoryCard({ entry, lesson, t, language, onStar, onRemove, onListen, index }) {
  const app = lesson?.application?.slug;
  const practiceTo = app && SIMULATED.includes(app) ? `/app/practice/${app}` : '/app/practice';
  return (
    <article className="memory-card rise" style={{ '--i': Math.min(index, 8) }} aria-labelledby={`mem-${entry.id}`}>
      <div className="memory-card-top">
        {app ? <AppLogo app={app} name={lesson.application.displayName} size={40} /> : <span className="icon-chip icon-chip-sm tone-coral" aria-hidden="true"><BookMarked /></span>}
        <span className="memory-date" title={formatDate(entry.createdAt, language, { dateStyle: 'full' })}>{formatRelative(entry.createdAt, language)}</span>
        <button type="button" className="star-btn" aria-pressed={entry.starred} onClick={() => onStar(entry)} aria-label={entry.starred ? t('Remove star', 'তারকা সরান', 'तारा हटाएं', 'Bỏ sao') : t('Add star', 'তারকা দিন', 'तारा लगाएं', 'Gắn sao')}>
          <Star aria-hidden="true" />
        </button>
      </div>
      <h2 id={`mem-${entry.id}`} className="h-card">{entry.title}</h2>
      <p className="memory-summary clamp-4">{entry.summary}</p>
      {entry.skillKey && <span className="badge badge-brand self-start">{skillName(entry.skillKey, t)}</span>}
      <div className="memory-actions">
        <Button variant="secondary" size="sm" icon={PlayCircle} onClick={() => onListen(entry)}>{t('Listen again', 'আবার শুনুন', 'फिर सुनें', 'Nghe lại')}</Button>
        <Button variant="quiet" size="sm" icon={Hand} to={practiceTo}>{t('Practise', 'অনুশীলন', 'अभ्यास', 'Luyện tập')}</Button>
        {lesson && <IconButton icon={BookOpen} size="sm" variant="ghost" to={`/app/learn/${lesson.slug}`} label={t('Open the lesson', 'পাঠটি খুলুন', 'पाठ खोलें', 'Mở bài học')} />}
        <IconButton icon={Trash2} size="sm" variant="ghost" className="ml-auto" label={t('Remove', 'মুছুন', 'हटाएं', 'Xóa')} onClick={() => onRemove(entry)} />
      </div>
    </article>
  );
}

export default function MemoryPage() {
  const { t, language } = usePreferences();
  const { speak } = useVoice();
  const { showToast } = useToast();
  const [view, setView] = useState('recent');
  const [category, setCategory] = useState('ALL');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [toRemove, setToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => { const id = setTimeout(() => setQuery(q.trim()), 300); return () => clearTimeout(id); }, [q]);

  const params = new URLSearchParams();
  if (category !== 'ALL') params.set('category', category);
  if (query) params.set('q', query);
  if (view === 'starred') params.set('starred', 'true');
  const { data, loading, error, reload, mutate } = useResource(`/memory?${params}`, { select: (d) => d.entries });
  const lessons = useResource('/learning/lessons', { select: (d) => d.lessons });
  const lessonById = useMemo(() => Object.fromEntries((lessons.data || []).map((l) => [l.id, l])), [lessons.data]);

  const entries = useMemo(() => {
    const list = data || [];
    return view === 'recent' ? list.slice(0, 12) : list;
  }, [data, view]);
  const searching = q.trim() !== query || (loading && Boolean(data));
  const filtered = Boolean(query) || category !== 'ALL' || view === 'starred';

  useEffect(() => {
    if (data && query) announce(t(`${data.length} results`, `${data.length}টি ফলাফল`, `${data.length} नतीजे`, `${data.length} kết quả`));
  }, [data, query, t]);

  const star = async (entry) => {
    mutate((list) => list.map((e) => (e.id === entry.id ? { ...e, starred: !e.starred } : e)));
    try {
      await patch(`/memory/${entry.id}/star`, { starred: !entry.starred });
      if (view === 'starred' && entry.starred) mutate((list) => list.filter((e) => e.id !== entry.id));
    } catch (err) { showToast(err.message, 'danger'); reload(); }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await del(`/memory/${toRemove.id}`);
      mutate((list) => list.filter((e) => e.id !== toRemove.id));
      showToast(t('Removed from your Memory Book.', 'স্মৃতির খাতা থেকে মুছে ফেলা হয়েছে।', 'याद की किताब से हटा दिया गया।', 'Đã xóa khỏi Sổ ghi nhớ.'), 'success');
      setToRemove(null);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setRemoving(false);
    }
  };

  const clearAll = () => { setQ(''); setQuery(''); setCategory('ALL'); setView('all'); };

  return (
    <div className="page memory-page">
      <PageHeader
        eyebrow={t('Memory Book', 'স্মৃতির খাতা', 'याद की किताब', 'Sổ ghi nhớ')}
        title={t('Things you have learned', 'যা যা শিখেছেন', 'जो कुछ आपने सीखा', 'Những điều bạn đã học')}
        description={t('Your own little library. Listen again whenever you like, or practise to keep a skill fresh.', 'আপনার নিজের ছোট লাইব্রেরি। যখন খুশি আবার শুনুন, বা দক্ষতা ঝালিয়ে নিতে অনুশীলন করুন।', 'आपकी अपनी छोटी लाइब्रेरी। जब चाहें फिर सुनें, या कौशल ताज़ा रखने के लिए अभ्यास करें।', 'Thư viện nhỏ của riêng bạn. Nghe lại bất cứ lúc nào, hoặc luyện tập để giữ kỹ năng.')}
      />

      <div className="memory-tools rise" style={{ '--i': 1 }}>
        <div className="input-icon memory-search">
          <Search aria-hidden="true" />
          <label htmlFor="mem-q" className="sr-only">{t('Search your Memory Book', 'স্মৃতির খাতায় খুঁজুন', 'याद की किताब में खोजें', 'Tìm trong Sổ ghi nhớ')}</label>
          <input id="mem-q" className="input input-lg" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search your Memory Book', 'স্মৃতির খাতায় খুঁজুন', 'याद की किताब में खोजें', 'Tìm trong Sổ ghi nhớ')} />
          {searching ? <Loader2 className="spin memory-search-state" aria-hidden="true" /> : q && <IconButton icon={X} size="sm" className="memory-search-clear" label={t('Clear search', 'খোঁজা মুছুন', 'खोज साफ़ करें', 'Xóa tìm kiếm')} onClick={() => setQ('')} />}
        </div>
        <Tabs
          label={t('Show', 'দেখান', 'दिखाएं', 'Hiển thị')} value={view} onChange={setView}
          tabs={[
            { id: 'recent', label: t('Recent', 'সাম্প্রতিক', 'हाल के', 'Gần đây') },
            { id: 'starred', label: t('Starred', 'তারকা দেওয়া', 'तारांकित', 'Đã gắn sao'), icon: Star },
            { id: 'all', label: t('All', 'সব', 'सभी', 'Tất cả') },
          ]}
        />
        <div className="scroll-x">
          <Segmented label={t('Topic', 'বিষয়', 'विषय', 'Chủ đề')} value={category} onChange={setCategory} options={CATEGORIES.map(([v, l]) => ({ value: v, label: t(...l) }))} />
        </div>
      </div>

      <div role="tabpanel" id={`panel-${view}`} aria-labelledby={`tab-${view}`} className="stack" style={{ '--gap': 'var(--s-4)' }}>
        {loading && !data && <div className="memory-grid"><Skeleton variant="card" height={240} count={6} /></div>}
        {error && <ErrorState card title={t('Could not open your Memory Book', 'স্মৃতির খাতা খোলা যায়নি', 'याद की किताब नहीं खुली', 'Không mở được Sổ ghi nhớ')} message={error.message} onRetry={reload} />}
        {data && entries.length === 0 && (
          filtered ? (
            <EmptyState card icon={Search} title={t('No matching memories yet.', 'এখনো মেলে এমন কিছু নেই।', 'अभी कोई मेल खाती याद नहीं।', 'Chưa có mục nào phù hợp.')}
              action={<Button variant="secondary" onClick={clearAll}>{t('Browse all memories', 'সব স্মৃতি দেখুন', 'सारी यादें देखें', 'Xem tất cả')}</Button>}>
              {view === 'starred' && !query ? t('Tap the star on any memory to keep it here.', 'যেকোনো স্মৃতিতে তারকা দিলে তা এখানে থাকবে।', 'किसी भी याद पर तारा लगाएं, वह यहाँ रहेगी।', 'Gắn sao cho mục bất kỳ để giữ ở đây.') : null}
            </EmptyState>
          ) : (
            <EmptyState card icon={BookMarked} tone="coral" title={t('Your Memory Book is waiting', 'আপনার স্মৃতির খাতা অপেক্ষা করছে', 'आपकी याद की किताब इंतज़ार कर रही है', 'Sổ ghi nhớ đang chờ bạn')}
              action={<Button arrow to="/app/learn">{t('Start a lesson', 'একটি পাঠ শুরু করুন', 'एक पाठ शुरू करें', 'Bắt đầu một bài học')}</Button>}>
              {t('Finished lessons and practice are saved here automatically, so you can come back to them any time.', 'শেষ করা পাঠ ও অনুশীলন এখানে নিজে থেকেই রাখা হয়, যাতে যখন খুশি ফিরে আসতে পারেন।', 'पूरे किए पाठ और अभ्यास यहाँ अपने आप सहेजे जाते हैं, ताकि कभी भी लौट सकें।', 'Bài học và luyện tập đã xong được tự động lưu ở đây để bạn quay lại bất cứ lúc nào.')}
            </EmptyState>
          )
        )}
        <div className="memory-grid" aria-busy={searching}>
          {entries.map((entry, i) => (
            <MemoryCard
              key={entry.id} index={i} entry={entry} lesson={lessonById[entry.lessonId]} t={t} language={language}
              onStar={star} onRemove={setToRemove} onListen={(e) => speak(`${e.title}. ${e.summary}`)}
            />
          ))}
        </div>
        {view === 'recent' && (data?.length || 0) > 12 && <Button variant="secondary" className="self-start" onClick={() => setView('all')}>{t('See all memories', 'সব স্মৃতি দেখুন', 'सारी यादें देखें', 'Xem tất cả')}</Button>}
      </div>

      <ConfirmDialog
        open={Boolean(toRemove)} onClose={() => setToRemove(null)} onConfirm={remove} state={removing ? 'loading' : 'idle'}
        title={t('Remove this from your Memory Book?', 'স্মৃতির খাতা থেকে মুছবেন?', 'याद की किताब से हटाएं?', 'Xóa mục này khỏi Sổ ghi nhớ?')}
        description={toRemove?.title}
        consequences={[t('Only this memory is removed. Your progress and skills stay the same.', 'শুধু এই স্মৃতিটি মুছবে। আপনার অগ্রগতি ও দক্ষতা একই থাকবে।', 'केवल यह याद हटेगी। आपकी प्रगति और कौशल वैसे ही रहेंगे।', 'Chỉ mục này bị xóa. Tiến độ và kỹ năng của bạn giữ nguyên.')]}
        confirmLabel={t('Remove', 'মুছুন', 'हटाएं', 'Xóa')}
      />
    </div>
  );
}
