<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Processing State -->
      <div v-if="isProcessing" class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Đang xử lý thanh toán...
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
          {{ paymentResult.message || 'Cảm ơn bạn đã thanh toán qua VNPAY. Đơn hàng của bạn đã được xác nhận.' }}
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
              <span class="font-medium text-gray-900 dark:text-white">VNPAY</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <router-link
            to="/orders"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <Package class="w-5 h-5 mr-2" />
            Xem đơn hàng
          </router-link>
          
          <router-link
            to="/"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
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
          {{ paymentResult?.error || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.' }}
        </p>

        <div class="space-y-3">
          <router-link
            to="/checkout"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <RefreshCw class="w-5 h-5 mr-2" />
            Thử lại
          </router-link>
          
          <router-link
            to="/"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
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

const verifyVNPayPayment = async () => {
  try {
    // Get all query parameters from the callback URL
    const params = {
      vnp_Amount: route.query.vnp_Amount,
      vnp_BankCode: route.query.vnp_BankCode,
      vnp_BankTranNo: route.query.vnp_BankTranNo,
      vnp_CardType: route.query.vnp_CardType,
      vnp_OrderInfo: route.query.vnp_OrderInfo,
      vnp_PayDate: route.query.vnp_PayDate,
      vnp_ResponseCode: route.query.vnp_ResponseCode,
      vnp_TmnCode: route.query.vnp_TmnCode,
      vnp_TransactionNo: route.query.vnp_TransactionNo,
      vnp_TransactionStatus: route.query.vnp_TransactionStatus,
      vnp_TxnRef: route.query.vnp_TxnRef,
      vnp_SecureHash: route.query.vnp_SecureHash
    }

    // Check if payment was successful based on response code
    if (route.query.vnp_ResponseCode === '00') {
      // Payment successful - update order status
      const result = await orderStore.verifyPayment('vnpay', params)
      paymentResult.value = result

      // Clear cart if payment successful
      if (result.success) {
        cartStore.clearCart()
      }
    } else {
      // Payment failed
      paymentResult.value = {
        success: false,
        error: getVNPayErrorMessage(route.query.vnp_ResponseCode)
      }
    }
  } catch (error) {
    console.error('VNPAY verification error:', error)
    paymentResult.value = {
      success: false,
      error: 'Không thể xác thực thanh toán VNPAY'
    }
  } finally {
    isProcessing.value = false
  }
}

// Get VNPAY error message based on response code
const getVNPayErrorMessage = (responseCode) => {
  const errorCodes = {
    '01': 'Giao dịch chưa hoàn tất',
    '02': 'Giao dịch bị lỗi',
    '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
    '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
    '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
    '07': 'Giao dịch bị nghi ngờ gian lận',
    '09': 'GD Hoàn trả bị từ chối',
    '10': 'Đã giao hàng',
    '11': 'Đã hủy (Đối với giao dịch thanh toán trước)',
    '12': 'Giao dịch bị hủy do quá thời gian chờ thanh toán',
    '13': 'Giao dịch bị hủy do khách hàng hủy',
    '24': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
  }
  
  return errorCodes[responseCode] || 'Giao dịch không thành công'
}

onMounted(() => {
  // Set page title
  document.title = 'Kết quả thanh toán VNPAY | BookShop'
  
  // Verify payment
  verifyVNPayPayment()
})
</script>
