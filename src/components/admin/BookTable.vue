

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
    <div class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Danh sách sách</h2>
    </div>
    <div class="w-full min-w-[600px] md:min-w-0">
      <table class="w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs md:text-sm lg:text-base">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-1 md:px-2 lg:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-8 md:w-10 lg:w-12">
              <input type="checkbox" :checked="selectAll" @change="$emit('select-all')"
                class="h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:bg-gray-700" />
            </th>
            <th class="px-1 md:px-2 lg:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sách</th>
            <th class="px-1 md:px-2 lg:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tác giả</th>
            <th class="px-1 md:px-2 lg:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Danh mục</th>
            <th class="px-1 md:px-2 lg:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giá</th>
            <th class="px-1 md:px-2 lg:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tồn kho</th>
            <th class="px-1 md:px-2 lg:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
            <th class="px-1 md:px-2 lg:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="book in books" :key="book.book_id">
            <td class="px-1 md:px-2 lg:px-4 py-2 md:py-3 whitespace-nowrap w-8 md:w-10 lg:w-12">
              <input type="checkbox" :value="book.book_id" :checked="selectedBooks.includes(book.book_id)"
                @change="onSelect(book.book_id, $event)"
                class="h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:bg-gray-700" />
            </td>
            <td class="px-1 md:px-2 lg:px-4 py-2 md:py-3 whitespace-nowrap">
              <div class="flex items-center min-w-0">
                <img :src="book.image_url" :alt="book.title" class="w-8 h-12 md:w-10 md:h-14 lg:w-12 lg:h-16 object-cover rounded mr-1 md:mr-2 lg:mr-4 flex-shrink-0">
                <div class="min-w-0">
                  <div class="truncate text-[11px] md:text-xs lg:text-sm font-medium text-gray-900 dark:text-white">{{ book.title }}</div>
                  <div class="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{{ book.rating }}/5 ({{ book.count_review }} đánh giá)</div>
                </div>
              </div>
            </td>
            <td class="px-1 md:px-2 lg:px-4 py-2 md:py-3 whitespace-nowrap text-[11px] md:text-xs lg:text-sm text-gray-900 dark:text-white">
              {{ book.author?.name }}
            </td>
            <td class="px-1 md:px-2 lg:px-4 py-2 md:py-3 whitespace-nowrap">
              <span class="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full text-[10px] md:text-xs">
                {{ book.category?.name }}
              </span>
            </td>
            <td class="px-1 md:px-2 lg:px-4 py-2 md:py-3 whitespace-nowrap text-[11px] md:text-xs lg:text-sm text-gray-900 dark:text-white">
              <div>{{ formatPrice(book.price) }}</div>
              <div v-if="book.originalPrice > book.price" class="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 line-through">
                {{ formatPrice(book.originalPrice) }}
              </div>
            </td>
            <td class="px-1 md:px-2 lg:px-4 py-2 md:py-3 whitespace-nowrap text-[11px] md:text-xs lg:text-sm text-gray-900 dark:text-white">
              {{ book.quantity }}
            </td>
            <td class="px-1 md:px-2 lg:px-4 py-2 md:py-3 whitespace-nowrap">
              <span :class="[
                'px-2 py-1 rounded-full text-[10px] md:text-xs',
                book.is_bn ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              ]">
                {{ book.is_bn ? 'Còn hàng' : 'Hết hàng' }}
              </span>
            </td>
            <td class="px-1 md:px-2 lg:px-4 py-2 md:py-3 whitespace-nowrap text-[11px] md:text-xs lg:text-sm font-medium">
              <div class="flex space-x-1 md:space-x-2">
                <button @click="$emit('edit', book)" class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
                </button>
                <button @click="$emit('delete', book.book_id)" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  books: { type: Array, required: true },
  selectedBooks: { type: Array, required: true },
  selectAll: { type: Boolean, required: true },
  formatPrice: { type: Function, required: true }
})
const emit = defineEmits(['edit', 'delete', 'select', 'select-all', 'update-select-all'])

function onSelect(bookId, event) {
  let newSelected = [...props.selectedBooks]
  if (event.target.checked) {
    if (!newSelected.includes(bookId)) newSelected.push(bookId)
  } else {
    newSelected = newSelected.filter(id => id !== bookId)
  }
  emit('select', newSelected)
  emit('update-select-all')
}
</script>
