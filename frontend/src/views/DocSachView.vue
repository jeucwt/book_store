<script setup lang="ts">
// frontend/src/views/DocSachView.vue  (thay thế bản giữ chỗ)
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTrinhDoc } from '../composables/useTrinhDoc'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const maSach = String(route.params.id)
const stageRef = ref<HTMLElement | null>(null)
const khungRef = ref<HTMLElement | null>(null)

// Email độc giả dùng làm watermark (field Email của user trong store)
const email = computed(() => (auth.user as unknown as { Email?: string } | null)?.Email ?? '')

const {
  trangThai,
  loiMsg,
  khoaMsg,
  loiTaiThem,
  dangTaiThem,
  sach,
  muc,
  ciHienTai,
  trangTrongChuong,
  tongTrangChuong,
  dangOBia,
  tienDo,
  conHan,
  mucLucMo,
  latTruoc,
  latSau,
  nhayToi,
  thuLai,
  thuLaiTaiThem,
} = useTrinhDoc(maSach, () => email.value, stageRef, khungRef)

const nhanTienDo = computed(() => {
  if (trangThai.value !== 'san') return ''
  if (dangOBia.value) return 'Bìa sách'
  return `Chương ${ciHienTai.value + 1}/${muc.value.length} · Trang ${trangTrongChuong.value}/${tongTrangChuong.value}`
})

function quayLai() {
  router.push({ name: 'sach-cua-toi' })
}
// Giả định route chi-tiet-sach dùng tham số `id`; nếu bạn đặt tên khác, sửa ở đây.
function sangChiTiet() {
  router.push({ name: 'chi-tiet-sach', params: { id: maSach } })
}
</script>

