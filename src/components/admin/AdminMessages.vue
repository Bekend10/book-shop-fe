<template>
  <div class="admin-messages">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Quản lý tin nhắn</h1>
          <p class="page-subtitle">Nhắn tin với khách hàng và quản lý hội thoại</p>
        </div>
        <div class="header-actions">
          <button
            @click="markAllAsRead"
            :disabled="isMarkingAsRead || !hasUnreadMessages"
            class="btn btn-outline-primary"
            v-if="hasUnreadMessages"
          >
            <Check class="btn-icon" />
            Đánh dấu tất cả đã đọc
          </button>
          <button
            @click="refreshMessages"
            :disabled="isLoading"
            class="btn btn-secondary"
          >
            <RefreshCw class="btn-icon" :class="{ 'animate-spin': isLoading }" />
            Làm mới
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <MessageCircle class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Tổng hội thoại</div>
          <div class="stat-value">{{ stats.totalConversations }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <Bell class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Tin nhắn chưa đọc</div>
          <div class="stat-value">{{ stats.unreadMessages }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <Users class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Khách hàng hoạt động</div>
          <div class="stat-value">{{ stats.activeUsers }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-info">
          <Clock class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-label">Tin nhắn hôm nay</div>
          <div class="stat-value">{{ stats.todayMessages }}</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="messages-layout">
      <!-- Conversation List -->
      <div class="conversations-panel">
        <div class="panel-header">
          <h3 class="panel-title">Cuộc trò chuyện</h3>
          <div class="panel-actions">
            <button 
              @click="startNewConversation"
              class="btn btn-sm btn-primary"
              title="Bắt đầu cuộc trò chuyện mới"
            >
              <Plus class="btn-icon" />
            </button>
          </div>
        </div>
        
        <div class="conversations-list">
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p class="loading-text">Đang tải hội thoại...</p>
          </div>
          
          <div v-else-if="conversations.length === 0" class="empty-state">
            <MessageCircle class="empty-icon" />
            <p class="empty-text">Chưa có cuộc trò chuyện nào</p>
            <button @click="startNewConversation" class="btn btn-primary">
              Bắt đầu trò chuyện
            </button>
          </div>
          
          <div
            v-for="conversation in sortedConversations"
            :key="conversation.conversation_id"
            @click="selectConversation(conversation)"
            :class="[
              'conversation-item',
              { 'active': selectedConversation?.conversation_id === conversation.conversation_id }
            ]"
          >
            <div class="conversation-avatar">
              <img 
                v-if="conversation.participant_avatar" 
                :src="conversation.participant_avatar" 
                :alt="conversation.participant_name"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ getInitials(conversation.participant_name) }}
              </div>
            </div>
            
            <div class="conversation-content">
              <div class="conversation-header">
                <h4 class="participant-name">{{ conversation.participant_name }}</h4>
                <span class="message-time">{{ formatTime(conversation.last_message_time) }}</span>
              </div>
              
              <div class="conversation-preview">
                <p class="last-message">
                  <span v-if="conversation.last_message_sender_name !== conversation.participant_name" class="sender-prefix">
                    Bạn: 
                  </span>
                  {{ conversation.last_message }}
                </p>
                <div class="conversation-meta">
                  <span v-if="conversation.unread_count > 0" class="unread-badge">
                    {{ conversation.unread_count }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-panel">
        <div v-if="!selectedConversation" class="chat-empty-state">
          <MessageCircle class="empty-icon" />
          <h3 class="empty-title">Chọn một cuộc trò chuyện</h3>
          <p class="empty-text">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</p>
        </div>
        
        <div v-else class="chat-container">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-participant">
              <div class="participant-avatar">
                <img 
                  v-if="selectedConversation.participant_avatar" 
                  :src="selectedConversation.participant_avatar" 
                  :alt="selectedConversation.participant_name"
                  class="avatar-img"
                />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(selectedConversation.participant_name) }}
                </div>
              </div>
              <div class="participant-info">
                <h3 class="participant-name">{{ selectedConversation.participant_name }}</h3>
                <p class="participant-status">
                  <span class="status-online">● Khách hàng</span>
                </p>
              </div>
            </div>
            
            <div class="chat-actions">
              <button 
                @click="viewCustomerProfile" 
                class="btn btn-sm btn-secondary"
                title="Xem thông tin khách hàng"
              >
                <User class="btn-icon" />
              </button>
            </div>
          </div>
          
          <!-- Messages Container -->
          <div 
            ref="messagesContainer"
            class="messages-container"
            @scroll="handleScroll"
          >
            <!-- Loading older messages -->
            <div v-if="isLoadingDetail && currentPage > 1" class="loading-more">
              <div class="loading-spinner"></div>
              <span class="loading-text">Đang tải tin nhắn cũ...</span>
            </div>

            <!-- Messages -->
            <div
              v-for="message in sortedMessages"
              :key="message.message_id"
              class="message-wrapper"
            >
              <div 
                class="message"
                :class="getMessageClass(message)"
              >
                <!-- Message content -->
                <div class="message-content">
                  {{ message.message_content }}
                </div>
                
                <!-- Message meta -->
                <div class="message-meta">
                  <span class="message-time">{{ formatMessageTime(message.sent_at) }}</span>
                  <span v-if="isMyMessage(message) && message.is_read" class="read-status">
                    ✓✓
                  </span>
                  <span v-else-if="isMyMessage(message)" class="sent-status">
                    ✓
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty messages state -->
            <div v-if="!isLoadingDetail && messages.length === 0" class="messages-empty-state">
              <MessageCircle class="empty-icon" />
              <p class="empty-text">Chưa có tin nhắn nào</p>
              <p class="empty-subtext">Hãy bắt đầu cuộc trò chuyện!</p>
            </div>

            <!-- Initial loading -->
            <div v-if="isLoadingDetail && currentPage === 1" class="messages-loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">Đang tải tin nhắn...</p>
            </div>
          </div>
          
          <!-- Message Input -->
          <div class="message-input-container">
            <div class="input-wrapper">
              <input
                v-model="newMessage"
                @keydown.enter.exact.prevent="sendMessage"
                @input="handleTyping"
                ref="messageInput"
                type="text"
                placeholder="Nhập tin nhắn để trả lời khách hàng..."
                class="message-input"
                :disabled="isSending"
              />
              
              <button
                @click="sendMessage"
                :disabled="!newMessage.trim() || isSending"
                class="send-button"
              >
                <Send v-if="!isSending" class="send-icon" />
                <div v-else class="loading-spinner"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Conversation Modal -->
    <div v-if="showNewConversationModal" class="modal-overlay" @click="closeNewConversationModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Bắt đầu cuộc trò chuyện mới</h3>
          <button @click="closeNewConversationModal" class="modal-close">
            <X class="close-icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Chọn khách hàng</label>
            <select v-model="selectedCustomerId" class="form-select">
              <option value="">-- Chọn khách hàng --</option>
              <option 
                v-for="customer in availableCustomers" 
                :key="customer.user_id" 
                :value="customer.user_id"
              >
                {{ customer.first_name }} {{ customer.last_name }} ({{ customer.email }})
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Tin nhắn đầu tiên</label>
            <textarea
              v-model="newConversationMessage"
              placeholder="Nhập tin nhắn để bắt đầu cuộc trò chuyện..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeNewConversationModal" class="btn btn-secondary">
            Hủy
          </button>
          <button 
            @click="createNewConversation" 
            :disabled="!selectedCustomerId || !newConversationMessage.trim() || isCreatingConversation"
            class="btn btn-primary"
          >
            <div v-if="isCreatingConversation" class="loading-spinner"></div>
            <span v-else>Bắt đầu trò chuyện</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { 
  MessageCircle, 
  RefreshCw, 
  Bell, 
  Users, 
  Clock, 
  Plus, 
  User, 
  Send, 
  X,
  Check
} from 'lucide-vue-next'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'

