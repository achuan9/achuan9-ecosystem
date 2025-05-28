import { release } from '@vitejs/release-scripts'
import colors from 'picocolors'
import { logRecentCommits, run, getPkgDir } from './releaseUtils'
import extendCommitHash from './extendCommitHash'
import { packages } from './config'

release({
  repo: 'achuan9-ecosystem',
  packages: packages.map((pkg) => pkg.name),
  toTag: (pkg, version) =>
    pkg === 'vite' ? `v${version}` : `${pkg}@${version}`,
  logChangelog: (pkg) => logRecentCommits(pkg),
  generateChangelog: async (pkgName, version) => {
    console.log(colors.cyan('\nGenerating changelog...'))
    const changelogArgs = [
      'conventional-changelog',
      '-p',
      'angular',
      '-i',
      'CHANGELOG.md',
      '-s',
      '--commit-path',
      '.',
    ]
    changelogArgs.push('--lerna-package', pkgName)
    const pkgDir = getPkgDir(pkgName)
    await run('npx', changelogArgs, { cwd: pkgDir })
    extendCommitHash(`${pkgDir}/CHANGELOG.md`)
  },
  getPkgDir,
})
