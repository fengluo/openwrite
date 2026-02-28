const fs = require('fs');
const path = require('path');

const PRIMARY_CONFIG_RELATIVE_PATH = path.join('06_Meta', 'config', 'system.json');
const LEGACY_CLAUDE_CONFIG_RELATIVE_PATH = path.join('.claude', 'config.json');
const PRIMARY_SKILLS_RELATIVE_PATH = path.join('06_Meta', 'skills');

const DEFAULT_CONFIG = Object.freeze({
  configVersion: 1,
  system: {
    version: '1.0.0',
    language: 'zh-CN',
    theme: 'default'
  },
  agent: {
    mode: 'both',
    updatedAt: null
  },
  features: {
    auto_sync: true,
    smart_commit: true,
    daily_review_reminder: true
  },
  scheduler: {
    daily_review: '0 21 * * *',
    weekly_synthesis: '0 18 * * 0',
    auto_sync: '0 */4 * * *'
  },
  paths: {
    inbox: '00_Inbox',
    projects: '01_Projects',
    areas: '02_Areas',
    resources: '03_Resources',
    archive: '04_Archive',
    attachments: '05_Attachments',
    templates: '06_Meta/Templates'
  },
  aliases: {
    tp: 'thinking-partner',
    qc: 'quick-capture',
    ip: 'inbox-processor',
    ra: 'research-assistant',
    dr: 'daily-review',
    ws: 'weekly-synthesis',
    dc: 'draft-content',
    dai: 'de-ai-ify'
  },
  defaults: {
    image_compression_quality: 85,
    web_save_directory: '03_Resources/Articles'
  }
});

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? base : override;
  }

  const merged = { ...base };
  for (const key of Object.keys(override)) {
    const baseValue = base[key];
    const overrideValue = override[key];
    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      merged[key] = deepMerge(baseValue, overrideValue);
    } else {
      merged[key] = overrideValue;
    }
  }
  return merged;
}

function normalizeAgentMode(mode) {
  const normalized = String(mode || '').toLowerCase();
  if (
    normalized === 'codex' ||
    normalized === 'claude' ||
    normalized === 'both' ||
    normalized === 'none'
  ) {
    return normalized;
  }
  return 'both';
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
}

function listDirectoryEntries(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath);
}

function isDirectory(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

function copyDirectoryContents(sourceDir, targetDir) {
  if (!isDirectory(sourceDir)) return;
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir)) {
    const sourceEntry = path.join(sourceDir, entry);
    const targetEntry = path.join(targetDir, entry);
    fs.cpSync(sourceEntry, targetEntry, { recursive: true, force: true });
  }
}

function listRelativeFilesRecursive(dirPath, baseDir = dirPath) {
  if (!isDirectory(dirPath)) return [];

  const items = fs.readdirSync(dirPath).sort();
  const files = [];

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...listRelativeFilesRecursive(fullPath, baseDir));
    } else if (stat.isFile()) {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files;
}

function areDirectoriesEquivalent(leftDir, rightDir) {
  if (!isDirectory(leftDir) || !isDirectory(rightDir)) {
    return false;
  }

  const leftFiles = listRelativeFilesRecursive(leftDir);
  const rightFiles = listRelativeFilesRecursive(rightDir);

  if (leftFiles.length !== rightFiles.length) {
    return false;
  }

  for (let i = 0; i < leftFiles.length; i += 1) {
    if (leftFiles[i] !== rightFiles[i]) {
      return false;
    }

    const leftPath = path.join(leftDir, leftFiles[i]);
    const rightPath = path.join(rightDir, rightFiles[i]);
    const leftContent = fs.readFileSync(leftPath);
    const rightContent = fs.readFileSync(rightPath);
    if (!leftContent.equals(rightContent)) {
      return false;
    }
  }

  return true;
}

function getPrimaryConfigPath(cwd = process.cwd()) {
  return path.join(cwd, PRIMARY_CONFIG_RELATIVE_PATH);
}