<template>
  <div
    class="dr-root flex h-dvh flex-col bg-cream text-ink select-none"
    @contextmenu.prevent
    @copy.prevent
    @cut.prevent
    @dragstart.prevent
    @selectstart.prevent
  >
    <!-- Thanh công cụ -->
    <header class="flex items-center gap-2 px-3 py-3 md:px-8">
      <button class="btn-outline shrink-0" type="button" aria-label="Quay lại Sách của tôi" @click="quayLai">
        <span aria-hidden="true">←</span><span class="hidden md:inline"> Sách của tôi</span>
      </button>
      <div class="min-w-0 flex-1 text-center">
        <h1 class="truncate font-display text-base md:text-xl">{{ sach?.tenSach || 'Đang đọc' }}</h1>
        <p v-if="sach?.tacGia" class="hidden truncate text-sm text-muted md:block">{{ sach.tacGia }}</p>
      </div>
      <span v-if="conHan" class="chip shrink-0">{{ conHan }}</span>
      <button
        class="btn-outline shrink-0"
        type="button"
        aria-label="Mục lục"
        :disabled="trangThai !== 'san'"
        @click="mucLucMo = true"
      >
        <span aria-hidden="true">☰</span><span class="hidden md:inline"> Mục lục</span>
      </button>
    </header>

    <!-- Khu đọc -->
    <main class="relative min-h-0 flex-1">
      <div ref="stageRef" class="absolute inset-0 flex items-center justify-center px-3 py-3 md:px-20">
        <div ref="khungRef" class="dr-khung"></div>
      </div>

      <button
        v-show="trangThai === 'san'"
        class="dr-mui dr-mui--trai hidden md:flex"
        type="button"
        aria-label="Trang trước"
        @click="latTruoc"
      >
        ‹
      </button>
      <button
        v-show="trangThai === 'san'"
        class="dr-mui dr-mui--phai hidden md:flex"
        type="button"
        aria-label="Trang sau"
        @click="latSau"
      >
        ›
      </button>

      <!-- Thông báo lỗi nhẹ khi tải chương kế/chương trước thất bại -->
      <div
        v-if="loiTaiThem && trangThai === 'san'"
        class="absolute inset-x-0 bottom-3 z-10 mx-auto flex w-fit max-w-[90%] items-center gap-3 rounded-2xl bg-panel px-4 py-2 text-sm shadow"
        role="alert"
      >
        <span>{{ loiTaiThem }}</span>
        <button class="btn-primary" type="button" @click="thuLaiTaiThem">Thử lại</button>
      </div>

      <!-- Trạng thái: đang tải / rỗng / lỗi / khóa -->
      <div
        v-if="trangThai === 'tai'"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-cream"
        role="status"
      >
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-sand-3 border-t-clay"></div>
        <p class="text-muted">Đang mở sách…</p>
      </div>

      <div
        v-else-if="trangThai === 'rong'"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-cream p-6 text-center"
      >
        <p class="font-display text-xl">Sách này chưa có chương nội dung</p>
        <p class="text-muted">Vui lòng quay lại sau khi sách được cập nhật.</p>
        <button class="btn-primary" type="button" @click="quayLai">Về Sách của tôi</button>
      </div>

      <div
        v-else-if="trangThai === 'loi'"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-cream p-6 text-center"
        role="alert"
      >
        <p class="font-display text-xl">Không mở được sách</p>
        <p class="alert-error">{{ loiMsg }}</p>
        <div class="flex gap-3">
          <button class="btn-primary" type="button" @click="thuLai">Thử lại</button>
          <button class="btn-outline" type="button" @click="quayLai">Về Sách của tôi</button>
        </div>
      </div>

      <div
        v-else-if="trangThai === 'khoa'"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-cream p-6 text-center"
        role="alert"
      >
        <div class="text-5xl" aria-hidden="true">🔒</div>
        <p class="font-display text-xl">{{ khoaMsg }}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <button class="btn-primary" type="button" @click="sangChiTiet">Xem sách để thuê</button>
          <button class="btn-outline" type="button" @click="quayLai">Về Sách của tôi</button>
        </div>
      </div>
    </main>

    <!-- Thanh tiến độ + nút lật (điện thoại) -->
    <footer class="px-4 pb-4 pt-2 md:px-20">
      <div class="flex items-center gap-3">
        <button class="btn-primary md:hidden" type="button" :disabled="trangThai !== 'san'" @click="latTruoc">
          ‹ Trước
        </button>
        <div class="min-w-0 flex-1">
          <div
            class="h-2 rounded-full bg-sand-2"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="tienDo"
          >
            <div class="h-2 rounded-full bg-clay transition-all" :style="{ width: tienDo + '%' }"></div>
          </div>
          <p class="mt-1 text-center text-xs text-muted">
            {{ nhanTienDo }}<span v-if="dangTaiThem"> · đang tải chương…</span>
          </p>
        </div>
        <button class="btn-primary md:hidden" type="button" :disabled="trangThai !== 'san'" @click="latSau">
          Sau ›
        </button>
      </div>
    </footer>

    <!-- Mục lục -->
    <div
      v-if="mucLucMo"
      class="fixed inset-0 z-30 flex justify-end bg-ink/30"
      @click.self="mucLucMo = false"
    >
      <aside
        class="h-full w-80 max-w-[85vw] overflow-y-auto bg-panel p-4 shadow-xl"
        role="dialog"
        aria-label="Mục lục"
      >
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-display text-lg">Mục lục</h2>
          <button class="btn-outline" type="button" @click="mucLucMo = false">Đóng</button>
        </div>
        <ol class="flex flex-col gap-1">
          <li v-for="(m, i) in muc" :key="m.SoChuong">
            <button
              type="button"
              class="w-full rounded-xl px-3 py-2 text-left"
              :class="!dangOBia && i === ciHienTai ? 'bg-sand-2 font-semibold' : 'hover:bg-sand'"
              @click="nhayToi(i)"
            >
              {{ m.SoChuong }}. {{ m.TieuDe }}
            </button>
          </li>
        </ol>
      </aside>
    </div>
  </div>
</template>

<!-- Không dùng scoped: các trang được thư viện/JS dựng bằng DOM thuần nên cần CSS toàn cục -->
<style>
.dr-root {
  -webkit-touch-callout: none;
}

