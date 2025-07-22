<template>
  <div class="order-table-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    <!-- Header với Search và Actions -->
    <div class="table-header">
      <div class="search-section">
        <div class="search-bar">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
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
          <option value="0">Chờ xử lý</option>
          <option value="1">Đã xác nhận</option>
          <option value="2">Đang giao</option>
          <option value="3">Đã giao</option>
          <option value="4">Đã hủy</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <thead class="table-header-row bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white">
          <tr>
            <th class="table-cell">Mã đơn hàng</th>
            <th class="table-cell">Khách hàng</th>
            <th class="table-cell">Tổng tiền</th>
            <th class="table-cell">Trạng thái</th>
            <th class="table-cell">Ngày đặt</th>
            <th class="actions-column">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in paginatedOrders"
            :key="order.order_id"
            class="table-row bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
          >
            <td class="table-cell text-gray-900 dark:text-gray-100">
              <div class="order-id">
                #{{ order.order_id }}
              </div>
            </td>
            <td class="table-cell text-gray-900 dark:text-gray-100">
              <div class="customer-info">
                <div class="customer-name">{{ order.user.first_name }} {{ order.user.last_name }}</div>
                <div class="customer-contact text-gray-600 dark:text-gray-300">
                  {{ order.customer_email }}
                </div>
              </div>
            </td>
            <td class="table-cell text-gray-600 dark:text-gray-300">
              <span class="total-amount">
                {{ formatCurrency(order.total_amount) }}
              </span>
            </td>
            <td class="table-cell">
              <span 
                class="status-badge"
                :class="getStatusClass(order.status)"
              >
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td class="table-cell text-gray-600 dark:text-gray-300">
              <span class="order-date">{{ formatDate(order.order_date) }}</span>
            </td>
            <td class="actions-column">
              <div class="action-buttons">
                <button
                  @click="$emit('view-details', order)"
                  class="btn btn-icon-only btn-primary-outline dark:border-gray-600"
                  title="Xem chi tiết"
                >
                  <Eye class="btn-icon" />
                </button>
                <button
                  @click="$emit('update-status', order)"
                  class="btn btn-icon-only btn-success-outline dark:border-gray-600"
                  title="Cập nhật trạng thái"
                >
                  <RefreshCw class="btn-icon" />
                </button>
                <button
                  @click="$emit('delete-order', order)"
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
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          <p class="results-info">
            Hiển thị {{ paginationInfo.start }}-{{ paginationInfo.end }} trên {{ paginationInfo.total }} đơn hàng
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
      <div v-else-if="filteredOrders.length > 0" class="table-footer">
        <p class="results-info">
          Hiển thị {{ filteredOrders.length }} đơn hàng
          <span v-if="filteredOrders.length !== orders.length">
            ({{ orders.length }} tổng)
          </span>
        </p>
      </div>

      <!-- Empty State -->
      <div v-if="paginatedOrders.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <ShoppingCart class="empty-icon-svg" />
        </div>
        <div v-if="searchQuery || statusFilter" class="empty-title">Không tìm thấy đơn hàng</div>
        <div v-else class="empty-title">Chưa có đơn hàng nào</div>
        <div v-if="searchQuery || statusFilter" class="empty-subtitle">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
        </div>
        <div v-else class="empty-subtitle">Đơn hàng sẽ xuất hiện ở đây khi có khách đặt hàng</div>
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
import { ref, computed, watch } from 'vue'
import { Search, Eye, RefreshCw, Trash2, ShoppingCart } from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'

const orderStore = useOrderStore()

const props = defineProps({
  orders: {
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
  'delete-order'
])

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed filtered orders
const filteredOrders = computed(() => {
  let orders = props.orders

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    orders = orders.filter(order =>
      order.order_id.toString().includes(query) ||
      order.user?.first_name.toLowerCase().includes(query) ||
      order.user?.last_name.toLowerCase().includes(query) ||
      order.user?.email.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== '') {
    orders = orders.filter(order => order.status === parseInt(statusFilter.value))
  }

  return orders
})

// Computed paginated orders
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredOrders.value.slice(start, end)
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage.value)
})

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(start + itemsPerPage.value - 1, filteredOrders.value.length)
  return {
    start,
    end,
    total: filteredOrders.value.length
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
  return date.toLocaleDateString('vi-VN')
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
</script>

<style scoped>
.order-table-container {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
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
  border: 1px solid #d1d5db;
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

.status-filter {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
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
  border-bottom: 1px solid #e5e7eb;
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

.actions-column {
  width: 12rem;
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
}

.table-row:hover {
  background: #f9fafb;
}

.order-id {
  font-weight: 600;
  color: #3b82f6;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 500;
  /* color: #111827; */
}

.customer-contact {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.total-amount {
  font-weight: 600;
  color: #059669;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
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

.order-date {
  /* color: #6b7280; */
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.table-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  /* background: #f9fafb; */
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  flex: 1;
  min-width: 200px;
  font-size: 12px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 2;
  justify-content: center;
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
  flex: 1;
  display: flex;
  justify-content: flex-end;
  min-width: 120px;
}

.items-per-page-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 12px;
  background: white;
  cursor: pointer;
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

.btn-primary-outline {
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-primary-outline:hover {
  background: #eff6ff;
}

.btn-success-outline {
  color: #059669;
  border: 1px solid #059669;
}

.btn-success-outline:hover {
  background: #ecfdf5;
}

.btn-danger-outline {
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
:global(.dark) .order-table-container {
  background: #0f172a;
}

:global(.dark) .table-header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

:global(.dark) .table-header-row {
  background: #1e293b;
  border-color: #334155;
}

:global(.dark) .table-header-row th {
  color: #94a3b8;
}

:global(.dark) .table-cell {
  color: #cbd5e1;
  border-bottom: 1px solid #374151;
}

:global(.dark) .customer-name {
  color: #e2e8f0;
}

:global(.dark) .customer-contact {
  color: #94a3b8;
}

:global(.dark) .order-date {
  color: #94a3b8;
}

:global(.dark) .table-row:hover {
  background: #1e293b;
}

:global(.dark) .search-input {
  background: #1e293b;
}

:global(.dark) .status-filter {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

:global(.dark) .table-footer {
  background-color: #374151;
}

:global(.dark) .pagination-container {
  background: #374151;
  border-top: 1px solid #4b5563;
}

:global(.dark) .pagination-btn {
  background: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

:global(.dark) .pagination-btn:hover:not(.pagination-btn-disabled) {
  background: #374151;
  border-color: #9ca3af;
}

:global(.dark) .pagination-btn-disabled {
  color: #6b7280;
}

:global(.dark) .pagination-number {
  background: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

:global(.dark) .pagination-number:hover {
  background: #374151;
  border-color: #9ca3af;
}

:global(.dark) .pagination-number-active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

:global(.dark) .items-per-page-select {
  background: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

:global(.dark) .empty-title {
  color: #f9fafb;
}

:global(.dark) .empty-subtitle {
  color: #d1d5db;
}

:global(.dark) .loading-text {
  color: #d1d5db;
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
    min-width: 50rem;
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .pagination-info,
  .items-per-page {
    justify-content: center;
    text-align: center;
  }
  
  .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .pagination-numbers {
    order: -1;
    justify-content: center;
    margin: 0;
  }
}
</style>
