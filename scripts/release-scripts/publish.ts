import semver from 'semver'
import {
  args,
  getActiveVersion,
  getPackageInfo,
  publishPackage,
  step,
} from './utils.ts'
import type { publish as def } from './types.d.ts'

export const publish: typeof def = async ({ getPkgDir, packageManager }) => {
  const tag = args._[0]
  if (!tag) throw new Error('No tag specified')
  const match = tag.match(/(@achuan9\/.*)@(.*)/)
  if (!match)
    throw new Error(
      `Invalid tag format: ${tag}, should be like @achuan9/xxx@1.0.0`,
    )
  const [_, pkgName, version] = match

  if (pkgName === undefined)
    throw new Error(`Package name should be specified in tag "${tag}"`)

  const { pkg, pkgDir } = getPackageInfo(pkgName, getPkgDir)
  if (pkg.version !== version)
    throw new Error(
      `Package version from tag "${version}" mismatches with current version "${pkg.version}"`,
    )

  const activeVersion = await getActiveVersion(pkg.name)

  step('Publishing package...')
  const releaseTag = version.includes('beta')
    ? 'beta'
    : version.includes('alpha')
      ? 'alpha'
      : activeVersion && semver.lt(pkg.version, activeVersion)
        ? 'previous'
        : undefined
  await publishPackage(pkgDir, releaseTag, packageManager)
}