function getLegacyClaudeConfigPath(cwd = process.cwd()) {
  return path.join(cwd, LEGACY_CLAUDE_CONFIG_RELATIVE_PATH);
}

function resolveConfigSource(cwd = process.cwd()) {
  const primaryPath = getPrimaryConfigPath(cwd);
  const legacyPath = getLegacyClaudeConfigPath(cwd);

  if (fs.existsSync(primaryPath)) {
    return { sourceType: 'primary', sourcePath: primaryPath };
  }

  if (fs.existsSync(legacyPath)) {
    return { sourceType: 'legacy', sourcePath: legacyPath };
  }

  return { sourceType: 'default', sourcePath: primaryPath };
}

function loadWorkspaceConfig(options = {}) {
  const cwd = options.cwd || process.cwd();
  const { sourceType, sourcePath } = resolveConfigSource(cwd);
  const raw = sourceType === 'default' ? null : readJsonIfExists(sourcePath);
  const merged = deepMerge(DEFAULT_CONFIG, raw || {});

  if (sourceType === 'legacy' && (!raw || !raw.agent || !raw.agent.mode)) {
    merged.agent.mode = 'claude';
  }

  merged.agent.mode = normalizeAgentMode(merged.agent.mode);

  return {
    config: merged,
    sourceType,
    sourcePath
  };
}

function saveWorkspaceConfig(config, options = {}) {
  const cwd = options.cwd || process.cwd();
  const outputPath = getPrimaryConfigPath(cwd);
  writeJson(outputPath, config);
  return outputPath;
}

function toClaudeCompatibleConfig(config) {
  return {
    system: config.system,
    features: config.features,
    scheduler: config.scheduler,
    paths: config.paths,
    aliases: config.aliases,
    defaults: config.defaults
  };
}

function seedSkillsSource(cwd, sourceDir) {
  if (listDirectoryEntries(sourceDir).length > 0) {
    return null;
  }

  const legacyClaudeSkills = path.join(cwd, '.claude', 'skills');
  const legacyAgentsSkills = path.join(cwd, '.agents', 'skills');

  if (isDirectory(legacyClaudeSkills) && path.resolve(legacyClaudeSkills) !== path.resolve(sourceDir)) {
    copyDirectoryContents(legacyClaudeSkills, sourceDir);
    return legacyClaudeSkills;
  }

  if (isDirectory(legacyAgentsSkills) && path.resolve(legacyAgentsSkills) !== path.resolve(sourceDir)) {
    copyDirectoryContents(legacyAgentsSkills, sourceDir);
    return legacyAgentsSkills;
  }

  return null;
}

