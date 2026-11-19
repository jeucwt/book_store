<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { layThongBaoLoi } from '../../api/http'
import { capNhatGoiThueQT, layDanhSachGoiThueQT } from '../../api/quanTri'
import { useThongBaoStore } from '../../stores/thongBao'
import type { GoiThue } from '../../types'
import { dinhDangTien } from '../../utils/dinhDang'

const tb = useThongBaoStore()

const ds = ref<GoiThue[]>([])
const dangTai = ref(false)
const loiTai = ref('')

const idDangSua = ref<string | null>(null)
const tenSua = ref('')
const giaSua = ref('')
const loiForm = ref('')
const dangLuu = ref(false)

async function tai() {
  dangTai.value = true
  loiTai.value = ''
  try {
    ds.value = await layDanhSachGoiThueQT()
  } catch (e) {
    loiTai.value = layThongBaoLoi(e, 'Không tải được danh sách gói thuê')
  } finally {
    dangTai.value = false
  }
}

function batDauSua(g: GoiThue) {
  idDangSua.value = g._id
  tenSua.value = g.TenGoi
  giaSua.value = String(g.Gia)
  loiForm.value = ''
}

function huySua() {
  idDangSua.value = null
  loiForm.value = ''
}

async function luu(g: GoiThue) {
  const ten = tenSua.value.trim()
  const giaChuoi = giaSua.value.trim()
  const gia = Number(giaChuoi)
  if (!ten) {
    loiForm.value = 'Tên gói không được để trống'
    return
  }
  if (giaChuoi === '' || !Number.isFinite(gia) || gia < 0) {
    loiForm.value = 'Giá phải là số không âm'
    return
  }
  dangLuu.value = true
  loiForm.value = ''
  try {
    const moi = await capNhatGoiThueQT(g._id, { TenGoi: ten, Gia: gia })
    const i = ds.value.findIndex((x) => x._id === g._id)
    if (i >= 0) ds.value[i] = moi
    idDangSua.value = null
    tb.ok(`Đã cập nhật gói "${moi.TenGoi}"`)
  } catch (e) {
    loiForm.value = layThongBaoLoi(e, 'Không lưu được gói thuê')
  } finally {
    dangLuu.value = false
  }
}

onMounted(tai)
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="font-display text-2xl font-semibold">Gói thuê</h1>
      <p class="text-sm text-muted">Chỉ sửa được tên và giá. Số ngày của gói cố định.</p>
    </div>

    <div v-if="loiTai" class="alert-error flex flex-wrap items-center justify-between gap-3">
      <span>{{ loiTai }}</span>
      <button type="button" class="btn-outline text-sm" @click="tai">Thử lại</button>
    </div>

    <p v-else-if="dangTai" class="py-10 text-center text-muted">Đang tải…</p>

    <div v-else-if="ds.length === 0" class="rounded-2xl border border-dashed border-line bg-paper px-4 py-12 text-center">
      <p class="text-ink-2">Chưa có gói thuê nào.</p>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-line bg-paper">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] text-left text-sm">
          <thead class="border-b border-line text-xs text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Tên gói</th>
              <th class="px-4 py-3 font-medium">Số ngày</th>
              <th class="px-4 py-3 font-medium">Giá</th>
              <th class="px-4 py-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in ds" :key="g._id" class="border-b border-line align-top last:border-b-0">
              <template v-if="idDangSua === g._id">
                <td class="px-4 py-2.5">
                  <input v-model="tenSua" class="input w-full" aria-label="Tên gói" :disabled="dangLuu" />
                  <p v-if="loiForm" class="mt-1 text-xs text-clay-dark" role="alert">{{ loiForm }}</p>
                </td>
                <td class="px-4 py-3">{{ g.SoNgay }} ngày</td>
                <td class="px-4 py-2.5">
                  <input
                    v-model="giaSua"
                    type="number"
                    min="0"
                    step="1000"
                    inputmode="numeric"
                    class="input w-36"
                    aria-label="Giá (VND)"
                    :disabled="dangLuu"
                    @keydown.enter="luu(g)"
                  />
                </td>
                <td class="px-4 py-2.5">
                  <div class="flex justify-end gap-2">
                    <button type="button" class="btn-primary text-sm" :disabled="dangLuu" @click="luu(g)">
                      {{ dangLuu ? 'Đang lưu…' : 'Lưu' }}
                    </button>
                    <button type="button" class="btn-outline text-sm" :disabled="dangLuu" @click="huySua">Hủy</button>
                  </div>
                </td>
              </template>
              <template v-else>
                <td class="px-4 py-3 font-medium">{{ g.TenGoi }}</td>
                <td class="px-4 py-3">{{ g.SoNgay }} ngày</td>
                <td class="px-4 py-3">{{ dinhDangTien(g.Gia) }}</td>
                <td class="px-4 py-2.5">
                  <div class="flex justify-end">
                    <button type="button" class="btn-outline text-sm" :disabled="idDangSua !== null" @click="batDauSua(g)">
                      Sửa
                    </button>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>