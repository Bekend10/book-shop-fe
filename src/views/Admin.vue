<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex">
      <!-- Sidebar -->
      <AdminSidebar 
        :activeSection="activeSection" 
        @change-section="changeSection"
        :class="{'mobile-open': sidebarOpen}"
      />
      
      <!-- Mobile sidebar overlay -->
      <div 
        v-if="sidebarOpen" 
        @click="sidebarOpen = false"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      ></div>

      <!-- Main Content -->
      <div class="flex-1 lg:ml-0">
        <!-- Mobile Header -->
        <div class="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <button 
              @click="sidebarOpen = !sidebarOpen"
              class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 lg:p-8">
          <!-- Books Management -->
          <div v-if="activeSection === 'books'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý sách</h1>
                <p class="text-gray-600 dark:text-gray-300 mt-1">Quản lý thông tin sách trong hệ thống</p>
              </div>
              <button @click="showAddModal = true" class="btn btn-primary">
                <Plus class="h-5 w-5 mr-2" />
                Thêm sách mới
              </button>
            </div>

            <!-- Books Table -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Danh sách sách</h2>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sách
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tác giả
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Giá
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tồn kho
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="book in books" :key="book.id">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <img :src="book.image" :alt="book.title" class="w-12 h-16 object-cover rounded mr-4">
                          <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ book.title }}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">{{ book.rating }}/5 ({{ book.reviews }} đánh giá)</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ book.author }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full text-xs">
                          {{ book.category }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>{{ formatPrice(book.price) }}</div>
                        <div v-if="book.originalPrice > book.price" class="text-xs text-gray-500 dark:text-gray-400 line-through">
                          {{ formatPrice(book.originalPrice) }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ book.stock }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="[
                          'px-2 py-1 rounded-full text-xs',
                          book.inStock ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        ]">
                          {{ book.inStock ? 'Còn hàng' : 'Hết hàng' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                          <button @click="editBook(book)" class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                            <Edit class="h-4 w-4" />
                          </button>
                          <button @click="deleteBook(book.id)" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                            <Trash2 class="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Categories Management -->
          <div v-else-if="activeSection === 'categories'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý danh mục</h1>
                <p class="text-gray-600 dark:text-gray-300 mt-1">Quản lý danh mục sách</p>
              </div>
              <button class="btn btn-primary">
                <Plus class="h-5 w-5 mr-2" />
                Thêm danh mục
              </button>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p class="text-gray-500 dark:text-gray-400">Chức năng quản lý danh mục sẽ được phát triển...</p>
            </div>
          </div>

          <!-- Authors Management -->
          <div v-else-if="activeSection === 'authors'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý tác giả</h1>
                <p class="text-gray-600 dark:text-gray-300 mt-1">Quản lý thông tin tác giả</p>
              </div>
              <button class="btn btn-primary">
                <Plus class="h-5 w-5 mr-2" />
                Thêm tác giả
              </button>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p class="text-gray-500 dark:text-gray-400">Chức năng quản lý tác giả sẽ được phát triển...</p>
            </div>
          </div>

          <!-- Publishers Management -->
          <div v-else-if="activeSection === 'publishers'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý nhà xuất bản</h1>
                <p class="text-gray-600 dark:text-gray-300 mt-1">Quản lý thông tin nhà xuất bản</p>
              </div>
              <button class="btn btn-primary">
                <Plus class="h-5 w-5 mr-2" />
                Thêm nhà xuất bản
              </button>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p class="text-gray-500 dark:text-gray-400">Chức năng quản lý nhà xuất bản sẽ được phát triển...</p>
            </div>
          </div>

          <!-- Orders Management -->
          <div v-else-if="activeSection === 'orders'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý đơn hàng</h1>
                <p class="text-gray-600 dark:text-gray-300 mt-1">Quản lý đơn hàng của khách hàng</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p class="text-gray-500 dark:text-gray-400">Chức năng quản lý đơn hàng sẽ được phát triển...</p>
            </div>
          </div>

          <!-- Transactions Management -->
          <div v-else-if="activeSection === 'transactions'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý giao dịch</h1>
                <p class="text-gray-600 dark:text-gray-300 mt-1">Quản lý giao dịch thanh toán</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p class="text-gray-500 dark:text-gray-400">Chức năng quản lý giao dịch sẽ được phát triển...</p>
            </div>
          </div>

          <!-- Users Management -->
          <div v-else-if="activeSection === 'users'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h1>
                <p class="text-gray-600 dark:text-gray-300 mt-1">Quản lý tài khoản người dùng</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p class="text-gray-500 dark:text-gray-400">Chức năng quản lý người dùng sẽ được phát triển...</p>
            </div>
          </div>

          <!-- Revenue Management -->
          <div v-else-if="activeSection === 'revenue'">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Báo cáo doanh thu</h1>
                <p class="text-gray-600 dark:text-gray-300 mt-1">Thống kê doanh thu và báo cáo</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Doanh thu hôm nay</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatPrice(1500000) }}</p>
                  </div>
                  <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <TrendingUp class="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Đơn hàng hôm nay</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                  </div>
                  <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <ShoppingBag class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Khách hàng mới</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                  </div>
                  <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <Users class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Sách bán chạy</p>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">86</p>
                  </div>
                  <div class="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                    <BookOpen class="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p class="text-gray-500 dark:text-gray-400">Biểu đồ doanh thu chi tiết sẽ được phát triển...</p>
            </div>
          </div>        </div>
      </div>
    </div>

    <!-- Add/Edit Book Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ showAddModal ? 'Thêm sách mới' : 'Chỉnh sửa sách' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveBook" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên sách *
              </label>
              <input 
                v-model="bookForm.title"
                type="text" 
                required
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tác giả *
              </label>
              <input 
                v-model="bookForm.author"
                type="text" 
                required
                class="input-field"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Giá bán *
              </label>
              <input 
                v-model.number="bookForm.price"
                type="number" 
                required
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Giá gốc
              </label>
              <input 
                v-model.number="bookForm.originalPrice"
                type="number"
                class="input-field"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Danh mục *
              </label>
              <select 
                v-model="bookForm.category"
                required
                class="input-field"
              >
                <option value="">Chọn danh mục</option>
                <option v-for="category in categories.filter(c => c !== 'Tất cả')" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số lượng *
              </label>
              <input 
                v-model.number="bookForm.stock"
                type="number" 
                required
                min="0"
                class="input-field"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Đánh giá
              </label>
              <input 
                v-model.number="bookForm.rating"
                type="number" 
                min="1"
                max="5"
                step="0.1"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số lượng đánh giá
              </label>
              <input 
                v-model.number="bookForm.reviews"
                type="number" 
                min="0"
                class="input-field"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL hình ảnh
            </label>
            <input 
              v-model="bookForm.image"
              type="url"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả sách
            </label>
            <textarea 
              v-model="bookForm.description"
              rows="4"
              class="input-field"
            ></textarea>
          </div>

          <div class="flex items-center">
            <input 
              v-model="bookForm.inStock"
              type="checkbox"
              class="h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:bg-gray-700"
            />
            <label class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Còn hàng
            </label>
          </div>

          <div class="flex justify-end space-x-4 pt-6">
            <button type="button" @click="closeModal" class="btn-secondary">
              Hủy
            </button>
            <button type="submit" class="btn-primary">
              {{ showAddModal ? 'Thêm sách' : 'Cập nhật' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Menu,
  TrendingUp,
  ShoppingBag,
  Users,
  BookOpen
} from 'lucide-vue-next'
import { useBookStore } from '@/stores/bookStore'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const bookStore = useBookStore()

const books = computed(() => bookStore.books)
const categories = computed(() => bookStore.categories)

// Sidebar and navigation
const activeSection = ref('books')
const sidebarOpen = ref(false)

const changeSection = (section) => {
  activeSection.value = section
  sidebarOpen.value = false // Close mobile sidebar
}

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingBook = ref(null)

const bookForm = reactive({
  title: '',
  author: '',
  price: 0,
  originalPrice: 0,
  category: '',
  stock: 0,
  rating: 4.5,
  reviews: 0,
  image: '',
  description: '',
  inStock: true
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const resetForm = () => {
  Object.assign(bookForm, {
    title: '',
    author: '',
    price: 0,
    originalPrice: 0,
    category: '',
    stock: 0,
    rating: 4.5,
    reviews: 0,
    image: '',
    description: '',
    inStock: true
  })
}

const editBook = (book) => {
  editingBook.value = book
  Object.assign(bookForm, book)
  showEditModal.value = true
}

const saveBook = () => {
  if (showAddModal.value) {
    // Add new book
    bookStore.addBook({
      ...bookForm,
      originalPrice: bookForm.originalPrice || bookForm.price
    })
  } else if (showEditModal.value && editingBook.value) {
    // Update existing book
    bookStore.updateBook(editingBook.value.id, {
      ...bookForm,
      originalPrice: bookForm.originalPrice || bookForm.price
    })
  }
  
  closeModal()
}

const deleteBook = (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
    bookStore.deleteBook(id)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingBook.value = null
  resetForm()
}
</script>

<style scoped>
  .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background 0.3s, box-shadow 0.3s, transform 0.1s;
}

.btn-primary {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  box-shadow: 0 6px 10px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.98);
}

@media (prefers-color-scheme: dark) {
  .btn-primary {
    background: linear-gradient(to right, #2563eb, #1e40af);
    color: white;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.4);
  }

  .btn-primary:hover {
    background: linear-gradient(to right, #1d4ed8, #1e3a8a);
    box-shadow: 0 6px 10px rgba(37, 99, 235, 0.5);
  }
}

</style>
