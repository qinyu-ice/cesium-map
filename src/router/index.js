import Hello from "@/components/Hello.vue"
import Map from "@/components/Map.vue"
import {createRouter, createWebHistory} from "vue-router"

const routes = [
    {
        // 匹配所有未定义的路径
        path: '/:catchAll(.*)',
        redirect: '/hello'
    },
    {
        path: '/hello',
        name: 'Hello',
        component: Hello
    },
    {
        path: '/map',
        name: 'Map',
        component: Map
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router