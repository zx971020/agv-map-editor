import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'
import 'element-plus/theme-chalk/dark/css-vars.css'
// 手动导入 Element Plus 服务组件样式（ElMessageBox、ElMessage、ElNotification 等）
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-message.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(VueKonva)
app.mount('#app')
