<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="hero-section py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">Khám phá thế giới tri thức</h1>
        <p class="text-xl md:text-2xl mb-8 text-primary-100">Hàng nghìn cuốn sách hay đang chờ bạn khám phá</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="scrollToBooks"
            class="btn bg-white text-primary-600 hover:bg-gray-100  px-6 py-3 rounded-xl">Khám phá ngay</button>
          <button
            class="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 py-3 rounded-xl">Tìm
            hiểu thêm</button>
        </div>
      </div>
    </section>

    <!-- Featured Books -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold">Sách nổi bật</h2>
          <hr class="border-gray-300 dark:border-gray-600 my-6" />
        </div>
        
        <!-- Loading state -->
        <div v-if="bookStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="n in 4" :key="n" class="animate-pulse">
            <div class="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
        
        <!-- Featured books content -->
        <div v-else>
          <!-- Featured Books Carousel -->
          <div class="featured-carousel-container" 
               @mouseenter="pauseFeaturedAutoSlide" 
               @mouseleave="resumeFeaturedAutoSlide">
            
            <!-- Navigation Buttons -->
            <button v-if="totalFeaturedPages > 1" 
                    @click="prevFeaturedPage" 
                    class="carousel-btn carousel-btn-prev">
              <ChevronLeft class="w-6 h-6" />
            </button>
            
            <button v-if="totalFeaturedPages > 1" 
                    @click="nextFeaturedPage" 
                    class="carousel-btn carousel-btn-next">
              <ChevronRight class="w-6 h-6" />
            </button>
            
            <!-- Featured Books Grid with Animation -->
            <div class="featured-carousel-wrapper">
              <div class="featured-carousel-track" 
                   :style="{ transform: `translateX(-${currentFeaturedPage * 100}%)` }">
                <div v-for="page in totalFeaturedPages" 
                     :key="page" 
                     class="featured-carousel-page">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <BookCard v-for="book in getPageFeaturedBooks(page - 1)" 
                              :key="book.book_id" 
                              :book="book" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Pagination Dots -->
            <div v-if="totalFeaturedPages > 1" class="carousel-pagination">
              <button v-for="page in totalFeaturedPages" 
                      :key="page"
                      @click="goToFeaturedPage(page - 1)"
                      :class="[
                        'pagination-dot',
                        currentFeaturedPage === page - 1 ? 'active' : ''
                      ]">
              </button>
            </div>
            
            <!-- Auto-slide controls -->
            <div v-if="totalFeaturedPages > 1" class="carousel-controls">
              <button @click="isFeaturedAutoSliding ? pauseFeaturedAutoSlide() : resumeFeaturedAutoSlide()" 
                      class="auto-slide-btn"
                      :title="isFeaturedAutoSliding ? 'Tạm dừng tự động' : 'Tiếp tục tự động'">
                <Pause v-if="isFeaturedAutoSliding" class="w-4 h-4" />
                <Play v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <!-- Empty state when no featured books -->
          <div v-if="featuredBooks.length === 0" class="text-center py-12">
            <BookOpen class="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold mb-2">Chưa có sách nổi bật</h3>
            <p class="text-gray-500 dark:text-gray-400">Hệ thống đang cập nhật sách nổi bật</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Category Filter -->
    <section ref="booksSection" class="category-section py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="category-header text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Khám phá theo danh mục
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tìm kiếm cuốn sách yêu thích của bạn theo từng chủ đề cụ thể
          </p>
          <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <!-- Categories Grid -->
        <div class="categories-container">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 mb-6">
            <div
              v-for="(category, index) in displayedCategories" 
              :key="category.id || category.name"
              v-show="index < 4 || showAllCategories"
              @click="setCategory(category.name)"
              :class="[
                'category-card group cursor-pointer',
                selectedCategory === category.name ? 'active' : '',
                index >= 4 && !showAllCategories ? 'hidden' : '',
                getCategoryBookCount(category.name) > 0 && category.name !== 'Tất cả' && index === 1 ? 'top-category' : ''
              ]"
            >
              <div class="category-icon-wrapper">
                <component :is="getCategoryIcon(category.name)" class="category-icon" />
                <div v-if="getCategoryBookCount(category.name) > 0 && category.name !== 'Tất cả' && index === 1" 
                     class="category-badge">
                  Nhiều nhất
                </div>
              </div>
              <h3 class="category-name">{{ category.name }}</h3>
              <div class="category-count">
                <span class="count-number" :class="{ 'empty-count': getCategoryBookCount(category.name) === 0 && category.name !== 'Tất cả' }">
                  {{ getCategoryBookCount(category.name) }}
                </span> 
                <span class="count-text">cuốn</span>
              </div>
            </div>
          </div>
          
          <!-- Show More/Less Button -->
          <div v-if="categories.length > 4" class="text-center">
            <button 
              @click="toggleShowAllCategories"
              class="show-more-btn"
            >
              <span>{{ showAllCategories ? 'Thu gọn' : 'Xem thêm' }}</span>
              <ChevronDown 
                :class="[
                  'ml-2 w-4 h-4 transition-transform duration-200',
                  showAllCategories ? 'rotate-180' : ''
                ]" 
              />
            </button>
          </div>
        </div>

        <!-- Books Carousel -->
        <div v-if="filteredBooks.length > 0" class="books-grid">
          <div class="section-title mb-8">
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ selectedCategory === 'Tất cả' ? 'Tất cả sách' : `Sách ${selectedCategory}` }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
              {{ filteredBooks.length }} cuốn sách được tìm thấy
            </p>
          </div>
          
          <!-- Carousel Container -->
          <div class="books-carousel-container" 
               @mouseenter="pauseAutoSlide" 
               @mouseleave="resumeAutoSlide">
            
            <!-- Navigation Buttons -->
            <button v-if="totalBookPages > 1" 
                    @click="prevBookPage" 
                    class="carousel-btn carousel-btn-prev">
              <ChevronLeft class="w-6 h-6" />
            </button>
            
            <button v-if="totalBookPages > 1" 
                    @click="nextBookPage" 
                    class="carousel-btn carousel-btn-next">
              <ChevronRight class="w-6 h-6" />
            </button>
            
            <!-- Books Grid with Animation -->
            <div class="books-carousel-wrapper">
              <div class="books-carousel-track" 
                   :style="{ transform: `translateX(-${currentBookPage * 100}%)` }">
                <div v-for="page in totalBookPages" 
                     :key="page" 
                     class="books-carousel-page">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <BookCard v-for="book in getPageBooks(page - 1)" 
                              :key="book.book_id" 
                              :book="book" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Pagination Dots -->
            <div v-if="totalBookPages > 1" class="carousel-pagination">
              <button v-for="page in totalBookPages" 
                      :key="page"
                      @click="goToBookPage(page - 1)"
                      :class="[
                        'pagination-dot',
                        currentBookPage === page - 1 ? 'active' : ''
                      ]">
              </button>
            </div>
            
            <!-- Auto-slide controls -->
            <div v-if="totalBookPages > 1" class="carousel-controls">
              <button @click="isAutoSliding ? pauseAutoSlide() : resumeAutoSlide()" 
                      class="auto-slide-btn">
                <Pause v-if="isAutoSliding" class="w-4 h-4" />
                <Play v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <BookOpen class="h-20 w-20 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 class="empty-title">Không tìm thấy sách nào</h3>
          <p class="empty-description">
            {{ selectedCategory === 'Tất cả' ? 'Hiện tại chưa có sách nào trong hệ thống' : `Chưa có sách nào trong danh mục "${selectedCategory}"` }}
          </p>
          <button 
            @click="setCategory('Tất cả')"
            class="empty-action"
          >
            Xem tất cả sách
          </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  BookOpen, 
  Palette, 
  Heart, 
  Zap, 
  Globe, 
  Users, 
  Briefcase, 
  GraduationCap,
  Baby,
  Lightbulb,
  Music,
  Gamepad2,
  Utensils,
  Plane,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause
} from 'lucide-vue-next'
import BookCard from '@/components/BookCard.vue'
import { useBookStore } from '@/stores/bookStore'
import { useReviewStore } from '@/stores/reviewStore'