// Stores
const messageStore = useMessageStore()
const userStore = useUserStore()

// Local state
const isLoading = ref(false)
const selectedConversation = ref(null)
const newMessage = ref('')
const isSending = ref(false)
const currentPage = ref(1)
const messagesContainer = ref(null)
const messageInput = ref(null)
const showNewConversationModal = ref(false)
const selectedCustomerId = ref('')
const newConversationMessage = ref('')
const isCreatingConversation = ref(false)
const availableCustomers = ref([])

// Computed
const conversations = computed(() => messageStore.conversations)
const messages = computed(() => messageStore.currentConversationMessages)
const isLoadingDetail = computed(() => messageStore.isLoadingDetail)
const hasMoreMessages = computed(() => messageStore.currentConversationPagination?.hasMore || false)

const sortedConversations = computed(() => {
  return [...conversations.value].sort((a, b) => {
    return new Date(b.last_message_time) - new Date(a.last_message_time)
  })
})

const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => {
    return new Date(a.sent_at) - new Date(b.sent_at)
  })
})

const stats = computed(() => {
  const totalConversations = conversations.value.length
  const unreadMessages = conversations.value.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
  const activeUsers = conversations.value.length // Giả sử mỗi conversation là 1 user hoạt động
  const todayMessages = messages.value.filter(msg => {
    const today = new Date()
    const msgDate = new Date(msg.sent_at)
    return msgDate.toDateString() === today.toDateString()
  }).length

  return {
    totalConversations,
    unreadMessages,
    activeUsers,
    todayMessages
  }
})

