<template>
  <div 
    v-if="isOpen"
    ref="chatWindowRef"
    class="chat-window"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
      <div class="flex items-center space-x-2">
        <!-- Avatar -->
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span class="text-white text-sm font-medium">
            {{ getInitials(conversation?.participant_name) }}
          </span>
        </div>
        <!-- Name -->
        <div>
          <p class="font-medium text-sm">{{ conversation?.participant_name }}</p>
          <p class="text-xs text-blue-100">
            <span v-if="isTyping" class="animate-pulse">Đang nhập...</span>
            <span v-else-if="isOnline" class="text-green-300">● Đang hoạt động</span>
            <span v-else>Offline</span>
          </p>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <!-- Minimize -->
        <button
          @click="minimize"
          class="p-1 hover:bg-blue-700 rounded transition-colors"
          title="Thu nhỏ"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </button>
        
        <!-- Close -->
        <button
          @click="close"
          class="p-1 hover:bg-blue-700 rounded transition-colors"
          title="Đóng"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages Container -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
      @scroll="handleScroll"
    >
      <!-- Loading older messages -->
      <div v-if="isLoadingDetail && currentPage > 1" class="text-center py-2">
        <div class="inline-flex items-center space-x-2 text-gray-500">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span class="text-xs">Đang tải tin nhắn cũ...</span>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="message in sortedMessages"
        :key="message.message_id"
        class="mb-4"
      >
        <div 
          class="flex"
          :class="isMyMessage(message) ? 'justify-end' : 'justify-start'"
        >
          <div class="max-w-xs">
            <!-- Sender name (only for messages from others) -->
            <div 
              v-if="!isMyMessage(message)"
              class="text-xs text-gray-600 mb-1 px-1"
            >
              {{ message.sender_snapshot_name }}
            </div>
            
            <!-- Message bubble -->
            <div
              class="px-3 py-2 rounded-lg text-sm break-words"
              :class="getMessageBubbleClass(message)"
            >
              {{ message.message_content }}
            </div>
            
            <!-- Timestamp -->
            <div 
              class="text-xs text-gray-500 mt-1 px-1"
              :class="isMyMessage(message) ? 'text-right' : 'text-left'"
            >
              {{ formatMessageTime(message.sent_at) }}
              <span v-if="isMyMessage(message) && message.is_read" class="text-blue-600 ml-1">
                ✓✓
              </span>
              <span v-else-if="isMyMessage(message)" class="text-gray-400 ml-1">
                ✓
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!isLoadingDetail && messages.length === 0" class="text-center py-8">
        <div class="text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p class="text-sm">Chưa có tin nhắn nào</p>
          <p class="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      </div>

      <!-- Initial loading -->
      <div v-if="isLoadingDetail && currentPage === 1" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p class="text-sm text-gray-500">Đang tải tin nhắn...</p>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-3 border-t border-gray-200 bg-white">
      <div class="flex items-end space-x-2">
        <!-- Message Input -->
        <div class="flex-1">
          <input
            v-model="newMessage"
            @keydown.enter.exact.prevent="sendMessage"
            @input="handleTyping"
            ref="messageInput"
            type="text"
            placeholder="Nhập tin nhắn..."
            class="chat-input-field"
          />
        </div>
        
        <!-- Send Button -->
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim() || isSending"
          class="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <svg v-if="!isSending" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
          <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </button>
      </div>
    </div>
  </div>

  <!-- Minimized state -->
  <div
    v-if="!isOpen"
    @click="restore"
    class="chat-window-minimized bg-blue-600 text-white p-3 rounded-t-lg shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
    :style="{ 
      position: 'fixed', 
      top: '100px',
      bottom: '0px', 
      right: chatPosition, 
      zIndex: '9999'
    }"
  >
    <div class="flex items-center space-x-2">
      <div class="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
        <span class="text-white text-sm font-medium">
          {{ getInitials(conversation?.participant_name) }}
        </span>
      </div>
      <span v-if="unreadCount > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useMessageStore } from '@/stores/messageStore'
import { signalRService } from '@/services/signalRService'

// Props
const props = defineProps({
  conversation: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: '16px'
  }
})

// Emits
const emit = defineEmits(['close', 'minimize', 'restore'])

