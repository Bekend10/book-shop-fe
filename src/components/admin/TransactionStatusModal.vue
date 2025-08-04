<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div class="modal-header">
        <h2 class="modal-title">Cập nhật trạng thái giao dịch</h2>
        <button @click="closeModal" class="close-btn">
          <X class="close-icon" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="transaction" class="transaction-info">
          <h3 class="transaction-id">Giao dịch #{{ transaction.paymentId }}</h3>
          <p class="order-info">Đơn hàng: #{{ transaction.orderId }}</p>
          <p class="amount-info">Số tiền: {{ formatCurrency(transaction.amount) }}</p>
        </div>

        <form @submit.prevent="updateTransactionStatus" class="status-form">
          <div class="form-group">
            <label for="status" class="form-label">Trạng thái hiện tại</label>
            <div class="current-status">
              <span class="status-badge" :class="getStatusClass(transaction?.paymentStatus)">
                {{ getStatusText(transaction?.paymentStatus) }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="newStatus" class="form-label">Trạng thái mới *</label>
            <select
              id="newStatus"
              v-model="formData.status"
              class="form-select"
              required
            >
              <option value="" class="status-option">-- Chọn trạng thái --</option>
              <option 
                v-for="status in availableStatuses"
                :key="status.value"
                :value="status.value"
                class="status-option"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="note" class="form-label">Ghi chú</label>
            <textarea
              id="note"
              v-model="formData.note"
              class="form-textarea"
              rows="3"
              placeholder="Thêm ghi chú về việc cập nhật trạng thái..."
            ></textarea>
          </div>

          <div v-if="formData.status === 2" class="form-group">
            <label for="failureReason" class="form-label">Lý do thất bại *</label>
            <textarea
              id="failureReason"
              v-model="formData.failureReason"
              class="form-textarea"
              rows="2"
              placeholder="Nhập lý do giao dịch thất bại..."
              required
            ></textarea>
          </div>

          <div v-if="formData.status === 3" class="form-group">
            <label for="refundReason" class="form-label">Lý do hoàn tiền *</label>
            <textarea
              id="refundReason"
              v-model="formData.refundReason"
              class="form-textarea"
              rows="2"
              placeholder="Nhập lý do hoàn tiền..."
              required
            ></textarea>
          </div>

          <div v-if="formData.status === 1" class="form-group">
            <label for="transactionRef" class="form-label">Mã tham chiếu</label>
            <input
              id="transactionRef"
              v-model="formData.transactionRef"
              type="text"
              class="form-input"
              placeholder="Nhập mã tham chiếu giao dịch..."
            />
          </div>
        </form>

        <div v-if="errors.length > 0" class="error-list">
          <p v-for="error in errors" :key="error" class="error-message">{{ error }}</p>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-secondary">
          Hủy
        </button>
        <button 
          type="button" 
          @click="updateTransactionStatus" 
          :disabled="isLoading || !formData.status"
          class="btn btn-primary"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Đang cập nhật...' : 'Cập nhật' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  transaction: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'updated'])

const isLoading = ref(false)
const errors = ref([])

const formData = ref({
  status: '',
  note: '',
  failureReason: '',
  refundReason: '',
  transactionRef: ''
})

// Reset form when modal opens
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

const resetForm = () => {
  formData.value = {
    status: '',
    note: '',
    failureReason: '',
    refundReason: '',
    transactionRef: ''
  }
  errors.value = []
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getStatusClass = (status) => {
  const classes = {
    0: 'status-pending',
    1: 'status-completed',
    2: 'status-failed',
    3: 'status-refunded'
  }
  return classes[status] || 'status-pending'
}

const getStatusText = (status) => {
  const texts = {
    0: 'Đang chờ',
    1: 'Hoàn thành',
    2: 'Thất bại',
    3: 'Hoàn tiền'
  }
  return texts[status] || 'Không xác định'
}

const availableStatuses = computed(() => {
  if (!props.transaction) return []
  
  const currentStatus = props.transaction.status
  const allStatuses = [
    { value: 0, label: 'Đang chờ' },
    { value: 1, label: 'Hoàn thành' },
    { value: 2, label: 'Thất bại' },
    { value: 3, label: 'Hoàn tiền' }
  ]

  // Logic để xác định trạng thái có thể chuyển đổi
  switch (currentStatus) {
    case 0: // Đang chờ
      return allStatuses.filter(s => [1, 2].includes(s.value)) // Có thể chuyển thành: Hoàn thành, Thất bại
    case 1: // Hoàn thành
      return allStatuses.filter(s => [3].includes(s.value)) // Có thể chuyển thành: Hoàn tiền
    case 2: // Thất bại
      return allStatuses.filter(s => [0, 1].includes(s.value)) // Có thể chuyển thành: Đang chờ, Hoàn thành
    case 3: // Hoàn tiền
      return [] // Không thể thay đổi trạng thái nữa
    default:
      return allStatuses
  }
})

const validateForm = () => {
  errors.value = []

  if (!formData.value.status && formData.value.status !== 0) {
    errors.value.push('Vui lòng chọn trạng thái mới')
  }

  if (formData.value.status === 2 && !formData.value.failureReason) {
    errors.value.push('Vui lòng nhập lý do thất bại')
  }

  if (formData.value.status === 3 && !formData.value.refundReason) {
    errors.value.push('Vui lòng nhập lý do hoàn tiền')
  }

  return errors.value.length === 0
}

const updateTransactionStatus = async () => {
  if (!validateForm()) return
  isLoading.value = true

  try {
    const updateData = {
      status: formData.value.status,
      note: formData.value.note,
      ...(formData.value.status === 2 && { 
        failure_reason: formData.value.failureReason 
      }),
      ...(formData.value.status === 3 && { 
        refund_reason: formData.value.refundReason 
      }),
      ...(formData.value.status === 1 && formData.value.transactionRef && { 
        transaction_reference: formData.value.transactionRef 
      })
    }

    const emitData = {
      transactionId: props.transaction.transaction_id,
      updateData
    };

    emit('updated', emitData)

    closeModal()
  } catch (error) {
    console.error('Error updating transaction status:', error)
    errors.value = ['Có lỗi xảy ra khi cập nhật trạng thái giao dịch']
  } finally {
    isLoading.value = false
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
}

.close-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.transaction-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.transaction-id {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #3b82f6;
}

.order-info, .amount-info {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.amount-info {
  font-weight: 600;
  color: #059669;
}

.status-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.current-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  width: fit-content;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-completed {
  background: #dcfce7;
  color: #059669;
}

.status-failed {
  background: #fee2e2;
  color: #dc2626;
}

.status-refunded {
  background: #e0e7ff;
  color: #6366f1;
}

.form-select, .form-input, .form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: rgba(59, 130, 246, 0.1);
}

.form-select:focus, .form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 2.5rem;
}

.status-option {
  background-color: rgba(59, 130, 246, 0.1);
  color: black;
}

.error-list {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
}

.error-message {
  margin: 0;
  font-size: 0.875rem;
  color: #dc2626;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
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

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
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
  background: #0f172a;
  color: #cbd5e1;
}

:global(.dark) .modal-header {
  border-color: #374151;
}

:global(.dark) .modal-title {
  color: #f9fafb;
}

:global(.dark) .close-btn {
  background: #374151;
}

:global(.dark) .close-btn:hover {
  background: #4b5563;
}

:global(.dark) .close-icon {
  color: #d1d5db;
}

:global(.dark) .transaction-info {
  background: #1e293b;
  border-color: #374151;
}

:global(.dark) .transaction-id {
  color: #60a5fa;
}

:global(.dark) .order-info, 
:global(.dark) .amount-info {
  color: #94a3b8;
}

:global(.dark) .amount-info {
  color: #34d399;
}

:global(.dark) .form-label {
  color: #d1d5db;
}

:global(.dark) .form-select, 
:global(.dark) .form-input, 
:global(.dark) .form-textarea {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

:global(.dark) .form-select:focus, 
:global(.dark) .form-input:focus, 
:global(.dark) .form-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:global(.dark) .status-option {
  background: #374151;
  color: #f9fafb;
}

:global(.dark) .error-list {
  background: #450a0a;
  border-color: #dc2626;
}

:global(.dark) .error-message {
  color: #fca5a5;
}

:global(.dark) .modal-footer {
  border-color: #374151;
}

:global(.dark) .btn-secondary {
  background: #374151;
  color: #d1d5db;
}

:global(.dark) .btn-secondary:hover {
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
