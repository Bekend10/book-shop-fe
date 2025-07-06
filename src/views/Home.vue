<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="hero-section py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">Khám phá thế giới tri thức</h1>
        <p class="text-xl md:text-2xl mb-8 text-primary-100">Hàng nghìn cuốn sách hay đang chờ bạn khám phá</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="scrollToBooks" class="btn bg-white text-primary-600 hover:bg-gray-100  px-6 py-3 rounded-xl">Khám phá ngay</button>
          <button class="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 py-3 rounded-xl">Tìm hiểu thêm</button>
        </div>
      </div>
    </section>

    <!-- Featured Books -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12">Sách nổi bật</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BookCard v-for="book in featuredBooks" :key="book.id" :book="book" />
        </div>
      </div>
    </section>

    <!-- Category Filter -->
    <section ref="booksSection" class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-8">Danh mục sách</h2>
        <div class="flex flex-wrap justify-center gap-2 mb-8">
          <button
            v-for="category in categories"
            :key="category"
            @click="setCategory(category)"
            :class="['category-button', selectedCategory === category ? 'active' : '']"
          >
            {{ category }}
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <BookCard v-for="book in filteredBooks" :key="book.id" :book="book" />
        </div>
        <div v-if="filteredBooks.length === 0" class="text-center py-12">
          <BookOpen class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-xl font-semibold no-books mb-2">Không tìm thấy sách nào</h3>
          <p class="text-gray-500 dark:text-gray-400">Hãy thử từ khóa khác hoặc chọn danh mục khác</p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 stats-section">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold text-primary-600 mb-2">{{ books.length }}+</div>
            <div class="">Cuốn sách</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary-600 mb-2">10,000+</div>
            <div class="">Khách hàng hài lòng</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-primary-600 mb-2">24/7</div>
            <div class="">Hỗ trợ khách hàng</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BookOpen } from 'lucide-vue-next'
import BookCard from '@/components/BookCard.vue'
import { useBookStore } from '@/stores/bookStore'

const bookStore = useBookStore()
const booksSection = ref(null)
const books = computed(() => bookStore.books)
const categories = computed(() => bookStore.categories)
const selectedCategory = computed(() => bookStore.selectedCategory)
const filteredBooks = computed(() => bookStore.filteredBooks)
const featuredBooks = computed(() => bookStore.featuredBooks)
const setCategory = (category) => bookStore.setCategory(category)
const scrollToBooks = () => booksSection.value?.scrollIntoView({ behavior: 'smooth' })
</script>

<style scoped>
.hero-section {
  background: linear-gradient(to right, #2563eb, #1e40af);
  color: #fff;
}

/* Class-based dark mode */
:global(.dark) .hero-section {
  background: linear-gradient(to right, #1f2937, #172554);
  color: #f9fafb;
}

.category-button {
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.category-button.active {
  background: #2563eb;
  color: #fff;
}

.category-button:not(.active) {
  background: #ffffff;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.category-button:not(.active):hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

/* Class-based dark mode */
:global(.dark) .category-button:not(.active) {
  background: #1f2937;
  color: #d1d5db;
  border-color: #374151;
}

:global(.dark) .category-button:not(.active):hover {
  background: #374151;
  border-color: #4b5563;
}

/* .stats-section {
  background: #eff6ff;
} */

/* Class-based dark mode */
:global(.dark) .stats-section {
  background: #1e293b;
}

:global(.dark) .category-title {
  color: #f3f4f6;
}

.no-books {
  color: #6b7280;
}
/* Class-based dark mode */
:global(.dark) .no-books {
  color: #9ca3af;
}
</style>