const bookStore = useBookStore()
const reviewStore = useReviewStore()
const booksSection = ref(null)
const showAllCategories = ref(false)

// Books carousel state
const currentBookPage = ref(0)
const booksPerPage = 4
const autoSlideInterval = ref(null)
const isAutoSliding = ref(true)

// Featured books carousel state
const currentFeaturedPage = ref(0)
const featuredAutoSlideInterval = ref(null)
const isFeaturedAutoSliding = ref(true)

const books = computed(() => bookStore.books)
const featuredBooks = computed(() => bookStore.featuredBooks)
const categories = computed(() => bookStore.categories)
const selectedCategory = computed(() => bookStore.selectedCategory)
const filteredBooks = computed(() => bookStore.filteredBooks)

// Books pagination for carousel
const totalBookPages = computed(() => {
  return Math.ceil(filteredBooks.value.length / booksPerPage)
})

const displayedBooks = computed(() => {
  const start = currentBookPage.value * booksPerPage
  return filteredBooks.value.slice(start, start + booksPerPage)
})

// Featured books pagination for carousel
const totalFeaturedPages = computed(() => {
  return Math.ceil(featuredBooks.value.length / booksPerPage)
})

const displayedFeaturedBooks = computed(() => {
  const start = currentFeaturedPage.value * booksPerPage
  return featuredBooks.value.slice(start, start + booksPerPage)
})

