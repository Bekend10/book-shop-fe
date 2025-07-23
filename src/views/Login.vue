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

        <!-- Google Login -->
        <div id="g_id_signin" class="flex justify-center"></div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
}

const handleSubmit = async () => {
  try {
    let result
    if (isLoginMode.value) {
      result = await authStore.login({ email: form.email, password: form.password })
    } else {
      result = await authStore.register({ ...form })
    }

    if (result.data.status === 200 || result.data.status === 201) {
      toastStore.success(isLoginMode.value ? 'Đăng nhập thành công!' : 'Đăng ký thành công!')
      setTimeout(() => {
        router.push(authStore.isAdmin ? '/admin' : (router.currentRoute.value.query.redirect || '/'))
      }, 1000)
    } else {
      toastStore.error(result.data.msg || 'Đã có lỗi xảy ra')
    }
  } catch (error) {
    toastStore.error('Tài khoản hoặc mật khẩu không đúng.')
  }
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: '255112350298-5j6u5u74oucvo893dgqo7mdt566kce2n.apps.googleusercontent.com',
      callback: async (response) => {
        try {
          const result = await authStore.loginWithGoogle({ token: response.credential })
          if (result.success) {
            toastStore.success('Đăng nhập thành công!')
            setTimeout(() => {
              router.push(authStore.isAdmin ? '/admin' : (router.currentRoute.value.query.redirect || '/'))
            }, 1000)
          } else {
            toastStore.error(result.data.msg || 'Đăng nhập Google thất bại!')
          }
        } catch (err) {
          toastStore.error('Đăng nhập Google thất bại. Vui lòng thử lại.')
        }
      },
    })

    window.google.accounts.id.renderButton(
      document.getElementById('g_id_signin'),
      { theme: 'outline', size: 'large' }
    )
  }
  document.head.appendChild(script)
})
</script>

<style>
.form {
  background: rgba(255, 255, 255, 0.85);
  /* Nền bán trong suốt */
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
