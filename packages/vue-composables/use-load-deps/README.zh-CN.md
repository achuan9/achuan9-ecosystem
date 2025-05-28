# use-load-deps

一个用于管理外部依赖（如JS、CSS文件）加载的Vue 3组合式API工具。

## 特性

- 🚀 支持按需加载外部依赖
- 🔄 支持并行或串行加载
- ⏱️ 支持空闲时间加载
- 🔒 防止重复加载
- 📊 提供加载状态管理
- 🎯 支持加载回调函数

## 安装

```bash
# 使用 pnpm
pnpm add @achuan9/use-load-deps

# 使用 npm
npm install @achuan9/use-load-deps

# 使用 yarn
yarn add @achuan9/use-load-deps
```

## 使用方法

### 1. 基础用法

首先，在你的应用入口处配置需要加载的依赖：

```typescript
import { setDepsConfig } from '@achuan9/use-load-deps'

setDepsConfig({
  // 配置依赖
  flv: {
    js: ['https://cdn.jsdelivr.net/npm/flv.js/dist/flv.min.js'],
    css: ['https://cdn.jsdelivr.net/npm/flv.js/dist/flv.min.css'],
  },
  echarts: {
    js: ['https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js'],
    sequential: true, // 保证js中的依赖数组串行加载
  },
})
```

然后在组件中使用：

```vue
<template>
  <div>
    <div v-if="depsStatus.flv === 'loading'">加载中...</div>
    <div v-else-if="depsStatus.flv === 'unload'">未加载</div>
    <div v-else>
      <!-- 依赖加载完成后的内容 -->
    </div>
    <button @click="loadDeps('flv')">加载依赖</button>
  </div>
</template>

<script setup lang="ts">
import { useLoadDeps } from '@achuan9/use-load-deps'

const { depsStatus, loadDeps, loadDepsOnIdle } = useLoadDeps({
  onLoading: (dep) => console.log(`Loading ${dep}...`),
  onLoaded: (dep) => console.log(`${dep} loaded!`),
  onError: (dep, error) => console.error(`Failed to load ${dep}:`, error),
})
</script>
```

### 2. 路由守卫用法

```typescript
// main.ts
import { createApp } from 'vue'
import { createRouter } from 'vue-router'
import { setDepsConfig } from '@achuan9/use-load-deps'
import type { ExternalDependencies } from '@achuan9/use-load-deps'
import { setupDepsGuard } from './router/guard'

// 1. 首先配置依赖
export const depsConfig: ExternalDependencies = {
  echarts: {
    js: ['https://cdn.bootcdn.net/ajax/libs/echarts/5.6.0/echarts.min.js'],
    css: [],
    sequential: true
  },
  flv: {
    js: ['https://cdn.bootcdn.net/ajax/libs/flv.js/1.6.2/flv.min.js'],
    css: []
  }
}

// 2. 设置全局依赖配置（必须在 setupDepsGuard 之前）
setDepsConfig(depsConfig)

// 3. 创建路由
const router = createRouter({
  routes: [
    {
      path: '/echarts',
      component: () => import('./views/Echarts.vue'),
      meta: {
        deps: ['echarts'] // 指定路由需要的依赖
      }
    },
    {
      path: '/flv',
      component: () => import('./views/Flv.vue'),
      meta: {
        deps: ['flv']
      }
    }
  ]
})

// 4. 设置路由守卫
setupDepsGuard(router)

// 5. 创建应用
const app = createApp(App)
app.use(router)
app.mount('#app')

// router/guard.ts
import { useLoadDeps } from '@achuan9/use-load-deps'
import type { Router, RouteLocationNormalized } from 'vue-router'

export function setupDepsGuard(router: Router) {
  const { getUnloadDeps, loadDeps, loadDepsOnIdle } = useLoadDeps({
    onLoading: (dep) => console.log(`Loading ${dep}...`),
    onLoaded: (dep) => console.log(`${dep} loaded!`),
    onError: (dep, error) => console.error(`Failed to load ${dep}:`, error)
  })

  // 路由进入前加载依赖
  router.beforeEach(async (to: RouteLocationNormalized) => {
    const targetDeps = to.meta.deps as string[] || []
    console.log('目标路由需要的依赖，必须加载完才能进入', targetDeps)

    if (targetDeps.length > 0) {
      try {
        await loadDeps(targetDeps)
      } catch (error) {
        console.error('Failed to load dependencies:', error)
      }
    }
    return true
  })

  // 路由进入后，利用空闲时间加载其他依赖
  router.afterEach(() => {
    const unloadDeps = getUnloadDeps()
    console.log('未加载的依赖，利用空闲时间加载', unloadDeps)
    if (unloadDeps.length > 0) {
      loadDepsOnIdle(unloadDeps)
    }
  })
}

// views/Echarts.vue
<template>
  <div class="echarts-demo">
    <h2>Echarts 示例 -- 确定加载完成才进入页面</h2>
    <div v-if="depsStatus.echarts === 'loading'">加载中...</div>
    <div v-else-if="depsStatus.echarts === 'unload'">未加载</div>
    <div v-else>加载完成</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLoadDeps } from '@achuan9/use-load-deps'

const chartRef = ref<HTMLElement>()
const { depsStatus } = useLoadDeps({
  onLoading: (dep) => console.log(`echarts: Loading ${dep}...`),
  onLoaded: (dep) => console.log(`echarts: ${dep} loaded!`),
  onError: (dep, error) => console.error(`echarts: Failed to load ${dep}:`, error)
})

onMounted(() => {
  if (chartRef.value) {
    echarts.init(chartRef.value)
    // 创建地图
  }
})
</script>
```

