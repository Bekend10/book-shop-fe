<template>
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
          <div class="stat-value">{{ stats.total }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <UserCheck class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Đang hoạt động</div>
          <div class="stat-value">{{ stats.active }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <UserX class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Bị khóa</div>
          <div class="stat-value">{{ stats.inactive }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-info">
          <Crown class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Quản trị viên</div>
          <div class="stat-value">{{ stats.admin }}</div>
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
                :alt="`${selectedUser.first_name} ${selectedUser.last_name}`"
                class="user-avatar-large"
              />
              <div v-else class="user-avatar-placeholder-large">
                <User class="avatar-icon-large" />
              </div>
              <div class="user-basic-info">
                <h4 class="user-name">{{ selectedUser.first_name }} {{ selectedUser.last_name }}</h4>
                <p class="user-email">{{ selectedUser.email }}</p>
                <span :class="['status-badge', `status-${selectedUser.is_active ? 'active' : 'inactive'}`]">
                  {{ getStatusText(selectedUser.is_active) }}
                </span>
              </div>
            </div>

            <div class="user-details-grid">
              <div class="detail-item">
                <div class="detail-label">
                  <Calendar class="detail-icon" />
                  Ngày tạo tài khoản
                </div>
                <div class="detail-value">{{ formatDate(selectedUser.created_at) }}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">
                  <Mail class="detail-icon" />
                  Email xác thực
                </div>
                <div class="detail-value">
                  <span :class="selectedUser.is_verify ? 'text-green-600' : 'text-red-600'">
                    {{ selectedUser.is_verify ? 'Đã xác thực' : 'Chưa xác thực' }}
                  </span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">
                  <Crown class="detail-icon" />
                  Quyền hạn
                </div>
                <div class="detail-value">
                  <span :class="['role-badge', `role-${selectedUser.role}`]">
                    {{ getRoleText(selectedUser.role_id) }}
                  </span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">
                  <Eye class="detail-icon" />
                  Lần đăng nhập cuối
                </div>
                <div class="detail-value">{{ formatDate(selectedUser.last_active) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeUserDetails" class="btn btn-secondary">
            Đóng
          </button>
          <button @click="editSelectedUser" class="btn btn-primary">
            <Edit class="btn-icon" />
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateUser || showEditUser" class="modal-overlay" @click="closeUserModal">
      <div class="modal-content modal-content-large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showCreateUser ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng' }}
          </h3>
          <button @click="closeUserModal" class="modal-close">
            <X class="close-icon" />
          </button>
        </div>
        
        <form @submit.prevent="submitUser" class="modal-body">
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
            
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input
                v-model="userForm.email"
                type="email"
                class="form-input"
                placeholder="Nhập email"
                :disabled="showEditUser"
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
            
            <div v-if="showCreateUser" class="form-group">
              <label class="form-label">Mật khẩu *</label>
              <input
                v-model="userForm.password"
                type="password"
                class="form-input"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Quyền hạn</label>
              <select v-model="userForm.role_id" class="form-input">
                <option :value="1">Người dùng</option>
                <option :value="2">Quản trị viên</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Trạng thái</label>
              <select v-model="userForm.is_active" class="form-input">
                <option :value="true">Hoạt động</option>
                <option :value="false">Bị khóa</option>
              </select>
            </div>
          </div>
        </form>
        
        <div class="modal-footer">
          <button @click="closeUserModal" type="button" class="btn btn-secondary">
            Hủy
          </button>
          <button @click="submitUser" :disabled="submitting" class="btn btn-primary">
            <span v-if="submitting" class="btn-spinner"></span>
            {{ showCreateUser ? 'Thêm người dùng' : 'Cập nhật' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Toggle Status Modal -->
    <div v-if="showConfirmToggle" class="modal-overlay" @click="cancelToggleStatus">
      <div class="modal-content modal-content-small" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Xác nhận thay đổi trạng thái</h3>
          <button @click="cancelToggleStatus" class="modal-close">
            <X class="close-icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="userToToggle" class="confirm-content">
            <div class="confirm-icon">
              <Lock v-if="userToToggle.is_active" class="confirm-icon-svg text-red-500" />
              <Unlock v-else class="confirm-icon-svg text-green-500" />
            </div>
            <div class="confirm-text">
              <p class="confirm-question">
                Bạn có chắc chắn muốn 
                <strong>{{ userToToggle.is_active ? 'khóa' : 'mở khóa' }}</strong> 
                tài khoản của người dùng:
              </p>
              <p class="confirm-user">
                <strong>{{ userToToggle.first_name }} {{ userToToggle.last_name }}</strong>
                <br>
                <span class="text-gray-600">{{ userToToggle.email }}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelToggleStatus" class="btn btn-secondary">
            Hủy
          </button>
          <button 
            @click="confirmToggleStatus" 
            class="btn"
            :class="userToToggle?.is_active ? 'btn-danger' : 'btn-success'"
          >
            <Lock v-if="userToToggle?.is_active" class="btn-icon" />
            <Unlock v-else class="btn-icon" />
            {{ userToToggle?.is_active ? 'Khóa tài khoản' : 'Mở khóa' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Users, UserPlus, UserCheck, UserX, Crown, User, 
  X, Edit, Eye, Lock, Unlock, Calendar, Mail
} from 'lucide-vue-next'
import UserTable from '@/components/admin/UserTable.vue'
import { useUserStore } from '@/stores/userStore'

// User store
const userStore = useUserStore()

// Modal states
const showUserDetails = ref(false)
const showCreateUser = ref(false)
const showEditUser = ref(false)
const showConfirmToggle = ref(false)
const userToToggle = ref(null)

// Reactive references from store
const users = computed(() => userStore.users)
const loading = computed(() => userStore.loading)
const submitting = computed(() => userStore.submitting)
const selectedUser = computed(() => userStore.selectedUser)
const stats = computed(() => userStore.stats)

// User form
const userForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role_id: 1,
  is_active: true,
  phone_number: ''
})

// Methods
const handleViewDetails = (user) => {
  userStore.selectUser(user)
  showUserDetails.value = true
}

const handleEditUser = (user) => {
  userStore.selectUser(user)
  userForm.value = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    password: '',
    role: user.role,
    role_id: user.role_id,
    is_active: user.is_active,
    phone_number: user.phone || ''
  }
  showEditUser.value = true
}

const handleToggleStatus = async (accountId) => {
  try {
    // Tìm user từ accountId
    const user = users.value.find(u => u.account_id === accountId)
    if (user) {
      userToToggle.value = user
      showConfirmToggle.value = true
    }
  } catch (error) {
    console.error('Error preparing toggle user status:', error)
  }
}

const confirmToggleStatus = async () => {
  try {
    if (userToToggle.value) {
      await userStore.toggleUserStatus(userToToggle.value.account_id)
      showConfirmToggle.value = false
      userToToggle.value = null
    }
  } catch (error) {
    console.error('Error toggling user status:', error)
  }
}

const cancelToggleStatus = () => {
  showConfirmToggle.value = false
  userToToggle.value = null
}

const closeUserDetails = () => {
  showUserDetails.value = false
  userStore.clearSelectedUser()
}

const closeUserModal = () => {
  showCreateUser.value = false
  showEditUser.value = false
  userStore.clearSelectedUser()
  resetForm()
}

const editSelectedUser = () => {
  showUserDetails.value = false
  handleEditUser(selectedUser.value)
}

const submitUser = async () => {
  try {
    if (showCreateUser.value) {
      await userStore.createUser(userForm.value)
    } else {
      await userStore.updateUser(selectedUser.value.account_id, userForm.value)
    }
    closeUserModal()
  } catch (error) {
    console.error('Error submitting user:', error)
  }
}

const resetForm = () => {
  userForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role_id: 1,
    is_active: true,
    phone_number: ''
  }
}

// Helper methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (is_active) => {
  return is_active ? 'Hoạt động' : 'Bị khóa'
}

const getRoleText = (role) => {
  const roleMap = {
    2: 'Quản trị viên',
    1: 'Người dùng'
  }
  return roleMap[role] || role
}

// Lifecycle
onMounted(() => {
  userStore.fetchUsers()
})
</script>

<style scoped>
/* Inherit styles từ UserManagement.vue nhưng simplified cho component */
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

.dark .page-title {
  color: rgb(243, 244, 246);
}

.page-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  transition: color 0.3s ease;
}

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

.dark .stat-label {
  color: rgb(156, 163, 175);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  transition: color 0.3s ease;
}

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
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
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

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-success {
  background: #059669;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #047857;
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

.dark .modal-content {
  background: rgb(31, 41, 55);
  border: 1px solid rgb(55, 65, 81);
}

.modal-content-large {
  max-width: 600px;
}

.modal-content-small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

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

.dark .modal-title {
  color: rgb(243, 244, 246);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.dark .modal-close {
  color: rgb(156, 163, 175);
}

.dark .modal-close:hover {
  background: rgb(55, 65, 81);
  color: rgb(209, 213, 219);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
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

.dark .modal-footer {
  border-top-color: rgb(55, 65, 81);
}

/* User Details */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-avatar-section {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.user-avatar-large {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-avatar-placeholder-large {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon-large {
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
}

.user-basic-info {
  flex: 1;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.dark .user-name {
  color: rgb(243, 244, 246);
}

.user-email {
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.dark .user-email {
  color: rgb(156, 163, 175);
}

.user-details-grid {
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.dark .detail-item {
  background: rgb(55, 65, 81);
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-weight: 500;
}

.dark .detail-label {
  color: rgb(156, 163, 175);
}

.detail-icon {
  width: 1rem;
  height: 1rem;
}

.detail-value {
  color: #111827;
  font-weight: 500;
}

.dark .detail-value {
  color: rgb(243, 244, 246);
}

/* Status and Role badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background: #ecfdf5;
  color: #059669;
}

.status-blocked {
  background: #fef2f2;
  color: #dc2626;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-admin {
  background: #fef3c7;
  color: #d97706;
}

.role-user {
  background: #eff6ff;
  color: #3b82f6;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dark .form-label {
  color: rgb(209, 213, 219);
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  color: #111827;
}

.dark .form-input {
  background: rgb(55, 65, 81);
  border-color: rgb(75, 85, 99);
  color: rgb(243, 244, 246);
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.dark .form-input:disabled {
  background: rgb(31, 41, 55);
  color: rgb(107, 114, 128);
}

/* Loading */
.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Confirm Modal */
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.confirm-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.confirm-icon-svg {
  width: 2rem;
  height: 2rem;
}

.confirm-text {
  flex: 1;
}

.confirm-question {
  font-size: 1.125rem;
  color: #374151;
  margin-bottom: 1rem;
}

.dark .confirm-question {
  color: rgb(209, 213, 219);
}

.confirm-user {
  color: #111827;
  font-size: 1rem;
}

.dark .confirm-user {
  color: rgb(243, 244, 246);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
  
  .user-avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
