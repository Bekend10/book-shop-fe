import { defineStore } from 'pinia'
import axios from 'axios'

// Tạo instance axios riêng cho realtime API
const realtimeAxios = axios.create({
  baseURL: import.meta.env.VITE_API_REALTIME_URL,
})

// Request interceptor để thêm token
realtimeAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useMessageStore = defineStore('message', {
  state: () => ({
    conversations: [],
    currentConversationMessages: [], // Chi tiết tin nhắn của conversation hiện tại
    currentConversationPagination: null, // Thông tin phân trang
    currentConversationId: null, // ID của conversation đang xem
    currentConversationPartnerId: null, // Partner ID của conversation đang xem
    isLoading: false,
    isLoadingDetail: false, // Loading cho conversation detail
    error: null,
    unreadCount: 0,
    isConnected: false,
    markingAsRead: false,
    onlineUsers: {}, // Tracking online status của users - sử dụng object thay vì Map để reactive
    typingUsers: {} // Tracking typing status của users theo conversation - sử dụng object thay vì Map
  }),

  getters: {
    hasUnreadMessages: (state) => state.unreadCount > 0,
    
    sortedConversations: (state) => {
      return [...state.conversations].sort((a, b) => {
        return new Date(b.last_message_time) - new Date(a.last_message_time)
      })
    },

    // Check if a user is online
    isUserOnline: (state) => (userId) => {
      const userIdStr = String(userId)
      const isOnline = state.onlineUsers[userIdStr] || false
      return isOnline
    },

    // Check if a user is typing in a conversation
    isUserTyping: (state) => (userId, conversationId) => {
      const key = `${userId}_${conversationId}`
      return state.typingUsers[key] || false
    }
  },

  actions: {
    async fetchConversations() {
      this.isLoading = true
      this.error = null
      
      try {
        // Lấy userId từ localStorage
        const userStr = localStorage.getItem('user')
        let userId = null
        
        if (userStr && userStr !== "undefined") {
          try {
            const user = JSON.parse(userStr)
            userId = user?.user_id || user?.id
          } catch (error) {
            console.warn('Failed to parse user data:', error)
          }
        }
        
        if (!userId) {
          throw new Error('Không tìm thấy thông tin người dùng')
        }
        
        
        const response = await realtimeAxios.post('/messages/my-conversations', {
          userId: userId
        })
        
        if (response.status >= 200 && response.status < 300) {
          // Xử lý response data - chuyển đổi format từ messages thành conversations
          const messages = response.data || []
            
          // Group messages by conversation (sender/receiver pair)
          const conversationMap = new Map()
          
          messages.forEach(message => {
            // Xác định conversation partner (người còn lại trong cuộc trò chuyện)
            const isCurrentUserSender = message.sender_id === userId
            const partnerId = isCurrentUserSender ? message.receiver_id : message.sender_id
            const partnerName = isCurrentUserSender ? message.receiver_snapshot_name : message.sender_snapshot_name
            
            const conversationKey = `${Math.min(userId, partnerId)}-${Math.max(userId, partnerId)}`
            
            if (!conversationMap.has(conversationKey)) {
              conversationMap.set(conversationKey, {
                conversation_id: conversationKey,
                participant_id: partnerId,
                participant_name: partnerName,
                participant_avatar: null, // API không có avatar
                last_message: message.message_content,
                last_message_time: message.sent_at,
                last_message_sender_name: message.sender_snapshot_name, // Tên người gửi tin nhắn cuối
                unread_count: !message.is_read && !isCurrentUserSender ? 1 : 0,
                latest_message_id: message.message_id
              })
            } else {
              // Cập nhật conversation với tin nhắn mới nhất
              const existing = conversationMap.get(conversationKey)
              if (new Date(message.sent_at) > new Date(existing.last_message_time)) {
                existing.last_message = message.message_content
                existing.last_message_time = message.sent_at
                existing.last_message_sender_name = message.sender_snapshot_name // Cập nhật tên người gửi tin nhắn mới nhất
                existing.latest_message_id = message.message_id
              }
              
              // Đếm tin nhắn chưa đọc (chỉ từ partner)
              if (!message.is_read && !isCurrentUserSender) {
                existing.unread_count += 1
              }
            }
          })
          
          this.conversations = Array.from(conversationMap.values())
          this.updateUnreadCount()
          return { success: true, data: this.conversations }
        } else {
          throw new Error(response.data.message || 'Không thể tải tin nhắn')
        }
      } catch (err) {
        console.error('Fetch conversations error:', err)
        this.error = err.response?.data?.message || err.message || 'Lỗi khi tải tin nhắn'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Method để refresh conversations khi có tin nhắn mới từ SignalR
    async refreshConversations() {
      const result = await this.fetchConversations()
      if (result.success) {
      } else {
        console.warn('❌ Failed to refresh conversations:', result.error)
      }
      return result
    },

    // Method để refresh current conversation messages khi có tin nhắn mới
    async refreshCurrentConversationMessages() {
      if (!this.currentConversationPartnerId) {
        console.warn('❌ No current conversation to refresh')
        return { success: false, error: 'No current conversation' }
      }
      
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        return { success: false, error: 'No user info' }
      }

      const user = JSON.parse(userStr)
      const currentUserId = user.user_id || user.id

      if (!currentUserId) {
        return { success: false, error: 'No current user ID' }
      }

      // Lưu current messages count để so sánh
      const beforeCount = this.currentConversationMessages.length

      // Gọi API để lấy tin nhắn giữa current user và partner
      // Sử dụng currentUserId làm senderId để consistent với logic khác
      const result = await this.fetchConversationDetail(
        currentUserId,                     // Current user làm sender
        this.currentConversationPartnerId, // Partner làm receiver  
        1,
        100
      )

      if (result.success) {
        const afterCount = this.currentConversationMessages.length
        
        // Force reactivity by creating new array reference
        this.currentConversationMessages = [...this.currentConversationMessages]
      } else {
        console.warn('❌ Failed to refresh current conversation messages:', result.error)
      }

      return result
    },

    async fetchConversationDetail(senderId, receiverId, page = 1, pageSize = 100) {
      this.isLoadingDetail = true
      
      try {
        // Set currentConversationPartnerId dựa trên receiverId (người nhận)
        // Chỉ set nếu chưa có để tránh ghi đè khi refresh
        if (!this.currentConversationPartnerId) {
          this.currentConversationPartnerId = receiverId
        }          
        
        const response = await realtimeAxios.get('/messages/conversations', {
          params: {
            senderId: senderId,
            receiverId: receiverId,
            page: page,
            pageSize: pageSize
          }
        })
                
        if (response.status >= 200 && response.status < 300) {
          const messages = response.data || []
          
          // Nếu là trang đầu tiên, thay thế toàn bộ
          if (page === 1) {
            this.currentConversationMessages = messages
          } else {
            // Nếu là trang tiếp theo, thêm vào đầu array (tin nhắn cũ hơn)
            this.currentConversationMessages = [...messages, ...this.currentConversationMessages]
          }
          
          this.currentConversationPagination = {
            page: page,
            pageSize: pageSize,
            hasMore: messages.length === pageSize
          }
          
          return { 
            success: true, 
            data: messages,
            pagination: this.currentConversationPagination
          }
        } else {
          throw new Error(response.data.message || 'Không thể tải chi tiết cuộc hội thoại')
        }
      } catch (err) {
        console.error('Fetch conversation detail error:', err)
        return { 
          success: false, 
          error: err.response?.data?.message || err.message || 'Lỗi khi tải chi tiết cuộc hội thoại' 
        }
      } finally {
        this.isLoadingDetail = false
      }
    },

    async markAllAsRead() {
      this.markingAsRead = true
      
      try {
        const userId = this.getCurrentUserId()
        if (!userId) {
          throw new Error('Không tìm thấy thông tin người dùng')
        }

        const response = await realtimeAxios.post('/messages/mark-all-as-read', {
          userId
        })
        
        if (response.status >= 200 && response.status < 300) {
          // Cập nhật local state
          this.conversations = this.conversations.map(conv => ({
            ...conv,
            unread_count: 0,
            is_read: true
          }))
          this.unreadCount = 0
          return { success: true }
        } else {
          throw new Error(response.data.message || 'Không thể đánh dấu đã đọc')
        }
      } catch (err) {
        console.error('Mark all as read error:', err)
        this.error = err.response?.data?.message || err.message
        return { success: false, error: this.error }
      } finally {
        this.markingAsRead = false
      }
    },

    updateUnreadCount() {
      this.unreadCount = this.conversations.reduce((total, conv) => {
        return total + (conv.unread_count || 0)
      }, 0)
    },

    addNewMessage(message) {      
      // Lấy userId từ localStorage
      const userStr = localStorage.getItem('user')
      let userId = null
      
      if (userStr && userStr !== "undefined") {
        try {
          const user = JSON.parse(userStr)
          userId = user?.user_id || user?.id
        } catch (error) {
          console.warn('Failed to parse user data:', error)
          return
        }
      }
      
      if (!userId) {
        console.warn('No userId found, cannot process message')
        return
      }
            
      // Xác định conversation partner
      const isCurrentUserSender = message.sender_id === userId
      const partnerId = isCurrentUserSender ? message.receiver_id : message.sender_id
      const partnerName = isCurrentUserSender ? message.receiver_snapshot_name : message.sender_snapshot_name
      const conversationKey = `${Math.min(userId, partnerId)}-${Math.max(userId, partnerId)}`
      
      
      // Thêm tin nhắn vào conversation detail hiện tại nếu đang xem
      if (this.currentConversationMessages.length >= 0) {
        const isCurrentConversation = 
          (message.sender_id === userId && message.receiver_id === partnerId) ||
          (message.sender_id === partnerId && message.receiver_id === userId)
         
        
        if (isCurrentConversation) {
          // Kiểm tra tin nhắn đã tồn tại chưa để tránh duplicate
          const existingMessage = this.currentConversationMessages.find(
            msg => msg.message_id === message.message_id || 
                   (msg.message_content === message.message_content && 
                    msg.sender_id === message.sender_id && 
                    Math.abs(new Date(msg.sent_at) - new Date(message.sent_at)) < 5000)
          )
          
          if (!existingMessage) {
            this.currentConversationMessages.push(message)
          }
        }
      }
      
      // Tìm conversation tương ứng
      const convIndex = this.conversations.findIndex(
        conv => conv.conversation_id === conversationKey
      )
      
      if (convIndex !== -1) {
        // Cập nhật conversation hiện có
        this.conversations[convIndex] = {
          ...this.conversations[convIndex],
          last_message: message.message_content,
          last_message_time: message.sent_at,
          last_message_sender_name: message.sender_snapshot_name,
          unread_count: !message.is_read && !isCurrentUserSender 
            ? (this.conversations[convIndex].unread_count || 0) + 1 
            : this.conversations[convIndex].unread_count || 0,
          latest_message_id: message.message_id
        }
      } else {
        // Thêm conversation mới
        this.conversations.unshift({
          conversation_id: conversationKey,
          participant_id: partnerId,
          participant_name: partnerName,
          participant_avatar: null,
          last_message: message.message_content,
          last_message_time: message.sent_at,
          last_message_sender_name: message.sender_snapshot_name,
          unread_count: !message.is_read && !isCurrentUserSender ? 1 : 0,
          latest_message_id: message.message_id
        })
      }
      
      this.updateUnreadCount()
    },

    setConnectionStatus(status) {
      this.isConnected = status
    },

    clearMessages() {
      this.conversations = []
      this.currentConversationMessages = []
      this.currentConversationPagination = null
      this.unreadCount = 0
      this.error = null
      this.isConnected = false
    },

    clearCurrentConversation() {
      this.currentConversationMessages = []
      this.currentConversationPagination = null
    },

    async loadMoreMessages(senderId, receiverId) {
      if (!this.currentConversationPagination?.hasMore || this.isLoadingDetail) {
        return { success: false, error: 'Không thể tải thêm tin nhắn' }
      }
      
      const nextPage = this.currentConversationPagination.page + 1
      return await this.fetchConversationDetail(senderId, receiverId, nextPage, this.currentConversationPagination.pageSize)
    },

    async sendMessage(receiverId, content) {
      try {
        const currentUserId = this.getCurrentUserId()
        if (!currentUserId) {
          throw new Error('Không thể xác định người gửi')
        }

        const response = await realtimeAxios.post('/messages/send-mess-to-user', {
          sender_id: currentUserId,
          receiver_id: receiverId,
          message_content: content
        })
        
        if (response.status >= 200 && response.status < 300) {
          const messageData = response.data
          
          // Tạo message object với format chuẩn
          const newMessage = {
            message_id: messageData.message_id || Date.now(), // Fallback nếu API không trả về ID
            sender_id: currentUserId,
            receiver_id: receiverId,
            message_content: content,
            sent_at: messageData.sent_at || new Date().toISOString(),
            is_read: false,
            sender_snapshot_name: messageData.sender_snapshot_name || 'Bạn'
          }
          
          // Add message to current conversation immediately for realtime effect
          if (this.currentConversationMessages.length >= 0) {
            const isCurrentConversation = 
              (newMessage.sender_id === currentUserId && newMessage.receiver_id === receiverId) ||
              (newMessage.sender_id === receiverId && newMessage.receiver_id === currentUserId)
            
            if (isCurrentConversation) {
              // Add to current conversation messages for immediate display
              this.currentConversationMessages.push(newMessage)
            }
          }
          
          // Update conversations list
          this.addNewMessage(newMessage)
          
          return { success: true, data: newMessage }
        } else {
          throw new Error(response.data.message || 'Không thể gửi tin nhắn')
        }
      } catch (err) {
        console.error('Send message error:', err)
        return { 
          success: false, 
          error: err.response?.data?.message || err.message || 'Lỗi khi gửi tin nhắn' 
        }
      }
    },

    getCurrentUserId() {
      const userStr = localStorage.getItem('user')
      if (userStr && userStr !== "undefined") {
        try {
          const user = JSON.parse(userStr)
          return user?.user_id || user?.id
        } catch (error) {
          console.warn('Failed to parse user data:', error)
        }
      }
      return null
    },

    // Online status management
    setUserOnlineStatus(userId, isOnline) {
      const userIdStr = String(userId)
      this.onlineUsers[userIdStr] = isOnline
    },

    // Typing status management
    setTypingStatus(userId, conversationId, isTyping) {
      const key = `${userId}_${conversationId}`
      if (isTyping) {
        this.typingUsers[key] = true
        // Auto clear after 5 seconds
        setTimeout(() => {
          this.typingUsers[key] = false
        }, 5000)
      } else {
        this.typingUsers[key] = false
      }
    },

    // Clear all typing status for a conversation
    clearTypingForConversation(conversationId) {
      for (const key in this.typingUsers) {
        if (key.endsWith(`_${conversationId}`)) {
          this.typingUsers[key] = false
        }
      }
    }
  }
})
