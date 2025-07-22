<template>
  <div class="transaction-table-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    <!-- Header với Search và Actions -->
    <div class="table-header">
      <div class="search-section">
        <div class="search-bar">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Tìm kiếm giao dịch..."
            class="search-input dark:bg-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
      
      <div class="actions-section">
        <select 
          v-model="statusFilter" 
          @change="handleStatusFilter"
          class="status-filter dark:bg-gray-700 dark:text-gray-300"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="0">Đang chờ</option>
          <option value="1">Hoàn thành</option>
          <option value="2">Thất bại</option>
          <option value="3">Hoàn tiền</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead class="table-header-row">
          <tr>
            <th class="table-cell">Mã giao dịch</th>
            <th class="table-cell">Đơn hàng</th>
            <th class="table-cell">Khách hàng</th>
            <th class="table-cell">Số tiền</th>
            <th class="table-cell">Phương thức</th>
            <th class="table-cell">Trạng thái</th>
            <th class="table-cell">Ngày tạo</th>
            <th class="actions-column">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in paginatedTransactions"
            :key="transaction.payment_id"
            class="table-row bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
          >
            <td class="table-cell text-gray-900 dark:text-gray-100">
              <div class="transaction-id">
                #{{ transaction.paymentId }}
              </div>
            </td>
            <td class="table-cell text-gray-900 dark:text-gray-100">
              <div class="order-id">
                #{{ transaction.orderId }}
              </div>
            </td>
            <td class="table-cell text-gray-900 dark:text-gray-100">
              <div class="customer-info">
                <div class="customer-name">{{ transaction.user?.first_name }} {{ transaction.user?.last_name }}</div>
                <div class="customer-email text-gray-600 dark:text-gray-300">
                  {{ transaction.user?.email }}
                </div>
              </div>
            </td>
            <td class="table-cell text-gray-600 dark:text-gray-300">
              <span class="amount" :class="getAmountClass(transaction.paymentStatus)">
                {{ formatCurrency(transaction.amount) }}
              </span>
            </td>
            <td class="table-cell text-gray-600 dark:text-gray-300">
              <span class="payment-method">
                {{ formatPaymentMethod(transaction.methodId) }}
              </span>
            </td>
            <td class="table-cell">
              <span 
                class="status-badge"
                :class="getStatusClass(transaction.paymentStatus)"
              >
                {{ getStatusText(transaction.paymentStatus) }}
              </span>
            </td>
            <td class="table-cell text-gray-600 dark:text-gray-300">
              <span class="transaction-date">{{ formatDate(transaction.paymentDate) }}</span>
            </td>
            <td class="actions-column">
              <div class="action-buttons">
                <button
                  @click="$emit('view-details', transaction)"
                  class="btn btn-icon-only btn-primary-outline dark:border-gray-600"
                  title="Xem chi tiết"
                >
                  <Eye class="btn-icon" />
                </button>
                <!-- <button
                  @click="$emit('update-status', transaction)"
                  class="btn btn-icon-only btn-success-outline dark:border-gray-600"
                  title="Cập nhật trạng thái"
                  :disabled="transaction.status === 1 || transaction.status === 3"
                >
                  <RefreshCw class="btn-icon" />
                </button>
                <button
                  @click="$emit('delete-transaction', transaction)"
                  class="btn btn-icon-only btn-danger-outline dark:border-gray-600"
                  title="Xóa"
                >
                  <Trash2 class="btn-icon" />
                </button> -->
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          <p class="results-info">
            Hiển thị {{ paginationInfo.start }}-{{ paginationInfo.end }} của {{ paginationInfo.total }} giao dịch
          </p>
        </div>
        
        <div class="pagination-controls">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="pagination-btn"
            :class="{ 'pagination-btn-disabled': currentPage === 1 }"
          >
            Đầu
          </button>
          
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="pagination-btn"
            :class="{ 'pagination-btn-disabled': currentPage === 1 }"
          >
            Trước
          </button>
          
          <div class="pagination-numbers">
            <button
              v-for="page in getVisiblePages"
              :key="page"
              @click="currentPage = page"
              class="pagination-number"
              :class="{ 'pagination-number-active': page === currentPage }"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            :class="{ 'pagination-btn-disabled': currentPage === totalPages }"
          >
            Sau
          </button>
          
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            :class="{ 'pagination-btn-disabled': currentPage === totalPages }"
          >
            Cuối
          </button>
        </div>
        
        <div class="items-per-page">
          <select 
            v-model="itemsPerPage" 
            @change="currentPage = 1"
            class="items-per-page-select dark:bg-gray-700 dark:text-gray-300"
          >
            <option value="5">5/trang</option>
            <option value="10">10/trang</option>
            <option value="20">20/trang</option>
            <option value="50">50/trang</option>
          </select>
        </div>
      </div>

      <!-- Footer thông tin khi không có phân trang -->
      <div v-else-if="filteredTransactions.length > 0" class="table-footer dark:bg-gray-700">
        <p class="results-info">
          Hiển thị {{ filteredTransactions.length }} giao dịch
          <span v-if="filteredTransactions.length !== transactions.length">
            ({{ transactions.length }} tổng)
          </span>
        </p>
      </div>

      <!-- Empty State -->
      <div v-if="paginatedTransactions.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <CreditCard class="empty-icon-svg" />
        </div>
        <div v-if="searchQuery || statusFilter" class="empty-title">Không tìm thấy giao dịch</div>
        <div v-else class="empty-title">Chưa có giao dịch nào</div>
        <div v-if="searchQuery || statusFilter" class="empty-subtitle">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
        </div>
        <div v-else class="empty-subtitle">Giao dịch sẽ xuất hiện ở đây khi có thanh toán</div>
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
import { Search, Eye, RefreshCw, Trash2, CreditCard } from 'lucide-vue-next'

