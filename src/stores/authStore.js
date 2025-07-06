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
        
        const { token, user } = response.data
        
        this.token = response.data.access_token
        this.user = response.data.user
        
        localStorage.setItem('access_token', esponse.data.access_token)
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
        
        this.user = response.data
      } catch (error) {
        console.error('Fetch profile error:', error)
        // Nếu token hết hạn, logout
        if (error.response?.status === 401) {
          this.logout()
        }
      }
    },

    // Khởi tạo khi app load
    async initializeAuth() {
      if (this.token) {
        await this.fetchUserProfile()
      }
    }
  }
})
