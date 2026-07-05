import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { parseArgs, renameIdentifier } from '../skills/ts-abbr-skill/scripts/rename-with-ts-morph.js'

test('parseArgs accepts --flag value form', () => {
  const args = parseArgs(['--file', 'a.ts', '--line', '3', '--col', '7', '--newName', 'biz'])
  assert.deepEqual(args, { file: 'a.ts', line: 3, col: 7, newName: 'biz', tsconfig: undefined })
})

test('parseArgs accepts --flag=value form', () => {
  const args = parseArgs(['--file=a.ts', '--line=3', '--col=7', '--newName=biz'])
  assert.equal(args.file, 'a.ts')
  assert.equal(args.line, 3)
  assert.equal(args.newName, 'biz')
})

test('parseArgs does not consume a following flag as a value', () => {
  // --newName has no value; --file should not be swallowed as its value.
  assert.throws(
    () => parseArgs(['--newName', '--file', 'a.ts', '--line', '1', '--col', '1']),
    /Missing required argument/,
  )
})

test('parseArgs rejects non-integer or non-positive line/col', () => {
  assert.throws(
    () => parseArgs(['--file', 'a.ts', '--line', 'abc', '--col', '1', '--newName', 'x']),
    /--line must be a positive integer/,
  )
  assert.throws(
    () => parseArgs(['--file', 'a.ts', '--line', '0', '--col', '1', '--newName', 'x']),
    /--line must be a positive integer/,
  )
})

test('parseArgs rejects an invalid identifier for --newName', () => {
  assert.throws(
    () => parseArgs(['--file', 'a.ts', '--line', '1', '--col', '1', '--newName', '1bad']),
    /not a valid identifier/,
  )
})

test('renameIdentifier updates all references via the AST, not string literals', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-abbr-rename-'))
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { strict: true }, include: ['*.ts'] }),
  )
  const file = path.join(dir, 'sample.ts')
  // `context` the identifier appears twice; the string "context" must stay untouched.
  const source = [
    'function run(context: number) {',
    '  const label = "context"',
    '  return context + context.toString().length + label.length',
    '}',
    'export {}',
  ].join('\n')
  fs.writeFileSync(file, source)

  // Column of `context` param: `function run(` = 14 chars before it (1-based col 14).
  const result = renameIdentifier({ file, line: 1, col: 14, newName: 'ctx', tsconfig: path.join(dir, 'tsconfig.json') })
  assert.equal(result.oldName, 'context')

  const updated = fs.readFileSync(file, 'utf8')
  assert.match(updated, /function run\(ctx: number\)/)
  assert.match(updated, /return ctx \+ ctx\.toString/)
  // The string literal must be preserved.
  assert.match(updated, /"context"/)
})
