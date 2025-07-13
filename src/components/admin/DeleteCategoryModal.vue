<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div class="modal-header">
        <div class="icon-wrapper danger">
          <AlertTriangle class="warning-icon" />
        </div>
        <h2 class="modal-title">Xác nhận xóa danh mục</h2>
      </div>

      <div class="modal-body">
        <p class="confirmation-text">
          Bạn có chắc chắn muốn xóa danh mục 
          <span class="category-name">"{{ category?.name }}"</span>?
        </p>
        
        <div class="warning-note">
          <div class="warning-content">
            <AlertCircle class="warning-small-icon" />
            <span>Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn khỏi hệ thống.</span>
          </div>
        </div>

        <div v-if="category" class="category-preview">
          <div class="category-info">
            <div class="category-name-preview">{{ category.name }}</div>
            <div class="category-details">
              <span v-if="category.description">{{ category.description }}</span>
              <span v-if="category.book_count" class="book-count">{{ category.book_count }} sách</span>
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
          Xóa danh mục
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AlertTriangle, AlertCircle, Trash2 } from 'lucide-vue-next'
import { useCategoryStore } from '@/stores/categoryStore'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  category: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const categoryStore = useCategoryStore()
const toastStore = useToastStore()
const loading = ref(false)

const confirmDelete = async () => {
  if (!props.category?.category_id) return

  loading.value = true

  try {
    const result = await categoryStore.deleteCategory(props.category.category_id)
    
    if (result.success) {
      toastStore.success(`Đã xóa danh mục "${props.category.name}" thành công!`)
      emit('close')
    } else {
      toastStore.error(result.error || 'Không thể xóa danh mục')
    }
  } catch (error) {
    console.error('Delete category error:', error)
    toastStore.error('Đã có lỗi xảy ra khi xóa danh mục')
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  if (!loading.value) {
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
  max-width: 28rem;
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

.category-name {
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

.category-preview {
  /* background: #f9fafb; */
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.category-info {
  display: flex;
  flex-direction: column;
}

.category-name-preview {
  font-weight: 600;
  /* color: #111827; */
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  /* color: #6b7280; */
}

.book-count {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
  width: fit-content;
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
    color: #111827;
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
  border-top: 2px solid currentColor;
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

:global(.dark) .modal-title {
  color: #f9fafb;
}

:global(.dark) .confirmation-text {
  color: #cbd5e1; /* Text color for confirmation message */
}

:global(.dark) .warning-note {
  background: #1e293b; /* Warning note background */
  color: #e2e8f0; /* Warning note text */
}

:global(.dark) .category-preview {
  background: #111827;
  border-color: #374151;
}

:global(.dark) .category-name-preview {
  color: #f9fafb;
}

:global(.dark) .category-details {
  color: #d1d5db;
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
}
</style>
