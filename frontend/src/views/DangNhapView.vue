<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { layThongBaoLoi } from '../api/http'
import { redirectAnToan } from '../utils/redirect'
import FormField from '../components/FormField.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ Email: '', MatKhau: '' })
const loi = reactive({ Email: '', MatKhau: '' })
const loiServer = ref('')
const dangGui = ref(false)

function kiemTra() {
  const email = form.Email.trim()
  loi.Email = !email ? 'Vui lòng nhập email' : !/^\S+@\S+\.\S+$/.test(email) ? 'Email không hợp lệ' : ''
  loi.MatKhau = form.MatKhau ? '' : 'Vui lòng nhập mật khẩu'
  return !loi.Email && !loi.MatKhau
}

async function gui() {
  loiServer.value = ''
  if (!kiemTra()) return
  dangGui.value = true
  try {
    await auth.dangNhap(form.Email.trim(), form.MatKhau)
    router.replace(redirectAnToan(route.query.redirect))
  } catch (e) {
    loiServer.value = layThongBaoLoi(e)
  } finally {
    dangGui.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm card-paper">
    <h1 class="mb-4 text-3xl font-semibold">Đăng nhập độc giả</h1>
    <form class="space-y-3" novalidate @submit.prevent="gui">
      <FormField label="Email" :error="loi.Email">
        <input v-model="form.Email" type="email" class="input" autocomplete="email" />
      </FormField>
      <FormField label="Mật khẩu" :error="loi.MatKhau">
        <input v-model="form.MatKhau" type="password" class="input" autocomplete="current-password" />
      </FormField>
      <p v-if="loiServer" class="alert-error">{{ loiServer }}</p>
      <button class="btn-primary w-full" :disabled="dangGui">{{ dangGui ? 'Đang đăng nhập...' : 'Đăng nhập' }}</button>
    </form>
    <p class="mt-4 text-sm text-muted">
      Chưa có tài khoản?
      <RouterLink :to="{ name: 'dang-ky', query: route.query }" class="text-clay-dark hover:underline">Đăng ký</RouterLink>
    </p>
    <p v-if="$route && true" class="mt-2 text-xs text-muted">Tài khoản mẫu: doc.gia@test.com / 123456</p>
  </div>
</template>