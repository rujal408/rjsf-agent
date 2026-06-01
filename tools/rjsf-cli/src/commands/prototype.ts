import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveSessionDir, loadSession } from '../loaders/session-loader.js';
import { loadFormPlan } from '../loaders/plan-loader.js';
import { resolveChoices } from '../loaders/choices-loader.js';
import { generatePrototype } from '../generators/prototype-generator.js';

export interface PrototypeOptions {
  sessionDir?: string;
}

export async function runPrototype(options: PrototypeOptions): Promise<void> {
  const sessionDir = await resolveSessionDir(options.sessionDir);
  const session = await loadSession(sessionDir);
  const plan = await loadFormPlan(sessionDir);
  const choices = resolveChoices(session);

  const html = await generatePrototype(plan, choices);

  await mkdir(sessionDir, { recursive: true });
  const outputPath = join(sessionDir, 'prototype.html');
  await writeFile(outputPath, html, 'utf-8');

  console.log(`[rjsf-cli] prototype written: ${outputPath}`);
  console.log(`[rjsf-cli] size: ${(Buffer.byteLength(html) / 1024).toFixed(1)}KB`);
}
