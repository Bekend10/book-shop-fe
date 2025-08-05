import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useToastStore } from './toastStore'

export const useRevenueStore = defineStore('revenue', () => {
  // State
  const loading = ref(false)
  const revenueData = ref([])
  const revenueStats = ref({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalProducts: 0
  })
  const monthlyRevenue = ref([])
  const topProducts = ref([])
  const revenueByCategory = ref([])
  const dateRange = ref({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const toastStore = useToastStore()

  // Computed
  const formattedRevenueStats = computed(() => ({
    totalRevenue: formatCurrency(revenueStats.value.totalRevenue),
    totalOrders: revenueStats.value.totalOrders.toLocaleString(),
    avgOrderValue: formatCurrency(revenueStats.value.avgOrderValue),
    totalProducts: revenueStats.value.totalProducts.toLocaleString()
  }))

  // Actions
  const fetchRevenueData = async (startDate = null, endDate = null) => {
    loading.value = true
    try {
      const start = startDate || dateRange.value.startDate
      const end = endDate || dateRange.value.endDate
      
      // Tạm thời sử dụng dữ liệu mẫu thay vì API
      const response = await axios.get('/revenues/get-revenue', {
        params: { start_date: start, end_date: end }
      })
      const mockData = response.data;

      // Update revenue stats
      revenueStats.value = {
        totalRevenue: mockData.total_revenue || 0,
        totalOrders: mockData.total_orders || 0,
        avgOrderValue: mockData.avg_order_value || 0,
        totalProducts: mockData.total_product_sold || 0
      }

      // Update charts data
      monthlyRevenue.value = mockData.monthly_revenue || []
      topProducts.value = mockData.top_products || []
      revenueByCategory.value = mockData.revenue_by_category || []
      revenueData.value = mockData.orders || []

      return { success: true, data: mockData }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      toastStore.error('Lỗi khi tải dữ liệu báo cáo')
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  const fetchDashboardStats = async () => {
    loading.value = true
    try {
      const response = await axios.get('/reports/dashboard-stats')

      if (response.data.status === 200) {
        const data = response.data.data
        revenueStats.value = {
          totalRevenue: data.total_revenue || 0,
          totalOrders: data.total_orders || 0,
          avgOrderValue: data.avg_order_value || 0,
          totalProducts: data.total_product_sold || 0
        }
        return { success: true, data }
      } else {
        console.error('API Error:', response.data.message)
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  const exportRevenueReport = async (format = 'excel') => {
    try {
      // Tạm thời chỉ hiển thị thông báo
      // toastStore.success(`Tính năng xuất báo cáo ${format.toUpperCase()} sẽ được cập nhật sau`)
      
      // Code thực tế khi có API
      const response = await axios.get(`/reports/export-order`, {
        params: {
          startDate: dateRange.value.startDate,
          endDate: dateRange.value.endDate
        },
        responseType: 'blob'
      })

      // // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `revenue-report-${dateRange.value.startDate}-${dateRange.value.endDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      console.error('Error exporting report:', error)
      toastStore.error('Lỗi khi xuất báo cáo')
      return { success: false, message: error.message }
    }
  }

  const setDateRange = (start, end) => {
    dateRange.value.startDate = start
    dateRange.value.endDate = end
  }

  const resetStore = () => {
    revenueData.value = []
    revenueStats.value = {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      totalProducts: 0
    }
    monthlyRevenue.value = []
    topProducts.value = []
    revenueByCategory.value = []
    loading.value = false
  }

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return {
    // State
    loading,
    revenueData,
    revenueStats,
    monthlyRevenue,
    topProducts,
    revenueByCategory,
    dateRange,

    // Computed
    formattedRevenueStats,

    // Actions
    fetchRevenueData,
    fetchDashboardStats,
    exportRevenueReport,
    setDateRange,
    resetStore,

    // Utils
    formatCurrency,
    formatDate
  }
})
