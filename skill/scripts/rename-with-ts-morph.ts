import path from 'node:path'
import { Project, SyntaxKind } from 'ts-morph'

interface RenameArgs {
  file: string
  line: number
  col: number
  newName: string
  tsconfig?: string
}

function parseArgs(): RenameArgs {
  const argv = process.argv.slice(2)
  const raw: Record<string, string> = {}

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      raw[arg.slice(2)] = argv[i + 1]
      i++
    }
  }

  const { file, line, col, newName, tsconfig } = raw
  if (!file || !line || !col || !newName) {
    console.error(
      'Usage: rename-with-ts-morph --file <path> --line <n> --col <n> --newName <name> [--tsconfig <path>]',
    )
    process.exit(1)
  }

  return {
    file,
    line: Number(line),
    col: Number(col),
    newName,
    tsconfig,
  }
}

function main() {
  const { file, line, col, newName, tsconfig } = parseArgs()

  const project = new Project({
    tsConfigFilePath: path.resolve(tsconfig ?? 'tsconfig.json'),
  })

  const filePath = path.resolve(file)
  const sourceFile = project.getSourceFileOrThrow(filePath)

  const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(line - 1, col - 1)
  const node = sourceFile.getDescendantAtPos(pos)
  if (!node) {
    console.error(`No node found at ${file}:${line}:${col}`)
    process.exit(1)
  }

  const identifierNode =
    node.getKind() === SyntaxKind.Identifier ? node : node.getFirstAncestorByKind(SyntaxKind.Identifier)
  if (!identifierNode) {
    console.error(`No identifier found at ${file}:${line}:${col}`)
    process.exit(1)
  }

  const identifier = identifierNode.asKindOrThrow(SyntaxKind.Identifier)
  const oldName = identifier.getText()
  identifier.rename(newName)
  project.saveSync()

  console.log(`Renamed "${oldName}" -> "${newName}" at ${file}:${line}:${col} (all references updated).`)
  console.log('Next: run `tsc --noEmit` to confirm the rename did not break anything.')
}

main()
