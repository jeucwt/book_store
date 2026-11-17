<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const q = ref('')
watch(() => route.query.q, (v) => (q.value = typeof v === 'string' ? v : ''), { immediate: true })

function timKiem() {
  const t = q.value.trim()
  router.push({ name: 'kham-pha', query: t ? { q: t } : {} })
}

function dangXuat() {
  const laNhanVien = auth.isNhanVien
  auth.dangXuat()
  router.push({ name: laNhanVien ? 'nhan-vien-dang-nhap' : 'kham-pha' })
}
</script>

<template>
  <header class="border-b border-line bg-paper">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-7 gap-y-2 px-6 py-4">
      <RouterLink :to="{ name: 'kham-pha' }" class="font-display text-2xl font-semibold">jeucwt bookshelf</RouterLink>

      <nav class="flex items-center gap-5 text-[15px] text-muted">
        <RouterLink :to="{ name: 'kham-pha' }" class="hover:text-ink" exact-active-class="font-semibold text-ink">Khám phá</RouterLink>
        <RouterLink v-if="auth.isDocGia" :to="{ name: 'sach-cua-toi' }" class="hover:text-ink" active-class="font-semibold text-ink">Sách của tôi</RouterLink>
        <RouterLink v-if="auth.isNhanVien" :to="{ name: 'nhan-vien' }" class="hover:text-ink" active-class="font-semibold text-ink">Quản trị</RouterLink>
      </nav>

      <form class="ml-auto hidden md:block" role="search" @submit.prevent="timKiem">
        <input
          v-model="q"
          class="w-72 rounded-full bg-sand px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-clay/25"
          placeholder="Tìm tên sách, tác giả…"
          aria-label="Tìm sách"
        />
      </form>

      <div class="ml-auto flex items-center gap-3 text-sm md:ml-0">
        <template v-if="auth.isLoggedIn">
          <div class="hidden text-right leading-tight sm:block">
            <div class="font-semibold">{{ auth.tenHienThi }}</div>
            <div class="text-xs text-muted">{{ auth.user?.Email || auth.nhanVaiTro }}</div>
          </div>
          <button class="btn-outline" @click="dangXuat">Đăng xuất</button>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'dang-nhap' }" class="btn-outline">Đăng nhập</RouterLink>
          <RouterLink :to="{ name: 'dang-ky' }" class="btn-primary">Đăng ký</RouterLink>
          <RouterLink :to="{ name: 'nhan-vien-dang-nhap' }" class="hidden text-xs text-muted hover:text-ink lg:inline">Nhân viên</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>