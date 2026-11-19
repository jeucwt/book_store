import { defineStore } from 'pinia'
import { ref } from 'vue'

type Loai = 'ok' | 'loi'

export const useThongBaoStore = defineStore('thongBao', () => {
  const thongBao = ref<{ loai: Loai; noiDung: string } | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined

  function xoa() {
    clearTimeout(timer)
    thongBao.value = null
  }

  function dat(loai: Loai, noiDung: string) {
    clearTimeout(timer)
    thongBao.value = { loai, noiDung }
    timer = setTimeout(() => (thongBao.value = null), loai === 'ok' ? 4000 : 8000)
  }

  const ok = (noiDung: string) => dat('ok', noiDung)
  const loi = (noiDung: string) => dat('loi', noiDung)

  return { thongBao, ok, loi, xoa }
})