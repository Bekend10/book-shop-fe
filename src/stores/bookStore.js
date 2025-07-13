import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "@/utils/axios";
export const useBookStore = defineStore("book", () => {
  // State
  const books = ref([]);
  const categories = ref([{ id: null, name: "Tất cả" }]);
  const authors = ref([{ id: null, name: "Tất cả" }]);
  const selectedCategory = ref("Tất cả");
  const searchQuery = ref("");
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const filteredBooks = computed(() => {
    let filtered = books.value;

    if (selectedCategory.value !== "Tất cả") {
      filtered = filtered.filter(
        (book) => book.category?.name === selectedCategory.value
      );
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(query) ||
          book.author?.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  // Actions
  const fetchBooks = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await axios.get("/books/get-books");
      books.value = response.data.data;

      const uniqueCategoriesMap = new Map();
      const uniqueAuthorsMap = new Map();

      response.data.data.forEach((book) => {
        const category = book.category;
        if (category?.category_id) {
          uniqueCategoriesMap.set(category.category_id, {
            id: category.category_id,
            name: category.name,
          });
        }

        const author = book.author;
        if (author?.author_id) {
          uniqueAuthorsMap.set(author.id, { id: author.author_id, name: author.name });
        }
      });

      categories.value = [
        { id: null, name: "Tất cả" },
        ...Array.from(uniqueCategoriesMap.values()),
      ];
      authors.value = [
        { id: null, name: "Tất cả" },
        ...Array.from(uniqueAuthorsMap.values()),
      ];
    } catch (err) {
      console.error("Lỗi fetch books:", err);
      error.value = "Không thể tải dữ liệu sách.";
    } finally {
      isLoading.value = false;
    }
  };

  const getBookById = (id) =>
    books.value.find((book) => book.book_id === parseInt(id));

  const featuredBooks = computed(() => {
    return books.value.filter((book) => book.rating >= 4.7).slice(0, 4);
  });

  const addBook = async (book) => {
    try {
      // Ensure book has all required fields
      book = {
        title: book.title || "",
        author_id: book.author_id || null,
        category_id: book.category_id || null,
        price: parseFloat(book.price) || 0,
        price_origin: parseFloat(book.price_origin) || 0,
        quantity: parseInt(book.quantity) || 0,
        publisher: book.publisher || "",
        publisher_year: book.publisher_year || new Date().toISOString().slice(0, 10),
        image_url: book.image_url || "",
        description: book.description || "",
        language : book.language || "",
        number_of_page: book.number_of_page || 0,
        file_demo_url: book.file_demo_url || "",
        is_bn: book.is_bn == true ? 1 : 0, 
      };
      const response = await axios.post("books/create-book", book);
      books.value.push(response.data);
    } catch (err) {
      console.error("Lỗi thêm sách:", err);
    }
  };

  const updateBook = async (id, updatedBook) => {
    try {
      const response = await axios.put(
        `books/update-book?id=${id}`,
        updatedBook
      );
      const index = books.value.findIndex((book) => book.id === id);
      if (index !== -1) {
        books.value[index] = response.data;
      }
    } catch (err) {
      console.error("Lỗi cập nhật sách:", err);
    }
  };

  const deleteBook = async (id) => {
    try {
      await axios.delete(`/books/delete-book?id=${id}`);
      books.value = books.value.filter((book) => book.book_id !== id);
    } catch (err) {
      console.error("Lỗi xoá sách:", err);
      throw err; // Throw error để có thể catch ở component
    }
  };

  const setCategory = (category) => {
    selectedCategory.value = category;
  };

  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };

  return {
    books,
    categories,
    authors,
    selectedCategory,
    searchQuery,
    filteredBooks,
    featuredBooks,
    isLoading,
    error,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    setCategory,
    setSearchQuery,
    getBookById,
  };
});
