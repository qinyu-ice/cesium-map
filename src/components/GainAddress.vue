<script setup>
import {ref, watch, onMounted, defineProps, defineEmits} from 'vue'

const props = defineProps({
  address: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['get-lng-lat'])

const lng = ref('')
const lat = ref('')
const isMapReady = ref(false)

// 地图加载完成标记
onMounted(() => {
  initAMap()
})

// 监听地址变化（核心：必须 immediate + 正确判断）
watch(
    () => props.address,
    (val) => {
      // 空地址不解析
      if (!val || val.trim() === '') return

      // 地图准备好了才去获取坐标
      if (isMapReady.value) {
        getLngLat(val)
      } else {
        // 地图没准备好，等加载完自动执行
        const timer = setInterval(() => {
          if (isMapReady.value) {
            getLngLat(val)
            clearInterval(timer)
          }
        }, 100)
      }
    },
    {immediate: true} // 首次加载就触发
)

window._AMapSecurityConfig = {
  securityJsCode: "f27caa65d8aa7dd7ec207568e99fb7e9",
}

// 初始化高德地图 JSAPI
const initAMap = () => {
  if (window.AMap) {
    isMapReady.value = true
    return
  }

  // 关键修复：高德 2.0 必须加 callback 才能正常加载
  const script = document.createElement('script')
  script.src = `https://webapi.amap.com/maps?v=2.0&key=f08c4cfbf1e0c8b89e4e6c29c46b3a07&callback=onAMapLoad`

  // 全局回调
  window.onAMapLoad = () => {
    isMapReady.value = true
  }

  document.head.appendChild(script)
}

// 地址解析经纬度（高德地理编码）
const getLngLat = (address) => {
  if (!window.AMap || !isMapReady.value) return

  window.AMap.plugin('AMap.Geocoder', () => {
    const geocoder = new window.AMap.Geocoder({
      city: '全国' // 关键：设置全国搜索，否则可能解析不到
    })

    geocoder.getLocation(address, (status, result) => {
      console.log('地址解析结果：', status, result) // 调试用

      if (status === 'complete' && result.info === 'OK' && result.geocodes?.length) {
        const position = result.geocodes[0].location
        lng.value = position.lng
        lat.value = position.lat

        // 成功后回传给父组件
        emit('get-lng-lat', {
          lng: lng.value,
          lat: lat.value
        })
      } else {
        console.warn('地址解析失败：', address)
      }
    })
  })
}
</script>

<template>

</template>

<style scoped>

</style>