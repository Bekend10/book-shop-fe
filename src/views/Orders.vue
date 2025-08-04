<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Đơn hàng của tôi</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">Theo dõi trạng thái đơn hàng và lịch sử mua hàng</p>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8">
            <button 
              v-for="status in orderStatuses" 
              :key="status.value"
              @click="activeStatus = status.value"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeStatus === status.value
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              ]"
            >
              {{ status.label }}
              <span v-if="status.count > 0" class="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {{ status.count }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Orders List -->
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-400">Đang tải danh sách đơn hàng...</span>
      </div>

      <!-- Orders List -->
      <div v-else-if="paginatedOrders.length > 0" class="space-y-6">
        <div 
          v-for="order in paginatedOrders" 
          :key="order.order_id || order.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <!-- Order Header -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    Đơn hàng #{{ order.order_id }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatDate(order.order_date) }}
                  </p>
                </div>
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  getStatusColor(order.status)
                ]">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ formatPrice(order.total_amount) }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ order.orderDetail ? `${order.orderDetail.quantity} sản phẩm` : 'Chưa có sản phẩm' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="px-6 py-4" v-if="order.orderDetail && order.orderDetail.book">
            <div class="space-y-4">
              <div class="flex items-center space-x-4">
                <img 
                  :src="order.orderDetail.book.image_url || '/placeholder-book.jpg'" 
                  :alt="order.orderDetail.book.title"
                  class="w-16 h-20 object-cover rounded"
                  @error="$event.target.src='/placeholder-book.jpg'"
                />
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ order.orderDetail.book.title }}
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Tác giả: {{ getAuthorNames(order.orderDetail.book.authors) }}
                  </p>
                  <div class="flex items-center space-x-4 mt-1">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      Số lượng: {{ order.orderDetail.quantity }}
                    </span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatPrice(order.orderDetail.unit_price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- No Items State -->
          <div v-else class="px-6 py-4">
            <div class="text-center text-gray-500 dark:text-gray-400">
              <p>Đơn hàng chưa có sản phẩm</p>
            </div>
          </div>

          <!-- Order Actions -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div class="flex items-center justify-between">
              <div class="flex space-x-3">
                <button 
                  @click="viewOrderDetail(order)"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                >
                  Xem chi tiết
                </button>
                <button 
                  v-if="order.status === 3"
                  @click="reorder(order)"
                  class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm"
                >
                  Mua lại
                </button>
              </div>
              
              <div class="flex space-x-3">
                <button 
                  v-if="order.status === 0"
                  @click="cancelOrder(order)"
                  class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm"
                >
                  Hủy đơn
                </button>
                <button 
                  v-if="order.status === 3"
                  @click="writeReview(order)"
                  class="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
                >
                  Đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredOrders.length > 0 && totalPages > 1" class="mt-8 flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <span>
            Hiển thị {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredOrders.length) }} 
            trong {{ filteredOrders.length }} đơn hàng
          </span>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Previous Button -->
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Trước
          </button>
          
          <!-- Page Numbers -->
          <button
            v-for="page in Array.from({length: totalPages}, (_, i) => i + 1)"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md',
              page === currentPage
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            ]"
          >
            {{ page }}
          </button>
          
          <!-- Next Button -->
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Sau
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoading" class="text-center py-12">
        <Package class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Chưa có đơn hàng nào
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ activeStatus === 'all' ? 'Bạn chưa có đơn hàng nào.' : `Không có đơn hàng ${getStatusText(activeStatus).toLowerCase()}.` }}
        </p>
        <div class="mt-6">
          <router-link 
            to="/"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ShoppingBag class="w-4 h-4 mr-2" />
            Tiếp tục mua sắm
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <!-- Order Detail Modal -->
  <OrderDetailModal 
    :isOpen="isModalOpen"
    :order="selectedOrder"
    @close="closeModal"
    @reorder="handleModalReorder"
    @cancel-order="handleModalCancelOrder" 
    @write-review="handleModalWriteReview"
  />

  <!-- Confirm Cancel Modal -->
  <ConfirmCancelModal
    :is-open="isConfirmModalOpen"
    :is-loading="isLoading"
    :order="orderToCancel"
    @confirm="handleConfirmCancel"
    @cancel="closeConfirmModal"
    @close="closeConfirmModal"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Package, ShoppingBag } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'
import { useRouter } from 'vue-router'
import OrderDetailModal from '@/components/modals/OrderDetailModal.vue'
import ConfirmCancelModal from '@/components/modals/ConfirmCancelModal.vue'