// Display categories sorted by book count
const displayedCategories = computed(() => {
  // Create a copy of categories array to avoid mutating the original
  const sortedCategories = [...categories.value]
  
  // Sort categories by book count (descending), but keep "Tất cả" first
  sortedCategories.sort((a, b) => {
    // Always keep "Tất cả" at the top
    if (a.name === 'Tất cả') return -1
    if (b.name === 'Tất cả') return 1
    
    // Sort other categories by book count (highest first)
    const countA = getCategoryBookCount(a.name)
    const countB = getCategoryBookCount(b.name)
    return countB - countA
  })
  
  return sortedCategories
})

const scrollToBooks = () => booksSection.value?.scrollIntoView({ behavior: 'smooth' })

const toggleShowAllCategories = () => {
  showAllCategories.value = !showAllCategories.value
}

// Books carousel controls
const nextBookPage = () => {
  if (currentBookPage.value < totalBookPages.value - 1) {
    currentBookPage.value++
  } else {
    currentBookPage.value = 0 // Loop back to first page
  }
}

const prevBookPage = () => {
  if (currentBookPage.value > 0) {
    currentBookPage.value--
  } else {
    currentBookPage.value = totalBookPages.value - 1 // Loop to last page
  }
}

const goToBookPage = (page) => {
  currentBookPage.value = page
}

// Auto-slide functionality
const startAutoSlide = () => {
  if (autoSlideInterval.value) return
  
  autoSlideInterval.value = setInterval(() => {
    if (isAutoSliding.value && totalBookPages.value > 1) {
      nextBookPage()
    }
  }, 4000) // Change slide every 4 seconds
}

const stopAutoSlide = () => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
    autoSlideInterval.value = null
  }
}

const pauseAutoSlide = () => {
  isAutoSliding.value = false
}

const resumeAutoSlide = () => {
  isAutoSliding.value = true
}

// Reset book page when category changes
const setCategory = (category) => {
  bookStore.setCategory(category)
  currentBookPage.value = 0 // Reset to first page when changing category
}

// Get books for a specific page
const getPageBooks = (pageIndex) => {
  const start = pageIndex * booksPerPage
  return filteredBooks.value.slice(start, start + booksPerPage)
}

