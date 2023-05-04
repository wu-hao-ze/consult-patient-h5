import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import router from './router'
// 导入打包svg图标
import 'virtual:svg-icons-register'

// vant的样式要放到main.scss的上面，因为将来可能会覆盖，后者居上
import 'vant/lib/index.css'
import './styles/main.scss'

const app = createApp(App)

// pinia和router两个实例需要use注册插件
app.use(pinia)
app.use(router)
app.mount('#app')