// Store
const messageStore = useMessageStore()

// Local state
const newMessage = ref('')
const isSending = ref(false)
const typingTimer = ref(null)
const currentPage = ref(1)
const messagesContainer = ref(null)
const messageInput = ref(null)
const lastScrollHeight = ref(0)
const chatWindowRef = ref(null)

// Computed
const chatPosition = computed(() => props.position)
const messages = computed(() => messageStore.currentConversationMessages)
const isLoadingDetail = computed(() => messageStore.isLoadingDetail)
const hasMoreMessages = computed(() => messageStore.currentConversationPagination?.hasMore || false)

// Check if partner is online
const isOnline = computed(() => {
  if (!props.conversation?.participant_id) {
    return false
  }
  
  const participantId = props.conversation.participant_id
  const onlineStatus = messageStore.isUserOnline(participantId)
  
  return onlineStatus
})

// Check if partner is typing
const isTyping = computed(() => {
  if (!props.conversation?.participant_id) return false
  const conversationId = props.conversation.conversation_id || props.conversation.id
  return messageStore.isUserTyping(props.conversation.participant_id, conversationId)
})

const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => {
    return new Date(a.sent_at) - new Date(b.sent_at)
  })
})

const unreadCount = computed(() => {
  return messages.value.filter(msg => 
    !msg.is_read && !isMyMessage(msg)
  ).length
})

// Methods
const getCurrentUserId = () => {
  return messageStore.getCurrentUserId()
}

const isMyMessage = (message) => {
  const currentUserId = getCurrentUserId()
  return message.sender_id === currentUserId
}

