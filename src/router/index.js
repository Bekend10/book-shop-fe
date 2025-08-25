import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import BookDetail from '@/views/BookDetail.vue'
import Cart from '@/views/Cart.vue'
import Checkout from '@/views/Checkout.vue'
import Admin from '@/views/Admin.vue'
import Authors from '@/views/Authors.vue'
import Category from '@/views/Category.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
import Orders from '@/views/Orders.vue'
import Revenue from '@/views/admin/RevenueManagement.vue'
import MessageManagement from '@/views/admin/MessageManagement.vue'
import BookImport from '@/components/admin/BookImport.vue'
import NotFound from '@/views/NotFound.vue'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const router = createRouter({
  history: createWebHistory('/'),
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
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/orders',
      name: 'orders',
      component: Orders,
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/Notifications.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/authors',
      name: 'admin-authors',
      component: Authors,
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: Category,
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: Admin,
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/transactions',
      name: 'admin-transactions',
      component: Admin,
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/UserManagement.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/revenue',
      name: 'admin-revenue',
      component: Revenue,
      meta: { requiresAdmin: true } 
    },
    {
      path: '/admin/messages',
      name: 'admin-messages',
      component: MessageManagement,
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/notifications',
      name: 'admin-notifications',
      component: () => import('@/views/Notifications.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/books/import',
      name: 'admin-books-import',
      component: BookImport,
      meta: { requiresAdmin: true }
    },
    // Temporary disable test route
    // {
    //   path: '/test-notification',
    //   name: 'test-notification',
    //   component: () => import('@/views/TestNotification.vue'),
    //   meta: { requiresAuth: true }
    // },
    {
      path: '/payment/vnpay/callback',
      name: 'vnpay-callback',
      component: () => import('@/views/payment/VNPayCallback.vue')
    },
    {
      path: '/payment/fe-home/callback',
      name: 'fe-home-callback',
      component: () => import('@/views/payment/FEHomeCallback.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    }
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

  // Nếu đã đăng nhập và đang truy cập trang login, chuyển về trang được redirect hoặc trang chủ
  if (to.name === 'login' && authStore.isAuthenticated) {
    const redirectPath = to.query.redirect || '/'
    next(redirectPath)
    return
  }

  next()
})

export default router
