<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { layThongBaoLoi } from '../../api/http'
import { layDanhSachDocGiaQT } from '../../api/quanTri'
import QtPhanTrang from '../../components/quanTri/QtPhanTrang.vue'
import type { DocGiaQT } from '../../types'
import { dinhDangNgay, tenDayDu } from '../../utils/dinhDang'

const LIMIT = 10

const ds = ref<DocGiaQT[]>([])
const total = ref(0)
const totalPages = ref(1)
const page = ref(1)
const dangTai = ref(false)
const loiTai = ref('')
const q = ref('')

let lanGoi = 0

async function tai() {
  const lan = ++lanGoi
  dangTai.value = true
  loiTai.value = ''
  try {
    const kq = await layDanhSachDocGiaQT({ q: q.value.trim() || undefined, page: page.value, limit: LIMIT })
    if (lan !== lanGoi) return
    ds.value = kq.data
    total.value = kq.total
    totalPages.value = Math.max(kq.totalPages, 1)
  } catch (e) {
    if (lan !== lanGoi) return
    loiTai.value = layThongBaoLoi(e, 'Không tải được danh sách độc giả')
  } finally {
    if (lan === lanGoi) dangTai.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    tai()
  }, 350)
})

function doiTrang(n: number) {
  page.value = n
  tai()
}

onMounted(tai)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="font-display text-2xl font-semibold">Độc giả</h1>
      <p class="text-sm text-muted">{{ total }} độc giả</p>
    </div>

    <div class="mb-4">
      <input
        v-model="q"
        type="search"
        class="input w-full"
        placeholder="Tìm theo tên, email hoặc số điện thoại"
        aria-label="Tìm độc giả"
      />
    </div>

    <div v-if="loiTai" class="alert-error flex flex-wrap items-center justify-between gap-3">
      <span>{{ loiTai }}</span>
      <button type="button" class="btn-outline text-sm" @click="tai">Thử lại</button>
    </div>

    <p v-else-if="dangTai && ds.length === 0" class="py-10 text-center text-muted">Đang tải danh sách…</p>

    <div
      v-else-if="ds.length === 0"
      class="rounded-2xl border border-dashed border-line bg-paper px-4 py-12 text-center"
    >
      <p class="text-ink-2">{{ q.trim() ? 'Không có độc giả nào phù hợp.' : 'Chưa có độc giả nào.' }}</p>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-line bg-paper" :class="dangTai && 'opacity-60'">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="border-b border-line text-xs text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Độc giả</th>
              <th class="px-4 py-3 font-medium">Liên hệ</th>
              <th class="px-4 py-3 font-medium">Ngày đăng ký</th>
              <th class="px-4 py-3 text-center font-medium">Tổng lượt thuê</th>
              <th class="px-4 py-3 text-center font-medium">Còn hạn</th>
              <th class="px-4 py-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in ds" :key="d._id" class="border-b border-line last:border-b-0">
              <td class="px-4 py-2.5 font-medium">{{ tenDayDu(d) || '—' }}</td>
              <td class="px-4 py-2.5">
                <div>{{ d.Email || '—' }}</div>
                <div v-if="d.DienThoai" class="text-xs text-muted">{{ d.DienThoai }}</div>
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap">{{ dinhDangNgay(d.createdAt) }}</td>
              <td class="px-4 py-2.5 text-center">{{ d.TongLuotThue }}</td>
              <td class="px-4 py-2.5 text-center">{{ d.SoLuotConHan }}</td>
              <td class="px-4 py-2.5">
                <div class="flex justify-end">
                  <RouterLink :to="{ name: 'qt-thue', query: { docGia: d._id } }" class="btn-outline whitespace-nowrap text-sm">
                    Xem lượt thuê
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <QtPhanTrang :page="page" :total-pages="totalPages" :total="total" :limit="LIMIT" @doi-trang="doiTrang" />
  </div>
</template>