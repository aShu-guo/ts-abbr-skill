import prompts from 'prompts'
import { installSkill, AGENT_LABELS, type Agent, type InstallScope } from './install.js'

async function main() {
  console.log('ts-abbr-skill installer\n')

  const { agents } = await prompts({
    type: 'multiselect',
    name: 'agents',
    message: 'Which AI coding agent(s) should this skill be installed for?',
    choices: [
      { title: AGENT_LABELS['claude-code'], value: 'claude-code', selected: true },
      { title: AGENT_LABELS['codex'], value: 'codex' },
    ],
    min: 1,
  })

  if (!agents || agents.length === 0) {
    console.log('No agent selected, aborting.')
    process.exit(1)
  }

  const { scopes } = await prompts({
    type: 'multiselect',
    name: 'scopes',
    message: 'Where should this skill be installed?',
    choices: [
      { title: 'This project', value: 'project', selected: true },
      { title: 'Global (all your projects)', value: 'global' },
    ],
    min: 1,
  })

  if (!scopes || scopes.length === 0) {
    console.log('No install scope selected, aborting.')
    process.exit(1)
  }

  for (const agent of agents as Agent[]) {
    for (const scope of scopes as InstallScope[]) {
      const { targetDir, skippedExisting } = installSkill(agent, scope)
      console.log(`\n✔ Installed for ${AGENT_LABELS[agent]} to ${targetDir}`)
      if (skippedExisting.length > 0) {
        console.log(`  Kept existing customizations (not overwritten): ${skippedExisting.join(', ')}`)
      }
    }
  }

  console.log('\nNext steps:')
  console.log('  - Restart/reopen your AI coding agent so it picks up the new skill.')
  console.log('  - Customize scope/exported in <target>/config/default.config.json if needed.')
  console.log('  - Add project-specific abbreviations via .ts-abbr-skill.local.json in your repo.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
