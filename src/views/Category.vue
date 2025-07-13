<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex">
      <!-- Sidebar -->
      <AdminSidebar :activeSection="'categories'" @change-section="changeSection"
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
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Quản lý danh mục</h1>
            <button @click="sidebarOpen = !sidebarOpen"
              class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <Menu class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Main content area -->
        <div class="p-6 lg:p-8">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý danh mục</h1>
              <p class="text-gray-600 dark:text-gray-300 mt-1">Quản lý danh mục sách trong hệ thống</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-2">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ categoryStore.totalCategories }} danh mục
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Table -->
          <CategoryTable
            :categories="categoryStore.filteredCategories"
            :loading="categoryStore.isLoading"
            @search="handleSearch"
            @add-category="openAddModal"
            @edit-category="openEditModal"
            @delete-category="openDeleteModal"
            @delete-multiple="handleDeleteMultiple"
          />

          <!-- Add/Edit Category Modal -->
          <CategoryFormModal
            :show="showFormModal"
            :category="selectedCategory"
            :loading="formLoading"
            @close="closeFormModal"
          />

          <!-- Delete Single Category Modal -->
          <DeleteCategoryModal
            :show="showDeleteModal"
            :category="selectedCategory"
            :loading="deleteLoading"
            @close="closeDeleteModal"
            @confirm="handleDeleteCategory"
          />

          <!-- Delete Multiple Categories Modal -->
          <DeleteCategoriesModal
            :show="showDeleteMultipleModal"
            :categories="selectedCategoriesForDelete"
            :loading="deleteLoading"
            @close="closeDeleteMultipleModal"
            @confirm="handleDeleteMultipleCategories"
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
import { useCategoryStore } from '@/stores/categoryStore'
import { useToastStore } from '@/stores/toastStore'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import CategoryTable from '@/components/admin/CategoryTable.vue'
import CategoryFormModal from '@/components/admin/CategoryFormModal.vue'
import DeleteCategoryModal from '@/components/admin/DeleteCategoryModal.vue'
import DeleteCategoriesModal from '@/components/admin/DeleteCategoriesModal.vue'

const categoryStore = useCategoryStore()
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
const selectedCategory = ref(null)
const selectedCategoryIds = ref([])

// Computed
const selectedCategoriesForDelete = computed(() => {
  return categoryStore.categories.filter(category => 
    selectedCategoryIds.value.includes(category.category_id)
  )
})

// Search handler
const handleSearch = (query) => {
  categoryStore.setSearchQuery(query)
}

// Sidebar handler
const changeSection = (section) => {
  // Navigation logic for different admin sections
  switch (section) {
    case 'books':
      router.push('/admin')
      break
    case 'categories':
      // Already on categories page
      router.push('/admin/categories')
      break
    case 'authors':
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
  selectedCategory.value = null
  showFormModal.value = true
}

const openEditModal = (category) => {
  selectedCategory.value = category
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedCategory.value = null
  formLoading.value = false
}

const openDeleteModal = (category) => {
  selectedCategory.value = category
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedCategory.value = null
  deleteLoading.value = false
}

const openDeleteMultipleModal = () => {
  if (selectedCategoryIds.value.length === 0) {
    toastStore.warning('Vui lòng chọn ít nhất một danh mục để xóa')
    return
  }
  showDeleteMultipleModal.value = true
}

const closeDeleteMultipleModal = () => {
  showDeleteMultipleModal.value = false
  selectedCategoryIds.value = []
  deleteLoading.value = false
}

// Handle delete multiple from table selection
const handleDeleteMultiple = (categoryIds) => {
  selectedCategoryIds.value = categoryIds
  if (categoryIds.length > 0) {
    openDeleteMultipleModal()
  }
}

// CRUD operations
const handleDeleteCategory = async (category) => {
  deleteLoading.value = true
  
  try {
    const result = await categoryStore.deleteCategory(category.category_id)
    
    if (result.success) {
      toastStore.success(`Đã xóa danh mục "${category.name}" thành công!`)
      closeDeleteModal()
    } else {
      toastStore.error(result.error || 'Không thể xóa danh mục')
    }
  } catch (error) {
    console.error('Delete category error:', error)
    toastStore.error('Đã có lỗi xảy ra khi xóa danh mục')
  } finally {
    deleteLoading.value = false
  }
}

const handleDeleteMultipleCategories = async (categories) => {
  deleteLoading.value = true
  
  try {
    let successCount = 0
    let errorCount = 0

    // Delete each category sequentially
    for (const category of categories) {
      try {
        const result = await categoryStore.deleteCategory(category.category_id)
        if (result.success) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        errorCount++
        console.error(`Error deleting category ID ${category.category_id}:`, error)
      }
    }

    // Show results
    if (errorCount === 0) {
      toastStore.success(`Đã xóa thành công ${successCount} danh mục`)
    } else {
      toastStore.error(`Đã xóa ${successCount} danh mục, thất bại ${errorCount} danh mục`)
    }

    closeDeleteMultipleModal()
  } catch (error) {
    console.error('Delete multiple categories error:', error)
    toastStore.error('Đã có lỗi xảy ra khi xóa danh mục')
  } finally {
    deleteLoading.value = false
  }
}

// Initialize data
onMounted(async () => {
  await categoryStore.fetchCategories()
})
</script>

<style scoped>
:global(.dark) .min-h-screen {
  background: #0f172a; /* Match dark background */
  color: #cbd5e1; /* Text color for better readability */
}

:global(.dark) .lg\:hidden {
  background: #1e293b; /* Header background */
  color: #e2e8f0; /* Header text color */
}

:global(.dark) .max-w-7xl {
  background: #0f172a; /* Content background */
  color: #cbd5e1; /* Content text color */
}
</style>
