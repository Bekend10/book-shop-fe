<template>
  <div class="notifications-page bg-white dark:bg-gray-900 min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Quản lý thông báo
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Xem và quản lý tất cả thông báo của bạn
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bell class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng thông báo</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalNotifications }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Đã đọc</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ readNotifications }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertCircle class="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Chưa đọc</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ unreadNotifications }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ShoppingCart class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Đơn hàng</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ orderNotifications }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
        <div class="p-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Tìm kiếm thông báo..."
                  class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select 
                v-model="statusFilter"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="unread">Chưa đọc</option>
                <option value="read">Đã đọc</option>
              </select>

              <select 
                v-model="typeFilter"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả loại</option>
                <option value="order">Đơn hàng</option>
                <option value="success">Thành công</option>
                <option value="warning">Cảnh báo</option>
                <option value="error">Lỗi</option>
                <option value="info">Thông tin</option>
              </select>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="markAllAsRead"
                :disabled="unreadNotifications === 0"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <CheckCircle class="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </button>

              <button
                @click="clearReadNotifications"
                :disabled="readNotifications === 0"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Trash2 class="w-4 h-4" />
                Xóa đã đọc
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <!-- Loading State -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Đang tải thông báo...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredNotifications.length === 0" class="p-8 text-center">
          <Bell class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Không có thông báo</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ searchQuery || statusFilter || typeFilter ? 'Không tìm thấy thông báo phù hợp' : 'Bạn chưa có thông báo nào' }}
          </p>
        </div>

        <!-- Notifications -->
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="notification in paginatedNotifications"
            :key="notification.id"
            class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start space-x-4">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ notification.title }}
                  </p>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatTime(notification.createdAt) }}
                    </span>
                    <span 
                      v-if="!notification.isRead"
                      class="w-2 h-2 bg-blue-600 rounded-full"
                    ></span>
                  </div>
                </div>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {{ notification.message }}
                </p>
                <div class="mt-2 flex items-center space-x-4">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getNotificationTypeClass(notification.type)"
                  >
                    {{ getNotificationTypeText(notification.type) }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex-shrink-0 flex items-center space-x-2">
                <button
                  v-if="!notification.isRead"
                  @click.stop="markAsRead(notification.id)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                  title="Đánh dấu đã đọc"
                >
                  <CheckCircle class="w-4 h-4" />
                </button>
                <button
                  @click.stop="removeNotification(notification.id)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                  title="Xóa thông báo"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị {{ paginationInfo.start }}-{{ paginationInfo.end }} trên {{ filteredNotifications.length }} thông báo
            </div>
            <div class="flex space-x-2">
              <button
                @click="currentPage = 1"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đầu
              </button>
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-blue-600 text-white">
                {{ currentPage }}
              </span>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
              <button
                @click="currentPage = totalPages"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cuối
              </button>
            </div>
          </div>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { useOrderStore } from '@/stores/orderStore'
import { storeToRefs } from 'pinia'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  ShoppingCart, 
  Search, 
  Trash2,
  Info,
  AlertTriangle,
  XCircle,
  Package
} from 'lucide-vue-next'
import OrderDetailModal from '@/components/modals/OrderDetailModal.vue'

const notificationStore = useNotificationStore()
const orderStore = useOrderStore()
const { notifications } = storeToRefs(notificationStore)

// State
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modal state
const isOrderDetailModalOpen = ref(false)
const selectedOrder = ref(null)

// Computed
const totalNotifications = computed(() => notifications.value.length)
const readNotifications = computed(() => notifications.value.filter(n => n.isRead).length)
const unreadNotifications = computed(() => notifications.value.filter(n => !n.isRead).length)
const orderNotifications = computed(() => notifications.value.filter(n => n.type === 'order').length)

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.message.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(n => 
      statusFilter.value === 'read' ? n.isRead : !n.isRead
    )
  }

  if (typeFilter.value) {
    filtered = filtered.filter(n => n.type === typeFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const totalPages = computed(() => Math.ceil(filteredNotifications.value.length / itemsPerPage.value))

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNotifications.value.slice(start, end)
})

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(start + itemsPerPage.value - 1, filteredNotifications.value.length)
  return { start, end }
})

// Methods
const getNotificationIcon = (type) => {
  const icons = {
    order: ShoppingCart,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    info: Info
  }
  return icons[type] || Bell
}

const getNotificationIconClass = (type) => {
  const classes = {
    order: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    success: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    error: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    info: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  }
  return classes[type] || classes.info
}

const getNotificationTypeClass = (type) => {
  const classes = {
    order: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return classes[type] || classes.info
}

const getNotificationTypeText = (type) => {
  const texts = {
    order: 'Đơn hàng',
    success: 'Thành công',
    warning: 'Cảnh báo',
    error: 'Lỗi',
    info: 'Thông tin'
  }
  return texts[type] || 'Khác'
}

const formatTime = (createdAt) => {
  const now = new Date()
  const time = new Date(createdAt)
  const diffMinutes = Math.floor((now - time) / (1000 * 60))
  
  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`
  
  return time.toLocaleDateString('vi-VN')
}

const handleNotificationClick = async (notification) => {
  // Mark as read if not already
  if (!notification.isRead) {
    await markAsRead(notification.id)
  }

  // Handle different notification types
  if (notification.type === 'order' && notification.data?.orderId) {
    await showOrderDetailModal(notification.data.orderId)
  }
}

const markAsRead = async (notificationId) => {
  await notificationStore.markAsRead(notificationId)
}

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const removeNotification = async (notificationId) => {
  await notificationStore.removeNotification(notificationId)
}

const clearReadNotifications = async () => {
  await notificationStore.clearReadNotifications()
}

// Modal methods
const showOrderDetailModal = async (orderId) => {
  try {
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

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    await notificationStore.initializeNotifications()
  } catch (error) {
    console.error('Error loading notifications:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Animation for new notifications */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification-item {
  animation: slideIn 0.3s ease-out;
}
</style>
