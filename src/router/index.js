import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import BookDetail from '@/views/BookDetail.vue'
import Cart from '@/views/Cart.vue'
import Checkout from '@/views/Checkout.vue'
import Admin from '@/views/Admin.vue'
import Login from '@/views/Login.vue'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/book/:id',
      name: 'book-detail',
      component: BookDetail,
      props: true
    },
    {
      path: '/cart',
      name: 'cart',
      component: Cart
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: Checkout
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin
    },
  ]
})

// Route guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const toastStore = useToastStore()

  // Kiểm tra route cần admin
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      toastStore.warning('Bạn cần đăng nhập để truy cập trang này.')
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    if (!authStore.isAdmin) {
      toastStore.error('Bạn không có quyền truy cập trang này.')
      next({ name: 'home' })
      return
    }
  }

  // Kiểm tra route cần đăng nhập
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      toastStore.warning('Bạn cần đăng nhập để tiếp tục.')
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  // Nếu đã đăng nhập và đang truy cập trang login, chuyển về trang chủ
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
