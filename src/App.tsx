import { useState } from 'react';
import { Compare } from './components/Compare';
import { Notes } from './components/Notes';
import { Sidebar } from './components/Sidebar';
import type { PageId } from './components/Sidebar';
import { Studio } from './components/Studio';

export function App() {
  const [page, setPage] = useState<PageId>('studio');
  return (
    <div className="shell">
      <Sidebar page={page} onNavigate={setPage} />
      <div className="main">
        <div className="topbar">
          <span className="status">
            <i className="dot" /> Research prototype
          </span>
          <span className="topbar-right">LOCAL SANDBOX &nbsp;/&nbsp; v0.1.0</span>
        </div>
        {/* Studio stays mounted so an in-progress scene is never lost by switching pages. */}
        <div hidden={page !== 'studio'}>
          <Studio />
        </div>
        {page === 'compare' && <Compare />}
        {page === 'notes' && <Notes />}
        <footer className="app-foot">
          <span>Somatic Research Studio · Concept prototype</span>
          <span>Experimental visuals only. Not a medical tool.</span>
        </footer>
      </div>
    </div>
  );
}
