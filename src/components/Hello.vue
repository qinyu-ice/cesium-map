<script setup>
import router from '@/router/index.js'

const goToMap = () => {
  router.push('/map')
}
</script>

<template>
  <div>
    <h1>Hello</h1>
    <el-button type="primary" @click="goToMap">跳转地图</el-button>
  </div>
</template>

<style scoped>

</style>