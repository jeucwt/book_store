import jwt from 'jsonwebtoken';

// Đọc header "Authorization: Bearer <token>", giải mã và gắn vào req.user
export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Chưa đăng nhập hoặc thiếu token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
        : 'Token không hợp lệ';
    return res.status(401).json({ message });
  }
};

// Dùng sau verifyToken: requireRole('admin'), requireRole('nhanvien', 'admin')
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
  }
  next();
};