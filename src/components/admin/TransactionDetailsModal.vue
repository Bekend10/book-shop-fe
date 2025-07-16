<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div class="modal-header">
        <h2 class="modal-title">Chi tiết giao dịch #{{ transaction?.paymentId }}</h2>
        <button @click="closeModal" class="close-btn">
          <X class="close-icon" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="transaction" class="transaction-details">
          <!-- Thông tin giao dịch -->
          <div class="section">
            <h3 class="section-title">Thông tin giao dịch</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Mã giao dịch:</span>
                <span class="value">#{{ transaction.paymentId }}</span>
              </div>
              <div class="info-item">
                <span class="label">Mã đơn hàng:</span>
                <span class="value">#{{ transaction.orderId }}</span>
              </div>
              <div class="info-item">
                <span class="label">Số tiền:</span>
                <span class="value amount" :class="getAmountClass(transaction.paymentStatus)">
                  {{ formatCurrency(transaction.amount) }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Phương thức thanh toán:</span>
                <span class="value">{{ formatPaymentMethod(transaction.methodId) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Trạng thái:</span>
                <span 
                  class="status-badge"
                  :class="getStatusClass(transaction.paymentStatus)"
                >
                  {{ getStatusText(transaction.paymentStatus) }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Ngày tạo:</span>
                <span class="value">{{ formatDate(transaction.paymentDate) }}</span>
              </div>
              <div v-if="transaction.updated_at" class="info-item">
                <span class="label">Cập nhật lần cuối:</span>
                <span class="value">{{ formatDate(transaction.paymentDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Thông tin khách hàng -->
          <div class="section">
            <h3 class="section-title">Thông tin khách hàng</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Tên khách hàng:</span>
                <span class="value">{{ transaction.user?.first_name }} {{ transaction.user?.last_name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">{{ transaction.user?.email }}</span>
              </div>
              <div v-if="transaction.user?.phone_number" class="info-item">
                <span class="label">Số điện thoại:</span>
                <span class="value">{{ transaction.user?.phone_number }}</span>
              </div>
            </div>
          </div>

          <!-- Chi tiết thanh toán -->
          <div v-if="transaction.payment_details" class="section">
            <h3 class="section-title">Chi tiết thanh toán</h3>
            <div class="payment-details">
              <div v-if="transaction.payment_details.transaction_reference" class="info-item">
                <span class="label">Mã tham chiếu:</span>
                <span class="value">{{ transaction.payment_details.transaction_reference }}</span>
              </div>
              <div v-if="transaction.payment_details.gateway" class="info-item">
                <span class="label">Cổng thanh toán:</span>
                <span class="value">{{ transaction.payment_details.gateway }}</span>
              </div>
              <div v-if="transaction.payment_details.card_last_four" class="info-item">
                <span class="label">Thẻ (4 số cuối):</span>
                <span class="value">**** {{ transaction.payment_details.card_last_four }}</span>
              </div>
            </div>
          </div>

          <!-- Ghi chú -->
          <div v-if="transaction.note || transaction.failure_reason" class="section">
            <h3 class="section-title">Ghi chú</h3>
            <div class="notes">
              <div v-if="transaction.note" class="note-item">
                <span class="note-label">Ghi chú:</span>
                <p class="note-content">{{ transaction.note }}</p>
              </div>
              <div v-if="transaction.failure_reason" class="note-item error">
                <span class="note-label">Lý do thất bại:</span>
                <p class="note-content">{{ transaction.failure_reason }}</p>
              </div>
              <div v-if="transaction.refund_reason" class="note-item warning">
                <span class="note-label">Lý do hoàn tiền:</span>
                <p class="note-content">{{ transaction.refund_reason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-secondary">
          Đóng
        </button>
        <button 
          v-if="canUpdateStatus(transaction?.status)"
          type="button" 
          @click="updateStatus" 
          class="btn btn-primary"
        >
          Cập nhật trạng thái
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
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

const emit = defineEmits(['close', 'update-status'])

const closeModal = () => {
  emit('close')
}

const updateStatus = () => {
  emit('update-status', props.transaction)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPaymentMethod = (method) => {
  const methods = {
    1: 'COD',
    2: 'VNPAY',
    3: 'Thẻ ghi nợ',
  }
  return methods[method] || method || 'N/A'
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

const getAmountClass = (status) => {
  switch (status) {
    case 1:
      return 'amount-completed'
    case 2:
      return 'amount-failed'
    case 3:
      return 'amount-refunded'
    default:
      return 'amount-pending'
  }
}

const canUpdateStatus = (status) => {
  // Chỉ cho phép cập nhật với trạng thái pending hoặc failed
  return status === 0 || status === 2
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
  max-width: 48rem;
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

.section {
  margin-bottom: 2rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  /* color: #6b7280; */
}

.value {
  font-size: 0.875rem;
}

.amount {
  font-weight: 600;
  font-size: 1rem;
}

.amount-completed {
  color: #059669;
}

.amount-failed {
  color: #dc2626;
}

.amount-refunded {
  color: #d97706;
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

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.notes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.note-item.error {
  background: #fef2f2;
  border-color: #fecaca;
}

.note-item.warning {
  background: #fffbeb;
  border-color: #fde68a;
}

.note-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.5rem;
}

.note-content {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
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

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
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

:global(.dark) .section-title {
  color: #f9fafb;
}

:global(.dark) .label {
  color: #94a3b8;
}

:global(.dark) .value {
  color: #e2e8f0;
}

:global(.dark) .payment-details {
  background: #1e293b;
  border-color: #374151;
}

:global(.dark) .note-item {
  background: #1e293b;
  border-color: #374151;
}

:global(.dark) .note-item.error {
  background: #450a0a;
  border-color: #dc2626;
}

:global(.dark) .note-item.warning {
  background: #451a03;
  border-color: #d97706;
}

:global(.dark) .note-label {
  color: #f9fafb;
}

:global(.dark) .note-content {
  color: #94a3b8;
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
@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-width: none;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
