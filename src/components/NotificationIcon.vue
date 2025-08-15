<template>
  <div class="notification-icon" ref="iconRef">
    <!-- Notification Bell Icon -->
    <button 
      @click="toggleDropdown"
      class="notification-btn"
      :class="{ 'has-notifications': unreadCount > 0 }"
    >
      <Bell size="24" />
      
      <!-- Badge for unread count -->
      <span 
        v-if="unreadCount > 0" 
        class="notification-badge"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <div 
      v-if="showDropdown" 
      class="notification-dropdown"
      @click.stop
    >
      <!-- Header -->
      <div class="dropdown-header">
        <h3>Thông báo</h3>
        <div class="header-actions">
          <button 
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="mark-all-read"
          >
            Đánh dấu tất cả đã đọc
          </button>
          <button 
            @click="clearReadNotifications"
            class="clear-read"
            title="Xóa thông báo đã đọc (local)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
          <button 
            v-if="notifications.length > 0"
            @click="deleteAllNotifications"
            class="delete-all"
            title="Xóa tất cả thông báo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 6v18h18v-18h-18zM19 8v14h-14v-14h14zm-9 3h2v8h-2v-8zm4 0h2v8h-2v-8z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Đang tải...</span>
        </div>

        <div v-else-if="recentNotifications.length === 0" class="empty-state">
          <Bell size="48" stroke-width="1" />
          <p>Không có thông báo nào</p>
        </div>

        <div v-else class="notification-items">
          <div 
            v-for="notification in recentNotifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 
              'unread': !notification.isRead,
              [`type-${notification.type}`]: true 
            }"
            @click="handleNotificationClick(notification)"
          >
            <!-- Icon based on type -->
            <div class="notification-icon-type">
              <svg v-if="notification.type === 'order'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="m2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
              </svg>
              <svg v-else-if="notification.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <svg v-else-if="notification.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <svg v-else-if="notification.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>

            <!-- Content -->
            <div class="notification-content">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>

            <!-- Unread indicator -->
            <div v-if="!notification.isRead" class="unread-indicator"></div>

            <!-- Actions -->
            <div class="notification-actions">
              <button 
                v-if="!notification.isRead"
                @click.stop="markAsRead(notification.id)"
                class="mark-read-btn"
                title="Đánh dấu đã đọc"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </button>
              <button 
                @click.stop="removeNotification(notification.id)"
                class="remove-btn"
                title="Xóa thông báo"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>  
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="dropdown-footer">
        <button 
          @click="viewAllNotifications"
          class="view-all-btn"
        >
          Xem tất cả thông báo
        </button>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <OrderDetailModal
      :is-open="isOrderDetailModalOpen"
      :order="selectedOrder"
      @close="closeOrderDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { useOrderStore } from '@/stores/orderStore'
import { storeToRefs } from 'pinia'
import { Bell } from 'lucide-vue-next'
import OrderDetailModal from '@/components/modals/OrderDetailModal.vue'

// Router and stores
const router = useRouter()
const notificationStore = useNotificationStore()
const orderStore = useOrderStore()
const { 
  unreadCount, 
  recentNotifications, 
  notifications,
  isLoading 
} = storeToRefs(notificationStore)

// Local state
const showDropdown = ref(false)
const iconRef = ref(null)

// Modal state
const isOrderDetailModalOpen = ref(false)
const selectedOrder = ref(null)

// Methods
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const markAllAsRead = () => {
  notificationStore.markAllAsRead()
}

const clearReadNotifications = () => {
  notificationStore.clearReadNotifications()
}

const deleteAllNotifications = () => {
  notificationStore.deleteAllNotifications()
}

const markAsRead = (notificationId) => {
  notificationStore.markAsRead(notificationId)
}

const removeNotification = (notificationId) => {
  notificationStore.removeNotification(notificationId)
}

const handleNotificationClick = async (notification) => {
  // Mark as read if not already
  if (!notification.isRead) {
    markAsRead(notification.id)
  }
  
  // Handle different notification types
  if (notification.type === 'order' && notification.data?.orderId) {
    // Load order details and show modal
    await showOrderDetailModal(notification.data.orderId)
  }
  
  // Close dropdown
  showDropdown.value = false
}

const viewAllNotifications = () => {
  // Navigate to notifications page
  router.push('/notifications')
  showDropdown.value = false
}

// Modal methods
const showOrderDetailModal = async (orderId) => {
  try {
    // Load order details from API
    const result = await orderStore.getOrderDetails(orderId)
    
    if (result.success) {
      selectedOrder.value = result.data
      isOrderDetailModalOpen.value = true
    } else {
      console.error('Error loading order:', result.error)
    }
  } catch (error) {
    console.error('Error loading order details:', error)
  }
}

