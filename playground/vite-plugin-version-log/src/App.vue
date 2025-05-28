<template>
  <div class="app">
    <h1>Vite Plugin Version Log Demo</h1>
    <div class="info">
      <p>这是构建后的页面，请打开控制台查看版本信息</p>
      <p class="tip">提示：插件只在生产环境构建时生效</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加组件逻辑
</script>

<style>
.app {
  text-align: center;
  padding: 20px;
}

.info {
  margin-top: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.tip {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}
</style>
