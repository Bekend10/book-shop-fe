<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Processing State -->
      <div v-if="isProcessing" class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Đang xử lý thanh toán FE HOME...
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Vui lòng không đóng trang này
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="paymentResult?.success" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle class="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Thanh toán thành công!
        </h2>
        
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ paymentResult.message || 'Cảm ơn bạn đã thanh toán qua FE HOME. Đơn hàng của bạn đã được xác nhận.' }}
        </p>

        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div class="text-sm space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Mã đơn hàng:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ paymentResult.data?.order?.order_id || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Số tiền:</span>
              <span class="font-medium text-green-600 dark:text-green-400">{{ formatPrice(paymentResult.data?.order?.total_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Phương thức:</span>
              <span class="font-medium text-gray-900 dark:text-white">FE HOME</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <router-link
            to="/orders"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
          >
            <Package class="w-5 h-5 mr-2" />
            Xem đơn hàng
          </router-link>
          
          <router-link
            to="/"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
          >
            <Home class="w-5 h-5 mr-2" />
            Tiếp tục mua sắm
          </router-link>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle class="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Thanh toán thất bại
        </h2>
        
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ paymentResult?.error || 'Có lỗi xảy ra trong quá trình thanh toán FE HOME. Vui lòng thử lại.' }}
        </p>

        <div class="space-y-3">
          <router-link
            to="/checkout"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
          >
            <RefreshCw class="w-5 h-5 mr-2" />
            Thử lại
          </router-link>
          
          <router-link
            to="/"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
          >
            <Home class="w-5 h-5 mr-2" />
            Về trang chủ
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle, XCircle, Home, Package, RefreshCw } from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'
import { useCartStore } from '@/stores/cartStore'

const route = useRoute()
const orderStore = useOrderStore()
const cartStore = useCartStore()

const isProcessing = ref(true)
const paymentResult = ref(null)

const formatPrice = (price) => {
  if (!price) return '0đ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const verifyFEHomePayment = async () => {
  try {
    // Get all query parameters from the callback URL
    const params = {
      transaction_id: route.query.transaction_id,
      order_id: route.query.order_id,
      amount: route.query.amount,
      status: route.query.status,
      signature: route.query.signature,
      timestamp: route.query.timestamp
    }

    const result = await orderStore.verifyPayment('fe-home', params)
    paymentResult.value = result

    // Clear cart if payment successful
    if (result.success) {
      cartStore.clearCart()
    }
  } catch (error) {
    console.error('FE HOME verification error:', error)
    paymentResult.value = {
      success: false,
      error: 'Không thể xác thực thanh toán FE HOME'
    }
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  // Set page title
  document.title = 'Kết quả thanh toán FE HOME | BookShop'
  
  // Verify payment
  verifyFEHomePayment()
})
</script>