const hasUnreadMessages = computed(() => stats.value.unreadMessages > 0)
const isMarkingAsRead = computed(() => messageStore.markingAsRead)

// Methods
const getCurrentUserId = () => {
  return messageStore.getCurrentUserId()
}

const isMyMessage = (message) => {
  const currentUserId = getCurrentUserId()
  return message.sender_id === currentUserId
}

const getMessageClass = (message) => {
  return isMyMessage(message) ? 'message-mine' : 'message-theirs'
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
  if (diffHours < 24) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (diffDays < 7) return date.toLocaleDateString('vi-VN', { weekday: 'short' })
  
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
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

const refreshMessages = async () => {
  isLoading.value = true
  await loadConversations()
  if (selectedConversation.value) {
    await loadMessages()
  }
  isLoading.value = false
}

const markAllAsRead = async () => {
  try {
    const result = await messageStore.markAllAsRead()
    if (result.success) {
      // Refresh conversations để cập nhật unread count
      await loadConversations()
      
      // Hiển thị thông báo thành công (có thể thêm toast notification)
    } else {
      console.error('❌ Lỗi khi đánh dấu đã đọc:', result.error)
      // Có thể hiển thị toast error
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

const loadConversations = async () => {
  const result = await messageStore.fetchConversations()
  if (!result.success) {
    console.error('Failed to load conversations:', result.error)
  }
}

const selectConversation = async (conversation) => {
  selectedConversation.value = conversation
  currentPage.value = 1
  
  // Join SignalR conversation group
  try {
    const { signalRService } = await import('@/services/signalRService')
    await signalRService.joinConversation(conversation.conversation_id)
  } catch (error) {
    console.warn('Failed to join SignalR conversation:', error)
  }
  
  // Load messages for this conversation
  await loadMessages()
}

const loadMessages = async () => {
  if (!selectedConversation.value) return
  
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return

  const result = await messageStore.fetchConversationDetail(
    currentUserId,
    selectedConversation.value.participant_id,
    1,
    100
  )
  
  if (result.success) {
    await nextTick()
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleScroll = async () => {
  const container = messagesContainer.value
  if (!container) return

  // Load more messages when scrolled to top
  if (container.scrollTop === 0 && hasMoreMessages.value && !isLoadingDetail.value) {
    const lastScrollHeight = container.scrollHeight
    
    const result = await messageStore.loadMoreMessages(
      selectedConversation.value.participant_id,
      getCurrentUserId()
    )

    if (result.success) {
      currentPage.value++
      await nextTick()
      const newScrollHeight = container.scrollHeight
      container.scrollTop = newScrollHeight - lastScrollHeight
    }
  }
}

const sendMessage = async () => {
  const content = newMessage.value.trim()
  if (!content || isSending.value || !selectedConversation.value) return

  isSending.value = true
  
  try {
    const result = await messageStore.sendMessage(selectedConversation.value.participant_id, content)
    
    if (result.success) {
      newMessage.value = ''
      
      // Scroll to bottom to show new message
      await nextTick()
      scrollToBottom()
      
      // Update conversation list
      await loadConversations()
    } else {
      console.error('Error sending message:', result.error)
    }
    
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    isSending.value = false
  }
}

const handleTyping = () => {
  // TODO: Implement typing indicator
}

const viewCustomerProfile = () => {
  if (selectedConversation.value) {
    // TODO: Implement customer profile view
  }
}

const startNewConversation = async () => {
  showNewConversationModal.value = true
  await loadAvailableCustomers()
}

const closeNewConversationModal = () => {
  showNewConversationModal.value = false
  selectedCustomerId.value = ''
  newConversationMessage.value = ''
}

const loadAvailableCustomers = async () => {
  try {
    // Load customers who don't have admin role
    await userStore.fetchUsers()
    availableCustomers.value = userStore.users.filter(user => user.role !== 'admin')
  } catch (error) {
    console.error('Error loading customers:', error)
  }
}

const createNewConversation = async () => {
  if (!selectedCustomerId.value || !newConversationMessage.value.trim()) return
  
  isCreatingConversation.value = true
  
  try {
    const result = await messageStore.sendMessage(selectedCustomerId.value, newConversationMessage.value.trim())
    
    if (result.success) {
      closeNewConversationModal()
      
      // Refresh conversations and select the new one
      await loadConversations()
      
      // Find and select the new conversation
      const newConversation = conversations.value.find(conv => 
        conv.participant_id === selectedCustomerId.value
      )
      
      if (newConversation) {
        await selectConversation(newConversation)
      }
    } else {
      console.error('Error creating conversation:', result.error)
    }
    
  } catch (error) {
    console.error('Error creating conversation:', error)
  } finally {
    isCreatingConversation.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadConversations()
  
  // Connect to SignalR for real-time messaging
  try {
    const { signalRService } = await import('@/services/signalRService')
    await signalRService.connect()
  } catch (error) {
    console.warn('AdminMessages: Failed to connect SignalR:', error)
  }
})

// Watch for new messages to auto-refresh conversations
watch(() => messageStore.conversations.length, (newLength, oldLength) => {
})

// Watch for message updates in current conversation
watch(() => messageStore.currentConversationMessages.length, async (newLength, oldLength) => {
  if (newLength > oldLength && selectedConversation.value) {
    await nextTick()
    scrollToBottom()
  }
})

// Watch for any changes in current conversation messages (not just length)
watch(() => messageStore.currentConversationMessages, async (newMessages, oldMessages) => {
  if (selectedConversation.value && newMessages.length > 0) {
    await nextTick()
    scrollToBottom()
  }
}, { deep: true })

// Watch for currentConversationMessages array reference changes
watch(() => [...messageStore.currentConversationMessages], async () => {
  if (selectedConversation.value) {
    await nextTick()
    scrollToBottom()
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
/* Page layout */
.admin-messages {
  max-width: 100%;
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
}

.dark .page-title {
  color: rgb(243, 244, 246);
}

.page-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  transition: color 0.3s ease;
}

.dark .page-subtitle {
  color: rgb(156, 163, 175);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.dark .stat-card {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: #dbeafe;
  color: #2563eb;
}

.stat-icon-warning {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon-success {
  background: #d1fae5;
  color: #059669;
}

.stat-icon-info {
  background: #e0e7ff;
  color: #7c3aed;
}

.stat-icon-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  transition: color 0.3s ease;
}

.dark .stat-label {
  color: rgb(156, 163, 175);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  transition: color 0.3s ease;
}

.dark .stat-value {
  color: rgb(243, 244, 246);
}

/* Messages Layout */
.messages-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  height: calc(100vh - 320px);
  min-height: 600px;
}

/* Conversations Panel */
.conversations-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark .conversations-panel {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
}

.panel-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .panel-header {
  border-bottom-color: rgb(55, 65, 81);
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dark .panel-title {
  color: rgb(243, 244, 246);
}

.panel-actions {
  display: flex;
  gap: 0.5rem;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dark .conversation-item {
  border-bottom-color: rgb(55, 65, 81);
}

.conversation-item:hover {
  background: #f9fafb;
}

.dark .conversation-item:hover {
  background: rgb(55, 65, 81);
}

.conversation-item.active {
  background: #eff6ff;
  border-left: 3px solid #2563eb;
}

.dark .conversation-item.active {
  background: rgb(30, 64, 175, 0.1);
}

.conversation-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6b7280;
}

.dark .avatar-placeholder {
  background: rgb(55, 65, 81);
  color: rgb(156, 163, 175);
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.participant-name {
  font-weight: 600;
  color: #111827;
  margin: 0;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .participant-name {
  color: rgb(243, 244, 246);
}

.message-time {
  font-size: 0.75rem;
  color: #6b7280;
  flex-shrink: 0;
}

.dark .message-time {
  color: rgb(156, 163, 175);
}

.conversation-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.dark .last-message {
  color: rgb(156, 163, 175);
}

.sender-prefix {
  font-weight: 500;
  color: #2563eb;
}

.conversation-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  text-align: center;
}

/* Chat Panel */
.chat-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark .chat-panel {
  background: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
}

.chat-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.dark .empty-title {
  color: rgb(243, 244, 246);
}

.empty-text {
  color: #6b7280;
  margin: 0;
}

.dark .empty-text {
  color: rgb(156, 163, 175);
}

.empty-subtext {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0.5rem 0 0 0;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .chat-header {
  border-bottom-color: rgb(55, 65, 81);
}

.chat-participant {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.participant-avatar .avatar-img {
  width: 2.5rem;
  height: 2.5rem;
}

.participant-avatar .avatar-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 0.875rem;
}

.participant-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.125rem 0;
}

.dark .participant-info h3 {
  color: rgb(243, 244, 246);
}

.participant-status {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.dark .participant-status {
  color: rgb(156, 163, 175);
}

.status-online {
  color: #059669;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.message-wrapper {
  display: flex;
}

.message {
  max-width: 70%;
  word-wrap: break-word;
}

.message-mine {
  margin-left: auto;
}

.message-theirs {
  margin-right: auto;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.message-mine .message-content {
  background: #2563eb;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message-theirs .message-content {
  background: #f3f4f6;
  color: #111827;
  border-bottom-left-radius: 0.25rem;
}

.dark .message-theirs .message-content {
  background: rgb(55, 65, 81);
  color: rgb(243, 244, 246);
}

.message-meta {
  padding: 0.25rem 0.5rem 0;
  font-size: 0.75rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.message-mine .message-meta {
  justify-content: flex-end;
}

.message-theirs .message-meta {
  justify-content: flex-start;
}

.read-status {
  color: #2563eb;
}

.sent-status {
  color: #9ca3af;
}

.messages-empty-state,
.messages-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

/* Message Input */
.message-input-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.dark .message-input-container {
  border-top-color: rgb(55, 65, 81);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 1.5rem;
  border: 1px solid #e5e7eb;
}

.dark .input-wrapper {
  background: rgb(55, 65, 81);
  border-color: rgb(75, 85, 99);
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
}

.dark .message-input {
  color: rgb(243, 244, 246);
}

.message-input::placeholder {
  color: #9ca3af;
}

.send-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: #1d4ed8;
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-icon {
  width: 1rem;
  height: 1rem;
}

/* Loading states */
.loading-state,
.loading-more,
.messages-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.875rem;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-outline-primary {
  background: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
}

.btn-outline-primary:hover:not(:disabled) {
  background: #2563eb;
  color: white;
}

.btn-outline-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.dark .modal-content {
  background: rgb(31, 41, 55);
  border: 1px solid rgb(55, 65, 81);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .modal-header {
  border-bottom-color: rgb(55, 65, 81);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dark .modal-title {
  color: rgb(243, 244, 246);
}

.modal-close {
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dark .modal-close {
  background: rgb(55, 65, 81);
}

.modal-close:hover {
  background: #e5e7eb;
}

.dark .modal-close:hover {
  background: rgb(75, 85, 99);
}

.close-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.dark .close-icon {
  color: rgb(156, 163, 175);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.dark .modal-footer {
  border-top-color: rgb(55, 65, 81);
}

/* Form */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dark .form-label {
  color: rgb(209, 213, 219);
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  background: white;
  transition: border-color 0.2s ease;
}

.dark .form-select,
.dark .form-textarea {
  background: rgb(55, 65, 81);
  border-color: rgb(75, 85, 99);
  color: rgb(243, 244, 246);
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2563eb;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Responsive */
@media (max-width: 1024px) {
  .messages-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: calc(100vh - 280px);
  }
  
  .conversations-panel {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .messages-layout {
    height: calc(100vh - 240px);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .messages-layout {
    gap: 1rem;
    height: calc(100vh - 220px);
  }
  
  .modal-content {
    margin: 0.5rem;
    max-width: none;
    width: calc(100% - 1rem);
  }
}

/* Dark mode adjustments */
.dark .loading-state,
.dark .loading-more,
.dark .messages-loading {
  color: rgb(156, 163, 175);
}

.dark .btn-secondary {
  background: rgb(55, 65, 81);
  color: rgb(209, 213, 219);
}

.dark .btn-secondary:hover:not(:disabled) {
  background: rgb(75, 85, 99);
}

/* Scrollbar styling */
.conversations-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.conversations-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.dark .conversations-list::-webkit-scrollbar-track,
.dark .messages-container::-webkit-scrollbar-track {
  background: rgb(55, 65, 81);
}

.conversations-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.dark .conversations-list::-webkit-scrollbar-thumb,
.dark .messages-container::-webkit-scrollbar-thumb {
  background: rgb(75, 85, 99);
}

.conversations-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .conversations-list::-webkit-scrollbar-thumb:hover,
.dark .messages-container::-webkit-scrollbar-thumb:hover {
  background: rgb(107, 114, 128);
}
</style>
