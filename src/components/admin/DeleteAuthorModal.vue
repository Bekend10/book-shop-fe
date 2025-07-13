<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <div class="icon-wrapper danger">
          <AlertTriangle class="warning-icon" />
        </div>
        <h2 class="modal-title">Xác nhận xóa tác giả</h2>
      </div>

      <div class="modal-body">
        <p class="confirmation-text">
          Bạn có chắc chắn muốn xóa tác giả 
          <span class="author-name">"{{ author?.name }}"</span>?
        </p>
        
        <div class="warning-note">
          <div class="warning-content">
            <AlertCircle class="warning-small-icon" />
            <span>Hành động này không thể hoàn tác. Tác giả sẽ bị xóa vĩnh viễn khỏi hệ thống.</span>
          </div>
        </div>

        <div v-if="author" class="author-preview">
          <div class="author-avatar">
            <img
              v-if="author.profile_image"
              :src="author.profile_image"
              :alt="author.name"
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">
              <User class="avatar-icon" />
            </div>
          </div>
          <div class="author-info">
            <div class="author-name-preview">{{ author.name }}</div>
            <div class="author-details">
              <span v-if="author.nationality">{{ author.nationality }}</span>
              <span v-if="author.birth_date">{{ formatDate(author.birth_date) }}</span>
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
          Xóa tác giả
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle, AlertCircle, User, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  author: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const confirmDelete = () => {
  emit('confirm', props.author)
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
  max-width: 28rem;
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
  color: #111827;
  margin: 0;
}

.modal-body {
  padding: 0 1.5rem 1.5rem;
}

.confirmation-text {
  text-align: center;
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.author-name {
  font-weight: 600;
  color: #111827;
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

.author-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
}

.author-info {
  flex: 1;
  min-width: 0;
}

.author-name-preview {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.author-details {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
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
  min-width: 6rem;
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
.dark .modal-container {
  background: #1f2937;
}

.dark .modal-title {
  color: #f3f4f6;
}

.dark .confirmation-text {
  color: #d1d5db;
}

.dark .author-name {
  color: #f3f4f6;
}

.dark .warning-note {
  background: #422006;
  border-color: #92400e;
}

.dark .warning-content span {
  color: #fbbf24;
}

.dark .author-preview {
  background: #374151;
  border-color: #4b5563;
}

.dark .author-name-preview {
  color: #f3f4f6;
}

.dark .author-details {
  color: #d1d5db;
}

.dark .avatar-placeholder {
  background: #4b5563;
}

.dark .modal-footer {
  border-top-color: #374151;
}

.dark .btn-secondary {
  background: #374151;
  color: #d1d5db;
}

.dark .btn-secondary:hover:not(:disabled) {
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
  
  .author-details {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
