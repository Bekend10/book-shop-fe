import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "@/utils/axios";

export const useOrderStore = defineStore("order", () => {
  const orders = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const searchQuery = ref("");
  const selectedOrder = ref(null);
  const statusFilter = ref("all");

  // Computed
  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };

  const setStatusFilter = (status) => {
    statusFilter.value = status;
  };

  const filteredOrders = computed(() => {
    let filtered = orders.value;

    // Filter by status
    if (statusFilter.value !== "all") {
      filtered = filtered.filter(
        (order) => order.status === statusFilter.value
      );
    }

    // Filter by search query
    const query = searchQuery.value.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (order) =>
          order.order_id?.toString().includes(query) ||
          order.customer_name?.toLowerCase().includes(query) ||
          order.customer_email?.toLowerCase().includes(query) ||
          order.customer_phone?.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  const totalOrders = computed(() => orders.value.length);

  const ordersByStatus = computed(() => {
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.value.forEach((order) => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }
    });

    return statusCounts;
  });

  // Actions
  const fetchOrders = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.get("/orders/get-all-orders");
      orders.value = response.data.data || [];
    } catch (err) {
      console.error("Fetch orders error:", err);
      error.value = "Không thể tải danh sách đơn hàng";
    } finally {
      isLoading.value = false;
    }
  };

  const updateOrderStatus = async (orderId, updateData) => {
    
    isLoading.value = true;
    error.value = null;

    try {
      // Validate input
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      
      if (!updateData || updateData.status === undefined || updateData.status === null) {
        throw new Error('Status is required');
      }

      const requestBody = {
        status: parseInt(updateData.status)
      };
      
      const response = await axios.put(
        `/orders/update-order?id=${orderId}`,
        requestBody
      );

      if (response.data.status === 200) {
        // Update local state
        const orderIndex = orders.value.findIndex(
          (order) => order.order_id === orderId
        );
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = parseInt(updateData.status);
        }
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          error:
            response.data.message || "Không thể cập nhật trạng thái đơn hàng",
        };
      }
    } catch (err) {
      console.error("Update order status error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Không thể cập nhật trạng thái đơn hàng";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  const getOrderDetails = async (orderId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.get(
        `/orders/get-order-details?id=${orderId}`
      );
      if (response.data.status === 200) {
        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          error: response.data.message || "Không thể tải chi tiết đơn hàng",
        };
      }
    } catch (err) {
      console.error("Get order details error:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể tải chi tiết đơn hàng";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteOrder = async (orderId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.delete(`/orders/delete-order?id=${orderId}`);
      if (response.data.status === 200) {
        // Remove from local state
        orders.value = orders.value.filter(
          (order) => order.order_id !== orderId
        );
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          error: response.data.message || "Không thể xóa đơn hàng",
        };
      }
    } catch (err) {
      console.error("Delete order error:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể xóa đơn hàng";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch user orders (for customer)
  const fetchUserOrders = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.get("/orders/get-my-orders");
      
      if (response.data.status === 200) {
        orders.value = response.data.data || response.data.orders || [];
        return { success: true, data: orders.value };
      } else {
        return {
          success: false,
          error: response.data.message || "Không thể tải danh sách đơn hàng",
        };
      }
    } catch (err) {
      console.error("Fetch user orders error:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể tải danh sách đơn hàng";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  // Cancel order (for customer)
  const cancelOrder = async (orderId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.put(`/orders/cancel-order?id=${orderId}`);
      
      if (response.data.status === 200) {
        const orderIndex = orders.value.findIndex(order => order.order_id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 4;
        }
        return { success: true, message: "Đơn hàng đã được hủy thành công" };
      } else {
        return {
          success: false,
          error: response.data.message || "Không thể hủy đơn hàng",
        };
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể hủy đơn hàng";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  // Create Order - Tạo đơn hàng trước
  const createOrder = async (methodId, items) => {
    isLoading.value = true;
    error.value = null;

    try {
      // Validate inputs
      if (!methodId || !items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Dữ liệu đầu vào không hợp lệ');
      }

      const orderRequest = {
        method_id: methodId,
        items: items.map(item => {
          const bookId = item.book_id || item.id;
          const unitPrice = item.book?.price || item.price;
          
          if (!bookId || !item.quantity || !unitPrice) {
            console.error('Invalid item data:', item);
            throw new Error(`Dữ liệu sản phẩm không hợp lệ: ${item.book?.title || 'Không xác định'}`);
          }
          
          return {
            book_id: parseInt(bookId),
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(unitPrice)
          };
        })
      };

      const response = await axios.post("/orders/create-order-by-cart", orderRequest);

      // Kiểm tra các status code khả dĩ: 200, 201
      if (response.data.status === 200 || response.data.status === 201) {        
        // API trả về order_id trực tiếp trong response.data
        if (response.data.order_id) {
          const order = {
            order_id: response.data.order_id,
            status: 0, // Pending status
            message: response.data.message,
            created_at: new Date().toISOString(),
            method_id: methodId
          };
                    
          // Cập nhật danh sách orders
          orders.value.unshift(order);
          
          return {
            success: true,
            data: order,
            orderId: order.order_id
          };
        } else {
          throw new Error('API không trả về order_id');
        }
      } else {
        console.error('API returned error status:', response.data.status);
        throw new Error(response.data.message || 'Không thể tạo đơn hàng');
      }
    } catch (err) {
      console.error('Create Order Error:', err);
      error.value = err.response?.data?.message || err.message || 'Không thể tạo đơn hàng';
      return {
        success: false,
        error: error.value
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Create Payment - Tạo thanh toán với orderId
  const createPayment = async (orderId, methodId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const paymentRequest = {
        orderId: orderId,
        methodId: methodId,
        paymentDate: new Date().toISOString()
      };

      const response = await axios.post("/payments/create-payment", paymentRequest);
      

      if (response.data.status === 200) {
        
        // Trả về kết quả khác nhau tùy theo phương thức thanh toán
        if (methodId === 1) { // COD
          return {
            success: true,
            data: response.data,
            message: 'Đặt hàng COD thành công'
          };
        } else { // VNPAY hoặc FE HOME
          // API trả về paymentUrl trực tiếp trong response.data
          const paymentUrl = response.data.paymentUrl;
                    
          if (!paymentUrl) {     
            throw new Error('Không tìm thấy URL thanh toán');
          }
          
          return {
            success: true,
            paymentUrl: paymentUrl,
            orderId: orderId,
            data: response.data,
            message: response.data.message
          };
        }
      } else {
        throw new Error(response.data.message || 'Không thể tạo thanh toán');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      error.value = err.response?.data?.message || err.message || 'Không thể tạo thanh toán';
      return {
        success: false,
        error: error.value
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Verify Payment (for callback handling)
  const verifyPayment = async (paymentMethod, params) => {
    isLoading.value = true;
    error.value = null;

    try {
      let response;
      
      if (paymentMethod === 'vnpay') {
        // For VNPAY, we need to update order status based on callback params
        const orderId = params.vnp_TxnRef; // Order ID from VNPAY
        
        response = await axios.post(`/payments/verify-vnpay-callback`, {
          orderId: orderId,
          vnpayParams: params
        });
      } else {
        // For other payment methods
        response = await axios.post(`/payments/verify-${paymentMethod}-payment`, params);
      }
      
      if (response.data.status === 200) {
        const order = response.data.data.order || response.data.data;
        
        // Update local orders if order exists
        if (order) {
          const existingOrderIndex = orders.value.findIndex(o => o.order_id === order.order_id);
          if (existingOrderIndex !== -1) {
            orders.value[existingOrderIndex] = order;
          } else {
            orders.value.unshift(order);
          }
        }
        
        return {
          success: true,
          data: response.data.data,
          message: 'Thanh toán thành công'
        };
      } else {
        throw new Error(response.data.message || 'Xác thực thanh toán thất bại');
      }
    } catch (err) {
      console.error('Payment Verification Error:', err);
      error.value = err.response?.data?.message || err.message || 'Xác thực thanh toán thất bại';
      return {
        success: false,
        error: error.value
      };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    orders,
    isLoading,
    error,
    searchQuery,
    selectedOrder,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    filteredOrders,
    totalOrders,
    ordersByStatus,
    fetchOrders,
    updateOrderStatus,
    getOrderDetails,
    deleteOrder,
    fetchUserOrders,
    cancelOrder,
    createOrder,
    createPayment,
    verifyPayment,
  };
});
