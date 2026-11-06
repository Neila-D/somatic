import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BodyCanvas } from './BodyCanvas';
import { PatternPreview } from './PatternPreview';
import { canRedo, canUndo, commit, createHistory, redo, undo } from '../core/history';
import type { History } from '../core/history';
import { DEFAULT_BRUSH, MAX_RADIUS, MAX_SPEED, MIN_RADIUS, MIN_SPEED, PALETTE, PATTERN_INFO } from '../core/patterns';
import {
  DEFAULT_LAYER_ID,
  ProjectError,
  clearStrokes,
  parseProject,
  removeStrokesNear,
  sampleProject,
  touch,
  upsertStroke,
} from '../core/project';
import { PATTERNS, VIEWS } from '../core/types';
import type { BrushSettings, PatternId, Point, Project, Stroke, Tool, ViewId } from '../core/types';
import { prefersReducedMotion } from '../motion';
import { isOnBody } from '../render/body';
import { exportPng } from '../render/view';
import { downloadBlob, downloadProject, loadFromStorage, saveToStorage } from '../storage';

const MIN_STEP = 2; // model units between recorded points

let counter = 0;
const newId = () => `s-${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

interface Drag {
  kind: Tool;
  view: ViewId;
  stroke?: Stroke;
}

export function Studio() {
  const [history, setHistory] = useState<History<Project>>(() => createHistory(loadFromStorage() ?? sampleProject()));
  const [draft, setDraft] = useState<Project | null>(null);
  const [tool, setTool] = useState<Tool>('paint');
  const [brush, setBrush] = useState<BrushSettings>(DEFAULT_BRUSH);
  const [showHelp, setShowHelp] = useState(false);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [message, setMessage] = useState<string | null>(null);

  const drag = useRef<Drag | null>(null);
  const work = useRef<Project | null>(null); // working copy while dragging
  const historyRef = useRef(history);
  historyRef.current = history;
  const fileInput = useRef<HTMLInputElement>(null);

  const project = draft ?? history.present;

  // Autosave locally (this browser only).
  useEffect(() => {
    saveToStorage(touch(history.present));
  }, [history.present]);

  const doUndo = useCallback(() => setHistory((h) => undo(h)), []);
  const doRedo = useCallback(() => setHistory((h) => redo(h)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        doUndo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        doRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doUndo, doRedo]);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage((m) => (m === text ? null : m)), 3000);
  };

  const begin = (view: ViewId, p: Point) => {
    if (tool === 'pan') return;
    const base = historyRef.current.present;
    if (tool === 'paint') {
      if (!isOnBody(p)) {
        flash('Painting is limited to the body.');
        return;
      }
      const stroke: Stroke = {
        id: newId(),
        layerId: DEFAULT_LAYER_ID,
        view,
        brush: { ...brush },
        points: [p],
        seed: Math.floor(Math.random() * 2 ** 31),
      };
      drag.current = { kind: 'paint', view, stroke };
      work.current = upsertStroke(base, stroke);
    } else {
      drag.current = { kind: 'erase', view };
      work.current = removeStrokesNear(base, view, p, brush.radius);
    }
    setDraft(work.current);
  };

  const move = (view: ViewId, p: Point) => {
    const d = drag.current;
    if (!d || !work.current || view !== d.view) return;
    if (d.kind === 'paint' && d.stroke) {
      if (!isOnBody(p)) return; // paint only goes on the body
      const last = d.stroke.points[d.stroke.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < MIN_STEP) return;
      d.stroke = { ...d.stroke, points: [...d.stroke.points, p] };
      work.current = upsertStroke(work.current, d.stroke);
    } else {
      work.current = removeStrokesNear(work.current, d.view, p, brush.radius);
    }
    setDraft(work.current);
  };

  const end = () => {
    const finished = work.current;
    drag.current = null;
    work.current = null;
    setDraft(null);
    if (finished) setHistory((h) => commit(h, finished));
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = parseProject(await file.text());
      setHistory((h) => commit(h, imported));
      flash(`Opened “${imported.name}”.`);
    } catch (err) {
      flash(err instanceof ProjectError ? err.message : 'Could not open that file.');
    }
  };

  const onExportPng = async () => {
    try {
      downloadBlob(await exportPng(project), 'somatic-scene.png');
    } catch {
      flash('Could not create the PNG.');
    }
  };

  const markCount = project.strokes.length;
  const setPattern = (pattern: PatternId) => setBrush((b) => ({ ...b, pattern }));
  const customColor = useMemo(() => !(PALETTE as readonly string[]).includes(brush.color), [brush.color]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Workspace / Visualization studio</div>
          <h1>Map a sensation, not just a location.</h1>
          <p className="lede">
            Experiment with visual encodings on a simplified body map. All examples are synthetic and stay in this
            browser tab.
          </p>
        </div>
        <div className="head-actions">
          <button className="btn" onClick={() => setShowHelp((s) => !s)} aria-expanded={showHelp}>
            How it works
          </button>
          <button className="btn btn-dark" onClick={() => downloadProject(touch(history.present))}>
            ↓ Export scene
          </button>
        </div>
      </header>

      {showHelp && (
        <div className="help card" role="region" aria-label="How it works">
          <ol>
            <li>Pick a pain brush, then set its colour, intensity, radius and animation speed.</li>
            <li>
              Click or drag on the front or back body map to paint. Paint only goes on the body. Switch to Erase to
              remove marks.
            </li>
            <li>
              Scroll over a body map to zoom (or use the + and − buttons). Use the Move tool, or the middle mouse
              button, to drag around while zoomed in.
            </li>
            <li>
              Undo / redo with the arrows or <kbd>Ctrl/⌘ Z</kbd> and <kbd>Ctrl/⌘ Shift Z</kbd>.
            </li>
            <li>
              Export the scene as editable JSON (or a PNG picture). Your work is also autosaved in this browser.
            </li>
          </ol>
          <p className="muted">
            These patterns are visual metaphors to explore, not established mappings between sensations and
            appearances. You decide what represents your experience.
          </p>
        </div>
      )}

      <div className="studio-grid">
        <section className="card canvas-card" aria-labelledby="canvas-title">
          <div className="card-head">
            <div>
              <div className="eyebrow">Canvas 01</div>
              <h2 id="canvas-title">Body visualization</h2>
            </div>
            <div className="toolbar">
              <div className="segmented" role="group" aria-label="Tool">
                <button className={tool === 'paint' ? 'on' : ''} onClick={() => setTool('paint')} aria-pressed={tool === 'paint'}>
                  ✎ Paint
                </button>
                <button className={tool === 'erase' ? 'on' : ''} onClick={() => setTool('erase')} aria-pressed={tool === 'erase'}>
                  ⌫ Erase
                </button>
                <button className={tool === 'pan' ? 'on' : ''} onClick={() => setTool('pan')} aria-pressed={tool === 'pan'}>
                  ✥ Move
                </button>
              </div>
              <button className="icon-btn" onClick={doUndo} disabled={!canUndo(history)} aria-label="Undo" title="Undo">
                ↶
              </button>
              <button className="icon-btn" onClick={doRedo} disabled={!canRedo(history)} aria-label="Redo" title="Redo">
                ↷
              </button>
              <button className="link-btn" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
                {playing ? '⏸ Pause motion' : '▶ Play motion'}
              </button>
              <button
                className="link-btn"
                onClick={() => setHistory((h) => commit(h, clearStrokes(h.present)))}
                disabled={history.present.strokes.length === 0}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="views">
            {VIEWS.map((view) => (
              <figure className="view" key={view}>
                <figcaption>
                  <strong>{view === 'anterior' ? 'Anterior' : 'Posterior'}</strong>
                  <span>{view === 'anterior' ? 'Front view' : 'Back view'}</span>
                </figcaption>
                <BodyCanvas
                  view={view}
                  project={project}
                  tool={tool}
                  playing={playing}
                  onBegin={begin}
                  onMove={move}
                  onEnd={end}
                />
                <div className="hint">
                  {tool === 'pan' ? 'Drag to move around' : `Drag to ${tool} on the body`} · scroll to zoom
                </div>
              </figure>
            ))}
          </div>

          <footer className="canvas-foot">
            <span className="status">
              <i className="dot" /> {project.name} · {markCount} {markCount === 1 ? 'mark' : 'marks'} · autosaved locally
            </span>
            <span className="foot-actions">
              <button className="link-btn" onClick={onExportPng}>
                Export PNG
              </button>
              <button className="link-btn" onClick={() => fileInput.current?.click()}>
                Open scene…
              </button>
              <button className="link-btn accent" onClick={() => setHistory((h) => commit(h, sampleProject()))}>
                Reset sample ↗
              </button>
            </span>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                void onImport(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </footer>
          {message && (
            <div className="toast" role="status">
              {message}
            </div>
          )}
        </section>

        <aside className="card panel" aria-labelledby="appearance-title">
          <div className="eyebrow">Visual language</div>
          <h2 id="appearance-title">Appearance</h2>
          <p className="muted small">Pick a brush named for a pain quality, then adjust it until it looks right to you.</p>

          <div className="section-label">
            <span>Pain brush</span>
            <span>{PATTERNS.length} brushes</span>
          </div>
          <div className="pattern-grid" role="radiogroup" aria-label="Pain brush">
            {PATTERNS.map((id) => (
              <button
                key={id}
                role="radio"
                aria-checked={brush.pattern === id}
                className={`pattern ${brush.pattern === id ? 'on' : ''}`}
                onClick={() => setPattern(id)}
                title={PATTERN_INFO[id].description}
              >
                <PatternPreview
                  pattern={id}
                  color={brush.color}
                  intensity={brush.intensity}
                  speed={brush.speed}
                  animate={playing}
                />
                <span>{PATTERN_INFO[id].label}</span>
              </button>
            ))}
          </div>
          <p className="brush-note" aria-live="polite">
            <strong>{PATTERN_INFO[brush.pattern].label}.</strong> {PATTERN_INFO[brush.pattern].description}
          </p>

          <div className="section-label">
            <span>Color palette</span>
            <span>Customizable</span>
          </div>
          <div className="swatches" role="radiogroup" aria-label="Colour">
            {PALETTE.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={brush.color === c}
                aria-label={`Colour ${c}`}
                className={`swatch ${brush.color === c ? 'on' : ''}`}
                style={{ background: c }}
                onClick={() => setBrush((b) => ({ ...b, color: c }))}
              />
            ))}
            <label className={`swatch custom ${customColor ? 'on' : ''}`} title="Custom colour">
              <span style={customColor ? { background: brush.color } : undefined}>{customColor ? '' : '+'}</span>
              <input
                type="color"
                value={brush.color}
                aria-label="Custom colour"
                onChange={(e) => setBrush((b) => ({ ...b, color: e.target.value }))}
              />
            </label>
          </div>

          <div className="section-label">
            <span>Visual intensity</span>
            <strong>{Math.round(brush.intensity * 100)}%</strong>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            value={Math.round(brush.intensity * 100)}
            aria-label="Visual intensity"
            onChange={(e) => setBrush((b) => ({ ...b, intensity: Number(e.target.value) / 100 }))}
          />
          <div className="range-ends">
            <span>Subtle</span>
            <span>Strong</span>
          </div>

          <div className="section-label">
            <span>Brush radius</span>
            <strong>{brush.radius}</strong>
          </div>
          <input
            type="range"
            min={MIN_RADIUS}
            max={MAX_RADIUS}
            value={brush.radius}
            aria-label="Brush radius"
            onChange={(e) => setBrush((b) => ({ ...b, radius: Number(e.target.value) }))}
          />
          <div className="range-ends">
            <span>Focused</span>
            <span>Diffuse</span>
          </div>

          <div className="section-label">
            <span>Animation speed</span>
            <strong>{brush.speed === 0 ? 'Still' : `${Math.round(brush.speed * 100)}%`}</strong>
          </div>
          <input
            type="range"
            min={MIN_SPEED}
            max={MAX_SPEED}
            step={0.1}
            value={brush.speed}
            aria-label="Animation speed"
            onChange={(e) => setBrush((b) => ({ ...b, speed: Number(e.target.value) }))}
          />
          <div className="range-ends">
            <span>Still</span>
            <span>Fast</span>
          </div>

          <div className="principle">
            <strong>Research principle</strong>
            <p>
              Brush names are common pain descriptors, but the looks are only metaphors. Shape, color and motion can
              each affect interpretation, so you decide what matches your experience.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
