import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBookStore = defineStore('book', () => {
  // State
  const books = ref([
    {
      id: 1,
      title: 'Đắc Nhân Tâm',
      author: 'Dale Carnegie',
      price: 89000,
      originalPrice: 120000,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=500&fit=crop',
      description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và tạo dựng mối quan hệ tốt đẹp.',
      category: 'Kỹ năng sống',
      rating: 4.8,
      reviews: 1250,
      inStock: true,
      stock: 50
    },
    {
      id: 2,
      title: 'Tôi Tài Giỏi, Bạn Cũng Thế',
      author: 'Adam Khoo',
      price: 95000,
      originalPrice: 125000,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      description: 'Hướng dẫn phương pháp học tập hiệu quả và phát triển tư duy sáng tạo.',
      category: 'Giáo dục',
      rating: 4.6,
      reviews: 890,
      inStock: true,
      stock: 30
    },
    {
      id: 3,
      title: 'Sapiens: Lược Sử Loài Người',
      author: 'Yuval Noah Harari',
      price: 199000,
      originalPrice: 250000,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=500&fit=crop',
      description: 'Cuốn sách khám phá lịch sử tiến hóa của loài người từ thời cổ đại đến hiện đại.',
      category: 'Lịch sử',
      rating: 4.9,
      reviews: 2100,
      inStock: true,
      stock: 75
    },
    {
      id: 4,
      title: 'Nhà Giả Kim',
      author: 'Paulo Coelho',
      price: 79000,
      originalPrice: 100000,
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop',
      description: 'Câu chuyện về hành trình tìm kiếm kho báu và khám phá bản thân.',
      category: 'Tiểu thuyết',
      rating: 4.7,
      reviews: 1800,
      inStock: true,
      stock: 40
    },
    {
      id: 5,
      title: 'Atomic Habits',
      author: 'James Clear',
      price: 159000,
      originalPrice: 200000,
      image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=500&fit=crop',
      description: 'Cách xây dựng thói quen tốt và loại bỏ thói quen xấu.',
      category: 'Kỹ năng sống',
      rating: 4.8,
      reviews: 1550,
      inStock: true,
      stock: 60
    },
    {
      id: 6,
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      price: 189000,
      originalPrice: 230000,
      image: 'https://images.unsplash.com/photo-1471017623322-ba346ddb2c6a?w=400&h=500&fit=crop',
      description: 'Khám phá cách thức hoạt động của tư duy con người.',
      category: 'Tâm lý học',
      rating: 4.6,
      reviews: 1200,
      inStock: false,
      stock: 0
    }
  ])

  const categories = ref([
    'Tất cả',
    'Kỹ năng sống',
    'Giáo dục',
    'Lịch sử',
    'Tiểu thuyết',
    'Tâm lý học',
    'Kinh doanh'
  ])

  const selectedCategory = ref('Tất cả')
  const searchQuery = ref('')

  // Getters
  const filteredBooks = computed(() => {
    let filtered = books.value

    if (selectedCategory.value !== 'Tất cả') {
      filtered = filtered.filter(book => book.category === selectedCategory.value)
    }

    if (searchQuery.value) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }

    return filtered
  })

  const getBookById = computed(() => {
    return (id) => books.value.find(book => book.id === parseInt(id))
  })

  const featuredBooks = computed(() => {
    return books.value.filter(book => book.rating >= 4.7).slice(0, 4)
  })

  // Actions
  const addBook = (book) => {
    const newBook = {
      ...book,
      id: Date.now()
    }
    books.value.push(newBook)
  }

  const updateBook = (id, updatedBook) => {
    const index = books.value.findIndex(book => book.id === id)
    if (index !== -1) {
      books.value[index] = { ...books.value[index], ...updatedBook }
    }
  }

  const deleteBook = (id) => {
    const index = books.value.findIndex(book => book.id === id)
    if (index !== -1) {
      books.value.splice(index, 1)
    }
  }

  const setCategory = (category) => {
    selectedCategory.value = category
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  return {
    books,
    categories,
    selectedCategory,
    searchQuery,
    filteredBooks,
    getBookById,
    featuredBooks,
    addBook,
    updateBook,
    deleteBook,
    setCategory,
    setSearchQuery
  }
})
