import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "@/utils/axios";

export const useCategoryStore = defineStore('category', () => {
    const categories = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const searchQuery = ref("");
    const selectedCategory = ref(null);

    // Computed
    const setSearchQuery = (query) => {
        searchQuery.value = query;
    }

    const filteredCategories = computed(() => {
        const query = searchQuery.value.trim().toLowerCase();
        if (!query) return categories.value;

        return categories.value.filter(category =>
            category.name?.toLowerCase().includes(query) ||
            category.description?.toLowerCase().includes(query)
        );
    });

    const totalCategories = computed(() => categories.value.length);

    // Actions
    const fetchCategories = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await axios.get("/categories/get-categories");
            categories.value = response.data.data || [];
        } catch (err) {
            console.error("Fetch categories error:", err);
            error.value = "Không thể tải danh sách thể loại";
        } finally {
            isLoading.value = false;
        }
    };

    const createCategory = async (data) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await axios.post('/categories/create-category', data);
            if (response.data.status === 201) {
                await fetchCategories(); // Refresh list
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.data.message || 'Không thể tạo danh mục' };
            }
        } catch (err) {
            console.error("Create category error:", err);
            const errorMessage = err.response?.data?.message || "Không thể tạo danh mục mới";
            error.value = errorMessage;
            return { success: false, error: errorMessage };
        } finally {
            isLoading.value = false;
        }
    };

    const updateCategory = async (id, data) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await axios.put(`/categories/update-category?id=${id}`, data);
            if (response.data.status === 200) {
                await fetchCategories(); // Refresh list
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.data.message || 'Không thể cập nhật danh mục' };
            }
        } catch (err) {
            console.error("Update category error:", err);
            const errorMessage = err.response?.data?.message || "Không thể cập nhật danh mục";
            error.value = errorMessage;
            return { success: false, error: errorMessage };
        } finally {
            isLoading.value = false;
        }
    };

    const deleteCategory = async (id) => {
        isLoading.value = true;
        error.value = null;

        try {
            const response = await axios.delete(`/categories/delete-category?id=${id}`);
            if (response.data.status === 200) {
                await fetchCategories(); // Refresh list
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.data.message || 'Không thể xóa danh mục' };
            }
        } catch (err) {
            console.error("Delete category error:", err);
            const errorMessage = err.response?.data?.message || "Không thể xóa danh mục";
            error.value = errorMessage;
            return { success: false, error: errorMessage };
        } finally {
            isLoading.value = false;
        }
    };

    return {
        categories,
        isLoading,
        error,
        searchQuery,
        selectedCategory,
        setSearchQuery,
        filteredCategories,
        totalCategories,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    };
});
