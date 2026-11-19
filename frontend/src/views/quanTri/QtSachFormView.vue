<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { layThongBaoLoi } from '../../api/http'
import {
  capNhatSachQT,
  layChiTietSachQT,
  layTheLoaiQT,
  taoSachQT,
  type ChiTietSachQT,
  type DuLieuSach,
} from '../../api/quanTri'
import { useThongBaoStore } from '../../stores/thongBao'

const route = useRoute()
const router = useRouter()
const tb = useThongBaoStore()

const idSach = computed(() => (route.params.id as string | undefined) || '')
const laSua = computed(() => !!idSach.value)

const form = reactive({ TenSach: '', TacGia: '', TheLoai: '', NamXuatBan: '', AnhBia: '', TomTat: '' })
const loiForm = reactive<Record<string, string>>({})

const dangTai = ref(false)
const loiTai = ref('')
const dangLuu = ref(false)
const loiMay = ref('')
const goiYTheLoai = ref<string[]>([])
const anhLoi = ref(false)

const anhXem = computed(() => {
  const u = form.AnhBia.trim()
  return /^https?:\/\//i.test(u) ? u : ''
})
watch(() => form.AnhBia, () => (anhLoi.value = false))

function datForm(s: Partial<ChiTietSachQT> | null) {
  form.TenSach = s?.TenSach ?? ''
  form.TacGia = s?.TacGia ?? ''
  form.TheLoai = s?.TheLoai ?? ''
  form.NamXuatBan = s?.NamXuatBan != null ? String(s.NamXuatBan) : ''
  form.AnhBia = s?.AnhBia ?? ''
  form.TomTat = s?.TomTat ?? ''
}

async function khoiTao() {
  loiMay.value = ''
  loiTai.value = ''
  for (const k of Object.keys(loiForm)) delete loiForm[k]
  if (!laSua.value) {
    datForm(null)
    return
  }
  dangTai.value = true
  try {
    datForm(await layChiTietSachQT(idSach.value))
  } catch (e) {
    loiTai.value = layThongBaoLoi(e, 'Không tải được thông tin sách')
  } finally {
    dangTai.value = false
  }
}

// immediate: chạy lần đầu; theo dõi id để khi "thêm" xong chuyển sang "sửa" thì tải lại đúng sách
watch(idSach, khoiTao, { immediate: true })
layTheLoaiQT()
  .then((ds) => (goiYTheLoai.value = ds))
  .catch(() => {})

function kiemTra(): DuLieuSach | null {
  for (const k of Object.keys(loiForm)) delete loiForm[k]

  const tenSach = form.TenSach.trim()
  const tacGia = form.TacGia.trim()
  const anhBia = form.AnhBia.trim()
  if (!tenSach) loiForm.TenSach = 'Vui lòng nhập tên sách'
  if (!tacGia) loiForm.TacGia = 'Vui lòng nhập tác giả'
  if (anhBia && !/^https?:\/\//i.test(anhBia)) {
    loiForm.AnhBia = 'Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://'
  }

  let nam: number | null = null
  const namText = form.NamXuatBan.trim()
  if (namText !== '') {
    const n = Number(namText)
    if (!Number.isInteger(n) || n < 1 || n > 3000) loiForm.NamXuatBan = 'Năm xuất bản không hợp lệ'
    else nam = n
  }

  if (Object.keys(loiForm).length) return null
  return {
    TenSach: tenSach,
    TacGia: tacGia,
    TheLoai: form.TheLoai.trim(),
    NamXuatBan: nam,
    AnhBia: anhBia,
    TomTat: form.TomTat.trim(),
  }
}

