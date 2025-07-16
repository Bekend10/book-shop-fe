<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div class="modal-header">
        <h2 class="modal-title">Chi tiết đơn hàng #{{ order?.order_id }}</h2>
        <button @click="closeModal" class="close-btn">
          <X class="close-icon" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="order" class="order-details">
          <!-- Thông tin khách hàng -->
          <div class="section">
            <h3 class="section-title">Thông tin khách hàng</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Tên khách hàng:</span>
                <span class="value">{{ order.user.first_name }} {{ order.user.last_name }} </span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">{{ order.user.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">Số điện thoại:</span>
                <span class="value">{{ order.user.phone_number }}</span>
              </div>
              <div class="info-item">
                <span class="label">Địa chỉ:</span>
                <span class="value">{{ formatAddress(order.address) }}</span>
              </div>
            </div>
          </div>

          <!-- Thông tin đơn hàng -->
          <div class="section">
            <h3 class="section-title">Thông tin đơn hàng</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Mã đơn hàng:</span>
                <span class="value">#{{ order.order_id }}</span>
              </div>
              <div class="info-item">
                <span class="label">Ngày đặt:</span>
                <span class="value">{{ formatDate(order.order_date) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Trạng thái:</span>
                <span class="status-badge" :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Phương thức thanh toán:</span>
                <span class="value">{{ order.payment_method || 'COD' }}</span>
              </div>
            </div>
          </div>

          <!-- Danh sách sản phẩm -->
          <div class="section">
            <h3 class="section-title">Sản phẩm đặt hàng</h3>
            <div class="products-list">
              <div v-for="item in Array.isArray(order.items) ? order.items : [order.items]" :key="item.book_id"
                class="product-item">
                <div class="product-image">
                  <img :src="item.image_url || '/placeholder-book.jpg'" :alt="item.image_url" class="book-cover" />
                </div>
                <div class="product-info">
                  <h4 class="product-title">{{ item.title }}</h4>
                  <p class="product-author">{{ item.author?.name }}</p>
                  <div class="product-details">
                    <span class="price">{{ formatCurrency(item.price) }}</span>
                    <span class="quantity">x{{ item.quantity }}</span>
                    <span class="subtotal">{{ formatCurrency(item.price * item.quantity) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tổng cộng -->
          <div class="section">
            <div class="order-summary">
              <div class="summary-row">
                <span class="label">Tạm tính:</span>
                <span class="value">{{ formatCurrency(order.total_amount || calculateSubtotal()) }}</span>
              </div>
              <div class="summary-row">
                <span class="label">Phí vận chuyển:</span>
                <span class="value">{{ formatCurrency(order.shipping_fee || 0) }}</span>
              </div>
              <div class="summary-row total">
                <span class="label">Tổng cộng:</span>
                <span class="value">{{ formatCurrency(order.total_amount + (order.shipping_fee || 0)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-secondary">
          Đóng
        </button>
        <button v-if="order?.status !== 'delivered' && order?.status !== 'cancelled'" type="button"
          @click="updateStatus" class="btn btn-primary">
          Cập nhật trạng thái
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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

const emit = defineEmits(['close', 'update-status'])

const closeModal = () => {
  emit('close')
}

const updateStatus = () => {
  emit('update-status', props.order)
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

const calculateSubtotal = () => {
  if (!props.order?.items) return 0
  const items = Array.isArray(props.order.items)
    ? props.order.items
    : [props.order.items];

  items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

const formatAddress = (address) => {
  if (!address) return 'Chưa có địa chỉ'

  const addressParts = [
    address.house_number,
    address.commune,
    address.district,
    address.councious,
    address.country
  ].filter(part => part && part.trim() !== '')

  return addressParts.length > 0 ? addressParts.join(', ') : 'Chưa có địa chỉ'
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
  /* color: #111827; */
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
  /* color: #6b7280; */
  font-weight: 500;
}

.value {
  font-size: 0.875rem;
  /* color: #111827; */
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

.products-list {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.product-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  flex-shrink: 0;
}

.book-cover {
  width: 4rem;
  height: 5rem;
  object-fit: cover;
  border-radius: 0.25rem;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-title {
  font-size: 0.875rem;
  font-weight: 600;
  /*color: #111827;*/
  margin: 0;
}

.product-author {
  font-size: 0.75rem;
  /* color: #6b7280; */
  margin: 0;
}

.product-details {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: auto;
}

.price {
  font-size: 0.875rem;
  color: #059669;
  font-weight: 600;
}

.quantity {
  font-size: 0.875rem;
  /* color: #6b7280; */
}

.subtotal {
  font-size: 0.875rem;
  /* color: #111827; */
  font-weight: 600;
  margin-left: auto;
}

.order-summary {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  /* background: #f9fafb; */
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.summary-row.total {
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 600;
  font-size: 1.125rem;
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

:global(.dark) .products-list {
  border-color: #374151;
}

:global(.dark) .product-item {
  border-color: #374151;
}

:global(.dark) .product-title {
  color: #f9fafb;
}

:global(.dark) .product-author {
  color: #94a3b8;
}

:global(.dark) .subtotal {
  color: #f9fafb;
}

:global(.dark) .order-summary {
  background: #1e293b;
  border-color: #374151;
}

:global(.dark) .summary-row.total {
  border-color: #374151;
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

  .product-item {
    flex-direction: column;
    gap: 0.75rem;
  }

  .product-details {
    justify-content: space-between;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
