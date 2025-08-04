import axios from 'axios'

// Cấu hình base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://localhost:7096/api/v1'

// Request interceptor - thêm token vào mỗi request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') // Sử dụng access_token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - xử lý lỗi chung
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('access_token') // Xóa token
      window.location.href = '/login' // Redirect to login page
    }
    return Promise.reject(error)
  }
)

export default axios
