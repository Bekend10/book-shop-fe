import { defineStore } from "pinia";
import axios from "@/utils/axios";
import { mockAuth } from "@/utils/mockAuth";
import { useToastStore } from "@/stores/toastStore";
import { useCartStore } from "@/stores/cartStore";
import { useNotificationStore } from "@/stores/notificationStore";
// Sử dụng mock API cho development
var USE_MOCK_API = false;

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: (() => {
      try {
        const userData = localStorage.getItem("user");
        return userData && userData !== "undefined" ? JSON.parse(userData) : null;
      } catch (error) {
        console.warn("Failed to parse user data from localStorage:", error);
        return null;
      }
    })(),
    token: localStorage.getItem("access_token") || null,
    refreshToken: localStorage.getItem("refresh_token") || null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "admin",
  },

  actions: {
    async login(credentials) {
      this.isLoading = true;
      this.error = null;

      try {
        const toastStore = useToastStore();

        let response;
        if (USE_MOCK_API) {
          const data = await mockAuth.login(credentials);
          response = { data };
        } else {
          response = await axios.post("/accounts/login", credentials);
        }

        this.token = response.data.access_token;
        this.refreshToken = response.data.refresh_token;
        this.user = response.data.user;

        localStorage.setItem("access_token", response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Fetch cart after successful login
        const cartStore = useCartStore();
        await cartStore.initializeCart();

        // Initialize notifications
        try {
          const notificationStore = useNotificationStore();
          await notificationStore.initializeNotifications();
        } catch (error) {
          console.warn('Failed to initialize notifications:', error);
        }

        // Connect to SignalR for real-time messaging
        try {
          const { signalRService } = await import('@/services/signalRService');
          await signalRService.connect();
        } catch (error) {
          console.warn('Failed to connect SignalR:', error);
        }

        return {
          success: true,
          status: response.status,
          message: response.data.msg,
          data: response.data,
        };
      } catch (error) {
        const msg = error.response?.data?.msg || "Đăng nhập thất bại";
        this.error = msg;

        return { success: false, error: msg, status: error.response?.status };
      } finally {
        this.isLoading = false;
      }
    },

    async register(userData) {
      this.isLoading = true;
      this.error = null;

      try {
        let response;

        if (USE_MOCK_API) {
          // Sử dụng mock API
          const data = await mockAuth.register(userData);
          response = { data };
        } else {
          // Gọi API thật
          response = await axios.post("/accounts/register", userData);
        }
        // Lưu token và thông tin user
        this.token = response.data.access_token;
        this.refreshToken = response.data.refresh_token;
        this.user = response.data.user;

        localStorage.setItem("access_token", response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        localStorage.setItem("user", JSON.stringify(response.data.user));

        return {
          success: true,
          status: response.status,
          message: response.data.msg,
          data: response.data,
        };
      } catch (error) {
        this.error =
          error.message || error.response?.data?.msg || "Đăng ký thất bại";
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        if (!USE_MOCK_API) {
          // Gọi API logout nếu cần
          await axios.post("/accounts/logout");
        }
      } catch (error) {
        console.error("Logout API error:", error);
      } finally {
        // Clear state
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.error = null;

        // Clear localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        
        // Note: Không xóa remembered_email và remembered_password
        // để giữ tính năng "ghi nhớ đăng nhập"

        // Clear cart data
        const cartStore = useCartStore();
        cartStore.clearCartData();

        // Disconnect SignalR
        try {
          const { signalRService } = await import('@/services/signalRService');
          await signalRService.disconnect();
        } catch (error) {
          console.warn('Failed to disconnect SignalR:', error);
        }

        // Clear message store
        try {
          const { useMessageStore } = await import('@/stores/messageStore');
          const messageStore = useMessageStore();
          messageStore.clearMessages();
        } catch (error) {
          console.warn('Failed to clear message store:', error);
        }
      }
    },

    // Method để xóa thông tin ghi nhớ đăng nhập
    clearRememberedCredentials() {
      localStorage.removeItem("remembered_email");
      localStorage.removeItem("remembered_password"); // Legacy
      localStorage.removeItem("remembered_password_hash");
      localStorage.removeItem("remembered_salt");
    },

    async refreshToken() {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        // Sử dụng axios trực tiếp để tránh interceptor loop
        const axiosInstance = (await import('@/utils/axios')).default;
        
        const response = await axiosInstance.create({
          baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7096/api/v1'
        }).post("/accounts/refresh-token", {
          refresh_token: this.refreshToken
        });

        // Cập nhật token mới
        this.token = response.data.access_token;
        if (response.data.refresh_token) {
          this.refreshToken = response.data.refresh_token;
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        localStorage.setItem("access_token", response.data.access_token);

        return {
          success: true,
          access_token: response.data.access_token
        };
      } catch (error) {
        // Nếu refresh token cũng hết hạn, logout user
        console.error('Refresh token failed:', error);
        await this.logout();
        throw error;
      }
    },

    async loginWithGoogle(googleData) {
      this.isLoading = true;
      this.error = null;

      try {
        let response;

        if (USE_MOCK_API) {
          // Mock Google login response
          const data = {
            access_token: "mock-google-token-" + Date.now(),
            user: {
              user_id: Math.floor(Math.random() * 1000),
              email: googleData.email,
              name: googleData.name,
              avatar: googleData.avatar,
              role: "customer",
              provider: "google",
            },
            msg: "Đăng nhập Google thành công",
          };
          response = { data };
        } else {
          // Call real API endpoint for Google authentication
          response = await axios.post("/accounts/google-login", {
            token: googleData.token,
          });
        }

        this.token = response.data.access_token;
        this.refreshToken = response.data.refresh_token;
        this.user = response.data.user;

        localStorage.setItem("access_token", response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Fetch cart after successful Google login
        const cartStore = useCartStore();
        await cartStore.initializeCart();

        // Initialize notifications
        try {
          const notificationStore = useNotificationStore();
          await notificationStore.initializeNotifications();
        } catch (error) {
          console.warn('Failed to initialize notifications:', error);
        }

        // Connect to SignalR for real-time messaging
        try {
          const { signalRService } = await import('@/services/signalRService');
          await signalRService.connect();
        } catch (error) {
          console.warn('Failed to connect SignalR:', error);
        }

        return {
          success: true,
          status: response.status,
          message: response.data.msg,
          data: response.data,
        };
      } catch (error) {
        const msg = error.response?.data?.msg || "Đăng nhập Google thất bại";
        this.error = msg;

        return { success: false, error: msg, status: error.response?.status };
      } finally {
        this.isLoading = false;
      }
    },

    async loginWithFacebook({ token }) {
      try {
        const res = await axios.post("/accounts/login-facebook", { token });
        this.token = res.data.access_token;
        this.refreshToken = res.data.refresh_token;
        this.user = res.data.user;

        localStorage.setItem("access_token", res.data.access_token);
        if (res.data.refresh_token) {
          localStorage.setItem("refresh_token", res.data.refresh_token);
        }
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Fetch cart after successful Facebook login
        const cartStore = useCartStore();
        await cartStore.initializeCart();

        // Initialize notifications
        try {
          const notificationStore = useNotificationStore();
          await notificationStore.initializeNotifications();
        } catch (error) {
          console.warn('Failed to initialize notifications:', error);
        }

        // Connect to SignalR for real-time messaging
        try {
          const { signalRService } = await import('@/services/signalRService');
          await signalRService.connect();
        } catch (error) {
          console.warn('Failed to connect SignalR:', error);
        }

        return { success: true, data: res.data };
      } catch (error) {
        return { success: false, data: error.response?.data };
      }
    },

    async fetchUserProfile() {
      if (!this.token) return;

      try {
        let response;
        var id = this.user?.user_id || -1;
        if (USE_MOCK_API) {
          // Sử dụng mock API
          const data = await mockAuth.getProfile(this.token);
          response = { data };
        } else {
          // Gọi API thật
          response = await axios.get("/users/get-user-by-id?id=" + id);
        }

        // Cập nhật thông tin user mới nhất
        this.user = response.data;
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Fetch profile error:", error);
        // Chỉ logout nếu token thực sự hết hạn (401)
        if (error.response?.status === 401) {
          this.logout();
          throw error; // Re-throw để initializeAuth biết token không hợp lệ
        }
        // Với các lỗi khác (mạng, server), không logout
      }
    },

    // Khởi tạo khi app load
    async initializeAuth() {
      // Kiểm tra localStorage có token không
      const token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const user = localStorage.getItem("user");

      if (token && user && user !== "undefined") {
        try {
          // Khôi phục thông tin từ localStorage
          this.token = token;
          this.refreshToken = refreshToken;
          this.user = JSON.parse(user);
         
        } catch (error) {
          // Nếu token không hợp lệ, clear localStorage
          this.logout();
        }
      }
    },
  },
});
