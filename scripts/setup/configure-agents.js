#!/usr/bin/env node

const path = require('path');
const readline = require('readline');
const {
  loadWorkspaceConfig,
  applyAgentMode,
  normalizeAgentMode
} = require('../utils/agent-config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

function parseModeArg(argv) {
  const modeFlagIndex = argv.findIndex(arg => arg === '--mode' || arg === '-m');
  if (modeFlagIndex === -1) return null;
  return argv[modeFlagIndex + 1] || null;
}

async function selectModeInteractive(currentMode) {
  console.log('\nSelect agent mode:');
  console.log(`  1. codex`);
  console.log(`  2. claude`);
  console.log(`  3. both (current: ${currentMode})`);
  console.log('  4. none');
  const input = await ask('Choose (1-4, default 3): ');
  const selected = ['codex', 'claude', 'both', 'none'][parseInt(input || '3', 10) - 1];
  return normalizeAgentMode(selected || 'both');
}

function printEffects(workspaceRoot, effects) {
  for (const effect of effects) {
    const relativePath = path.relative(workspaceRoot, effect.path);
    if (effect.action === 'remove' || effect.action === 'remove_link') {
      console.log(`- removed ${relativePath}`);
    } else if (effect.action === 'seed') {
      const from = path.relative(workspaceRoot, effect.from);
      console.log(`- seeded ${relativePath} from ${from}`);
    } else if (effect.action === 'link') {
      console.log(`- linked ${relativePath}`);
    } else if (effect.action === 'copy') {
      console.log(`- copied ${relativePath}`);
    } else if (effect.action === 'skip_existing') {
      console.log(`- kept existing ${relativePath}`);
    } else if (effect.action === 'keep' || effect.action === 'keep_existing') {
      console.log(`- kept ${relativePath}`);
    } else {
      console.log(`- wrote ${relativePath}`);
    }
  }
}

async function main() {
  const workspaceRoot = process.cwd();
  const loaded = loadWorkspaceConfig({ cwd: workspaceRoot });
  const currentMode = loaded.config.agent && loaded.config.agent.mode
    ? loaded.config.agent.mode
    : 'both';

  console.log('Agent Configuration');
  console.log('===================');
  console.log(`Config source: ${path.relative(workspaceRoot, loaded.sourcePath)}`);
  console.log(`Current mode: ${currentMode}`);

  let nextMode = parseModeArg(process.argv.slice(2));
  if (!nextMode) {
    nextMode = await selectModeInteractive(currentMode);
  } else {
    nextMode = normalizeAgentMode(nextMode);
  }

  const result = applyAgentMode(nextMode, {
    cwd: workspaceRoot,
    syncLegacyClaudeConfig: true
  });

  console.log(`\nApplied mode: ${result.mode}`);
  printEffects(workspaceRoot, result.effects);

  rl.close();
}

main().catch(error => {
  console.error(`Failed: ${error.message}`);
  rl.close();
  process.exit(1);
});
