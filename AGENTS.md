# AGENTS.md

## Project Skill System

This repository uses a skills-first model. Custom slash commands have been
migrated into skills.

- Skill source root: `06_Meta/skills/`
- Compatibility links: `.claude/skills/` and `.agents/skills/`
- Skill format: `06_Meta/skills/<skill-name>/SKILL.md`
- Invocation style: keep existing slash names (for example:
  `/thinking-partner`, `/daily-review`, `/upgrade`)
- Skill creation entry: `/create-skill` and `npm run create-skill`

## Available Project Skills

- `thinking-partner`
- `quick-capture`
- `inbox-processor`
- `research-assistant`
- `daily-review`
- `weekly-synthesis`
- `draft-content`
- `de-ai-ify`
- `upgrade`
- `create-skill`

## Trigger Rules

Use the corresponding skill whenever the user request clearly matches one of
the workflows above. Prefer reading only the needed `SKILL.md` files to keep
context small.

## Migration Note

The legacy `.claude/commands/` directory is intentionally removed.
