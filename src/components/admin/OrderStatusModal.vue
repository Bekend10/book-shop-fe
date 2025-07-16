<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div class="modal-header">
        <h2 class="modal-title">Cập nhật trạng thái đơn hàng</h2>
        <button @click="closeModal" class="close-btn">
          <X class="close-icon" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="order" class="order-info">
          <h3 class="order-id">Đơn hàng #{{ order.order_id }}</h3>
          <p class="customer-name">Khách hàng: {{ order.customer_name }}</p>
          <p class="order-total">Tổng tiền: {{ formatCurrency(order.total_amount) }}</p>
        </div>

        <form @submit.prevent="updateOrderStatus" class="status-form">
          <div class="form-group">
            <label for="status" class="form-label">Trạng thái hiện tại</label>
            <div class="current-status">
              <span class="status-badge" :class="getStatusClass(order?.status)">
                {{ getStatusText(order?.status) }}
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

          <div v-if="formData.status === 4" class="form-group">
            <label for="cancelReason" class="form-label">Lý do hủy đơn *</label>
            <textarea
              id="cancelReason"
              v-model="formData.cancelReason"
              class="form-textarea"
              rows="2"
              placeholder="Nhập lý do hủy đơn hàng..."
              required
            ></textarea>
          </div>

          <div v-if="formData.status === 2" class="form-group">
            <label for="trackingNumber" class="form-label">Mã vận đơn</label>
            <input
              id="trackingNumber"
              v-model="formData.trackingNumber"
              type="text"
              class="form-input"
              placeholder="Nhập mã vận đơn..."
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
          @click="updateOrderStatus" 
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
  order: {
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
  cancelReason: '',
  trackingNumber: ''
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
    cancelReason: '',
    trackingNumber: ''
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
    1: 'status-confirmed',
    2: 'status-shipping',
    3: 'status-delivered',
    4: 'status-cancelled'
  }
  return classes[status] || 'status-pending'
}

const getStatusText = (status) => {
  const texts = {
    0: 'Chờ xử lý',
    1: 'Đã xác nhận',
    2: 'Đang giao',
    3: 'Đã giao',
    4: 'Đã hủy'
  }
  return texts[status] || 'Không xác định'
}

const availableStatuses = computed(() => {
  if (!props.order) return []
  
  const currentStatus = props.order.status
  const allStatuses = [
    { value: 0, label: 'Chờ xử lý' },
    { value: 1, label: 'Đã xác nhận' },
    { value: 2, label: 'Đang giao' },
    { value: 3, label: 'Đã giao' },
    { value: 4, label: 'Đã hủy' }
  ]

  // Logic để xác định trạng thái có thể chuyển đổi
  switch (currentStatus) {
    case 0: // Chờ xử lý
      return allStatuses.filter(s => [1, 4].includes(s.value)) // Có thể chuyển thành: Đã xác nhận, Đã hủy
    case 1: // Đã xác nhận
      return allStatuses.filter(s => [2, 4].includes(s.value)) // Có thể chuyển thành: Đang giao, Đã hủy
    case 2: // Đang giao
      return allStatuses.filter(s => [3, 4].includes(s.value)) // Có thể chuyển thành: Đã giao, Đã hủy
    case 3: // Đã giao
      return [] // Không thể thay đổi trạng thái nữa
    case 4: // Đã hủy
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

  if (formData.value.status === 4 && !formData.value.cancelReason) {
    errors.value.push('Vui lòng nhập lý do hủy đơn')
  }

  return errors.value.length === 0
}

const updateOrderStatus = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    const updateData = {
      status: formData.value.status,
      note: formData.value.note,
      ...(formData.value.status === 4 && { 
        cancel_reason: formData.value.cancelReason 
      }),
      ...(formData.value.status === 2 && formData.value.trackingNumber && { 
        tracking_number: formData.value.trackingNumber 
      })
    }

    const emitData = {
      orderId: props.order.order_id,
      updateData
    };

    console.log('OrderStatusModal - emitting:', emitData);

    emit('updated', emitData)

    closeModal()
  } catch (error) {
    console.error('Error updating order status:', error)
    errors.value = ['Có lỗi xảy ra khi cập nhật trạng thái đơn hàng']
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

.order-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  /* background: #f9fafb; */
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.order-id {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  /* color: #111827; */
}

.customer-name, .order-total {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  /* color: #111827; */
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
  /* color: #374151; */
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

.status-confirmed {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-shipping {
  background: #e0e7ff;
  color: #6366f1;
}

.status-delivered {
  background: #dcfce7;
  color: #059669;
}

.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.form-select, .form-input, .form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  /* background: white; */
  background-color:rgba(59, 130, 246 , 0.1);
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

.status-option {
  background-color:rgba(59, 130, 246, 0.1);
  color: black;
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

:global(.dark) .order-info {
  background: #1e293b;
  border-color: #374151;
}

:global(.dark) .order-id {
  color: #f9fafb;
}

:global(.dark) .customer-name, 
:global(.dark) .order-total {
  color: #94a3b8;
}

:global(.dark) .form-label {
  color: #d1d5db;
}

:global(.dark) .form-select, 
:global(.dark) .form-input, 
:global(.dark) .form-textarea {
  background: #374151;
  border-color: #4b5563;
  /* color: #f9fafb; */
}

:global(.dark) .form-select:focus, 
:global(.dark) .form-input:focus, 
:global(.dark) .form-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
