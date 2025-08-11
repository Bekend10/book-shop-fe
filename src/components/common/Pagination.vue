<template>
  <div class="pagination-container">
    <div class="pagination-info">
      <span class="text-sm text-gray-700 dark:text-gray-300">
        Hiển thị {{ fromItem }} đến {{ toItem }} trong tổng số {{ totalItems }} mục
      </span>
    </div>

    <nav class="pagination-nav" v-if="totalPages > 1">
      <!-- Previous button -->
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn pagination-btn-prev"
        :class="{ 'disabled': currentPage === 1 }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="hidden sm:inline">Trước</span>
      </button>

      <!-- Page numbers -->
      <div class="pagination-numbers">
        <!-- First page -->
        <button
          v-if="showFirstPage"
          @click="goToPage(1)"
          class="pagination-btn"
          :class="{ 'active': currentPage === 1 }"
        >
          1
        </button>

        <!-- Left ellipsis -->
        <span v-if="showLeftEllipsis" class="pagination-ellipsis">...</span>

        <!-- Visible page numbers -->
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          class="pagination-btn"
          :class="{ 'active': currentPage === page }"
        >
          {{ page }}
        </button>

        <!-- Right ellipsis -->
        <span v-if="showRightEllipsis" class="pagination-ellipsis">...</span>

        <!-- Last page -->
        <button
          v-if="showLastPage"
          @click="goToPage(totalPages)"
          class="pagination-btn"
          :class="{ 'active': currentPage === totalPages }"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Next button -->
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn pagination-btn-next"
        :class="{ 'disabled': currentPage === totalPages }"
      >
        <span class="hidden sm:inline">Sau</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>

    <!-- Page size selector -->
    <div class="page-size-selector">
      <label class="text-sm text-gray-700 dark:text-gray-300">
        Hiển thị:
        <select
          :value="pageSize"
          @change="$emit('page-size-change', parseInt($event.target.value))"
          class="ml-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        mục/trang
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    default: 20
  },
  maxVisiblePages: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['page-change', 'page-size-change'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))

const fromItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const toItem = computed(() => {
  const endItem = props.currentPage * props.pageSize
  return Math.min(endItem, props.totalItems)
})

const visiblePages = computed(() => {
  const delta = Math.floor(props.maxVisiblePages / 2)
  let start = Math.max(2, props.currentPage - delta)
  let end = Math.min(totalPages.value - 1, props.currentPage + delta)

  // Adjust if we're near the beginning or end
  if (props.currentPage <= delta + 1) {
    end = Math.min(totalPages.value - 1, props.maxVisiblePages)
  }
  if (props.currentPage >= totalPages.value - delta) {
    start = Math.max(2, totalPages.value - props.maxVisiblePages + 1)
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const showFirstPage = computed(() => {
  return totalPages.value > 1 && (props.currentPage > 3 || props.maxVisiblePages < totalPages.value)
})

const showLastPage = computed(() => {
  return totalPages.value > 1 && (props.currentPage < totalPages.value - 2 || props.maxVisiblePages < totalPages.value)
})

const showLeftEllipsis = computed(() => {
  return props.currentPage > props.maxVisiblePages - 1 && totalPages.value > props.maxVisiblePages
})

const showRightEllipsis = computed(() => {
  return props.currentPage < totalPages.value - props.maxVisiblePages + 2 && totalPages.value > props.maxVisiblePages
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background-color: white;
  border-top: 1px solid #e5e7eb;
}

.dark .pagination-container {
  background-color: #1f2937;
  border-color: #374151;
}

.pagination-info {
  font-size: 0.875rem;
  color: #374151;
}

.dark .pagination-info {
  color: #d1d5db;
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(.disabled) {
  background-color: #f9fafb;
  color: #374151;
}

.dark .pagination-btn {
  color: #9ca3af;
  background-color: #1f2937;
  border-color: #4b5563;
}

.dark .pagination-btn:hover:not(.disabled) {
  background-color: #374151;
  color: #d1d5db;
}

.pagination-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
  border-color: transparent;
}

.pagination-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.pagination-btn.active:hover {
  background-color: #2563eb;
  color: white;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.disabled:hover {
  background-color: white;
  color: #6b7280;
}

.dark .pagination-btn.disabled:hover {
  background-color: #1f2937;
  color: #9ca3af;
}

.pagination-btn-prev,
.pagination-btn-next {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-ellipsis {
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .pagination-ellipsis {
  color: #9ca3af;
}

.page-size-selector {
  font-size: 0.875rem;
}

.page-size-selector select {
  margin-left: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  color: #111827;
}

.dark .page-size-selector select {
  border-color: #4b5563;
  background-color: #374151;
  color: white;
}

.page-size-selector select:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
  border-color: transparent;
}

/* Responsive adjustments */
@media (min-width: 640px) {
  .pagination-container {
    flex-direction: row;
    gap: 1rem;
  }
}

@media (max-width: 639px) {
  .pagination-container {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .pagination-nav {
    order: 2;
  }
  
  .page-size-selector {
    order: 3;
  }
  
  .pagination-info {
    order: 1;
  }
}
</style>