// Featured books carousel controls
const nextFeaturedPage = () => {
  if (currentFeaturedPage.value < totalFeaturedPages.value - 1) {
    currentFeaturedPage.value++
  } else {
    currentFeaturedPage.value = 0 // Loop back to first page
  }
}

const prevFeaturedPage = () => {
  if (currentFeaturedPage.value > 0) {
    currentFeaturedPage.value--
  } else {
    currentFeaturedPage.value = totalFeaturedPages.value - 1 // Loop to last page
  }
}

const goToFeaturedPage = (page) => {
  currentFeaturedPage.value = page
}

// Featured auto-slide functionality
const startFeaturedAutoSlide = () => {
  if (featuredAutoSlideInterval.value) return
  
  featuredAutoSlideInterval.value = setInterval(() => {
    if (isFeaturedAutoSliding.value && totalFeaturedPages.value > 1) {
      nextFeaturedPage()
    }
  }, 5000) // Change slide every 5 seconds for featured books
}

const stopFeaturedAutoSlide = () => {
  if (featuredAutoSlideInterval.value) {
    clearInterval(featuredAutoSlideInterval.value)
    featuredAutoSlideInterval.value = null
  }
}

const pauseFeaturedAutoSlide = () => {
  isFeaturedAutoSliding.value = false
}

const resumeFeaturedAutoSlide = () => {
  isFeaturedAutoSliding.value = true
}

// Get featured books for a specific page
const getPageFeaturedBooks = (pageIndex) => {
  const start = pageIndex * booksPerPage
  return featuredBooks.value.slice(start, start + booksPerPage)
}

// Category icons mapping
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Tất cả': BookOpen,
    'Văn học': Palette,
    'Tiểu thuyết': Heart,
    'Khoa học': Zap,
    'Lịch sử': Globe,
    'Xã hội': Users,
    'Kinh tế': Briefcase,
    'Giáo dục': GraduationCap,
    'Thiếu nhi': Baby,
    'Tâm lý': Lightbulb,
    'Nghệ thuật': Music,
    'Giải trí': Gamepad2,
    'Ẩm thực': Utensils,
    'Du lịch': Plane,
    'Kiến trúc': Building
  }
  return iconMap[categoryName] || BookOpen
}

// Get book count for each category
const getCategoryBookCount = (categoryName) => {
  if (categoryName === 'Tất cả') {
    return books.value.length
  }
  
  // Try multiple possible category field structures
  return books.value.filter(book => {
    return book.category_name === categoryName || 
           book.category?.name === categoryName ||
           book.category === categoryName
  }).length
}

onMounted(async () => {
  console.log('Home component mounted - fetching data...')
  await bookStore.fetchBooks()
  await bookStore.fetchCategoriesAndAuthors()
  await bookStore.fetchTopProducts()
  console.log('Featured books loaded:', bookStore.featuredBooks.length)
  reviewStore.fetchAllReviews()
  
  // Start auto-slide for both carousels after data is loaded
  setTimeout(() => {
    startAutoSlide()
    startFeaturedAutoSlide()
  }, 1000)
})

// Cleanup on unmount
onUnmounted(() => {
  stopAutoSlide()
  stopFeaturedAutoSlide()
})

</script>

