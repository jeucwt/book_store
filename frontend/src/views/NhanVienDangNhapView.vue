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

const form = reactive({ MSNV: '', Password: '' })
const loi = reactive({ MSNV: '', Password: '' })
const loiServer = ref('')
const dangGui = ref(false)

async function gui() {
  loiServer.value = ''
  loi.MSNV = form.MSNV.trim() ? '' : 'Vui lòng nhập mã nhân viên'
  loi.Password = form.Password ? '' : 'Vui lòng nhập mật khẩu'
  if (loi.MSNV || loi.Password) return
  dangGui.value = true
  try {
    await auth.dangNhapNhanVien(form.MSNV.trim(), form.Password)
    router.replace(redirectAnToan(route.query.redirect, '/nhan-vien'))
  } catch (e) {
    loiServer.value = layThongBaoLoi(e)
  } finally {
    dangGui.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm card-paper">
    <h1 class="mb-4 text-3xl font-semibold">Đăng nhập nhân viên</h1>
    <form class="space-y-3" novalidate @submit.prevent="gui">
      <FormField label="Mã nhân viên" :error="loi.MSNV"><input v-model="form.MSNV" class="input" autocomplete="username" /></FormField>
      <FormField label="Mật khẩu" :error="loi.Password"><input v-model="form.Password" type="password" class="input" autocomplete="current-password" /></FormField>
      <p v-if="loiServer" class="alert-error">{{ loiServer }}</p>
      <button class="btn-primary w-full" :disabled="dangGui">{{ dangGui ? 'Đang đăng nhập...' : 'Đăng nhập' }}</button>
    </form>
  </div>
</template>