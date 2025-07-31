<template>
  <!-- Compact Add to Cart for Book Cards -->
  <div class="w-full">
    <!-- Simple Add to Cart Button -->
    <button
      v-if="!isInCart && !isOutOfStock"
      @click="handleAddToCart"
      :disabled="cartStore.isUpdating || isOutOfStock"
      class="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
    >
      <ShoppingCart class="w-4 h-4 mr-2" />
      <span v-if="!cartStore.isUpdating">
        Thêm vào giỏ
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
      class="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
    >
      <ShoppingCart class="w-4 h-4 mr-2" />
      Hết hàng
    </button>

    <!-- Already in Cart - Show success state -->
    <div v-else class="w-full">
      <div class="w-full inline-flex items-center justify-center px-3 py-2 border border-green-300 text-sm font-medium rounded-lg text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
        <Check class="w-4 h-4 mr-2" />
        Đã thêm vào giỏ
      </div>
      
      <!-- Action buttons -->
      <div class="mt-2 flex space-x-2">
        <router-link
          to="/cart"
          class="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
        >
          <Eye class="w-3 h-3 mr-1" />
          Xem giỏ
        </router-link>
        
        <button
          @click="handleAddToCart"
          :disabled="cartStore.isUpdating || isOutOfStock"
          class="flex-1 inline-flex items-center justify-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          <Plus class="w-3 h-3 mr-1" />
          Thêm nữa
        </button>
      </div>
    </div>

    <!-- Stock Warning -->
    <div v-if="book.quantity <= 5 && book.quantity > 0" class="mt-1 text-center text-xs text-amber-600 dark:text-amber-400">
      Chỉ còn {{ book.quantity }} cuốn
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { ShoppingCart, Plus, Eye, Check } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({
  book: {
    type: Object,
    required: true
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

const handleAddToCart = async () => {
  try {
    const result = await cartStore.addToCart(props.book, quantity.value)
    
    if (result.success) {
      toastStore.success(result.msg || 'Đã thêm vào giỏ hàng')
      emit('added-to-cart', { book: props.book, quantity: quantity.value })
    } else {
      toastStore.error(result.msg || 'Không thể thêm vào giỏ hàng')
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    toastStore.error('Đã có lỗi xảy ra khi thêm vào giỏ hàng')
  }
}
</script>
