import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const SKILL_NAME = 'ts-abbr-skill'

/** Files that hold user customizations — never overwrite these if they already exist at the target. */
const PROTECTED_RELATIVE_PATHS = ['config/default.config.json', 'dictionary/default.json']

export type InstallScope = 'project' | 'global'
export type Agent = 'claude-code' | 'codex'

const AGENT_SKILLS_DIR: Record<Agent, { project: string; global: string }> = {
  'claude-code': { project: '.claude/skills', global: '.claude/skills' },
  codex: { project: '.agents/skills', global: '.codex/skills' },
}

export const AGENT_LABELS: Record<Agent, string> = {
  'claude-code': 'Claude Code',
  codex: 'Codex',
}

export function getSkillSourceDir(): string {
  return path.join(__dirname, '..', 'skills', SKILL_NAME)
}

export function getTargetDir(agent: Agent, scope: InstallScope, cwd: string): string {
  const relDir = AGENT_SKILLS_DIR[agent][scope]
  const base = scope === 'project' ? path.join(cwd, relDir) : path.join(os.homedir(), relDir)
  return path.join(base, SKILL_NAME)
}

function copyRecursive(srcDir: string, destDir: string, protectedRelPaths: Set<string>, relPrefix = ''): string[] {
  const skipped: string[] = []
  fs.mkdirSync(destDir, { recursive: true })

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      skipped.push(...copyRecursive(srcPath, destPath, protectedRelPaths, relPath))
      continue
    }

    if (protectedRelPaths.has(relPath) && fs.existsSync(destPath)) {
      skipped.push(relPath)
      continue
    }

    fs.copyFileSync(srcPath, destPath)
  }

  return skipped
}

export interface InstallResult {
  targetDir: string
  skippedExisting: string[]
}

export function installSkill(agent: Agent, scope: InstallScope, cwd: string = process.cwd()): InstallResult {
  const srcDir = getSkillSourceDir()
  const targetDir = getTargetDir(agent, scope, cwd)
  const skippedExisting = copyRecursive(srcDir, targetDir, new Set(PROTECTED_RELATIVE_PATHS))
  return { targetDir, skippedExisting }
}
