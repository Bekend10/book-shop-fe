<script setup>
import { useBookStore } from '@/stores/bookStore'
import { onMounted } from 'vue'
import BookCard from '@/components/BookCard.vue'

const bookStore = useBookStore()

onMounted(() => {
  bookStore.fetchBooks()
})
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-4">Danh sách sách</h2>
    
    <div v-if="bookStore.isLoading">Đang tải sách...</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <BookCard 
        v-for="book in bookStore.filteredBooks" 
        :key="book.book_id" 
        :book="formatBook(book)" 
      />
    </div>
  </div>
</template>
