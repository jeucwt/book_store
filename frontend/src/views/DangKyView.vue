<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { layThongBaoLoi } from '../api/http'
import { redirectAnToan } from '../utils/redirect'
import FormField from '../components/FormField.vue'
import type { DangKyPayload } from '../types'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  HoLot: '', Ten: '', NgaySinh: '', Phai: '', DiaChi: '', DienThoai: '',
  Email: '', MatKhau: '', NhapLai: '',
})
const loi = reactive<Record<string, string>>({})
const loiServer = ref('')
const dangGui = ref(false)

function kiemTra() {
  const e: Record<string, string> = {}
  if (!form.HoLot.trim()) e.HoLot = 'Vui lòng nhập họ lót'
  if (!form.Ten.trim()) e.Ten = 'Vui lòng nhập tên'
  const email = form.Email.trim()
  if (!email) e.Email = 'Vui lòng nhập email'
  else if (!/^\S+@\S+\.\S+$/.test(email)) e.Email = 'Email không hợp lệ'
  if (form.DienThoai && !/^(0|\+84)\d{9,10}$/.test(form.DienThoai.replace(/\s/g, ''))) {
    e.DienThoai = 'Số điện thoại không hợp lệ'
  }
  if (form.MatKhau.length < 6) e.MatKhau = 'Mật khẩu tối thiểu 6 ký tự'
  if (form.NhapLai !== form.MatKhau) e.NhapLai = 'Mật khẩu nhập lại không khớp'
  Object.keys(loi).forEach((k) => delete loi[k])
  Object.assign(loi, e)
  return Object.keys(e).length === 0
}

async function gui() {
  loiServer.value = ''
  if (!kiemTra()) return
  const payload: DangKyPayload = {
    HoLot: form.HoLot.trim(),
    Ten: form.Ten.trim(),
    Email: form.Email.trim(),
    MatKhau: form.MatKhau,
  }
  if (form.NgaySinh) payload.NgaySinh = form.NgaySinh
  if (form.Phai) payload.Phai = form.Phai
  if (form.DiaChi.trim()) payload.DiaChi = form.DiaChi.trim()
  if (form.DienThoai.trim()) payload.DienThoai = form.DienThoai.replace(/\s/g, '')

  dangGui.value = true
  try {
    await auth.dangKy(payload)
    router.replace(redirectAnToan(route.query.redirect))
  } catch (e) {
    loiServer.value = layThongBaoLoi(e)
  } finally {
    dangGui.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg card-paper">
    <h1 class="mb-4 text-3xl font-semibold">Đăng ký độc giả</h1>
    <form class="grid gap-3 sm:grid-cols-2" novalidate @submit.prevent="gui">
      <FormField label="Họ lót *" :error="loi.HoLot"><input v-model="form.HoLot" class="input" /></FormField>
      <FormField label="Tên *" :error="loi.Ten"><input v-model="form.Ten" class="input" /></FormField>
      <FormField label="Ngày sinh" :error="loi.NgaySinh"><input v-model="form.NgaySinh" type="date" class="input" /></FormField>
      <FormField label="Phái" :error="loi.Phai">
        <select v-model="form.Phai" class="input">
          <option value="">-- Chọn --</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
      </FormField>
      <div class="sm:col-span-2">
        <FormField label="Địa chỉ" :error="loi.DiaChi"><input v-model="form.DiaChi" class="input" /></FormField>
      </div>
      <FormField label="Điện thoại" :error="loi.DienThoai"><input v-model="form.DienThoai" type="tel" class="input" /></FormField>
      <FormField label="Email *" :error="loi.Email"><input v-model="form.Email" type="email" class="input" autocomplete="email" /></FormField>
      <FormField label="Mật khẩu *" :error="loi.MatKhau"><input v-model="form.MatKhau" type="password" class="input" autocomplete="new-password" /></FormField>
      <FormField label="Nhập lại mật khẩu *" :error="loi.NhapLai"><input v-model="form.NhapLai" type="password" class="input" autocomplete="new-password" /></FormField>

      <p v-if="loiServer" class="alert-error sm:col-span-2">{{ loiServer }}</p>
      <button class="btn-primary sm:col-span-2" :disabled="dangGui">{{ dangGui ? 'Đang đăng ký...' : 'Đăng ký' }}</button>
    </form>
    <p class="mt-4 text-sm text-muted">
      Đã có tài khoản?
      <RouterLink :to="{ name: 'dang-nhap', query: route.query }" class="text-clay-dark hover:underline">Đăng nhập</RouterLink>
    </p>
  </div>
</template>