import { defineStore } from 'pinia'
import axios from '@/utils/axios'
import { mockAuth } from '@/utils/mockAuth'
import { useToastStore } from '@/stores/toastStore'
// Sử dụng mock API cho development
var USE_MOCK_API = false;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('access_token') || null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      this.error = null

      try {
        let response
          const toastStore = useToastStore()
        if (USE_MOCK_API) {
          // Sử dụng mock API
          const data = await mockAuth.login(credentials)
          response = { data }
        } else {
          // Gọi API thật
          response = await axios.post('/accounts/login', credentials)
        }
        
        // Lưu token và thông tin user
        this.token = response.data.access_token
        this.user = response.data.user
        
        // Lưu token vào localStorage
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        return { success: true }
        
      } catch (error) {
        this.error = 'Đăng nhập thất bại'
        toastStore.error(this.error)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      this.isLoading = true
      this.error = null

      try {
        let response
        
        if (USE_MOCK_API) {
          // Sử dụng mock API
          const data = await mockAuth.register(userData)
          response = { data }
        } else {
          // Gọi API thật
          response = await axios.post('/accounts/register', userData)
        }
        // Lưu token và thông tin user        
        this.token = response.data.access_token
        this.user = response.data.user
        
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        return { success: true }
        
      } catch (error) {
        this.error = error.message || error.response?.data?.msg || 'Đăng ký thất bại'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        if (!USE_MOCK_API) {
          // Gọi API logout nếu cần
          await axios.post('/accounts/logout')
        }
      } catch (error) {
        console.error('Logout API error:', error)
      } finally {
        // Clear state
        this.user = null
        this.token = null
        this.error = null
        
        // Clear localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    },

    async fetchUserProfile() {
      if (!this.token) return

      try {
        let response
        var id = this.user?.user_id || -1
        if (USE_MOCK_API) {
          // Sử dụng mock API
          const data = await mockAuth.getProfile(this.token)
          response = { data }
        } else {
          // Gọi API thật
          response = await axios.get('/users/get-user-by-id?id=' + id)
        }
        
        // Cập nhật thông tin user mới nhất
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        
      } catch (error) {
        console.error('Fetch profile error:', error)
        // Chỉ logout nếu token thực sự hết hạn (401)
        if (error.response?.status === 401) {
          this.logout()
          throw error // Re-throw để initializeAuth biết token không hợp lệ
        }
        // Với các lỗi khác (mạng, server), không logout
      }
    },

    // Khởi tạo khi app load
    async initializeAuth() {
      
      // Kiểm tra localStorage có token không
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
            
      if (token && user) {
        try {
          // Khôi phục thông tin từ localStorage
          this.token = token
          this.user = JSON.parse(user)
                    
        } catch (error) {
          // Nếu token không hợp lệ, clear localStorage
          this.logout()
        }
      }
    }
  }
})
