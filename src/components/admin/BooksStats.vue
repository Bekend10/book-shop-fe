<template>
  <div class="books-stats">
    <div class="stats-grid">
      <!-- Total Books -->
      <div class="stat-card">
        <div class="stat-icon">
          <BookOpen class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalBooks }}</div>
          <div class="stat-label">Tổng số sách</div>
        </div>
      </div>

      <!-- Filtered Books -->
      <div class="stat-card">
        <div class="stat-icon">
          <Filter class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ filteredBooks }}</div>
          <div class="stat-label">Sau lọc</div>
        </div>
      </div>

      <!-- Current Page -->
      <div class="stat-card">
        <div class="stat-icon">
          <FileText class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ currentPageBooks }}</div>
          <div class="stat-label">Trang hiện tại</div>
        </div>
      </div>

      <!-- Total Value -->
      <div class="stat-card">
        <div class="stat-icon">
          <DollarSign class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatValue(totalValue) }}</div>
          <div class="stat-label">Tổng giá trị</div>
        </div>
      </div>

      <!-- Average Price -->
      <div class="stat-card">
        <div class="stat-icon">
          <TrendingUp class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatValue(averagePrice) }}</div>
          <div class="stat-label">Giá trung bình</div>
        </div>
      </div>

      <!-- Stock Alert -->
      <div class="stat-card" :class="{ 'alert': lowStockCount > 0 }">
        <div class="stat-icon">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ lowStockCount }}</div>
          <div class="stat-label">Sắp hết hàng</div>
        </div>
      </div>
    </div>

    <!-- Active Filters -->
    <div v-if="hasActiveFilters" class="active-filters">
      <div class="filters-header">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Bộ lọc đang áp dụng:</span>
        <button @click="$emit('clear-filters')" class="clear-filters-btn">
          <X class="w-4 h-4" />
          <span>Xóa tất cả</span>
        </button>
      </div>
      <div class="filter-tags">
        <span v-if="searchQuery" class="filter-tag">
          <Search class="w-3 h-3" />
          "{{ searchQuery }}"
          <button @click="$emit('clear-search')">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="selectedCategory !== 'Tất cả'" class="filter-tag">
          <Tag class="w-3 h-3" />
          {{ selectedCategory }}
          <button @click="$emit('clear-category')">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="sortBy !== 'title-asc'" class="filter-tag">
          <ArrowUpDown class="w-3 h-3" />
          {{ getSortLabel(sortBy) }}
          <button @click="$emit('clear-sort')">
            <X class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  BookOpen, 
  Filter, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  X, 
  Search, 
  Tag, 
  ArrowUpDown 
} from 'lucide-vue-next'

const props = defineProps({
  totalBooks: {
    type: Number,
    required: true
  },
  filteredBooks: {
    type: Number,
    required: true
  },
  currentPageBooks: {
    type: Number,
    required: true
  },
  books: {
    type: Array,
    default: () => []
  },
  searchQuery: {
    type: String,
    default: ''
  },
  selectedCategory: {
    type: String,
    default: 'Tất cả'
  },
  sortBy: {
    type: String,
    default: 'title-asc'
  }
})

const emit = defineEmits(['clear-filters', 'clear-search', 'clear-category', 'clear-sort'])

const totalValue = computed(() => {
  return props.books.reduce((sum, book) => sum + (book.price || 0) * (book.quantity || 0), 0)
})

const averagePrice = computed(() => {
  if (props.books.length === 0) return 0
  const totalPrice = props.books.reduce((sum, book) => sum + (book.price || 0), 0)
  return totalPrice / props.books.length
})

const lowStockCount = computed(() => {
  return props.books.filter(book => (book.quantity || 0) < 10).length
})

const hasActiveFilters = computed(() => {
  return props.searchQuery || 
         props.selectedCategory !== 'Tất cả' || 
         props.sortBy !== 'title-asc'
})

const formatValue = (value) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const getSortLabel = (sort) => {
  const labels = {
    'title-asc': 'Tên A-Z',
    'title-desc': 'Tên Z-A',
    'author-asc': 'Tác giả A-Z',
    'author-desc': 'Tác giả Z-A',
    'price-asc': 'Giá thấp → cao',
    'price-desc': 'Giá cao → thấp',
    'rating-desc': 'Đánh giá cao',
    'stock-desc': 'Tồn kho nhiều',
    'stock-asc': 'Tồn kho ít',
    'created-desc': 'Mới nhất'
  }
  return labels[sort] || sort
}
</script>

<style scoped>
.books-stats {
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-card.alert {
  border-color: #f59e0b;
  background-color: #fffbeb;
}

.dark .stat-card {
  background-color: #1f2937;
  border-color: #374151;
}

.dark .stat-card.alert {
  border-color: #f59e0b;
  background-color: #451a03;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  color: #6b7280;
}

.stat-card.alert .stat-icon {
  background-color: #fef3c7;
  color: #d97706;
}

.dark .stat-icon {
  background-color: #374151;
  color: #9ca3af;
}

.dark .stat-card.alert .stat-icon {
  background-color: #78350f;
  color: #fbbf24;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.dark .stat-value {
  color: white;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.dark .stat-label {
  color: #9ca3af;
}

.active-filters {
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.dark .active-filters {
  background-color: #374151;
  border-color: #4b5563;
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.dark .clear-filters-btn {
  color: #9ca3af;
  border-color: #4b5563;
}

.dark .clear-filters-btn:hover {
  background-color: #4b5563;
  color: #d1d5db;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 0.375rem;
}

.dark .filter-tag {
  background-color: #1e3a8a;
  color: #93c5fd;
}

.filter-tag button {
  padding: 0.125rem;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  border-radius: 0.125rem;
  transition: background-color 0.2s ease;
}

.filter-tag button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
