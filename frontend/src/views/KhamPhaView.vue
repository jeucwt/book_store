<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { layDanhSachSach, layGoiThue, layNam, layTheLoai } from '../api/sach'
import { layThongBaoLoi } from '../api/http'
import BookCard from '../components/BookCard.vue'
import BookCover from '../components/BookCover.vue'
import Pagination from '../components/Pagination.vue'
import type { GoiThue, Sach } from '../types'

const SO_SACH_MOI_TRANG = 12 // đổi thành 2 để test phân trang khi ít sách

const route = useRoute()
const router = useRouter()

const sach = ref<Sach[]>([])
const total = ref(0)
const totalPages = ref(1)
const dangTai = ref(false)
const loi = ref('')
const dsTheLoai = ref<string[]>([])
const dsNam = ref<string[]>([])
const goiThue = ref<GoiThue[]>([])
const luoiRef = ref<HTMLElement | null>(null)

const sapXepOptions = [
  { value: 'moinhat', label: 'Mới nhất' },
  { value: 'cunhat', label: 'Cũ nhất' },
  { value: 'ten_az', label: 'Tên A → Z' },
  { value: 'ten_za', label: 'Tên Z → A' },
  { value: 'nam_giam', label: 'Năm XB giảm dần' },
  { value: 'nam_tang', label: 'Năm XB tăng dần' },
]

const NEN = ['#ebd9c6', '#e6d6d0', '#dadfd2', '#e8dfc4']
const CAU_CHU: Record<string, string> = {
  'Truyện ngắn': 'Đọc gọn trong một buổi chiều',
  'Tiểu thuyết': 'Những trang dài cho đêm mưa',
  'Thơ ca': 'Vài dòng cho lòng lắng lại',
  'Thiếu nhi': 'Phiêu lưu cho tuổi thơ',
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const bo = computed(() => ({
  q: str(route.query.q),
  theLoai: str(route.query.theLoai),
  nam: str(route.query.nam),
  sapXep: str(route.query.sapXep) || 'moinhat',
  page: Number(route.query.page) || 1,
}))
const coLoc = computed(() => !!(bo.value.q || bo.value.theLoai || bo.value.nam))
const sapXepHienTai = computed(() => bo.value.sapXep)
const boSuuTap = computed(() => dsTheLoai.value.slice(0, 4))

function capNhat(patch: Record<string, string | number | undefined>) {
  const query: Record<string, any> = { ...route.query, ...patch }
  for (const k of Object.keys(query)) {
    if (query[k] === '' || query[k] === undefined) delete query[k]
  }
  router.push({ query })
}

const giaTri = (e: Event) => (e.target as HTMLSelectElement).value
const cuonDenLuoi = () => luoiRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })

let reqId = 0
async function taiSach() {
  const id = ++reqId
  dangTai.value = true
  loi.value = ''
  try {
    const kq = await layDanhSachSach({
      q: bo.value.q || undefined,
      theLoai: bo.value.theLoai || undefined,
      nam: bo.value.nam || undefined,
      sapXep: bo.value.sapXep,
      page: bo.value.page,
      limit: SO_SACH_MOI_TRANG,
    })
    if (id !== reqId) return
    sach.value = kq.data
    total.value = kq.total
    totalPages.value = kq.totalPages
  } catch (e) {
    if (id === reqId) loi.value = layThongBaoLoi(e)
  } finally {
    if (id === reqId) dangTai.value = false
  }
}

watch(
  () => JSON.stringify(bo.value),
  () => {
    if (route.name === 'kham-pha') taiSach()
  },
  { immediate: true },
)

onMounted(async () => {
  const [tl, nam, goi] = await Promise.allSettled([layTheLoai(), layNam(), layGoiThue()])
  if (tl.status === 'fulfilled') dsTheLoai.value = tl.value
  if (nam.status === 'fulfilled') dsNam.value = nam.value
  if (goi.status === 'fulfilled') goiThue.value = goi.value
})
</script>

