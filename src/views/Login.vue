<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 main">
    <div class="max-w-md w-full space-y-8 form">
      <div>
        <div class="flex justify-center">
          <BookOpen class="h-12 w-12 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-600">
          {{ isLoginMode ? 'Đăng nhập vào BookShop' : 'Đăng ký tài khoản' }}
        </h2>
        <p class="mt-2 text-center text-sm text-black-900 dark:text-black">
          Hoặc
          <button @click="toggleMode"
            class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
            {{ isLoginMode ? 'tạo tài khoản mới' : 'đăng nhập' }}
          </button>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-black dark:text-black-300">
              Email
            </label>
            <input id="email" v-model="form.email" type="email" required
              class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Nhập email của bạn" />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-black dark:text-black-300">
              Mật khẩu
            </label>
            <input id="password" v-model="form.password" type="password" required
              class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Nhập mật khẩu" />
          </div>

          <!-- Name (chỉ hiển thị khi đăng ký) -->
          <div v-if="!isLoginMode">
            <label for="name" class="block text-sm font-medium text-black dark:text-black-300">
              Họ đệm
            </label>
            <input id="name" v-model="form.first_name" type="text" required
              class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Nhập họ đệm" />
          </div>

          <!-- Phone (chỉ hiển thị khi đăng ký) -->
          <div v-if="!isLoginMode">
            <label for="phone" class="block text-sm font-medium text-black dark:text-black-300">
              Tên
            </label>
            <input id="phone" v-model="form.last_name" type="tel"
              class="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Nhập tên" />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="text-red-600 dark:text-red-400 text-sm text-center">
          {{ authStore.error }}
        </div>

        <!-- Submit Button -->
        <div>
          <button type="submit" :disabled="authStore.isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-offset-gray-900">
            <span v-if="authStore.isLoading">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ isLoginMode ? 'Đang đăng nhập...' : 'Đang đăng ký...' }}
            </span>
            <span v-else>
              {{ isLoginMode ? 'Đăng nhập' : 'Đăng ký' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const isLoginMode = ref(true)
const form = reactive({
  email: '',
  password: '',
  first_name: '',
  last_name: ''
})

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  authStore.error = null
  // Reset form
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
}

const handleSubmit = async () => {
  try {
    let result

    if (isLoginMode.value) {
      // Đăng nhập
      result = await authStore.login({
        email: form.email,
        password: form.password
      })
    } else {
      // Đăng ký
      result = await authStore.register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name
      })
    }

    if (result.success) {
      // Hiển thị toast thành công
      if (isLoginMode.value) {
        toastStore.success('Đăng nhập thành công! Chào mừng bạn quay lại.')
      } else {
        toastStore.success('Đăng ký thành công! Chào mừng bạn đến với BookShop.')
      }

      // Chuyển hướng sau khi hiển thị toast
      setTimeout(() => {
        if (authStore.isAdmin) {
          router.push('/admin')
        } else {
          const redirectTo = router.currentRoute.value.query.redirect || '/'
          router.push(redirectTo)
        }
      }, 1000)

    } else {
      // Hiển thị toast lỗi
      toastStore.error(result.error || (isLoginMode.value ? 'Đăng nhập thất bại' : 'Đăng ký thất bại'))
    }
  } catch (error) {
    console.error('Authentication error:', error)
    toastStore.error('Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.')
  }
}
</script>

<style>
  .form {
  background: rgba(255, 255, 255, 0.85); /* Nền bán trong suốt */
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  width: 100%;
  max-width: 420px;
  transition: all 0.3s ease;
}

.form:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
}

.main {
  background: url('/src/assets/images/background-image.jpg') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Điều chỉnh input cho hiện đại hơn nếu chưa dùng Tailwind toàn bộ */
input {
  transition: all 0.3s ease;
}

input:focus {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4);
}

/* Responsive mobile nhỏ hơn */
@media (max-width: 640px) {
  .form {
    padding: 1.5rem;
    width: 100%;
  }
}
</style>
