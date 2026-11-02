export type PageId = 'studio' | 'compare' | 'notes';

const ITEMS: { id: PageId; label: string; sub: string; icon: string }[] = [
  { id: 'studio', label: 'Visualization studio', sub: 'Build concepts', icon: '◌' },
  { id: 'compare', label: 'Compare visuals', sub: 'Synthetic trials', icon: '▯' },
  { id: 'notes', label: 'Research notes', sub: 'Methods & next steps', icon: '☰' },
];

export function Sidebar({ page, onNavigate }: { page: PageId; onNavigate: (p: PageId) => void }) {
  return (
    <nav className="sidebar" aria-label="Workspace">
      <div className="brand">
        <div className="logo" aria-hidden="true">
          S
        </div>
        <div>
          <div className="brand-name">somatic</div>
          <div className="brand-sub">RESEARCH STUDIO</div>
        </div>
      </div>

      <div className="nav-label">WORKSPACE</div>
      <ul className="nav">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <button
              className={page === item.id ? 'on' : ''}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.sub}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="offline-card">
        <div className="spark" aria-hidden="true">
          ✳
        </div>
        <strong>Offline preview</strong>
        <p>Explore how visual language might communicate pain.</p>
        <span className="pill">
          <i className="dot" /> 100% offline · No AI
        </span>
      </div>
    </nav>
  );
}
