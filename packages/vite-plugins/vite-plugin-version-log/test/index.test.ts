import { describe, it, expect } from 'vitest'
import { vitePluginVersionLog } from '../src'

describe('vite-plugin-version-log', () => {
  it('should create plugin with default options', () => {
    const plugin = vitePluginVersionLog()
    expect(plugin.name).toBe('vite-plugin-version-log')
  })

  it('should only apply in build mode', () => {
    const plugin = vitePluginVersionLog()
    expect(plugin.apply).toBe('build')
  })

  it('should inject script into HTML', () => {
    const plugin = vitePluginVersionLog()
    const html = '<html><head></head><body></body></html>'
    const transformed = plugin.transformIndexHtml(html)
    expect(transformed).toContain('<script>')
    expect(transformed).toContain('console.log')
  })
})