function ensureLinkedSkillsDir(sourceDir, targetDir) {
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  const relativeSource = path.relative(path.dirname(targetDir), sourceDir);

  if (fs.existsSync(targetDir)) {
    const stat = fs.lstatSync(targetDir);

    if (stat.isSymbolicLink()) {
      try {
        const currentRealPath = fs.realpathSync(targetDir);
        if (path.resolve(currentRealPath) === path.resolve(sourceDir)) {
          return { action: 'keep', path: targetDir };
        }
      } catch {
        // Broken symlink; recreate below.
      }
      fs.rmSync(targetDir, { force: true });
    } else {
      if (areDirectoriesEquivalent(sourceDir, targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      } else {
        return { action: 'skip_existing', path: targetDir };
      }
    }
  }

  try {
    fs.symlinkSync(relativeSource, targetDir, 'dir');
    if (fs.existsSync(targetDir) && fs.lstatSync(targetDir).isSymbolicLink()) {
      return { action: 'link', path: targetDir };
    }
    return { action: 'copy', path: targetDir };
  } catch {
    fs.mkdirSync(targetDir, { recursive: true });
    copyDirectoryContents(sourceDir, targetDir);
    return { action: 'copy', path: targetDir };
  }
}

function maybeRemoveLinkedDir(targetDir, sourceDir) {
  if (!fs.existsSync(targetDir)) return null;
  const stat = fs.lstatSync(targetDir);
  if (!stat.isSymbolicLink()) return { action: 'keep_existing', path: targetDir };

  let currentRealPath = null;
  try {
    currentRealPath = fs.realpathSync(targetDir);
  } catch {
    currentRealPath = null;
  }
  if (!currentRealPath || path.resolve(currentRealPath) !== path.resolve(sourceDir)) {
    return { action: 'keep_existing', path: targetDir };
  }

  fs.rmSync(targetDir, { force: true });
  return { action: 'remove_link', path: targetDir };
}

function syncSkillsTargets(mode, cwd) {
  const sourceDir = path.join(cwd, PRIMARY_SKILLS_RELATIVE_PATH);
  fs.mkdirSync(sourceDir, { recursive: true });

  const seededFrom = seedSkillsSource(cwd, sourceDir);
  const effects = [];

  if (seededFrom) {
    effects.push({ action: 'seed', path: sourceDir, from: seededFrom });
  }

  const claudeTarget = path.join(cwd, '.claude', 'skills');
  const codexTarget = path.join(cwd, '.agents', 'skills');

  const enableClaude = mode === 'claude' || mode === 'both';
  const enableCodex = mode === 'codex' || mode === 'both';

  if (enableClaude) {
    effects.push(ensureLinkedSkillsDir(sourceDir, claudeTarget));
  } else {
    const removed = maybeRemoveLinkedDir(claudeTarget, sourceDir);
    if (removed) effects.push(removed);
  }

  if (enableCodex) {
    effects.push(ensureLinkedSkillsDir(sourceDir, codexTarget));
  } else {
    const removed = maybeRemoveLinkedDir(codexTarget, sourceDir);
    if (removed) effects.push(removed);
  }

  return effects;
}

function applyAgentMode(mode, options = {}) {
  const cwd = options.cwd || process.cwd();
  const syncLegacyClaudeConfig = options.syncLegacyClaudeConfig !== false;
  const syncSkills = options.syncSkills !== false;
  const normalizedMode = normalizeAgentMode(mode);
  const { config } = loadWorkspaceConfig({ cwd });

  config.agent = {
    ...(config.agent || {}),
    mode: normalizedMode,
    updatedAt: new Date().toISOString()
  };

  const primaryPath = saveWorkspaceConfig(config, { cwd });
  const effects = [{ action: 'write', path: primaryPath }];

  if (syncLegacyClaudeConfig) {
    const legacyPath = getLegacyClaudeConfigPath(cwd);
    if (normalizedMode === 'claude' || normalizedMode === 'both') {
      writeJson(legacyPath, toClaudeCompatibleConfig(config));
      effects.push({ action: 'write', path: legacyPath });
    } else if (fs.existsSync(legacyPath)) {
      fs.rmSync(legacyPath, { force: true });
      effects.push({ action: 'remove', path: legacyPath });
    }
  }

  if (syncSkills) {
    const skillEffects = syncSkillsTargets(normalizedMode, cwd);
    effects.push(...skillEffects);
  }

  return {
    mode: normalizedMode,
    config,
    effects
  };
}

function resolveSkillsDir(options = {}) {
  const cwd = options.cwd || process.cwd();
  const createIfMissing = options.createIfMissing === true;
  const candidates = [
    path.join(cwd, PRIMARY_SKILLS_RELATIVE_PATH),
    path.join(cwd, '.claude', 'skills'),
    path.join(cwd, '.agents', 'skills')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  if (createIfMissing) {
    const preferred = candidates[0];
    fs.mkdirSync(preferred, { recursive: true });
    return preferred;
  }

  return candidates[0];
}

module.exports = {
  DEFAULT_CONFIG,
  PRIMARY_CONFIG_RELATIVE_PATH,
  LEGACY_CLAUDE_CONFIG_RELATIVE_PATH,
  normalizeAgentMode,
  loadWorkspaceConfig,
  saveWorkspaceConfig,
  applyAgentMode,
  resolveSkillsDir
};
