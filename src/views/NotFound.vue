<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <!-- 404 Animation -->
      <div class="relative">
        <!-- Main 404 Text -->
        <div class="text-9xl font-bold text-blue-600 dark:text-blue-400 relative">
          4
          <span class="inline-block animate-bounce text-red-500 dark:text-red-400">0</span>
          4
        </div>
        
        <!-- Floating Books Animation -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-4 left-8 animate-float-slow">
            <BookOpen class="w-8 h-8 text-blue-400 opacity-60" />
          </div>
          <div class="absolute top-12 right-12 animate-float-medium">
            <Book class="w-6 h-6 text-green-400 opacity-50" />
          </div>
          <div class="absolute bottom-8 left-16 animate-float-fast">
            <Library class="w-7 h-7 text-purple-400 opacity-40" />
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div class="space-y-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Oops! Trang không tồn tại
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Trang bạn đang tìm kiếm có thể đã được di chuyển, xóa hoặc không bao giờ tồn tại.
        </p>
        <div class="text-sm text-gray-500 dark:text-gray-500">
          Mã lỗi: <span class="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">404 - Not Found</span>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Bạn có thể thử:
        </h3>
        <ul class="space-y-3 text-left">
          <li class="flex items-center text-gray-600 dark:text-gray-400">
            <ArrowRight class="w-4 h-4 mr-3 text-blue-500" />
            Kiểm tra lại URL trong thanh địa chỉ
          </li>
          <li class="flex items-center text-gray-600 dark:text-gray-400">
            <ArrowRight class="w-4 h-4 mr-3 text-blue-500" />
            Sử dụng thanh tìm kiếm để tìm sách yêu thích
          </li>
          <li class="flex items-center text-gray-600 dark:text-gray-400">
            <ArrowRight class="w-4 h-4 mr-3 text-blue-500" />
            Quay về trang chủ để khám phá thêm
          </li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home class="w-5 h-5 mr-2" />
            Về trang chủ
          </router-link>
          
          <button
            @click="goBack"
            class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowLeft class="w-5 h-5 mr-2" />
            Quay lại
          </button>
        </div>

        <!-- Search Bar -->
        <div class="max-w-sm mx-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Tìm kiếm sách..."
              class="w-full px-4 py-3 pl-12 pr-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              v-if="searchQuery"
              @click="handleSearch"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-700"
            >
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Fun Facts -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
        <div class="flex items-start">
          <Lightbulb class="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div class="text-left">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              Bạn có biết?
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ randomFact }}
            </p>
          </div>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="text-center text-sm text-gray-500 dark:text-gray-400">
        Nếu bạn nghĩ đây là lỗi, vui lòng 
        <a href="mailto:support@bookshop.com" class="text-blue-600 dark:text-blue-400 hover:underline">
          liên hệ với chúng tôi
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Home, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  BookOpen, 
  Book, 
  Library, 
  Lightbulb 
} from 'lucide-vue-next'

const router = useRouter()
const searchQuery = ref('')
const randomFact = ref('')

const bookFacts = [
  'Thư viện Alexandria cổ đại từng chứa hơn 400,000 cuốn sách.',
  'Cuốn sách đầu tiên được in bằng máy in Gutenberg là Kinh Thánh.',
  'Người Nhật đọc nhiều sách nhất thế giới với trung bình 4 cuốn/năm.',
  'Cuốn tiểu thuyết dài nhất thế giới có hơn 4 triệu từ.',
  'Mỗi năm có khoảng 2.2 triệu cuốn sách mới được xuất bản.',
  'Mùi sách cũ được gọi là "bibliosmia" - một mùi hương độc đáo.',
  'Trung bình một cuốn sách mất 5 năm để hoàn thành.',
  'Iceland có tỷ lệ xuất bản sách cao nhất thế giới.',
  'Cuốn sách bán chạy nhất mọi thời đại là Kinh Thánh.',
  'Người đọc sách thường có trí tuệ cảm xúc cao hơn người không đọc.',
  'Cuốn sách đắt nhất thế giới trị giá hơn 30 triệu USD.',
  'Sách điện tử đầu tiên xuất hiện vào năm 1971 qua Dự án Gutenberg.',
  'Amazon bắt đầu là một cửa hàng bán sách trực tuyến.',
  'Đọc sách 6 phút mỗi ngày có thể giảm căng thẳng đến 68%.',
  'Người Pháp có truyền thống tặng sách vào dịp Giáng sinh.',
  'J.K. Rowling là tác giả tỷ phú đầu tiên từ việc viết sách.',
  'Cuốn "Don Quixote" của Cervantes là tiểu thuyết ảnh hưởng nhất mọi thời đại.',
  'Người Đức có một từ riêng cho “mua sách nhưng không đọc”: "tsundoku".',
  'Trung bình người Mỹ dành hơn 20 phút mỗi ngày để đọc.',
  'Ngày Sách Thế giới được tổ chức vào ngày 23 tháng 4 hàng năm.',
  'Cuốn sách mỏng nhất thế giới chỉ dày 0.07 mm.',
  'Thư viện lớn nhất thế giới là Thư viện Quốc hội Mỹ, với hơn 170 triệu tài liệu.',
  'Trẻ em được đọc sách mỗi ngày có khả năng học tốt hơn khi đến trường.',
  'George R.R. Martin viết truyện bằng phần mềm WordStar trên DOS.',
  'Cuốn tiểu thuyết đầu tiên được viết là "The Tale of Genji" (Nhật Bản, thế kỷ 11).',
  'Người Phần Lan mượn sách nhiều nhất trên thế giới theo đầu người.',
  'Cuốn sách đầu tiên được đăng ký ISBN là “Teach Yourself Golf” (1966).',
  'Đọc sách trước khi ngủ giúp cải thiện giấc ngủ.',
  'Sách giấy vẫn chiếm ưu thế so với ebook về doanh thu toàn cầu.',
  'Ở Ấn Độ, có thư viện mở cửa 24/7 cho người vô gia cư.',
  'Sách bị cấm nhiều nhất ở Mỹ là “1984” và “The Catcher in the Rye”.',
  'Người đọc sách thường có vốn từ vựng lớn hơn.',
  'Sách giấy không bao giờ "hết pin".',
  'Một số tác giả nổi tiếng từng bị từ chối hàng chục lần trước khi thành công.',
  'Trẻ được cha mẹ đọc sách sớm có IQ cao hơn khi trưởng thành.',
  'Có hơn 129 triệu cuốn sách đã từng được xuất bản trên toàn thế giới.',
  'Một cuốn sách trung bình dài khoảng 64,000 từ.',
  'Sách giúp cải thiện trí nhớ và sự tập trung.',
  'Nhiều nhà tù đánh giá khả năng tái hòa nhập dựa trên thói quen đọc sách của phạm nhân.',
  'Việc sở hữu sách tại nhà tương quan với thành tích học tập của trẻ.'
];

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'Search', query: { q: searchQuery.value.trim() } })
  }
}

onMounted(() => {
  // Set random book fact
  randomFact.value = bookFacts[Math.floor(Math.random() * bookFacts.length)]
  
  // Set page title
  document.title = '404 - Trang không tồn tại | BookShop'
})
</script>

<style scoped>
/* Custom animations */
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

@keyframes float-medium {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(-5deg); }
}

@keyframes float-fast {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(8deg); }
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 3s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-float-fast {
  animation: float-fast 2s ease-in-out infinite;
  animation-delay: 0.5s;
}

/* Hover effects */
.transform {
  transition: transform 0.2s ease-in-out;
}
</style>
