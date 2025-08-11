// Simple test to verify store functionality
import { useBookStore } from '@/stores/bookStore'

export const testBookStore = () => {
  const store = useBookStore()
  
  // Test calling setSortBy
  if (typeof store.setSortBy === 'function') {
    try {
      store.setSortBy('price-asc')
    } catch (error) {
      console.error('Error calling setSortBy:', error)
    }
  }
  
  return store
}
