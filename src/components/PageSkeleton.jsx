import { Skeleton } from './ui';

// Layout-shaped placeholders shown while a page's code loads, so the
// screen keeps its structure instead of flashing blank.
export function PageSkeleton({ kind = 'cards' }) {
  return (
    <div className="page" aria-busy="true" aria-label="Loading">
      <div className="stack" style={{ '--gap': '12px' }}>
        <Skeleton width={140} height={16} />
        <Skeleton variant="title" />
        <Skeleton width="70%" />
      </div>
      {kind === 'home' && (
        <div className="grid" style={{ '--min': '240px' }}>
          <Skeleton variant="tile" count={4} />
        </div>
      )}
      {kind === 'cards' && (
        <div className="grid" style={{ '--min': '280px' }}>
          <Skeleton variant="card" count={6} />
        </div>
      )}
      {kind === 'list' && (
        <div className="stack">
          <Skeleton variant="card" height={96} count={4} />
        </div>
      )}
      {kind === 'chat' && (
        <div className="stack">
          <Skeleton variant="card" height={360} />
          <Skeleton variant="card" height={72} />
        </div>
      )}
      {kind === 'panel' && (
        <div className="grid" style={{ '--min': '360px' }}>
          <Skeleton variant="card" height={380} />
          <Skeleton variant="card" height={380} />
        </div>
      )}
    </div>
  );
}
