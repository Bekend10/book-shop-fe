<template>
  <div class="card hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
    <div class="relative">
      <img :src="book.image" :alt="book.title" class="w-full h-48 sm:h-56 md:h-64 object-cover" />
      <div v-if="!book.inStock" class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
        Hết hàng
      </div>
      <div v-if="book.originalPrice > book.price"
        class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
        {{ Math.round((1 - book.price / book.originalPrice) * 100) }}% OFF
      </div>
    </div>

    <div class="p-3 sm:p-4 flex flex-col flex-1">
      <h3 class="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{{ book.title }}</h3>
      <p class="mb-2 text-sm">{{ book.author }}</p>
      <p class="text-primary-600 dark:text-primary-400 text-xs sm:text-sm mb-2">{{ book.category }}</p>

      <div class="flex items-center mb-2 text-sm">
        <div class="flex items-center">
          <Star class="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
          <span class="text-xs sm:text-sm  ml-1">{{ book.rating }}</span>
        </div>
        <span class="text-xs sm:text-sm ml-2">({{ book.reviews }})</span>
      </div>

      <div class="flex items-center justify-between mb-3 sm:mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
          <span class="text-base sm:text-lg font-bold">{{ formatPrice(book.price) }}</span>
          <span v-if="book.originalPrice > book.price" class="text-xs sm:text-sm original-price">
            {{ formatPrice(book.originalPrice) }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-2 mt-auto">
        <router-link :to="`/book/${book.id}`" class="w-full btn-outline text-center py-2 px-3 text-xs sm:text-sm">
          Xem chi tiết
        </router-link>
        <button @click="addToCart" :disabled="!book.inStock || isInCart(book.id)"
          class="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed disabled:dark:bg-gray-600 py-2 px-3 text-xs sm:text-sm flex items-center justify-center">
          <ShoppingCart class="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span class="hidden sm:inline">{{ isInCart(book.id) ? 'Đã thêm' : 'Thêm vào giỏ' }}</span>
          <span class="sm:hidden">{{ isInCart(book.id) ? 'Đã thêm' : 'Thêm' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star, ShoppingCart } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const isInCart = (bookId) => {
  return cartStore.isInCart(bookId)
}

const addToCart = () => {
  cartStore.addToCart(props.book)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.original-price {
  text-decoration: line-through;
}

/* Dark mode styles */
:global(.dark) .card {
  background-color: #1f2937;
  border-color: #374151;
}

:global(.dark) .card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
}
</style>
