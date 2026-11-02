import { describe, expect, it } from 'vitest';
import { MAX_HISTORY, canRedo, canUndo, commit, createHistory, redo, undo } from './history';

describe('history', () => {
  it('undoes and redoes commits', () => {
    let h = createHistory(0);
    h = commit(h, 1);
    h = commit(h, 2);
    expect(h.present).toBe(2);
    h = undo(h);
    expect(h.present).toBe(1);
    h = undo(h);
    expect(h.present).toBe(0);
    expect(canUndo(h)).toBe(false);
    h = redo(h);
    h = redo(h);
    expect(h.present).toBe(2);
    expect(canRedo(h)).toBe(false);
  });

  it('clears redo after a new commit', () => {
    let h = createHistory(0);
    h = commit(h, 1);
    h = undo(h);
    h = commit(h, 5);
    expect(canRedo(h)).toBe(false);
    expect(h.present).toBe(5);
  });

  it('ignores a commit of the identical object', () => {
    const state = { a: 1 };
    const h = createHistory(state);
    expect(commit(h, state)).toBe(h);
  });

  it('caps the number of undo steps', () => {
    let h = createHistory(0);
    for (let i = 1; i <= MAX_HISTORY + 20; i++) h = commit(h, i);
    expect(h.past.length).toBe(MAX_HISTORY);
  });

  it('undo/redo at the ends is a no-op', () => {
    const h = createHistory('x');
    expect(undo(h)).toBe(h);
    expect(redo(h)).toBe(h);
  });
});
