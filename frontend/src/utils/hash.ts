// Băm chuỗi thành số ổn định: cùng một tên sách luôn ra cùng màu bìa và kích thước trên kệ
export function bamChuoi(s: string): number {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}