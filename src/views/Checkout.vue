<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Thanh toán</h1>

      <div v-if="items.length === 0" class="text-center py-12">
        <ShoppingCart class="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Giỏ hàng trống
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Bạn cần có sản phẩm trong giỏ hàng để thanh toán
        </p>
        <router-link to="/" class="btn-primary">
          Tiếp tục mua sắm
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Checkout Form -->
        <div class="space-y-6">
          <!-- Customer Information -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Thông tin khách hàng</h2>
            
            <!-- Info Notice -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div class="flex items-center space-x-2">
                <CheckCircle class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span class="text-blue-800 dark:text-blue-200 font-medium">Thông tin từ tài khoản</span>
              </div>
              <p class="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Thông tin giao hàng được lấy từ tài khoản đã đăng nhập của bạn.
              </p>
            </div>
            
            <form @submit.prevent="processOrder" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Họ và tên
                  </label>
                  <input 
                    v-model="orderForm.fullName"
                    type="text" 
                    readonly
                    class="input-field bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số điện thoại
                  </label>
                  <input 
                    v-model="orderForm.phone_number"
                    type="tel" 
                    readonly
                    class="input-field bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input 
                  v-model="orderForm.email"
                  type="email" 
                  readonly
                  class="input-field bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa chỉ giao hàng
                </label>
                <textarea 
                  v-model="orderForm.address"
                  rows="3"
                  readonly
                  class="input-field bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ghi chú
                </label>
                <textarea 
                  v-model="orderForm.note"
                  rows="2"
                  class="input-field"
                  placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                ></textarea>
              </div>
            </form>
          </div>

          <!-- Payment Method -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Phương thức thanh toán</h2>
            
            <div class="space-y-4">
              <!-- COD Payment -->
              <div 
                class="border rounded-lg p-4 cursor-pointer transition-all duration-200"
                :class="orderForm.paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
                @click="orderForm.paymentMethod = 'cod'"
              >
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input 
                    v-model="orderForm.paymentMethod"
                    type="radio" 
                    value="cod"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <Truck class="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">Thanh toán khi nhận hàng (COD)</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </div>
                </label>
              </div>
              
              <!-- VNPAY Payment -->
              <div 
                class="border rounded-lg p-4 cursor-pointer transition-all duration-200"
                :class="orderForm.paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
                @click="orderForm.paymentMethod = 'vnpay'"
              >
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input 
                    v-model="orderForm.paymentMethod"
                    type="radio" 
                    value="vnpay"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <CreditCard class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">VNPAY</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">Thanh toán qua ví điện tử VNPAY</div>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">Visa</span>
                        <span class="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">Mastercard</span>
                        <span class="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">ATM</span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              
              <!-- FE HOME Payment -->
              <div 
                class="border rounded-lg p-4 cursor-pointer transition-all duration-200"
                :class="orderForm.paymentMethod === 'fe_home' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
                @click="orderForm.paymentMethod = 'fe_home'"
              >
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input 
                    v-model="orderForm.paymentMethod"
                    type="radio" 
                    value="fe_home"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <Home class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">FE HOME</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">Thanh toán qua ví điện tử FE HOME</div>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">Ví điện tử</span>
                        <span class="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">Nhanh chóng</span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Payment Info based on selected method -->
            <div v-if="orderForm.paymentMethod" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div v-if="orderForm.paymentMethod === 'cod'" class="text-sm text-gray-600 dark:text-gray-300">
                <div class="flex items-center space-x-2 mb-2">
                  <CheckCircle class="w-4 h-4 text-green-500 dark:text-green-400" />
                  <span class="font-medium">Lưu ý khi thanh toán COD:</span>
                </div>
                <ul class="space-y-1 ml-6 list-disc">
                  <li>Vui lòng chuẩn bị đúng số tiền khi nhận hàng</li>
                  <li>Kiểm tra hàng trước khi thanh toán</li>
                  <li>Phí COD: Miễn phí cho đơn hàng trên 500,000đ</li>
                </ul>
              </div>
              
              <div v-else-if="orderForm.paymentMethod === 'vnpay'" class="text-sm text-gray-600 dark:text-gray-300">
                <div class="flex items-center space-x-2 mb-2">
                  <CheckCircle class="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span class="font-medium">Thanh toán VNPAY:</span>
                </div>
                <ul class="space-y-1 ml-6 list-disc">
                  <li>Hỗ trợ thẻ ATM, Visa, Mastercard</li>
                  <li>Giao dịch an toàn với mã hóa 256-bit SSL</li>
                  <li>Xử lý thanh toán tức thời</li>
                </ul>
              </div>
              
              <div v-else-if="orderForm.paymentMethod === 'fe_home'" class="text-sm text-gray-600 dark:text-gray-300">
                <div class="flex items-center space-x-2 mb-2">
                  <CheckCircle class="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span class="font-medium">Thanh toán FE HOME:</span>
                </div>
                <ul class="space-y-1 ml-6 list-disc">
                  <li>Thanh toán nhanh chóng qua ví điện tử</li>
                  <li>Bảo mật cao với xác thực 2 lớp</li>
                  <li>Hoàn tiền 100% nếu có sự cố</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="space-y-6">
          <!-- Order Items -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Đơn hàng của bạn</h2>
            
              <div class="space-y-4">
                <div 
                  v-for="item in items" 
                  :key="item.book_id || item.id"
                  class="flex items-center space-x-4"
                >
                  <img 
                    :src="item.book?.image_url || item.image" 
                    :alt="item.book?.title || item.title"
                    class="w-16 h-20 object-cover rounded"
                  />
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900 dark:text-white">{{ item.book?.title || item.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.book?.authors?.[0]?.author_name || item.author }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Số lượng: {{ item.quantity }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900 dark:text-white">{{ formatPrice((item.book?.price || item.price) * item.quantity) }}</p>
                  </div>
                </div>
              </div>
          </div>

          <!-- Order Total -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tổng cộng</h2>
            
            <div class="space-y-2">
              <div class="flex justify-between text-gray-900 dark:text-white">
                <span>Tạm tính:</span>
                <span>{{ formatPrice(totalPrice) }}</span>
              </div>
              <div class="flex justify-between text-gray-900 dark:text-white">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div class="flex justify-between text-lg font-bold">
                  <span class="text-gray-900 dark:text-white">Tổng tiền:</span>
                  <span class="text-blue-600 dark:text-blue-400">{{ formatPrice(totalPrice) }}</span>
                </div>
              </div>
            </div>
            
            <button 
              @click="createOrder"
              :disabled="!isFormValid || isProcessingOrder"
              class="w-full btn-primary mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <div v-if="isProcessingOrder" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang tạo đơn hàng...
              </div>
              <div v-else class="flex items-center justify-center">
                <Check class="h-5 w-5 mr-2" />
                Tạo đơn hàng
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard class="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đơn hàng đã tạo thành công!
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Đơn hàng #{{ createdOrderId }} đã được tạo. Bạn có muốn thanh toán ngay bây giờ không?
            </p>
            <div class="space-y-3">
              <button 
                @click="proceedToPayment"
                :disabled="isProcessingOrder"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <div v-if="isProcessingOrder" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý thanh toán...
                </div>
                <div v-else>
                  Thanh toán ngay ({{ getPaymentMethodName() }})
                </div>
              </button>
              <button 
                @click="payLater" 
                class="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Thanh toán sau
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check class="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đặt hàng thành công!
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Cảm ơn bạn đã mua sắm tại BookShop. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
            </p>
            <div class="space-y-2">
              <button @click="closeModal" class="w-full btn-primary">
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Truck, CreditCard, Check, Home, CheckCircle } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const cartStore = useCartStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()

