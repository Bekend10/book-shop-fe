<template>
  <div class="category-chart">
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Đang tải biểu đồ...</div>
    </div>
    <div v-else-if="chartData.length === 0" class="chart-empty">
      <PieChart class="empty-icon" />
      <div class="empty-text">Không có dữ liệu biểu đồ</div>
    </div>
    <div v-else class="chart-container">
      <!-- Simple Pie Chart -->
      <div class="pie-chart">
        <svg viewBox="0 0 200 200" class="pie-svg">
          <g transform="translate(100,100)">
            <path
              v-for="(segment, index) in pieSegments"
              :key="index"
              :d="segment.path"
              :fill="segment.color"
              :stroke="'white'"
              :stroke-width="2"
              class="pie-segment"
              @mouseenter="hoveredSegment = index"
              @mouseleave="hoveredSegment = null"
            />
          </g>
        </svg>
        
        <!-- Center Text -->
        <div class="pie-center">
          <div class="center-title">Tổng</div>
          <div class="center-value">{{ formatShortCurrency(totalRevenue) }}</div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="chart-legend">
        <div
          v-for="(item, index) in chartData"
          :key="index"
          class="legend-item"
          :class="{ 'legend-hovered': hoveredSegment === index }"
          @mouseenter="hoveredSegment = index"
          @mouseleave="hoveredSegment = null"
        >
          <div
            class="legend-color"
            :style="{ backgroundColor: colors[index % colors.length] }"
          ></div>
          <div class="legend-text">
            <div class="legend-name">{{ item.category_name }}</div>
            <div class="legend-value">{{ formatCurrency(item.revenue) }}</div>
            <div class="legend-percent">{{ ((item.revenue / totalRevenue) * 100).toFixed(1) }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PieChart } from 'lucide-vue-next'

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

// State
const hoveredSegment = ref(null)

// Color palette
const colors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
]

// Computed
const chartData = computed(() => {
  return props.data.slice(0, 8) // Show top 8 categories
})

const totalRevenue = computed(() => {
  return chartData.value.reduce((sum, item) => sum + (item.revenue || 0), 0)
})

const pieSegments = computed(() => {
  let currentAngle = 0
  
  return chartData.value.map((item, index) => {
    const percentage = item.revenue / totalRevenue.value
    const angle = percentage * 2 * Math.PI
    
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    
    currentAngle += angle
    
    const largeArcFlag = angle > Math.PI ? 1 : 0
    
    const x1 = Math.cos(startAngle - Math.PI / 2) * 80
    const y1 = Math.sin(startAngle - Math.PI / 2) * 80
    const x2 = Math.cos(endAngle - Math.PI / 2) * 80
    const y2 = Math.sin(endAngle - Math.PI / 2) * 80
    
    const path = [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ')
    
    return {
      path,
      color: colors[index % colors.length]
    }
  })
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
</script>

<style scoped>
.category-chart {
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
  height: 100%;
  gap: 1rem;
}

.pie-chart {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-svg {
  width: 200px;
  height: 200px;
}

.pie-segment {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.pie-segment:hover {
  opacity: 0.8;
}

.pie-center {
  position: absolute;
  text-align: center;
  pointer-events: none;
}

.center-title {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.center-value {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-top: 0.25rem;
}

.dark .center-value {
  color: rgb(243, 244, 246);
}

.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.legend-item:hover,
.legend-hovered {
  background: #f3f4f6;
}

.dark .legend-item:hover,
.dark .legend-hovered {
  background: rgb(55, 65, 81);
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.legend-text {
  flex: 1;
}

.legend-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.dark .legend-name {
  color: rgb(243, 244, 246);
}

.legend-value {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.dark .legend-value {
  color: rgb(156, 163, 175);
}

.legend-percent {
  font-size: 0.75rem;
  font-weight: 600;
  color: #3b82f6;
  margin-top: 0.125rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .chart-container {
    flex-direction: column;
  }
  
  .chart-legend {
    max-height: none;
  }
}
</style>
