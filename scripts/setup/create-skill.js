const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SKILLS_DIR = path.resolve(__dirname, '../../.claude/skills');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  { key: 'name', question: 'Skill Name (e.g., meeting-notes): ', required: true },
  { key: 'description', question: 'Short Description: ', required: true },
  { key: 'role', question: 'Skill Role (e.g., An expert meeting facilitator): ', required: true },
  { key: 'goal', question: 'Goal/Purpose: ', required: true },
  { key: 'workflow', question: 'Workflow Steps (comma separated): ', required: true },
  { key: 'dos', question: 'Do\'s (comma separated): ', required: false },
  { key: 'donts', question: 'Don\'ts (comma separated): ', required: false }
];

async function ask(q) {
  return new Promise(resolve => {
    rl.question(q, answer => resolve(answer.trim()));
  });
}

async function main() {
  console.log('✨ Claude Write Skill Creator');
  console.log('=============================');

  const answers = {};

  for (const q of questions) {
    let answer = '';
    while (!answer && q.required) {
      answer = await ask(q.question);
      if (!answer && q.required) console.log('  ❌ This field is required.');
    }
    answers[q.key] = answer;
  }

  const skillName = answers.name.startsWith('/') ? answers.name.substring(1) : answers.name;
  const normalizedName = skillName.toLowerCase().replace(/\s+/g, '-');
  const skillDir = path.join(SKILLS_DIR, normalizedName);
  const filePath = path.join(skillDir, 'SKILL.md');

  if (fs.existsSync(filePath)) {
    console.log(`\n❌ Skill file already exists: ${filePath}`);
    const overwrite = await ask('Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Aborted.');
      rl.close();
      return;
    }
  }

  const workflowSteps = answers.workflow.split(',').map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
  const dosList = answers.dos ? answers.dos.split(',').map(s => `- ✓ ${s.trim()}`).join('\n') : '- ✓ [Add specific guidelines]';
  const dontsList = answers.donts ? answers.donts.split(',').map(s => `- ✗ ${s.trim()}`).join('\n') : '- ✗ [Add restrictions]';

  const content = `---
name: ${normalizedName}
description: ${answers.description}
---

# ${normalizedName}

${answers.description}

You are ${answers.role}.

## Goal
${answers.goal}

## Workflow
${workflowSteps}

## Guidelines

### Do's
${dosList}

### Don'ts
${dontsList}

## Example
\`\`\`
User: /${normalizedName}
...
\`\`\`
`;

  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`\n✅ Skill created successfully: ${filePath}`);
  console.log(`\nTry it now: claude (then type /${normalizedName})`);

  rl.close();
}

main();
