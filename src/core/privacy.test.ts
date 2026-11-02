import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') ? [full] : [];
  });
}

/**
 * Guard against accidental data transmission: the app must stay fully offline,
 * so application source must not use any network API.
 */
describe('offline guarantee', () => {
  const files = sourceFiles(join(process.cwd(), 'src'));
  const forbidden = [/\bfetch\s*\(/, /XMLHttpRequest/, /\bWebSocket\b/, /sendBeacon/, /EventSource/, /https?:\/\//];

  it('finds source files to check', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const pattern of forbidden) {
    it(`has no use of ${pattern}`, () => {
      const offenders = files.filter((f) => pattern.test(readFileSync(f, 'utf8')));
      expect(offenders).toEqual([]);
    });
  }
});
