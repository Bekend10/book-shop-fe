<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast',
          `toast-${toast.type}`,
          { 'toast-visible': toast.visible }
        ]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          <CheckCircle v-if="toast.type === 'success'" class="h-5 w-5" />
          <XCircle v-else-if="toast.type === 'error'" class="h-5 w-5" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="h-5 w-5" />
          <Info v-else class="h-5 w-5" />
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button @click.stop="removeToast(toast.id)" class="toast-close">
          <X class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)
const removeToast = (id) => toastStore.removeToast(id)
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 4rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
  max-width: 380px;
  width: 100%;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid;
  pointer-events: auto;
  cursor: pointer;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
}

.toast-visible {
  transform: translateX(0);
  opacity: 1;
}

.toast-success { border-left-color: #10b981; }
.toast-error { border-left-color: #ef4444; }
.toast-warning { border-left-color: #f59e0b; }
.toast-info { border-left-color: #3b82f6; }

.toast-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-success .toast-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.toast-error .toast-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.toast-warning .toast-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.toast-info .toast-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

.toast-message {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  word-wrap: break-word;
}

.toast-close {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  float : right;
  transition: color 0.2s ease, background 0.2s ease;
}

.toast-close:hover {
  color: #6b7280;
  background: rgba(0, 0, 0, 0.05);
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from, .toast-leave-to {
  transform: translateX(100%) scale(0.95);
  opacity: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .toast {
    background: #1f2937;
    border-color: #374151;
  }
  
  .toast-success {
    background: linear-gradient(to right, rgba(16, 185, 129, 0.05), #1f2937);
  }
  
  .toast-error {
    background: linear-gradient(to right, rgba(239, 68, 68, 0.05), #1f2937);
  }
  
  .toast-warning {
    background: linear-gradient(to right, rgba(245, 158, 11, 0.05), #1f2937);
  }
  
  .toast-info {
    background: linear-gradient(to right, rgba(59, 130, 246, 0.05), #1f2937);
  }
  
  .toast-message {
    color: #f3f4f6;
  }
  
  .toast-close {
    color: #9ca3af;
  }
  
  .toast-close:hover {
    color: #d1d5db;
    background: rgba(255, 255, 255, 0.1);
  }
}

/* Dark mode class-based (for manual toggle) */
:global(.dark) .toast {
  background: #1f2937;
  border-color: #374151;
}

:global(.dark) .toast-success {
  background: linear-gradient(to right, rgba(16, 185, 129, 0.05), #1f2937);
}

:global(.dark) .toast-error {
  background: linear-gradient(to right, rgba(239, 68, 68, 0.05), #1f2937);
}

:global(.dark) .toast-warning {
  background: linear-gradient(to right, rgba(245, 158, 11, 0.05), #1f2937);
}

:global(.dark) .toast-info {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.05), #1f2937);
}

:global(.dark) .toast-message {
  color: #f3f4f6;
}

:global(.dark) .toast-close {
  color: #9ca3af;
}

:global(.dark) .toast-close:hover {
  color: #d1d5db;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .toast-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
  .toast {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .toast-icon {
    width: 1.75rem;
    height: 1.75rem;
  }
  .toast-message {
    font-size: 0.8125rem;
  }
}
</style>
