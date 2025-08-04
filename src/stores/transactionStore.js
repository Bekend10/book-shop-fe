import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "@/utils/axios";

export const useTransactionStore = defineStore("transaction", () => {
  const transactions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const searchQuery = ref("");
  const selectedTransaction = ref(null);
  const statusFilter = ref("all");

  // Computed
  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };

  const setStatusFilter = (status) => {
    statusFilter.value = status;
  };

  const filteredTransactions = computed(() => {
    let filtered = transactions.value;

    // Filter by status
    if (statusFilter.value !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter.value
      );
    }

    // Filter by search query
    const query = searchQuery.value.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.transaction_id?.toString().includes(query) ||
          transaction.order_id?.toString().includes(query) ||
          transaction.payment_method?.toLowerCase().includes(query) ||
          transaction.user?.first_name?.toLowerCase().includes(query) ||
          transaction.user?.last_name?.toLowerCase().includes(query) ||
          transaction.user?.email?.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  const totalTransactions = computed(() => transactions.value.length);

  const transactionsByStatus = computed(() => {
    const statusCounts = {
      pending: 0,
      completed: 0,
      failed: 0,
      refunded: 0,
    };

    transactions.value.forEach((transaction) => {
      switch (transaction.paymentStatus) {
        case 0:
          statusCounts.pending++;
          break;
        case 1:
          statusCounts.completed++;
          break;
        case 2:
          statusCounts.failed++;
          break;
        case 3:
          statusCounts.refunded++;
          break;
      }
    });

    return statusCounts;
  });

  const totalRevenue = computed(() => {
    return transactions.value
      .filter(t => t.paymentStatus === 1)
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  });

  // Actions
  const fetchTransactions = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.get("/payments/get-all-payments");
      transactions.value = response.data.data || [];
    } catch (err) {
      console.error("Fetch transactions error:", err);
      error.value = "Không thể tải danh sách giao dịch";    
    } finally {
      isLoading.value = false;
    }
  };

  const updateTransactionStatus = async (transactionId, updateData) => {
    
    isLoading.value = true;
    error.value = null;

    try {
      // Validate input
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }
      
      if (!updateData || updateData.status === undefined || updateData.status === null) {
        throw new Error('Status is required');
      }

      const requestBody = {
        status: parseInt(updateData.status)
      };
      
      const response = await axios.put(
        `/transactions/update-transaction?id=${transactionId}`,
        requestBody
      );

      if (response.data.status === 200) {
        // Update local state
        const transactionIndex = transactions.value.findIndex(
          (transaction) => transaction.transaction_id === transactionId
        );
        if (transactionIndex !== -1) {
          transactions.value[transactionIndex].status = parseInt(updateData.status);
        }
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          error:
            response.data.message || "Không thể cập nhật trạng thái giao dịch",
        };
      }
    } catch (err) {
      console.error("Update transaction status error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Không thể cập nhật trạng thái giao dịch";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  const getTransactionDetails = async (transactionId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.get(
        `/transactions/get-transaction-details?id=${transactionId}`
      );
      if (response.data.status === 200) {
        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          error: response.data.message || "Không thể tải chi tiết giao dịch",
        };
      }
    } catch (err) {
      console.error("Get transaction details error:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể tải chi tiết giao dịch";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTransaction = async (transactionId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.delete(`/transactions/delete-transaction?id=${transactionId}`);
      if (response.data.status === 200) {
        // Remove from local state
        transactions.value = transactions.value.filter(
          (transaction) => transaction.transaction_id !== transactionId
        );
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          error: response.data.message || "Không thể xóa giao dịch",
        };
      }
    } catch (err) {
      console.error("Delete transaction error:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể xóa giao dịch";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    searchQuery,
    selectedTransaction,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    filteredTransactions,
    totalTransactions,
    transactionsByStatus,
    totalRevenue,
    fetchTransactions,
    updateTransactionStatus,
    getTransactionDetails,
    deleteTransaction,
  };
});