<template>
  <div>
    <!-- Hero: chỉ hiện ở trang đầu, khi chưa lọc -->
    <section v-if="!coLoc && bo.page === 1" class="flex items-center justify-between gap-8 overflow-hidden rounded-[28px] bg-panel px-8 py-12 md:px-16">
      <div>
        <p class="mb-4 text-xs tracking-[0.18em] text-muted">NHỮNG CUỐN SÁCH ĐỌC CHẬM</p>
        <h1 class="mb-5 text-5xl font-normal leading-[1.05] lg:text-6xl">Mỗi mùa,<br />một câu chuyện.</h1>
        <p class="mb-7 max-w-sm leading-relaxed text-ink-2">
          Thuê sách theo ngày và đọc ngay trên trình duyệt. Chọn một cuốn, pha tách trà, đọc cho đến khi hết hạn.
        </p>
        <button class="btn-primary" @click="cuonDenLuoi">Khám phá sách →</button>
      </div>
      <div class="relative hidden h-[330px] w-[520px] shrink-0 lg:block" aria-hidden="true">
        <i class="absolute right-14 top-2 size-[150px] rounded-full bg-[#e9c9a5]"></i>
        <div class="absolute bottom-9 left-8 flex flex-col font-display text-[17px] font-semibold text-[#fff8ee]">
          <div class="flex h-14 w-[380px] items-center rounded bg-[#d6a24a] px-5 !text-[#33241d] shadow-md">Truyện Kiều</div>
          <div class="ml-6 flex h-14 w-[350px] items-center rounded bg-[#3f5a48] px-5 shadow-md">Lão Hạc</div>
          <div class="-ml-2 flex h-14 w-[400px] items-center rounded bg-[#b8644a] px-5 shadow-md">Tắt Đèn</div>
        </div>
        <i class="absolute bottom-9 right-12 h-16 w-[72px] rounded-b-[18px] bg-[#fff8ee] after:absolute after:-right-5 after:top-3 after:h-7 after:w-5 after:rounded-r-2xl after:border-[6px] after:border-l-0 after:border-[#fff8ee] after:content-['']"></i>
        <i class="absolute inset-x-0 bottom-0 h-9 rounded-md bg-wood"></i>
      </div>
    </section>

    <!-- Bộ sưu tập theo thể loại -->
    <section v-if="!coLoc && bo.page === 1 && boSuuTap.length" class="mt-10">
      <h2 class="mb-5 text-3xl font-semibold">Bộ sưu tập</h2>
      <div class="grid grid-cols-2 gap-5 md:grid-cols-4">
        <button
          v-for="(t, i) in boSuuTap"
          :key="t"
          class="flex flex-col items-start gap-1 rounded-3xl p-5 text-left transition hover:-translate-y-0.5"
          :style="{ background: NEN[i % NEN.length] }"
          @click="capNhat({ theLoai: t, page: undefined })"
        >
          <div class="mb-3 h-[136px] w-[92px]"><BookCover :ten="t" /></div>
          <strong class="font-display text-lg">{{ t }}</strong>
          <small class="text-sm text-ink-2">{{ CAU_CHU[t] ?? 'Khám phá thể loại này' }}</small>
        </button>
      </div>
    </section>

    <!-- Tất cả sách -->
    <section ref="luoiRef" class="mt-10 scroll-mt-6">
      <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 class="text-3xl font-semibold">{{ bo.q ? `Kết quả cho “${bo.q}”` : 'Tất cả sách' }}</h2>
        <span v-if="!dangTai && !loi" class="text-sm text-muted">{{ total }} sách</span>
      </div>

      <div class="mb-6 flex flex-wrap items-center gap-2">
        <button class="chip" :class="{ 'chip-on': !bo.theLoai }" @click="capNhat({ theLoai: '', page: undefined })">Tất cả</button>
        <button
          v-for="t in dsTheLoai"
          :key="t"
          class="chip"
          :class="{ 'chip-on': bo.theLoai === t }"
          @click="capNhat({ theLoai: t, page: undefined })"
        >{{ t }}</button>

        <div class="ml-auto flex gap-2">
          <select class="input !w-auto !rounded-full !bg-sand" aria-label="Lọc theo năm" :value="bo.nam" @change="capNhat({ nam: giaTri($event), page: undefined })">
            <option value="">Mọi năm</option>
            <option v-for="n in dsNam" :key="n" :value="n">{{ n }}</option>
          </select>
          <select class="input !w-auto !rounded-full !bg-sand" aria-label="Sắp xếp" :value="sapXepHienTai" @change="capNhat({ sapXep: giaTri($event), page: undefined })">
            <option v-for="o in sapXepOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <button v-if="coLoc" class="btn-outline" @click="router.push({ query: {} })">Xóa bộ lọc</button>
        </div>
      </div>

      <div v-if="dangTai" class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <div v-for="i in SO_SACH_MOI_TRANG" :key="i" class="animate-pulse">
          <div class="aspect-[2/3] rounded-lg bg-sand"></div>
          <div class="mt-3 h-3 w-3/4 rounded bg-sand"></div>
          <div class="mt-1.5 h-3 w-1/2 rounded bg-sand"></div>
        </div>
      </div>

      <div v-else-if="loi" class="rounded-3xl bg-[#f3ddd3] p-8 text-center">
        <p class="text-[#7a2e1d]">{{ loi }}</p>
        <button class="btn-primary mt-4" @click="taiSach">Thử lại</button>
      </div>

      <div v-else-if="sach.length === 0" class="rounded-3xl border border-dashed border-line p-12 text-center text-muted">
        Không tìm thấy sách phù hợp.
      </div>

      <template v-else>
        <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <BookCard v-for="s in sach" :key="s._id" :sach="s" />
        </div>
        <Pagination :page="bo.page" :total-pages="totalPages" @doi-trang="(p) => capNhat({ page: p })" />
      </template>
    </section>

    <!-- Gói thuê -->
    <section v-if="goiThue.length && !coLoc" class="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#e8dccb] px-8 py-6">
      <p class="font-display text-2xl">Đọc theo nhịp của bạn</p>
      <div class="flex gap-3">
        <span v-for="g in goiThue" :key="g._id" class="rounded-full bg-sand-2 px-5 py-2.5 text-sm font-semibold text-[#4a2f22]">{{ g.SoNgay }} ngày</span>
      </div>
    </section>
  </div>
</template>