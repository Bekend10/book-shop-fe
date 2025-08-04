<template>
  <div class="card hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
    <div class="relative">
      <img :src="book.image_url" :alt="book.title" class="w-full h-48 sm:h-56 md:h-64 object-cover" />
      
      <!-- Out of Stock Badge -->
      <div v-if="!book.quantity || book.quantity <= 0" 
           class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
        Hết hàng
      </div>
      
      <!-- Sale Badge (only show if not out of stock) -->
      <div v-else-if="book.price_origin > book.price"
           class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
        {{ Math.round((1 - book.price / book.price_origin) * 100) }}% OFF
      </div>
      
      <!-- Stock Warning Badge (left side) -->
      <div v-if="book.quantity > 0 && book.quantity <= 5" 
           class="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium">
        Còn {{ book.quantity }} cuốn
      </div>
    </div>

    <div class="p-3 sm:p-4 flex flex-col flex-1">
      <h3 class="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{{ book.title }}</h3>
      <p class="mb-2 text-sm">{{ book.author.name }}</p>
      <p class="text-primary-600 dark:text-primary-400 text-xs sm:text-sm mb-2">{{ book.category.name }}</p>

      <div class="flex items-center mb-2 text-sm">
        <div class="flex items-center">
          <Star class="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
          <span class="text-xs sm:text-sm  ml-1">{{ averageRating }}</span>
        </div>
        <span class="text-xs sm:text-sm ml-2">({{ reviewCount }})</span>
      </div>

      <div class="flex items-center justify-between mb-3 sm:mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
          <span class="text-base sm:text-lg font-bold">{{ formatPrice(book.price) }}</span>
          <span v-if="book.price_origin > book.price" class="text-xs sm:text-sm original-price">
            {{ formatPrice(book.price_origin) }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-2 mt-auto">
        <router-link :to="`/book/${book.book_id}`" class="w-full btn-outline text-center py-2 px-3 text-xs sm:text-sm">
          Xem chi tiết
        </router-link>
        
        <!-- Compact Add to Cart Component -->
        <CompactAddToCartButton 
          :book="book" 
          @added-to-cart="onAddedToCart"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { useReviewStore } from '@/stores/reviewStore'
import CompactAddToCartButton from '@/components/common/CompactAddToCartButton.vue'

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
const reviewStore = useReviewStore()

const averageRating = computed(() => {
  const rating = reviewStore.getAverageRating(props.book.book_id)
  return rating > 0 ? rating : (props.book.rating || 0)
})

const reviewCount = computed(() => {
  const count = reviewStore.getReviewCount(props.book.book_id)
  return count > 0 ? count : (props.book.count_review || 0)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const onAddedToCart = (data) => {
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
