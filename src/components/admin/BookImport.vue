<template>
  <div class="book-import-container">
    <!-- Header -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Import Books từ Excel</h1>
          <p class="text-gray-600 mt-1">Tải lên file Excel để thêm hàng loạt sách vào hệ thống</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="downloadTemplate"
            class="btn-secondary flex items-center space-x-2"
            :disabled="isDownloading"
          >
            <svg v-if="!isDownloading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span>{{ isDownloading ? 'Đang tải...' : 'Tải Template' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Area -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Tải lên file Excel hoặc CSV</h2>
        <p class="text-sm text-gray-600">Chỉ chấp nhận file .xlsx, .xls, .csv. Kích thước tối đa: 10MB</p>
      </div>

      <!-- File Drop Zone -->
      <div
        @drop.prevent="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
        :class="{ 'border-blue-400 bg-blue-50': isDragging }"
      >
        <div v-if="!selectedFile" class="space-y-4">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div>
            <p class="text-lg text-gray-600">Kéo thả file Excel vào đây hoặc</p>
            <button
              @click="triggerFileInput"
              class="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              chọn file từ máy tính
            </button>
          </div>
        </div>

        <!-- Selected File Display -->
        <div v-else class="space-y-4">
          <div class="flex items-center justify-center space-x-3">
            <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="text-left">
              <p class="text-lg font-medium text-gray-900">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
          <button
            @click="clearFile"
            class="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Xóa file đã chọn
          </button>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.xls,.csv"
        @change="handleFileSelect"
        class="hidden"
      >

      <!-- Upload Button -->
      <div class="mt-6 flex justify-end">
        <button
          @click="uploadFile"
          :disabled="!selectedFile || isUploading"
          class="btn-primary flex items-center space-x-2"
        >
          <svg v-if="!isUploading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>{{ isUploading ? 'Đang xử lý...' : 'Bắt đầu Import' }}</span>
        </button>
      </div>
    </div>

    <!-- Progress -->
    <div v-if="isUploading || uploadResult" class="bg-white shadow rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Tiến trình Import</h3>
      
      <!-- Progress Bar -->
      <div v-if="isUploading" class="mb-4">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Đang xử lý file Excel...</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Upload Result -->
      <div v-if="uploadResult" class="space-y-4">
        <div 
          class="p-4 rounded-lg"
          :class="uploadResult.success ? ' border border-green-200' : 'border border-red-200'"
        >
          <div class="flex items-start space-x-3">
            <svg 
              v-if="uploadResult.success"
              class="h-5 w-5 text-green-500 mt-0.5"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <svg 
              v-else
              class="h-5 w-5 text-red-500 mt-0.5"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="flex-1">
              <h4 class="font-medium" :class="uploadResult.success ? 'text-green-800' : 'text-red-800'">
                {{ uploadResult.success ? 'Import thành công!' : 'Import thất bại!' }}
              </h4>
              <p class="text-sm mt-1" :class="uploadResult.success ? 'text-green-700' : 'text-red-700'">
                {{ uploadResult.message }}
              </p>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div v-if="uploadResult.data" class="grid grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-blue-600">{{ uploadResult.data.totalProcessed || 0 }}</div>
            <div class="text-sm text-blue-700">Tổng số dòng</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-600">{{ uploadResult.data.successCount || 0 }}</div>
            <div class="text-sm text-green-700">Thành công</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-red-600">{{ uploadResult.data.errorCount || 0 }}</div>
            <div class="text-sm text-red-700">Lỗi</div>
          </div>
        </div>

        <!-- Error Details -->
        <div v-if="uploadResult.data && uploadResult.data.errors && uploadResult.data.errors.length > 0" class="mt-4">
          <h5 class="font-medium text-gray-900 mb-2">Chi tiết lỗi:</h5>
          <div class="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <div 
              v-for="(error, index) in uploadResult.data.errors" 
              :key="index"
              class="text-sm text-red-700 mb-2 last:mb-0"
            >
              <span class="font-medium">Dòng {{ error.row }}:</span> {{ error.message }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button
            @click="resetUpload"
            class="btn-secondary"
          >
            Import file khác
          </button>
          <button
            v-if="uploadResult.success"
            @click="$router.push('/admin')"
            class="btn-primary"
          >
            Xem danh sách sách
          </button>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-blue-900 mb-4">Hướng dẫn sử dụng</h3>
      <div class="space-y-3 text-sm">
        <div class="flex items-start space-x-2">
          <span class="font-semibold min-w-[20px]">1.</span>
          <span>Tải xuống file template Excel để xem định dạng cột yêu cầu</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="font-semibold min-w-[20px]">2.</span>
          <span>Điền thông tin sách vào các cột tương ứng trong file Excel</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="font-semibold min-w-[20px]">3.</span>
          <span>Lưu file và tải lên hệ thống bằng cách kéo thả hoặc chọn file</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="font-semibold min-w-[20px]">4.</span>
          <span>Nhấn "Bắt đầu Import" và chờ hệ thống xử lý</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="font-semibold min-w-[20px]">5.</span>
          <span>Kiểm tra kết quả và xử lý các lỗi nếu có</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from '@/utils/axios'
import { useAuthStore } from '@/stores/authStore'

// Auth store
const authStore = useAuthStore()

// Reactive state
const selectedFile = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref(null)
const isDragging = ref(false)
const isDownloading = ref(false)
const fileInput = ref(null)

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const validateAndSetFile = (file) => {
  // Check file type
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ]
  
  const allowedExtensions = /\.(xlsx|xls|csv)$/i
  
  if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
    alert('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)')
    return
  }

  // Check file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('File quá lớn. Kích thước tối đa là 10MB')
    return
  }

  // Check if file is empty
  if (file.size === 0) {
    alert('File trống. Vui lòng chọn file khác')
    return
  }

  selectedFile.value = file
  uploadResult.value = null
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadTemplate = async () => {
  try {
    isDownloading.value = true
    // Backend thường sẽ có endpoint riêng cho download template
    // Hoặc có thể return static file từ public folder
    const response = await axios.get('/books/excel-template', {
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'book-import-template.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('Download template error:', error)
    
    // Fallback: Tạo template đơn giản từ frontend
    createAndDownloadTemplate()
  } finally {
    isDownloading.value = false
  }
}

const createAndDownloadTemplate = () => {
  // Tạo CSV template đơn giản nếu backend chưa có
  const csvContent = [
    'title,author,category_id,publisher,isbn,price,description,stock_quantity,publication_date',
    'Tên sách mẫu,Tác giả mẫu,1,NXB mẫu,9781234567890,299000,Mô tả sách mẫu,10,2024-01-01',
    ',,,,,,,,',
    'Lưu ý:,,,,,,,,',
    '- title: Tên sách (bắt buộc),,,,,,,,',
    '- author: Tên tác giả (bắt buộc),,,,,,,,',
    '- category_id: ID danh mục sách (bắt buộc),,,,,,,,',
    '- publisher: Nhà xuất bản,,,,,,,,',
    '- isbn: Mã ISBN (không bắt buộc),,,,,,,,',
    '- price: Giá sách (bắt buộc),,,,,,,,',
    '- description: Mô tả sách,,,,,,,,',
    '- stock_quantity: Số lượng tồn kho (mặc định: 0),,,,,,,,',
    '- publication_date: Ngày xuất bản (YYYY-MM-DD),,,,,,,,',
  ].join('\n')
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'book-import-template.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  try {
    isUploading.value = true
    uploadProgress.value = 0
    uploadResult.value = null

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await axios.post('/books/import-books-from-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })

    uploadResult.value = {
      success: true,
      message: response.data.message || 'Import thành công!',
      data: response.data
    }

  } catch (error) {
    console.error('Upload error:', error)
    
    uploadResult.value = {
      success: false,
      message: error.response?.data?.message || 'Có lỗi xảy ra khi import file',
      data: error.response?.data
    }
  } finally {
    isUploading.value = false
    uploadProgress.value = 100
  }
}

const resetUpload = () => {
  selectedFile.value = null
  uploadResult.value = null
  uploadProgress.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Drag and drop handlers
const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('dragenter', handleDragEnter)
  document.addEventListener('dragleave', handleDragLeave)
})

onUnmounted(() => {
  document.removeEventListener('dragenter', handleDragEnter)
  document.removeEventListener('dragleave', handleDragLeave)
})
</script>

<style scoped>
.book-import-container {
  max-width: 4xl;
  margin: 0 auto;
  padding: 1.5rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Drag and drop animations */
.border-dashed {
  transition: all 0.3s ease;
}
</style>
