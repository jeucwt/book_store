<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { layThongBaoLoi } from '../../api/http'
import { layDanhSachSachQT, layTheLoaiQT, xoaSachQT } from '../../api/quanTri'
import QtPhanTrang from '../../components/quanTri/QtPhanTrang.vue'
import QtXacNhan from '../../components/quanTri/QtXacNhan.vue'
import { useAuthStore } from '../../stores/auth'
import { useThongBaoStore } from '../../stores/thongBao'
import type { SachQuanTri } from '../../types'

const LIMIT = 10
const auth = useAuthStore()
const tb = useThongBaoStore()

const ds = ref<SachQuanTri[]>([])
const total = ref(0)
const totalPages = ref(1)
const page = ref(1)
const dangTai = ref(false)
const loiTai = ref('')

const q = ref('')
const theLoai = ref('')
const dsTheLoai = ref<string[]>([])
const loiAnh = ref<Record<string, boolean>>({})

let lanGoi = 0 // bỏ qua kết quả của lần gọi cũ khi người dùng gõ nhanh

async function tai() {
  const lan = ++lanGoi
  dangTai.value = true
  loiTai.value = ''
  try {
    const kq = await layDanhSachSachQT({
      q: q.value.trim() || undefined,
      theLoai: theLoai.value || undefined,
      page: page.value,
      limit: LIMIT,
    })
    if (lan !== lanGoi) return
    ds.value = kq.data
    total.value = kq.total
    totalPages.value = Math.max(kq.totalPages, 1)
  } catch (e) {
    if (lan !== lanGoi) return
    loiTai.value = layThongBaoLoi(e, 'Không tải được danh sách sách')
  } finally {
    if (lan === lanGoi) dangTai.value = false
  }
}

async function taiTheLoai() {
  try {
    dsTheLoai.value = await layTheLoaiQT()
  } catch {
    /* thể loại chỉ để lọc, lỗi thì bỏ qua */
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
watch(theLoai, () => {
  page.value = 1
  tai()
})

function doiTrang(n: number) {
  page.value = n
  tai()
}

onMounted(() => {
  tai()
  taiTheLoai()
})
onBeforeUnmount(() => clearTimeout(timer))

/* ---- Xóa ---- */
const sachCanXoa = ref<SachQuanTri | null>(null)
const dangXoa = ref(false)

async function xacNhanXoa() {
  const s = sachCanXoa.value
  if (!s) return
  dangXoa.value = true
  try {
    await xoaSachQT(s._id)
    tb.ok(`Đã xóa sách "${s.TenSach}"`)
    sachCanXoa.value = null
    if (ds.value.length === 1 && page.value > 1) page.value--
    await tai()
    taiTheLoai()
  } catch (e) {
    sachCanXoa.value = null
    tb.loi(layThongBaoLoi(e, 'Không xóa được sách'))
  } finally {
    dangXoa.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-semibold">Quản lý sách</h1>
        <p class="text-sm text-muted">
          {{ total }} đầu sách<span v-if="!auth.isAdmin"> · chế độ chỉ xem</span>
        </p>
      </div>
      <RouterLink v-if="auth.isAdmin" :to="{ name: 'qt-sach-them' }" class="btn-primary">+ Thêm sách</RouterLink>
    </div>

    <div class="mb-4 flex flex-col gap-2 sm:flex-row">
      <input
        v-model="q"
        type="search"
        class="input flex-1"
        placeholder="Tìm theo tên sách hoặc tác giả"
        aria-label="Tìm sách"
      />
      <select v-model="theLoai" class="input sm:w-52" aria-label="Lọc theo thể loại">
        <option value="">Tất cả thể loại</option>
        <option v-for="t in dsTheLoai" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <!-- Lỗi -->
    <div v-if="loiTai" class="alert-error flex flex-wrap items-center justify-between gap-3">
      <span>{{ loiTai }}</span>
      <button type="button" class="btn-outline text-sm" @click="tai">Thử lại</button>
    </div>

    <!-- Đang tải lần đầu -->
    <p v-else-if="dangTai && ds.length === 0" class="py-10 text-center text-muted">Đang tải danh sách…</p>

    <!-- Rỗng -->
    <div
      v-else-if="ds.length === 0"
      class="rounded-2xl border border-dashed border-line bg-paper px-4 py-12 text-center"
    >
      <p class="text-ink-2">
        {{ q.trim() || theLoai ? 'Không có sách nào phù hợp với bộ lọc.' : 'Chưa có sách nào.' }}
      </p>
      <RouterLink
        v-if="auth.isAdmin && !q.trim() && !theLoai"
        :to="{ name: 'qt-sach-them' }"
        class="btn-primary mt-4 inline-block"
      >
        Thêm sách đầu tiên
      </RouterLink>
    </div>

    <!-- Bảng -->
    <div v-else class="overflow-hidden rounded-2xl border border-line bg-paper" :class="dangTai && 'opacity-60'">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="border-b border-line text-xs text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Sách</th>
              <th class="px-4 py-3 font-medium">Tác giả</th>
              <th class="px-4 py-3 font-medium">Thể loại</th>
              <th class="px-4 py-3 font-medium">Chương</th>
              <th v-if="auth.isAdmin" class="px-4 py-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in ds" :key="s._id" class="border-b border-line last:border-b-0">
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-3">
                  <img
                    v-if="s.AnhBia && !loiAnh[s._id]"
                    :src="s.AnhBia"
                    alt=""
                    loading="lazy"
                    class="h-12 w-9 shrink-0 rounded bg-sand-2 object-cover"
                    @error="loiAnh[s._id] = true"
                  />
                  <div
                    v-else
                    class="flex h-12 w-9 shrink-0 items-center justify-center rounded bg-sand-3 font-display text-sm text-ink-2"
                    aria-hidden="true"
                  >
                    {{ s.TenSach.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <div class="truncate font-medium">{{ s.TenSach }}</div>
                    <div v-if="s.NamXuatBan" class="text-xs text-muted">{{ s.NamXuatBan }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-2.5">{{ s.TacGia }}</td>
              <td class="px-4 py-2.5">
                <span v-if="s.TheLoai" class="chip">{{ s.TheLoai }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="px-4 py-2.5">
                <span v-if="s.SoChuong > 0">{{ s.SoChuong }}</span>
                <span v-else class="text-muted">Chưa có</span>
              </td>
              <td v-if="auth.isAdmin" class="px-4 py-2.5">
                <div class="flex justify-end gap-2">
                  <RouterLink :to="{ name: 'qt-sach-sua', params: { id: s._id } }" class="btn-outline text-sm">
                    Sửa
                  </RouterLink>
                  <button
                    type="button"
                    class="rounded-xl border border-clay/50 px-3 py-1.5 text-sm text-clay-dark hover:bg-sand-2"
                    @click="sachCanXoa = s"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <QtPhanTrang :page="page" :total-pages="totalPages" :total="total" :limit="LIMIT" @doi-trang="doiTrang" />

    <QtXacNhan
      :mo="!!sachCanXoa"
      tieu-de="Xóa sách này?"
      :noi-dung="`Sách &quot;${sachCanXoa?.TenSach ?? ''}&quot; cùng toàn bộ chương sẽ bị xóa vĩnh viễn. Không thể hoàn tác.`"
      nhan-xac-nhan="Xóa sách"
      :dang-xu-ly="dangXoa"
      @xac-nhan="xacNhanXoa"
      @huy="sachCanXoa = null"
    />
  </div>
</template>