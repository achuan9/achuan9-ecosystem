import type { Plugin } from 'vite'
import { execSync } from 'child_process'

export interface VersionLogOptions {
  message?: string
  emoji?: string
}

type PluginWithTransform = Plugin & {
  transformIndexHtml: (html: string) => string
}

function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
    const commitDate = execSync(
      'git log -1 --format=%cd --date=format:"%Y-%m-%d %H:%M:%S"',
    )
      .toString()
      .trim()

    return {
      branch,
      commitHash,
      commitDate,
    }
  } catch (error) {
    return {
      branch: 'unknown',
      commitHash: 'unknown',
      commitDate: 'unknown',
    }
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function vitePluginVersionLog(
  options: VersionLogOptions = {},
): PluginWithTransform {
  const { message = '版本信息', emoji = '🚀' } = options

  const isBuild = process.env.NODE_ENV === 'production'

  return {
    name: 'vite-plugin-version-log',
    apply: isBuild ? 'build' : undefined,
    transformIndexHtml(html: string) {
      const { branch, commitHash, commitDate } = getGitInfo()
      const buildDate = formatDate(new Date())
      const script = `
        <script>
          console.log('${emoji} ${message}');
          console.log(
            '%c构建分支: %c${branch}\\n' +
            '%c提交HASH: %c${commitHash}\\n' +
            '%c提交时间: %c${commitDate}\\n' +
            '%c构建时间: %c${buildDate}',
            'color: #666', 'color: #2563eb; font-weight: bold',
            'color: #666', 'color: #2563eb; font-weight: bold',
            'color: #666', 'color: #2563eb; font-weight: bold',
            'color: #666', 'color: #2563eb; font-weight: bold'
          );
        </script>
      `
      return html.replace('</body>', `${script}</body>`)
    },
  } as PluginWithTransform
}

/**
 * 在空闲时间加载依赖
 */
async function loadDepsOnIdle(deps: string | string[]) {
  const depsArray = normalizeDeps(deps)
  if (!depsArray.length) return depsStatus.value

  // 找出所有需要处理的依赖（包括loading和unload状态）
  const depsToProcess = depsArray.filter(
    (dep) =>
      depsStatus.value[dep] === DEP_STATUS_ENUM.UNLOAD ||
      depsStatus.value[dep] === DEP_STATUS_ENUM.LOADING,
  )

  if (!depsToProcess.length) return depsStatus.value

  return new Promise<void>((resolve) => {
    if (typeof requestIdleCallback === 'undefined') {
      // 如果浏览器不支持 requestIdleCallback，立即加载
      Promise.all(depsToProcess.map((dep) => loadSingleDep(dep)))
        .then(() => resolve())
        .catch(() => resolve())
      return
    }

    requestIdleCallback(() => {
      // 在空闲时间加载依赖
      Promise.all(depsToProcess.map((dep) => loadSingleDep(dep)))
        .then(() => resolve())
        .catch(() => resolve())
    })
  })
}
