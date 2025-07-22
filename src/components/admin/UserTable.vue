<template>
  <div class="user-table-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    <!-- Header với Search và Actions -->
    <div class="table-header">
      <div class="search-section">
        <div class="search-bar">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Tìm kiếm người dùng..."
            class="search-input dark:bg-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
      
      <div class="actions-section">
        <select 
          v-model="statusFilter" 
          @change="handleStatusFilter"
          class="status-filter dark:bg-gray-700 dark:text-gray-300"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Bị khóa</option>
        </select>
        
        <select 
          v-model="roleFilter" 
          @change="handleRoleFilter"
          class="role-filter dark:bg-gray-700 dark:text-gray-300"
        >
          <option value="">Tất cả vai trò</option>
          <option value="user">Khách hàng</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead class="table-header-row">
          <tr>
            <th class="table-cell">ID</th>
            <th class="table-cell">Ảnh đại diện</th>
            <th class="table-cell">Thông tin</th>
            <th class="table-cell">Email</th>
            <th class="table-cell">Vai trò</th>
            <th class="table-cell">Trạng thái</th>
            <th class="table-cell">Ngày tạo</th>
            <th class="actions-column">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in paginatedUsers"
            :key="user.user_id"
            class="table-row bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
          >
            <td class="table-cell text-gray-900 dark:text-gray-100">
              <div class="user-id">
                #{{ user.user_id }}
              </div>
            </td>
            <td class="table-cell text-gray-900 dark:text-gray-100">
              <div class="avatar-container">
                <img 
                  v-if="user.avatar" 
                  :src="user.avatar" 
                  :alt="user.first_name"
                  class="user-avatar"
                />
                <div v-else class="user-avatar-placeholder">
                  <User class="avatar-icon" />
                </div>
              </div>
            </td>
            <td class="table-cell text-gray-900 dark:text-gray-100">
              <div class="user-info">
                <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
                <div class="user-phone text-gray-600 dark:text-gray-300">
                  {{ user.phone || 'Chưa có số điện thoại' }}
                </div>
              </div>
            </td>
            <td class="table-cell text-gray-600 dark:text-gray-300">
              <span class="user-email">{{ user.email }}</span>
            </td>
            <td class="table-cell">
              <span 
                class="role-badge"
                :class="getRoleClass(user.role)"
              >
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td class="table-cell">
              <span 
                class="status-badge"
                :class="getStatusClass(user.is_active)"
              >
                {{ getStatusText(user.is_active) }}
              </span>
            </td>
            <td class="table-cell text-gray-600 dark:text-gray-300">
              <span class="created-date">{{ formatDate(user.created_at) }}</span>
            </td>
            <td class="actions-column">
              <div class="action-buttons">
                <button
                  @click="$emit('view-details', user)"
                  class="btn btn-icon-only btn-primary-outline dark:border-gray-600"
                  title="Xem chi tiết"
                >
                  <Eye class="btn-icon" />
                </button>
                <button
                  @click="$emit('edit-user', user)"
                  class="btn btn-icon-only btn-success-outline dark:border-gray-600"
                  title="Chỉnh sửa"
                >
                  <Edit class="btn-icon" />
                </button>
                <button
                  @click="$emit('toggle-status', user.account_id)"
                  class="btn btn-icon-only"
                  :class="user.is_active ? 'btn-danger-outline' : 'btn-warning-outline'"
                  :title="user.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'"
                >
                  <Lock v-if="user.is_active" class="btn-icon" />
                  <Unlock v-else class="btn-icon" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          <p class="results-info">
            Hiển thị {{ paginationInfo.start }}-{{ paginationInfo.end }} của {{ paginationInfo.total }} người dùng
          </p>
        </div>
        
        <div class="pagination-controls">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="pagination-btn"
            :class="{ 'pagination-btn-disabled': currentPage === 1 }"
          >
            Đầu
          </button>
          
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="pagination-btn"
            :class="{ 'pagination-btn-disabled': currentPage === 1 }"
          >
            Trước
          </button>
          
          <div class="pagination-numbers">
            <button
              v-for="page in getVisiblePages"
              :key="page"
              @click="currentPage = page"
              class="pagination-number"
              :class="{ 'pagination-number-active': page === currentPage }"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            :class="{ 'pagination-btn-disabled': currentPage === totalPages }"
          >
            Sau
          </button>
          
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            :class="{ 'pagination-btn-disabled': currentPage === totalPages }"
          >
            Cuối
          </button>
        </div>
        
        <div class="items-per-page">
          <select 
            v-model="itemsPerPage" 
            class="items-per-page-select dark:bg-gray-700 dark:text-gray-300"
          >
            <option value="5">5/trang</option>
            <option value="10">10/trang</option>
            <option value="20">20/trang</option>
            <option value="50">50/trang</option>
          </select>
        </div>
      </div>

      <!-- Footer thông tin khi không có phân trang -->
      <div v-else-if="filteredUsers.length > 0" class="table-footer dark:bg-gray-700">
        <p class="results-info">
          Hiển thị {{ filteredUsers.length }} người dùng
          <span v-if="filteredUsers.length !== users.length">
            ({{ users.length }} tổng)
          </span>
        </p>
      </div>

      <!-- Empty State -->
      <div v-if="paginatedUsers.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <Users class="empty-icon-svg" />
        </div>
        <div v-if="searchQuery || statusFilter || roleFilter" class="empty-title">Không tìm thấy người dùng</div>
        <div v-else class="empty-title">Chưa có người dùng nào</div>
        <div v-if="searchQuery || statusFilter || roleFilter" class="empty-subtitle">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
        </div>
        <div v-else class="empty-subtitle">Người dùng sẽ xuất hiện ở đây khi đăng ký</div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">Đang tải...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Eye, Edit, Lock, Unlock, User, Users } from 'lucide-vue-next'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-details',
  'edit-user',
  'toggle-status'
])

