import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      visible: true,
      removing: false,
      createdAt: Date.now()
    }

    toasts.value.push(toast)

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id) => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast && !toast.removing) {
      toast.removing = true
      toast.visible = false
      
      // Remove from array after animation
      setTimeout(() => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index > -1) {
          toasts.value.splice(index, 1)
        }
      }, 300)
    }
  }

  const clearAll = () => {
    toasts.value.forEach(toast => {
      toast.visible = false
      toast.removing = true
    })
    setTimeout(() => {
      toasts.value = []
    }, 300)
  }

  // Convenience methods with better defaults
  const success = (message, duration = 4000) => {
    return addToast(message, 'success', duration)
  }
  
  const error = (message, duration = 6000) => {
    return addToast(message, 'error', duration)
  }
  
  const warning = (message, duration = 5000) => {
    return addToast(message, 'warning', duration)
  }
  
  const info = (message, duration = 4000) => {
    return addToast(message, 'info', duration)
  }

  // Convenience method for persistent toasts
  const persistent = (message, type = 'info') => {
    return addToast(message, type, 0) // duration = 0 means no auto-remove
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
    persistent
  }
})
