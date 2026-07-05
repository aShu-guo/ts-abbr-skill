import prompts from 'prompts'
import { installSkill, type InstallScope } from './install.js'

async function main() {
  console.log('ts-abbreviation-skill installer\n')

  const { scopes } = await prompts({
    type: 'multiselect',
    name: 'scopes',
    message: 'Where should this skill be installed?',
    choices: [
      { title: 'This project (./.claude/skills/)', value: 'project', selected: true },
      { title: 'Global (~/.claude/skills/)', value: 'global' },
    ],
    min: 1,
  })

  if (!scopes || scopes.length === 0) {
    console.log('No install scope selected, aborting.')
    process.exit(1)
  }

  for (const scope of scopes as InstallScope[]) {
    const { targetDir, skippedExisting } = installSkill(scope)
    console.log(`\n✔ Installed to ${targetDir}`)
    if (skippedExisting.length > 0) {
      console.log(`  Kept existing customizations (not overwritten): ${skippedExisting.join(', ')}`)
    }
  }

  console.log('\nNext steps:')
  console.log('  - Restart/reopen Claude Code so it picks up the new skill.')
  console.log('  - Customize scope/exported in <target>/config/default.config.json if needed.')
  console.log('  - Add project-specific abbreviations via .claude/ts-abbreviation.local.json in your repo.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
