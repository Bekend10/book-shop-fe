<template>
  <div class="relative">
    <!-- Cart Button -->
    <button
      @click="toggleCart"
      class="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
    >
      <ShoppingCart class="w-6 h-6" />
      
      <!-- Cart Badge -->
      <span
        v-if="totalItems > 0"
        class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full"
      >
        {{ totalItems > 99 ? '99+' : totalItems }}
      </span>
    </button>

    <!-- Mini Cart Dropdown -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
      >
        <!-- Cart Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Giỏ hàng ({{ totalItems }})
            </h3>
            <button
              @click="closeCart"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="max-h-80 overflow-y-auto">
          <!-- Empty State -->
          <div v-if="cartItems.length === 0" class="p-6 text-center">
            <ShoppingCart class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Giỏ hàng trống
            </p>
            <router-link
              to="/"
              @click="closeCart"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Tiếp tục mua sắm
            </router-link>
          </div>

          <!-- Cart Items List -->
          <div v-else class="p-4 space-y-4">
            <div
              v-for="item in cartItems.slice(0, 3)"
              :key="item.book_id"
              class="flex items-center space-x-3"
            >
              <!-- Book Image -->
              <img
                :src="item.book.image_url || '/placeholder-book.jpg'"
                :alt="item.book.title"
                class="w-12 h-16 object-cover rounded"
                @error="$event.target.src='/placeholder-book.jpg'"
              />

              <!-- Book Info -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ item.book.title }}
                </h4>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ item.quantity }} × {{ formatPrice(item.book.price) }}
                </p>
              </div>

              <!-- Remove Button -->
              <button
                @click="removeFromCart(item.book_id)"
                class="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Show More -->
            <div v-if="cartItems.length > 3" class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                và {{ cartItems.length - 3 }} sản phẩm khác...
              </p>
            </div>
          </div>
        </div>

        <!-- Cart Footer -->
        <div v-if="cartItems.length > 0" class="p-4 border-t border-gray-200 dark:border-gray-700">
          <!-- Total -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              Tổng cộng:
            </span>
            <span class="text-lg font-bold text-red-600 dark:text-red-400">
              {{ formatPrice(totalPrice) }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2">
            <router-link
              to="/cart"
              @click="closeCart"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Xem giỏ hàng
            </router-link>
            
            <router-link
              to="/checkout"
              @click="closeCart"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Thanh toán
            </router-link>
          </div>
        </div>
      </div>
    </transition>

    <!-- Overlay -->
    <div
      v-if="isOpen"
      @click="closeCart"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ShoppingCart, X, Trash2 } from 'lucide-vue-next'
import { useCart } from '@/composables/useCart'

const { 
  cartItems, 
  totalItems, 
  totalPrice, 
  removeFromCart, 
  formatPrice 
} = useCart()

const isOpen = ref(false)

const toggleCart = () => {
  isOpen.value = !isOpen.value
}

const closeCart = () => {
  isOpen.value = false
}

// Close cart when clicking outside
const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.relative')) {
    closeCart()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
