
<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ isAdd ? 'Thêm sách mới' : 'Chỉnh sửa sách' }}
        </h3>
        <button @click="$emit('close')"
          class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <slot name="close-icon">×</slot>
        </button>
      </div>

      <form @submit.prevent="$emit('save')" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên sách *
            </label>
            <input v-model="bookForm.title" type="text" required class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tác giả *
            </label>
            <select v-model="bookForm.author_id" required class="input-field">
              <option disabled value="">Chọn tác giả</option>
              <option v-for="author in authors.filter(a => a.name !== 'Tất cả')" :key="author.author_id ?? 'null'" :value="author.id">
                {{ author.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giá bán *
            </label>
            <input v-model.number="bookForm.price" type="number" required class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giá gốc
            </label>
            <input v-model.number="bookForm.price_origin" type="number" class="input-field" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Danh mục *
            </label>
            <select v-model="bookForm.category_id" required class="input-field">
              <option disabled value="">Chọn danh mục</option>
              <option v-for="category in categories.filter(c => c.name !== 'Tất cả')" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số lượng *
            </label>
            <input v-model.number="bookForm.stock" type="number" required min="0" class="input-field" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nhà xuất bản
            </label>
            <input v-model="bookForm.publisher" type="text" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Năm xuất bản
            </label>
            <input v-model="bookForm.publisher_year" type="date" class="input-field" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngôn ngữ
            </label>
            <input v-model="bookForm.language" type="text" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số trang
            </label>
            <input v-model="bookForm.number_of_page" type="number" class="input-field" />
          </div>
        </div>
        <!-- Image Upload -->
        <ImageUploader v-model="bookForm.image" />
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mô tả sách
          </label>
          <textarea v-model="bookForm.description" rows="4" class="input-field"></textarea>
        </div>
        <div class="flex items-center">
          <input v-model="bookForm.isBn" type="checkbox"
            class="h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:bg-gray-700" />
          <label class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Còn hàng
          </label>
        </div>
        <div class="flex justify-end space-x-4 pt-6">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            Hủy
          </button>
          <button type="submit" class="btn-primary">
            {{ isAdd ? 'Thêm sách' : 'Cập nhật' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import ImageUploader from '@/components/admin/ImageUploader.vue'
const props = defineProps({
  show: Boolean,
  isAdd: Boolean,
  book: Object,
  bookForm: Object,
  categories: [Array, Object],
  authors: [Array, Object]
})
const emit = defineEmits(['save', 'close'])
const bookForm = props.bookForm
const categories = props.categories
const authors = props.authors
const isAdd = props.isAdd
const show = props.show
</script>
