import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "@/utils/axios";

export const useReviewStore = defineStore("review", () => {
  // State
  const reviews = ref([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref(null);

  // Getters
  const getReviewsByBookId = computed(() => {
    return (bookId) => reviews.value.filter(review => review.book_id === bookId);
  });

  const getAverageRating = computed(() => {
    return (bookId) => {
      const bookReviews = reviews.value.filter(review => review.book_id === bookId);
      if (bookReviews.length === 0) return 0;
      const totalRating = bookReviews.reduce((sum, review) => sum + review.rating, 0);
      return (totalRating / bookReviews.length).toFixed(1);
    };
  });

  const getReviewCount = computed(() => {
    return (bookId) => reviews.value.filter(review => review.book_id === bookId).length;
  });

  // Actions
  const fetchAllReviews = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await axios.get("/bookreviews/get-all-reviews");
      reviews.value = response.data.data;
    } catch (err) {
      console.error("Lỗi fetch reviews:", err);
      error.value = "Không thể tải dữ liệu đánh giá.";
    } finally {
      isLoading.value = false;
    }
  };

  const createReview = async (reviewData) => {
    isSubmitting.value = true;
    error.value = null;
    
    try {
      const formData = new FormData();
      formData.append('book_id', reviewData.book_id);
      formData.append('content', reviewData.content);
      formData.append('rating', reviewData.rating);
      
      if (reviewData.image) {
        formData.append('image', reviewData.image);
      }

      const response = await axios.post("/bookreviews/create-review-book", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh reviews after creating
      await fetchAllReviews();
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Lỗi tạo review:", err);
      error.value = err.response?.data?.message || "Không thể tạo đánh giá.";
      return { success: false, error: error.value };
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    reviews,
    isLoading,
    isSubmitting,
    error,
    getReviewsByBookId,
    getAverageRating,
    getReviewCount,
    fetchAllReviews,
    createReview,
  };
});
