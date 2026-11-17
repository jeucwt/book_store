<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { idSachCuaBanGhi, layCuaToi } from '../api/thue'
import { layThongBaoLoi } from '../api/http'
import { bamChuoi } from '../utils/hash'
import BookCover from '../components/BookCover.vue'
import ShelfDecor from '../components/ShelfDecor.vue'
import type { BanGhiThue, SachRutGon } from '../types'

const CAO_TANG = 262 // cao nhất 240 + chừa chỗ sách nhấc lên
const KHE = 7 // khoảng hở giữa các cuốn
const LE = 28 // lề trái/phải mỗi tầng
const KHUNG = 36 // 2 × viền gỗ 18px
const DO_RONG = [116, 128, 142]
const DO_CAO = [178, 200, 222, 240]

const chiConHan = ref(true)
const danhSach = ref<BanGhiThue[]>([])
const dangTai = ref(false)
const loi = ref('')
const khungRef = ref<HTMLElement | null>(null)
const rong = ref(1000)
let ro: ResizeObserver | null = null

const thongTin = (b: BanGhiThue): SachRutGon =>
  typeof b.MaSach === 'string'
    ? { _id: b.MaSach, TenSach: '(Không rõ tên sách)', TacGia: '', AnhBia: '', TheLoai: '' }
    : b.MaSach

// Mỗi sách chỉ xuất hiện một lần trên kệ (lấy lần thuê có hạn muộn nhất)
const ds = computed(() => {
  const m = new Map<string, BanGhiThue>()
  for (const b of danhSach.value) {
    const k = idSachCuaBanGhi(b)
    const cu = m.get(k)
    if (!cu || new Date(b.NgayTra) > new Date(cu.NgayTra)) m.set(k, b)
  }
  return [...m.values()]
})

interface Cuon { b: BanGhiThue; w: number; h: number }

// Xếp sách vào từng tầng theo bề rộng khung kệ
const cacTang = computed(() => {
  const trong = Math.max(240, rong.value - KHUNG - LE * 2)
  const tang: Cuon[][] = []
  let hang: Cuon[] = []
  let dung = 0
  for (const b of ds.value) {
    const hs = bamChuoi(thongTin(b).TenSach)
    const w = DO_RONG[hs % DO_RONG.length] as number
    const h = DO_CAO[(hs >> 3) % DO_CAO.length] as number
    if (hang.length && dung + KHE + w > trong) {
      tang.push(hang)
      hang = []
      dung = 0
    }
    dung += (hang.length ? KHE : 0) + w
    hang.push({ b, w, h })
  }
  if (hang.length) tang.push(hang)
  while (tang.length < 2) tang.push([])
  return tang
})

const ngay = (s: string) => new Date(s).toLocaleDateString('vi-VN')
function trangThai(b: BanGhiThue) {
  if (!b.conHan) return 'Đã hết hạn · bấm để thuê lại'
  const con = b.soNgayConLai > 0 ? `Còn ${b.soNgayConLai} ngày` : 'Còn dưới 1 ngày'
  return `${con} · hạn ${ngay(b.NgayTra)}`
}

async function tai() {
  dangTai.value = true
  loi.value = ''
  try {
    danhSach.value = await layCuaToi(chiConHan.value)
  } catch (e) {
    loi.value = layThongBaoLoi(e)
  } finally {
    dangTai.value = false
  }
}

onMounted(() => {
  tai()
  ro = new ResizeObserver(([e]) => {
    if (e) rong.value = e.contentRect.width
  })
  if (khungRef.value) ro.observe(khungRef.value)
})
onBeforeUnmount(() => ro?.disconnect())
watch(chiConHan, tai)
</script>

<template>
  <div>
    <div class="mx-auto flex max-w-[1040px] flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-4xl font-semibold">Kệ sách của tôi</h1>
        <p class="mt-2 text-muted">Đưa chuột vào một cuốn để xem hạn thuê, bấm vào để đọc.</p>
      </div>
      <div class="flex gap-2">
        <button class="chip" :class="{ 'chip-on': chiConHan }" @click="chiConHan = true">Còn hạn</button>
        <button class="chip" :class="{ 'chip-on': !chiConHan }" @click="chiConHan = false">Tất cả</button>
      </div>
    </div>

    <div ref="khungRef" class="mx-auto mt-6 max-w-[1040px]">
      <p v-if="loi" class="alert-error mb-3 flex items-center justify-between gap-3">
        {{ loi }} <button class="btn-outline" @click="tai">Thử lại</button>
      </p>
      <p v-else-if="dangTai" class="mb-3 text-sm text-muted">Đang xếp sách lên kệ...</p>
      <p v-else-if="ds.length === 0" class="mb-3 text-muted">
        {{ chiConHan ? 'Kệ đang trống.' : 'Bạn chưa thuê sách nào.' }}
        <RouterLink :to="{ name: 'kham-pha' }" class="text-clay-dark underline">Khám phá sách</RouterLink> để thuê cuốn đầu tiên.
      </p>

      <div class="rounded-2xl bg-wood p-[18px]">
        <div class="rounded-md bg-shelf pt-7">
          <template v-for="(hang, i) in cacTang" :key="i">
            <div class="relative flex items-end gap-[7px] px-7" :style="{ height: CAO_TANG + 'px' }">
              <RouterLink
                v-for="(k, j) in hang"
                :key="k.b._id"
                :to="k.b.conHan ? { name: 'doc-sach', params: { id: idSachCuaBanGhi(k.b) } } : { name: 'chi-tiet-sach', params: { id: idSachCuaBanGhi(k.b) } }"
                class="group relative block shrink-0"
                :style="{ width: k.w + 'px', height: k.h + 'px' }"
                :aria-label="`${thongTin(k.b).TenSach}, ${trangThai(k.b)}`"
              >
                <div class="h-full w-full transition duration-200 group-hover:-translate-y-3 group-focus-visible:-translate-y-3" :class="{ 'opacity-60 grayscale': !k.b.conHan }">
                  <BookCover :anh="thongTin(k.b).AnhBia" :ten="thongTin(k.b).TenSach" />
                </div>
                <div
                  class="pointer-events-none absolute bottom-full z-20 mb-4 w-52 rounded-2xl bg-paper p-3 opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  :class="j < hang.length / 2 ? 'left-0' : 'right-0'"
                  aria-hidden="true"
                >
                  <strong class="block font-display text-base leading-tight">{{ thongTin(k.b).TenSach }}</strong>
                  <small class="block text-muted">{{ thongTin(k.b).TacGia }}</small>
                  <em class="mt-1.5 block text-xs not-italic" :class="k.b.conHan ? 'text-[#3f5a48]' : 'text-[#9a3b25]'">{{ trangThai(k.b) }}</em>
                </div>
              </RouterLink>
            </div>
            <div class="h-[18px] border-t-[3px] border-wood-3 bg-wood-2 shadow-[0_8px_12px_-6px_rgba(58,42,34,0.35)]"></div>
          </template>

          <!-- Tầng cuối: đồ trang trí -->
          <div class="flex items-end px-7" :style="{ height: '150px' }"><ShelfDecor /></div>
          <div class="h-[18px] border-t-[3px] border-wood-3 bg-wood-2 shadow-[0_8px_12px_-6px_rgba(58,42,34,0.35)]"></div>
        </div>
      </div>
    </div>
  </div>
</template>