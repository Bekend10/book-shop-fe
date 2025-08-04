<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Giỏ hàng của bạn
          </h1>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ cartStore.totalItems }} sản phẩm
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="cartStore.isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div class="flex justify-center items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-400">Đang tải giỏ hàng...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="cartStore.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-red-800 dark:text-red-200">{{ cartStore.error }}</span>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="cartStore.cartItems.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div class="text-center">
          <ShoppingCart class="h-24 w-24 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Giỏ hàng trống
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm sách yêu thích!
          </p>
          <router-link
            to="/"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            Tiếp tục mua sắm
          </router-link>
        </div>
      </div>

      <!-- Cart Items -->
      <div v-else class="space-y-6">
        <!-- Cart Items List -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Sản phẩm trong giỏ hàng
            </h2>
            
            <div class="space-y-6">
              <div 
                v-for="item in paginatedCartItems" 
                :key="item.book_id"
                class="flex items-start space-x-4 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0"
              >
                <!-- Book Image -->
                <div class="flex-shrink-0">
                  <img 
                    :src="item.book.image_url || '/placeholder-book.jpg'" 
                    :alt="item.book.title"
                    class="w-20 h-28 object-cover rounded-lg shadow-sm"
                    @error="$event.target.src='/placeholder-book.jpg'"
                  />
                </div>

                <!-- Book Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {{ item.book.title }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Tác giả: {{ cartStore.getAuthorNames(item.book.authors) }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Nhà xuất bản: {{ item.book.publisher }}
                  </p>
                  
                  <!-- Price -->
                  <div class="flex items-center space-x-2 mb-4">
                    <span class="text-lg font-bold text-red-600 dark:text-red-400">
                      {{ formatPrice(item.book.price) }}
                    </span>
                    <span v-if="item.book.price_origin && item.book.price_origin > item.book.price" 
                          class="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {{ formatPrice(item.book.price_origin) }}
                    </span>
                  </div>

                  <!-- Quantity & Actions -->
                  <div class="flex items-center justify-between">
                    <!-- Quantity Controls -->
                    <div class="flex items-center space-x-3">
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số lượng:
                      </label>
                      <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                        <button
                          @click="decreaseQuantity(item.book_id)"
                          :disabled="item.quantity <= 1 || cartStore.isUpdating"
                          class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus class="w-4 h-4" />
                        </button>
                        
                        <input
                          :value="item.quantity"
                          @change="updateQuantity(item.book_id, parseInt($event.target.value))"
                          type="number"
                          min="1"
                          :max="item.book.quantity"
                          class="w-16 text-center border-0 bg-transparent text-gray-900 dark:text-white focus:ring-0"
                          :disabled="cartStore.isUpdating"
                        />
                        
                        <button
                          @click="increaseQuantity(item.book_id)"
                          :disabled="item.quantity >= item.book.quantity || cartStore.isUpdating"
                          class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus class="w-4 h-4" />
                        </button>
                      </div>
                      
                      <span class="text-sm text-gray-500 dark:text-gray-400">
                        (Còn {{ item.book.quantity }} cuốn)
                      </span>
                    </div>

                    <!-- Remove Button -->
                    <button
                      @click="confirmRemoveItem(item.book_id, item.book.title)"
                      :disabled="cartStore.isUpdating"
                      class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 class="w-5 h-5" />
                    </button>
                  </div>

                  <!-- Subtotal -->
                  <div class="mt-3 text-right">
                    <span class="text-lg font-semibold text-gray-900 dark:text-white">
                      Thành tiền: {{ formatPrice(item.quantity * item.book.price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Cart Pagination -->
          <div v-if="cartStore.cartItems.length > cartItemsPerPage && cartTotalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span>
                  Hiển thị {{ ((cartCurrentPage - 1) * cartItemsPerPage) + 1 }} - {{ Math.min(cartCurrentPage * cartItemsPerPage, cartStore.cartItems.length) }} 
                  trong {{ cartStore.cartItems.length }} sản phẩm
                </span>
              </div>
              
              <div class="flex items-center space-x-2">
                <!-- Previous Button -->
                <button
                  @click="changeCartPage(cartCurrentPage - 1)"
                  :disabled="cartCurrentPage === 1"
                  class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600"
                >
                  Trước
                </button>
                
                <!-- Page Numbers -->
                <button
                  v-for="page in Array.from({length: cartTotalPages}, (_, i) => i + 1)"
                  :key="page"
                  @click="changeCartPage(page)"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded-md',
                    page === cartCurrentPage
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                  ]"
                >
                  {{ page }}
                </button>
                
                <!-- Next Button -->
                <button
                  @click="changeCartPage(cartCurrentPage + 1)"
                  :disabled="cartCurrentPage === cartTotalPages"
                  class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Tóm tắt đơn hàng
            </h2>
            
            <div class="space-y-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Tạm tính</span>
                <span class="text-gray-900 dark:text-white">{{ formatPrice(cartStore.subtotal) }}</span>
              </div>
              
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Phí vận chuyển</span>
                <span class="text-gray-900 dark:text-white">{{ formatPrice(cartStore.shippingFee) }}</span>
              </div>
              
              <div v-if="cartStore.discount > 0" class="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span>
                <span>-{{ formatPrice(cartStore.discount) }}</span>
              </div>
              
              <hr class="border-gray-200 dark:border-gray-700">
              
              <div class="flex justify-between text-lg font-bold">
                <span class="text-gray-900 dark:text-white">Tổng cộng</span>
                <span class="text-red-600 dark:text-red-400">{{ formatPrice(cartStore.totalPrice) }}</span>
              </div>
            </div>

            <!-- Coupon Section -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Mã giảm giá
              </h3>
              <div class="flex space-x-3">
                <input
                  v-model="couponCode"
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  @click="applyCoupon"
                  :disabled="!couponCode || cartStore.isUpdating"
                  class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <router-link
                to="/checkout"
                class="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              >
                Tiến hành thanh toán
              </router-link>
              
              <router-link
                to="/"
                class="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              >
                Tiếp tục mua sắm
              </router-link>
              
              <button
                @click="confirmClearCart"
                :disabled="cartStore.isUpdating"
                class="w-full inline-flex justify-center items-center px-6 py-3 border border-red-300 text-base font-medium rounded-lg text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Xóa toàn bộ giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :isOpen="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :type="confirmModal.type"
      :confirmText="confirmModal.confirmText"
      :isLoading="confirmModal.isLoading"
      @confirm="handleConfirm"
      @cancel="cancelConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const cartStore = useCartStore()
const toastStore = useToastStore()

const couponCode = ref('')

// Confirm modal state
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  type: 'warning',
  confirmText: 'Xác nhận',
  isLoading: false,
  action: null,
  params: null
})

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

// Update quantity
const updateQuantity = async (bookId, newQuantity) => {
  if (newQuantity < 1) return
  
  try {
    const result = await cartStore.updateQuantity(bookId, newQuantity)
    if (result.success) {
      toastStore.success('Cập nhật số lượng thành công')
    } else {
      toastStore.error(result.error || 'Không thể cập nhật số lượng')
    }
  } catch (error) {
    toastStore.error('Không thể cập nhật số lượng')
  }
}

const increaseQuantity = async (bookId) => {
  const item = cartStore.cartItems.find(item => item.book_id === bookId)
  if (item) {
    await updateQuantity(bookId, item.quantity + 1)
  }
}

const decreaseQuantity = async (bookId) => {
  const item = cartStore.cartItems.find(item => item.book_id === bookId)
  if (item && item.quantity > 1) {
    await updateQuantity(bookId, item.quantity - 1)
  }
}

// Remove from cart
const removeFromCart = async (bookId) => {
  try {
    const result = await cartStore.removeFromCart(bookId)
    if (result.success) {
      toastStore.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } else {
      toastStore.error(result.error || 'Không thể xóa sản phẩm')
    }
  } catch (error) {
    toastStore.error('Không thể xóa sản phẩm')
  }
}

// Confirm remove item
const confirmRemoveItem = (bookId, bookTitle) => {
  confirmModal.value = {
    isOpen: true,
    title: 'Xóa sản phẩm',
    message: `Bạn có chắc chắn muốn xóa "${bookTitle}" khỏi giỏ hàng?`,
    type: 'danger',
    confirmText: 'Xóa',
    isLoading: false,
    action: 'removeItem',
    params: bookId
  }
}

// Clear cart
const clearCart = async () => {
  try {
    const result = await cartStore.clearCart()
    if (result.success) {
      toastStore.success('Đã xóa toàn bộ giỏ hàng')
    } else {
      toastStore.error(result.error || 'Không thể xóa giỏ hàng')
    }
  } catch (error) {
    toastStore.error('Không thể xóa giỏ hàng')
  }
}

// Confirm clear cart
const confirmClearCart = () => {
  confirmModal.value = {
    isOpen: true,
    title: 'Xóa toàn bộ giỏ hàng',
    message: `Bạn có chắc chắn muốn xóa toàn bộ ${cartStore.totalItems} sản phẩm trong giỏ hàng? Hành động này không thể hoàn tác.`,
    type: 'danger',
    confirmText: 'Xóa toàn bộ',
    isLoading: false,
    action: 'clearCart',
    params: null
  }
}

// Handle confirm modal
const handleConfirm = async () => {
  confirmModal.value.isLoading = true
  
  try {
    if (confirmModal.value.action === 'removeItem') {
      await removeFromCart(confirmModal.value.params)
    } else if (confirmModal.value.action === 'clearCart') {
      await clearCart()
    }
  } finally {
    confirmModal.value.isLoading = false
    confirmModal.value.isOpen = false
  }
}

// Cancel confirm modal
const cancelConfirm = () => {
  confirmModal.value.isOpen = false
}

// Apply coupon
const applyCoupon = async () => {
  try {
    const result = await cartStore.applyCoupon(couponCode.value)
    if (result.success) {
      toastStore.success('Áp dụng mã giảm giá thành công')
      couponCode.value = ''
    } else {
      toastStore.error(result.error || 'Mã giảm giá không hợp lệ')
    }
  } catch (error) {
    toastStore.error('Mã giảm giá không hợp lệ')
  }
}

// Pagination
const cartCurrentPage = ref(1)
const cartItemsPerPage = ref(3)

const cartTotalPages = computed(() => {
  return Math.ceil(cartStore.cartItems.length / cartItemsPerPage.value)
})

const paginatedCartItems = computed(() => {
  const start = (cartCurrentPage.value - 1) * cartItemsPerPage.value
  const end = start + cartItemsPerPage.value
  return cartStore.cartItems.slice(start, end)
})

const changeCartPage = (page) => {
  if (page >= 1 && page <= cartTotalPages.value) {
    cartCurrentPage.value = page
  }
}

// Fetch cart on mount
onMounted(async () => {
  try {
    await cartStore.fetchCart()
  } catch (error) {
    console.error('Error loading cart:', error)
  }
})
</script>
