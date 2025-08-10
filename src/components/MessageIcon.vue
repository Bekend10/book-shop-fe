<template>
  <div class="message-icon-container">
    <!-- Message Icon Button -->
    <div class="relative">
      <button
        @click="toggleDropdown"
        class="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors duration-200"
        :class="{ 'text-blue-600': showDropdown }"
      >
        <!-- Message Icon -->
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        
        <!-- Unread Badge -->
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
        
        <!-- Connection Status Indicator -->
        <span
          class="absolute -bottom-1 w-3 h-3 rounded-full border-2 border-white"
          :class="isConnected ? 'bg-green-500' : 'bg-gray-400'"
          :title="isConnected ? 'Đã kết nối' : 'Mất kết nối'"
        ></span>
      </button>

      <!-- Dropdown Menu -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showDropdown"
          class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Tin nhắn</h3>
            <div class="flex items-center gap-2">
              <!-- Debug info -->
              <span class="text-xs text-gray-400">{{ unreadCount }}/{{ conversations.length }}</span>
              <!-- Mark as read button -->
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                :disabled="markingAsRead"
                class="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded bg-blue-50 hover:bg-blue-100"
              >
                <span v-if="markingAsRead">Đang xử lý...</span>
                <span v-else>Đánh dấu đã đọc</span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="p-4 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="text-sm text-gray-500 mt-2">Đang tải...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="p-4 text-center">
            <svg class="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm text-red-600 mb-2">{{ error }}</p>
            <button
              @click="fetchConversations"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              Thử lại
            </button>
          </div>

          <!-- Conversations List -->
          <div v-else class="max-h-96 overflow-y-auto">
            
            <!-- Empty State -->
            <div v-if="conversations.length === 0" class="p-6 text-center">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <p class="text-gray-500">Chưa có tin nhắn nào</p>
            </div>

            <!-- Conversation Items -->
            <div v-else>
              <div
                v-for="conversation in conversations"
                :key="conversation.conversation_id"
                @click="openConversation(conversation)"
                class="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <!-- Avatar -->
                <div class="flex-shrink-0 mr-3">
                  <img
                    v-if="conversation.participant_avatar"
                    :src="conversation.participant_avatar"
                    :alt="conversation.participant_name"
                    class="w-10 h-10 rounded-full object-cover"
                  >
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center"
                  >
                    <span class="text-gray-600 font-medium text-sm">
                      {{ getInitials(conversation.participant_name) }}
                    </span>
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ conversation.last_message_sender_name || conversation.participant_name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ formatTime(conversation.last_message_time) }}
                    </p>
                  </div>
                  <p class="text-sm text-gray-600 truncate mt-1">
                    {{ conversation.last_message || 'Chưa có tin nhắn' }}
                  </p>
                </div>

                <!-- Unread Indicator -->
                <div v-if="conversation.unread_count > 0" class="flex-shrink-0 ml-2">
                  <span class="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {{ conversation.unread_count > 99 ? '99+' : conversation.unread_count }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-3 border-t border-gray-200 bg-gray-50">
            <button
              @click="openAllMessages"
              class="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả tin nhắn
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Backdrop -->
    <div
      v-if="showDropdown"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>

    <!-- Chat Windows -->
    <ChatWindow
      v-for="openChat in openChats"
      :key="openChat.conversation_id"
      :conversation="openChat"
      :is-open="!minimizedChats.has(openChat.conversation_id)"
      :position="getChatWindowPosition(openChat.conversation_id)"
      @close="closeChatWindow(openChat.conversation_id)"
      @minimize="minimizeChatWindow(openChat.conversation_id)"
      @restore="restoreChatWindow(openChat.conversation_id)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useMessageStore } from '@/stores/messageStore'
import { useAuthStore } from '@/stores/authStore'
import signalRService from '@/services/signalRService'
import ChatWindow from './ChatWindow.vue'

// Stores
const messageStore = useMessageStore()
const authStore = useAuthStore()

// Local state
const showDropdown = ref(false)
const openChats = ref([]) // Array of open chat windows
const minimizedChats = ref(new Set()) // Set of minimized chat IDs

// Computed properties
const conversations = computed(() => {
  const sorted = messageStore.sortedConversations
  return sorted
})
const unreadCount = computed(() => {
  return messageStore.unreadCount
})
const isLoading = computed(() => {
  return messageStore.isLoading
})
const error = computed(() => {
  return messageStore.error
})
const isConnected = computed(() => messageStore.isConnected)
const markingAsRead = computed(() => messageStore.markingAsRead)

