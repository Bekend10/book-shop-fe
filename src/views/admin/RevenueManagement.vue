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
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Báo cáo doanh thu</h1>
            <button @click="sidebarOpen = !sidebarOpen"
              class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Menu class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 lg:p-8">
          <RevenueReport />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Menu } from 'lucide-vue-next'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import RevenueReport from '@/components/admin/RevenueReport.vue'

// Sidebar state
const sidebarOpen = ref(false)
const activeSection = ref('revenue')

const changeSection = (section) => {
  activeSection.value = section
}
</script>

<style scoped>
/* Sidebar mobile responsive */
.mobile-open {
  transform: translateX(0);
}

/* Responsive */
@media (max-width: 768px) {
  .revenue-page {
    padding: 1rem;
  }
}
</style>
