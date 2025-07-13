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
      <div v-if="filteredOrders.length > 0" class="space-y-6">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <!-- Order Header -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    Đơn hàng #{{ order.id }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatDate(order.created_at) }}
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
                  {{ formatPrice(order.total) }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ order.items.length }} sản phẩm
                </p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="px-6 py-4">
            <div class="space-y-4">
              <div 
                v-for="item in order.items" 
                :key="item.id"
                class="flex items-center space-x-4"
              >
                <img 
                  :src="item.book.image_url" 
                  :alt="item.book.title"
                  class="w-16 h-20 object-cover rounded"
                />
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ item.book.title }}
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ item.book.author }}
                  </p>
                  <div class="flex items-center space-x-4 mt-1">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      Số lượng: {{ item.quantity }}
                    </span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatPrice(item.price) }}
                    </span>
                  </div>
                </div>
              </div>
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
                  v-if="order.status === 'delivered'"
                  @click="reorder(order)"
                  class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm"
                >
                  Mua lại
                </button>
              </div>
              
              <div class="flex space-x-3">
                <button 
                  v-if="order.status === 'pending'"
                  @click="cancelOrder(order)"
                  class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm"
                >
                  Hủy đơn
                </button>
                <button 
                  v-if="order.status === 'delivered'"
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

      <!-- Empty State -->
      <div v-else class="text-center py-12">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Package, ShoppingBag } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const cartStore = useCartStore()
const toastStore = useToastStore()
const router = useRouter()

const activeStatus = ref('all')
const orders = ref([])

// Mock data - sẽ được thay thế bằng API call thực tế
const mockOrders = [
  {
    id: 'ORD001',
    status: 'delivered',
    total: 299000,
    created_at: '2024-01-15T10:30:00Z',
    items: [
      {
        id: 1,
        book: {
          title: 'Sapiens: Lược sử loài người',
          author: 'Yuval Noah Harari',
          image_url: 'https://salt.tikicdn.com/cache/280x280/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg'
        },
        quantity: 1,
        price: 299000
      }
    ]
  },
  {
    id: 'ORD002', 
    status: 'shipping',
    total: 450000,
    created_at: '2024-01-20T14:20:00Z',
    items: [
      {
        id: 2,
        book: {
          title: 'Nhà giả kim',
          author: 'Paulo Coelho',
          image_url: 'https://salt.tikicdn.com/cache/280x280/ts/product/45/3b/fc/07f35c50e0d46715c4ba0c1e09db327b.jpg'
        },
        quantity: 2,
        price: 225000
      }
    ]
  },
  {
    id: 'ORD003',
    status: 'pending',
    total: 180000,
    created_at: '2024-01-25T09:15:00Z',
    items: [
      {
        id: 3,
        book: {
          title: 'Đắc nhân tâm',
          author: 'Dale Carnegie',
          image_url: 'https://salt.tikicdn.com/cache/280x280/ts/product/ca/77/32/2c2538ba92b10cac6ba851b3fcc3ea68.jpg'
        },
        quantity: 1,
        price: 180000
      }
    ]
  }
]

const orderStatuses = computed(() => [
  { value: 'all', label: 'Tất cả', count: orders.value.length },
  { value: 'pending', label: 'Chờ xử lý', count: orders.value.filter(o => o.status === 'pending').length },
  { value: 'confirmed', label: 'Đã xác nhận', count: orders.value.filter(o => o.status === 'confirmed').length },
  { value: 'shipping', label: 'Đang giao', count: orders.value.filter(o => o.status === 'shipping').length },
  { value: 'delivered', label: 'Đã giao', count: orders.value.filter(o => o.status === 'delivered').length },
  { value: 'cancelled', label: 'Đã hủy', count: orders.value.filter(o => o.status === 'cancelled').length }
])

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
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    case 'confirmed':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    case 'shipping':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    case 'delivered':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    case 'cancelled':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Chờ xử lý'
    case 'confirmed':
      return 'Đã xác nhận'
    case 'shipping':
      return 'Đang giao hàng'
    case 'delivered':
      return 'Đã giao hàng'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return 'Không xác định'
  }
}

const viewOrderDetail = (order) => {
  // Navigate to order detail page or show modal
  toastStore.info(`Xem chi tiết đơn hàng #${order.id}`)
}

const reorder = (order) => {
  // Add all items from order to cart
  order.items.forEach(item => {
    cartStore.addItem({
      id: item.book.id,
      title: item.book.title,
      author: item.book.author,
      price: item.price,
      image: item.book.image_url
    }, item.quantity)
  })
  
  toastStore.success('Đã thêm sản phẩm vào giỏ hàng')
  router.push('/cart')
}

const cancelOrder = (order) => {
  if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
    // API call to cancel order
    const orderIndex = orders.value.findIndex(o => o.id === order.id)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'cancelled'
      toastStore.success('Đã hủy đơn hàng thành công')
    }
  }
}

const writeReview = (order) => {
  toastStore.info('Chức năng đánh giá sẽ được phát triển sớm')
}

const fetchOrders = async () => {
  try {
    // API call to fetch user orders
    // const response = await orderAPI.getUserOrders()
    // orders.value = response.data
    
    // Mock data for now
    orders.value = mockOrders
  } catch (error) {
    toastStore.error('Có lỗi xảy ra khi tải danh sách đơn hàng')
    console.error('Error fetching orders:', error)
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
