import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'kham-pha', component: () => import('../views/KhamPhaView.vue') },
    { path: '/sach/:id', name: 'chi-tiet-sach', component: () => import('../views/ChiTietSachView.vue') },
    { path: '/dang-nhap', name: 'dang-nhap', component: () => import('../views/DangNhapView.vue'), meta: { guestOnly: true } },
    { path: '/dang-ky', name: 'dang-ky', component: () => import('../views/DangKyView.vue'), meta: { guestOnly: true } },
    { path: '/sach-cua-toi', name: 'sach-cua-toi', component: () => import('../views/SachCuaToiView.vue'), meta: { requiresDocGia: true } },
    { path: '/doc/:id', name: 'doc-sach', component: () => import('../views/DocSachView.vue'), meta: { requiresDocGia: true } },
    { path: '/nhan-vien/dang-nhap', name: 'nhan-vien-dang-nhap', component: () => import('../views/NhanVienDangNhapView.vue'), meta: { guestOnly: true } },
    { path: '/nhan-vien', name: 'nhan-vien', component: () => import('../views/NhanVienTrangChuView.vue'), meta: { requiresNhanVien: true } },
    { path: '/:pathMatch(.*)*', name: 'khong-tim-thay', component: () => import('../views/NotFoundView.vue') },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.khoiPhuc()

  if (to.meta.requiresDocGia) {
    if (!auth.isLoggedIn) return { name: 'dang-nhap', query: { redirect: to.fullPath } }
    if (!auth.isDocGia) return { name: 'kham-pha' }
  }
  if (to.meta.requiresNhanVien) {
    if (!auth.isLoggedIn) return { name: 'nhan-vien-dang-nhap', query: { redirect: to.fullPath } }
    if (!auth.isNhanVien) return { name: 'kham-pha' }
  }
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return auth.isNhanVien ? { name: 'nhan-vien' } : { name: 'kham-pha' }
  }
})

export default router