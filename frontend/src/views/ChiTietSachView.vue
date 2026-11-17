<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { layGoiThue, laySach } from '../api/sach'
import { giaHanSach, idSachCuaBanGhi, layCuaToi, thueSach } from '../api/thue'
import { layThongBaoLoi } from '../api/http'
import BookCover from '../components/BookCover.vue'
import type { BanGhiThue, GoiThue, Sach } from '../types'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const id = computed(() => String(route.params.id))
const sach = ref<Sach | null>(null)
const goiThue = ref<GoiThue[]>([])
const goiChon = ref('')
const banGhi = ref<BanGhiThue | null>(null)
const dangTai = ref(true)
const loi = ref('')
const dangXuLy = ref(false)
const thongBao = ref<{ loai: 'ok' | 'loi'; noiDung: string } | null>(null)
const hienXacNhan = ref(false)
const hanhDong = ref<'thue' | 'giahan'>('thue')

const tenNXB = computed(() => {
  const n = sach.value?.MaNXB
  return n && typeof n === 'object' ? n.TenNXB : ''
})

const trangThai = computed<'khach' | 'nhanvien' | 'chua-thue' | 'con-han' | 'het-han'>(() => {
  if (!auth.isLoggedIn) return 'khach'
  if (!auth.isDocGia) return 'nhanvien'
  if (!banGhi.value) return 'chua-thue'
  return banGhi.value.conHan ? 'con-han' : 'het-han'
})

const goiDangChon = computed(() => goiThue.value.find((g) => g._id === goiChon.value) ?? null)

const nhanNut = computed(() => {
  switch (trangThai.value) {
    case 'khach': return 'Đăng nhập để thuê'
    case 'con-han': return 'Gia hạn'
    case 'het-han': return 'Thuê lại'
    default: return 'Thuê sách'
  }
})

const dinhDangGia = (g: number) => (g > 0 ? `${g.toLocaleString('vi-VN')}đ` : 'Miễn phí')
const dinhDangNgay = (s?: string) => (s ? new Date(s).toLocaleDateString('vi-VN') : '')

async function taiTrangThaiThue() {
  banGhi.value = null
  if (!auth.isDocGia) return
  try {
    const ds = await layCuaToi()
    const hop = ds
      .filter((b) => idSachCuaBanGhi(b) === id.value)
      .sort((a, b) => new Date(b.NgayTra).getTime() - new Date(a.NgayTra).getTime())
    banGhi.value = hop[0] ?? null
  } catch {
    /* không chặn trang nếu không lấy được trạng thái thuê */
  }
}

async function tai() {
  if (route.name !== 'chi-tiet-sach') return
  dangTai.value = true
  loi.value = ''
  thongBao.value = null
  try {
    const [s, g] = await Promise.all([laySach(id.value), layGoiThue()])
    sach.value = s
    goiThue.value = g
    goiChon.value = g[0]?._id ?? ''
    await taiTrangThaiThue()
  } catch (e) {
    loi.value = layThongBaoLoi(e, 'Không tải được thông tin sách')
  } finally {
    dangTai.value = false
  }
}

watch(() => route.params.id, tai, { immediate: true })

function batDau() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'dang-nhap', query: { redirect: route.fullPath } })
    return
  }
  hanhDong.value = trangThai.value === 'con-han' ? 'giahan' : 'thue'
  hienXacNhan.value = true
}

async function xacNhan() {
  if (!goiChon.value) return
  dangXuLy.value = true
  try {
    const kq =
      hanhDong.value === 'thue'
        ? await thueSach(id.value, goiChon.value)
        : await giaHanSach(id.value, goiChon.value)
    thongBao.value = { loai: 'ok', noiDung: kq.message || 'Thành công' }
  } catch (e) {
    thongBao.value = { loai: 'loi', noiDung: layThongBaoLoi(e) }
  } finally {
    hienXacNhan.value = false
    dangXuLy.value = false
    await taiTrangThaiThue() // đồng bộ lại trạng thái dù thành công hay lỗi 409
  }
}
</script>

