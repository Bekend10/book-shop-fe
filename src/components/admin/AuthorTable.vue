<template>
  <div class="author-table-container">
    <!-- Header với Search và Actions -->
    <div class="table-header">
      <div class="search-section">
        <div class="search-bar">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            @input="$emit('search', $event.target.value)"
            type="text"
            placeholder="Tìm kiếm tác giả..."
            class="search-input"
          />
        </div>
      </div>
      
      <div class="actions-section">
        <button
          v-if="selectedAuthors.length > 0"
          @click="$emit('delete-multiple')"
          class="btn btn-danger-outline"
        >
          <Trash2 class="btn-icon" />
          Xóa {{ selectedAuthors.length }} tác giả
        </button>
        
        <button @click="$emit('add-author')" class="btn btn-primary">
          <Plus class="btn-icon" />
          Thêm tác giả
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="author-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="table-checkbox"
              />
            </th>
            <th>Ảnh đại diện</th>
            <th>Tên tác giả</th>
            <th>Quốc tịch</th>
            <th class="bio-col">Tiểu sử</th>
            <th>Ngày sinh</th>
            <th class="actions-col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="authors.length === 0" class="empty-row">
            <td colspan="7" class="empty-cell">
              <div class="empty-state">
                <Users class="empty-icon" />
                <p class="empty-text">Chưa có tác giả nào</p>
              </div>
            </td>
          </tr>
          
          <tr
            v-for="author in authors"
            :key="author.author_id"
            class="table-row"
            :class="{ 'selected': selectedAuthors.includes(author.author_id) }"
          >
            <td>
              <input
                type="checkbox"
                :value="author.author_id"
                v-model="selectedAuthors"
                class="table-checkbox"
              />
            </td>
            
            <td>
              <div class="author-avatar">
                <img
                  v-if="author.image_url"
                  :src="author.image_url"
                  :alt="author.name"
                  class="avatar-img"
                />
                <div v-else class="avatar-placeholder">
                  <User class="avatar-icon" />
                </div>
              </div>
            </td>
            
            <td>
              <div class="author-info">
                <div class="author-name">{{ author.name || 'Chưa có tên' }}</div>
              </div>
            </td>
            
            <td>
              <span class="nationality">{{ author.nationally || 'Chưa cập nhật' }}</span>
            </td>
            
            <td class="bio-col">
              <p class="bio-text" :title="author.bio">
                {{ author.bio || 'Chưa có tiểu sử' }}
              </p>
            </td>
            
            <td>
              <span class="birth-date">
                {{ author.dob ? formatDate(author.dob) : 'Chưa cập nhật' }}
              </span>
            </td>
            
            <td class="actions-col">
              <div class="action-buttons">
                <button
                  @click="$emit('edit-author', author)"
                  class="action-btn edit-btn"
                  title="Chỉnh sửa"
                >
                  <Edit2 class="action-icon" />
                </button>
                
                <button
                  @click="$emit('delete-author', author)"
                  class="action-btn delete-btn"
                  title="Xóa"
                >
                  <Trash2 class="action-icon" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination hoặc thông tin số lượng -->
    <div v-if="authors.length > 0" class="table-footer">
      <p class="results-info">
        Hiển thị {{ authors.length }} tác giả
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Plus, Trash2, Edit2, Users, User } from 'lucide-vue-next'

const props = defineProps({
  authors: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'search',
  'add-author', 
  'edit-author',
  'delete-author',
  'delete-multiple'
])

const searchQuery = ref('')
const selectedAuthors = ref([])

const isAllSelected = computed(() => {
  return props.authors.length > 0 && selectedAuthors.value.length === props.authors.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedAuthors.value = []
  } else {
    selectedAuthors.value = props.authors.map(author => author.author_id)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

// Emit selected authors khi có thay đổi
watch(selectedAuthors, (newVal) => {
  emit('delete-multiple', newVal)
}, { deep: true })

// Reset selection khi danh sách authors thay đổi
watch(() => props.authors, () => {
  selectedAuthors.value = selectedAuthors.value.filter(id => 
    props.authors.some(author => author.author_id === id)
  )
})
</script>

<style scoped>
.author-table-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.dark .author-table-container {
  background: #1f2937;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
}

.dark .table-header {
  border-bottom-color: #374151;
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
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.dark .search-input {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.dark .search-input::placeholder {
  color: #9ca3af;
}

.dark .search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.actions-section {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-danger-outline {
  background: white;
  color: #dc2626;
  border: 1px solid #dc2626;
}

.btn-danger-outline:hover {
  background: #dc2626;
  color: white;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.table-wrapper {
  overflow-x: auto;
}

.author-table {
  width: 100%;
  border-collapse: collapse;
}

.author-table th {
  background: #f9fafb;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.author-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.checkbox-col {
  width: 3rem;
}

.bio-col {
  max-width: 15rem;
}

.actions-col {
  width: 8rem;
}

.table-checkbox {
  cursor: pointer;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row.selected {
  background: #eff6ff;
}

.author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.author-info {
  min-width: 8rem;
}

.author-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.nationality {
  color: #6b7280;
  font-size: 0.875rem;
}

.bio-text {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.birth-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background: #eff6ff;
  color: #3b82f6;
}

.edit-btn:hover {
  background: #dbeafe;
  color: #2563eb;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.action-icon {
  width: 0.875rem;
  height: 0.875rem;
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

.table-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.results-info {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Dark mode */
.dark .search-icon {
  color: #9ca3af;
}

.dark .btn-danger-outline {
  background: #374151;
  color: #f87171;
  border-color: #dc2626;
}

.dark .btn-danger-outline:hover {
  background: #dc2626;
  color: white;
}

.dark .avatar-placeholder {
  background: #4b5563;
}

.dark .avatar-icon {
  color: #9ca3af;
}

.dark .edit-btn {
  background: #1e3a8a;
  color: #93c5fd;
}

.dark .edit-btn:hover {
  background: #1d4ed8;
  color: #dbeafe;
}

.dark .delete-btn {
  background: #7f1d1d;
  color: #f87171;
}

.dark .delete-btn:hover {
  background: #991b1b;
  color: #fca5a5;
}

.dark .empty-icon {
  color: #6b7280;
}

.dark .empty-text {
  color: #9ca3af;
}

.dark .author-table th {
  background: #374151;
  color: #f3f4f6;
  border-bottom-color: #4b5563;
}

.dark .author-table td {
  border-bottom-color: #374151;
}

.dark .table-row:hover {
  background: #374151;
}

.dark .table-row.selected {
  background: #1e3a8a;
}

.dark .author-name {
  color: #f3f4f6;
}

.dark .nationality,
.dark .bio-text,
.dark .birth-date {
  color: #d1d5db;
}

.dark .table-footer {
  background: #374151;
  border-top-color: #4b5563;
}

.dark .results-info {
  color: #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    max-width: none;
  }
  
  .actions-section {
    justify-content: space-between;
  }
  
  .bio-col {
    max-width: 10rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}

@media (max-width: 640px) {
  .author-table {
    font-size: 0.75rem;
  }
  
  .author-table th,
  .author-table td {
    padding: 0.5rem 0.25rem;
  }
  
  .bio-col {
    display: none;
  }
  
  .author-avatar {
    width: 2rem;
    height: 2rem;
  }
}
</style>
