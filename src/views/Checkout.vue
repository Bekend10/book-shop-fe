<template>
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

      <div v-if="items.length === 0" class="text-center py-12">
        <ShoppingCart class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-gray-600 mb-2">
          Giỏ hàng trống
        </h2>
        <p class="text-gray-500 mb-6">
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
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
            
            <form @submit.prevent="processOrder" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input 
                    v-model="orderForm.fullName"
                    type="text" 
                    required
                    class="input-field"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input 
                    v-model="orderForm.phone"
                    type="tel" 
                    required
                    class="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input 
                  v-model="orderForm.email"
                  type="email" 
                  required
                  class="input-field"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ giao hàng *
                </label>
                <textarea 
                  v-model="orderForm.address"
                  rows="3"
                  required
                  class="input-field"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
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
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
            
            <div class="space-y-3">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  v-model="orderForm.paymentMethod"
                  type="radio" 
                  value="cod"
                  class="text-primary-600"
                />
                <div class="flex items-center space-x-2">
                  <Truck class="h-5 w-5 text-gray-600" />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </div>
              </label>
              
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  v-model="orderForm.paymentMethod"
                  type="radio" 
                  value="transfer"
                  class="text-primary-600"
                />
                <div class="flex items-center space-x-2">
                  <CreditCard class="h-5 w-5 text-gray-600" />
                  <span>Chuyển khoản ngân hàng</span>
                </div>
              </label>
              
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  v-model="orderForm.paymentMethod"
                  type="radio" 
                  value="ewallet"
                  class="text-primary-600"
                />
                <div class="flex items-center space-x-2">
                  <Smartphone class="h-5 w-5 text-gray-600" />
                  <span>Ví điện tử (Momo, ZaloPay)</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="space-y-6">
          <!-- Order Items -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
            
            <div class="space-y-4">
              <div 
                v-for="item in items" 
                :key="item.id"
                class="flex items-center space-x-4"
              >
                <img 
                  :src="item.image" 
                  :alt="item.title"
                  class="w-16 h-20 object-cover rounded"
                />
                <div class="flex-1">
                  <h3 class="font-medium">{{ item.title }}</h3>
                  <p class="text-sm text-gray-600">{{ item.author }}</p>
                  <p class="text-sm text-gray-600">Số lượng: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="font-medium">{{ formatPrice(item.price * item.quantity) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Total -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold mb-4">Tổng cộng</h2>
            
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Tạm tính:</span>
                <span>{{ formatPrice(totalPrice) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between text-lg font-bold">
                  <span>Tổng tiền:</span>
                  <span class="text-primary-600">{{ formatPrice(totalPrice) }}</span>
                </div>
              </div>
            </div>
            
            <button 
              @click="processOrder"
              :disabled="!isFormValid"
              class="w-full btn-primary mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Check class="h-5 w-5 mr-2" />
              Đặt hàng
            </button>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check class="h-8 w-8 text-green-600" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">
              Đặt hàng thành công!
            </h3>
            <p class="text-gray-600 mb-6">
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Truck, CreditCard, Smartphone, Check } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'

const cartStore = useCartStore()
const router = useRouter()

const items = computed(() => cartStore.items)
const totalPrice = computed(() => cartStore.totalPrice)

const showSuccessModal = ref(false)

const orderForm = reactive({
  fullName: '',
  phone: '',
  email: '',
  address: '',
  note: '',
  paymentMethod: 'cod'
})

const isFormValid = computed(() => {
  return orderForm.fullName && 
         orderForm.phone && 
         orderForm.email && 
         orderForm.address && 
         orderForm.paymentMethod
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const processOrder = () => {
  if (!isFormValid.value) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc')
    return
  }

  // Simulate order processing
  setTimeout(() => {
    showSuccessModal.value = true
    cartStore.clearCart()
  }, 1000)
}

const closeModal = () => {
  showSuccessModal.value = false
  router.push('/')
}
</script>