## API

### setDepsConfig

配置需要加载的依赖。

```typescript
setDepsConfig(config: ExternalDependencies)
```

#### 参数

- `config`: 依赖配置对象
  ```typescript
  interface ExternalDependencies {
    [key: string]: {
      js?: string[] // JS文件URL数组
      css?: string[] // CSS文件URL数组
      sequential?: boolean // 是否串行加载JS文件
    }
  }
  ```

### useLoadDeps

返回依赖加载相关的状态和方法。

```typescript
const { depsStatus, loadDeps, loadDepsOnIdle, getUnloadDeps } = useLoadDeps(callbacks?)
```

#### 参数

- `callbacks`: 可选的回调函数对象
  ```typescript
  interface LazyDepsCallbacks {
    onLoading?: (dep: string) => void // 开始加载时触发
    onLoaded?: (dep: string) => void // 加载完成时触发
    onError?: (dep: string, error: Error) => void // 加载失败时触发
  }
  ```

#### 返回值

- `depsStatus`: 响应式的依赖状态对象
  ```typescript
  {
    [key: string]: 'unload' | 'loading' | 'loaded'
  }
  ```
- `loadDeps`: 加载依赖的方法
  ```typescript
  ;(deps: string | string[]) => Promise<ExternalDependencyStatus>
  ```
- `loadDepsOnIdle`: 在空闲时间加载依赖的方法
  ```typescript
  ;(deps: string | string[]) => Promise<ExternalDependencyStatus>
  ```
- `getUnloadDeps`: 获取未加载的依赖列表
  ```typescript
  () => string[]
  ```

## 依赖状态

依赖有三种状态：

- `unload`: 未加载
- `loading`: 加载中
- `loaded`: 已加载

## 特性说明

1. **防止重复加载**：

   - 如果依赖正在加载中，会复用现有的加载Promise
   - 如果依赖已加载完成，不会重复加载

2. **并行/串行加载**：

   - 默认并行加载所有JS文件
   - 设置`sequential: true`可以串行加载JS文件
   - CSS文件始终并行加载

3. **空闲时间加载**：

   - 使用`requestIdleCallback`在浏览器空闲时加载依赖
   - 如果浏览器不支持`requestIdleCallback`，会立即加载

4. **状态管理**：
   - 提供响应式的依赖状态
   - 支持加载状态的回调函数
   - 支持错误处理

## 许可证

MIT
