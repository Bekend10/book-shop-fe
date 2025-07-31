<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Quantity Selector -->
    <div v-if="!isOutOfStock" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Số lượng:
      </label>
      <div class="flex items-center justify-center">
        <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
          <button
            @click="decreaseQuantity"
            :disabled="quantity <= 1"
            class="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus class="w-5 h-5" />
          </button>
          
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            :max="book.quantity || 99"
            class="w-20 text-center border-0 bg-transparent text-lg font-medium text-gray-900 dark:text-white focus:ring-0"
          />
          
          <button
            @click="increaseQuantity"
            :disabled="quantity >= (book.quantity || 99)"
            class="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <!-- Stock info -->
      <p class="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">
        Còn lại: {{ book.quantity || 0 }} cuốn
      </p>
    </div>

    <!-- Out of Stock Message -->
    <div v-else class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-center justify-center">
        <svg class="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <div>
          <h3 class="text-lg font-medium text-red-800 dark:text-red-200">Sản phẩm hết hàng</h3>
          <p class="text-sm text-red-600 dark:text-red-400">Rất tiếc, sản phẩm này hiện tại đã hết hàng</p>
        </div>
      </div>
    </div>

    <!-- Add to Cart Button -->
    <div class="space-y-3">
      <button
        v-if="!isInCart && !isOutOfStock"
        @click="handleAddToCart"
        :disabled="cartStore.isUpdating || isOutOfStock"
        class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
      >
        <ShoppingCart class="w-5 h-5 mr-3" />
        <span v-if="!cartStore.isUpdating">
          {{ buttonText }}
        </span>
        <span v-else class="flex items-center">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
          Đang thêm vào giỏ hàng...
        </span>
      </button>

      <!-- Out of Stock Button -->
      <button
        v-else-if="!isInCart && isOutOfStock"
        disabled
        class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
      >
        <ShoppingCart class="w-5 h-5 mr-3" />
        Sản phẩm hết hàng
      </button>

      <!-- Already in Cart -->
      <div v-else class="space-y-3">
        <!-- Success message -->
        <div class="w-full inline-flex items-center justify-center px-6 py-3 border border-green-300 text-base font-medium rounded-lg text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
          <Check class="w-5 h-5 mr-3" />
          Đã có trong giỏ hàng
        </div>
        
        <!-- Action buttons -->
        <div class="grid grid-cols-2 gap-3">
          <router-link
            to="/cart"
            class="inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <Eye class="w-5 h-5 mr-2" />
            Xem giỏ hàng
          </router-link>
          
          <button
            @click="handleAddToCart"
            :disabled="cartStore.isUpdating || isOutOfStock"
            class="inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            <Plus class="w-5 h-5 mr-2" />
            Thêm nữa
          </button>
        </div>
      </div>

      <!-- Stock Warning -->
      <div class="text-center">
        <div v-if="book.quantity <= 5 && book.quantity > 0" class="text-sm text-amber-600 dark:text-amber-400 font-medium">
          ⚠️ Chỉ còn {{ book.quantity }} cuốn
        </div>
        <div v-else-if="book.quantity <= 0" class="text-sm text-red-600 dark:text-red-400 font-medium">
          ❌ Hết hàng
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { ShoppingCart, Minus, Plus, Eye, Check } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  buttonText: {
    type: String,
    default: 'Thêm vào giỏ hàng'
  }
})

const emit = defineEmits(['added-to-cart'])

const cartStore = useCartStore()
const toastStore = useToastStore()

const quantity = ref(1)

const isInCart = computed(() => {
  return cartStore.isInCart(props.book.book_id || props.book.id)
})

const isOutOfStock = computed(() => {
  return !props.book.quantity || props.book.quantity <= 0
})

const increaseQuantity = () => {
  if (quantity.value < (props.book.quantity || 99)) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleAddToCart = async () => {
  try {
    const result = await cartStore.addToCart(props.book, quantity.value)
    
    if (result.success) {
      toastStore.success(result.data.msg || 'Đã thêm vào giỏ hàng')
      emit('added-to-cart', { book: props.book, quantity: quantity.value })
      
      // Reset quantity if not already in cart
      if (!isInCart.value) {
        quantity.value = 1
      }
    } else {
      toastStore.error(result.data.msg || 'Không thể thêm vào giỏ hàng')
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    toastStore.error('Đã có lỗi xảy ra khi thêm vào giỏ hàng')
  }
}
</script>
