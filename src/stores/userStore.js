import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { useToastStore } from "./toastStore";

export const useUserStore = defineStore("user", () => {
  // State
  const users = ref([]);
  const loading = ref(false);
  const submitting = ref(false);
  const selectedUser = ref(null);
  const toastStore = useToastStore();

  // Computed
  const stats = computed(() => ({
    total: users.value.length,
    active: users.value.filter((user) => user.is_active === true).length,
    inactive: users.value.filter((user) => user.is_active === false).length,
    admin: users.value.filter((user) => user.role_id === 2).length,
  }));

  // Actions
  const fetchUsers = async () => {
    loading.value = true;
    try {
      const response = await axios.get("/accounts/get-accounts");

      if (response.data.status === 200) {
        users.value = response.data.accounts.map((account) => ({
          account_id: account.account_id,
          user_id: account.user?.user_id || account.user_id,
          first_name: account.user?.first_name || "",
          last_name: account.user?.last_name || "",
          email: account.email,
          phone: account.user?.phone_number || null,
          role: account.role_id === 2 ? "admin" : "user",
          role_id: account.role_id,
          is_active: account.is_active,
          is_verify: account.is_verify,
          avatar: account.user?.profile_image || null,
          gender: account.user?.gender,
          dob: account.user?.dob,
          last_active : account?.last_active || new Date().toISOString(),
          address_id: account.user?.address_id,
          created_at: account.user?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      } else {
        console.error("API Error:", response.data.message);
        users.value = [];
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      users.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData) => {
    submitting.value = true;
    try {
      const response = await axios.post("/accounts/create-account-by-admin", userData);

      if (response.data.status === 201) {
        // Add new user to local state
        const newUser = {
          ...userData,
        };
        delete newUser.password; 
        users.value.unshift(newUser);
        toastStore.success("Thêm người dùng thành công");
        await fetchUsers(); 

        return { success: true, message: "User created successfully" };
      } else {
        toastStore.error(
          response.data.message || "Không thể tạo người dùng mới"
        );
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      toastStore.error("Lỗi khi tạo người dùng " + error.message);
      return { success: false, message: "Error creating user" };
    } finally {
      submitting.value = false;
    }
  };

  const updateUser = async (userId, userData) => {
    submitting.value = true;
    try {
      const response = await axios.put(`/accounts/update-account-by-admin?id=${userId}`, userData);

      if (response.data.status === 200) {
        // Update user in local state
        const userIndex = users.value.findIndex((u) => u.user_id === userId);
        if (userIndex !== -1) {
          users.value[userIndex] = {
            ...userData,
          };
        }
        toastStore.success("Cập nhật người dùng thành công");
        await fetchUsers();
        return { success: true, message: "User updated successfully" };
      } else {
        console.error("API Error:", response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, message: "Error updating user" };
    } finally {
      submitting.value = false;
    }
  };

const toggleUserStatus = async (user) => {
  try {

    const response = await axios.put(`/accounts/lock-account?id=${user}`);

    if (response.data.status === 200) {
      const userIndex = users.value.findIndex(u => u.account_id === user);
      await fetchUsers(); 
      toastStore.success("Cập nhật trạng thái người dùng thành công");
      return { success: true, message: "Status updated successfully" };
    } else {
      console.error("API Error:", response.data.msg);
      return { success: false, message: response.data.msg };
    }
  } catch (error) {
    toastStore.error("Lỗi khi cập nhật trạng thái người dùng");
    console.error("Error updating user status:", error);
    return { success: false, message: "Error updating status" };
  }
};

  const deleteUser = async (userId) => {
    try {
      const response = await axios.delete(`/accounts/delete/${userId}`);

      if (response.data.success) {
        // Remove user from local state
        const userIndex = users.value.findIndex((u) => u.user_id === userId);
        if (userIndex !== -1) {
          users.value.splice(userIndex, 1);
        }

        return { success: true, message: "User deleted successfully" };
      } else {
        console.error("API Error:", response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, message: "Error deleting user" };
    }
  };

  const selectUser = (user) => {
    selectedUser.value = user;
  };

  const clearSelectedUser = () => {
    selectedUser.value = null;
  };

  const getUserById = (userId) => {
    return users.value.find((user) => user.user_id === userId);
  };

  const searchUsers = (query) => {
    if (!query) return users.value;

    const lowercaseQuery = query.toLowerCase();
    return users.value.filter(
      (user) =>
        user.first_name.toLowerCase().includes(lowercaseQuery) ||
        user.last_name.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery) ||
        (user.phone && user.phone.includes(query))
    );
  };

  const filterUsersByRole = (role) => {
    if (!role || role === "all") return users.value;
    return users.value.filter((user) => user.role === role);
  };

  const filterUsersByStatus = (status) => {
    if (status === "all") return users.value;
    if (status === "active")
      return users.value.filter((user) => user.is_active === true);
    if (status === "inactive")
      return users.value.filter((user) => user.is_active === false);
    return users.value;
  };

  // Reset store
  const resetStore = () => {
    users.value = [];
    loading.value = false;
    submitting.value = false;
    selectedUser.value = null;
  };

  return {
    // State
    users,
    loading,
    submitting,
    selectedUser,

    // Computed
    stats,

    // Actions
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    selectUser,
    clearSelectedUser,
    getUserById,
    searchUsers,
    filterUsersByRole,
    filterUsersByStatus,
    resetStore,
  };
});
