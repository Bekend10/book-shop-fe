import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useCartStore = defineStore('cart', () => {
  // State
  const cartItems = ref([])
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const error = ref(null)
  const discount = ref(0)
  const shippingFee = ref(30000) // 30,000 VND default shipping

  // Computed properties
  const items = computed(() => cartItems.value) // For backward compatibility
  
  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.quantity * item.book.price), 0)
  })

  const totalPrice = computed(() => {
    return subtotal.value + shippingFee.value - discount.value
  })

  const isInCart = computed(() => {
    return (bookId) => cartItems.value.some(item => item.book_id === bookId)
  })

  // Get author names from book
  const getAuthorNames = (authors) => {
    if (!authors || !Array.isArray(authors)) return 'Không xác định'
    return authors.map(author => author.name).join(', ')
  }

  // Fetch cart from API
  const fetchCart = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get('/carts/get-my-cart')

      if (response.data.status === 200) {
        const cartData = response.data.data

        // Xử lý trường hợp backend không trả về data hoặc data null/undefined
        if (!cartData) {
          cartItems.value = []
          return { success: true }
        }

        // Nếu không có items hoặc items không phải mảng, set giỏ hàng trống
        if (!Array.isArray(cartData.items) || cartData.items.length === 0) {
          cartItems.value = []
        } else {
          cartItems.value = cartData.items.map(item => ({
            cart_detail_id: item.cart_detail_id,
            book_id: item.book_id,
            quantity: item.quantity,
            book: {
              book_id: item.book.book_id,
              title: item.book.title,
              price: item.book.price,
              price_origin: item.book.price_origin,
              image_url: item.book.image_url,
              quantity: item.book.quantity,
              publisher: item.book.publisher,
              authors: item.book.author ? [{ name: item.book.author }] : []
            }
          }))
        }

        return { success: true }
      } else {
        // Nếu status không phải 200, vẫn set giỏ hàng trống thay vì throw error
        cartItems.value = []
        return { success: true }
      }
    } catch (err) {
      console.error('Error fetching cart:', err)
      
      // Kiểm tra nếu là lỗi 404 hoặc giỏ hàng trống, không hiển thị error
      if (err.response?.status === 404 || err.response?.data?.message?.includes('empty') || err.response?.data?.message?.includes('trống')) {
        cartItems.value = []
        error.value = null // Không set error cho trường hợp giỏ hàng trống
        return { success: true }
      }
      
      error.value = err.response?.data?.message || 'Không thể tải giỏ hàng'
      cartItems.value = [] // Trả về giỏ hàng trống trong trường hợp lỗi
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Add to cart
  const addToCart = async (book, quantity = 1) => {
    isUpdating.value = true
    
    try {
      // Check if book is out of stock
      if (!book.quantity || book.quantity <= 0) {
        return { success: false, error: 'Sản phẩm đã hết hàng' }
      }

      // Check if requested quantity exceeds available stock
      if (quantity > book.quantity) {
        return { success: false, error: `Chỉ còn ${book.quantity} cuốn trong kho` }
      }

      // If book is just an ID, convert to proper format
      const bookId = typeof book === 'object' ? book.book_id || book.id : book
      
      const response = await axios.post('/carts/add-to-cart', {
        book_id: bookId,
        quantity: quantity
      })
      
      if (response.success || response.data.status === 200) {
        await fetchCart() // Refresh cart
        return { success: true, message: 'Đã thêm vào giỏ hàng' }
      } else {
        throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng')
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
      
      // Fallback for development - add to local state
      if (process.env.NODE_ENV === 'development') {
        // Check stock in development mode too
        if (!book.quantity || book.quantity <= 0) {
          return { success: false, error: 'Sản phẩm đã hết hàng' }
        }

        if (quantity > book.quantity) {
          return { success: false, error: `Chỉ còn ${book.quantity} cuốn trong kho` }
        }

        const existingItem = cartItems.value.find(item => item.book_id === (book.book_id || book.id))
        
        if (existingItem) {
          // Check if adding more would exceed stock
          if (existingItem.quantity + quantity > book.quantity) {
            return { success: false, error: `Không thể thêm. Chỉ còn ${book.quantity - existingItem.quantity} cuốn có thể thêm` }
          }
          existingItem.quantity += quantity
        } else {
          cartItems.value.push({
            cart_detail_id: Date.now(),
            book_id: book.book_id || book.id,
            quantity: quantity,
            book: {
              book_id: book.book_id || book.id,
              title: book.title,
              price: book.price,
              price_origin: book.price_origin,
              image_url: book.image || book.image_url,
              quantity: book.quantity || 99,
              publisher: book.publisher || 'Unknown',
              authors: book.authors || [{ name: book.author || 'Unknown Author' }]
            }
          })
        }
        return { success: true, message: response.data.msg || 'Đã thêm vào giỏ hàng' }
      }
      
      return { success: false, error: err.response?.data?.msg || 'Không thể thêm vào giỏ hàng' }
    } finally {
      isUpdating.value = false
    }
  }

  // Update quantity
  const updateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) return await removeFromCart(bookId)
    
    isUpdating.value = true
    
    try {
      const response = await axios.put('/carts/update-cart-item-quantity', {
        book_id: bookId,
        quantity: newQuantity
      })
      
      if (response.data.status === 200) {
        const itemIndex = cartItems.value.findIndex(item => item.book_id === bookId)
        if (itemIndex !== -1) {
          cartItems.value[itemIndex].quantity = newQuantity
        }
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Không thể cập nhật số lượng')
      }
    } catch (err) {
      console.error('Error updating quantity:', err)
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        const itemIndex = cartItems.value.findIndex(item => item.book_id === bookId)
        if (itemIndex !== -1) {
          cartItems.value[itemIndex].quantity = newQuantity
        }
        return { success: true }
      }
      
      return { success: false, error: err.response?.data?.message || 'Không thể cập nhật số lượng' }
    } finally {
      isUpdating.value = false
    }
  }

  // Remove from cart
  const removeFromCart = async (bookId) => {
    isUpdating.value = true
    
    try {
      const response = await axios.delete(`/carts/remove-from-cart?bookId=${bookId}`)
      
      if (response.data.status === 200) {
        cartItems.value = cartItems.value.filter(item => item.book_id !== bookId)
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Không thể xóa sản phẩm')
      }
    } catch (err) {
      console.error('Error removing from cart:', err)
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        cartItems.value = cartItems.value.filter(item => item.book_id !== bookId)
        return { success: true }
      }
      
      return { success: false, error: err.response?.data?.message || 'Không thể xóa sản phẩm' }
    } finally {
      isUpdating.value = false
    }
  }

  // Clear cart
  const clearCart = async () => {
    isUpdating.value = true
    
    try {
      const response = await axios.delete('/carts/clear-cart')
      
      if (response.data.status === 200) {
        cartItems.value = []
        discount.value = 0
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Không thể xóa giỏ hàng')
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        cartItems.value = []
        discount.value = 0
        return { success: true }
      }
      
      return { success: false, error: err.response?.data?.message || 'Không thể xóa giỏ hàng' }
    } finally {
      isUpdating.value = false
    }
  }

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    isUpdating.value = true
    
    try {
      const response = await axios.post('/cart/apply-coupon', {
        coupon_code: couponCode
      })
      
      if (response.data.status === 200) {
        discount.value = response.data.data.discount_amount || 0
        return { success: true, discount: discount.value }
      } else {
        throw new Error(response.data.message || 'Mã giảm giá không hợp lệ')
      }
    } catch (err) {
      console.error('Error applying coupon:', err)
      return { success: false, error: err.response?.data?.message || 'Mã giảm giá không hợp lệ' }
    } finally {
      isUpdating.value = false
    }
  }

  // Initialize cart (fetch when user logs in)
  const initializeCart = async () => {
    try {
      await fetchCart()
    } catch (error) {
      console.error('Error initializing cart:', error)
      // Không throw error, chỉ log để không ảnh hưởng đến flow đăng nhập
    }
  }

  // Clear cart data (when user logs out)
  const clearCartData = () => {
    cartItems.value = []
    discount.value = 0
    error.value = null
  }

  return {
    // State
    cartItems,
    items, // For backward compatibility
    isLoading,
    isUpdating,
    error,
    discount,
    shippingFee,
    
    // Computed
    totalItems,
    subtotal,
    totalPrice,
    isInCart,
    
    // Actions
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    initializeCart,
    clearCartData,
    getAuthorNames
  }
})
