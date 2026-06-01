import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveSessionDir, loadSession } from '../loaders/session-loader.js';
import { loadFormPlan } from '../loaders/plan-loader.js';
import { resolveChoices } from '../loaders/choices-loader.js';
import { generateScaffold } from '../generators/scaffold-generator.js';

export interface ScaffoldOptions {
  sessionDir?: string;
  outputDir?: string;
  dryRun?: boolean;
}

export async function runScaffold(options: ScaffoldOptions): Promise<void> {
  const sessionDir = await resolveSessionDir(options.sessionDir);
  const session = await loadSession(sessionDir);
  const plan = await loadFormPlan(sessionDir);
  const choices = resolveChoices(session);

  const outputDir = options.outputDir ?? session.outputPath ?? `src/forms/${plan.formName}`;

  const files = await generateScaffold(plan, choices);

  if (options.dryRun) {
    console.log('[rjsf-cli] scaffold dry-run');
    console.log(`[rjsf-cli] output directory: ${outputDir}`);
    console.log('[rjsf-cli] files:');
    let totalSize = 0;
    for (const file of files) {
      const size = Buffer.byteLength(file.content);
      totalSize += size;
      const stub = file.isStub ? ' [STUB]' : '';
      console.log(`  ${file.path} (${(size / 1024).toFixed(1)}KB)${stub}`);
    }
    if (files.some((f) => f.isStub)) {
      console.log('[rjsf-cli] stubs requiring implementation:');
      for (const file of files.filter((f) => f.isStub)) {
        console.log(`  ${file.path} — ${file.stubReason ?? 'custom component'}`);
      }
    }
    console.log(`[rjsf-cli] total: ${files.length} files, ${(totalSize / 1024).toFixed(1)}KB`);
    return;
  }

  // Write all files
  for (const file of files) {
    const fullPath = join(outputDir, file.path);
    await mkdir(join(fullPath, '..'), { recursive: true });
    await writeFile(fullPath, file.content, 'utf-8');
  }

  console.log('[rjsf-cli] scaffold complete');
  console.log(`[rjsf-cli] output directory: ${outputDir}`);
  console.log('[rjsf-cli] files:');
  let totalSize = 0;
  for (const file of files) {
    const size = Buffer.byteLength(file.content);
    totalSize += size;
    const stub = file.isStub ? ' [STUB]' : '';
    console.log(`  ${file.path} (${(size / 1024).toFixed(1)}KB)${stub}`);
  }
  if (files.some((f) => f.isStub)) {
    console.log('[rjsf-cli] stubs requiring implementation:');
    for (const file of files.filter((f) => f.isStub)) {
      console.log(`  ${file.path} — ${file.stubReason ?? 'custom component'}`);
    }
  }
  console.log(`[rjsf-cli] total: ${files.length} files, ${(totalSize / 1024).toFixed(1)}KB`);
}
