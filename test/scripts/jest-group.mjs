#!/usr/bin/env node
// jest-runner-groups reads --group= from process.argv, but jest 30 rejects
// unknown CLI options before the runner starts. This wrapper injects the
// group from the JEST_GROUP env var so jest never sees it as a CLI flag.
const group = process.env.JEST_GROUP
if (group) {
  process.argv.push(`--group=${group}`)
  delete process.env.JEST_GROUP
}

await import('../../node_modules/jest/bin/jest.js')