<style scoped>
.hero-section {
  background: linear-gradient(to right, #2563eb, #1e40af);
  color: #fff;
}

/* Dark mode for hero section */
.dark .hero-section {
  background: linear-gradient(to right, #1f2937, #172554);
  color: #f9fafb;
}

/* Category Section */
.category-section {
  background: #f8fafc;
  transition: background-color 0.3s ease;
}

.dark .category-section {
  background: #0f172a;
}

/* Category Cards */
.category-card {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.category-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  border-color: #e2e8f0;
}

.category-card.active {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border: none;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

/* Dark mode for category cards */
.dark .category-card {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.dark .category-card:hover {
  background: #334155;
  border-color: #475569;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.dark .category-card.active {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.category-icon-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 auto 0.5rem;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.category-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.75rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 0.5rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.top-category {
  position: relative;
}

/* Dark mode for icon wrapper */
.dark .category-icon-wrapper {
  background: rgba(59, 130, 246, 0.15);
}

.category-card.active .category-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.category-card:hover .category-icon-wrapper {
  background: #dbeafe;
  transform: scale(1.05);
}

.dark .category-card:hover .category-icon-wrapper {
  background: rgba(59, 130, 246, 0.25);
}

.category-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
  transition: all 0.3s ease;
}

/* Dark mode for icon */
.dark .category-icon {
  color: #60a5fa;
}

.category-card.active .category-icon {
  color: white;
}

.category-card:hover .category-icon {
  color: #2563eb;
}

.dark .category-card:hover .category-icon {
  color: #93c5fd;
}

.category-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.125rem;
  transition: all 0.3s ease;
  font-size: 0.75rem;
  line-height: 1.2;
}

/* Dark mode for category name */
.dark .category-name {
  color: #f1f5f9;
}

.category-card.active .category-name {
  color: white;
  font-weight: 700;
}

.category-count {
  font-size: 0.75rem;
  color: #64748b;
  transition: all 0.3s ease;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.count-number {
  font-weight: 600;
  color: #3b82f6;
}

.count-number.empty-count {
  color: #94a3b8;
  opacity: 0.7;
}

.count-text {
  font-weight: normal;
}

/* Dark mode for category count */
.dark .category-count {
  color: #94a3b8;
}

.dark .count-number {
  color: #60a5fa;
}

.category-card.active .category-count {
  color: rgba(255, 255, 255, 0.8);
}

.category-card.active .count-number {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
}

.category-card:hover .category-count {
  color: #475569;
}

.category-card:hover .count-number {
  color: #2563eb;
}

.dark .category-card:hover .category-count {
  color: #cbd5e1;
}

.dark .category-card:hover .count-number {
  color: #93c5fd;
}

/* Categories Container */
.categories-container {
  margin-bottom: 3rem;
}

/* Show More Button */
.show-more-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.show-more-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #111827;
}

/* Dark mode for show more button */
.dark .show-more-btn {
  background: #374151;
  color: #d1d5db;
  border-color: #4b5563;
}

.dark .show-more-btn:hover {
  background: #4b5563;
  border-color: #6b7280;
  color: #f3f4f6;
}

/* Books Carousel Styles */
.books-carousel-container,
.featured-carousel-container {
  position: relative;
  overflow: hidden;
}

.books-carousel-wrapper,
.featured-carousel-wrapper {
  overflow: hidden;
  width: 100%;
}

.books-carousel-track,
.featured-carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%;
}

.books-carousel-page,
.featured-carousel-page {
  flex: 0 0 100%;
  width: 100%;
}

/* Navigation Buttons */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.carousel-btn:hover {
  background: white;
  color: #3b82f6;
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.carousel-btn-prev {
  left: -1.5rem;
}

.carousel-btn-next {
  right: -1.5rem;
}

/* Dark mode for carousel buttons */
.dark .carousel-btn {
  background: rgba(30, 41, 59, 0.9);
  border-color: #475569;
  color: #cbd5e1;
}

.dark .carousel-btn:hover {
  background: #1e293b;
  color: #60a5fa;
}

/* Pagination Dots */
.carousel-pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #cbd5e1;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-dot.active {
  background: #3b82f6;
  transform: scale(1.2);
}

.pagination-dot:hover {
  background: #9ca3af;
}

.pagination-dot.active:hover {
  background: #2563eb;
}

/* Dark mode for pagination */
.dark .pagination-dot {
  background: #475569;
}

.dark .pagination-dot:hover {
  background: #64748b;
}

.dark .pagination-dot.active {
  background: #60a5fa;
}

/* Auto-slide Controls */
.carousel-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.auto-slide-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: #374151;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auto-slide-btn:hover {
  background: white;
  color: #3b82f6;
  transform: scale(1.05);
}

