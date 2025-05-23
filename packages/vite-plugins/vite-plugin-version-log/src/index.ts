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
    const commitDate = execSync('git log -1 --format=%cd').toString().trim()
    
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

export function vitePluginVersionLog(options: VersionLogOptions = {}): PluginWithTransform {
  const {
    message = '版本信息',
    emoji = '🚀'
  } = options

  return {
    name: 'vite-plugin-version-log',
    apply: 'build',
    transformIndexHtml(html: string) {
      const { branch, commitHash, commitDate } = getGitInfo()
      const buildDate = new Date().toLocaleString()

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
    }
  } as PluginWithTransform
} 