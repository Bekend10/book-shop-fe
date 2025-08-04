<template>
  <div class="reviews-container">
    <!-- Loading State -->
    <div v-if="reviewStore.isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
    
    <!-- Reviews Content -->
    <div v-else>
      <ReviewsList :reviews="bookReviews" />
      
      <!-- Review Form for authenticated users -->
      <ReviewForm 
        v-if="authStore.isAuthenticated"
        :book-id="bookId" 
        @review-created="handleReviewCreated"
      />
      
      <!-- Login prompt for non-authenticated users -->
      <div 
        v-else 
        class="mt-8 p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center"
      >
        <MessageSquare class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Đăng nhập để viết đánh giá
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Bạn cần đăng nhập để có thể chia sẻ đánh giá về sản phẩm này
        </p>
        <router-link 
          to="/login" 
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Đăng nhập ngay
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { MessageSquare } from 'lucide-vue-next'
import { useReviewStore } from '@/stores/reviewStore'
import { useAuthStore } from '@/stores/authStore'
import ReviewsList from './ReviewsList.vue'
import ReviewForm from './ReviewForm.vue'

const props = defineProps({
  bookId: {
    type: Number,
    required: true
  }
})

const reviewStore = useReviewStore()
const authStore = useAuthStore()

const bookReviews = computed(() => {
  return reviewStore.getReviewsByBookId(props.bookId)
})

const handleReviewCreated = () => {
  // Reviews will be automatically refreshed by the ReviewForm component
}

onMounted(async () => {
  if (reviewStore.reviews.length === 0) {
    await reviewStore.fetchAllReviews()
  }
})
</script>
