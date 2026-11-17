import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './api/http'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)
app.use(createPinia())

// Token hết hạn/không hợp lệ: xóa phiên và về trang đăng nhập tương ứng
setUnauthorizedHandler(() => {
  const auth = useAuthStore()
  auth.xoaPhien()
  const current = router.currentRoute.value
  const laTrangNhanVien = current.path.startsWith('/nhan-vien')
  router.push({
    name: laTrangNhanVien ? 'nhan-vien-dang-nhap' : 'dang-nhap',
    query: { redirect: current.fullPath },
  })
})

app.use(router)
app.mount('#app')