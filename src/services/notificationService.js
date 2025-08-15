import axios from 'axios'
import { signalRService } from '@/services/signalRService'

// Create axios instance for notification API (port 7208)
const notificationAxios = axios.create({
  baseURL: import.meta.env.VITE_API_REALTIME_URL
})

// Add request interceptor to include auth token
notificationAxios.interceptors.request.use(
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

class NotificationService {
  constructor() {
    this.isSignalRInitialized = false
    this.eventListeners = new Map()
  }

  /**
   * Khởi tạo SignalR connection cho user
   * @param {string|number} userId - ID của user
   * @param {string} role - Role của user (admin, user, etc.)
   */
  async initializeSignalR(userId, role) {
    if (!this.isSignalRInitialized && userId) {
      try {
        const result = await signalRService.connect()
        if (result.success) {
          this.isSignalRInitialized = true
          
          // Setup event listeners cho notifications
          this.setupNotificationListeners()
          
          return { success: true }
        } else {
          console.error('❌ Failed to initialize SignalR:', result.error)
          return { success: false, error: result.error }
        }
      } catch (error) {
        console.error('❌ Failed to initialize SignalR:', error)
        return { success: false, error: error.message }
      }
    }
    return { success: true, message: 'Already initialized' }
  }

  /**
   * Setup event listeners cho notifications
   */
  setupNotificationListeners() {
    // Event này đã được setup trong signalRService.js
    // Chỉ cần đảm bảo notification store được khởi tạo
  }

  /**
   * Refresh số lượng thông báo chưa đọc
   * @param {string|number} userId - ID của user
   */
  async refreshUnreadCount(userId) {
    try {
      const result = await this.getUnreadCount(userId)
      if (result.success) {
        // Trigger event để cập nhật UI
        this.dispatchEvent('unreadCountUpdated', { count: result.data })
        return result
      }
    } catch (error) {
      console.error('❌ Error refreshing unread count:', error)
    }
    return { success: false, error: 'Failed to refresh unread count' }
  }

  /**
   * Dispatch custom event
   * @param {string} eventName - Tên event
   * @param {object} detail - Chi tiết event
   */
  dispatchEvent(eventName, detail) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail }))
    }
  }

  /**
   * Add event listener
   * @param {string} eventName - Tên event
   * @param {function} callback - Callback function
   */
  addEventListener(eventName, callback) {
    if (typeof window !== 'undefined') {
      window.addEventListener(eventName, callback)
      
      // Store reference để có thể remove sau
      if (!this.eventListeners.has(eventName)) {
        this.eventListeners.set(eventName, [])
      }
      this.eventListeners.get(eventName).push(callback)
    }
  }

  /**
   * Remove event listener
   * @param {string} eventName - Tên event
   * @param {function} callback - Callback function
   */
  removeEventListener(eventName, callback) {
    if (typeof window !== 'undefined') {
      window.removeEventListener(eventName, callback)
      
      // Remove from stored references
      if (this.eventListeners.has(eventName)) {
        const callbacks = this.eventListeners.get(eventName)
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners() {
    this.eventListeners.forEach((callbacks, eventName) => {
      callbacks.forEach(callback => {
        if (typeof window !== 'undefined') {
          window.removeEventListener(eventName, callback)
        }
      })
    })
    this.eventListeners.clear()
  }

  /**
   * Ngắt kết nối SignalR
   */
  async disconnectSignalR() {
    try {
      await signalRService.disconnect()
      this.isSignalRInitialized = false
      this.removeAllEventListeners()
      return { success: true }
    } catch (error) {
      console.error('❌ Error disconnecting SignalR:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Kiểm tra trạng thái kết nối SignalR
   */
  isSignalRConnected() {
    return signalRService.isConnected()
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    return await signalRService.requestNotificationPermission()
  }
  /**
   * Lấy danh sách thông báo của user
   * @param {string|number} userId - ID của user
   * @returns {Promise} API response
   */
  async getUserNotifications(userId) {
    try {
      const response = await notificationAxios.get(`/notifications/user?userId=${userId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Lỗi khi tải thông báo'
      }
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   * @param {string|number} notificationId - ID của thông báo
   * @returns {Promise} API response
   */
  async markAsRead(notificationId) {
    try {
      const response = await notificationAxios.post(`/notifications/mark-as-read?id=${notificationId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Lỗi khi cập nhật thông báo'
      }
    }
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   * @param {string|number} userId - ID của user
   * @returns {Promise} API response
   */
  async markAllAsRead(userId) {
    try {
      const response = await notificationAxios.post(`/notifications/mark-all-as-read?userId=${userId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Lỗi khi cập nhật tất cả thông báo'
      }
    }
  }

  /**
   * Xóa thông báo theo ID
   * @param {string|number} notificationId - ID của thông báo
   * @returns {Promise} API response
   */
  async deleteNotification(notificationId) {
    try {
      const response = await notificationAxios.delete(`/notifications/delete-notification-by-id?id=${notificationId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Lỗi khi xóa thông báo'
      }
    }
  }

  /**
   * Xóa tất cả thông báo của user
   * @param {string|number} userId - ID của user
   * @returns {Promise} API response
   */
  async deleteAllNotifications(userId) {
    try {
      const response = await notificationAxios.delete(`/notifications/delete-all?userId=${userId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Lỗi khi xóa tất cả thông báo'
      }
    }
  }

  /**
   * Xóa tất cả thông báo đã đọc của user
   * @param {string|number} userId - ID của user
   * @returns {Promise} API response
   */
  async clearReadNotifications(userId) {
    try {
      const response = await notificationAxios.delete(`/notifications/clear-read?userId=${userId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error clearing read notifications:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Lỗi khi xóa thông báo đã đọc'
      }
    }
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   * @param {string|number} userId - ID của user
   * @returns {Promise} API response
   */
  async getUnreadCount(userId) {
    try {
      const response = await notificationAxios.get(`/notifications/count-unread?userId=${userId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Lỗi khi tải số thông báo chưa đọc'
      }
    }
  }
}

// Tạo singleton instance
export const notificationService = new NotificationService()
export default notificationService
