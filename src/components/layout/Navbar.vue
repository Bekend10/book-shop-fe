<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <BookOpen class="icon" />
          <span class="logo-text">BookShop</span>
        </router-link>

        <!-- Search Bar -->
        <div class="search-bar">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Tìm kiếm sách..."
            class="search-input"
          />
        </div>

        <!-- Navigation Links -->
        <div class="nav-links">
          <router-link to="/" class="nav-link">Trang chủ</router-link>

          <!-- Theme Toggle -->
          <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'">
            <Sun v-if="isDark" class="theme-icon" />
            <Moon v-else class="theme-icon" />
          </button>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="user-menu">
            <span class="welcome-text">Xin chào, {{ authStore.user?.first_name + " " + authStore.user?.last_name || 'User' }}</span>
            <button @click="handleLogout" class="nav-link">Đăng xuất</button>
          </div>

          <!-- Login Link -->
          <router-link v-else to="/login" class="nav-link">Đăng nhập</router-link>

          <!-- Cart -->
          <router-link to="/cart" class="cart-link">
            <ShoppingCart class="cart-icon" />
            <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Search, ShoppingCart, Sun, Moon } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { useBookStore } from '@/stores/bookStore'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const router = useRouter()
const cartStore = useCartStore()
const bookStore = useBookStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const searchQuery = ref('')
const isDark = ref(false)
const totalItems = computed(() => cartStore.totalItems)

const handleSearch = () => {
  bookStore.setSearchQuery(searchQuery.value)
}

const handleLogout = async () => {
  await authStore.logout()
  toastStore.success('Đăng xuất thành công. Hẹn gặp lại!')
  router.push('/')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
  // Lưu preference vào localStorage
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const initTheme = () => {
  // Đọc theme từ localStorage hoặc system preference
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // Nếu chưa có setting, dùng system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

onMounted(() => {
  initTheme()
  
  // Listen for system theme changes only if no manual preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
      applyTheme()
    }
  })
})
</script>

<style scoped>
.navbar {
  /* Background được định nghĩa trong global CSS */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.icon {
  width: 2rem;
  height: 2rem;
  color: rgba(255, 255, 255, 0.95);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.95);
}

.search-bar {
  flex: 1;
  max-width: 24rem;
  margin: 0 2rem;
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  outline: none;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
}

.search-input::placeholder {
  color: #6b7280;
}

.search-input:focus {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 1);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 1);
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.9);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 1);
}

.theme-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.cart-link {
  position: relative;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.cart-link:hover {
  color: rgba(255, 255, 255, 1);
}

.cart-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.cart-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  border-radius: 9999px;
  height: 1.25rem;
  width: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dark mode support với class-based toggle */
:global(.dark) .search-input {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
}

:global(.dark) .search-input::placeholder {
  color: #9ca3af;
}

:global(.dark) .search-input:focus {
  background: rgba(31, 41, 55, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

:global(.dark) .search-icon {
  color: #9ca3af;
}

:global(.dark) .theme-toggle {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.dark) .theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-content {
    flex-wrap: wrap;
    height: auto;
    padding: 1rem 0;
  }
  
  .search-bar {
    order: 3;
    width: 100%;
    max-width: none;
    margin: 1rem 0 0 0;
  }
  
  .nav-links {
    gap: 1rem;
  }
}
</style>
