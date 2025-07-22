<template>
  <div class="revenue-chart">
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Đang tải biểu đồ...</div>
    </div>
    <div v-else-if="chartData.length === 0" class="chart-empty">
      <TrendingUp class="empty-icon" />
      <div class="empty-text">Không có dữ liệu biểu đồ</div>
    </div>
    <div v-else class="chart-container">
      <!-- Simple Bar Chart -->
      <div class="chart-bars">
        <div
          v-for="(item, index) in chartData"
          :key="index"
          class="chart-bar"
          :style="{ height: `${(item.revenue / maxRevenue * 100)}%` }"
          :title="`${item.month}: ${formatCurrency(item.revenue)}`"
        >
          <div class="bar-value">{{ formatShortCurrency(item.revenue) }}</div>
        </div>
      </div>
      <div class="chart-labels">
        <div
          v-for="(item, index) in chartData"
          :key="index"
          class="chart-label"
        >
          {{ formatMonth(item.month) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUp } from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Computed
const chartData = computed(() => {
  return props.data.slice(0, 12) // Show last 12 months
})

const maxRevenue = computed(() => {
  return Math.max(...chartData.value.map(item => item.revenue)) || 1
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0)
}

const formatShortCurrency = (amount) => {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + 'B'
  } else if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M'
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K'
  }
  return amount.toString()
}

const formatMonth = (monthStr) => {
  const date = new Date(monthStr + '-01')
  return date.toLocaleDateString('vi-VN', {
    month: 'short',
    year: '2-digit'
  })
}
</script>

<style scoped>
.revenue-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
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

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

.empty-icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.5rem;
}

.chart-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: calc(100% - 40px);
  padding: 0 0.5rem;
  gap: 0.5rem;
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
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
}

.chart-bar:hover {
  background: linear-gradient(to top, #2563eb, #3b82f6);
}

.bar-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  margin-top: 0.5rem;
}

.chart-label {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
