import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Heart, MessageCircle, PlayCircle, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { TUTORIALS } from '../data/hardcoded';
import oldMan from '../../title_banner/old_man.png';

const TOTAL_LESSONS = Object.values(TUTORIALS).flat().length;

const ACTIONS = [
  {
    icon: <Users size={38}/>,
    tab: 'learn',
    title: 'Understand',
    body: 'Clear lessons for common digital tasks.',
  },
  {
    icon: <BookOpen size={38}/>,
    tab: 'practice',
    title: 'Practice',
    body: 'Try things safely before doing them for real.',
  },
  {
    icon: <ShieldCheck size={38}/>,
    tab: 'safety',
    title: 'Stay Safe',
    body: 'Check messages, links, and warning signs.',
  },
  {
    icon: <Heart size={38}/>,
    tab: 'memory',
    title: 'Remember',
    body: 'Keep useful lessons in your Memory Book.',
  },
];

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const { user, speak, setActiveTab, memoryEntries } = useApp();
  const { authedFetch } = useAuth();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authedFetch('/progress/me')
      .then(({ progress: p }) => { if (!cancelled) setProgress(p); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authedFetch]);

  const firstName = user?.name?.split(' ')[0] || 'friend';
  const overall = progress ? Math.round((progress.confidence + progress.competence) / 2) : 0;
  const recentActivity = memoryEntries.slice(0, 3);

  return (
    <div className="app-home">
      <section className="app-home-hero anim-up">
        <div className="app-home-photo">
          <img src={oldMan} alt="Older adult smiling while using a tablet" />
          <div className="app-home-photo-note">New skills. Brighter days.</div>
        </div>

        <div className="app-home-copy">
          <p className="app-home-kicker">{greetingForNow()}, {firstName}</p>
          <h1>Confident online living, at your pace.</h1>
          <p>
            Pick one small step for today. Guidia will keep it simple, safe,
            and easy to follow.
          </p>
          <div className="app-home-actions">
            <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('learn')}>
              Start Learning Today <ArrowRight size={22}/>
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => setActiveTab('safety')}>
              Explore the Guides
            </button>
          </div>
        </div>
      </section>

      <section className="app-action-row anim-up d1" aria-label="Guidia main actions">
        {ACTIONS.map((action) => (
          <button key={action.title} className="app-action-box" onClick={() => setActiveTab(action.tab)}>
            <span>{action.icon}</span>
            <strong>{action.title}</strong>
            <p>{action.body}</p>
          </button>
        ))}
      </section>

      <section className="app-home-lower anim-up d2">
        <div className="app-progress-panel">
          <div>
            <p className="app-section-label">Your progress</p>
            <h2>{overall}% confidence score</h2>
            <p>{progress?.lessonsCompleted ?? 0} of {TOTAL_LESSONS} lessons completed</p>
          </div>
          <button className="btn btn-outline" onClick={() => setActiveTab('progress')}>
            View Progress <ArrowRight size={18}/>
          </button>
        </div>

        <div className="app-recent-panel">
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <p className="app-section-label">Recent activity</p>
            <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('memory')}>View All</button>
          </div>
          {recentActivity.length === 0 ? (
            <p className="t-sub">Complete a lesson or safety check to see it here.</p>
          ) : (
            <div className="flex-col gap-12">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="app-recent-item">
                  <div>
                    <strong>{entry.title}</strong>
                    <p>{entry.date}</p>
                  </div>
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={() => speak(`${entry.title}. ${entry.summary}`)} aria-label="Replay memory">
                    <PlayCircle size={16}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="app-helper-panel">
          <MessageCircle size={34}/>
          <h2>Need help?</h2>
          <p>Ask Guidia to explain anything in simple steps.</p>
          <button className="btn btn-primary" onClick={() => setActiveTab('assistant')}>
            Ask Assistant
          </button>
        </div>
      </section>
    </div>
  );
}
