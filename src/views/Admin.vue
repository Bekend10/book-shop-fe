<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex">
      <!-- Sidebar -->
      <AdminSidebar :activeSection="activeSection" @change-section="changeSection"
        :class="{ 'mobile-open': sidebarOpen }" />

      <!-- Mobile sidebar overlay -->
      <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden">
      </div>

      <!-- Main Content -->
      <div class="flex-1 lg:ml-0">
        <!-- Mobile Header -->
        <div class="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <button @click="sidebarOpen = !sidebarOpen"
              class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
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
              <div class="flex space-x-3">
                <button v-if="selectedBooks.length > 0" @click="deleteMultipleBooks" class="btn btn-danger">
                  <Trash2 class="h-5 w-5 mr-2" />
                  Xóa {{ selectedBooks.length }} sách
                </button>
                <button @click="openAddBookModal" class="btn btn-primary">
                  <Plus class="h-5 w-5 mr-2" />
                  Thêm sách mới
                </button>
              </div>
            </div>

            <!-- Books Table (Refactored as Component) -->
            <BookTable
              :books="books"
              :selected-books="selectedBooks"
              :select-all="selectAll"
              @edit="editBook"
              @delete="deleteBook"
              @select="val => selectedBooks = val"
              @select-all="toggleSelectAll"
              @update-select-all="updateSelectAll"
              :format-price="formatPrice"
            />
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
            <AdminOrders />
          </div>

          <!-- Transactions Management -->
          <div v-else-if="activeSection === 'transactions'">
            <AdminTransactions />
          </div>

          <!-- Users Management -->
          <div v-else-if="activeSection === 'users'">
            <AdminUserManagement />
          </div>

          <!-- Messages Management -->
          <div v-else-if="activeSection === 'messages'">
            <AdminMessages />
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
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Book Modal (Refactored as Component) -->
    <BookFormModal
      v-if="showAddModal || showEditModal"
      :show="showAddModal || showEditModal"
      :is-add="showAddModal"
      :book="editingBook"
      :book-form="bookForm"
      :categories="categories"
      :authors="authors"
      @save="saveBook"
      @close="closeModal"
    />
  </div>

  <!-- Delete Multiple Confirmation Modal (Refactored as Component) -->
  <DeleteBooksModal
    v-if="showDeleteModal"
    :show="showDeleteModal"
    :count="selectedBooks.length"
    @confirm="confirmDeleteMultiple"
    @cancel="cancelDeleteMultiple"
  />

  <!-- Delete Single Book Confirmation Modal (Refactored as Component) -->
  <DeleteBookModal
    v-if="showDeleteSingleModal"
    :show="showDeleteSingleModal"
    :book="bookToDelete"
    @confirm="confirmDeleteSingleBook"
    @cancel="cancelDeleteSingleBook"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Menu,
  TrendingUp,
  ShoppingBag,
  Users,
  BookOpen,
  Languages
} from 'lucide-vue-next'
import { useBookStore } from '@/stores/bookStore'
import { useAuthorStore } from '@/stores/authorStore'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminOrders from '@/components/admin/AdminOrders.vue'
import AdminTransactions from '@/components/admin/AdminTransactions.vue'
import AdminUserManagement from '@/components/admin/AdminUserManagement.vue'
import AdminMessages from '@/components/admin/AdminMessages.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import axios from 'axios'
const toastStore = useToastStore()
import BookTable from '@/components/admin/BookTable.vue'
import BookFormModal from '@/components/admin/BookFormModal.vue'
import DeleteBookModal from '@/components/admin/DeleteBookModal.vue'
import DeleteBooksModal from '@/components/admin/DeleteBooksModal.vue'
import { useToastStore } from '@/stores/toastStore'

const bookStore = useBookStore()
const authorStore = useAuthorStore()
const router = useRouter()
const route = useRoute()

const books = computed(() => bookStore.books)
const categories = computed(() => bookStore.categories)
const authors = computed(() => authorStore.authors)

// Sidebar and navigation
const activeSection = ref('books')
const sidebarOpen = ref(false)

