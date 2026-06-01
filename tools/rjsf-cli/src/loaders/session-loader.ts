import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { Session } from '../types/session.js';

/**
 * Resolve the active session directory. If --session-dir is provided, use it directly.
 * Otherwise, read .rjsf/active-session to find the active form name.
 */
export async function resolveSessionDir(sessionDirArg?: string): Promise<string> {
  if (sessionDirArg) {
    return resolve(sessionDirArg);
  }

  // Walk up from cwd to find .rjsf/active-session
  let dir = process.cwd();
  while (true) {
    const activeSessionPath = join(dir, '.rjsf', 'active-session');
    try {
      const formName = (await readFile(activeSessionPath, 'utf-8')).trim();
      return join(dir, '.rjsf', 'sessions', formName);
    } catch {
      const parent = resolve(dir, '..');
      if (parent === dir) break;
      dir = parent;
    }
  }

  throw new Error(
    'Could not find .rjsf/active-session. Pass --session-dir explicitly or run from within a project with an active RJSF session.'
  );
}

/**
 * Load and parse session.json from a session directory.
 */
export async function loadSession(sessionDir: string): Promise<Session> {
  const sessionPath = join(sessionDir, 'session.json');
  try {
    const raw = await readFile(sessionPath, 'utf-8');
    return JSON.parse(raw) as Session;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`session.json not found at ${sessionPath}. Is this a valid RJSF session directory?`);
    }
    throw new Error(`Failed to parse session.json at ${sessionPath}: ${(err as Error).message}`);
  }
}
