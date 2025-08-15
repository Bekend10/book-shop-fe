import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/stores/authStore'

// Helper functions to extract order information
function extractOrderId(messageContent) {
  const match = messageContent.match(/#(\d+)/)
  return match ? match[1] : null
}

function extractOrderTitle(messageContent) {
  if (messageContent.includes('Đơn hàng')) {
    return 'Đơn hàng mới'
  }
  return 'Thông báo'
}

function extractCustomerName(messageContent) {
  const match = messageContent.match(/từ (.+)$/)
  return match ? match[1] : 'Khách hàng'
}

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])
  const isLoading = ref(false)

  // Computed
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length
  })

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      // Unread first, then by date
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  })

  const recentNotifications = computed(() => {
    return sortedNotifications.value.slice(0, 10)
  })

  // Actions
  async function fetchNotifications() {
    const authStore = useAuthStore()
    const userId = authStore.user?.user_id || authStore.user?.id
    
    if (!userId) {
      return
    }

    isLoading.value = true
    try {
      const result = await notificationService.getUserNotifications(userId)
      
      if (result.success) {
        // Transform backend data to frontend format
        const backendNotifications = result.data || []
        notifications.value = backendNotifications.map(notification => ({
          id: notification.notification_id,
          title: extractOrderTitle(notification.message_content),
          message: notification.message_content,
          type: 'order', // Since these are order notifications
          isRead: notification.isRead || false,
          createdAt: notification.created_at,
          data: { 
            orderId: extractOrderId(notification.message_content),
            userId: notification.user_id,
            customerName: extractCustomerName(notification.message_content)
          }
        }))
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
    } finally {
      isLoading.value = false
    }
  }

  function addNotification(notification) {
    // Ensure notification has required fields
    const formattedNotification = {
      id: notification.id || Date.now(),
      title: notification.title || 'Thông báo',
      message: notification.message || notification.content || '',
      type: notification.type || 'info', // info, success, warning, error, order
      isRead: false,
      createdAt: notification.createdAt || new Date().toISOString(),
      data: notification.data || null // Additional data for specific notification types
    }

    // Check if notification already exists
    const existingIndex = notifications.value.findIndex(n => n.id === formattedNotification.id)
    if (existingIndex === -1) {
      notifications.value.unshift(formattedNotification)
    }
  }

  async function markAsRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (!notification) {
      return
    }

    // Optimistically update UI
    notification.isRead = true
    
    try {
      const result = await notificationService.markAsRead(notificationId)
      if (result.success) {
        console.log(`✅ Marked notification as read: ${notificationId}`)
      } else {
        // Revert on failure
        notification.isRead = false
      }
    } catch (error) {
      // Revert on error
      notification.isRead = false
    }
  }

  async function markAllAsRead() {
    const authStore = useAuthStore()
    const userId = authStore.user?.user_id || authStore.user?.id
    
    if (!userId) {
      return
    }

    // Optimistically update UI
    const unreadNotifications = notifications.value.filter(n => !n.isRead)
    unreadNotifications.forEach(n => n.isRead = true)
    
    try {
      const result = await notificationService.markAllAsRead(userId)
      if (result.success) {
        console.log('✅ Marked all notifications as read')
      } else {
        // Revert on failure
        unreadNotifications.forEach(n => n.isRead = false)
      }
    } catch (error) {
      // Revert on error
      unreadNotifications.forEach(n => n.isRead = false)
    }
  }

  async function removeNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index === -1) {
      return
    }

    // Optimistically remove from UI
    const removedNotification = notifications.value.splice(index, 1)[0]
    
    try {
      const result = await notificationService.deleteNotification(notificationId)
      if (result.success) {
        console.log(`🗑️ Removed notification: ${removedNotification.title}`)
      } else {
        // Revert on failure
        notifications.value.splice(index, 0, removedNotification)
      }
    } catch (error) {
      // Revert on error
      notifications.value.splice(index, 0, removedNotification)
    }
  }

  async function deleteAllNotifications() {
    const authStore = useAuthStore()
    const userId = authStore.user?.user_id || authStore.user?.id
    
    if (!userId) {
      console.warn('⚠️ No user ID found, cannot delete all notifications')
      return
    }

    // Optimistically clear UI
    const originalNotifications = [...notifications.value]
    notifications.value = []
    
    try {
      const result = await notificationService.deleteAllNotifications(userId)
      if (result.success) {
        console.log('🗑️ Deleted all notifications')
      } else {
        // Revert on failure
        notifications.value = originalNotifications
      }
    } catch (error) {
      // Revert on error
      notifications.value = originalNotifications
    }
  }

  function clearAllNotifications() {
    notifications.value = []
    console.log('🧹 Cleared all notifications (local only)')
  }

  async function clearReadNotifications() {
    const authStore = useAuthStore()
    const userId = authStore.user?.user_id || authStore.user?.id
    
    if (!userId) {
      console.warn('⚠️ No user ID found, cannot clear read notifications')
      return
    }

    const beforeCount = notifications.value.length
    const readNotifications = notifications.value.filter(n => n.isRead)
    
    // Optimistically remove read notifications from UI
    notifications.value = notifications.value.filter(n => !n.isRead)
    
    try {
      // Call API to delete read notifications
      const result = await notificationService.clearReadNotifications(userId)
      if (result.success) {
        const removedCount = beforeCount - notifications.value.length
        console.log(`🧹 Cleared ${removedCount} read notifications`)
      } else {
        // Revert on failure
        notifications.value = [...notifications.value, ...readNotifications]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }
    } catch (error) {
      // Revert on error
      notifications.value = [...notifications.value, ...readNotifications]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      console.error('❌ Error clearing read notifications:', error)
    }
  }

  // Initialize notifications when user logs in
  async function initializeNotifications() {
    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      await fetchNotifications()
    }
  }


  return {
    // State
    notifications,
    isLoading,
    
    // Computed
    unreadCount,
    sortedNotifications,
    recentNotifications,
    
    // Actions
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    clearReadNotifications,
    initializeNotifications,
  }
})
