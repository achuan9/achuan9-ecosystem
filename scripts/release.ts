import { release } from './release-scripts'
import colors from 'picocolors'
import { logRecentCommits, run, getPkgDir } from './releaseUtils'
import extendCommitHash from './extendCommitHash'
import { packages } from './config'

release({
  repo: 'achuan9-ecosystem',
  packages: packages.map((pkg) => pkg.name),
  toTag: (pkg, version) => `${pkg}@${version}`,
  logChangelog: (pkg) => logRecentCommits(pkg),
  generateChangelog: async (pkgName, version) => {
    console.log(colors.cyan('\n生成 changelog...'))
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
    await run('npx', changelogArgs, { cwd: `packages/${pkgName}` })
    const pkgDir = getPkgDir(pkgName)
    extendCommitHash(`${pkgDir}/CHANGELOG.md`)

    // 提交更改
    console.log(colors.cyan('\n提交更改...'))
    await run('git', ['add', '-A'])
    await run('git', [
      'commit',
      '-m',
      `chore: prepare for release ${pkgName}@${version}`,
    ])
  },
  getPkgDir,
})
