import fs from 'node:fs/promises'
// import path from 'node:path'
import colors from 'picocolors'
import type { Options as ExecaOptions, ResultPromise } from 'execa'
import { execa } from 'execa'
import { packages } from './config'

export function run<EO extends ExecaOptions>(
  bin: string,
  args: string[],
  opts?: EO,
): ResultPromise<
  EO & (keyof EO extends 'stdio' ? object : { stdio: 'inherit' })
> {
  return execa(bin, args, { stdio: 'inherit', ...opts }) as any
}

export async function getLatestTag(pkgName: string): Promise<string> {
  const pkgDir = getPkgDir(pkgName)
  const pkgJson = JSON.parse(
    await fs.readFile(`${pkgDir}/package.json`, 'utf-8'),
  )
  const version = pkgJson.version
  return `${pkgName}@${version}`
}

export async function logRecentCommits(pkgName: string): Promise<void> {
  const tag = await getLatestTag(pkgName)

  try {
    const sha = await run('git', ['rev-list', '-n', '1', tag], {
      stdio: 'pipe',
    }).then((res) => res.stdout.trim())

    console.log(
      colors.bold(
        `\n${colors.blue(`i`)} ${colors.green(pkgName)} 的提交记录，从 ${colors.green(tag)} ${colors.gray(`(${sha.slice(0, 5)})`)} 开始`,
      ),
    )

    await run(
      'git',
      [
        '--no-pager',
        'log',
        `${sha}..HEAD`,
        '--oneline',
        '--',
        `packages/${pkgName}`,
      ],
      { stdio: 'inherit' },
    )
  } catch (e) {
    // 如果获取标签对应的 commit hash 失败，显示所有提交记录
    console.log(
      colors.bold(
        `\n${colors.blue(`i`)} 显示 ${colors.green(pkgName)} 的所有提交记录`,
      ),
    )
    await run(
      'git',
      ['--no-pager', 'log', '--oneline', '--', `packages/${pkgName}`],
      { stdio: 'inherit' },
    )
  }
  console.log()
}

export function getPkgDir(pkgName: string): string {
  return packages.find((pkg) => pkg.name === pkgName)?.path ?? ''
}