/* Featured Books Carousel Specific Styles */
.featured-carousel-container {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.dark .featured-carousel-container {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
}

.featured-carousel-container .carousel-btn {
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border: none;
}

.featured-carousel-container .carousel-btn:hover {
  background: rgba(59, 130, 246, 1);
  transform: translateY(-50%) scale(1.1);
}

.featured-carousel-container .pagination-dot {
  background: rgba(59, 130, 246, 0.3);
}

.featured-carousel-container .pagination-dot.active {
  background: #3b82f6;
}

.featured-carousel-container .auto-slide-btn {
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border: none;
}

.featured-carousel-container .auto-slide-btn:hover {
  background: rgba(59, 130, 246, 1);
}
.dark .auto-slide-btn {
  background: rgba(30, 41, 59, 0.9);
  border-color: #475569;
  color: #cbd5e1;
}

.dark .auto-slide-btn:hover {
  background: #1e293b;
  color: #60a5fa;
}
.books-grid {
  background: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
}

/* Dark mode for books grid */
.dark .books-grid {
  background: #1e293b;
  border-color: #334155;
}

.section-title {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}

/* Dark mode for section title */
.dark .section-title {
  border-bottom-color: #334155;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
}

/* Dark mode for empty state */
.dark .empty-state {
  background: #1e293b;
  border-color: #334155;
}

.empty-icon {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

/* Dark mode for empty title */
.dark .empty-title {
  color: #f1f5f9;
}

.empty-description {
  color: #64748b;
  margin-bottom: 1.5rem;
  max-width: 28rem;
  margin-left: auto;
  margin-right: auto;
}

/* Dark mode for empty description */
.dark .empty-description {
  color: #94a3b8;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
}

.empty-action:hover {
  background: #2563eb;
}

/* Legacy category button styles (kept for backward compatibility) */
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
.dark .category-button:not(.active) {
  background: #1f2937;
  color: #d1d5db;
  border-color: #374151;
}

.dark .category-button:not(.active):hover {
  background: #374151;
  border-color: #4b5563;
}

/* Stats Section */
.dark .stats-section {
  background: #1e293b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-card {
    padding: 0.75rem 0.5rem;
  }
  
  .category-name {
    font-size: 0.6875rem;
  }
  
  .category-count {
    font-size: 0.625rem;
  }
  
  .category-icon-wrapper {
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.375rem;
  }
  
  .category-icon {
    width: 1rem;
    height: 1rem;
  }

  .books-grid {
    padding: 1.5rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }

  .show-more-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
  }

  .categories-container {
    margin-bottom: 2rem;
  }

  /* Carousel responsive */
  .carousel-btn {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .carousel-btn-prev {
    left: -1rem;
  }
  
  .carousel-btn-next {
    right: -1rem;
  }
  
  .books-carousel-page .grid,
  .featured-carousel-page .grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .pagination-dot {
    width: 0.625rem;
    height: 0.625rem;
  }
  
  .auto-slide-btn {
    padding: 0.375rem;
  }
  
  .featured-carousel-container {
    padding: 1.5rem;
  }
}

/* Animation for category cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.category-card {
  animation: fadeInScale 0.4s ease-out;
}

.category-card:nth-child(1) { animation-delay: 0.05s; }
.category-card:nth-child(2) { animation-delay: 0.1s; }
.category-card:nth-child(3) { animation-delay: 0.15s; }
.category-card:nth-child(4) { animation-delay: 0.2s; }
.category-card:nth-child(5) { animation-delay: 0.25s; }
.category-card:nth-child(6) { animation-delay: 0.3s; }
.category-card:nth-child(7) { animation-delay: 0.35s; }
.category-card:nth-child(8) { animation-delay: 0.4s; }

/* Smooth transition for showing more categories */
.category-card.hidden {
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.3s ease;
}

.show-more-btn {
  animation: fadeInUp 0.4s ease-out 0.5s both;
}
</style>
