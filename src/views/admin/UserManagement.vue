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
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h1>
            <button @click="sidebarOpen = !sidebarOpen"
              class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Menu class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 lg:p-8">
          <div class="users-management">
            <!-- Header -->
            <div class="page-header">
              <div class="header-content">
                <div class="title-section">
                  <h1 class="page-title">Quản lý người dùng</h1>
                  <p class="page-subtitle">Quản lý tài khoản và quyền hạn người dùng</p>
                </div>
                <div class="header-actions">
                  <button
                    @click="showCreateUser = true"
                    class="btn btn-primary"
                  >
                    <UserPlus class="btn-icon" />
                    Thêm người dùng
                  </button>
                </div>
              </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon stat-icon-primary">
                  <Users class="stat-icon-svg" />
                </div>
                <div class="stat-content">
                  <div class="stat-label">Tổng người dùng</div>
                  <div class="stat-value">{{ stats.totalUsers }}</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon stat-icon-success">
                  <UserCheck class="stat-icon-svg" />
                </div>
                <div class="stat-content">
                  <div class="stat-label">Đang hoạt động</div>
                  <div class="stat-value">{{ stats.activeUsers }}</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon stat-icon-warning">
                  <UserX class="stat-icon-svg" />
                </div>
                <div class="stat-content">
                  <div class="stat-label">Bị khóa</div>
                  <div class="stat-value">{{ stats.blockedUsers }}</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon stat-icon-info">
                  <Crown class="stat-icon-svg" />
                </div>
                <div class="stat-content">
                  <div class="stat-label">Quản trị viên</div>
                  <div class="stat-value">{{ stats.adminUsers }}</div>
                </div>
              </div>
            </div>

            <!-- User Table -->
            <div class="table-section">
              <UserTable
                :users="users"
                :loading="loading"
                @view-details="handleViewDetails"
                @edit-user="handleEditUser"
                @toggle-status="handleToggleStatus"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div v-if="showUserDetails" class="modal-overlay" @click="closeUserDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Chi tiết người dùng</h3>
          <button @click="closeUserDetails" class="modal-close">
            <X class="close-icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedUser" class="user-details">
            <div class="user-avatar-section">
              <img 
                v-if="selectedUser.avatar" 
                :src="selectedUser.avatar" 
                :alt="selectedUser.first_name"
                class="user-detail-avatar"
              />
              <div v-else class="user-detail-avatar-placeholder">
                <User class="avatar-placeholder-icon" />
              </div>
            </div>
            
            <div class="user-info-grid">
              <div class="info-item">
                <label class="info-label">ID</label>
                <span class="info-value">#{{ selectedUser.user_id }}</span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Họ tên</label>
                <span class="info-value">{{ selectedUser.first_name }} {{ selectedUser.last_name }}</span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Email</label>
                <span class="info-value">{{ selectedUser.email }}</span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Số điện thoại</label>
                <span class="info-value">{{ selectedUser.phone || 'Chưa có' }}</span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Vai trò</label>
                <span class="info-value">
                  <span 
                    class="role-badge"
                    :class="getRoleClass(selectedUser.role)"
                  >
                    {{ getRoleText(selectedUser.role) }}
                  </span>
                </span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Trạng thái</label>
                <span class="info-value">
                  <span 
                    class="status-badge"
                    :class="getStatusClass(selectedUser.status)"
                  >
                    {{ getStatusText(selectedUser.status) }}
                  </span>
                </span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Ngày tạo</label>
                <span class="info-value">{{ formatDate(selectedUser.created_at) }}</span>
              </div>
              
              <div class="info-item">
                <label class="info-label">Cập nhật lần cuối</label>
                <span class="info-value">{{ formatDate(selectedUser.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeUserDetails" class="btn btn-secondary">
            Đóng
          </button>
          <button @click="handleEditUser(selectedUser)" class="btn btn-primary">
            <Edit class="btn-icon" />
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateUser || showEditUser" class="modal-overlay" @click="closeUserForm">
      <div class="modal-content modal-content-large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showCreateUser ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng' }}
          </h3>
          <button @click="closeUserForm" class="modal-close">
            <X class="close-icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSubmitUser" class="user-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Họ *</label>
                <input
                  v-model="userForm.first_name"
                  type="text"
                  class="form-input"
                  placeholder="Nhập họ"
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Tên *</label>
                <input
                  v-model="userForm.last_name"
                  type="text"
                  class="form-input"
                  placeholder="Nhập tên"
                  required
                />
              </div>
              
              <div class="form-group form-group-full">
                <label class="form-label">Email *</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  class="form-input"
                  placeholder="Nhập email"
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Số điện thoại</label>
                <input
                  v-model="userForm.phone_number"
                  type="tel"
                  class="form-input"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Vai trò *</label>
                <select v-model="userForm.role_id" class="form-input" required>
                  <option value="user">Khách hàng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              
              <div v-if="showCreateUser" class="form-group form-group-full">
                <label class="form-label">Mật khẩu *</label>
                <input
                  v-model="userForm.password"
                  type="password"
                  class="form-input"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
              
              <div class="form-group form-group-full">
                <label class="form-label">Ảnh đại diện</label>
                <input
                  v-model="userForm.avatar"
                  type="url"
                  class="form-input"
                  placeholder="Nhập URL ảnh đại diện"
                />
              </div>
              
              <div class="form-group form-group-full">
                <label class="form-checkbox">
                  <input
                    v-model="userForm.status"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-label">Tài khoản hoạt động</span>
                </label>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="closeUserForm" class="btn btn-secondary">
            Hủy
          </button>
          <button @click="handleSubmitUser" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Đang xử lý...' : (showCreateUser ? 'Tạo người dùng' : 'Cập nhật') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Users, UserPlus, UserCheck, UserX, Crown, User, 
  X, Edit, Eye, Lock, Unlock, Menu
} from 'lucide-vue-next'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import UserTable from '@/components/admin/UserTable.vue'
import { useUserStore } from '@/stores/userStore'

// Sidebar state
const sidebarOpen = ref(false)
const activeSection = ref('users')

// User store
const userStore = useUserStore()

// Modal states
const showUserDetails = ref(false)
const showCreateUser = ref(false)
const showEditUser = ref(false)

// Reactive references from store
const users = computed(() => userStore.users)
const loading = computed(() => userStore.loading)
const submitting = computed(() => userStore.submitting)
const selectedUser = computed(() => userStore.selectedUser)
const stats = computed(() => userStore.stats)

const changeSection = (section) => {
  activeSection.value = section
}

// User form data
const userForm = ref({
  user_id: null,
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  role_id: 1,
  is_active: true,
  password: '',
  avatar: ''
})

// Methods
const handleViewDetails = (user) => {
  userStore.selectUser(user)
  showUserDetails.value = true
}

const handleEditUser = (user) => {
  userStore.selectUser(user)
  userForm.value = {
    user_id: user.user_id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone_number: user.phone_number || '',
    role_id: user.role_id === 'admin' ? 2 : 1,
    is_active: user.status === 1,
    password: '',
    avatar: user.avatar || ''
  }
  showUserDetails.value = false
  showEditUser.value = true
}

const handleToggleStatus = async (user) => {
  const result = await userStore.toggleUserStatus(user.account_id)
  if (!result.success) {
    console.error('Failed to toggle status:', result.message)
  }
}

const handleSubmitUser = async () => {
  try {
    const userData = {
      first_name: userForm.value.first_name,
      last_name: userForm.value.last_name,
      email: userForm.value.email,
      phone_number: userForm.value.phone_number || null,
      role_id: userForm.value.role_id ==='user' ? 1 : 2,
      is_active: userForm.value.status ? 1 : 0,
    }

    let result
    if (showCreateUser.value) {
      userData.password = userForm.value.password
      result = await userStore.createUser(userData)
    } else {
      result = await userStore.updateUser(userForm.value.user_id, userData)
    }

    if (result.success) {
      closeUserForm()
    } else {
      console.error('Failed to submit user:', result.message)
      // Still close form even if API failed since we have fallback
      closeUserForm()
    }
  } catch (error) {
    console.error('Error submitting user:', error)
    closeUserForm()
  }
}

const closeUserDetails = () => {
  showUserDetails.value = false
  userStore.clearSelectedUser()
}

const closeUserForm = () => {
  showCreateUser.value = false
  showEditUser.value = false
  userStore.clearSelectedUser()
  userForm.value = {
    user_id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role_id: 1,
    status: true,
    password: '',
    avatar: ''
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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

const getStatusClass = (status) => {
  return status ? 'status-active' : 'status-inactive'
}

const getStatusText = (status) => {
  return status ? 'Hoạt động' : 'Bị khóa'
}

// Lifecycle
onMounted(() => {
  userStore.fetchUsers()
})
</script>

<style scoped>
/* Sidebar mobile responsive */
.mobile-open {
  transform: translateX(0);
}

.users-management {
  max-width: 100%;
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
}

/* Dark mode for page title */
.dark .page-title {
  color: rgb(243, 244, 246);
}

.page-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  transition: color 0.3s ease;
}

/* Dark mode for page subtitle */
.dark .page-subtitle {
  color: rgb(156, 163, 175);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

/* Dark mode for stat cards */
.dark .stat-card {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-icon-success {
  background: #ecfdf5;
  color: #059669;
}

.stat-icon-warning {
  background: #fffbeb;
  color: #d97706;
}

.stat-icon-info {
  background: #fef3c7;
  color: #d97706;
}

/* Dark mode for stat icons */
.dark .stat-icon-primary {
  background: rgb(30, 58, 138);
  color: rgb(147, 197, 253);
}

.dark .stat-icon-success {
  background: rgb(6, 78, 59);
  color: rgb(52, 211, 153);
}

.dark .stat-icon-warning {
  background: rgb(120, 53, 15);
  color: rgb(251, 191, 36);
}

.dark .stat-icon-info {
  background: rgb(120, 53, 15);
  color: rgb(251, 191, 36);
}

.stat-icon-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

/* Dark mode for stat labels */
.dark .stat-label {
  color: rgb(156, 163, 175);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  transition: color 0.3s ease;
}

/* Dark mode for stat values */
.dark .stat-value {
  color: rgb(243, 244, 246);
}

/* Table Section */
.table-section {
  margin-bottom: 2rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  transition: background-color 0.3s ease;
}

/* Dark mode for modal */
.dark .modal-content {
  background: rgb(31, 41, 55);
  border: 1px solid rgb(55, 65, 81);
}

.modal-content-large {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* Dark mode for modal header */
.dark .modal-header {
  border-bottom-color: rgb(55, 65, 81);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  transition: color 0.3s ease;
}

/* Dark mode for modal title */
.dark .modal-title {
  color: rgb(243, 244, 246);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* User Details */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-avatar-section {
  display: flex;
  justify-content: center;
}

.user-detail-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.user-detail-avatar-placeholder {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e5e7eb;
}

.avatar-placeholder-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #9ca3af;
}

.user-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.3s ease;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
  transition: color 0.3s ease;
}

/* Badges */
.role-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
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

/* Forms */
.user-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  transition: color 0.3s ease;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #111827;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  transition: color 0.3s ease;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode */
:global(.dark) .page-title {
  color: #f9fafb;
}

:global(.dark) .page-subtitle {
  color: #d1d5db;
}

:global(.dark) .stat-card {
  background: #1f2937;
  border-color: #374151;
}

:global(.dark) .stat-label {
  color: #9ca3af;
}

:global(.dark) .stat-value {
  color: #f9fafb;
}

:global(.dark) .modal-content {
  background: #1f2937;
}

:global(.dark) .modal-header {
  border-bottom-color: #374151;
}

:global(.dark) .modal-title {
  color: #f9fafb;
}

:global(.dark) .modal-footer {
  border-top-color: #374151;
}

:global(.dark) .modal-close:hover {
  background: #374151;
}

:global(.dark) .close-icon {
  color: #9ca3af;
}

:global(.dark) .info-label {
  color: #9ca3af;
}

:global(.dark) .info-value {
  color: #e5e7eb;
}

:global(.dark) .user-detail-avatar {
  border-color: #4b5563;
}

:global(.dark) .user-detail-avatar-placeholder {
  background: #4b5563;
  border-color: #6b7280;
}

:global(.dark) .avatar-placeholder-icon {
  color: #9ca3af;
}

:global(.dark) .form-label {
  color: #d1d5db;
}

:global(.dark) .form-input {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

:global(.dark) .form-input:focus {
  border-color: #3b82f6;
}

:global(.dark) .checkbox-label {
  color: #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .users-management {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .stat-icon-svg {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .modal-content {
    margin: 0.5rem;
    max-width: none;
    width: calc(100% - 1rem);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .user-info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
}
</style>