const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-details',
  'update-status',
  'delete-transaction'
])

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed filtered transactions
const filteredTransactions = computed(() => {
  let transactions = props.transactions

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    transactions = transactions.filter(transaction =>
      transaction.paymentId.toString().includes(query) ||
      transaction.orderId?.toString().includes(query) ||
      transaction.user?.first_name.toLowerCase().includes(query) ||
      transaction.user?.last_name.toLowerCase().includes(query) ||
      transaction.user?.email.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== '') {
    transactions = transactions.filter(transaction => transaction.paymentStatus === parseInt(statusFilter.value))
  }

  return transactions
})

// Computed paginated transactions
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTransactions.value.slice(start, end)
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
})

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(start + itemsPerPage.value - 1, filteredTransactions.value.length)
  return {
    start,
    end,
    total: filteredTransactions.value.length
  }
})

// Methods
const handleSearch = () => {
  // Reset về trang đầu khi search
  currentPage.value = 1
}

const handleStatusFilter = () => {
  // Reset về trang đầu khi filter
  currentPage.value = 1
}

// Computed để hiển thị các trang
const getVisiblePages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, currentPage.value - delta);
       i <= Math.min(totalPages.value - 1, currentPage.value + delta);
       i++) {
    range.push(i)
  }

  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (currentPage.value + delta < totalPages.value - 1) {
    rangeWithDots.push('...', totalPages.value)
  } else if (totalPages.value > 1) {
    rangeWithDots.push(totalPages.value)
  }

  return rangeWithDots.filter((item, index, array) => array.indexOf(item) === index)
})

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
    month: '2-digit',
    day: '2-digit',
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
</script>

