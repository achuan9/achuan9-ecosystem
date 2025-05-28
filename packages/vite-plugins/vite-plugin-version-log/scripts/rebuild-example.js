const { execSync } = require('child_process')

console.log('\n🔄 插件构建完成，开始构建示例...\n')

try {
  execSync('pnpm --filter example build', { stdio: 'inherit' })
  console.log('\n✨ 示例构建完成！请刷新浏览器查看效果\n')
} catch (error) {
  console.error('构建错误:', error)
}