async function luu() {
  loiMay.value = ''
  const data = kiemTra()
  if (!data) return
  dangLuu.value = true
  try {
    if (laSua.value) {
      await capNhatSachQT(idSach.value, data)
      datForm(data)
      tb.ok(`Đã lưu sách "${data.TenSach}"`)
    } else {
      const moi = await taoSachQT(data)
      tb.ok(`Đã thêm sách "${data.TenSach}"`)
      await router.push({ name: 'qt-sach-sua', params: { id: moi._id } })
    }
  } catch (e) {
    loiMay.value = layThongBaoLoi(e, 'Không lưu được sách')
  } finally {
    dangLuu.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <RouterLink :to="{ name: 'qt-sach' }" class="text-sm text-muted hover:text-ink">← Danh sách sách</RouterLink>
    <h1 class="mb-5 mt-2 font-display text-2xl font-semibold">{{ laSua ? 'Sửa sách' : 'Thêm sách' }}</h1>

    <p v-if="dangTai" class="py-10 text-center text-muted">Đang tải thông tin sách…</p>

    <div v-else-if="loiTai" class="alert-error flex flex-wrap items-center justify-between gap-3">
      <span>{{ loiTai }}</span>
      <button type="button" class="btn-outline text-sm" @click="khoiTao">Thử lại</button>
    </div>

    <form v-else class="rounded-2xl border border-line bg-paper p-5 md:p-6" novalidate @submit.prevent="luu">
      <div class="grid gap-6 md:grid-cols-[170px_1fr]">
        <!-- Ảnh bìa xem trước -->
        <div>
          <div class="flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-xl bg-sand-2">
            <img
              v-if="anhXem && !anhLoi"
              :src="anhXem"
              alt="Xem trước ảnh bìa"
              class="h-full w-full object-cover"
              @error="anhLoi = true"
            />
            <span v-else class="px-3 text-center text-xs text-muted">
              {{ anhXem && anhLoi ? 'Không tải được ảnh từ đường dẫn này' : 'Chưa có ảnh bìa' }}
            </span>
          </div>
        </div>

        <!-- Các trường -->
        <div class="space-y-4">
          <div>
            <label for="tenSach" class="mb-1 block text-sm font-medium text-ink-2">Tên sách *</label>
            <input id="tenSach" v-model="form.TenSach" class="input" :aria-invalid="!!loiForm.TenSach" />
            <p v-if="loiForm.TenSach" class="mt-1 text-sm text-clay-dark">{{ loiForm.TenSach }}</p>
          </div>

          <div>
            <label for="tacGia" class="mb-1 block text-sm font-medium text-ink-2">Tác giả *</label>
            <input id="tacGia" v-model="form.TacGia" class="input" :aria-invalid="!!loiForm.TacGia" />
            <p v-if="loiForm.TacGia" class="mt-1 text-sm text-clay-dark">{{ loiForm.TacGia }}</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="theLoai" class="mb-1 block text-sm font-medium text-ink-2">Thể loại</label>
              <input id="theLoai" v-model="form.TheLoai" class="input" list="ds-the-loai" placeholder="Chọn hoặc gõ mới" />
              <datalist id="ds-the-loai">
                <option v-for="t in goiYTheLoai" :key="t" :value="t" />
              </datalist>
            </div>
            <div>
              <label for="nam" class="mb-1 block text-sm font-medium text-ink-2">Năm xuất bản</label>
              <input
                id="nam"
                v-model="form.NamXuatBan"
                class="input"
                inputmode="numeric"
                placeholder="VD: 1943"
                :aria-invalid="!!loiForm.NamXuatBan"
              />
              <p v-if="loiForm.NamXuatBan" class="mt-1 text-sm text-clay-dark">{{ loiForm.NamXuatBan }}</p>
            </div>
          </div>

          <div>
            <label for="anhBia" class="mb-1 block text-sm font-medium text-ink-2">Đường dẫn ảnh bìa</label>
            <input
              id="anhBia"
              v-model="form.AnhBia"
              class="input"
              inputmode="url"
              placeholder="https://…"
              :aria-invalid="!!loiForm.AnhBia"
            />
            <p v-if="loiForm.AnhBia" class="mt-1 text-sm text-clay-dark">{{ loiForm.AnhBia }}</p>
          </div>

          <div>
            <label for="tomTat" class="mb-1 block text-sm font-medium text-ink-2">Tóm tắt</label>
            <textarea id="tomTat" v-model="form.TomTat" class="input min-h-28" rows="4"></textarea>
          </div>
        </div>
      </div>

      <div v-if="loiMay" class="alert-error mt-5">{{ loiMay }}</div>

      <div class="mt-6 flex justify-end gap-2">
        <RouterLink :to="{ name: 'qt-sach' }" class="btn-outline">Hủy</RouterLink>
        <button type="submit" class="btn-primary" :disabled="dangLuu">
          {{ dangLuu ? 'Đang lưu…' : 'Lưu sách' }}
        </button>
      </div>
    </form>

    <!-- 7C: khu quản lý chương (danh sách chương + vùng soạn) sẽ nằm ở đây khi laSua -->
  </div>
</template>