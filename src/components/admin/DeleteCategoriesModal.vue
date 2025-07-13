<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div class="modal-header">
        <div class="icon-wrapper danger">
          <AlertTriangle class="warning-icon" />
        </div>
        <h2 class="modal-title">Xác nhận xóa nhiều danh mục</h2>
      </div>

      <div class="modal-body">
        <p class="confirmation-text">
          Bạn có chắc chắn muốn xóa 
          <span class="count">{{ categoryCount }}</span> 
          danh mục đã chọn?
        </p>
        
        <div class="warning-note">
          <div class="warning-content">
            <AlertCircle class="warning-small-icon" />
            <span>Hành động này không thể hoàn tác. Tất cả danh mục được chọn sẽ bị xóa vĩnh viễn khỏi hệ thống.</span>
          </div>
        </div>

        <div v-if="categories && categories.length > 0" class="categories-preview">
          <div class="preview-header">
            <FolderOpen class="preview-icon" />
            <span class="preview-title">Danh sách danh mục sẽ bị xóa:</span>
          </div>
          
          <div class="categories-list">
            <div
              v-for="category in displayCategories"
              :key="category.category_id"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-name">{{ category.name }}</div>
                <div class="category-details">
                  <span v-if="category.description">{{ category.description }}</span>
                  <span v-if="category.book_count" class="book-count">{{ category.book_count }} sách</span>
                </div>
              </div>
            </div>
            
            <div v-if="remainingCount > 0" class="remaining-count">
              <div class="remaining-indicator">
                <MoreHorizontal class="more-icon" />
                <span>và {{ remainingCount }} danh mục khác...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          @click="closeModal"
          class="btn btn-secondary"
          :disabled="loading"
        >
          Hủy
        </button>
        <button
          type="button"
          @click="confirmDelete"
          class="btn btn-danger"
          :disabled="loading"
        >
          <div v-if="loading" class="loading-spinner"></div>
          <Trash2 v-else class="btn-icon" />
          Xóa {{ categoryCount }} danh mục
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AlertTriangle, AlertCircle, Trash2, FolderOpen, MoreHorizontal } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const categoryCount = computed(() => props.categories?.length || 0)

const displayCategories = computed(() => {
  return props.categories?.slice(0, 3) || []
})

const remainingCount = computed(() => {
  const total = props.categories?.length || 0
  return Math.max(0, total - 3)
})

const confirmDelete = () => {
  emit('confirm', props.categories)
}

const closeModal = () => {
  if (!props.loading) {
    emit('close')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem 1rem;
  text-align: center;
}

.icon-wrapper {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.icon-wrapper.danger {
  background: #fef2f2;
}

.warning-icon {
  width: 2rem;
  height: 2rem;
  color: #dc2626;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  /* color: #111827; */
  margin: 0;
}

.modal-body {
  padding: 0 1.5rem 1.5rem;
}

.confirmation-text {
  text-align: center;
  /* color: #6b7280; */
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.count {
  font-weight: 600;
  color: #dc2626;
}

.warning-note {
  background: #fffbeb;
  border: 1px solid #fed7aa;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
}

.warning-content {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.warning-small-icon {
  width: 1rem;
  height: 1rem;
  color: #d97706;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.warning-content span {
  font-size: 0.75rem;
  color: #92400e;
  line-height: 1.4;
}

.categories-preview {
  /* background: #f9fafb; */
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  /* background: #f3f4f6; */
  border-bottom: 1px solid #e5e7eb;
}

.preview-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.preview-title {
  font-size: 0.75rem;
  font-weight: 500;
  /* color: #374151; */
}

.categories-list {
  max-height: 12rem;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.category-item:last-child {
  border-bottom: none;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-weight: 500;
  /* color: #111827; */
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-details {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  /* color: #6b7280; */
  flex-wrap: wrap;
}

.book-count {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
  white-space: nowrap;
}

.remaining-count {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
}

.remaining-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-style: italic;
}

.more-icon {
  width: 1rem;
  height: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-height: 2.5rem;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode */
:global(.dark) .modal-container {
  background: #0f172a; /* Match dark background */
  color: #cbd5e1; /* Text color for better readability */
}

:global(.dark) .modal-header {
  background: #1e293b; /* Header background */
  color: #e2e8f0; /* Header text color */
}

:global(.dark) .confirmation-text {
  color: #d1d5db;
}

:global(.dark) .categories-preview {
  background: #111827;
  border-color: #374151;
}

:global(.dark) .preview-header {
  background: #0f172a;
  border-color: #374151;
}

:global(.dark) .preview-icon {
  color: #9ca3af;
}

:global(.dark) .preview-title {
  color: #d1d5db;
}

:global(.dark) .categories-list {
  background: #1e293b; /* List background */
  color: #cbd5e1; /* List text color */
}

:global(.dark) .category-item {
  border-color: #374151;
}

:global(.dark) .category-name {
  color: #f9fafb;
}

:global(.dark) .category-details {
  color: #d1d5db;
}

:global(.dark) .remaining-count {
  border-color: #374151;
}

:global(.dark) .remaining-indicator {
  color: #94a3b8; /* Remaining indicator text color */
}

:global(.dark) .modal-footer {
  border-color: #374151;
}

:global(.dark) .btn-secondary {
  background: #374151;
  color: #d1d5db;
}

:global(.dark) .btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 0.5rem;
    max-width: none;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .category-details {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .categories-list {
    max-height: 8rem;
  }
}
</style>
