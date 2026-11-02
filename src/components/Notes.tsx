export function Notes() {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Workspace / Research notes</div>
          <h1>Methods &amp; next steps</h1>
          <p className="lede">Where this prototype is going, and the boundaries it keeps.</p>
        </div>
      </header>

      <div className="notes-grid">
        <section className="card">
          <div className="eyebrow">Core question</div>
          <p>
            Which visual elements — colors, patterns, textures, movement, intensity and spatial position — do people
            feel best represent their pain experiences? And how do people communicate how those experiences change
            over time?
          </p>
          <p className="muted">Nothing here assumes those questions have established answers.</p>
        </section>

        <section className="card">
          <div className="eyebrow">Boundaries</div>
          <ul>
            <li>Synthetic data only. No real patient information is collected or transmitted.</li>
            <li>Works fully offline. No AI, no model APIs, no network requests.</li>
            <li>Not a medical tool: no diagnosis, no treatment suggestions.</li>
            <li>Human-subject research would need a protocol, consent, privacy protections and ethics review first.</li>
          </ul>
        </section>

        <section className="card wide">
          <div className="eyebrow">Roadmap</div>
          <ol>
            <li>
              <strong>Phase 1 (this version):</strong> stable 2D studio — paint, erase, undo/redo, save, reopen, export.
            </li>
            <li>
              <strong>Phase 2:</strong> 3D body viewer with rotation, zoom and surface painting.
            </li>
            <li>
              <strong>Phase 3:</strong> full 3D brush engine, layers and animated effects.
            </li>
            <li>
              <strong>Phase 4:</strong> timeline of recorded pain states, with optional, clearly labelled transitions.
            </li>
            <li>
              <strong>Phase 5:</strong> custom brush editor and reproducible synthetic comparison exercises.
            </li>
          </ol>
          <p className="muted small">See ROADMAP.md in the repository for acceptance criteria.</p>
        </section>
      </div>
    </div>
  );
}
