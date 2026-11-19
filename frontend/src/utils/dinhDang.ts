const pad = (n: number) => String(n).padStart(2, '0')

/** dd/MM/yyyy (giờ máy người dùng). Giá trị rỗng hoặc sai trả về "—". */
export function dinhDangNgay(v?: string | Date | null): string {
  if (!v) return '—'
  const d = v instanceof Date ? v : new Date(v)
  if (Number.isNaN(d.getTime())) return '—'
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

const dinhDangVND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

/** Ví dụ: 30000 -> "30.000 ₫" */
export function dinhDangTien(v?: number | null): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  return dinhDangVND.format(v)
}

/** Họ lót + tên; rỗng nếu không có. */
export function tenDayDu(dg?: { HoLot?: string; Ten?: string } | null): string {
  return [dg?.HoLot, dg?.Ten].filter(Boolean).join(' ').trim()
}