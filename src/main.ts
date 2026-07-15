import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 开发环境下拦截请求，返回模拟数据；以后接真实后端时，把这段删掉就行
if (import.meta.env.DEV) {
  import('./mock').then(({ setupMock }) => setupMock())
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
