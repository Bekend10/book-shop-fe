<template>
  <div class="review-form-section">
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Viết đánh giá của bạn
      </h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Rating -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Đánh giá *
          </label>
          <div class="flex items-center gap-1">
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              @click="setRating(i)"
              @mouseover="hoverRating = i"
              @mouseleave="hoverRating = 0"
              class="focus:outline-none"
            >
              <Star 
                :class="[
                  'w-8 h-8 transition-colors',
                  (hoverRating >= i || rating >= i) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300 hover:text-yellow-300'
                ]"
              />
            </button>
            <span v-if="rating > 0" class="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {{ getRatingText(rating) }}
            </span>
          </div>
          <p v-if="errors.rating" class="text-red-500 text-sm mt-1">{{ errors.rating }}</p>
        </div>

        <!-- Review Content -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nội dung đánh giá *
          </label>
          <textarea
            v-model="content"
            rows="4"
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :class="{ 'border-red-500': errors.content }"
          ></textarea>
          <p v-if="errors.content" class="text-red-500 text-sm mt-1">{{ errors.content }}</p>
        </div>

        <!-- Image Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hình ảnh (tùy chọn)
          </label>
          <div class="flex items-center gap-4">
            <label class="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                @change="handleImageChange"
                class="hidden"
              />
              <div class="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Upload class="w-5 h-5" />
                <span class="text-sm">Chọn hình ảnh</span>
              </div>
            </label>
            
            <!-- Image Preview -->
            <div v-if="imagePreview" class="relative">
              <img 
                :src="imagePreview" 
                alt="Preview"
                class="w-20 h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                @click="removeImage"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex items-center justify-between pt-4">
          <button
            type="button"
            @click="resetForm"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang gửi...
            </span>
            <span v-else>Gửi đánh giá</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Star, Upload, X } from 'lucide-vue-next'
import { useReviewStore } from '@/stores/reviewStore'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({
  bookId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['review-created'])

const reviewStore = useReviewStore()
const toastStore = useToastStore()

// Form data
const rating = ref(0)
const hoverRating = ref(0)
const content = ref('')
const image = ref(null)
const imagePreview = ref(null)
const isSubmitting = ref(false)

// Form validation
const errors = reactive({
  rating: '',
  content: ''
})

const getRatingText = (rating) => {
  const texts = {
    1: 'Rất tệ',
    2: 'Tệ', 
    3: 'Trung bình',
    4: 'Tốt',
    5: 'Xuất sắc'
  }
  return texts[rating] || ''
}

const setRating = (value) => {
  rating.value = value
  errors.rating = ''
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastStore.error('Kích thước file không được vượt quá 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toastStore.error('Vui lòng chọn file hình ảnh')
      return
    }

    image.value = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  image.value = null
  imagePreview.value = null
}

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  errors.rating = ''
  errors.content = ''

  if (rating.value === 0) {
    errors.rating = 'Vui lòng chọn số sao đánh giá'
    isValid = false
  }

  if (!content.value.trim()) {
    errors.content = 'Vui lòng nhập nội dung đánh giá'
    isValid = false
  } else if (content.value.trim().length < 10) {
    errors.content = 'Nội dung đánh giá phải có ít nhất 10 ký tự'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const reviewData = {
      book_id: props.bookId,
      rating: rating.value,
      content: content.value.trim(),
      image: image.value
    }

    const result = await reviewStore.createReview(reviewData)

    if (result.success) {
      toastStore.success('Đánh giá của bạn đã được gửi thành công!')
      resetForm()
      emit('review-created')
    } else {
      toastStore.error(result.error || 'Có lỗi xảy ra khi gửi đánh giá')
    }
  } catch (error) {
    console.error('Error submitting review:', error)
    toastStore.error('Có lỗi xảy ra khi gửi đánh giá')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  rating.value = 0
  hoverRating.value = 0
  content.value = ''
  image.value = null
  imagePreview.value = null
  errors.rating = ''
  errors.content = ''
}
</script>

<style scoped>
.review-form-section {
  margin-top: 2rem;
}
</style>