/* Khung bìa gỗ quanh cuốn sách */
.dr-khung {
  display: flex;
  justify-content: center;
  padding: 18px 22px; /* khớp KHUNG_PAD_Y / KHUNG_PAD_X trong utils/phanTrang.ts */
  border-radius: 22px;
  background: linear-gradient(145deg, var(--color-wood-2, #9a6a45), var(--color-wood, #7d5233));
  box-shadow:
    0 26px 50px rgba(59, 42, 29, 0.32),
    inset 0 0 0 2px rgba(255, 255, 255, 0.1);
}
.dr-lat {
  margin: 0 auto;
}

/* Cạnh giấy dày (nếu thư viện gắn class --left/--right lên trang, sẽ thấy chồng giấy) */
.dr-khung .stf__item.--left {
  box-shadow:
    -1px 1px 0 #ede2c8, -2px 2px 0 #d9ccae, -3px 3px 0 #ede2c8,
    -4px 4px 0 #d9ccae, -5px 5px 0 #ede2c8, -6px 6px 0 #d9ccae;
}
.dr-khung .stf__item.--right {
  box-shadow:
    1px 1px 0 #ede2c8, 2px 2px 0 #d9ccae, 3px 3px 0 #ede2c8,
    4px 4px 0 #d9ccae, 5px 5px 0 #ede2c8, 6px 6px 0 #d9ccae;
}

/* Trang giấy */
.dr-trang {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--color-paper, #fbf5e6);
  color: var(--color-ink, #3b2a1d);
  font-family: var(--font-display, Georgia, serif);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.dr-dau,
.dr-chan {
  position: absolute;
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted, #6b5644);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dr-chan {
  text-align: center;
}

/* Thân trang: DÙNG CHUNG cho trang thật và hộp đo ẩn (phải giống hệt để chia trang đúng) */
.dr-than {
  position: absolute;
  overflow: hidden;
  line-height: 1.75;
  text-align: justify;
  overflow-wrap: break-word;
}
.dr-p {
  margin: 0;
  text-indent: 1.5em;
}
.dr-p--tiep {
  text-indent: 0;
}
.dr-chuong-nhan {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.72em;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted, #6b5644);
  margin-bottom: 0.4em;
}
.dr-chuong-ten {
  font-size: 1.45em;
  line-height: 1.25;
  font-weight: 600;
  margin: 0 0 1.2em;
}

/* Hộp đo: ẩn, ngoài màn hình */
.dr-do {
  position: fixed;
  left: -100000px;
  top: 0;
  visibility: hidden;
  pointer-events: none;
}

/* Watermark email */
.dr-wm {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-24deg);
  font: 700 18px var(--font-sans, system-ui, sans-serif);
  color: rgba(59, 42, 29, 0.09);
  white-space: nowrap;
  pointer-events: none;
}

/* Bìa */
.dr-bia {
  background: linear-gradient(150deg, var(--color-clay, #b5734d), var(--color-clay-dark, #8f5636));
  color: #fbf5e6;
  box-shadow: inset 0 0 0 6px rgba(255, 255, 255, 0.12);
}
.dr-bia-hop {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12%;
  text-align: center;
}
.dr-bia-ten {
  font-size: 1.7rem;
  line-height: 1.2;
  font-weight: 600;
}
.dr-bia-ke {
  width: 48px;
  height: 2px;
  background: rgba(251, 245, 230, 0.6);
}
.dr-bia-tg {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.95rem;
  letter-spacing: 0.06em;
}

/* Trang giữ chỗ khi chương chưa tải */
.dr-cho-chu {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 14px;
  color: var(--color-muted, #6b5644);
}

/* Nút mũi tên hai bên (màn hình rộng) */
.dr-mui {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: var(--color-sand, #e8d5b2);
  color: var(--color-ink, #3b2a1d);
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
}
.dr-mui--trai {
  left: 16px;
}
.dr-mui--phai {
  right: 16px;
}

/* Không in nội dung sách */
@media print {
  .dr-root {
    display: none !important;
  }
}
</style>