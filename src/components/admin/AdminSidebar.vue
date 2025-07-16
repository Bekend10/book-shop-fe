<template>
  <div class="admin-sidebar bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <Settings class="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Quản lý hệ thống</p>
        </div>
      </div>
    </div>

    <nav class="p-4 space-y-2">
      <div class="mb-4">
        <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Quản lý nội dung
        </h3>
        <ul class="space-y-1">
          <li>
            <router-link
              to="/admin"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                ($route.name === 'admin' || activeSection === 'books')
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <BookOpen class="h-4 w-4" />
              <span>Quản lý sách</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/categories"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                ($route.name === 'admin-categories' || activeSection === 'categories')
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <Tag class="h-4 w-4" />
              <span>Quản lý danh mục</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/authors"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                $route.name === 'admin-authors' 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <User class="h-4 w-4" />
              <span>Quản lý tác giả</span>
            </router-link>
          </li>
          <!-- <li>
            <button
              @click="$emit('change-section', 'publishers')"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                activeSection === 'publishers' 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <Building class="h-4 w-4" />
              <span>Quản lý nhà xuất bản</span>
            </button>
          </li> -->
        </ul>
      </div>

      <div class="mb-4">
        <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Quản lý bán hàng
        </h3>
        <ul class="space-y-1">
          <li>
            <router-link
              to="/admin/orders"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                ($route.name === 'admin-orders' || activeSection === 'orders')
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <ShoppingBag class="h-4 w-4" />
              <span>Quản lý đơn hàng</span>
            </router-link>
          </li>
          <li>
            <button
              @click="$emit('change-section', 'transactions')"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                activeSection === 'transactions' 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <CreditCard class="h-4 w-4" />
              <span>Quản lý giao dịch</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="mb-4">
        <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Quản lý người dùng
        </h3>
        <ul class="space-y-1">
          <li>
            <button
              @click="$emit('change-section', 'users')"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                activeSection === 'users' 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <Users class="h-4 w-4" />
              <span>Quản lý người dùng</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="mb-4">
        <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Báo cáo & Thống kê
        </h3>
        <ul class="space-y-1">
          <li>
            <button
              @click="$emit('change-section', 'revenue')"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                activeSection === 'revenue' 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <TrendingUp class="h-4 w-4" />
              <span>Doanh thu</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { 
  Settings, 
  BookOpen, 
  Tag, 
  User, 
  Building, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  TrendingUp 
} from 'lucide-vue-next'

defineProps({
  activeSection: {
    type: String,
    default: 'books'
  }
})

defineEmits(['change-section'])
</script>

<style scoped>
.admin-sidebar {
  min-width: 280px;
  max-width: 280px;
  transition: all 0.3s ease;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 40;
    transform: translateX(-100%);
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>
