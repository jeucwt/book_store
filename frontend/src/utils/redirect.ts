// Chỉ cho phép chuyển hướng nội bộ (bắt đầu bằng "/" và không phải "//")
export function redirectAnToan(v: unknown, macDinh = '/'): string {
  return typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') ? v : macDinh
}