const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed filtered users
const filteredUsers = computed(() => {
  let users = props.users

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(user =>
      user.user_id.toString().includes(query) ||
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== '') {
    users = users.filter(user => user.is_active === (statusFilter.value === 'true'))
  }

  if (roleFilter.value !== '') {
    users = users.filter(user => user.role === roleFilter.value)
  }

  return users
})

// Computed paginated users
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredUsers.value.slice(start, end)
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value)
})

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(start + itemsPerPage.value - 1, filteredUsers.value.length)
  return {
    start,
    end,
    total: filteredUsers.value.length
  }
})

// Methods
const handleSearch = () => {
  currentPage.value = 1
}

const handleStatusFilter = () => {
  currentPage.value = 1
}

const handleRoleFilter = () => {
  currentPage.value = 1
}

// Computed để hiển thị các trang
const getVisiblePages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, currentPage.value - delta);
       i <= Math.min(totalPages.value - 1, currentPage.value + delta);
       i++) {
    range.push(i)
  }

  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (currentPage.value + delta < totalPages.value - 1) {
    rangeWithDots.push('...', totalPages.value)
  } else if (totalPages.value > 1) {
    rangeWithDots.push(totalPages.value)
  }

  return rangeWithDots.filter((item, index, array) => array.indexOf(item) === index)
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getRoleClass = (role) => {
  const classes = {
    'admin': 'role-admin',
    'user': 'role-user'
  }
  return classes[role] || 'role-user'
}

const getRoleText = (role) => {
  const texts = {
    'admin': 'Quản trị viên',
    'user': 'Khách hàng'
  }
  return texts[role] || 'Khách hàng'
}

const getStatusClass = (is_active) => {
  return is_active ? 'status-active' : 'status-inactive'
}

const getStatusText = (is_active) => {
  return is_active ? 'Hoạt động' : 'Bị khóa'
}

// Watch for itemsPerPage changes to reset currentPage
watch(itemsPerPage, () => {
  currentPage.value = 1
})

// Watch for filteredUsers changes to ensure currentPage is valid
watch(filteredUsers, () => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value
  }
})
</script>

<style scoped>
/* ===== BASE STYLES ===== */
.user-table-container {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  width: 100%;
  transition: all 0.3s ease;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Custom Scrollbar */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox scrollbar */
.table-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  transition: all 0.3s ease;
}

.search-section {
  flex: 1;
  max-width: 24rem;
}

.search-bar {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #111827;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.actions-section {
  display: flex;
  gap: 0.75rem;
  margin-left: 1rem;
  align-items: center;
}

