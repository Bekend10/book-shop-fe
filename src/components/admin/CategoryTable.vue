<template>
  <div class="category-table-container bg-white dark:bg-gray-800">
    <!-- Header với Search và Actions -->
    <div class="table-header">
      <div class="search-section">
        <div class="search-bar">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            @input="$emit('search', $event.target.value)"
            type="text"
            placeholder="Tìm kiếm danh mục..."
            class="search-input dark:bg-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
      
      <div class="actions-section">
        <button
          v-if="selectedCategories.length > 0"
          @click="$emit('delete-multiple')"
          class="btn btn-danger-outline"
        >
          <Trash2 class="btn-icon" />
          Xóa {{ selectedCategories.length }} danh mục
        </button>
        
        <button @click="$emit('add-category')" class="btn btn-primary">
          <Plus class="btn-icon" />
          Thêm danh mục
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <thead class="table-header-row bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white ">
          <tr>
            <th class="checkbox-column">
              <input
                type="checkbox"
                :checked="selectedCategories.length === categories.length && categories.length > 0"
                @change="toggleSelectAll"
                class="checkbox"
              />
            </th>
            <th class="table-cell">Tên danh mục</th>
            <th class="table-cell">Mô tả</th>
            <th class="table-cell">Số sách</th>
            <th class="table-cell">Ngày tạo</th>
            <th class="actions-column">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="category in categories"
            :key="category.category_id"
            class="table-row bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
            :class="{ 'selected bg-blue-100 dark:bg-blue-900': selectedCategories.includes(category.category_id) }"
          >
            <td class="checkbox-column">
              <input
                type="checkbox"
                :value="category.category_id"
                :checked="selectedCategories.includes(category.category_id)"
                @change="toggleSelect(category.category_id)"
                class="checkbox"
              />
            </td>
            <td class="table-cell text-gray-900 dark:text-gray-100">
              <div class="category-info">
                <div class="category-name dark:text-white ">{{ category.name }}</div>
              </div>
            </td>
            <td class="table-cell text-gray-600 dark:text-gray-300">
              <div class="category-description dark:text-white ">
                {{ category.description || 'Chưa có mô tả' }}
              </div>
            </td>
            <td class="table-cell text-gray-600 dark:text-gray-300">
              <span class="book-count bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {{ category.book_count || 0 }}
              </span>
            </td>
            <td class="table-cell text-gray-600 dark:text-white-300">
              <span class="date-text dark:text-white ">{{ formatDate(category.created_at) }}</span>
            </td>
            <td class="actions-column">
              <div class="action-buttons">
                <button
                  @click="$emit('edit-category', category)"
                  class="btn btn-icon-only btn-primary-outline dark:border-gray-600"
                  title="Chỉnh sửa"
                >
                  <Edit2 class="btn-icon" />
                </button>
                <button
                  @click="$emit('delete-category', category)"
                  class="btn btn-icon-only btn-danger-outline dark:border-gray-600"
                  title="Xóa"
                >
                  <Trash2 class="btn-icon" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination hoặc thông tin số lượng -->
    <div v-if="categories.length > 0" class="table-footer dark:bg-gray-700">
      <p class="results-info">
        Hiển thị {{ categories.length }} danh mục
      </p>
    </div>

      <!-- Empty State -->
      <div v-if="categories.length === 0" class="empty-state">
        <div class="empty-icon">
          <FolderOpen class="empty-icon-svg" />
        </div>
        <div class="empty-title">Chưa có danh mục nào</div>
        <div class="empty-subtitle">Thêm danh mục đầu tiên để bắt đầu</div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">Đang tải...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Plus, Edit2, Trash2, FolderOpen } from 'lucide-vue-next'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'search',
  'add-category',
  'edit-category',
  'delete-category',
  'delete-multiple'
])

const searchQuery = ref('')
const selectedCategories = ref([])

const toggleSelect = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(categoryId)
  }
  
  // Emit selected IDs for parent component
  emit('delete-multiple', selectedCategories.value)
}

const toggleSelectAll = () => {
  if (selectedCategories.value.length === props.categories.length && props.categories.length > 0) {
    selectedCategories.value = []
  } else {
    selectedCategories.value = props.categories.map(cat => cat.category_id)
  }
  
  // Emit selected IDs for parent component
  emit('delete-multiple', selectedCategories.value)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}
</script>

<style scoped>
.category-table-container {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  /* border-bottom: 1px solid #e5e7eb; */
}

.search-section {
  flex: 1;
  max-width: 24rem;
}

.search-bar {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  /* border: 1px solid #d1d5db; */
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.actions-section {
  display: flex;
  gap: 0.75rem;
  margin-left: 1rem;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header-row {
  background: #f9fafb;
  /* border-bottom: 1px solid #e5e7eb; */
}

.table-header-row th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.checkbox-column {
  width: 3rem;
  text-align: center;
}

.actions-column {
  width: 8rem;
  text-align: center;
}

.table-cell {
  padding: 1rem;
  /* border-bottom: 1px solid #e5e7eb; */
  font-size: 0.875rem;
  color: #111827;
}

.table-row {
  transition: background-color 0.2s ease;
  border: 1px solid transparent;
  border-right: none;
  border-left : none;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row.selected {
  background: #5b97e4;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
}

.category-info {
  display: flex;
  align-items: center;
}

.category-name {
  font-weight: 500;
  color: #111827;
}

.category-description {
  color: #6b7280;
  max-width: 20rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-count {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.date-text {
  color: #6b7280;
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.table-footer {
  padding: 1rem 1.5rem;
  /* border-top: 1px solid #e5e7eb; */
  /* background: #374151; */
  color: #6b7280;
  font-size : 14px;
}

:global(.dark) .table-footer {
    background-color: #374151;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary-outline {
  /* background: white; */
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-primary-outline:hover {
  background: #eff6ff;
}

.btn-danger-outline {
  /* background: white; */
  color: #dc2626;
  border: 1px solid #dc2626;
}

.btn-danger-outline:hover {
  background: #fef2f2;
}

.btn-icon-only {
  padding: 0.5rem;
  width: 2rem;
  height: 2rem;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1rem;
}

.empty-icon-svg {
  width: 3rem;
  height: 3rem;
  color: #d1d5db;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 0.875rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode */
:global(.dark) .category-table-container {
  background: #0f172a; /* Match dark background with Authors.vue */
}

:global(.dark) .table-header {
  background: #1e293b; /* Match header background */
  border-bottom: 1px solid #334155;
}

:global(.dark) .table-header-row {
  background: #1e293b; /* Match header row background */
  border-color: #334155;
}

:global(.dark) .table-header-row th {
  color: #94a3b8; /* Match header text color */
}

:global(.dark) .table-cell {
  color: #cbd5e1; /* Match cell text color */
  border-bottom: 1px solid #374151;
}

:global(.dark) .category-name {
  color: #e2e8f0; /* Match category name text color */
}

:global(.dark) .category-description {
  color: #94a3b8; /* Match description text color */
}

:global(.dark) .date-text {
  color: #94a3b8; /* Match date text color */
}

:global(.dark) .table-row:hover {
  background: #1e293b; /* Match hover background */
}

:global(.dark) .table-row.selected {
  background: #334155; /* Match selected row background */
}

:global(.dark) .search-input  {
    background: #1e293b; /* Match search bar background */
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-section {
    max-width: none;
  }
  
  .actions-section {
    justify-content: space-between;
    margin-left: 0;
  }
  
  .table-wrapper {
    overflow-x: scroll;
  }
  
  .data-table {
    min-width: 40rem;
  }
}
</style>
