<template>
  <div class="min-h-screen py-8 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="book" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Book Image -->
        <div class="space-y-4">
          <img 
            :src="book.image_url" 
            :alt="book.title"
            class="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
          
          <!-- Book Actions -->
          <div class="flex gap-4 justify-center">
            <button 
              @click="addToCart"
              :disabled="!book.is_bn || isInCart(book.book_id)"
              class="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed disabled:dark:bg-gray-600"
            >
              <ShoppingCart class="h-5 w-5 mr-2" />
              {{ isInCart(book.book_id) ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng' }}
            </button>
            <button class="btn-outline">
              <Heart class="h-5 w-5 mr-2" />
              Yêu thích
            </button>
          </div>
        </div>

        <!-- Book Info -->
        <div class="space-y-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ book.title }}</h1>
            <p class="text-xl text-gray-600 dark:text-gray-300 mb-4">Tác giả: {{ book.author.name }}</p>
            
            <div class="flex items-center mb-4">
              <div class="flex items-center mr-4">
                <Star class="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span class="text-lg font-semibold ml-1 text-gray-900 dark:text-white">{{ book.rating }}</span>
              </div>
              <span class="text-gray-500 dark:text-gray-400">({{ book.count_review }} đánh giá)</span>
            </div>

            <div class="flex items-center space-x-4 mb-4">
              <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ formatPrice(book.price) }}</span>
              <span v-if="book.originalPrice > book.price" class="text-xl text-gray-500 dark:text-gray-400 line-through">
                {{ formatPrice(book.originalPrice) }}
              </span>
              <span v-if="book.originalPrice > book.price" class="bg-red-500 text-white px-2 py-1 rounded text-sm">
                {{ Math.round((1 - book.price / book.originalPrice) * 100) }}% OFF
              </span>
            </div>

            <div class="flex items-center space-x-4 mb-6">
              <span class="text-gray-600 dark:text-gray-300">Danh mục:</span>
              <span class="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm">
                {{ book.category.name }}
              </span>
            </div>

            <div class="flex items-center space-x-4 mb-6">
              <span class="text-gray-600 dark:text-gray-300">Tình trạng:</span>
              <span :class="[
                'px-3 py-1 rounded-full text-sm',
                book.is_bn ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              ]">
                {{ book.is_bn ? `Còn ${book.quantity} cuốn` : 'Hết hàng' }}
              </span>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div v-if="book.isBn" class="flex items-center space-x-4">
            <span class="text-gray-600 dark:text-gray-300">Số lượng:</span>
            <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              <button 
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
                class="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                <Minus class="h-4 w-4" />
              </button>
              <span class="px-4 py-1 border-x border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">{{ quantity }}</span>
              <button 
                @click="increaseQuantity"
                :disabled="quantity >= book.quantity"
                class="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                <Plus class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Mô tả sách</h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ book.description }}</p>
          </div>

          <!-- Book Details -->
          <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Thông tin chi tiết</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="text-gray-600 dark:text-gray-300">Tác giả:</span>
                <span class="font-medium ml-2 text-gray-900 dark:text-white">{{ book.author.name }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-300">Danh mục:</span>
                <span class="font-medium ml-2 text-gray-900 dark:text-white">{{ book.category.name }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-300">Đánh giá:</span>
                <span class="font-medium ml-2 text-gray-900 dark:text-white">{{ book.rating }}/5 ({{ book.reviews }} đánh giá)</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-300">Tình trạng:</span>
                <span class="font-medium ml-2 text-gray-900 dark:text-white">{{ book.is_bn ? 'Còn hàng' : 'Hết hàng' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div v-if="book" class="mt-12">
        <div class="max-w-4xl mx-auto">
          <ReviewsContainer :book-id="book.book_id" />
        </div>
      </div>

      <!-- Book not found -->
      <div v-else class="text-center py-12">
        <BookOpen class="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Không tìm thấy sách
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <router-link to="/" class="btn-primary">
          Về trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ShoppingCart, Heart, Star, Minus, Plus, BookOpen } from 'lucide-vue-next'
import { useBookStore } from '@/stores/bookStore'
import { useCartStore } from '@/stores/cartStore'
import ReviewsContainer from '@/components/reviews/ReviewsContainer.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const bookStore = useBookStore()
const cartStore = useCartStore()

const quantity = ref(1)

const book = computed(() => bookStore.getBookById(props.id))

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const isInCart = (bookId) => {
  return cartStore.isInCart(bookId)
}

const addToCart = () => {
  if (book.value) {
    cartStore.addToCart(book.value, quantity.value)
  }
}

const increaseQuantity = () => {
  if (book.value && quantity.value < book.value.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}
</script>
