export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Ép kiểu số nguyên dương, có trần
export const toPositiveInt = (value, fallback, max = Infinity) => {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return Math.min(n, max);
};

// Đọc page/limit từ query
export const layPhanTrang = (query, macDinh = 10, tran = 50) => {
  const page = toPositiveInt(query.page, 1);
  const limit = toPositiveInt(query.limit, macDinh, tran);
  return { page, limit, skip: (page - 1) * limit };
};