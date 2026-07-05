import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { getTargetDir, installSkill, SKILL_NAME } from '../src/install.js'

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ts-abbr-test-'))
}

test('installSkill copies the full skill tree into a project scope', () => {
  const cwd = tmpDir()
  const { targetDir, skippedExisting } = installSkill('claude-code', 'project', cwd)

  assert.equal(targetDir, path.join(cwd, '.claude/skills', SKILL_NAME))
  assert.ok(fs.existsSync(path.join(targetDir, 'SKILL.md')))
  assert.ok(fs.existsSync(path.join(targetDir, 'config/default.config.json')))
  assert.ok(fs.existsSync(path.join(targetDir, 'dictionary/default.json')))
  assert.ok(fs.existsSync(path.join(targetDir, 'scripts/rename-with-ts-morph.ts')))
  assert.deepEqual(skippedExisting, [])
})

test('installSkill does not overwrite existing user customizations', () => {
  const cwd = tmpDir()
  // First install lays down defaults.
  const { targetDir } = installSkill('claude-code', 'project', cwd)

  // User customizes the dictionary.
  const dictPath = path.join(targetDir, 'dictionary/default.json')
  const customized = '{"custom":"c"}'
  fs.writeFileSync(dictPath, customized)

  // Second install must preserve it and report the skip.
  const { skippedExisting } = installSkill('claude-code', 'project', cwd)
  assert.ok(skippedExisting.includes('dictionary/default.json'))
  assert.ok(skippedExisting.includes('config/default.config.json'))
  assert.equal(fs.readFileSync(dictPath, 'utf8'), customized)
})

test('installSkill overwrites non-protected files on reinstall', () => {
  const cwd = tmpDir()
  const { targetDir } = installSkill('claude-code', 'project', cwd)

  const skillMd = path.join(targetDir, 'SKILL.md')
  fs.writeFileSync(skillMd, 'stale')

  installSkill('claude-code', 'project', cwd)
  assert.notEqual(fs.readFileSync(skillMd, 'utf8'), 'stale')
})

test('getTargetDir resolves global scope under the home directory', () => {
  const dir = getTargetDir('claude-code', 'global', '/irrelevant/cwd')
  assert.equal(dir, path.join(os.homedir(), '.claude/skills', SKILL_NAME))
})

test('getTargetDir uses distinct project vs global paths for codex', () => {
  const project = getTargetDir('codex', 'project', '/repo')
  const global = getTargetDir('codex', 'global', '/repo')
  assert.equal(project, path.join('/repo', '.agents/skills', SKILL_NAME))
  assert.equal(global, path.join(os.homedir(), '.codex/skills', SKILL_NAME))
})
