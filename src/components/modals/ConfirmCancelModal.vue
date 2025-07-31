<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="onCancel"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        <!-- Modal Content -->
        <div class="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <!-- Warning Icon -->
            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            
            <!-- Content -->
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ title || 'Xác nhận hủy đơn hàng' }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ message || 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.' }}
                </p>
                
                <!-- Order Info -->
                <div v-if="order" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mã đơn hàng:
                    </span>
                    <span class="text-sm text-gray-900 dark:text-white font-mono">
                      #{{ order.order_id }}
                    </span>
                  </div>
                  
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ngày đặt:
                    </span>
                    <span class="text-sm text-gray-900 dark:text-white">
                      {{ formatDate(order.order_date) }}
                    </span>
                  </div>
                  
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tổng tiền:
                    </span>
                    <span class="text-sm text-gray-900 dark:text-white font-semibold">
                      {{ formatPrice(order.total_amount) }}
                    </span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trạng thái:
                    </span>
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(order.status)
                    ]">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>

                  <!-- Book Info -->
                  <div v-if="order.orderDetail && order.orderDetail.book" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div class="flex items-center space-x-3">
                      <img 
                        :src="order.orderDetail.book.image_url || '/placeholder-book.jpg'" 
                        :alt="order.orderDetail.book.title"
                        class="w-12 h-16 object-cover rounded"
                        @error="$event.target.src='/placeholder-book.jpg'"
                      />
                      <div class="flex-1">
                        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ order.orderDetail.book.title }}
                        </h4>
                        <p class="text-xs text-gray-600 dark:text-gray-400">
                          Số lượng: {{ order.orderDetail.quantity }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button 
            type="button" 
            @click="onConfirm"
            :disabled="isLoading"
            class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Đang xử lý...' : (confirmText || 'Xác nhận hủy') }}
          </button>
          
          <button 
            type="button" 
            @click="onCancel"
            :disabled="isLoading"
            class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
          >
            {{ cancelText || 'Hủy bỏ' }}
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
  title: {
    type: String,
    default: 'Xác nhận hủy đơn hàng'
  },
  message: {
    type: String,
    default: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.'
  },
  confirmText: {
    type: String,
    default: 'Xác nhận hủy'
  },
  cancelText: {
    type: String,
    default: 'Hủy bỏ'
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
  emit('close')
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
</script>

<style scoped>
/* Animation for modal */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