const getMessageBubbleClass = (message) => {
  if (isMyMessage(message)) {
    return 'bg-blue-600 text-white'
  } else {
    return 'bg-white text-gray-900 border border-gray-200'
  }
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

const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  
  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút`
  if (diffHours < 24) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadMessages = async () => {
  if (!props.conversation?.participant_id) return
  
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return

  // Join conversation cho real-time updates
  const conversationId = props.conversation?.conversation_id || props.conversation?.id
  if (conversationId && signalRService.isConnected()) {
    await signalRService.joinConversation(conversationId)
  }

  const result = await messageStore.fetchConversationDetail(
    currentUserId,
    props.conversation.participant_id,
    1,
    100
  )
  
  if (result.success) {
    // Scroll to bottom after loading initial messages
    await nextTick()
    scrollToBottom()
  }
}

const loadMoreMessages = async () => {
  if (!hasMoreMessages.value || isLoadingDetail.value) return
  
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return

  // Store current scroll position
  const container = messagesContainer.value
  lastScrollHeight.value = container.scrollHeight

  const result = await messageStore.loadMoreMessages(
    props.conversation.participant_id,
    currentUserId
  )

  if (result.success) {
    currentPage.value++
    // Maintain scroll position after loading older messages
    await nextTick()
    const newScrollHeight = container.scrollHeight
    container.scrollTop = newScrollHeight - lastScrollHeight.value
  }
}

const handleScroll = async () => {
  const container = messagesContainer.value
  if (!container) return

  // Load more messages when scrolled to top
  if (container.scrollTop === 0 && hasMoreMessages.value && !isLoadingDetail.value) {
    await loadMoreMessages()
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  const content = newMessage.value.trim()
  if (!content || isSending.value) return

  isSending.value = true
  
  try {
    // Stop typing indicator before sending
    const conversationId = props.conversation?.conversation_id || props.conversation?.id
    if (conversationId && signalRService.isConnected()) {
      signalRService.stopTyping(conversationId)
    }

    const result = await messageStore.sendMessage(props.conversation.participant_id, content)
    
    if (result.success) {
      
      // Clear input
      newMessage.value = ''
      
      // Force scroll to bottom to show new message immediately
      await nextTick()
      scrollToBottom()
      
      // Double-check scroll after a small delay to ensure the new message is rendered
      setTimeout(() => {
        scrollToBottom()
      }, 100)
      
    } else {
      console.error('Error sending message:', result.error)
      // TODO: Show error toast
    }
    
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    isSending.value = false
  }
}

const handleTyping = () => {
  // Clear previous timer
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
  
  // Send typing indicator
  const conversationId = props.conversation?.conversation_id || props.conversation?.id
  
  if (conversationId && signalRService.isConnected()) {
    signalRService.startTyping(conversationId).then(result => {   
    })
  }
  
  // Stop typing after 3 seconds
  typingTimer.value = setTimeout(() => {
    if (conversationId && signalRService.isConnected()) {
      signalRService.stopTyping(conversationId).then(result => {
      })
    }
  }, 3000)
}

const close = async () => {
  // Leave conversation trước khi đóng
  const conversationId = props.conversation?.conversation_id || props.conversation?.id
  if (conversationId && signalRService.isConnected()) {
    await signalRService.leaveConversation(conversationId)
  }
  
  messageStore.clearCurrentConversation()
  emit('close')
}

const minimize = () => {
  emit('minimize')
}

const restore = () => {
  emit('restore')
}

// Lifecycle
onMounted(async () => {
  
  if (props.isOpen) {
    await loadMessages()
  }
  
  // Force position after mount
  nextTick(() => {
    forceChatPosition()
  })
})

// Force chat window position
const forceChatPosition = () => {
  if (chatWindowRef.value) {
    const element = chatWindowRef.value
    
    // Remove all classes that might interfere
    element.className = ''
    
    // Force styles directly on DOM element with highest priority
    element.style.cssText = `
      position: fixed !important;
      bottom: 0px !important;
      right: ${chatPosition.value} !important;
      top: 250px !important;
      left: auto !important;
      transform: none !important;
      z-index: 9999 !important;
      width: 320px !important;
      height: 450px !important;
      background: white !important;
      border-radius: 8px 8px 0 0 !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
      border: 1px solid #e5e7eb !important;
      display: flex !important;
      flex-direction: column !important;
      margin: 0 !important;
      padding: 0 !important;
    `
  }
}

onUnmounted(async () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    
    // Stop typing indicator when component is unmounted
    const conversationId = props.conversation?.conversation_id || props.conversation?.id
    if (conversationId && signalRService.isConnected()) {
      await signalRService.stopTyping(conversationId)
      await signalRService.leaveConversation(conversationId)
    }
  }
})

// Watch for conversation changes
watch(() => props.conversation, async (newConversation, oldConversation) => {
  // Leave old conversation if exists
  if (oldConversation && signalRService.isConnected()) {
    const oldConversationId = oldConversation.conversation_id || oldConversation.id
    if (oldConversationId) {
      await signalRService.leaveConversation(oldConversationId)
    }
  }
  
  // Load new conversation
  if (newConversation && props.isOpen) {
    messageStore.clearCurrentConversation()
    currentPage.value = 1
    await loadMessages()
  }
}, { immediate: true })

// Watch for new messages to scroll to bottom
watch(() => messages.value.length, async (newLength, oldLength) => {
  if (newLength > oldLength && messages.value.length > 0) {
    await nextTick()
    scrollToBottom()
  }
})

// Watch for isOpen changes to force position
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      forceChatPosition()
      
      // Scroll to bottom when chat window is restored
      scrollToBottom()
      
      // Force again after a short delay to ensure it sticks
      setTimeout(() => {
        forceChatPosition()
        scrollToBottom()
      }, 100)
      
      // And again after 500ms for any delayed CSS
      setTimeout(() => {
        forceChatPosition()
        scrollToBottom()
      }, 500)
    })
  }
}, { immediate: true })

// Watch for position changes
watch(() => chatPosition.value, () => {
  nextTick(() => {
    forceChatPosition()
  })
})
</script>

<style scoped>
/* Light/Dark mode variables */
.chat-window {
  --chat-bg: #ffffff;
  --chat-header-bg: #2563eb;
  --chat-header-text: #ffffff;
  --chat-border: #e5e7eb;
  --chat-messages-bg: #f9fafb;
  --chat-input-bg: #ffffff;
  --chat-input-border: #d1d5db;
  --chat-input-border-hover: #9ca3af;
  --chat-input-focus: #2563eb;
  --chat-text: #111827;
  --chat-text-muted: #6b7280;
  --chat-bubble-other: #ffffff;
  --chat-bubble-other-text: #111827;
  --chat-bubble-other-border: #e5e7eb;
  --chat-bubble-mine: #2563eb;
  --chat-bubble-mine-text: #ffffff;
  --chat-scrollbar-track: #f1f5f9;
  --chat-scrollbar-thumb: #cbd5e1;
  --chat-scrollbar-thumb-hover: #94a3b8;
  --chat-shadow: rgba(0, 0, 0, 0.1);
  --chat-shadow-light: rgba(0, 0, 0, 0.05);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .chat-window {
    --chat-bg: #1f2937;
    --chat-header-bg: #1d4ed8;
    --chat-header-text: #ffffff;
    --chat-border: #374151;
    --chat-messages-bg: #111827;
    --chat-input-bg: #2d3748;
    --chat-input-border: #4a5568;
    --chat-input-border-hover: #718096;
    --chat-input-focus: #3b82f6;
    --chat-text: #f7fafc;
    --chat-text-muted: #a0aec0;
    --chat-bubble-other: #374151;
    --chat-bubble-other-text: #f9fafb;
    --chat-bubble-other-border: #4b5563;
    --chat-bubble-mine: #1d4ed8;
    --chat-bubble-mine-text: #ffffff;
    --chat-scrollbar-track: #374151;
    --chat-scrollbar-thumb: #4b5563;
    --chat-scrollbar-thumb-hover: #6b7280;
    --chat-shadow: rgba(0, 0, 0, 0.3);
    --chat-shadow-light: rgba(0, 0, 0, 0.15);
  }
}

/* Force dark mode class for manual toggle */
.chat-window.dark {
  --chat-bg: #1f2937;
  --chat-header-bg: #1d4ed8;
  --chat-header-text: #ffffff;
  --chat-border: #374151;
  --chat-messages-bg: #111827;
  --chat-input-bg: #2d3748;
  --chat-input-border: #4a5568;
  --chat-input-border-hover: #718096;
  --chat-input-focus: #3b82f6;
  --chat-text: #f7fafc;
  --chat-text-muted: #a0aec0;
  --chat-bubble-other: #374151;
  --chat-bubble-other-text: #f9fafb;
  --chat-bubble-other-border: #4b5563;
  --chat-bubble-mine: #1d4ed8;
  --chat-bubble-mine-text: #ffffff;
  --chat-scrollbar-track: #374151;
  --chat-scrollbar-thumb: #4b5563;
  --chat-scrollbar-thumb-hover: #6b7280;
  --chat-shadow: rgba(0, 0, 0, 0.3);
  --chat-shadow-light: rgba(0, 0, 0, 0.15);
}

/* Chat window styling with CSS variables */
.chat-window {
  background: var(--chat-bg) !important;
  border: 1px solid var(--chat-border) !important;
  box-shadow: 0 25px 50px -12px var(--chat-shadow) !important;
  color: var(--chat-text);
}

/* Header styling */
.chat-window .bg-blue-600 {
  background-color: var(--chat-header-bg) !important;
  color: var(--chat-header-text) !important;
}

/* Messages container */
.chat-window .bg-gray-50 {
  background-color: var(--chat-messages-bg) !important;
}

/* Input area */
.chat-window .bg-white:last-child {
  background-color: var(--chat-input-bg) !important;
  border-top: 1px solid var(--chat-border) !important;
}

/* Message input styling */
.chat-window textarea {
  background-color: var(--chat-input-bg) !important;
  border: 1px solid var(--chat-input-border) !important;
  color: var(--chat-text) !important;
  border-radius: 20px !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  resize: none !important;
  outline: none !important;
  transition: all 0.2s ease-in-out !important;
  box-shadow: 0 1px 3px var(--chat-shadow) !important;
  overflow: hidden !important;
  word-wrap: break-word !important;
  white-space: pre-wrap !important;
  vertical-align: top !important;
}

.chat-window textarea:focus {
  border-color: var(--chat-input-focus) !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1), 0 1px 3px var(--chat-shadow) !important;
  transform: scale(1.01) !important;
}

.chat-window textarea::placeholder {
  color: var(--chat-text-muted) !important;
  opacity: 0.7 !important;
}

/* Dark mode specific textarea adjustments */
@media (prefers-color-scheme: dark) {
  .chat-window textarea:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), 0 1px 3px var(--chat-shadow) !important;
  }
}

.chat-window.dark textarea:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), 0 1px 3px var(--chat-shadow) !important;
}

/* Send button styling */
.chat-window .bg-blue-600:not(.rounded-t-lg) {
  background: linear-gradient(135deg, var(--chat-input-focus), #1d4ed8, #1e40af) !important;
  border: 2px solid transparent !important;
  border-radius: 50% !important;
  padding: 12px !important;
  width: 48px !important;
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 
    0 4px 12px rgba(37, 99, 235, 0.4),
    0 2px 4px rgba(37, 99, 235, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.2) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(10px) !important;
  position: relative !important;
  overflow: hidden !important;
}

.chat-window .bg-blue-600:not(.rounded-t-lg)::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -100% !important;
  width: 100% !important;
  height: 100% !important;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent) !important;
  transition: left 0.6s ease !important;
}

.chat-window .bg-blue-600:not(.rounded-t-lg):hover {
  transform: translateY(-2px) scale(1.1) !important;
  box-shadow: 
    0 8px 20px rgba(37, 99, 235, 0.5),
    0 4px 8px rgba(37, 99, 235, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.3) !important;
  border-color: rgba(255,255,255,0.2) !important;
}

.chat-window .bg-blue-600:not(.rounded-t-lg):hover::before {
  left: 100% !important;
}

.chat-window .bg-blue-600:not(.rounded-t-lg):active {
  transform: translateY(-1px) scale(1.05) !important;
  box-shadow: 
    0 4px 12px rgba(37, 99, 235, 0.6),
    0 2px 4px rgba(37, 99, 235, 0.5),
    inset 0 1px 0 rgba(255,255,255,0.2) !important;
}

.chat-window .bg-blue-600:not(.rounded-t-lg):disabled {
  opacity: 0.6 !important;
  transform: none !important;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2) !important;
  cursor: not-allowed !important;
}

/* Message bubbles */
.chat-window .bg-white {
  background-color: var(--chat-bubble-other) !important;
  color: var(--chat-bubble-other-text) !important;
  border: 1px solid var(--chat-bubble-other-border) !important;
}

.chat-window .bg-blue-600.text-white {
  background: linear-gradient(135deg, var(--chat-bubble-mine), #1d4ed8) !important;
  color: var(--chat-bubble-mine-text) !important;
  border: none !important;
}

/* Text colors */
.chat-window .text-gray-600 {
  color: var(--chat-text-muted) !important;
}

.chat-window .text-gray-500 {
  color: var(--chat-text-muted) !important;
}

.chat-window .text-gray-900 {
  color: var(--chat-text) !important;
}

/* Custom scrollbar with theme support */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--chat-scrollbar-track);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--chat-scrollbar-thumb);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--chat-scrollbar-thumb-hover);
}

/* Message bubble improvements */
.max-w-xs {
  max-width: 280px;
  word-wrap: break-word;
}

/* Message bubbles animation */
.chat-window .rounded-lg {
  transition: all 0.2s ease-in-out;
}

.chat-window .rounded-lg:hover {
  transform: scale(1.02);
}

/* Input area styling improvements */
.chat-window .border-t {
  border-top: 1px solid var(--chat-border) !important;
  padding: 20px !important;
  background: linear-gradient(135deg, var(--chat-input-bg), rgba(255,255,255,0.05)) !important;
  backdrop-filter: blur(20px) !important;
  border-radius: 0 0 8px 8px !important;
}

/* Smooth animations */
.fixed {
  transition: all 0.3s ease-in-out;
}

/* Message spacing */
.mb-4:last-child {
  margin-bottom: 0;
}

/* Ensure chat window stays at bottom and above other content */
.chat-window {
  position: fixed !important;
  bottom: 0 !important;
  z-index: 9999 !important;
}

.chat-window-minimized {
  position: fixed !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  background: var(--chat-header-bg) !important;
  color: var(--chat-header-text) !important;
  border: 1px solid var(--chat-border) !important;
  box-shadow: 0 4px 12px var(--chat-shadow) !important;
}

/* Responsive width for smaller screens */
@media (max-width: 640px) {
  .w-80 {
    width: calc(100vw - 32px);
    max-width: 320px;
  }
  
  .chat-window input {
    font-size: 16px !important; /* Prevents zoom on iOS */
    padding: 0 14px !important;
  }
}

/* Input container improvements */
.chat-window .flex.items-end.space-x-2 {
  align-items: center !important;
  gap: 12px !important;
  padding: 6px !important;
  background: rgba(255,255,255,0.05) !important;
  border-radius: 30px !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  box-shadow: 
    0 4px 12px var(--chat-shadow-light),
    inset 0 1px 0 rgba(255,255,255,0.1) !important;
}

.chat-window .flex-1 {
  flex: 1 !important;
  min-width: 0 !important; /* Prevents flex item from overflowing */
  padding: 2px !important;
}

/* Specific class for chat input field */
.chat-input-field {
  width: 100% !important;
  max-width: 100% !important;
  height: 44px !important;
  background-color: var(--chat-input-bg) !important;
  background-image: linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.03) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.03) 75%) !important;
  background-size: 20px 20px !important;
  border: 2px solid var(--chat-input-border) !important;
  color: var(--chat-text) !important;
  border-radius: 24px !important;
  padding: 0 18px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 1.4 !important;
  outline: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 
    0 2px 4px var(--chat-shadow-light),
    0 8px 16px var(--chat-shadow),
    inset 0 1px 0 rgba(255,255,255,0.1) !important;
  box-sizing: border-box !important;
  backdrop-filter: blur(10px) !important;
}

.chat-input-field:hover {
  border-color: var(--chat-input-border-hover) !important;
  transform: translateY(-1px) !important;
  box-shadow: 
    0 4px 8px var(--chat-shadow-light),
    0 12px 24px var(--chat-shadow),
    inset 0 1px 0 rgba(255,255,255,0.2) !important;
}

.chat-input-field:focus {
  border-color: var(--chat-input-focus) !important;
  transform: translateY(-2px) scale(1.01) !important;
  box-shadow: 
    0 0 0 4px rgba(37, 99, 235, 0.15),
    0 8px 16px var(--chat-shadow),
    0 16px 32px rgba(37, 99, 235, 0.1),
    inset 0 1px 0 rgba(255,255,255,0.2) !important;
}

.chat-input-field::placeholder {
  color: var(--chat-text-muted) !important;
  opacity: 0.8 !important;
  font-weight: 400 !important;
}

/* Dark mode specific adjustments for chat input */
@media (prefers-color-scheme: dark) {
  .chat-input-field {
    background-image: linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.02) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.02) 75%) !important;
  }
  
  .chat-input-field:focus {
    box-shadow: 
      0 0 0 4px rgba(59, 130, 246, 0.2),
      0 8px 16px var(--chat-shadow),
      0 16px 32px rgba(59, 130, 246, 0.15),
      inset 0 1px 0 rgba(255,255,255,0.1) !important;
  }
}

.chat-window.dark .chat-input-field {
  background-image: linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.02) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.02) 75%) !important;
}

.chat-window.dark .chat-input-field:focus {
  box-shadow: 
    0 0 0 4px rgba(59, 130, 246, 0.2),
    0 8px 16px var(--chat-shadow),
    0 16px 32px rgba(59, 130, 246, 0.15),
    inset 0 1px 0 rgba(255,255,255,0.1) !important;
}

/* Focus states for accessibility */
.chat-window button:focus {
  outline: 2px solid var(--chat-input-focus);
  outline-offset: 2px;
}

/* Loading animation improvements */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Typing indicator animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Message timestamp styling */
.chat-window .text-xs {
  color: var(--chat-text-muted) !important;
  transition: color 0.2s ease;
}

/* Empty state styling */
.chat-window .text-gray-400 {
  color: var(--chat-text-muted) !important;
}

/* Read receipt styling */
.chat-window .text-blue-600 {
  color: var(--chat-input-focus) !important;
}

/* Border improvements */
.chat-window .border-gray-200 {
  border-color: var(--chat-border) !important;
}

.chat-window .border-gray-300 {
  border-color: var(--chat-input-border) !important;
}
</style>
