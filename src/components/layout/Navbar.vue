<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo -->
        <div>
          <router-link :to="isAdmin ? '/admin' : '/'" class="logo">
            <BookOpen class="icon" />
            <span class="logo-text">
              {{ isAdmin ? 'Quản lý hệ thống' : 'BKD Book Shop' }}
            </span>
          </router-link>
        </div>

        <!-- Search Bar -->
        <div class="search-bar" v-if="!isAdmin">
          <Search class="search-icon" />
          <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Tìm kiếm sách..."
            class="search-input" />
        </div>


        <!-- Navigation Links -->
        <div class="nav-links">
          <!-- <div v-if="!isAdmin">
            <router-link to="/" class="nav-link">Trang chủ</router-link>
          </div> -->

          <!-- Theme Toggle -->
          <button @click="toggleTheme" class="theme-toggle"
            :title="isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'">
            <Sun v-if="isDark" class="theme-icon" />
            <Moon v-else class="theme-icon" />
          </button>

          <!-- User Menu -->
          
          
          <!-- Messages -->
          <MessageIcon v-if="!isAdmin && authStore.isAuthenticated" />
          
          <!-- Cart -->
          <router-link v-if="!isAdmin" to="/cart" class="cart-link">
            <ShoppingCart class="cart-icon" />
            <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
          </router-link>

          <div v-if="authStore.isAuthenticated" class="user-menu" @click.stop>
            <button @click="toggleUserMenu" class="user-avatar-btn">
              <div class="user-avatar" :class="{ 'no-image': !authStore.user?.profile_image }">
                <div class="user-icon">
                  <img v-if="authStore.user?.profile_image" :src="authStore.user.profile_image" alt="User Avatar"
                    class="user-avatar-img" />
                  <User v-else class="user-icon-large" />
                </div>
              </div>
              <ChevronDown :class="['chevron-icon', { 'rotated': showUserMenu }]" />
            </button>

            <!-- Dropdown Menu -->
            <div v-if="showUserMenu" class="user-dropdown">
              <div class="user-info">
                <div class="user-avatar-large" :class="{ 'no-image': !authStore.user?.profile_image }">
                  <img v-if="authStore.user?.profile_image" :src="authStore.user.profile_image" alt="User Avatar"
                    class="user-avatar-img" />
                  <User v-else class="user-icon-large" />
                </div>
                <div class="user-details">
                  <div class="user-name">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</div>
                  <div class="user-email">{{ authStore.user?.email || 'user@example.com' }}</div>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <div class="dropdown-items">
                <button @click="goToProfile" class="dropdown-item">
                  <UserCircle class="dropdown-icon" />
                  <span>Thông tin cá nhân</span>
                </button>

                <div v-if="!isAdmin">
                  <button @click="goToOrders" class="dropdown-item">
                    <Package class="dropdown-icon" />
                    <span>Đơn hàng của tôi</span>
                  </button>
                </div>

                <div class="dropdown-divider"></div>

                <button @click="handleLogout" class="dropdown-item logout-item">
                  <LogOut class="dropdown-icon" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Login Link -->
          <router-link v-else to="/login" class="nav-link">Đăng nhập</router-link>

        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Search, ShoppingCart, Sun, Moon, User, ChevronDown, UserCircle, Package, LogOut } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { useBookStore } from '@/stores/bookStore'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import MessageIcon from '@/components/MessageIcon.vue'

const router = useRouter()
const cartStore = useCartStore()
const bookStore = useBookStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const isAdmin = computed(() => authStore.isAdmin)
const searchQuery = ref('')
const isDark = ref(false)
const totalItems = computed(() => cartStore.totalItems)
const showUserMenu = ref(false)

const handleSearch = () => {
  bookStore.setSearchQuery(searchQuery.value)
}

const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout()
  toastStore.success('Đăng xuất thành công. Hẹn gặp lại!')
  router.push('/')
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const goToOrders = () => {
  showUserMenu.value = false
  router.push('/orders')
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
  applyTheme() // Apply theme ngay sau khi init

  // Listen for system theme changes only if no manual preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
      applyTheme()
    }
  })

  // Close user menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      showUserMenu.value = false
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
  position: relative;
  display: flex;
  align-items: center;
}

.user-avatar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.user-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.user-avatar:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.user-avatar.no-image {
  background: linear-gradient(135deg, #10b981, #059669);
}

.user-avatar.no-image:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.chevron-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 16rem;
  z-index: 50;
  overflow: hidden;
  animation: fadeInDown 0.2s ease-out;
  transform-origin: top right;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.user-info {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
}

.user-avatar-large {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  position: relative;
}

.user-icon-large {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.user-avatar-large.no-image {
  background: linear-gradient(135deg, #10b981, #059669);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: #6b7280;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
}

.dropdown-items {
  padding: 0.5rem 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #374151;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  flex-shrink: 0;
}

.logout-item {
  color: #dc2626;
}

.logout-item:hover {
  background: #fef2f2;
}

.logout-item .dropdown-icon {
  color: #dc2626;
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

/* Dark mode cho user dropdown */
:global(.dark) .user-dropdown {
  background: #374151;
  border-color: #4b5563;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

:global(.dark) .user-info {
  background: #4b5563;
}

:global(.dark) .user-name {
  color: #f9fafb;
}

:global(.dark) .user-email {
  color: #d1d5db;
}

:global(.dark) .dropdown-divider {
  background: #4b5563;
}

:global(.dark) .dropdown-item {
  color: #f3f4f6;
}

:global(.dark) .dropdown-item:hover {
  background: #4b5563;
}

:global(.dark) .dropdown-icon {
  color: #9ca3af;
}

:global(.dark) .logout-item {
  color: #f87171;
}

:global(.dark) .logout-item:hover {
  background: #3f2122;
}

:global(.dark) .logout-item .dropdown-icon {
  color: #f87171;
}

:global(.dark) .user-avatar-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

:global(.dark) .user-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:global(.dark) .user-avatar {
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.dark) .user-avatar:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

:global(.dark) .user-avatar-large {
  border-color: #4b5563;
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

  .user-dropdown {
    right: 0;
    left: auto;
    min-width: 14rem;
  }

  .user-name,
  .user-email {
    max-width: 8rem;
  }
}

@media (max-width: 480px) {
  .user-dropdown {
    position: fixed;
    top: 4rem;
    right: 1rem;
    left: 1rem;
    width: auto;
    min-width: 0;
  }

  .user-avatar-btn {
    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  }

  .user-avatar {
    width: 1.75rem;
    height: 1.75rem;
  }

  .chevron-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  .user-avatar-large {
    width: 2.5rem;
    height: 2.5rem;
  }

  .user-icon-large {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>