const authStore = useAuthStore()
const orderStore = useOrderStore()
const cartStore = useCartStore()
const toastStore = useToastStore()
const router = useRouter()

const activeStatus = ref('all')
const isModalOpen = ref(false)
const selectedOrder = ref(null)

// Confirm modal states
const isConfirmModalOpen = ref(false)
const orderToCancel = ref(null)

// Get orders from store
const orders = computed(() => orderStore.orders)
const isLoading = computed(() => orderStore.isLoading)

const orderStatuses = computed(() => [
  { value: 'all', label: 'Tất cả', count: orders.value.length },
  { value: 0, label: 'Chờ xử lý', count: orders.value.filter(o => o.status === 0).length },
  { value: 1, label: 'Đã xác nhận', count: orders.value.filter(o => o.status === 1).length },
  { value: 2, label: 'Đang giao', count: orders.value.filter(o => o.status === 2).length },  
  { value: 3, label: 'Đã giao', count: orders.value.filter(o => o.status === 3).length },
  { value: 4, label: 'Đã hủy', count: orders.value.filter(o => o.status === 4).length }
])

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage.value)
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredOrders.value.slice(start, end)
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const filteredOrders = computed(() => {
  if (activeStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === activeStatus.value)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status) => {
  switch (status) {
    case 0:
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    case 1:
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    case 2:
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    case 3:
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    case 4:
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 0:
      return 'Chờ xử lý'
    case 1:
      return 'Đã xác nhận'
    case 2:
      return 'Đang giao hàng'
    case 3:
      return 'Đã giao hàng'
    case 4:
      return 'Đã hủy'
    default:
      return 'Không xác định'
  }
}

const getAuthorNames = (authors) => {
  if (!authors) return 'Chưa có thông tin'
  if (Array.isArray(authors) && authors.length > 0) {
    return authors.map(author => author.name).join(', ')
  }
  return 'Chưa có thông tin'
}

const viewOrderDetail = (order) => {
  selectedOrder.value = order
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedOrder.value = null
}

const handleModalReorder = (order) => {
  reorder(order)
}

const handleModalCancelOrder = (order) => {
  cancelOrder(order)
}

const handleModalWriteReview = (order) => {
  writeReview(order)
}

const reorder = async (order) => {
  try {
    // Add item from order to cart
    if (order.orderDetail && order.orderDetail.book) {
      const bookData = {
        id: order.orderDetail.book.book_id,
        title: order.orderDetail.book.title,
        author: getAuthorNames(order.orderDetail.book.authors),
        price: order.orderDetail.book.price,
        image: order.orderDetail.book.image_url
      }
      
      cartStore.addItem(bookData, order.orderDetail.quantity)
      toastStore.success('Đã thêm sản phẩm vào giỏ hàng')
      router.push('/cart')
    } else {
      toastStore.error('Không thể thêm sản phẩm vào giỏ hàng - đơn hàng không có sản phẩm')
    }
  } catch (error) {
    console.error('Reorder error:', error)
    toastStore.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng')
  }
}

const cancelOrder = (order) => {
  orderToCancel.value = order
  isConfirmModalOpen.value = true
}

const closeConfirmModal = () => {
  isConfirmModalOpen.value = false
  orderToCancel.value = null
}

const handleConfirmCancel = async () => {
  if (!orderToCancel.value) return
  
  try {
    const result = await orderStore.cancelOrder(orderToCancel.value.order_id)
    
    if (result.success) {
      toastStore.success('Đã hủy đơn hàng thành công')
      closeConfirmModal()
    } else {
      toastStore.error(result.error || 'Không thể hủy đơn hàng')
    }
  } catch (error) {
    console.error('Cancel order error:', error)
    toastStore.error('Có lỗi xảy ra khi hủy đơn hàng')
  }
}

const writeReview = (order) => {
  toastStore.info('Chức năng đánh giá sẽ được phát triển sớm')
}

const fetchUserOrders = async () => {
  try {
    const result = await orderStore.fetchUserOrders()
    
    if (!result.success) {
      toastStore.error(result.error || 'Có lỗi xảy ra khi tải danh sách đơn hàng')
    }
  } catch (error) {
    console.error('Error fetching user orders:', error)
    toastStore.error('Có lỗi xảy ra khi tải danh sách đơn hàng')
  }
}

onMounted(() => {
  fetchUserOrders()
})
</script>
