<template>
  <div class="w-full space-y-2">
    <!-- Quantity Selector (if not in cart and showQuantitySelector is true) -->
    <div v-if="!isInCart && showQuantitySelector" class="flex items-center justify-center">
      <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
        <button
          @click="decreaseQuantity"
          :disabled="quantity <= 1"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus class="w-4 h-4" />
        </button>
        
        <input
          v-model.number="quantity"
          type="number"
          min="1"
          :max="book.quantity || 99"
          class="w-16 text-center border-0 bg-transparent text-gray-900 dark:text-white focus:ring-0"
        />
        
        <button
          @click="increaseQuantity"
          :disabled="quantity >= (book.quantity || 99)"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Add to Cart Button -->
    <button
      v-if="!isInCart && !isOutOfStock"
      @click="handleAddToCart"
      :disabled="cartStore.isUpdating || isOutOfStock"
      class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
    >
      <ShoppingCart class="w-4 h-4 mr-2" />
      <span v-if="!cartStore.isUpdating">
        {{ buttonText }}
      </span>
      <span v-else class="flex items-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Đang thêm...
      </span>
    </button>

    <!-- Out of Stock Button -->
    <button
      v-else-if="!isInCart && isOutOfStock"
      disabled
      class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
    >
      <ShoppingCart class="w-4 h-4 mr-2" />
      Hết hàng
    </button>

    <!-- Already in Cart - Stack vertically on small screens -->
    <div v-else class="w-full space-y-2">
      <router-link
        to="/cart"
        class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
      >
        <Eye class="w-4 h-4 mr-2" />
        Xem giỏ hàng
      </router-link>
      
      <button
        @click="handleAddToCart"
        :disabled="cartStore.isUpdating || isOutOfStock"
        class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
      >
        <Plus class="w-4 h-4 mr-2" />
        Thêm nữa
      </button>
    </div>

    <!-- Stock Warning -->
    <div class="text-center text-xs">
      <span v-if="book.quantity <= 5 && book.quantity > 0" class="text-amber-600 dark:text-amber-400">
        Chỉ còn {{ book.quantity }} cuốn
      </span>
      <span v-else-if="book.quantity <= 0" class="text-red-600 dark:text-red-400">
        Hết hàng
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { ShoppingCart, Minus, Plus, Eye } from 'lucide-vue-next'
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
  },
  showQuantitySelector: {
    type: Boolean,
    default: true
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
      toastStore.success(result.message || 'Đã thêm vào giỏ hàng')
      emit('added-to-cart', { book: props.book, quantity: quantity.value })
      
      // Reset quantity if not already in cart
      if (!isInCart.value) {
        quantity.value = 1
      }
    } else {
      toastStore.error(result.error || 'Không thể thêm vào giỏ hàng')
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    toastStore.error('Đã có lỗi xảy ra khi thêm vào giỏ hàng')
  }
}
</script>
