import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const SKILL_NAME = 'ts-abbreviation-skill'

/** Files that hold user customizations — never overwrite these if they already exist at the target. */
const PROTECTED_RELATIVE_PATHS = ['config/default.config.json', 'dictionary/default.json']

export type InstallScope = 'project' | 'global'

export function getSkillSourceDir(): string {
  return path.join(__dirname, '..', 'skill')
}

export function getTargetDir(scope: InstallScope, cwd: string): string {
  const base = scope === 'project' ? path.join(cwd, '.claude', 'skills') : path.join(os.homedir(), '.claude', 'skills')
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

export function installSkill(scope: InstallScope, cwd: string = process.cwd()): InstallResult {
  const srcDir = getSkillSourceDir()
  const targetDir = getTargetDir(scope, cwd)
  const skippedExisting = copyRecursive(srcDir, targetDir, new Set(PROTECTED_RELATIVE_PATHS))
  return { targetDir, skippedExisting }
}
