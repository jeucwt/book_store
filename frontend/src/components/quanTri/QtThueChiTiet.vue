<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { layThongBaoLoi } from '../../api/http'
import { layChiTietLuotThueQT } from '../../api/quanTri'
import type { ChiTietLuotThueQT } from '../../types'
import { dinhDangNgay, tenDayDu } from '../../utils/dinhDang'

const props = defineProps<{ id: string | null }>()
const emit = defineEmits<{ (e: 'dong'): void }>()

const ct = ref<ChiTietLuotThueQT | null>(null)
const dangTai = ref(false)
const loi = ref('')
let lanGoi = 0

async function tai() {
  if (!props.id) return
  const lan = ++lanGoi
  dangTai.value = true
  loi.value = ''
  ct.value = null
  try {
    const kq = await layChiTietLuotThueQT(props.id)
    if (lan !== lanGoi) return
    ct.value = kq
  } catch (e) {
    if (lan !== lanGoi) return
    loi.value = layThongBaoLoi(e, 'Không tải được chi tiết lượt thuê')
  } finally {
    if (lan === lanGoi) dangTai.value = false
  }
}

watch(
  () => props.id,
  (id) => {
    if (id) tai()
    else {
      lanGoi++
      ct.value = null
      loi.value = ''
    }
  },
  { immediate: true },
)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.id) emit('dong')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div
    v-if="id"
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    @click.self="emit('dong')"
  >
    <div
      class="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-paper p-5 shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết lượt thuê"
    >
      <div class="mb-4 flex items-start justify-between gap-3">
        <h2 class="font-display text-xl font-semibold">Chi tiết lượt thuê</h2>
        <button type="button" class="px-1 text-xl leading-none text-muted hover:text-ink" aria-label="Đóng" @click="emit('dong')">
          ×
        </button>
      </div>

      <p v-if="dangTai" class="py-8 text-center text-muted">Đang tải…</p>

      <div v-else-if="loi" class="alert-error flex flex-wrap items-center justify-between gap-3">
        <span>{{ loi }}</span>
        <button type="button" class="btn-outline text-sm" @click="tai">Thử lại</button>
      </div>

      <template v-else-if="ct">
        <dl class="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
          <dt class="text-muted">Độc giả</dt>
          <dd>
            <template v-if="ct.MaDocGia">
              <div class="font-medium">{{ tenDayDu(ct.MaDocGia) || '—' }}</div>
              <div class="text-xs text-muted">{{ ct.MaDocGia.Email }}</div>
            </template>
            <span v-else class="italic text-muted">Không còn dữ liệu</span>
          </dd>

          <dt class="text-muted">Sách</dt>
          <dd>
            <template v-if="ct.MaSach">
              <div class="font-medium">{{ ct.MaSach.TenSach }}</div>
              <div class="text-xs text-muted">{{ ct.MaSach.TacGia }}</div>
            </template>
            <span v-else class="italic text-muted">Không còn dữ liệu</span>
          </dd>

          <dt class="text-muted">Gói</dt>
          <dd>
            <span v-if="ct.MaGoi">{{ ct.MaGoi.TenGoi }} · {{ ct.MaGoi.SoNgay }} ngày</span>
            <span v-else class="italic text-muted">Không còn dữ liệu</span>
          </dd>

          <dt class="text-muted">Ngày thuê</dt>
          <dd>{{ dinhDangNgay(ct.NgayThue) }}</dd>

          <dt class="text-muted">Hạn trả</dt>
          <dd>{{ dinhDangNgay(ct.NgayTra) }}</dd>

          <dt class="text-muted">Trạng thái</dt>
          <dd>
            <span v-if="ct.conHan" class="chip-on">Còn {{ ct.soNgayConLai }} ngày</span>
            <span v-else class="chip text-clay-dark">Hết hạn</span>
          </dd>

          <template v-if="typeof ct.TrangCuoiDoc === 'number'">
            <dt class="text-muted">Trang cuối đọc</dt>
            <dd>{{ ct.TrangCuoiDoc }}</dd>
          </template>
        </dl>

        <h3 class="mb-2 mt-5 font-display text-base font-semibold">
          Lịch sử gia hạn ({{ ct.LichSuGiaHan?.length ?? 0 }})
        </h3>
        <p v-if="!ct.LichSuGiaHan || ct.LichSuGiaHan.length === 0" class="rounded-xl bg-sand px-3 py-3 text-sm text-muted">
          Chưa gia hạn lần nào.
        </p>
        <ol v-else class="space-y-2">
          <li v-for="(l, i) in ct.LichSuGiaHan" :key="i" class="rounded-xl bg-sand px-3 py-2 text-sm">
            <div class="flex flex-wrap justify-between gap-2">
              <span class="font-medium">Lần {{ i + 1 }} · +{{ l.SoNgay }} ngày</span>
              <span class="text-muted">{{ dinhDangNgay(l.NgayGiaHan) }}</span>
            </div>
            <div class="text-xs text-muted">
              Gói: {{ l.MaGoi ? l.MaGoi.TenGoi : 'Không còn dữ liệu' }}
              <template v-if="l.MaThanhToan"> · Mã thanh toán: {{ l.MaThanhToan }}</template>
            </div>
          </li>
        </ol>
      </template>

      <div class="mt-5 text-right">
        <button type="button" class="btn-outline text-sm" @click="emit('dong')">Đóng</button>
      </div>
    </div>
  </div>
</template>