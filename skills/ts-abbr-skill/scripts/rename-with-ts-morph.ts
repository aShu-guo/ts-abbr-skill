import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Project, SyntaxKind } from 'ts-morph'

export interface RenameArgs {
  file: string
  line: number
  col: number
  newName: string
  tsconfig?: string
}

const USAGE =
  'Usage: rename-with-ts-morph --file <path> --line <n> --col <n> --newName <name> [--tsconfig <path>]'

/** A conservative check for a valid single JS/TS identifier (no keywords check — ts-morph will surface real conflicts). */
const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/

/**
 * Parse `--flag value` and `--flag=value` forms. A `--flag` immediately followed
 * by another `--flag` is treated as a missing value rather than silently consuming it.
 */
export function parseArgs(argv: string[]): RenameArgs {
  const raw: Record<string, string> = {}

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue

    const eq = arg.indexOf('=')
    if (eq !== -1) {
      raw[arg.slice(2, eq)] = arg.slice(eq + 1)
      continue
    }

    const key = arg.slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) {
      // Missing value — leave unset so validation below reports it.
      continue
    }
    raw[key] = next
    i++
  }

  const { file, line, col, newName, tsconfig } = raw
  if (!file || !line || !col || !newName) {
    throw new Error(`Missing required argument.\n${USAGE}`)
  }

  const lineNum = Number(line)
  const colNum = Number(col)
  if (!Number.isInteger(lineNum) || lineNum < 1) {
    throw new Error(`--line must be a positive integer (1-based), got: ${line}`)
  }
  if (!Number.isInteger(colNum) || colNum < 1) {
    throw new Error(`--col must be a positive integer (1-based), got: ${col}`)
  }
  if (!IDENTIFIER_RE.test(newName)) {
    throw new Error(`--newName is not a valid identifier: ${newName}`)
  }

  return { file, line: lineNum, col: colNum, newName, tsconfig }
}

export interface RenameResult {
  oldName: string
  newName: string
}

/** Perform an AST-aware rename and persist it. Throws on any resolution failure. */
export function renameIdentifier(args: RenameArgs): RenameResult {
  const { file, line, col, newName, tsconfig } = args

  const project = new Project({
    tsConfigFilePath: path.resolve(tsconfig ?? 'tsconfig.json'),
  })

  const filePath = path.resolve(file)
  const sourceFile = project.getSourceFileOrThrow(filePath)

  const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(line - 1, col - 1)
  const node = sourceFile.getDescendantAtPos(pos)
  if (!node) {
    throw new Error(`No node found at ${file}:${line}:${col}`)
  }

  const identifierNode =
    node.getKind() === SyntaxKind.Identifier ? node : node.getFirstAncestorByKind(SyntaxKind.Identifier)
  if (!identifierNode) {
    throw new Error(`No identifier found at ${file}:${line}:${col}`)
  }

  const identifier = identifierNode.asKindOrThrow(SyntaxKind.Identifier)
  const oldName = identifier.getText()
  identifier.rename(newName)
  project.saveSync()

  return { oldName, newName }
}

function main() {
  let args: RenameArgs
  try {
    args = parseArgs(process.argv.slice(2))
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  }

  const { oldName, newName } = renameIdentifier(args)
  console.log(
    `Renamed "${oldName}" -> "${newName}" at ${args.file}:${args.line}:${args.col} (all references updated).`,
  )
  console.log('Next: run `tsc --noEmit` to confirm the rename did not break anything.')
}

// Only run when invoked directly, not when imported by tests.
const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === path.resolve(fileURLToPath(import.meta.url))) {
  try {
    main()
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}
