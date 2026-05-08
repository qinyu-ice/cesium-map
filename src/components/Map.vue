<script setup>
import router from "@/router/index.js"
import * as Cesium from "cesium"
import {onMounted, ref, onUnmounted, watch} from "vue"
import GainAddress from "@/components/GainAddress.vue";
import gcoord from 'gcoord';

const token = ref('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZjU0NWFmMy1hNDQ1LTQ0NjItOTg4Yi0zOGVhNThlNTQ5NmYiLCJpZCI6NDIyOTg3LCJpYXQiOjE3Nzc1MzQ5MjZ9.ZSDnY8OkSeNsuc_9AVkR3hbGqv6aE4Lpwb79oDu8t4g')
const viewer = ref(null)
const city = ref('')
const address = ref('')
const addressData = ref({
  longitude: 104.06339704523526,
  latitude: 30.65982416134491,
  height: 1000
})

// 子组件传回经纬度
const handleAddress = (data) => {
  if (!data || !data.lng || !data.lat) return
  // 高德GCJ‑02 → Cesium WGS84
  const [lonWgs84, latWgs84] = gcoord.transform(
      [data.lng, data.lat], // 高德坐标
      gcoord.GCJ02,
      gcoord.WGS84
  );
  addressData.value = {
    longitude: lonWgs84,
    latitude: latWgs84,
    height: 1000
  }
}

// 存储标记实体
let markerEntity = null

// 经纬度转笛卡尔坐标
const getCartesian3 = (data) => {
  return Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.height)
}

// 返回
const goToBack = () => {
  router.push('/hello')
}

// 初始化 Cesium
const initMap = async () => {
  Cesium.Ion.defaultAccessToken = token.value;
  if (viewer.value) return

  const terrain = await Cesium.createWorldTerrainAsync({
    requestWaterMask: true
  })

  viewer.value = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: terrain,
    geocoder: false,
    homeButton: false,
    animation: false,
    fullscreenButton: false,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    baseLayerPicker: false,
    scene3DOnly: false,
    sceneMode: Cesium.SceneMode.SCENE3D
  })

  // 隐藏版权信息
  viewer.value.cesiumWidget.creditContainer.style.display = "none"
  viewer.value.scene.fog.enabled = false
  viewer.value.scene.globe.enableLighting = false

  // 修复：禁止相机地下穿透
  viewer.value.scene.screenSpaceCameraController.enableTilt = true
  viewer.value.scene.screenSpaceCameraController.minimumZoomDistance = 100
}

// 更新视角 + 标记点
const updateCameraAndMarker = (data) => {
  if (!viewer.value || !data) return

  // 坐标合法性校验
  if (!data.longitude || !data.latitude) return

  const position = getCartesian3(data)

  // 移除旧标记
  if (markerEntity) {
    viewer.value.entities.remove(markerEntity)
    markerEntity = null
  }

  // 相机飞行
  viewer.value.camera.flyTo({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    },
    duration: 2
  })

  // 添加标记
  markerEntity = viewer.value.entities.add({
    position: position,
    billboard: {
      image: "https://webapi.amap.com/theme/v1.3/markers/b/mark_bs.png",
      width: 32,
      height: 32,
      // 永远显示在最上层
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    }
  })
}

// 监听城市输入，回车直接赋值
watch(
    () => city.value,
    (newVal) => {
      if (newVal) address.value = newVal
    },
    {deep: true}
)

// 监听坐标，自动更新地图
watch(
    () => addressData.value,
    (newVal) => {
      updateCameraAndMarker(newVal)
    },
    {deep: true}
)

// 销毁
const destroyMap = () => {
  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
}

onMounted(() => {
  initMap().then(() => {
    updateCameraAndMarker(addressData.value)
  })
})

onUnmounted(() => {
  destroyMap()
})
</script>

<template>
  <div>
    <!-- 回车直接搜索 -->
    <el-input type="search" v-model="city" placeholder="请输入城市" @keyup.enter="address = city"
              style="width: 300px; margin-bottom: 10px"/>

    <GainAddress :address="address" @get-lng-lat="handleAddress"></GainAddress>
    <div class="map-box" id="cesiumContainer"></div>
    <div class="button-box">
      <el-button type="primary" @click="goToBack">返回</el-button>
    </div>
  </div>
</template>

<style scoped>
.map-box {
  width: 88vw;
  height: 90vh;
  border: 1px solid #ccc;
  /* 地图必须有相对/绝对定位才能正常显示 */
  position: relative;
}

.button-box {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>