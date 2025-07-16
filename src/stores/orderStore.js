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
  };
});
