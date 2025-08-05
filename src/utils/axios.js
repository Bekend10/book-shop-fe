import axios from 'axios'

// Cấu hình base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://localhost:7096/api/v1'

// Tạo instance riêng cho refresh token để tránh interceptor loop
const refreshAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7096/api/v1'
})

// Biến để theo dõi refresh token đang được thực hiện
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor - thêm token vào mỗi request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - xử lý lỗi chung và refresh token
axios.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh token, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axios(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      
      if (!refreshToken) {
        // Không có refresh token, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Sử dụng instance riêng để gọi API refresh token
        const response = await refreshAxios.post('/accounts/refresh-token', {
          refresh_token: refreshToken
        })

        const { access_token, refresh_token: newRefreshToken } = response.data

        // Cập nhật token mới
        localStorage.setItem('access_token', access_token)
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken)
        }

        // Cập nhật header cho request gốc
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        
        // Process queue với token mới
        processQueue(null, access_token)
        
        return axios(originalRequest)
      } catch (refreshError) {
        // Refresh token thất bại, logout user
        processQueue(refreshError, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axios
