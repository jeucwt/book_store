<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThongBaoStore } from '../../stores/thongBao'
import type { Role } from '../../types'

interface MucMenu {
  ten: string
  to: RouteLocationRaw
  tienTo: string // dùng để tô sáng mục đang mở (kể cả trang con)
  vaiTro: Role[]
}

const auth = useAuthStore()
const tb = useThongBaoStore()
const route = useRoute()
const router = useRouter()

const tatCaMuc: MucMenu[] = [
  { ten: 'Sách', to: { name: 'qt-sach' }, tienTo: '/nhan-vien/sach', vaiTro: ['nhanvien', 'admin'] },
  { ten: 'Lượt thuê', to: { name: 'qt-thue' }, tienTo: '/nhan-vien/thue', vaiTro: ['nhanvien', 'admin'] },
  { ten: 'Độc giả', to: { name: 'qt-doc-gia' }, tienTo: '/nhan-vien/doc-gia', vaiTro: ['nhanvien', 'admin'] },
  { ten: 'Gói thuê', to: { name: 'qt-goi-thue' }, tienTo: '/nhan-vien/goi-thue', vaiTro: ['admin'] },
]

const menu = computed(() => tatCaMuc.filter((m) => !!auth.role && m.vaiTro.includes(auth.role)))
const dangO = (m: MucMenu) => route.path.startsWith(m.tienTo)

function dangXuat() {
  auth.dangXuat()
  tb.xoa()
  router.push({ name: 'nhan-vien-dang-nhap' })
}
</script>

<template>
  <!-- Phủ toàn màn hình, che NavBar công khai -->
  <div class="fixed inset-0 z-40 flex flex-col bg-cream text-ink md:flex-row">
    <aside class="flex shrink-0 flex-col gap-3 border-b border-line bg-sand p-3 md:w-60 md:border-b-0 md:border-r md:p-4">
      <div class="flex items-center justify-between md:block">
        <div>
          <div class="font-display text-lg font-semibold leading-tight">Tiệm sách</div>
          <div class="text-xs text-muted">Khu quản trị</div>
        </div>
        <button type="button" class="btn-outline text-sm md:hidden" @click="dangXuat">Đăng xuất</button>
      </div>

      <nav class="flex gap-1 overflow-x-auto md:flex-col" aria-label="Menu quản trị">
        <RouterLink
          v-for="m in menu"
          :key="m.tienTo"
          :to="m.to"
          class="whitespace-nowrap rounded-xl px-3 py-2 text-sm"
          :class="dangO(m) ? 'bg-sand-3 font-semibold text-ink' : 'text-ink-2 hover:bg-sand-2'"
          :aria-current="dangO(m) ? 'page' : undefined"
        >
          {{ m.ten }}
        </RouterLink>
      </nav>

      <div class="hidden md:mt-auto md:block">
        <div class="rounded-xl bg-sand-2 p-3 text-sm">
          <div class="font-medium">{{ auth.tenHienThi }}</div>
          <div class="text-xs text-muted">{{ auth.user?.MSNV }}</div>
          <span class="chip mt-2 inline-block">{{ auth.nhanVaiTro }}</span>
        </div>
        <RouterLink :to="{ name: 'kham-pha' }" class="mt-3 block text-sm text-muted hover:text-ink">
          ← Về trang chủ
        </RouterLink>
        <button type="button" class="btn-outline mt-2 w-full text-sm" @click="dangXuat">Đăng xuất</button>
      </div>
    </aside>

    <main class="min-w-0 flex-1 overflow-y-auto overscroll-contain">
      <div class="mx-auto max-w-6xl p-4 md:p-8">
        <div v-if="tb.thongBao" class="sticky top-2 z-20 mb-4">
          <div
            :class="tb.thongBao.loai === 'ok' ? 'alert-ok' : 'alert-error'"
            class="flex items-start justify-between gap-3"
            role="status"
          >
            <span>{{ tb.thongBao.noiDung }}</span>
            <button type="button" class="shrink-0 px-1 leading-none" aria-label="Đóng thông báo" @click="tb.xoa()">
              ×
            </button>
          </div>
        </div>
        <RouterView />
      </div>
    </main>
  </div>
</template>