const items = computed(() => cartStore.cartItems)
const totalPrice = computed(() => cartStore.totalPrice)
const isProcessingOrder = computed(() => orderStore.isLoading)

const showSuccessModal = ref(false)
const showPaymentModal = ref(false)
const createdOrderId = ref(null)
const selectedPaymentMethod = ref(null)

const orderForm = reactive({
  fullName: '',
  phone_number: '',
  email: '',
  address: '',
  note: '',
  paymentMethod: 'cod'
})

// Fill thông tin user từ auth store
onMounted(() => {
  if (authStore.user) {
    orderForm.fullName = authStore.user.fullName || authStore.user.first_name + ' ' + authStore.user.last_name || ''
    orderForm.phone_number = authStore.user.phone_number || ''
    orderForm.email = authStore.user.email || ''
    orderForm.address = authStore.user.address.house_number + ' ' + authStore.user.address.commune + " " + authStore.user.address.district + " " + authStore.user.address.councious + " " + authStore.user.address.country || ''
  }
})

const isFormValid = computed(() => {
  // Chỉ cần kiểm tra phương thức thanh toán, thông tin khách hàng sẽ được lấy từ auth token
  return orderForm.paymentMethod
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const createOrder = async () => {
  if (!orderForm.paymentMethod) {
    toastStore.error('Vui lòng chọn phương thức thanh toán')
    return
  }

  // Validate cart items
  if (!items.value || items.value.length === 0) {
    toastStore.error('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.')
    return
  }
  // Validate stock for each item
  for (const item of items.value) {
    if (!item.book?.quantity || item.book.quantity < item.quantity) {
      toastStore.error(`Sản phẩm "${item.book?.title}" không đủ hàng. Còn lại: ${item.book?.quantity || 0}`)
      return
    }
    
    // Validate item data
    if (!item.book_id && !item.id) {
      toastStore.error(`Dữ liệu sản phẩm "${item.book?.title}" không hợp lệ (thiếu ID)`)
      return
    }
    
    if (!item.book?.price && !item.price) {
      toastStore.error(`Dữ liệu sản phẩm "${item.book?.title}" không hợp lệ (thiếu giá)`)
      return
    }
  }

  try {
    // Chuyển đổi payment method thành methodId
    let methodId;
    switch (orderForm.paymentMethod) {
      case 'cod':
        methodId = 1;
        break;
      case 'vnpay':
        methodId = 2;
        break;
      case 'fe_home':
        methodId = 3;
        break;
      default:
        throw new Error('Phương thức thanh toán không hợp lệ')
    }    
    // Tạo order
    const orderResult = await orderStore.createOrder(methodId, items.value);
    
    if (orderResult.success) {
      createdOrderId.value = orderResult.orderId;
      selectedPaymentMethod.value = methodId;
      
      toastStore.success('Tạo đơn hàng thành công!');
      
      // Hiển thị modal để chọn thanh toán ngay hoặc sau
      showPaymentModal.value = true;
      
      // Clear cart sau khi tạo đơn hàng thành công
      cartStore.clearCart();
    } else {
      toastStore.error(orderResult.error || 'Không thể tạo đơn hàng')
    }
  } catch (error) {
    console.error('Error creating order:', error)
    toastStore.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.')
  }
}

const proceedToPayment = async () => {
  try {    
    // Tạo payment với orderId đã tạo
    const paymentResult = await orderStore.createPayment(createdOrderId.value, selectedPaymentMethod.value);
    
    if (paymentResult.success) {
      showPaymentModal.value = false;
      
      if (selectedPaymentMethod.value === 1) { // COD
        toastStore.success('Đặt hàng COD thành công!')
        showSuccessModal.value = true
      } else { // VNPAY hoặc FE HOME
        if (paymentResult.paymentUrl) {
          toastStore.success('Đang chuyển đến trang thanh toán...')
          setTimeout(() => {
            window.location.href = paymentResult.paymentUrl
          }, 1500)
        } else {
          toastStore.error('Không nhận được URL thanh toán')
        }
      }
    } else {
      toastStore.error(paymentResult.error || 'Không thể tạo thanh toán')
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    toastStore.error('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.')
  }
}

const payLater = () => {
  showPaymentModal.value = false
  toastStore.success('Đơn hàng đã được tạo. Bạn có thể thanh toán sau trong phần "Đơn hàng của tôi"')
  router.push('/orders')
}

const getPaymentMethodName = () => {
  switch (selectedPaymentMethod.value) {
    case 1: return 'COD'
    case 2: return 'VNPAY'
    case 3: return 'FE HOME'
    default: return 'Không xác định'
  }
}

const closeModal = () => {
  showSuccessModal.value = false
  router.push('/')
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .input-field {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark .input-field:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  box-shadow: 0 6px 10px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
