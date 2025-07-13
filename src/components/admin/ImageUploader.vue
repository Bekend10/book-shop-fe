<template>
  <div class="space-y-4">
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Hình ảnh sách
    </label>

    <!-- Preview current image -->
    <div v-if="previewUrl" class="relative inline-block">
      <img
        :src="previewUrl"
        alt="Preview"
        class="w-32 h-40 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
      />
      <button
        type="button"
        @click="removeImage"
        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <X class="h-3 w-3" />
      </button>
    </div>

    <!-- Upload area -->
    <div
      @click="openFileDialog"
      @dragover.prevent
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        'hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
        isDragging ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'
      ]"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />

      <div class="space-y-2">
        <ImageIcon class="h-12 w-12 text-gray-400 mx-auto" />
        <div class="text-sm text-gray-600 dark:text-gray-300">
          <span class="font-medium text-primary-600 dark:text-primary-400">Nhấp để chọn ảnh</span>
          hoặc kéo thả ảnh vào đây
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          PNG, JPG, GIF tối đa 10MB
        </p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isUploading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      <span class="ml-2 text-sm text-gray-600 dark:text-gray-300">Đang tải ảnh...</span>
    </div>

    <!-- Error message -->
    <div v-if="uploadError" class="text-red-600 dark:text-red-400 text-sm">
      {{ uploadError }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ImageIcon, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: File
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadError = ref('')
const previewUrl = ref('')

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal instanceof File) {
      previewUrl.value = URL.createObjectURL(newVal)
    } else {
      previewUrl.value = ''
    }
  },
  { immediate: true }
)

const openFileDialog = () => {
  fileInput.value?.click()
}

const removeImage = () => {
  emit('update:modelValue', null)
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) emit('update:modelValue', file)
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) emit('update:modelValue', files[0])
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #111827;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
:global(.dark) .input-field {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
:global(.dark) .input-field:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}
</style>
