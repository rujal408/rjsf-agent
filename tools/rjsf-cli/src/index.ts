#!/usr/bin/env node
import { Command } from 'commander';
import { runPrototype } from './commands/prototype.js';
import { runScaffold } from './commands/scaffold.js';

const program = new Command();

program
  .name('rjsf-cli')
  .description('Generate RJSF prototypes and React scaffolding from form plans')
  .version('1.0.0');

program
  .command('prototype')
  .description('Generate a self-contained HTML prototype from form-plan.json')
  .option('-s, --session-dir <path>', 'Path to session directory')
  .action(async (options) => {
    try {
      await runPrototype({ sessionDir: options.sessionDir });
    } catch (err) {
      console.error(`[rjsf-cli] error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('scaffold')
  .description('Generate React/RJSF source files from form-plan.json')
  .option('-s, --session-dir <path>', 'Path to session directory')
  .option('-o, --output-dir <path>', 'Output directory (overrides session outputPath)')
  .option('--dry-run', 'Print file tree without writing')
  .action(async (options) => {
    try {
      await runScaffold({
        sessionDir: options.sessionDir,
        outputDir: options.outputDir,
        dryRun: options.dryRun,
      });
    } catch (err) {
      console.error(`[rjsf-cli] error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
