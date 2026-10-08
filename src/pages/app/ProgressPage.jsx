import { Award, BookOpen, CalendarClock, Check, Hand, HeartHandshake, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useResource } from '../../hooks/useResource';
import { formatRelative } from '../../i18n';
import { MASTERY, MASTERY_ORDER, skillName } from '../../data/catalog';
import { Button, EmptyState, ErrorState, PageHeader, ProgressRing, SectionHeader, Skeleton } from '../../components/ui';

function Indicator({ icon: Icon, value, label, note, tone, highlight }) {
  return (
    <div className={`card indicator ${highlight ? 'is-highlight' : ''}`}>
      <span className={`icon-chip ${tone ? `tone-${tone}` : ''}`} aria-hidden="true"><Icon /></span>
      <p className="indicator-value num">{value}</p>
      <p className="indicator-label">{label}</p>
      {note && <p className="text-subtle">{note}</p>}
    </div>
  );
}

// Six-stop path from "Just starting" to "Mastered"; independence is the
// milestone that matters most, so it is marked.
function MasteryPath({ level, t }) {
  const idx = Math.max(0, MASTERY_ORDER.indexOf(level));
  return (
    <div className="mastery-path" role="img" aria-label={`${t(...MASTERY[level] || MASTERY.NEW)} (${idx + 1}/${MASTERY_ORDER.length})`}>
      {MASTERY_ORDER.map((m, i) => (
        <span key={m} className="mastery-stop" data-state={i < idx ? 'done' : i === idx ? 'current' : 'todo'} data-milestone={m === 'INDEPENDENT' || undefined}>
          {i < MASTERY_ORDER.length - 1 && <span className="mastery-link" aria-hidden="true" />}
          <span className="mastery-dot" aria-hidden="true">{m === 'INDEPENDENT' ? <Star /> : i <= idx ? <Check /> : null}</span>
        </span>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const { t, language } = usePreferences();
  const { data: p, loading, error, reload } = useResource('/progress/me', { select: (d) => d.progress });

  if (loading && !p) {
    return (
      <div className="page" aria-busy="true">
        <Skeleton variant="title" />
        <div className="indicator-grid"><Skeleton variant="card" height={170} count={4} /></div>
        <div className="grid" style={{ '--min': '320px' }}><Skeleton variant="card" height={220} count={2} /></div>
      </div>
    );
  }
  if (error) return <div className="page"><ErrorState card title={t('Could not load your progress', 'অগ্রগতি লোড হয়নি', 'प्रगति लोड नहीं हुई', 'Không tải được tiến độ')} message={error.message} onRetry={reload} /></div>;
  if (!p) return null;

  const due = p.skills.filter((s) => s.dueForReview);
  const independentSkills = p.skills.filter((s) => MASTERY_ORDER.indexOf(s.masteryLevel) >= MASTERY_ORDER.indexOf('INDEPENDENT'));

  return (
    <div className="page progress-page">
      <PageHeader
        eyebrow={t('My progress', 'আমার অগ্রগতি', 'मेरी प्रगति', 'Tiến bộ của tôi')}
        title={t('Your learning journey', 'আপনার শেখার যাত্রা', 'आपकी सीखने की यात्रा', 'Hành trình học của bạn')}
        description={t('What you have learned, what you can do on your own, and what is worth practising next.', 'আপনি কী শিখেছেন, নিজে কী পারেন, আর এরপর কী অনুশীলন করা ভালো।', 'आपने क्या सीखा, खुद क्या कर सकते हैं, और आगे क्या अभ्यास करना अच्छा है।', 'Bạn đã học gì, tự làm được gì, và nên luyện gì tiếp theo.')}
      />

      <div className="indicator-grid rise" style={{ '--i': 1 }}>
        <Indicator icon={BookOpen} value={p.lessonsCompleted} label={t('Lessons finished', 'শেষ করা পাঠ', 'पूरे पाठ', 'Bài học đã xong')} />
        <Indicator icon={Hand} tone="ok" value={p.practiceSuccesses} label={t('Practices completed', 'সম্পন্ন অনুশীলন', 'पूरे अभ्यास', 'Lần luyện tập xong')} />
        <Indicator icon={Award} tone="gold" highlight value={p.independentCompletionRate == null ? '—' : `${p.independentCompletionRate}%`} label={t('Done without help', 'সাহায্য ছাড়া করা', 'बिना मदद के किया', 'Tự làm không cần giúp')} note={independentSkills.length ? t(`${independentSkills.length} skills on your own`, `${independentSkills.length}টি দক্ষতা নিজে পারেন`, `${independentSkills.length} कौशल खुद से`, `${independentSkills.length} kỹ năng tự làm được`) : null} />
        <Indicator icon={ShieldCheck} tone="coral" value={p.scamsRecognized} label={t('Risky messages caught', 'ধরা পড়া ঝুঁকিপূর্ণ মেসেজ', 'पकड़े गए खतरनाक मैसेज', 'Tin rủi ro đã phát hiện')} />
      </div>

      <section className="two-stories rise" style={{ '--i': 2 }} aria-label={t('Ability and comfort', 'দক্ষতা ও স্বাচ্ছন্দ্য', 'क्षमता और सहजता', 'Khả năng và sự thoải mái')}>
        <div className="card story">
          <ProgressRing value={p.competence} size={112} stroke={11} label={t('What you can do', 'আপনি কী পারেন', 'आप क्या कर सकते हैं', 'Bạn làm được gì')} />
          <div className="stack" style={{ '--gap': '6px' }}>
            <h2 className="h-section">{t('What you can do', 'আপনি কী পারেন', 'आप क्या कर सकते हैं', 'Bạn làm được gì')}</h2>
            <p className="text-muted">{t('Measured from your practice results — how often you completed tasks, and with how much help.', 'আপনার অনুশীলনের ফল থেকে মাপা — কতবার কাজ শেষ করেছেন, আর কতটা সাহায্য নিয়ে।', 'आपके अभ्यास के नतीजों से — कितनी बार काम पूरा किया, और कितनी मदद से।', 'Đo từ kết quả luyện tập — bạn hoàn thành bao nhiêu lần và cần bao nhiêu trợ giúp.')}</p>
          </div>
        </div>
        <div className="card story story-warm">
          {p.confidence == null ? (
            <span className="icon-chip icon-chip-lg tone-gold" aria-hidden="true"><HeartHandshake /></span>
          ) : (
            <ProgressRing value={p.confidence} size={112} stroke={11} tone="warm" label={t('How comfortable you feel', 'আপনি কতটা স্বচ্ছন্দ', 'आप कितना सहज महसूस करते हैं', 'Bạn thấy thoải mái thế nào')} />
          )}
          <div className="stack" style={{ '--gap': '6px' }}>
            <h2 className="h-section">{t('How comfortable you feel', 'আপনি কতটা স্বচ্ছন্দ', 'आप कितना सहज महसूस करते हैं', 'Bạn thấy thoải mái thế nào')}</h2>
            <p className="text-muted">
              {p.confidence == null
                ? t('After a lesson, tell Guidia how it felt and your comfort will show here.', 'পাঠের পরে কেমন লাগল Guidia-কে বললে এখানে আপনার স্বাচ্ছন্দ্য দেখা যাবে।', 'पाठ के बाद Guidia को बताएं कैसा लगा, तब आपकी सहजता यहाँ दिखेगी।', 'Sau mỗi bài, hãy cho Guidia biết bạn thấy thế nào để mục này hiện ra.')
                : t('From what you told Guidia after lessons. It is fine for comfort to grow slower than skill.', 'পাঠের পরে আপনি যা জানিয়েছেন তা থেকে। দক্ষতার চেয়ে স্বাচ্ছন্দ্য ধীরে বাড়লেও ঠিক আছে।', 'पाठ के बाद आपने जो बताया उससे। सहजता का कौशल से धीरे बढ़ना ठीक है।', 'Từ những gì bạn chia sẻ sau bài học. Sự thoải mái tăng chậm hơn kỹ năng là bình thường.')}
            </p>
          </div>
        </div>
      </section>

      {due.length > 0 && (
        <section className="card card-gold review-card rise" style={{ '--i': 3 }} aria-labelledby="review-h">
          <span className="icon-chip icon-chip-lg" style={{ background: 'var(--card)', color: 'var(--gold-700)' }} aria-hidden="true"><CalendarClock /></span>
          <div className="stack grow" style={{ '--gap': 'var(--s-2)' }}>
            <h2 id="review-h" className="h-section">{t('Ready for a quick review', 'একটু ঝালিয়ে নেওয়ার সময়', 'थोड़ा दोहराने का समय', 'Đến lúc ôn lại nhanh')}</h2>
            <p className="text-muted">{t('A short practice now helps you remember these for good:', 'এখন একটু অনুশীলন করলে এগুলো স্থায়ীভাবে মনে থাকবে:', 'अभी थोड़ा अभ्यास इन्हें हमेशा याद रखने में मदद करेगा:', 'Luyện một chút bây giờ giúp bạn nhớ lâu những điều này:')}</p>
            <div className="row" style={{ '--gap': 'var(--s-2)' }}>{due.map((s) => <span key={s.skillKey} className="badge badge-gold">{skillName(s.skillKey, t)}</span>)}</div>
          </div>
          <Button arrow to="/app/practice">{t('Practise now', 'এখনই অনুশীলন', 'अभी अभ्यास', 'Luyện ngay')}</Button>
        </section>
      )}

      <section className="section rise" style={{ '--i': 4 }} aria-labelledby="skills-h">
        <SectionHeader id="skills-h" title={t('Your skills', 'আপনার দক্ষতা', 'आपके कौशल', 'Kỹ năng của bạn')} description={t('Each skill moves from guided, to practising, to doing it on your own — and remembering it.', 'প্রতিটি দক্ষতা এগোয় সাহায্য নিয়ে করা থেকে অনুশীলন, তারপর নিজে করা — এবং মনে রাখা।', 'हर कौशल मदद से करने से अभ्यास, फिर खुद करने — और याद रखने तक बढ़ता है।', 'Mỗi kỹ năng đi từ có hướng dẫn, đến luyện tập, rồi tự làm — và ghi nhớ.')} />
        {p.skills.length === 0 ? (
          <EmptyState card icon={Sparkles} title={t('No skills yet', 'এখনো কোনো দক্ষতা নেই', 'अभी कोई कौशल नहीं', 'Chưa có kỹ năng')} action={<Button arrow to="/app/learn">{t('Start learning', 'শেখা শুরু করুন', 'सीखना शुरू करें', 'Bắt đầu học')}</Button>}>
            {t('Finish a lesson or a practice and your first skill will appear here.', 'একটি পাঠ বা অনুশীলন শেষ করলে প্রথম দক্ষতা এখানে দেখা যাবে।', 'एक पाठ या अभ्यास पूरा करें, पहला कौशल यहाँ दिखेगा।', 'Hoàn thành một bài học hoặc bài luyện để thấy kỹ năng đầu tiên ở đây.')}
          </EmptyState>
        ) : (
          <div className="card card-pad-0">
            <ul className="skill-list">
              {p.skills.map((s) => {
                const level = MASTERY[s.masteryLevel] ? s.masteryLevel : 'NEW';
                const independent = MASTERY_ORDER.indexOf(level) >= MASTERY_ORDER.indexOf('INDEPENDENT');
                return (
                  <li key={s.skillKey} className="skill-row">
                    <div className="skill-main">
                      <p className="list-item-title">{skillName(s.skillKey, t)}</p>
                      <p className="text-subtle">
                        {s.lastPracticedAt ? `${t('Last practised', 'শেষ অনুশীলন', 'पिछला अभ्यास', 'Luyện lần cuối')} ${formatRelative(s.lastPracticedAt, language)}` : t('Not practised yet', 'এখনো অনুশীলন হয়নি', 'अभी अभ्यास नहीं हुआ', 'Chưa luyện tập')}
                        {s.dueForReview && <> · <span style={{ color: 'var(--gold-700)', fontWeight: 700 }}>{t('Ready for review', 'ঝালিয়ে নেওয়ার সময়', 'दोहराने का समय', 'Nên ôn lại')}</span></>}
                      </p>
                    </div>
                    <MasteryPath level={level} t={t} />
                    <span className={`badge ${independent ? 'badge-ok' : 'badge-brand'} skill-level`}>{independent && <Star aria-hidden="true" />}{t(...MASTERY[level])}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