// Set active section based on current route
const setActiveSectionFromRoute = () => {
  // console.log('Current route name:', route.name)
  switch (route.name) {
    case 'admin-orders':
      activeSection.value = 'orders'
      // console.log('Set activeSection to orders')
      break
    case 'admin-transactions':
      activeSection.value = 'transactions'
      // console.log('Set activeSection to transactions')
      break
    case 'admin-users':
      activeSection.value = 'users'
      // console.log('Set activeSection to users')
      break
    case 'admin-messages':
      activeSection.value = 'messages'
      break
    case 'admin':
    default:
      activeSection.value = 'books'
      // console.log('Set activeSection to books')
      break
  }
  // console.log('activeSection.value:', activeSection.value)
}

// Call on mount to set initial section
onMounted(() => {
  setActiveSectionFromRoute()
})

// Watch route changes
watch(() => route.name, () => {
  setActiveSectionFromRoute()
})

const changeSection = (section) => {
  sidebarOpen.value = false // Close mobile sidebar
  
  // Navigate to different admin pages
  switch (section) {
    case 'books':
      activeSection.value = 'books'
      router.push('/admin')
      break
    case 'categories':
      router.push('/admin/categories')
      break
    case 'authors':
      router.push('/admin/authors')
      break
    case 'publishers':
      // router.push('/admin/publishers') // When publishers page is created
      break
    case 'orders':
      activeSection.value = 'orders'
      router.push('/admin/orders')
      break
    case 'transactions':
      activeSection.value = 'transactions'
      router.push('/admin/transactions')
      break
    case 'users':
      activeSection.value = 'users'
      router.push('/admin/users')
      break
    case 'messages':
      activeSection.value = 'messages'
      router.push('/admin/messages')
      break
    default:
      activeSection.value = section
  }
}

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showDeleteSingleModal = ref(false)
const editingBook = ref(null)
const bookToDelete = ref(null)

// Multi-select states
const selectedBooks = ref([])
const selectAll = ref(false)

const bookForm = reactive({
  title: '',
  author: '',
  price: 0,
  author_id: null,
  category_id: null,
  publisher: null,
  publisher_year: null,
  price_origin: 0,
  category: '',
  stock: 0,
  image: '',
  description: '',
  language: '',
  number_of_page: 0,
  file_demo_url: null,
  isBn: 1
})

