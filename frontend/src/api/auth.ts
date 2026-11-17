import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axios from 'axios'
import http, { TOKEN_KEY } from '../api/http'
import type { DangKyPayload, NguoiDung, Role } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<NguoiDung | null>(null)
  const role = ref<Role | null>(null)
  const daKhoiPhuc = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isDocGia = computed(() => isLoggedIn.value && role.value === 'docgia')
  const isNhanVien = computed(
    () => isLoggedIn.value && (role.value === 'nhanvien' || role.value === 'admin'),
  )
  const tenHienThi = computed(() => {
    const u = user.value
    if (!u) return ''
    if (role.value === 'nhanvien' || role.value === 'admin') return u.HoTenNV || u.MSNV || ''
    return [u.HoLot, u.Ten].filter(Boolean).join(' ').trim() || u.Email || ''
  })
  const nhanVaiTro = computed(() => {
    if (role.value === 'admin') return 'Quản trị viên'
    if (role.value === 'nhanvien') return 'Nhân viên'
    if (role.value === 'docgia') return 'Độc giả'
    return ''
  })

  function datToken(t: string) {
    token.value = t
    localStorage.setItem(TOKEN_KEY, t)
  }

  function xoaPhien() {
    token.value = null
    user.value = null
    role.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function taiThongTin() {
    const res = await http.get('/auth/me')
    user.value = res.data.user
    role.value = res.data.role
  }

  // Gọi 1 lần khi mở/tải lại trang (trong navigation guard)
  async function khoiPhuc() {
    if (daKhoiPhuc.value) return
    try {
      if (token.value) await taiThongTin()
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) xoaPhien()
    } finally {
      daKhoiPhuc.value = true
    }
  }

  async function dangNhap(Email: string, MatKhau: string) {
    const res = await http.post('/auth/dang-nhap', { Email, MatKhau })
    datToken(res.data.token)
    await taiThongTin()
  }

  async function dangNhapNhanVien(MSNV: string, Password: string) {
    const res = await http.post('/auth/nhan-vien/dang-nhap', { MSNV, Password })
    datToken(res.data.token)
    await taiThongTin()
  }

  async function dangKy(payload: DangKyPayload) {
    await http.post('/auth/dang-ky', payload)
    await dangNhap(payload.Email, payload.MatKhau)
  }

  function dangXuat() {
    xoaPhien()
  }

  return {
    token, user, role, isLoggedIn, isDocGia, isNhanVien, tenHienThi, nhanVaiTro,
    khoiPhuc, dangNhap, dangNhapNhanVien, dangKy, dangXuat, xoaPhien,
  }
})