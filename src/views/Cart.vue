<template>
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

      <div v-if="items.length === 0" class="text-center py-12">
        <ShoppingCart class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-gray-600 mb-2">
          Giỏ hàng trống
        </h2>
        <p class="text-gray-500 mb-6">
          Bạn chưa có sản phẩm nào trong giỏ hàng
        </p>
        <router-link to="/" class="btn-primary">
          Tiếp tục mua sắm
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <!-- Cart Items -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">Sản phẩm trong giỏ hàng</h2>
            
            <div class="space-y-4">
              <div 
                v-for="item in items" 
                :key="item.id"
                class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
              >
                <!-- Book Image -->
                <img 
                  :src="item.image" 
                  :alt="item.title"
                  class="w-20 h-24 object-cover rounded"
                />
                
                <!-- Book Info -->
                <div class="flex-1">
                  <h3 class="font-semibold text-lg">{{ item.title }}</h3>
                  <p class="text-gray-600">{{ item.author }}</p>
                  <p class="text-primary-600 font-bold">{{ formatPrice(item.price) }}</p>
                </div>
                
                <!-- Quantity Controls -->
                <div class="flex items-center space-x-2">
                  <button 
                    @click="decreaseQuantity(item.id)"
                    class="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus class="h-4 w-4" />
                  </button>
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  <button 
                    @click="increaseQuantity(item.id)"
                    class="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus class="h-4 w-4" />
                  </button>
                </div>
                
                <!-- Total Price -->
                <div class="text-right">
                  <p class="font-semibold">{{ formatPrice(item.price * item.quantity) }}</p>
                </div>
                
                <!-- Remove Button -->
                <button 
                  @click="removeFromCart(item.id)"
                  class="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">Tổng cộng</h2>
            
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Tổng số sản phẩm:</span>
                <span class="font-medium">{{ totalItems }} cuốn</span>
              </div>
              <div class="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span class="font-medium">Miễn phí</span>
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between text-lg font-bold">
                  <span>Tổng tiền:</span>
                  <span class="text-primary-600">{{ formatPrice(totalPrice) }}</span>
                </div>
              </div>
            </div>
            
            <div class="mt-6 space-y-3">
              <router-link to="/checkout" class="w-full btn-primary text-center block">
                Tiến hành thanh toán
              </router-link>
              <router-link to="/" class="w-full btn-outline text-center block">
                Tiếp tục mua sắm
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'

const cartStore = useCartStore()

const items = computed(() => cartStore.items)
const totalItems = computed(() => cartStore.totalItems)
const totalPrice = computed(() => cartStore.totalPrice)

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const increaseQuantity = (id) => {
  const item = items.value.find(item => item.id === id)
  if (item) {
    cartStore.updateQuantity(id, item.quantity + 1)
  }
}

const decreaseQuantity = (id) => {
  const item = items.value.find(item => item.id === id)
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(id, item.quantity - 1)
  }
}

const removeFromCart = (id) => {
  cartStore.removeFromCart(id)
}
</script>
