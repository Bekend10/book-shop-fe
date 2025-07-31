import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'

export function useCart() {
  const cartStore = useCartStore()
  const toastStore = useToastStore()

  const cartItems = computed(() => cartStore.cartItems)
  const totalItems = computed(() => cartStore.totalItems)
  const totalPrice = computed(() => cartStore.totalPrice)
  const subtotal = computed(() => cartStore.subtotal)
  const isLoading = computed(() => cartStore.isLoading)
  const isUpdating = computed(() => cartStore.isUpdating)

  const addToCart = async (book, quantity = 1) => {
    try {
      const result = await cartStore.addToCart(book, quantity)
      if (result.success) {
        toastStore.success(result.message || 'Đã thêm vào giỏ hàng')
        return result
      } else {
        toastStore.error(result.error || 'Không thể thêm vào giỏ hàng')
        return result
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toastStore.error('Đã có lỗi xảy ra khi thêm vào giỏ hàng')
      return { success: false, error: error.message }
    }
  }

  const updateQuantity = async (bookId, quantity) => {
    try {
      const result = await cartStore.updateQuantity(bookId, quantity)
      if (result.success) {
        toastStore.success('Cập nhật số lượng thành công')
        return result
      } else {
        toastStore.error(result.error || 'Không thể cập nhật số lượng')
        return result
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      toastStore.error('Đã có lỗi xảy ra khi cập nhật số lượng')
      return { success: false, error: error.message }
    }
  }

  const removeFromCart = async (bookId) => {
    try {
      const result = await cartStore.removeFromCart(bookId)
      if (result.success) {
        toastStore.success('Đã xóa sản phẩm khỏi giỏ hàng')
        return result
      } else {
        toastStore.error(result.error || 'Không thể xóa sản phẩm')
        return result
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      toastStore.error('Đã có lỗi xảy ra khi xóa sản phẩm')
      return { success: false, error: error.message }
    }
  }

  const clearCart = async () => {
    try {
      const result = await cartStore.clearCart()
      if (result.success) {
        toastStore.success('Đã xóa toàn bộ giỏ hàng')
        return result
      } else {
        toastStore.error(result.error || 'Không thể xóa giỏ hàng')
        return result
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      toastStore.error('Đã có lỗi xảy ra khi xóa giỏ hàng')
      return { success: false, error: error.message }
    }
  }

  const isInCart = (bookId) => {
    return cartStore.isInCart(bookId)
  }

  const getCartItem = (bookId) => {
    return cartStore.cartItems.find(item => item.book_id === bookId)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const initializeCart = async () => {
    return await cartStore.initializeCart()
  }

  const clearCartData = () => {
    cartStore.clearCartData()
  }

  return {
    // State
    cartItems,
    totalItems,
    totalPrice,
    subtotal,
    isLoading,
    isUpdating,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,

    // Helpers
    isInCart,
    getCartItem,
    formatPrice,
    initializeCart,
    clearCartData
  }
}
