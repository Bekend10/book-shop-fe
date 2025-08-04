<template>
  <div class="reviews-section">
    <div class="reviews-header">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Đánh giá sản phẩm
      </h3>
      
      <!-- Rating Summary -->
      <div v-if="reviews.length > 0" class="rating-summary mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-500">{{ averageRating }}</div>
            <div class="flex items-center justify-center mb-1">
              <Star 
                v-for="i in 5" 
                :key="i"
                :class="[
                  'w-5 h-5',
                  i <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                ]"
              />
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ reviewCount }} đánh giá
            </div>
          </div>
          
          <!-- Rating Distribution -->
          <div class="flex-1 ml-6">
            <div v-for="star in 5" :key="star" class="flex items-center gap-2 mb-1">
              <span class="text-sm w-2">{{ 6 - star }}</span>
              <Star class="w-3 h-3 text-yellow-400 fill-current" />
              <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-yellow-400 h-2 rounded-full"
                  :style="{ width: getRatingPercentage(6 - star) + '%' }"
                ></div>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400 w-8">
                {{ getRatingCount(6 - star) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="reviews-list space-y-6">
      <div 
        v-for="review in reviews" 
        :key="review.book_review_id"
        class="review-item p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div class="flex items-start gap-4">
          <!-- User Avatar -->
          <div class="flex-shrink-0">
            <img 
              :src="review.user.profile_image"
              :alt="review.user.full_name"
              class="w-10 h-10 rounded-full object-cover"
            />
          </div>
          
          <!-- Review Content -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {{ review.user.full_name }}
                </h4>
                <div class="flex items-center gap-2">
                  <div class="flex items-center">
                    <Star 
                      v-for="i in 5" 
                      :key="i"
                      :class="[
                        'w-4 h-4',
                        i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      ]"
                    />
                  </div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatDate(review.created_at) }}
                  </span>
                </div>
              </div>
            </div>
            
            <p class="text-gray-700 dark:text-gray-300 mb-3">
              {{ review.content }}
            </p>
            
            <!-- Review Image -->
            <div v-if="review.image" class="mb-3">
              <img 
                :src="review.image"
                alt="Review image"
                class="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                @click="openImageModal(review.image)"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div 
        v-if="reviews.length === 0" 
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <MessageSquare class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Chưa có đánh giá nào cho sản phẩm này</p>
      </div>
    </div>

    <!-- Image Modal -->
    <div 
      v-if="selectedImage" 
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="closeImageModal"
    >
      <div class="relative max-w-4xl max-h-full p-4">
        <img 
          :src="selectedImage" 
          alt="Review image"
          class="max-w-full max-h-full object-contain"
        />
        <button 
          @click="closeImageModal"
          class="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
        >
          <X class="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Star, MessageSquare, X } from 'lucide-vue-next'

const props = defineProps({
  reviews: {
    type: Array,
    default: () => []
  }
})

const selectedImage = ref(null)

const reviewCount = computed(() => props.reviews.length)

const averageRating = computed(() => {
  if (props.reviews.length === 0) return 0
  const total = props.reviews.reduce((sum, review) => sum + review.rating, 0)
  return (total / props.reviews.length).toFixed(1)
})

const getRatingCount = (rating) => {
  return props.reviews.filter(review => review.rating === rating).length
}

const getRatingPercentage = (rating) => {
  if (props.reviews.length === 0) return 0
  return (getRatingCount(rating) / props.reviews.length) * 100
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const openImageModal = (image) => {
  selectedImage.value = image
}

const closeImageModal = () => {
  selectedImage.value = null
}
</script>

<style scoped>
.review-item {
  transition: shadow 0.2s ease;
}

.review-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:global(.dark) .review-item:hover {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}
</style>
