<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { layThongBaoLoi } from '../../api/http'
import { layDanhSachLuotThueQT } from '../../api/quanTri'
import QtPhanTrang from '../../components/quanTri/QtPhanTrang.vue'
import QtThueChiTiet from '../../components/quanTri/QtThueChiTiet.vue'
import type { LuotThueQT } from '../../types'
import { dinhDangNgay, tenDayDu } from '../../utils/dinhDang'

const LIMIT = 10
const route = useRoute()
const router = useRouter()

const TABS = [
  { gt: '', ten: 'Tất cả' },
  { gt: 'conhan', ten: 'Còn hạn' },
  { gt: 'hethan', ten: 'Hết hạn' },
] as const
type GiaTriTab = (typeof TABS)[number]['gt']

const ds = ref<LuotThueQT[]>([])
const total = ref(0)
const totalPages = ref(1)
const page = ref(1)
const dangTai = ref(false)
const loiTai = ref('')

const tab = ref<GiaTriTab>('')
const q = ref('')
const idChiTiet = ref<string | null>(null)

const layChuoi = (v: unknown) => {
  const x = Array.isArray(v) ? v[0] : v
  return typeof x === 'string' ? x : ''
}
const locDocGia = computed(() => layChuoi(route.query.docGia))
const locSach = computed(() => layChuoi(route.query.sach))
const coLocUrl = computed(() => !!locDocGia.value || !!locSach.value)

// Tên hiển thị trong thanh lọc: lấy từ dòng đầu tiên nếu có
const nhanLoc = computed(() => {
  const parts: string[] = []
  if (locDocGia.value) {
    const ten = tenDayDu(ds.value[0]?.MaDocGia)
    parts.push(`độc giả: ${ten || 'đã chọn'}`)
  }
  if (locSach.value) {
    parts.push(`sách: ${ds.value[0]?.MaSach?.TenSach || 'đã chọn'}`)
  }
  return parts.join(' · ')
})

let lanGoi = 0

async function tai() {
  const lan = ++lanGoi
  dangTai.value = true
  loiTai.value = ''
  try {
    const kq = await layDanhSachLuotThueQT({
      trangThai: tab.value || undefined,
      docGia: locDocGia.value || undefined,
      sach: locSach.value || undefined,
      q: q.value.trim() || undefined,
      page: page.value,
      limit: LIMIT,
    })
    if (lan !== lanGoi) return
    ds.value = kq.data
    total.value = kq.total
    totalPages.value = Math.max(kq.totalPages, 1)
  } catch (e) {
    if (lan !== lanGoi) return
    loiTai.value = layThongBaoLoi(e, 'Không tải được danh sách lượt thuê')
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
watch(tab, () => {
  page.value = 1
  tai()
})
// Đổi tham số docGia / sach trên URL (ví dụ bấm "Bỏ lọc")
watch([locDocGia, locSach], () => {
  page.value = 1
  tai()
})

function doiTrang(n: number) {
  page.value = n
  tai()
}

function boLocUrl() {
  router.replace({ name: 'qt-thue' })
}

onMounted(tai)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="font-display text-2xl font-semibold">Lượt thuê</h1>
      <p class="text-sm text-muted">{{ total }} lượt thuê</p>
    </div>

    <div
      v-if="coLocUrl"
      class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sand-2 px-3 py-2 text-sm"
    >
      <span>Đang lọc theo {{ nhanLoc }}</span>
      <button type="button" class="btn-outline text-sm" @click="boLocUrl">Bỏ lọc</button>
    </div>

    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <div class="flex gap-2" role="tablist" aria-label="Lọc theo trạng thái">
        <button
          v-for="t in TABS"
          :key="t.gt"
          type="button"
          role="tab"
          :aria-selected="tab === t.gt"
          :class="tab === t.gt ? 'chip-on' : 'chip'"
          @click="tab = t.gt"
        >
          {{ t.ten }}
        </button>
      </div>
      <input
        v-model="q"
        type="search"
        class="input flex-1"
        placeholder="Tìm theo độc giả hoặc sách"
        aria-label="Tìm lượt thuê"
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
      <p class="text-ink-2">
        {{ q.trim() || tab || coLocUrl ? 'Không có lượt thuê nào phù hợp với bộ lọc.' : 'Chưa có lượt thuê nào.' }}
      </p>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-line bg-paper" :class="dangTai && 'opacity-60'">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[860px] text-left text-sm">
          <thead class="border-b border-line text-xs text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Độc giả</th>
              <th class="px-4 py-3 font-medium">Sách</th>
              <th class="px-4 py-3 font-medium">Gói</th>
              <th class="px-4 py-3 font-medium">Ngày thuê</th>
              <th class="px-4 py-3 font-medium">Hạn trả</th>
              <th class="px-4 py-3 font-medium">Trạng thái</th>
              <th class="px-4 py-3 text-center font-medium">Gia hạn</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="b in ds"
              :key="b._id"
              class="cursor-pointer border-b border-line last:border-b-0 hover:bg-sand"
              tabindex="0"
              :aria-label="`Xem chi tiết lượt thuê`"
              @click="idChiTiet = b._id"
              @keydown.enter="idChiTiet = b._id"
            >
              <td class="px-4 py-2.5">
                <template v-if="b.MaDocGia">
                  <div class="font-medium">{{ tenDayDu(b.MaDocGia) || '—' }}</div>
                  <div class="text-xs text-muted">{{ b.MaDocGia.Email }}</div>
                </template>
                <span v-else class="italic text-muted">Không còn dữ liệu</span>
              </td>
              <td class="px-4 py-2.5">
                <template v-if="b.MaSach">
                  <div class="font-medium">{{ b.MaSach.TenSach }}</div>
                  <div class="text-xs text-muted">{{ b.MaSach.TacGia }}</div>
                </template>
                <span v-else class="italic text-muted">Không còn dữ liệu</span>
              </td>
              <td class="px-4 py-2.5">
                <span v-if="b.MaGoi">{{ b.MaGoi.SoNgay }} ngày</span>
                <span v-else class="italic text-muted">Không còn dữ liệu</span>
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap">{{ dinhDangNgay(b.NgayThue) }}</td>
              <td class="px-4 py-2.5 whitespace-nowrap">{{ dinhDangNgay(b.NgayTra) }}</td>
              <td class="px-4 py-2.5">
                <span v-if="b.conHan" class="chip-on whitespace-nowrap">Còn {{ b.soNgayConLai }} ngày</span>
                <span v-else class="chip whitespace-nowrap text-clay-dark">Hết hạn</span>
              </td>
              <td class="px-4 py-2.5 text-center">{{ b.soLanGiaHan }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <QtPhanTrang :page="page" :total-pages="totalPages" :total="total" :limit="LIMIT" @doi-trang="doiTrang" />

    <QtThueChiTiet :id="idChiTiet" @dong="idChiTiet = null" />
  </div>
</template>