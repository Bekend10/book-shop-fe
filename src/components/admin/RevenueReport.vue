<template>
  <div class="revenue-report">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Báo cáo doanh thu</h1>
          <p class="page-subtitle">Theo dõi và phân tích doanh thu bán hàng</p>
        </div>
        <div class="header-actions">
          <button
            @click="exportReport('excel')"
            class="btn btn-success"
            :disabled="loading"
          >
            <FileSpreadsheet class="btn-icon" />
            Xuất Excel
          </button>
          <button
            @click="exportReport('pdf')"
            class="btn btn-danger"
            :disabled="loading"
          >
            <FileText class="btn-icon" />
            Xuất PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="filter-section">
      <div class="date-range-picker">
        <div class="date-input-group">
          <label class="date-label">Từ ngày:</label>
          <input
            v-model="localDateRange.startDate"
            type="date"
            class="date-input"
          />
        </div>
        <div class="date-input-group">
          <label class="date-label">Đến ngày:</label>
          <input
            v-model="localDateRange.endDate"
            type="date"
            class="date-input"
          />
        </div>
        <button
          @click="applyDateFilter"
          class="btn btn-primary"
          :disabled="loading"
        >
          <Search class="btn-icon" />
          Áp dụng
        </button>
        <button
          @click="resetDateFilter"
          class="btn btn-secondary"
        >
          <RotateCcw class="btn-icon" />
          Đặt lại
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <DollarSign class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Tổng doanh thu</div>
          <div class="stat-value">{{ formattedRevenueStats.totalRevenue }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <ShoppingCart class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Tổng đơn hàng</div>
          <div class="stat-value">{{ formattedRevenueStats.totalOrders }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <TrendingUp class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Giá trị đơn hàng TB</div>
          <div class="stat-value">{{ formattedRevenueStats.avgOrderValue }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-info">
          <Package class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Sản phẩm đã bán</div>
          <div class="stat-value">{{ formattedRevenueStats.totalProducts }}</div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-grid">
        <!-- Monthly Revenue Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Doanh thu theo tháng</h3>
          </div>
          <div class="chart-content">
            <!-- Simple Revenue Chart Placeholder -->
            <div class="simple-chart">
              <div v-if="loading" class="chart-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">Đang tải biểu đồ...</div>
              </div>
              <div v-else-if="monthlyRevenue.length === 0" class="chart-empty">
                <TrendingUp class="empty-icon" />
                <div class="empty-text">Không có dữ liệu biểu đồ</div>
              </div>
              <div v-else class="chart-bars">
                <div
                  v-for="(item, index) in monthlyRevenue.slice(0, 6)"
                  :key="index"
                  class="chart-bar"
                  :style="{ height: `${(item.revenue / maxMonthlyRevenue * 80) + 20}%` }"
                  :title="`${item.month}: ${formatCurrency(item.revenue)}`"
                >
                  <div class="bar-label">{{ formatMonth(item.month) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue by Category Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Doanh thu theo danh mục</h3>
          </div>
          <div class="chart-content">
            <!-- Simple Category Chart Placeholder -->
            <div class="simple-pie-chart">
              <div v-if="loading" class="chart-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">Đang tải biểu đồ...</div>
              </div>
              <div v-else-if="revenueByCategory.length === 0" class="chart-empty">
                <Package class="empty-icon" />
                <div class="empty-text">Không có dữ liệu biểu đồ</div>
              </div>
              <div v-else class="category-list">
                <div
                  v-for="(item, index) in revenueByCategory.slice(0, 5)"
                  :key="index"
                  class="category-item"
                >
                  <div class="category-color" :style="{ backgroundColor: getCategoryColor(index) }"></div>
                  <div class="category-info">
                    <div class="category-name">{{ item.category_name }}</div>
                    <div class="category-revenue">{{ formatCurrency(item.total_revenue) }}</div>
                  </div>
                  <div class="category-percent">
                    {{ ((item.total_revenue / totalCategoryRevenue) * 100).toFixed(1) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Products Table -->
    <div class="table-section">
      <div class="section-header">
        <h3 class="section-title">Sản phẩm bán chạy</h3>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="table-header">STT</th>
              <th class="table-header">Sản phẩm</th>
              <th class="table-header">Danh mục</th>
              <th class="table-header">Số lượng bán</th>
              <th class="table-header">Doanh thu</th>
              <th class="table-header">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(product, index) in topProducts"
              :key="product.product_id"
              class="table-row"
            >
              <td class="table-cell">{{ index + 1 }}</td>
              <td class="table-cell">
                <div class="product-info">
                  <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="product-image"
                  />
                  <div class="product-details">
                    <div class="product-name">{{ product.name }}</div>
                    <!-- <div class="product-sku">SKU: {{ product.sku }}</div> -->
                  </div>
                </div>
              </td>
              <td class="table-cell">{{ product.category_name }}</td>
              <td class="table-cell">{{ product.quantity_sold }}</td>
              <td class="table-cell">{{ formatCurrency(product.revenue) }}</td>
              <td class="table-cell">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${(product.quantity_sold / (topProducts[index]?.total_quantity + product.quantity_sold) * 100) || 0}%` }"
                  ></div>
                  <span class="progress-text">
                    {{ ((product.quantity_sold / (topProducts[index]?.total_quantity + product.quantity_sold) * 100) || 0).toFixed(1) }}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Empty State -->
        <div v-if="topProducts.length === 0 && !loading" class="empty-state">
          <Package class="empty-icon" />
          <div class="empty-title">Chưa có dữ liệu</div>
          <div class="empty-subtitle">Không có sản phẩm nào trong khoảng thời gian này</div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <div class="loading-text">Đang tải dữ liệu...</div>
        </div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="table-section">
      <div class="section-header">
        <h3 class="section-title">Đơn hàng gần đây</h3>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="table-header">Mã đơn hàng</th>
              <th class="table-header">Khách hàng</th>
              <th class="table-header">Ngày đặt</th>
              <th class="table-header">Trạng thái</th>
              <th class="table-header">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in recentOrders"
              :key="order.order_id"
              class="table-row"
            >
              <td class="table-cell">
                <span class="order-id">#{{ order.order_id }}</span>
              </td>
              <td class="table-cell">
                <div class="customer-info">
                  <div class="customer-name">{{ order.customer_name }}</div>
                  <div class="customer-email">{{ order.customer_email }}</div>
                </div>
              </td>
              <td class="table-cell">{{ formatDate(order.created_at) }}</td>
              <td class="table-cell">
                <span
                  class="status-badge"
                  :class="getStatusClass(order.status)"
                >
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td class="table-cell">{{ formatCurrency(order.total_amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  DollarSign, ShoppingCart, TrendingUp, Package,
  FileSpreadsheet, FileText, Search, RotateCcw
} from 'lucide-vue-next'
import { useRevenueStore } from '@/stores/revenueStore'

// Tạm thời không import chart components
// import RevenueChart from '@/components/charts/RevenueChart.vue'
// import CategoryChart from '@/components/charts/CategoryChart.vue'

// Store
const revenueStore = useRevenueStore()

// Reactive data from store
const loading = computed(() => revenueStore.loading)
const formattedRevenueStats = computed(() => revenueStore.formattedRevenueStats)
const monthlyRevenue = computed(() => revenueStore.monthlyRevenue)
const topProducts = computed(() => revenueStore.topProducts)
const revenueByCategory = computed(() => revenueStore.revenueByCategory)
const revenueData = computed(() => revenueStore.revenueData)

// Local state
const localDateRange = ref({
  startDate: revenueStore.dateRange.startDate,
  endDate: revenueStore.dateRange.endDate
})

// Computed
const recentOrders = computed(() => {
  return revenueData.value.slice(0, 10) // Show latest 10 orders
})

const maxMonthlyRevenue = computed(() => {
  return Math.max(...monthlyRevenue.value.map(item => item.revenue)) || 1
})

const totalCategoryRevenue = computed(() => {
  return revenueByCategory.value.reduce((sum, item) => sum + item.total_revenue, 0) || 1
})

// Methods
const applyDateFilter = async () => {
  revenueStore.setDateRange(localDateRange.value.startDate, localDateRange.value.endDate)
  await revenueStore.fetchRevenueData()
}

const resetDateFilter = () => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  
  localDateRange.value = {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  }
  
  applyDateFilter()
}

const exportReport = async (format) => {
  await revenueStore.exportRevenueReport(format)
}

// Utils from store
const formatCurrency = revenueStore.formatCurrency
const formatDate = revenueStore.formatDate

const getStatusClass = (status) => {
  const classes = {
    'Pending': 'status-warning',
    'Confirmed': 'status-info',
    'Shipping': 'status-primary',
    'Delivered': 'status-success',
    'Cancelled': 'status-danger',
    'Processing': 'status-secondary'
  }
  return classes[status] || 'status-secondary'
}

const getStatusText = (status) => {
  const texts = {
    'Pending': 'Chờ xử lý',
    'Confirmed': 'Đã xác nhận',
    'Shipping': 'Đang giao',
    'Delivered': 'Đã giao',
    'Cancelled': 'Đã hủy',
    'Processing': 'Đang xử lý',
  }
  return texts[status] || 'Không xác định'
}

const formatMonth = (monthStr) => {
  const date = new Date(monthStr + '-01')
  return date.toLocaleDateString('vi-VN', {
    month: 'short'
  })
}

const getCategoryColor = (index) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  return colors[index % colors.length]
}

// Lifecycle
onMounted(async () => {
  await revenueStore.fetchRevenueData()
})
</script>

<style scoped>
/* Base Styles */
.revenue-report {
  max-width: 100%;
  padding: 0;
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
}

.dark .page-title {
  color: rgb(243, 244, 246);
}

.page-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  transition: color 0.3s ease;
}

.dark .page-subtitle {
  color: rgb(156, 163, 175);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Filter Section */
.filter-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.dark .filter-section {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
  border: 1px solid #e5e7eb;
}

.date-range-picker {
  display: flex;
  align-items: end;
  gap: 1rem;
  flex-wrap: wrap;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.dark .date-label {
  color: rgb(209, 213, 219);
}

.date-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  min-width: 140px;
  transition: all 0.2s ease;
}

.dark .date-input {
  background: rgb(55, 65, 81);
  border-color: rgb(75, 85, 99);
  color: rgb(243, 244, 246);
  border: 1px solid #e5e7eb;
}

.date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Stats Grid */
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
  transition: all 0.3s ease;
}

.dark .stat-card {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
  border: 1px solid #e5e7eb;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-success {
  background: #ecfdf5;
  color: #059669;
}

.stat-icon-primary {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-icon-warning {
  background: #fffbeb;
  color: #d97706;
}

.stat-icon-info {
  background: #f0f9ff;
  color: #0284c7;
}

.dark .stat-icon-success {
  background: rgb(6, 78, 59);
  color: rgb(52, 211, 153);
}

.dark .stat-icon-primary {
  background: rgb(30, 58, 138);
  color: rgb(147, 197, 253);
}

.dark .stat-icon-warning {
  background: rgb(120, 53, 15);
  color: rgb(251, 191, 36);
}

.dark .stat-icon-info {
  background: rgb(12, 74, 110);
  color: rgb(125, 211, 252);
}

.stat-icon-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.dark .stat-label {
  color: rgb(156, 163, 175);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  transition: color 0.3s ease;
}

.dark .stat-value {
  color: rgb(243, 244, 246);
}

/* Charts Section */
.charts-section {
  margin-bottom: 2rem;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.dark .chart-card {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
  border: 1px solid #e5e7eb;
}

.chart-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .chart-header {
  border-bottom-color: rgb(55, 65, 81);
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  transition: color 0.3s ease;
}

.dark .chart-title {
  color: rgb(243, 244, 246);
}

.chart-content {
  padding: 1.5rem;
  height: 300px;
}

/* Simple Chart Styles */
.simple-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 200px;
  gap: 1rem;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 0.25rem 0.25rem 0 0;
  min-height: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: end;
  justify-content: center;
  padding-bottom: 0.5rem;
}

.chart-bar:hover {
  background: linear-gradient(to top, #2563eb, #3b82f6);
}

.bar-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.simple-pie-chart {
  height: 100%;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.dark .category-item {
  background: rgb(55, 65, 81);
}

.category-item:hover {
  background: #f3f4f6;
}

.dark .category-item:hover {
  background: rgb(75, 85, 99);
}

.category-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
}

.category-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.dark .category-name {
  color: rgb(243, 244, 246);
}

.category-revenue {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.dark .category-revenue {
  color: rgb(156, 163, 175);
}

.category-percent {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
}

.chart-loading,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.empty-icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.5rem;
}

.empty-text {
  font-size: 0.875rem;
}

/* Table Styles */
.table-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.dark .table-section {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
  border: 1px solid #e5e7eb;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .section-header {
  border-bottom-color: rgb(55, 65, 81);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  transition: color 0.3s ease;
}

.dark .section-title {
  color: rgb(243, 244, 246);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background: #f9fafb;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.dark .table-header {
  background: rgb(55, 65, 81);
  color: rgb(209, 213, 219);
  border-bottom-color: rgb(75, 85, 99);
}

.table-row {
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.dark .table-row {
  border-bottom-color: rgb(55, 65, 81);
    border: 1px solid #e5e7eb;

}

.table-row:hover {
  background: #f9fafb;
}

.dark .table-row:hover {
  background: rgb(55, 65, 81);
}

.table-cell {
  padding: 0.75rem;
  color: #374151;
  transition: color 0.3s ease;
}

.dark .table-cell {
  color: rgb(209, 213, 219);
}

/* Product Info */
.product-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-image {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  object-fit: cover;
  flex-shrink: 0;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #111827;
  transition: color 0.3s ease;
}

.dark .product-name {
  color: rgb(243, 244, 246);
}

.product-sku {
  font-size: 0.875rem;
  color: #6b7280;
  transition: color 0.3s ease;
}

.dark .product-sku {
  color: rgb(156, 163, 175);
}

/* Progress Bar */
.progress-bar {
  position: relative;
  width: 100px;
  height: 1rem;
  background: #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.dark .progress-bar {
  background: rgb(55, 65, 81);
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 0.5rem;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

/* Customer Info */
.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-name {
  font-weight: 500;
  color: #111827;
  transition: color 0.3s ease;
}

.dark .customer-name {
  color: rgb(243, 244, 246);
}

.customer-email {
  font-size: 0.875rem;
  color: #6b7280;
  transition: color 0.3s ease;
}

.dark .customer-email {
  color: rgb(156, 163, 175);
}

/* Order ID */
.order-id {
  font-family: monospace;
  font-weight: 600;
  color: #3b82f6;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-success {
  background: #ecfdf5;
  color: #059669;
}

.status-warning {
  background: #fffbeb;
  color: #d97706;
}

.status-info {
  background: #f0f9ff;
  color: #0284c7;
}

.status-primary {
  background: #eff6ff;
  color: #3b82f6;
}

.status-danger {
  background: #fef2f2;
  color: #dc2626;
}

.status-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-success {
  background: #059669;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #047857;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.dark .empty-title {
  color: rgb(209, 213, 219);
}

.empty-subtitle {
  color: #6b7280;
  transition: color 0.3s ease;
}

.dark .empty-subtitle {
  color: rgb(156, 163, 175);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #6b7280;
  transition: color 0.3s ease;
}

.dark .loading-text {
  color: rgb(156, 163, 175);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-grid {
    grid-template-columns: 1fr;
  }
  
  .date-range-picker {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
}
</style>