onMounted(() => {
  bookStore.fetchBooks()
  bookStore.fetchCategoriesAndAuthors()
  authorStore.fetchAuthors()
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const resetForm = () => {
  Object.assign(bookForm, {
    title: '',
    author_id: '',
    category_id: '',
    price: 0,
    price_origin: 0,
    stock: 0,
    publisher: null,
    publisher_year: null,
    image: '',
    description: '',
    language: '',
    number_of_page: 0,
    file_demo_url: null,
    isBn: 1
  })
}

const editBook = async (book) => {
  await bookStore.fetchCategoriesAndAuthors()
  editingBook.value = book
  bookForm.title = book.title
  bookForm.price = book.price
  bookForm.price_origin = book.price_origin || null
  bookForm.category_id = book.category?.category_id || null
  bookForm.author_id = book.author?.author_id || null
  bookForm.stock = book.quantity
  bookForm.image = book.image_url || ''
  bookForm.description = book.description || ''
  bookForm.publisher = book.publisher || null
  bookForm.publisher_year = book.publisher_year ? book.publisher_year.substring(0, 10)
    : null
  bookForm.language = book.language || ''
  bookForm.number_of_page = book.number_of_page || 0
    
  bookForm.isBn = book.is_bn,

  showEditModal.value = true
  showAddModal.value = false
}

const parseDate = (dateStr) => {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const [day, month, year] = dateStr.split('/')
  return `${year}-${month}-${day}`
}


const saveBook = async () => {
  const formData = new FormData()
  formData.append('title', bookForm.title)
  formData.append('price', bookForm.price)
  formData.append('price_origin', bookForm.price_origin)
  formData.append('category_id', bookForm.category_id)
  formData.append('author_id', bookForm.author_id)
  formData.append('quantity', bookForm.stock)
  formData.append('publisher', bookForm.publisher)
  formData.append('publisher_year', parseDate(bookForm.publisher_year))
  formData.append('description', bookForm.description)
  formData.append('language', bookForm.language)
  formData.append('number_of_page', bookForm.number_of_page)
  formData.append('file_demo_url', bookForm.file_demo_url)
  formData.append('is_bn', bookForm.isBn == true ? 1 : 0)

  if (bookForm.image instanceof File) {
    formData.append('image', bookForm.image) // multipart hỗ trợ file gốc
  } else if (typeof bookForm.image === 'string') {
    formData.append('image_url', bookForm.image) // fallback khi dùng URL
  }

  try {
    if (showAddModal.value) {
      await axios.post('/books/create-book', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Thông báo thành công
       toastStore.success('Sách đã được thêm thành công!')
    } else if (showEditModal.value && editingBook.value) {
      await axios.put(`/books/update-book?id=${editingBook.value.book_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Thông báo thành công
      toastStore.success('Sách đã được cập nhật thành công!')
    }

    await bookStore.fetchBooks()
    closeModal()
  } catch (err) {
    console.error('Lỗi khi lưu sách:', err)
    // Thông báo lỗi
    toastStore.error('Đã xảy ra lỗi khi lưu sách. Vui lòng thử lại sau.')
  }
}



const deleteBook = (id) => {
  const book = books.value.find(b => b.book_id === id)
  if (book) {
    bookToDelete.value = book
    showDeleteSingleModal.value = true
  }
}

const confirmDeleteSingleBook = async () => {
  if (bookToDelete.value) {
    try {
      await bookStore.deleteBook(bookToDelete.value.book_id)
      bookToDelete.value = null
      showDeleteSingleModal.value = false
    } catch (error) {
      console.error('Error deleting book:', error)
    }
  }
}

const cancelDeleteSingleBook = () => {
  bookToDelete.value = null
  showDeleteSingleModal.value = false
}

// Multi-select methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedBooks.value = []
  } else {
    selectedBooks.value = books.value.map(book => book.book_id)
  }
  selectAll.value = !selectAll.value
}

const updateSelectAll = () => {
  selectAll.value = selectedBooks.value.length === books.value.length && books.value.length > 0
}

const deleteMultipleBooks = () => {
  if (selectedBooks.value.length === 0) return
  showDeleteModal.value = true
}

const confirmDeleteMultiple = async () => {
  try {
    let successCount = 0
    let errorCount = 0

    // Xóa từng sách một cách tuần tự
    for (const bookId of selectedBooks.value) {
      try {
        await bookStore.deleteBook(bookId)
        successCount++
      } catch (error) {
        errorCount++
        console.error(`Lỗi khi xóa sách ID ${bookId}:`, error)
        toastStore.error(`Lỗi khi xóa sách ID ${bookId}: ${error.message || 'Không rõ lỗi'}`)
      }
    }

    // Reset selection
    selectedBooks.value = []
    selectAll.value = false
    showDeleteModal.value = false

    // Refresh danh sách sách
    await bookStore.fetchBooks()

    // Hiển thị thông báo kết quả
    if (errorCount === 0) {
      toastStore.success(`Đã xóa thành công ${successCount} sách`)
    } else {
      toastStore.error(`Đã xóa ${successCount} sách, thất bại ${errorCount} sách`)
    }

  } catch (error) {
    toastStore.error('Đã xảy ra lỗi khi xóa sách. Vui lòng thử lại sau.')
  }
}

const cancelDeleteMultiple = () => {
  showDeleteModal.value = false
}

const openAddBookModal = async () => {
  resetForm()
  await bookStore.fetchCategoriesAndAuthors()
  showAddModal.value = true
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

.btn-danger {
  background: linear-gradient(to right, #dc2626, #b91c1c);
  color: white;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
}

.btn-danger:hover {
  background: linear-gradient(to right, #b91c1c, #991b1b);
  box-shadow: 0 6px 10px rgba(220, 38, 38, 0.4);
  transform: translateY(-1px);
}

.btn-danger:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.btn-secondary:active {
  transform: scale(0.98);
}

.input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .input-field {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark .input-field:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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

  .btn-danger {
    background: linear-gradient(to right, #dc2626, #b91c1c);
    color: white;
    box-shadow: 0 4px 6px rgba(220, 38, 38, 0.4);
  }

  .btn-danger:hover {
    background: linear-gradient(to right, #b91c1c, #991b1b);
    box-shadow: 0 6px 10px rgba(220, 38, 38, 0.5);
  }

  .btn-secondary {
    background: #374151;
    color: #f9fafb;
    border: 1px solid #4b5563;
  }

  .btn-secondary:hover {
    background: #4b5563;
    border-color: #6b7280;
  }
}
</style>
