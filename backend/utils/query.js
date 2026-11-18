// Thoát các ký tự đặc biệt trong biểu thức chính quy (RegExp)
export const escapeRegex = (str = '') =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Chuẩn hóa tham số phân trang từ query: page, limit, skip
export const layPhanTrang = (query = {}, defaultLimit = 10, maxLimit = 100) => {
  const pageRaw = parseInt(query.page, 10);
  const limitRaw = parseInt(query.limit, 10);

  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  let limit = Number.isInteger(limitRaw) && limitRaw > 0 ? limitRaw : defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