.status-filter,
.role-filter {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #111827;
  min-width: 140px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Table Styles */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  min-width: 800px; /* Minimum width to prevent crushing */
}

.table-header-row {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table-header-row th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  position: sticky;
  top: 0;
  background: #f9fafb;
  z-index: 10;
}

/* Column widths for optimal display */
.data-table th:nth-child(1),
.data-table td:nth-child(1) { width: 6%; min-width: 60px; }   /* ID */
.data-table th:nth-child(2),
.data-table td:nth-child(2) { width: 8%; min-width: 70px; }   /* Avatar */
.data-table th:nth-child(3),
.data-table td:nth-child(3) { width: 20%; min-width: 180px; } /* Info */
.data-table th:nth-child(4),
.data-table td:nth-child(4) { width: 18%; min-width: 160px; } /* Email */
.data-table th:nth-child(5),
.data-table td:nth-child(5) { width: 12%; min-width: 120px; } /* Role */
.data-table th:nth-child(6),
.data-table td:nth-child(6) { width: 12%; min-width: 120px; } /* Status */
.data-table th:nth-child(7),
.data-table td:nth-child(7) { width: 12%; min-width: 100px; } /* Date */
.data-table th:nth-child(8),
.data-table td:nth-child(8) { width: 12%; min-width: 140px; } /* Actions */

.table-cell {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #111827;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-row {
  background: white;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f9fafb;
}

/* User Info Styles */
.user-id {
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.875rem;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.user-avatar-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
}

.avatar-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
}

.user-phone {
  font-size: 0.75rem;
  margin-top: 0.125rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Badges */
.role-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
  white-space: nowrap;
}

.role-admin {
  background: #fef3c7;
  color: #d97706;
}

