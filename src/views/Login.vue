<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 main">
    <div class="max-w-md w-full space-y-8 form">
      <div>
        <div class="flex justify-center mb-4">
          <div class="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
            <BookOpen class="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-600">
          {{ isLoginMode ? 'Đăng nhập vào BookShop' : 'Đăng ký tài khoản' }}
        </h2>
        <p class="mt-3 text-center text-sm text-gray-600 dark:text-gray-500">
          {{ isLoginMode ? 'Chưa có tài khoản?' : 'Đã có tài khoản?' }}
          <button @click="toggleMode"
            class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 ml-1">
            {{ isLoginMode ? 'tạo tài khoản mới' : 'đăng nhập ngay' }}
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

        <!-- Social Login Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-3 bg-white font-medium ">Hoặc tiếp tục với</span>
          </div>
        </div>

        <!-- Social Login Buttons -->
        <div class="space-y-3">
          <!-- Google Login -->
          <div class="social-button-container">
            <div id="g_id_signin" class="google-signin-custom"></div>
            <button @click="handleCustomGoogleLogin" type="button" 
              class="social-button google-button w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-md">
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Đăng nhập với Google</span>
            </button>
          </div>
          
          <!-- Facebook Login -->
          <div id="fb-root"></div>
          <button @click="handleFacebookLogin" type="button"
            class="social-button facebook-button w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-md">
            <svg class="h-5 w-5 fill-white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Đăng nhập với Facebook</span>
          </button>
        </div>

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
};

const handleFacebookLogin = () => {
  if (!window.FB) {
    toastStore.error('Không tải được Facebook SDK')
    return
  }

  window.FB.login((response) => {
  if (response.authResponse) {
    const accessToken = response.authResponse.accessToken;

    window.FB.api('/me', 'GET', { access_token: accessToken, fields: 'id,name,email' });

    loginWithFacebookToken(accessToken);
  } else {
    toastStore.error('Bạn đã hủy đăng nhập Facebook.');
  }
}, { scope: 'public_profile,email' });
}

const handleCustomGoogleLogin = () => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.prompt()
  } else {
    toastStore.error('Không tải được Google SDK')
  }
}

const loginWithFacebookToken = async (token) => {
  if (!token) {
    toastStore.error('Token Facebook không hợp lệ.')
    return
  }

  try {
    const result = await authStore.loginWithFacebook({ token })
    if (result.success) {
      toastStore.success('Đăng nhập Facebook thành công!')
      setTimeout(() => {
        router.push(authStore.isAdmin ? '/admin' : (router.currentRoute.value.query.redirect || '/'))
      }, 1000)
    } else {
      toastStore.error(result.data?.msg || 'Đăng nhập Facebook thất bại!')
    }
  } catch {
    toastStore.error('Đăng nhập Facebook thất bại.')
  }
};


onMounted(() => {
  const script = document.createElement('script')
  const fbScript = document.createElement('script')
  fbScript.src = "https://connect.facebook.net/en_US/sdk.js"
  fbScript.async = true
  fbScript.defer = true
  fbScript.onload = () => {
    window.FB.init({
      appId: import.meta.env.VITE_FACEBOOK_APP_ID,
      cookie: true,
      xfbml: true,
      version: 'v19.0'
    })
  }
  document.head.appendChild(fbScript)

  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 460px;
  transition: all 0.3s ease;
}
.form:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.main {
  background-image: src('/src/assets/images/background-image.jpg') cover center center / cover no-repeat;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/src/assets/images/background-image.jpg') no-repeat center center;
  background-size: cover;
  opacity: 0.3;
  z-index: 0;
}

/* Input styling improvements */
input {
  transition: all 0.3s ease;
  border-radius: 0.75rem;
  font-size: 0.95rem;
}

input:focus {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
  border-color: #2563eb;
  transform: translateY(-1px);
}

/* Social login buttons */
.social-button {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.social-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.google-button:hover {
  background-color: #f8fafc;
  border-color: #d1d5db;
}

.facebook-button {
  background: linear-gradient(135deg, #1877F2 0%, #166FE5 100%);
}

.facebook-button:hover {
  background: linear-gradient(135deg, #166FE5 0%, #1464D6 100%);
}

/* Submit button improvements */
button[type="submit"] {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.875rem 1.5rem;
  transition: all 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);
}

/* Form label improvements */
label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

/* Social button container */
.social-button-container {
  position: relative;
}

.google-signin-custom {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

/* Header improvements */
h2 {
  font-weight: 800;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Toggle button styling */
button:not([type]):not(.social-button) {
  transition: all 0.2s ease;
}

button:not([type]):not(.social-button):hover {
  text-decoration: underline;
  transform: scale(1.05);
}

/* Responsive improvements */
@media (max-width: 640px) {
  .form {
    padding: 2rem 1.5rem;
    margin: 1rem;
    border-radius: 1.25rem;
  }
  
  .social-button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  button[type="submit"] {
    padding: 0.75rem 1.25rem;
    font-size: 0.95rem;
  }
}

/* Loading state improvements */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Focus improvements for accessibility */
button:focus,
input:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Hover effects for better UX */
.form input:hover:not(:focus) {
  border-color: #9ca3af;
  transform: translateY(-1px);
}

/* Divider styling */
.relative .border-t {
  border-color: #e5e7eb;
}

.relative span {
  /* background: rgba(255, 255, 255, 0.95); */
  padding: 0 1rem;
  font-size: 0.875rem;
  /* color: #6b7280; */
  font-weight: 500;
}
</style>
