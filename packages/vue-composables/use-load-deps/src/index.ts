import { reactive } from 'vue'
import {
  type ExternalDependency,
  type ExternalDependencies,
  type LazyDepsCallbacks,
  type ExternalDependencyStatus,
  DEP_STATUS_ENUM,
} from './types'

// 导出类型
export type {
  ExternalDependencies,
  ExternalDependency,
  ExternalDependencyStatus,
  LazyDepsCallbacks,
}
export { DEP_STATUS_ENUM }

// 全局状态
window.__useLoadDeps__ = {
  depsConfig: {},
  depsStatus: reactive<ExternalDependencyStatus>({}),
  isConfigured: false,
  loadingPromises: new Map<string, Promise<void>>(),
}

// 设置全局配置
export function setDepsConfig(config: ExternalDependencies) {
  config = { ...window.__useLoadDeps__.depsConfig, ...config }
  window.__useLoadDeps__.depsConfig = config
  const initStatus = Object.keys(config).reduce<ExternalDependencyStatus>(
    (acc, key) => {
      acc[key] = DEP_STATUS_ENUM.UNLOAD
      return acc
    },
    {},
  )
  Object.assign(window.__useLoadDeps__.depsStatus, initStatus)
  window.__useLoadDeps__.isConfigured = true
}

// 资源加载器
export const resourceLoader = {
  /**
   * 加载单个JS文件
   */
  loadJS(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = src
      script.onload = () => {
        resolve()
      }
      script.onerror = reject
      document.body.appendChild(script)
    })
  },

  /**
   * 加载单个CSS文件
   */
  loadCSS(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve()
        return
      }
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.onload = () => {
        resolve()
      }
      link.onerror = reject
      document.head.appendChild(link)
    })
  },

  /**
   * 加载一组JS文件
   */
  async loadJSFiles(urls: string[], sequential: boolean): Promise<void> {
    if (!urls.length) return
    if (sequential) {
      for (const url of urls) {
        await this.loadJS(url)
      }
    } else {
      await Promise.all(urls.map((url) => this.loadJS(url)))
    }
  },

  /**
   * 加载一组CSS文件
   */
  async loadCSSFiles(urls: string[]): Promise<void> {
    if (!urls.length) return
    await Promise.all(urls.map((url) => this.loadCSS(url)))
  },

  /**
   * 加载依赖
   */
  async loadDependency(config: ExternalDependency): Promise<void> {
    const { css = [], js = [], sequential = false } = config
    await this.loadCSSFiles(css)
    await this.loadJSFiles(js, sequential)
  },
}

/**
 * 将依赖参数转换为数组
 */
function normalizeDeps(deps: string | string[]): string[] {
  if (!deps) return []
  return Array.isArray(deps) ? deps : [deps]
}

/**
 * 加载依赖并处理错误
 */
async function loadDependencyWithErrorHandling(
  dep: string,
  config: ExternalDependency,
) {
  try {
    await resourceLoader.loadDependency(config)
  } catch (error) {
    console.error(`Failed to load dependency ${dep}:`, error)
    throw error
  }
}

export function useLoadDeps(callbacks?: LazyDepsCallbacks) {
  if (!window.__useLoadDeps__.isConfigured) {
    throw new Error(
      'Dependencies configuration is not set. Please call setDepsConfig first.',
    )
  }
  const { depsConfig, depsStatus, loadingPromises } = window.__useLoadDeps__

  /**
   * 更新依赖状态
   */
  function updateDepStatus(dep: string, status: DEP_STATUS_ENUM) {
    if (dep in depsStatus) {
      depsStatus[dep] = status
    }
  }

  /**
   * 加载单个依赖
   */
  async function loadSingleDep(dep: string): Promise<void> {
    // 如果已经有正在加载的Promise，直接返回
    if (loadingPromises.has(dep)) {
      return loadingPromises.get(dep)
    }

    // 创建新的加载Promise
    const loadPromise = (async () => {
      try {
        updateDepStatus(dep, DEP_STATUS_ENUM.LOADING)
        callbacks?.onLoading?.(dep)
        await loadDependencyWithErrorHandling(dep, depsConfig[dep])
        updateDepStatus(dep, DEP_STATUS_ENUM.LOADED)
        callbacks?.onLoaded?.(dep)
      } catch (error) {
        updateDepStatus(dep, DEP_STATUS_ENUM.UNLOAD)
        callbacks?.onError?.(dep, error as Error)
        throw error
      } finally {
        // 加载完成后，无论成功失败都清除Promise缓存
        loadingPromises.delete(dep)
      }
    })()

    // 缓存Promise
    loadingPromises.set(dep, loadPromise)
    return loadPromise
  }

  /**
   * 加载依赖
   */
  async function loadDeps(deps: string | string[]) {
    const depsArray = normalizeDeps(deps)
    if (!depsArray.length) return depsStatus

    // 找出所有需要处理的依赖（包括loading和unload状态）
    const depsToProcess = depsArray.filter(
      (dep) =>
        depsStatus[dep] === DEP_STATUS_ENUM.UNLOAD ||
        depsStatus[dep] === DEP_STATUS_ENUM.LOADING,
    )

    if (!depsToProcess.length) return depsStatus

    // 并行加载所有依赖，Promise缓存会自动处理重复加载的情况
    await Promise.all(depsToProcess.map((dep) => loadSingleDep(dep)))

    return depsStatus
  }

  /**
   * 在空闲时间加载依赖
   */
  async function loadDepsOnIdle(deps: string | string[]) {
    const depsArray = normalizeDeps(deps)
    if (!depsArray.length) return depsStatus

    // 找出所有需要处理的依赖（包括loading和unload状态）
    const depsToProcess = depsArray.filter(
      (dep) =>
        depsStatus[dep] === DEP_STATUS_ENUM.UNLOAD ||
        depsStatus[dep] === DEP_STATUS_ENUM.LOADING,
    )

    if (!depsToProcess.length) return depsStatus

    return new Promise<void>((resolve) => {
      if (typeof requestIdleCallback === 'undefined') {
        resolve()
        return
      }

      requestIdleCallback(async () => {
        await Promise.all(depsToProcess.map((dep) => loadSingleDep(dep)))
        resolve()
      })
    })
  }

  return {
    depsStatus,
    getUnloadDeps: () => {
      return Object.keys(depsConfig).filter(
        (dep) => depsStatus[dep] === DEP_STATUS_ENUM.UNLOAD,
      )
    },
    loadDeps,
    loadDepsOnIdle,
  }
}
