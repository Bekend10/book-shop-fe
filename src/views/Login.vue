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

          <!-- Remember Me (chỉ hiển thị khi đăng nhập) -->
          <div v-if="isLoginMode" class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-900 cursor-pointer">
                Ghi nhớ đăng nhập 
              </label>
            </div>
            <div class="text-sm">
              <a 
                href="#" 
                @click.prevent="handleForgotPassword"
                class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Quên mật khẩu?
              </a>
            </div>
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
            <div id="g_id_signin" class="gg-signin"></div>
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { secureLocalStorage } from '@/utils/secureStorage'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const isLoginMode = ref(true)
const rememberMe = ref(false)
const form = reactive({
  email: '',
  password: '',
  first_name: '',
  last_name: ''
})

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  rememberMe.value = false
  authStore.error = null
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
}

const handleSubmit = async () => {
  try {
    let result
    if (isLoginMode.value) {
      result = await authStore.login({ 
        email: form.email, 
        password: form.password,
        remember_me: rememberMe.value 
      })
    } else {
      result = await authStore.register({ ...form })
    }

    if (result.data.status === 200 || result.data.status === 201) {
      // Xử lý ghi nhớ đăng nhập với mã hóa
      if (isLoginMode.value) {
        if (rememberMe.value) {
          // Lưu thông tin đăng nhập với mã hóa
          try {
            localStorage.setItem('remembered_email', form.email) // Email không cần mã hóa
            await secureLocalStorage.setItem('remembered_password_hash', form.password, form.email)
          } catch (error) {
            console.error('Failed to save encrypted credentials:', error)
            toastStore.warning('Không thể lưu thông tin đăng nhập do lỗi mã hóa')
          }
        } else {
          // Xóa thông tin đăng nhập đã lưu
          secureLocalStorage.clearCredentials()
        }
      }

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

// Watcher để theo dõi thay đổi của form và tự động bỏ chọn "Ghi nhớ" nếu cần
watch([() => form.email, () => form.password], async ([newEmail, newPassword]) => {
  if (rememberMe.value && isLoginMode.value) {
    const savedEmail = localStorage.getItem('remembered_email')
    const savedPassword = await secureLocalStorage.getItem('remembered_password_hash', newEmail)
    
    if (savedEmail !== newEmail || savedPassword !== newPassword) {
      rememberMe.value = false
    }
  }
})

const handleForgotPassword = () => {
  // Xóa thông tin ghi nhớ khi user click "Quên mật khẩu"
  secureLocalStorage.clearCredentials()
  authStore.clearRememberedCredentials() // Backup clear
  rememberMe.value = false
  form.email = ''
  form.password = ''
  
  toastStore.info('Thông tin đăng nhập đã lưu đã được xóa. Vui lòng liên hệ admin để reset mật khẩu.')
}

// Method để validate và clean up dữ liệu mã hóa không hợp lệ
const validateStoredCredentials = async () => {
  try {
    const savedEmail = localStorage.getItem('remembered_email')
    if (!savedEmail) return false

    const savedPassword = await secureLocalStorage.getItem('remembered_password_hash', savedEmail)
    if (!savedPassword || savedPassword.length < 3) {
      // Dữ liệu không hợp lệ, clear tất cả
      secureLocalStorage.clearCredentials()
      return false
    }

    return true
  } catch (error) {
    console.error('Validation failed, clearing corrupted data:', error)
    secureLocalStorage.clearCredentials()
    return false
  }
}

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

// const handleCustomGoogleLogin = () => {
//   if (window.google && window.google.accounts) {
//     window.google.accounts.id.prompt()
//   } else {
//     toastStore.error('Không tải được Google SDK')
//   }
// }

window.google.accounts.id.renderButton(
  document.getElementById('g_id_signin'),
  {
    theme: 'outline',
    size: 'large',
    type: 'standard', // Có thể là icon hoặc standard
    text: 'signin_with', // hoặc 'continue_with'
    shape: 'rectangular',
    width: 300,
  }
)

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


onMounted(async () => {
  // Khôi phục thông tin đăng nhập đã lưu với giải mã
  try {
    const isValid = await validateStoredCredentials()
    
    if (isValid) {
      const savedEmail = localStorage.getItem('remembered_email')
      const savedPassword = await secureLocalStorage.getItem('remembered_password_hash', savedEmail)
      
      if (savedEmail && savedPassword) {
        form.email = savedEmail
        form.password = savedPassword
        rememberMe.value = true
      }
    }
  } catch (error) {
    console.error('Failed to restore encrypted credentials:', error)
    // Clear corrupted data
    secureLocalStorage.clearCredentials()
  }

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
  /* padding: 0 1rem; */
  font-size: 0.875rem;
  /* color: #6b7280; */
  font-weight: 500;
}
</style>
