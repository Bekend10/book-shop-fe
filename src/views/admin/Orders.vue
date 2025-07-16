<template>
  <div class="orders-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Quản lý đơn hàng</h1>
      <div class="page-actions">
        <div class="search-container">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            class="search-input"
          />
        </div>
        <select v-model="statusFilter" class="status-filter">
          <option value="">Tất cả trạng thái</option>
          <option value="0">Chờ xử lý</option>
          <option value="1">Đã xác nhận</option>
          <option value="2">Đang giao</option>
          <option value="3">Đã giao</option>
          <option value="4">Đã hủy</option>
        </select>
        <button @click="refreshOrders" class="btn btn-secondary" :disabled="isLoading">
          <RefreshCw class="btn-icon" :class="{ 'animate-spin': isLoading }" />
          Làm mới
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <ShoppingCart />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Tổng đơn hàng</h3>
          <p class="stat-value">{{ orderStats.total }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Clock />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Chờ xử lý</h3>
          <p class="stat-value">{{ orderStats.pending }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Đã giao</h3>
          <p class="stat-value">{{ orderStats.delivered }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
          <DollarSign />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Doanh thu</h3>
          <p class="stat-value">{{ formatCurrency(orderStats.revenue) }}</p>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="table-container">
      <OrderTable
        :orders="filteredOrders"
        :loading="isLoading"
        @view-details="showOrderDetails"
        @update-status="showStatusModal"
        @delete-order="handleDeleteOrder"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-container">
      <div class="pagination-info">
        Hiển thị {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalOrders) }} 
        trong {{ totalOrders }} đơn hàng
      </div>
      <div class="pagination-controls">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <ChevronLeft class="pagination-icon" />
          Trước
        </button>
        <div class="pagination-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            class="pagination-number"
            :class="{ active: page === currentPage }"
          >
            {{ page }}
          </button>
        </div>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Sau
          <ChevronRight class="pagination-icon" />
        </button>
      </div>
    </div>

    <!-- Modals -->
    <OrderDetailsModal
      :show="showDetailsModal"
      :order="selectedOrder"
      @close="closeDetailsModal"
      @update-status="showStatusModal"
    />

    <OrderStatusModal
      :show="showUpdateModal"
      :order="selectedOrder"
      @close="closeStatusModal"
      @updated="handleStatusUpdate"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <div class="modal-header">
          <h2 class="modal-title">Xác nhận xóa đơn hàng</h2>
          <button @click="closeDeleteModal" class="close-btn">
            <X class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc chắn muốn xóa đơn hàng #{{ orderToDelete?.order_id }}?</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Hành động này không thể hoàn tác.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn btn-secondary">
            Hủy
          </button>
          <button @click="confirmDeleteOrder" class="btn btn-danger" :disabled="isDeleting">
            <span v-if="isDeleting" class="loading-spinner"></span>
            {{ isDeleting ? 'Đang xóa...' : 'Xóa' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  Search, 
  RefreshCw, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'
import OrderTable from '@/components/admin/OrderTable.vue'
import OrderDetailsModal from '@/components/admin/OrderDetailsModal.vue'
import OrderStatusModal from '@/components/admin/OrderStatusModal.vue'

// Store
const orderStore = useOrderStore()

// State
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Modal states
const showDetailsModal = ref(false)
const showUpdateModal = ref(false)
const showDeleteModal = ref(false)
const selectedOrder = ref(null)
const orderToDelete = ref(null)
const isDeleting = ref(false)

// Computed
const filteredOrders = computed(() => {
  let orders = orderStore.filteredOrders
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    orders = orders.filter(order => 
      order.order_id.toString().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.customer_email.toLowerCase().includes(query)
    )
  }
  
  if (statusFilter.value) {
    orders = orders.filter(order => order.status === statusFilter.value)
  }
  
  // Pagination
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return orders.slice(start, end)
})

const totalOrders = computed(() => {
  let orders = orderStore.filteredOrders
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    orders = orders.filter(order => 
      order.order_id.toString().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.customer_email.toLowerCase().includes(query)
    )
  }
  
  if (statusFilter.value) {
    orders = orders.filter(order => order.status === statusFilter.value)
  }
  
  return orders.length
})

const totalPages = computed(() => Math.ceil(totalOrders.value / pageSize.value))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const orderStats = computed(() => {
  const orders = orderStore.orders
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total_amount, 0)
  }
})

// Watch for filter changes to reset pagination
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

// Methods
const fetchOrders = async () => {
  isLoading.value = true
  try {
    await orderStore.fetchOrders()
  } catch (error) {
    console.error('Error fetching orders:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshOrders = () => {
  fetchOrders()
}

const showOrderDetails = (order) => {
  selectedOrder.value = order
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedOrder.value = null
}

const showStatusModal = (order) => {
  selectedOrder.value = order
  showUpdateModal.value = true
  showDetailsModal.value = false
}

const closeStatusModal = () => {
  showUpdateModal.value = false
  selectedOrder.value = null
}

const handleStatusUpdate = async ({ orderId, updateData }) => {
  try {
    await orderStore.updateOrderStatus(orderId, updateData)
    // Refresh orders after update
    await fetchOrders()
  } catch (error) {
    console.error('Error updating order status:', error)
  }
}

const handleDeleteOrder = (order) => {
  orderToDelete.value = order
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  orderToDelete.value = null
}

const confirmDeleteOrder = async () => {
  if (!orderToDelete.value) return
  
  isDeleting.value = true
  try {
    await orderStore.deleteOrder(orderToDelete.value.order_id)
    closeDeleteModal()
    await fetchOrders()
  } catch (error) {
    console.error('Error deleting order:', error)
  } finally {
    isDeleting.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Lifecycle
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-page {
  padding: 1.5rem;
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: #6b7280;
  pointer-events: none;
}

.search-input {
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  min-width: 250px;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.status-filter {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  min-width: 150px;
  background: white;
}

.status-filter:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.table-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 2rem;
}

.pagination-container {
  display: flex;
  justify-content: between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.pagination-numbers {
  display: flex;
  gap: 0.25rem;
}

.pagination-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-number:hover {
  background: #f9fafb;
}

.pagination-number.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Modal styles */
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
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 28rem;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.125rem;
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
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Dark mode */
:global(.dark) .page-title {
  color: #f9fafb;
}

:global(.dark) .search-input,
:global(.dark) .status-filter {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

:global(.dark) .search-icon {
  color: #9ca3af;
}

:global(.dark) .btn-secondary {
  background: #374151;
  color: #d1d5db;
}

:global(.dark) .btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

:global(.dark) .stat-card {
  background: #1f2937;
  border-color: #374151;
}

:global(.dark) .stat-title {
  color: #9ca3af;
}

:global(.dark) .stat-value {
  color: #f9fafb;
}

:global(.dark) .table-container {
  background: #1f2937;
  border-color: #374151;
}

:global(.dark) .pagination-info {
  color: #9ca3af;
}

:global(.dark) .pagination-btn,
:global(.dark) .pagination-number {
  background: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}

:global(.dark) .pagination-btn:hover:not(:disabled),
:global(.dark) .pagination-number:hover {
  background: #4b5563;
}

:global(.dark) .pagination-number.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
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

:global(.dark) .modal-footer {
  border-color: #374151;
}

/* Responsive */
@media (max-width: 768px) {
  .orders-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-actions {
    flex-direction: column;
  }
  
  .search-input {
    min-width: 100%;
  }
  
  .status-filter {
    min-width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: center;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
