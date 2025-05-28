export declare function publish(options: {
  getPkgDir?: (pkg: string) => string
  /**
   * Package manager that runs the publish command
   * @default "npm"
   */
  packageManager?: 'npm' | 'pnpm'
}): Promise<void>

export declare function release(options: {
  repo: string
  packages: string[]
  logChangelog: (pkg: string) => void | Promise<void>
  generateChangelog: (pkg: string, version: string) => void | Promise<void>
  toTag: (pkg: string, version: string) => string
  getPkgDir?: (pkg: string) => string
}): Promise<void>
