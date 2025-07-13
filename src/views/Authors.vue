<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex">
      <!-- Sidebar -->
      <AdminSidebar :activeSection="'authors'" @change-section="changeSection"
        :class="{ 'mobile-open': sidebarOpen }" />

      <!-- Mobile sidebar overlay -->
      <div v-if="sidebarOpen" @click="sidebarOpen = false" 
           class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden">
      </div>

      <!-- Main Content -->
      <div class="flex-1 lg:ml-0">
        <!-- Mobile Header -->
        <div class="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Quản lý tác giả</h1>
            <button @click="sidebarOpen = !sidebarOpen"
              class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Menu class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 lg:p-8">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý tác giả</h1>
              <p class="text-gray-600 dark:text-gray-300 mt-1">Quản lý thông tin tác giả trong hệ thống</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-2">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ authorStore.totalAuthors }} tác giả
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Author Table -->
          <AuthorTable
            :authors="authorStore.filteredAuthors"
            :loading="authorStore.isLoading"
            @search="handleSearch"
            @add-author="openAddModal"
            @edit-author="openEditModal"
            @delete-author="openDeleteModal"
            @delete-multiple="handleDeleteMultiple"
          />

          <!-- Add/Edit Author Modal -->
          <AuthorFormModal
            :show="showFormModal"
            :author="selectedAuthor"
            :loading="formLoading"
            @close="closeFormModal"
          />

          <!-- Delete Single Author Modal -->
          <DeleteAuthorModal
            :show="showDeleteModal"
            :author="selectedAuthor"
            :loading="deleteLoading"
            @close="closeDeleteModal"
            @confirm="handleDeleteAuthor"
          />

          <!-- Delete Multiple Authors Modal -->
          <DeleteAuthorsModal
            :show="showDeleteMultipleModal"
            :authors="selectedAuthorsForDelete"
            :loading="deleteLoading"
            @close="closeDeleteMultipleModal"
            @confirm="handleDeleteMultipleAuthors"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Menu } from 'lucide-vue-next'
import { useAuthorStore } from '@/stores/authorStore'
import { useToastStore } from '@/stores/toastStore'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AuthorTable from '@/components/admin/AuthorTable.vue'
import AuthorFormModal from '@/components/admin/AuthorFormModal.vue'
import DeleteAuthorModal from '@/components/admin/DeleteAuthorModal.vue'
import DeleteAuthorsModal from '@/components/admin/DeleteAuthorsModal.vue'

const authorStore = useAuthorStore()
const toastStore = useToastStore()
const router = useRouter()

// Sidebar state
const sidebarOpen = ref(false)

// Modal states
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const showDeleteMultipleModal = ref(false)

// Loading states
const formLoading = ref(false)
const deleteLoading = ref(false)

// Selected data
const selectedAuthor = ref(null)
const selectedAuthorIds = ref([])

// Computed
const selectedAuthorsForDelete = computed(() => {
  return authorStore.authors.filter(author => 
    selectedAuthorIds.value.includes(author.author_id)
  )
})

// Search handler
const handleSearch = (query) => {
  authorStore.setSearchQuery(query)
}

// Sidebar handler
const changeSection = (section) => {
  // Navigation logic for different admin sections
  switch (section) {
    case 'books':
      router.push('/admin') // When books page is created
      break
    case 'categories':
      router.push('/admin/categories') // When categories page is created
      break
    case 'authors':
      // Already on authors page
      router.push('/admin/authors')
      break
    case 'publishers':
      // router.push('/admin/publishers') // When publishers page is created
      break
    case 'orders':
      // router.push('/admin/orders') // When orders page is created
      break
    case 'users':
      // router.push('/admin/users') // When users page is created
      break
    default:
      console.log('Unknown section:', section)
  }
}

// Modal handlers
const openAddModal = () => {
  selectedAuthor.value = null
  showFormModal.value = true
}

const openEditModal = (author) => {
  selectedAuthor.value = author
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedAuthor.value = null
  formLoading.value = false
}

const openDeleteModal = (author) => {
  selectedAuthor.value = author
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedAuthor.value = null
  deleteLoading.value = false
}

const openDeleteMultipleModal = () => {
  if (selectedAuthorIds.value.length === 0) {
    toastStore.warning('Vui lòng chọn ít nhất một tác giả để xóa')
    return
  }
  showDeleteMultipleModal.value = true
}

const closeDeleteMultipleModal = () => {
  showDeleteMultipleModal.value = false
  selectedAuthorIds.value = []
  deleteLoading.value = false
}

// Handle delete multiple from table selection
const handleDeleteMultiple = (authorIds) => {
  selectedAuthorIds.value = authorIds
  if (authorIds.length > 0) {
    openDeleteMultipleModal()
  }
}


// CRUD operations
const handleDeleteAuthor = async (author) => {
  deleteLoading.value = true
  
  try {
    const result = await authorStore.deleteAuthor(author.author_id)
    
    if (result.success) {
      toastStore.success(`Đã xóa tác giả "${author.name}" thành công!`)
      // Refresh lại danh sách authors
      await authorStore.fetchAuthors()
      closeDeleteModal()
    } else {
      toastStore.error(result.error || 'Không thể xóa tác giả')
    }
  } catch (error) {
    console.error('Delete author error:', error)
    toastStore.error('Đã có lỗi xảy ra. Vui lòng thử lại.')
  } finally {
    deleteLoading.value = false
  }
}

const handleDeleteMultipleAuthors = async (authors) => {
  deleteLoading.value = true
  
  try {
    const authorIds = authors.map(author => author.author_id)
    const result = await authorStore.deleteMultipleAuthors(authorIds)
    
    if (result.success) {
      toastStore.success(`Đã xóa ${authors.length} tác giả thành công!`)
      // Refresh lại danh sách authors
      await authorStore.fetchAuthors()
      closeDeleteMultipleModal()
    } else {
      toastStore.error(result.error || 'Không thể xóa các tác giả đã chọn')
    }
  } catch (error) {
    console.error('Delete multiple authors error:', error)
    toastStore.error('Đã có lỗi xảy ra. Vui lòng thử lại.')
  } finally {
    deleteLoading.value = false
  }
}

// Initialize data
onMounted(async () => {
  try {
    await authorStore.fetchAuthors()
  } catch (error) {
    console.error('Failed to fetch authors:', error)
    toastStore.error('Không thể tải danh sách tác giả')
  }
})
</script>

<style scoped>
/* AdminSidebar specific styles for Authors page */
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 16rem;
  height: 100vh;
  z-index: 40;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.admin-sidebar.mobile-open {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  .admin-sidebar {
    position: relative;
    transform: translateX(0);
    width: 16rem;
    flex-shrink: 0;
  }
  
  .flex-1 {
    margin-left: 0;
  }
}
</style>
