  import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "@/utils/axios";

// Author Store - Updated
export const useAuthorStore = defineStore("author", () => {
  // State
  const authors = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const searchQuery = ref("");
  const selectedAuthor = ref(null);

  // Search action
  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };

  // Getters
  const filteredAuthors = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return authors.value;

    return authors.value.filter((author) =>
      [author.name, author.bio, author.nationality]
        .some((field) => field?.toLowerCase().includes(query))
    );
  });

  const totalAuthors = computed(() => authors.value.length);

  // Actions
  const fetchAuthors = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.get("/authors/get-authors");
      authors.value = response.data.data || [];
    } catch (err) {
      console.error("Fetch authors error:", err);
      error.value = "Không thể tải danh sách tác giả";
    } finally {
      isLoading.value = false;
    }
  };

  const createAuthor = async (data) => {
    isLoading.value = true;
    error.value = null;

    try {
      const formData = toFormData(data);
      const response = await axios.post('/authors/create-author', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

      authors.value.unshift(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Create author error:", err);
      error.value = err.response?.data?.message || "Không thể tạo tác giả mới";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const updateAuthor = async (id, data) => {
    isLoading.value = true;
    error.value = null;

    try {
      const formData = toFormData(data);
      const response = await axios.put(
        `/authors/update-author?id=${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const index = authors.value.findIndex(a => a.author_id === id);
      if (index !== -1) authors.value[index] = response.data;

      return { success: true, data: response.data };
    } catch (err) {
      console.error("Update author error:", err);
      error.value = err.response?.data?.message || "Không thể cập nhật tác giả";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteAuthor = async (id) => {
    isLoading.value = true;
    error.value = null;

    try {
      await axios.delete(`/authors/delete-author?id=${id}`);
      authors.value = authors.value.filter(a => a.author_id !== id);
      return { success: true };
    } catch (err) {
      console.error("Delete author error:", err);
      error.value = err.response?.data?.message || "Không thể xoá tác giả";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteMultipleAuthors = async (ids) => {
    isLoading.value = true;
    error.value = null;

    try {
      await axios.delete("/authors/batch", {
        data: { author_ids: ids },
      });
      authors.value = authors.value.filter(a => !ids.includes(a.author_id));
      return { success: true };
    } catch (err) {
      console.error("Batch delete error:", err);
      error.value = err.response?.data?.message || "Không thể xoá các tác giả";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const toFormData = (data) => {
    const formData = new FormData();
    for (const key in data) {
      const value = data[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }
    return formData;
  };

  return {
    authors,
    isLoading,
    error,
    searchQuery,
    selectedAuthor,
    filteredAuthors,
    totalAuthors,
    fetchAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    deleteMultipleAuthors,
    setSearchQuery,
  };
});
