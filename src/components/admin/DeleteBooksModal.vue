
<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <slot name="icon"><span class="h-6 w-6 text-red-600">🗑️</span></slot>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Xác nhận xóa sách
            </h3>
          </div>
        </div>
        <div class="mb-6">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Bạn có chắc chắn muốn xóa <span class="font-semibold text-red-600">{{ count }}</span> sách đã chọn không?
            Hành động này không thể hoàn tác.
          </p>
        </div>
        <div class="flex justify-end space-x-3">
          <button type="button" @click="$emit('cancel')" class="btn-secondary">
            Hủy
          </button>
          <button type="button" @click="$emit('confirm')" class="btn btn-danger">
            <slot name="delete-icon">Xóa {{ count }} sách</slot>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  count: Number
})
const emit = defineEmits(['confirm', 'cancel'])
</script>
