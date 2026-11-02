import { parseProject, serializeProject } from './core/project';
import type { Project } from './core/types';

/** Everything stays in this browser. Nothing is sent anywhere. */
const KEY = 'somatic.project';

export function loadFromStorage(): Project | null {
  try {
    const text = localStorage.getItem(KEY);
    return text ? parseProject(text) : null;
  } catch {
    return null;
  }
}

export function saveToStorage(project: Project): boolean {
  try {
    localStorage.setItem(KEY, serializeProject(project));
    return true;
  } catch {
    return false;
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadProject(project: Project): void {
  const blob = new Blob([serializeProject(project)], { type: 'application/json' });
  downloadBlob(blob, `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'scene'}.somatic.json`);
}