const closeOrderDetailModal = () => {
  isOrderDetailModalOpen.value = false
  selectedOrder.value = null
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMinutes = Math.floor((now - time) / (1000 * 60))
  
  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`
  
  return time.toLocaleDateString('vi-VN')
}

// Real-time notification handlers
const handleNewNotification = (event) => {
  // Force reactive update by refreshing the store
  nextTick(() => {
    // The notification should already be added to store via signalRService
  })
}

const handleNotificationsRefresh = (event) => {
  // Store has been refreshed, reactive updates should happen automatically
}

// Click outside to close
const handleClickOutside = (event) => {
  if (iconRef.value && !iconRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Initialize notifications from API
  notificationStore.initializeNotifications()
  
  // Listen for real-time notification events
  window.addEventListener('newOrderNotification', handleNewNotification)
  window.addEventListener('newGeneralNotification', handleNewNotification)
  window.addEventListener('notificationsRefreshed', handleNotificationsRefresh)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // Remove notification event listeners
  window.removeEventListener('newOrderNotification', handleNewNotification)
  window.removeEventListener('newGeneralNotification', handleNewNotification)
  window.removeEventListener('notificationsRefreshed', handleNotificationsRefresh)
})
</script>

<style scoped>
.notification-icon {
  position: relative;
  display: inline-block;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .notification-btn {
  color: #9ca3af;
}

.notification-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.dark .notification-btn:hover {
  background-color: #374151;
  color: #d1d5db;
}

.notification-btn.has-notifications {
  color: #059669;
}

.dark .notification-btn.has-notifications {
  color: #10b981;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(25%, -25%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  z-index: 1000;
  max-height: 500px;
  overflow: hidden;
  margin-top: 8px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.dark .notification-dropdown {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.dropdown-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.dark .dropdown-header {
  background: #374151;
  border-bottom-color: #4b5563;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  transition: color 0.2s ease;
}

.dark .dropdown-header h3 {
  color: #f9fafb;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.mark-all-read {
  background: none;
  border: none;
  color: #059669;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s, color 0.2s ease;
}

.dark .mark-all-read {
  color: #10b981;
}

.mark-all-read:hover {
  background-color: #ecfdf5;
}

.dark .mark-all-read:hover {
  background-color: #064e3b;
}

.clear-read {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.dark .clear-read {
  color: #9ca3af;
}

.clear-read:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.dark .clear-read:hover {
  background-color: #7f1d1d;
  color: #f87171;
}

.delete-all {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.dark .delete-all {
  color: #9ca3af;
}

.delete-all:hover {
  background-color: #fecaca;
  color: #b91c1c;
}

.dark .delete-all:hover {
  background-color: #7f1d1d;
  color: #f87171;
}

.notifications-list {
  max-height: 350px;
  overflow-y: auto;
}

.loading-state, .empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
  transition: color 0.2s ease;
}

.dark .loading-state, .dark .empty-state {
  color: #9ca3af;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #059669;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

.dark .loading-spinner {
  border-color: #374151;
  border-top-color: #10b981;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

.notification-item {
  display: flex;
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s ease;
  position: relative;
}

.dark .notification-item {
  border-bottom-color: #374151;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.dark .notification-item:hover {
  background-color: #374151;
}

.notification-item.unread {
  background-color: #f0fdf4;
}

.dark .notification-item.unread {
  background-color: #064e3b;
}

.notification-item.unread:hover {
  background-color: #ecfdf5;
}

.dark .notification-item.unread:hover {
  background-color: #065f46;
}

.notification-icon-type {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.notification-item.type-order .notification-icon-type {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.notification-item.type-success .notification-icon-type {
  background-color: #d1fae5;
  color: #059669;
}

.notification-item.type-warning .notification-icon-type {
  background-color: #fef3c7;
  color: #d97706;
}

.notification-item.type-error .notification-icon-type {
  background-color: #fee2e2;
  color: #dc2626;
}

.notification-item.type-info .notification-icon-type {
  background-color: #e5e7eb;
  color: #6b7280;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  transition: color 0.2s ease;
}

.dark .notification-title {
  color: #f9fafb;
}

.notification-message {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.2s ease;
}

.dark .notification-message {
  color: #9ca3af;
}

.notification-time {
  font-size: 11px;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.dark .notification-time {
  color: #6b7280;
}

.unread-indicator {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background-color: #059669;
  border-radius: 50%;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.mark-read-btn, .remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  color: #6b7280;
}

.dark .mark-read-btn, .dark .remove-btn {
  color: #9ca3af;
}

.mark-read-btn:hover {
  background-color: #d1fae5;
  color: #059669;
}

.dark .mark-read-btn:hover {
  background-color: #064e3b;
  color: #10b981;
}

.remove-btn:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.dark .remove-btn:hover {
  background-color: #7f1d1d;
  color: #f87171;
}

.dropdown-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.dark .dropdown-footer {
  background: #374151;
  border-top-color: #4b5563;
}

.view-all-btn {
  width: 100%;
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.dark .view-all-btn {
  border-color: #4b5563;
  color: #d1d5db;
}

.view-all-btn:hover {
  background-color: #374151;
  color: white;
}

.dark .view-all-btn:hover {
  background-color: #4b5563;
  color: #f9fafb;
}

/* Responsive */
@media (max-width: 480px) {
  .notification-dropdown {
    width: 320px;
    right: -20px;
  }
  
  .dropdown-header {
    padding: 12px 16px;
  }
  
  .notification-item {
    padding: 10px 16px;
  }
  
  .notification-content {
    margin-right: 8px;
  }
}
</style>
