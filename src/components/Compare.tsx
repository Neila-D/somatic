import { useState } from 'react';
import { PatternPreview } from './PatternPreview';
import { PATTERN_INFO } from '../core/patterns';
import type { PatternId } from '../core/types';
import { prefersReducedMotion } from '../motion';

/**
 * Synthetic comparison exercise. The prompts are fictional and NO "correct"
 * answer is assumed — we only record which option the viewer prefers.
 * Nothing here is stored or transmitted.
 */
interface Trial {
  id: string;
  prompt: string;
  options: PatternId[];
}

const TRIALS: Trial[] = [
  { id: 't1', prompt: 'A dull sensation that feels broad and diffuse.', options: ['aching', 'pressure', 'stabbing'] },
  { id: 't2', prompt: 'A sudden, sharp sensation in one small spot.', options: ['stabbing', 'shooting', 'throbbing'] },
  { id: 't3', prompt: 'A sensation that feels rhythmic, like a beat.', options: ['throbbing', 'aching', 'radiating'] },
  { id: 't4', prompt: 'A prickly, scattered sensation across an area.', options: ['tingling', 'numbness', 'burning'] },
];

const COLOR = '#5d6b80'; // neutral, so only pattern differs between options

export function Compare() {
  const [choices, setChoices] = useState<Record<string, PatternId>>({});
  const [motion, setMotion] = useState(() => !prefersReducedMotion());
  const done = TRIALS.every((t) => choices[t.id]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Workspace / Compare visuals</div>
          <h1>Which visual feels closest?</h1>
          <p className="lede">
            A synthetic comparison exercise. For each fictional description, choose the visual that you feel best
            represents it. There are no right answers — these are preferences, and nothing is saved or sent.
          </p>
        </div>
        <div className="head-actions">
          <button className="btn" onClick={() => setMotion((m) => !m)} aria-pressed={motion}>
            {motion ? '⏸ Show still' : '▶ Show motion'}
          </button>
          <button className="btn" onClick={() => setChoices({})} disabled={Object.keys(choices).length === 0}>
            Reset exercise
          </button>
        </div>
      </header>

      <div className="trials">
        {TRIALS.map((trial, i) => (
          <section className="card trial" key={trial.id} aria-labelledby={`${trial.id}-p`}>
            <div className="eyebrow">Synthetic trial {i + 1} of {TRIALS.length}</div>
            <h2 id={`${trial.id}-p`}>“{trial.prompt}”</h2>
            <div className="options" role="radiogroup" aria-labelledby={`${trial.id}-p`}>
              {trial.options.map((id) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={choices[trial.id] === id}
                  className={`option ${choices[trial.id] === id ? 'on' : ''}`}
                  onClick={() => setChoices((c) => ({ ...c, [trial.id]: id }))}
                >
                  <PatternPreview
                    pattern={id}
                    color={COLOR}
                    intensity={0.8}
                    radius={22}
                    width={150}
                    height={90}
                    animate={motion}
                  />
                  <span>{PATTERN_INFO[id].label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {done && (
        <section className="card results" aria-live="polite">
          <div className="eyebrow">Your selections</div>
          <table>
            <tbody>
              {TRIALS.map((t) => (
                <tr key={t.id}>
                  <td>{t.prompt}</td>
                  <td>
                    <strong>{PATTERN_INFO[choices[t.id]].label}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">
            Preferences vary between people, and this tiny exercise cannot show how well any visual communicates an
            experience.
          </p>
        </section>
      )}
    </div>
  );
}
