<template>
  <!-- Modal Overlay -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16"
    @click="closeModal"
  >
    <!-- Modal Content -->
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden my-8"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          Chi tiết đơn hàng #{{ order?.order_id }}
        </h2>
        <button 
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="px-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
        <div v-if="order" class="space-y-6">
          <!-- Order Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Thông tin đơn hàng</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Mã đơn hàng:</span>
                  <span class="font-medium text-gray-900 dark:text-white">#{{ order.order_id }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Ngày đặt:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(order.order_date) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Trạng thái:</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(order.status)
                  ]">
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Tổng tiền:</span>
                  <span class="font-bold text-lg text-blue-600 dark:text-blue-400">{{ formatPrice(order.total_amount) }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Thông tin thanh toán</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Phương thức:</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ getPaymentMethodText(order.method_id) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Trạng thái thanh toán:</span>
                  <span class="text-green-600 dark:text-green-400 font-medium">
                    {{ order.payment ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Sản phẩm</h3>
            
            <div v-if="order.orderDetail && order.orderDetail.book" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-start space-x-4">
                <img 
                  :src="order.orderDetail.book.image_url || '/placeholder-book.jpg'" 
                  :alt="order.orderDetail.book.title"
                  class="w-20 h-24 object-cover rounded-lg flex-shrink-0"
                  @error="$event.target.src='/placeholder-book.jpg'"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {{ order.orderDetail.book.title }}
                  </h4>
                  <div class="space-y-1 text-sm">
                    <p class="text-gray-600 dark:text-gray-400">
                      <span class="font-medium">Tác giả:</span> {{ getAuthorNames(order.orderDetail.book.authors) }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      <span class="font-medium">Nhà xuất bản:</span> {{ order.orderDetail.book.publisher || 'Chưa có thông tin' }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      <span class="font-medium">Năm xuất bản:</span> {{ formatPublishYear(order.orderDetail.book.publisher_year) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ formatPrice(order.orderDetail.unit_price) }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Số lượng: {{ order.orderDetail.quantity }}
                  </p>
                  <p class="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Thành tiền: {{ formatPrice(order.orderDetail.unit_price * order.orderDetail.quantity) }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Đơn hàng chưa có sản phẩm</p>
            </div>
          </div>

          <!-- Order Timeline -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Lịch sử đơn hàng</h3>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Đơn hàng được tạo</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(order.order_date) }}</p>
                </div>
              </div>
              
              <div v-if="order.status >= 1" class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Đơn hàng được xác nhận</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Đang xử lý</p>
                </div>
              </div>

              <div v-if="order.status >= 2" class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Đang giao hàng</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Sản phẩm đang được vận chuyển</p>
                </div>
              </div>

              <div v-if="order.status === 3" class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Giao hàng thành công</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Đơn hàng đã được giao thành công</p>
                </div>
              </div>

              <div v-if="order.status === 4" class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Đơn hàng đã bị hủy</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Đơn hàng không thể được xử lý</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div class="flex space-x-3">
          <button 
            v-if="order && order.status === 3"
            @click="handleReorder"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Mua lại
          </button>
          <button 
            v-if="order && order.status === 3"
            @click="handleWriteReview"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Đánh giá
          </button>
        </div>
        
        <div class="flex space-x-3">
          <button 
            v-if="order && order.status === 0"
            @click="handleCancelOrder"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Hủy đơn hàng
          </button>
          <button 
            @click="closeModal"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'reorder', 'cancel-order', 'write-review'])

const closeModal = () => {
  emit('close')
}

const handleReorder = () => {
  emit('reorder', props.order)
  closeModal()
}

const handleCancelOrder = () => {
  emit('cancel-order', props.order)
}

const handleWriteReview = () => {
  emit('write-review', props.order)
  closeModal()
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPublishYear = (dateString) => {
  if (!dateString) return 'Chưa có thông tin'
  return new Date(dateString).getFullYear()
}

const getStatusColor = (status) => {
  switch (status) {
    case 0:
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    case 1:
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    case 2:
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    case 3:
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    case 4:
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 0:
      return 'Chờ xử lý'
    case 1:
      return 'Đã xác nhận'
    case 2:
      return 'Đang giao hàng'
    case 3:
      return 'Đã giao hàng'
    case 4:
      return 'Đã hủy'
    default:
      return 'Không xác định'
  }
}

const getAuthorNames = (authors) => {
  if (!authors) return 'Chưa có thông tin'
  if (Array.isArray(authors) && authors.length > 0) {
    return authors.map(author => author.name).join(', ')
  }
  return 'Chưa có thông tin'
}

const getPaymentMethodText = (methodId) => {
  switch (methodId) {
    case 1:
      return 'Thanh toán khi nhận hàng (COD)'
    case 2:
      return 'Chuyển khoản ngân hàng'
    case 3:
      return 'Thẻ tín dụng'
    case 4:
      return 'Ví điện tử'
    default:
      return 'Chưa xác định'
  }
}
</script>

<style scoped>
/* Modal positioning improvements */
@media (max-width: 640px) {
  .fixed.inset-0 {
    padding: 1rem;
    padding-top: 2rem;
  }
}

/* Custom scrollbar for modal content */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dark mode scrollbar */
.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: #374151;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