.role-user {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-active {
  background: #dcfce7;
  color: #059669;
}

.status-inactive {
  background: #fee2e2;
  color: #dc2626;
}

.created-date {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.btn-icon-only {
  padding: 0.5rem;
  width: 2rem;
  height: 2rem;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-primary-outline {
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-primary-outline:hover {
  background: #eff6ff;
}

.btn-success-outline {
  color: #059669;
  border-color: #059669;
}

.btn-success-outline:hover {
  background: #ecfdf5;
}

.btn-danger-outline {
  color: #dc2626;
  border-color: #dc2626;
}

.btn-danger-outline:hover {
  background: #fef2f2;
}

.btn-warning-outline {
  color: #d97706;
  border-color: #d97706;
}

.btn-warning-outline:hover {
  background: #fffbeb;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover {
  background-color: #f3f4f6;
}

.pagination-btn-disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.25rem;
}

.pagination-number {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination-number:hover {
  background-color: #f3f4f6;
}

.pagination-number-active {
  background-color: #2563eb;
  color: #ffffff;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-per-page-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

/* Large Desktop (1200px+) - Default styles above */

/* Desktop/Laptop (992px - 1199px) */
@media (max-width: 1199px) {
  .table-header {
    padding: 1.25rem;
  }
  
  .search-section {
    max-width: 20rem;
  }
  
  .table-cell {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .table-header-row th {
    padding: 0.75rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .user-name {
    font-size: 0.8rem;
  }
  
  .user-phone,
  .created-date {
    font-size: 0.7rem;
  }
  
  .user-email {
    font-size: 0.8rem;
  }
  
  .role-badge,
  .status-badge {
    font-size: 0.6rem;
    padding: 0.2rem 0.6rem;
  }
}

/* Tablet Portrait (768px - 991px) */
@media (max-width: 991px) {
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }
  
  .search-section {
    max-width: none;
    width: 100%;
  }
  
  .actions-section {
    justify-content: flex-start;
    margin-left: 0;
    width: 100%;
  }
  
  .status-filter,
  .role-filter {
    flex: 1;
    min-width: 120px;
  }
  
  /* Table becomes horizontally scrollable */
  .data-table {
    min-width: 900px;
  }
  
  .table-cell {
    padding: 0.625rem 0.375rem;
    font-size: 0.75rem;
  }
  
  .table-header-row th {
    padding: 0.625rem 0.375rem;
    font-size: 0.65rem;
  }
  
  .user-avatar,
  .user-avatar-placeholder {
    width: 2rem;
    height: 2rem;
  }
  
  .avatar-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .btn-icon-only {
    padding: 0.375rem;
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .btn-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  /* Pagination adjustments */
  .pagination-container {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .pagination-controls {
    order: 1;
    width: 100%;
    justify-content: center;
  }
  
  .pagination-info {
    order: 2;
    text-align: center;
  }
  
  .items-per-page {
    order: 0;
    width: auto;
  }
}

/* Mobile Landscape (576px - 767px) */
@media (max-width: 767px) {
  .table-header {
    padding: 0.875rem;
  }
  
  .search-input {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 0.625rem 0.625rem 0.625rem 2.25rem;
  }
  
  .search-icon {
    left: 0.625rem;
  }
  
  .status-filter,
  .role-filter {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 0.625rem 0.5rem;
  }
  
  .data-table {
    min-width: 800px;
  }
  
  .table-cell {
    padding: 0.5rem 0.25rem;
    font-size: 0.7rem;
  }
  
  .table-header-row th {
    padding: 0.5rem 0.25rem;
    font-size: 0.6rem;
  }
  
  .user-name {
    font-size: 0.75rem;
  }
  
  .user-phone {
    font-size: 0.65rem;
  }
  
  .user-email {
    font-size: 0.7rem;
  }
  
  .user-avatar,
  .user-avatar-placeholder {
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .avatar-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .role-badge,
  .status-badge {
    padding: 0.125rem 0.5rem;
    font-size: 0.55rem;
  }
  
  .action-buttons {
    gap: 0.25rem;
    flex-direction: row;
    justify-content: center;
  }
  
  .btn-icon-only {
    padding: 0.25rem;
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .btn-icon {
    width: 0.75rem;
    height: 0.75rem;
  }
  
  /* Pagination adjustments */
  .pagination-container {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .pagination-controls {
    order: 1;
    width: 100%;
    justify-content: center;
  }
  
  .pagination-info {
    order: 2;
    text-align: center;
  }
  
  .items-per-page {
    order: 0;
    width: auto;
  }
}

/* Mobile Portrait (480px - 575px) */
@media (max-width: 575px) {
  .table-header {
    padding: 0.75rem;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .status-filter,
  .role-filter {
    width: 100%;
    min-width: auto;
  }
  
  .data-table {
    min-width: 700px;
  }
  
  .table-cell {
    padding: 0.375rem 0.1875rem;
    font-size: 0.65rem;
  }
  
  .table-header-row th {
    padding: 0.375rem 0.1875rem;
    font-size: 0.55rem;
  }
  
  .user-name {
    font-size: 0.7rem;
  }
  
  .user-phone {
    font-size: 0.6rem;
  }
  
  .user-email {
    font-size: 0.65rem;
  }
  
  .user-avatar,
  .user-avatar-placeholder {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .avatar-icon {
    width: 0.75rem;
    height: 0.75rem;
  }
  
  .role-badge,
  .status-badge {
    padding: 0.1rem 0.375rem;
    font-size: 0.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .btn-icon-only {
    padding: 0.1875rem;
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .pagination-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

  .btn-icon {
    width: 0.625rem;
    height: 0.625rem;
  }
  
  /* Pagination adjustments */
  .pagination-container {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
  }
  
  .pagination-controls {
    order: 1;
    width: 100%;
    justify-content: center;
  }
  
  .pagination-info {
    order: 2;
    text-align: center;
  }
  
  .items-per-page {
    order: 0;
    width: auto;
  }
}

/* Extra Small Mobile (Below 480px) */
@media (max-width: 479px) {
  .table-header {
    padding: 0.5rem;
  }
  
  .search-input {
    padding: 0.5rem 0.5rem 0.5rem 2rem;
  }
  
  .search-icon {
    left: 0.5rem;
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .data-table {
    min-width: 600px;
  }
  
  .table-cell {
    padding: 0.25rem 0.125rem;
    font-size: 0.6rem;
  }
  
  .table-header-row th {
    padding: 0.25rem 0.125rem;
    font-size: 0.5rem;
  }
  
  /* Compress column widths for very small screens */
  .data-table th:nth-child(1),
  .data-table td:nth-child(1) { min-width: 40px; }
  .data-table th:nth-child(2),
  .data-table td:nth-child(2) { min-width: 50px; }
  .data-table th:nth-child(3),
  .data-table td:nth-child(3) { min-width: 140px; }
  .data-table th:nth-child(4),
  .data-table td:nth-child(4) { min-width: 120px; }
  .data-table th:nth-child(5),
  .data-table td:nth-child(5) { min-width: 80px; }
  .data-table th:nth-child(6),
  .data-table td:nth-child(6) { min-width: 80px; }
  .data-table th:nth-child(7),
  .data-table td:nth-child(7) { min-width: 70px; }
  .data-table th:nth-child(8),
  .data-table td:nth-child(8) { min-width: 90px; }
  
  .user-avatar,
  .user-avatar-placeholder {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .avatar-icon {
    width: 0.625rem;
    height: 0.625rem;
  }
  
  .btn-icon-only {
    width: 1.125rem;
    height: 1.125rem;
    padding: 0.125rem;
  }
  
  .btn-icon {
    width: 0.5rem;
    height: 0.5rem;
  }

  .empty-row {
  height: 12rem;
}

.empty-cell {
  text-align: center;
  border: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: #d1d5db;
  margin-bottom: 0.75rem;
}

.empty-text {
  color: #6b7280;
  font-size: 0.875rem;
}
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1rem;
}

.empty-icon-svg {
  width: 3rem;
  height: 3rem;
  color: #d1d5db;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.empty-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

/* ===== DARK MODE STYLES ===== */
.dark .user-table-container {
  background: #1f2937;
  border-color: #374151;
    border : 1px solid #e5e7eb;
}

.dark .table-header {
  background: #1f2937;
  /* border-bottom-color: #374151; */
}

.dark .table-wrapper::-webkit-scrollbar-track {
  background: #374151;
}

.dark .table-wrapper::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .table-wrapper {
  scrollbar-color: #6b7280 #374151;
}

.dark .data-table {
  background: #1f2937;
}

.dark .table-header-row {
  background: #374151;
  border-bottom-color: #4b5563;
}

.dark .table-header-row th {
  color: #94a3b8;
  background: #374151;
}

.dark .table-cell {
  color: #cbd5e1;
  border-bottom-color: #374151;
}

.dark .table-row {
  background: #1f2937;
}

.dark .table-row:hover {
  background: #374151;
}

.dark .user-name {
  color: #e2e8f0;
}

.dark .user-phone,
.dark .user-email,
.dark .created-date {
  color: #94a3b8;
}

.dark .search-input {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
  border : 1px solid #e5e7eb;
}

.dark .search-input:focus {
  border-color: #3b82f6;
}

.dark .search-icon {
  color: #9ca3af;
}

.dark .status-filter,
.dark .role-filter {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
  border : 1px solid #e5e7eb;
}

.dark .pagination-container {
  background: #374151;
  border-top-color: #4b5563;
  border : 1px solid #e5e7eb;
}

.results-info {
  padding: 1rem;
}

.dark .results-info {
  color: #d1d5db;
}

.dark .pagination-btn {
  background: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

.dark .pagination-btn:hover:not(.pagination-btn-disabled) {
  background: #374151;
  border-color: #9ca3af;
}

.dark .pagination-btn-disabled {
  color: #6b7280;
}

.dark .pagination-number {
  background: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

.dark .pagination-number:hover {
  background: #374151;
  border-color: #9ca3af;
}

.dark .pagination-number-active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.items-per-page-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  color: #111827;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.pagination-number {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  text-align: center;
}

.dark .items-per-page-select {
  background: #4b5563;
  border-color: #6b7280;
  color: #e5e7eb;
}

.dark .empty-title {
  color: #f9fafb;
}

.dark .empty-subtitle,
.dark .loading-text {
  color: #d1d5db;
}

.dark .user-avatar {
  border-color: #4b5563;
}

.dark .user-avatar-placeholder {
  background: #4b5563;
  border-color: #6b7280;
}

.dark .avatar-icon {
  color: #9ca3af;
}

/* ===== UTILITY CLASSES ===== */

/* Hide scrollbar while keeping functionality */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Smooth transitions for all interactive elements */
.smooth-transition {
  transition: all 0.2s ease;
}

/* Focus styles for accessibility */
.focus-visible:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