<template>
  <div>
    <RouterLink :to="{ name: 'kham-pha' }" class="text-sm text-muted hover:text-ink">← Quay lại khám phá</RouterLink>

    <div v-if="dangTai" class="mt-6 animate-pulse text-muted">Đang tải...</div>

    <div v-else-if="loi" class="mt-6 rounded-3xl bg-[#f3ddd3] p-8 text-center">
      <p class="text-[#7a2e1d]">{{ loi }}</p>
      <button class="btn-primary mt-4" @click="tai">Thử lại</button>
    </div>

    <div v-else-if="sach" class="mt-6 grid gap-12 md:grid-cols-[300px_1fr]">
      <div class="mx-auto aspect-[2/3] w-52 md:w-full">
        <BookCover :anh="sach.AnhBia" :ten="sach.TenSach" />
      </div>

      <div class="max-w-xl">
        <h1 class="text-5xl font-semibold leading-[1.05]">{{ sach.TenSach }}</h1>
        <p class="mt-2 font-display text-2xl text-ink-2">{{ sach.TacGia }}</p>
        <p class="mt-4 text-sm text-muted">
          <template v-if="tenNXB">NXB {{ tenNXB }} · </template>{{ sach.NamXuatBan }} · {{ sach.TheLoai }}
        </p>
        <p class="mt-5 whitespace-pre-line text-[17px] leading-relaxed text-ink-2">{{ sach.TomTat }}</p>

        <section class="mt-8 rounded-3xl bg-panel p-6">
          <p v-if="thongBao" :class="thongBao.loai === 'ok' ? 'alert-ok' : 'alert-error'" class="mb-4">{{ thongBao.noiDung }}</p>

          <div v-if="trangThai === 'con-han' && banGhi" class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#dde6d5] p-4">
            <div class="text-sm text-[#2f4a38]">
              <div class="font-semibold">{{ banGhi.soNgayConLai > 0 ? `Còn ${banGhi.soNgayConLai} ngày` : 'Còn dưới 1 ngày' }}</div>
              <div>Hết hạn: {{ dinhDangNgay(banGhi.NgayTra) }} · Đã gia hạn {{ banGhi.soLanGiaHan }} lần</div>
            </div>
            <RouterLink :to="{ name: 'doc-sach', params: { id: sach._id } }" class="btn-primary">Đọc ngay</RouterLink>
          </div>

          <p v-else-if="trangThai === 'het-han' && banGhi" class="alert-error mb-5">
            Sách đã hết hạn thuê từ {{ dinhDangNgay(banGhi.NgayTra) }}. Hãy thuê lại để tiếp tục đọc.
          </p>

          <p v-if="trangThai === 'nhanvien'" class="text-sm text-muted">
            Tài khoản nhân viên không thể thuê sách. Hãy dùng tài khoản độc giả.
          </p>

          <template v-else>
            <h2 class="mb-4 text-xl font-semibold">{{ trangThai === 'con-han' ? 'Gia hạn thêm' : 'Chọn gói thuê' }}</h2>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label
                v-for="g in goiThue"
                :key="g._id"
                class="cursor-pointer rounded-2xl px-2 py-4 text-center transition focus-within:outline-2 focus-within:outline-clay"
                :class="goiChon === g._id ? 'bg-sand-3' : 'bg-cream hover:bg-sand-2'"
              >
                <input v-model="goiChon" type="radio" name="goi" class="sr-only" :value="g._id" />
                <div class="text-lg font-bold">{{ g.SoNgay }} ngày</div>
                <div class="text-sm text-ink-2">{{ dinhDangGia(g.Gia) }}</div>
                <div class="text-xs text-muted">{{ g.TenGoi }}</div>
              </label>
            </div>
            <button class="btn-primary mt-5" :disabled="!goiChon" @click="batDau">{{ nhanNut }}</button>
          </template>
        </section>
      </div>
    </div>

    <!-- Hộp xác nhận thanh toán giả lập -->
    <div v-if="hienXacNhan" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div class="w-full max-w-sm rounded-3xl bg-paper p-6 shadow-xl">
        <h3 class="text-xl font-semibold">Xác nhận {{ hanhDong === 'thue' ? 'thuê sách' : 'gia hạn' }}</h3>
        <p class="mt-2 text-sm text-ink-2">
          «{{ sach?.TenSach }}» · {{ goiDangChon?.SoNgay }} ngày ·
          <strong>{{ goiDangChon ? dinhDangGia(goiDangChon.Gia) : '' }}</strong>
        </p>
        <p class="mt-3 rounded-xl bg-[#f1e4c4] p-2 text-xs text-[#6a4a12]">Đây là thanh toán giả lập, hệ thống không trừ tiền thật.</p>
        <div class="mt-5 flex justify-end gap-2">
          <button class="btn-outline" :disabled="dangXuLy" @click="hienXacNhan = false">Hủy</button>
          <button class="btn-primary" :disabled="dangXuLy" @click="xacNhan">{{ dangXuLy ? 'Đang xử lý...' : 'Xác nhận' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>