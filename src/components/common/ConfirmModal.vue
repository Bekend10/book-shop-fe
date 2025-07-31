<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title" 
    role="dialog" 
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div 
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      @click="onCancel"
    ></div>

    <!-- Modal container -->
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div 
        class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
      >
        <!-- Modal content -->
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <!-- Icon -->
            <div 
              class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
              :class="iconBgClass"
            >
              <component 
                :is="iconComponent" 
                class="h-6 w-6" 
                :class="iconClass"
                aria-hidden="true" 
              />
            </div>
            
            <!-- Content -->
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white" 
                id="modal-title"
              >
                {{ title }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ message }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            @click="onConfirm"
            :disabled="isLoading"
            class="inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :class="confirmButtonClass"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ confirmText }}
          </button>
          <button
            type="button"
            @click="onCancel"
            :disabled="isLoading"
            class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AlertTriangle, Trash2, X } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'warning', // 'warning', 'danger', 'info'
    validator: (value) => ['warning', 'danger', 'info'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const iconComponent = computed(() => {
  switch (props.type) {
    case 'danger':
      return Trash2
    case 'warning':
      return AlertTriangle
    default:
      return X
  }
})

const iconClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'text-red-600 dark:text-red-400'
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400'
    default:
      return 'text-blue-600 dark:text-blue-400'
  }
})

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-100 dark:bg-red-900/20'
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/20'
    default:
      return 'bg-blue-100 dark:bg-blue-900/20'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    default:
      return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  }
})

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script>
