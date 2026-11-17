import axios, { type AxiosError } from 'axios'

export const TOKEN_KEY = 'token'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let onUnauthorized: () => void = () => {}
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const url = error.config?.url ?? ''
    const laDangNhap = url.includes('dang-nhap')
    const laMe = url.includes('auth/me') // store tự xử lý khi khôi phục phiên
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY) && !laDangNhap && !laMe) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

export function layThongBaoLoi(err: unknown, macDinh = 'Có lỗi xảy ra, vui lòng thử lại'): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Không kết nối được máy chủ'
    const msg = (err.response.data as { message?: string } | undefined)?.message
    return msg || macDinh
  }
  return macDinh
}

// Chấp nhận cả mảng trần lẫn { data: [...] }
export function layMang(d: unknown): unknown[] {
  if (Array.isArray(d)) return d
  const inner = (d as { data?: unknown } | null)?.data
  return Array.isArray(inner) ? inner : []
}

export default http