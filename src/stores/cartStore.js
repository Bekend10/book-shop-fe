import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])

  // Getters
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const isInCart = computed(() => {
    return (bookId) => items.value.some(item => item.id === bookId)
  })

  // Actions
  const addToCart = (book, quantity = 1) => {
    const existingItem = items.value.find(item => item.id === book.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        image: book.image,
        quantity: quantity
      })
    }
  }

  const removeFromCart = (bookId) => {
    const index = items.value.findIndex(item => item.id === bookId)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (bookId, quantity) => {
    const item = items.value.find(item => item.id === bookId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(bookId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const clearCart = () => {
    items.value = []
  }

  return {
    items,
    totalItems,
    totalPrice,
    isInCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})
