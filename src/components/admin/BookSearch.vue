<template>
  <div class="search-container">
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="localSearchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Tìm kiếm sách theo tên hoặc tác giả..."
          class="search-input"
        />
        <button
          v-if="localSearchQuery"
          @click="clearSearch"
          class="clear-btn"
          type="button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="filters">
      <!-- Category Filter -->
      <div class="filter-group">
        <label class="filter-label">Danh mục:</label>
        <select
          :value="selectedCategory"
          @change="$emit('category-change', $event.target.value)"
          class="filter-select"
        >
          <option v-for="category in categories" :key="category.id" :value="category.name">
            {{ category.name }}
          </option>
        </select>
      </div>

      <!-- Sort Filter -->
      <div class="filter-group">
        <label class="filter-label">Sắp xếp:</label>
        <select
          :value="sortBy"
          @change="$emit('sort-change', $event.target.value)"
          class="filter-select"
        >
          <option value="title-asc">Tên A-Z</option>
          <option value="title-desc">Tên Z-A</option>
          <option value="author-asc">Tác giả A-Z</option>
          <option value="author-desc">Tác giả Z-A</option>
          <option value="price-asc">Giá thấp → cao</option>
          <option value="price-desc">Giá cao → thấp</option>
          <option value="rating-desc">Đánh giá cao nhất</option>
          <option value="stock-desc">Tồn kho nhiều nhất</option>
          <option value="stock-asc">Tồn kho ít nhất</option>
          <option value="created-desc">Mới nhất</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  selectedCategory: {
    type: String,
    default: 'Tất cả'
  },
  categories: {
    type: Array,
    default: () => []
  },
  sortBy: {
    type: String,
    default: 'title-asc'
  }
})

const emit = defineEmits(['search', 'category-change', 'sort-change'])

const localSearchQuery = ref(props.searchQuery)

// Debounce search input
let searchTimeout = null
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', localSearchQuery.value)
  }, 300)
}

const clearSearch = () => {
  localSearchQuery.value = ''
  emit('search', '')
}

// Watch for external search query changes
watch(() => props.searchQuery, (newQuery) => {
  if (newQuery !== localSearchQuery.value) {
    localSearchQuery.value = newQuery
  }
})
</script>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.dark .search-container {
  background-color: #1f2937;
  border-color: #374151;
}

.search-bar {
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  z-index: 10;
}

.dark .search-icon {
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: white;
  color: #111827;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dark .search-input {
  background-color: #374151;
  border-color: #4b5563;
  color: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  padding: 0.25rem;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #374151;
}

.dark .clear-btn {
  color: #9ca3af;
}

.dark .clear-btn:hover {
  color: #d1d5db;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.dark .filter-label {
  color: #d1d5db;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  color: #111827;
  min-width: 120px;
  cursor: pointer;
}

.dark .filter-select {
  background-color: #374151;
  border-color: #4b5563;
  color: white;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Responsive */
@media (min-width: 768px) {
  .search-container {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .search-bar {
    flex: 1;
    max-width: 400px;
  }

  .filters {
    flex-shrink: 0;
  }
}
</style>