<style scoped>
/* Container overflow prevention */
.transaction-table-container {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  width: 100%;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.table-wrapper {
  overflow-x: auto;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  transition: background-color 0.3s ease, border-color 0.3s ease;
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
  transition: color 0.3s ease;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #111827;
  transition: border-color 0.2s ease, background-color 0.3s ease, color 0.3s ease;
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

.status-filter {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #111827;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.table-wrapper {
  border: none;
  border-radius: 0;
  overflow-x: auto;
  background: white;
  transition: background-color 0.3s ease;
}

/* Scrollbar styling */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
  transition: background-color 0.3s ease;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox scrollbar */
.table-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  transition: background-color 0.3s ease;
}

.table-header-row {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.table-header-row th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  position: sticky;
  top: 0;
  background: #f9fafb;
  z-index: 10;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Column widths - optimized for full page width */
.data-table th:nth-child(1) { width: 12%; min-width: 100px; } /* Mã giao dịch */
.data-table th:nth-child(2) { width: 10%; min-width: 80px; } /* Đơn hàng */
.data-table th:nth-child(3) { width: 20%; min-width: 180px; } /* Khách hàng */
.data-table th:nth-child(4) { width: 12%; min-width: 100px; } /* Số tiền */
.data-table th:nth-child(5) { width: 15%; min-width: 120px; } /* Phương thức */
.data-table th:nth-child(6) { width: 15%; min-width: 120px; } /* Trạng thái */
.data-table th:nth-child(7) { width: 12%; min-width: 100px; } /* Ngày tạo */
.data-table th:nth-child(8) { width: 10%; min-width: 100px; } /* Thao tác */

.data-table td:nth-child(1) { width: 12%; min-width: 100px; }
.data-table td:nth-child(2) { width: 10%; min-width: 80px; }
.data-table td:nth-child(3) { width: 25%; min-width: 180px; }
.data-table td:nth-child(4) { width: 12%; min-width: 100px; }
.data-table td:nth-child(5) { width: 15%; min-width: 120px; }
.data-table td:nth-child(6) { width: 10%; min-width: 80px; }
.data-table td:nth-child(7) { width: 12%; min-width: 100px; }
.data-table td:nth-child(8) { width: 14%; min-width: 120px; }

.actions-column {
  text-align: center;
  min-width: 120px;
  width: 14%;
}

.table-cell {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #111827;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  transition: border-color 0.3s ease, color 0.3s ease;
}

.table-row {
  transition: background-color 0.2s ease;
  background: white;
}

.table-row:hover {
  background: #f9fafb;
}

.transaction-id, .order-id {
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.customer-name {
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.customer-email {
  font-size: 0.75rem;
  margin-top: 0.125rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.amount {
  font-weight: 600;
  font-size: 0.875rem;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.payment-method {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #2f5da6;
  color: white;
  border-radius: 0.25rem;
  font-weight: 500;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
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

.transaction-date {
  font-size: 0.75rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-wrap: wrap;
  gap: 1rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.pagination-info {
  flex: 0 0 auto;
  min-width: 200px;
}

.results-info {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  min-width: 300px;
}

.pagination-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pagination-btn:hover:not(.pagination-btn-disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn-disabled {
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-numbers {
  display: flex;
  gap: 0.25rem;
  margin: 0 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-number {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  text-align: center;
}

.pagination-number:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-number-active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.pagination-number-active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.items-per-page {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  min-width: 120px;
}

.items-per-page-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  color: #111827;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.table-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
  font-size: 14px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-primary-outline {
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-primary-outline:hover:not(:disabled) {
  background: #eff6ff;
}

.btn-success-outline {
  color: #059669;
  border: 1px solid #059669;
}

.btn-success-outline:hover:not(:disabled) {
  background: #ecfdf5;
}

.btn-danger-outline {
  color: #dc2626;
  border: 1px solid #dc2626;
}

.btn-danger-outline:hover:not(:disabled) {
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
  transition: color 0.3s ease;
}

.empty-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  transition: color 0.3s ease;
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
  transition: color 0.3s ease;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode styles */
.dark .transaction-table-container {
  background: #1f2937;
  border-color: #374151;
  border : 1px solid #e5e7eb;
}

.dark .table-header {
  background: #1f2937;
  border-bottom-color: #374151;
    border : 1px solid #e5e7eb;

}

.dark .table-wrapper {
  background: #1f2937;
}

.dark .table-wrapper::-webkit-scrollbar-track {
  background: #374151;
}

.dark .table-wrapper::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .table-wrapper {
  scrollbar-color: #6b7280 #374151;
}

.dark .data-table {
  background: #1f2937;
  border-color: #374151;
}

.dark .table-header-row {
  background: #374151;
  border-bottom-color: #4b5563;
}

.dark .table-header-row th {
  color: #d1d5db;
  background: #374151;
}

.dark .table-cell {
  color: #e5e7eb;
  border-bottom-color: #374151;
}

.dark .table-row {
  background: #1f2937;
}

.dark .table-row:hover {
  background: #374151;
}

.dark .customer-name {
  color: #f3f4f6;
}

.dark .customer-email {
  color: #9ca3af;
}

.dark .transaction-date {
  color: #9ca3af;
}

.dark .search-input {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
  border : 1px solid #e5e7eb;
}

.dark .search-input:focus {
  border-color: #3b82f6;
}

.dark .search-icon {
  color: #9ca3af;
}

.dark .status-filter {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
  border : 1px solid #e5e7eb;
}

.dark .pagination-container {
  background: #374151;
  /* border-top-color: #4b5563; */
  border : 1px solid #e5e7eb;
}

.dark .results-info {
  color: #d1d5db;
}

.dark .pagination-btn {
  background: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

.dark .pagination-btn:hover:not(.pagination-btn-disabled) {
  background: #374151;
  border-color: #9ca3af;
}

.dark .pagination-btn-disabled {
  color: #6b7280;
}

.dark .pagination-number {
  background: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

.dark .pagination-number:hover {
  background: #374151;
  border-color: #9ca3af;
}

.dark .pagination-number-active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.dark .items-per-page-select {
  background: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

.dark .table-footer {
  background: #374151;
  border-top-color: #4b5563;
  color: #d1d5db;
}

.dark .empty-title {
  color: #f9fafb;
}

.dark .empty-subtitle {
  color: #d1d5db;
}

.dark .loading-text {
  color: #d1d5db;
}

.dark .payment-method {
  background: #4b5563;
  color: #d1d5db;
}

/* Responsive */
@media (max-width: 1200px) {
  .table-cell {
    padding: 0.5rem 0.375rem;
    font-size: 0.8rem;
  }
  
  .table-header-row th {
    padding: 0.5rem 0.375rem;
    font-size: 0.7rem;
  }
  
  .customer-name {
    font-size: 0.8rem;
  }
  
  .customer-email {
    font-size: 0.7rem;
  }
  
  .transaction-id, .order-id {
    font-size: 0.8rem;
  }
  
  .amount {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }
  
  .search-section {
    max-width: none;
    width: 100%;
  }
  
  .actions-section {
    justify-content: flex-start;
    margin-left: 0;
    width: 100%;
  }
  
  .status-filter {
    width: 100%;
    max-width: 200px;
  }
  
  .table-wrapper {
    overflow-x: auto;
    border-radius: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }
  
  .data-table {
    min-width: 50rem;
  }
  
  .table-cell {
    padding: 0.375rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .table-header-row th {
    padding: 0.375rem 0.25rem;
    font-size: 0.65rem;
  }
  
  .customer-name {
    font-size: 0.75rem;
  }
  
  .customer-email {
    font-size: 0.65rem;
  }
  
  .transaction-id,
  .order-id {
    font-size: 0.75rem;
  }
  
  .amount {
    font-size: 0.75rem;
  }
  
  .status-badge {
    padding: 0.125rem 0.375rem;
    font-size: 0.65rem;
  }
  
  .payment-method {
    font-size: 0.65rem;
    padding: 0.125rem 0.25rem;
  }
  
  .transaction-date {
    font-size: 0.65rem;
  }
  
  .action-buttons {
    gap: 0.125rem;
    flex-direction: column;
  }
  
  .btn-icon-only {
    padding: 0.25rem;
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .btn-icon {
    width: 0.75rem;
    height: 0.75rem;
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }
  
  .pagination-info {
    order: 3;
    text-align: center;
    min-width: auto;
    width: 100%;
  }
  
  .pagination-controls {
    order: 2;
    justify-content: center;
    flex-wrap: wrap;
    min-width: auto;
    width: 100%;
  }
  
  .pagination-numbers {
    order: 1;
    justify-content: center;
    margin: 0;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    padding: 0.25rem 0;
  }
  
  .pagination-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .pagination-number {
    padding: 0.375rem 0.5rem;
    min-width: 2rem;
    font-size: 0.75rem;
  }
  
  .items-per-page {
    order: 0;
    justify-content: center;
    min-width: auto;
    width: 100%;
  }
  
  .items-per-page-select {
    width: 150px;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-icon-svg {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .empty-title {
    font-size: 1rem;
  }
  
  .empty-subtitle {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .table-header {
    padding: 0.75rem;
  }
  
  .table-wrapper {
    overflow-x: scroll;
  }
  
  .data-table {
    min-width: 50rem;
  }
  
  .table-cell {
    padding: 0.25rem 0.125rem;
    font-size: 0.7rem;
  }
  
  .table-header-row th {
    padding: 0.25rem 0.125rem;
    font-size: 0.6rem;
  }
  
  .customer-name {
    font-size: 0.7rem;
  }
  
  .customer-email {
    font-size: 0.6rem;
  }
  
  .transaction-id,
  .order-id {
    font-size: 0.7rem;
  }
  
  .amount {
    font-size: 0.7rem;
  }
  
  .status-badge {
    padding: 0.1rem 0.25rem;
    font-size: 0.6rem;
  }
  
  .payment-method {
    font-size: 0.6rem;
    padding: 0.1rem 0.2rem;
  }
  
  .transaction-date {
    font-size: 0.6rem;
  }
  
  .action-buttons {
    gap: 0.1rem;
  }
  
  .btn-icon-only {
    padding: 0.1875rem;
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .btn-icon {
    width: 0.625rem;
    height: 0.625rem;
  }
  
  .pagination-container {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .pagination-btn {
    padding: 0.25rem 0.375rem;
    font-size: 0.7rem;
  }
  
  .pagination-number {
    padding: 0.25rem 0.375rem;
    min-width: 1.75rem;
    font-size: 0.7rem;
  }
  
  .items-per-page-select {
    width: 120px;
    font-size: 0.75rem;
  }
  
  .search-input {
    font-size: 0.8rem;
  }
  
  .status-filter {
    font-size: 0.8rem;
  }
}
</style>
