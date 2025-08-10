import * as signalR from '@microsoft/signalr'
import { useMessageStore } from '@/stores/messageStore'

class SignalRService {
  constructor() {
    this.connection = null
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

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
  }

  async connect() {
    if (this.isConnecting || (this.connection && this.connection.state === signalR.HubConnectionState.Connected)) {
      return { success: true, message: 'Already connected or connecting' }
    }

    this.isConnecting = true
    const messageStore = useMessageStore()

    try {
      const token = localStorage.getItem('access_token')
      const userStr = localStorage.getItem('user')
      
      if (!token) {
        console.warn('⚠️ Không có token, không thể kết nối SignalR')
        return { success: false, error: 'No token' }
      }

      if (!userStr) {
        console.warn('⚠️ Không có thông tin user, không thể kết nối SignalR')
        return { success: false, error: 'No user info' }
      }

      const user = JSON.parse(userStr)
      const userId = user.user_id || user.id 
      
      if (!userId) {
        console.warn('⚠️ Không có userId, không thể kết nối SignalR')
        return { success: false, error: 'No userId' }
      }


      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_REALTIME_URL.replace('/api/v1', '')}/hubs/notification?userId=${userId}`, {
          accessTokenFactory: () => token,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            if (retryContext.previousRetryCount < 3) {
              return Math.random() * 10000
            } else {
              return null // Dừng retry
            }
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Lắng nghe sự kiện nhận tin nhắn mới
      this.connection.on('ReceiveMessage', async (message) => {
        
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const currentUserId = currentUser.user_id || currentUser.id
        
        // Backend chỉ gửi message_content (string), không phải full object
        if (typeof message === 'string') {
          
          // Luôn reload conversations để cập nhật danh sách và unread count
          await messageStore.refreshConversations()
          
          // Nếu đang xem conversation và có partner ID, reload current messages 
          if (messageStore.currentConversationPartnerId) {
            await messageStore.refreshCurrentConversationMessages()
          } else {
          }
        } else {
          // Nếu là full object thì xử lý như cũ
          messageStore.addNewMessage(message)
        }
        
        // Hiển thị notification
        this.showNotification({ content: message, sender_name: 'Khách hàng' })
      })

      // Lắng nghe sự kiện tin nhắn đã gửi (cho sender)
      this.connection.on('MessageSent', async (message) => {
        
        // Reload conversations và current messages để cập nhật UI
        if (typeof message === 'string') {
          await messageStore.refreshConversations()
          
          // Nếu đang xem conversation, refresh current messages
          if (messageStore.currentConversationPartnerId) {
            await messageStore.refreshCurrentConversationMessages()
          }
        }
      })

      // Lắng nghe trạng thái online/offline
      this.connection.on('UserOnline', (userId) => {
        messageStore.setUserOnlineStatus(userId, true)
      })

      this.connection.on('UserOffline', (userId) => {
        messageStore.setUserOnlineStatus(userId, false)
      })

      // Lắng nghe typing indicators
      this.connection.on('UserStartedTyping', (userId, conversationId) => {
        
        // Không hiển thị typing indicator cho chính mình
        const currentUserId = this.getCurrentUserId()
        if (userId !== currentUserId) {
          messageStore.setTypingStatus(userId, conversationId, true)
        }
      })

      this.connection.on('UserStoppedTyping', (userId, conversationId) => {
        
        // Không hiển thị typing indicator cho chính mình
        const currentUserId = this.getCurrentUserId()
        if (userId !== currentUserId) {
          messageStore.setTypingStatus(userId, conversationId, false)
        }
      })

      // Sự kiện kết nối thành công
      this.connection.onreconnected(() => {
        messageStore.setConnectionStatus(true)
        this.reconnectAttempts = 0
      })

      // Sự kiện mất kết nối
      this.connection.onclose((error) => {
        console.log('SignalR ngắt kết nối:', error)
        messageStore.setConnectionStatus(false)
        this.isConnecting = false
      })

      await this.connection.start()
      console.log('SignalR đã kết nối thành công')
      
   
      messageStore.setConnectionStatus(true)
      this.reconnectAttempts = 0

      return { success: true }

    } catch (error) {
      console.error('Lỗi kết nối SignalR:', error)
      messageStore.setConnectionStatus(false)
      this.reconnectAttempts++
      
      // Retry sau một khoảng thời gian
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.connect()
        }, 5000 * this.reconnectAttempts)
      }

      return { success: false, error: error.message }
    } finally {
      this.isConnecting = false
    }
  }

  async disconnect() {
    if (this.connection) {
      const messageStore = useMessageStore()
      
      try {
        await this.connection.stop()
        console.log('SignalR đã ngắt kết nối')
        messageStore.setConnectionStatus(false)
      } catch (error) {
        console.error('Lỗi khi ngắt kết nối SignalR:', error)
      }
      
      this.connection = null
      this.isConnecting = false
      this.reconnectAttempts = 0
    }
  }

  async sendMessage(conversationId, content) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendMessage', conversationId, content)
        return { success: true }
      } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error)
        return { success: false, error: error.message }
      }
    } else {
      return { success: false, error: 'Chưa kết nối tới server' }
    }
  }

  async startTyping(conversationId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          console.error('❌ StartTyping - No userId found')
          return { success: false, error: 'Không tìm thấy thông tin người dùng' }
        }
        
        // Ensure both parameters are strings
        const conversationIdStr = String(conversationId)
        const userIdStr = String(userId)
        
        await this.connection.invoke('StartTyping', conversationIdStr, userIdStr)
        return { success: true }
      } catch (error) {
        console.error('❌ Lỗi gửi typing indicator:', error)
        return { success: false, error: error.message }
      }
    } else {
      console.error('❌ StartTyping - Not connected to SignalR')
      return { success: false, error: 'Chưa kết nối tới server' }
    }
  }

  async stopTyping(conversationId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          console.error('❌ StopTyping - No userId found')
          return { success: false, error: 'Không tìm thấy thông tin người dùng' }
        }
        
        // Ensure both parameters are strings
        const conversationIdStr = String(conversationId)
        const userIdStr = String(userId)
        
        await this.connection.invoke('StopTyping', conversationIdStr, userIdStr)
        return { success: true }
      } catch (error) {
        console.error('❌ Lỗi gửi stop typing indicator:', error)
        return { success: false, error: error.message }
      }
    } else {
      console.error('❌ StopTyping - Not connected to SignalR')
      return { success: false, error: 'Chưa kết nối tới server' }
    }
  }

  async joinConversation(conversationId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinConversation', conversationId)
        return { success: true }
      } catch (error) {
        console.error('Lỗi join conversation:', error)
        return { success: false, error: error.message }
      }
    } else {
      return { success: false, error: 'Chưa kết nối tới server' }
    }
  }

  async leaveConversation(conversationId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveConversation', conversationId)
        return { success: true }
      } catch (error) {
        console.error('Lỗi leave conversation:', error)
        return { success: false, error: error.message }
      }
    } else {
      return { success: false, error: 'Chưa kết nối tới server' }
    }
  }

  showNotification(message) {
    // Kiểm tra permission notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const senderName = message.sender_name || 'Khách hàng'
      const content = message.content || message || 'Tin nhắn mới'
      
      new Notification(`Tin nhắn mới từ ${senderName}`, {
        body: content,
        icon: '/favicon.ico',
        tag: `message-${message.conversation_id || 'unknown'}`
      })
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  getConnectionState() {
    return this.connection ? this.connection.state : signalR.HubConnectionState.Disconnected
  }

  isConnected() {
    return this.connection && this.connection.state === signalR.HubConnectionState.Connected
  }
}

// Tạo singleton instance
export const signalRService = new SignalRService()

export default signalRService
