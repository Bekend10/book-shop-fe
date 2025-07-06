<template>
  <div id="app">
    <Navbar />
    <Toast />
    <main class="min-h-screen">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted, onErrorCaptured } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import Toast from '@/components/Toast.vue'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const authStore = useAuthStore()
const toastStore = useToastStore()

// Khởi tạo theme khi app load
const initTheme = () => {
  // Kiểm tra localStorage trước
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } else {
    // Nếu chưa có setting, dùng system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

// Khởi tạo auth khi app load
onMounted(async () => {
  // Initialize theme first
  initTheme()
  
  try {
    await authStore.initializeAuth()
  } catch (error) {
    console.error('Failed to initialize auth:', error)
  }
})

// Xử lý lỗi toàn cục
onErrorCaptured((error, instance, errorInfo) => {
  console.error('Global error:', error, errorInfo)
  toastStore.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.')
  return false
})

// Xử lý lỗi mạng
window.addEventListener('offline', () => {
  toastStore.warning('Mất kết nối internet. Vui lòng kiểm tra kết nối.')
})

window.addEventListener('online', () => {
  toastStore.success('Đã kết nối lại internet.')
})
</script>
