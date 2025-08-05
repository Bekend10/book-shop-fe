import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { shouldRefreshToken, getTimeUntilExpiration } from '@/utils/tokenRefresh'

export const useTokenRefresh = () => {
  const authStore = useAuthStore()
  const refreshInterval = ref(null)
  const isRefreshing = ref(false)

  // Computed để check trạng thái token
  const tokenStatus = computed(() => {
    if (!authStore.token) return 'no-token'
    
    const timeUntil = getTimeUntilExpiration(authStore.token)
    if (!timeUntil) return 'expired'
    if (timeUntil <= 5 * 60 * 1000) return 'expires-soon' // 5 phút
    
    return 'valid'
  })

  const timeUntilExpiration = computed(() => {
    return getTimeUntilExpiration(authStore.token)
  })

  // Tự động refresh token
  const startAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
    }

    // Check mỗi phút
    refreshInterval.value = setInterval(async () => {
      if (authStore.token && shouldRefreshToken(authStore.token, 10)) {
        await performRefresh()
      }
    }, 60000) // 1 phút
  }

  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  const performRefresh = async () => {
    if (isRefreshing.value) return

    try {
      isRefreshing.value = true
      await authStore.refreshToken()
      console.log('Token refreshed successfully')
    } catch (error) {
      console.error('Failed to refresh token:', error)
    } finally {
      isRefreshing.value = false
    }
  }

  // Manual refresh
  const manualRefresh = async () => {
    await performRefresh()
  }

  onMounted(() => {
    if (authStore.isAuthenticated) {
      startAutoRefresh()
    }
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    tokenStatus,
    timeUntilExpiration,
    isRefreshing,
    startAutoRefresh,
    stopAutoRefresh,
    manualRefresh,
    performRefresh
  }
}