// Methods
const toggleDropdown = async () => {
  if (!showDropdown.value) {
    showDropdown.value = true
    await fetchConversations()
  } else {
    showDropdown.value = false
  }
}

const closeDropdown = () => {
  showDropdown.value = false
}

const fetchConversations = async () => {
  if (authStore.isAuthenticated) {
    try {
      const result = await messageStore.fetchConversations()
      // Force reactivity by triggering computed
      await nextTick()
    } catch (error) {
      console.error('Error in fetchConversations:', error)
    }
  }
}

const markAllAsRead = async () => {
  const result = await messageStore.markAllAsRead()
  if (result.success) {
    // Có thể hiển thị toast success
  } else {
    // Hiển thị lỗi
    console.error('Lỗi khi đánh dấu đã đọc:', result.error)
  }
}

const openConversation = async (conversation) => {
  
  // Check if chat window is already open
  const existingChat = openChats.value.find(chat => 
    chat.conversation_id === conversation.conversation_id
  )
  
  if (existingChat) {
    // If minimized, restore it
    if (minimizedChats.value.has(conversation.conversation_id)) {
      restoreChatWindow(conversation.conversation_id)
    }
    closeDropdown()
    return
  }
  
  // Limit to maximum 3 chat windows
  if (openChats.value.length >= 3) {
    // Remove the oldest chat window
    const oldestChat = openChats.value.shift()
    minimizedChats.value.delete(oldestChat.conversation_id)
  }
  
  // Add new chat window
  openChats.value.push(conversation)
  
  closeDropdown()
}

const openAllMessages = () => {
  // TODO: Implement navigation to messages page
  closeDropdown()
}

const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút`
  if (diffHours < 24) return `${diffHours} giờ`
  if (diffDays < 7) return `${diffDays} ngày`
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  })
}

// Chat window management methods
const closeChatWindow = (conversationId) => {
  const index = openChats.value.findIndex(chat => 
    chat.conversation_id === conversationId
  )
  if (index !== -1) {
    openChats.value.splice(index, 1)
    minimizedChats.value.delete(conversationId)
  }
}

const minimizeChatWindow = (conversationId) => {
  minimizedChats.value.add(conversationId)
}

const restoreChatWindow = (conversationId) => {
  minimizedChats.value.delete(conversationId)
}

const getChatWindowPosition = (conversationId) => {
  const index = openChats.value.findIndex(chat => 
    chat.conversation_id === conversationId
  )
  
  // Each chat window is 320px wide (w-80) + 16px margin between windows
  const chatWidth = 320
  const margin = 16
  const baseOffset = 16 // Distance from right edge
  
  // Calculate position from right
  const position = baseOffset + (index * (chatWidth + margin))
  
  // Ensure the chat window doesn't go beyond the left edge of the screen
  const maxPosition = Math.max(position, baseOffset)
  
  return `${maxPosition}px`
}

// Lifecycle
onMounted(async () => {
  // Kết nối SignalR khi component được mount
  if (authStore.isAuthenticated) {
    await signalRService.connect()
    await fetchConversations()
    
    // Request notification permission
    await signalRService.requestNotificationPermission()
  }
  
  // Listen for clicks outside to close dropdown
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
  if (showDropdown.value && !event.target.closest('.message-icon-container')) {
    closeDropdown()
  }
}

// Watch for auth changes
import { watch } from 'vue'
watch(() => authStore.isAuthenticated, async (newVal) => {
  if (newVal) {
    await signalRService.connect()
    await fetchConversations()
  } else {
    await signalRService.disconnect()
    messageStore.clearMessages()
  }
})

// Watch for conversations changes to update dropdown content
watch(() => messageStore.conversations.length, async (newLength, oldLength) => {
  // Force re-render of dropdown if it's open
  if (showDropdown.value && newLength !== oldLength) {
    await nextTick()
  }
})

// Watch for conversations array changes (not just length)
watch(() => [...messageStore.conversations], async (newConversations, oldConversations) => {
  if (showDropdown.value) {
    await nextTick()
    // Force trigger computed
    const current = conversations.value
  }
}, { deep: true })

// Watch for store conversations directly 
watch(() => messageStore.conversations, async (newConversations) => {
  if (showDropdown.value) {
    await nextTick()
  }
}, { immediate: true })
</script>

<style scoped>
/* Custom scrollbar for conversations list */
.max-h-96::-webkit-scrollbar {
  width: 4px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
