<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h1>
                <p class="mt-2 text-gray-600 dark:text-gray-300">Quản lý thông tin tài khoản của bạn</p>
            </div>

            <!-- Profile Card -->
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <!-- Avatar Section -->
                <div class="px-6 py-8 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div class="flex items-center">
                        <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <img v-if="authStore.user?.profile_image" :src="authStore.user.profile_image"
                                alt="User Avatar" class="user-avatar-img" />
                            <User v-else class="user-icon-large" />
                        </div>
                        <div class="ml-6">
                            <h2 class="text-2xl font-bold text-white">
                                {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}
                            </h2>
                            <p class="text-blue-100">{{ authStore.user?.email }}</p>
                        </div>
                    </div>
                </div>

                <!-- Profile Form -->
                <div class="px-6 py-8">
                    <form @submit.prevent="updateProfile" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Họ *
                                </label>
                                <input v-model="profileForm.first_name" type="text" required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tên *
                                </label>
                                <input v-model="profileForm.last_name" type="text" required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email *
                            </label>
                            <input v-model="profileForm.email" type="email" required
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Số điện thoại
                            </label>
                            <input v-model="profileForm.phone_number" type="tel"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Địa chỉ
                            </label>
                            <textarea :value="fullAddress" rows="3" readonly
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                            </textarea>
                        </div>

                        <div class="flex justify-end space-x-3">
                            <button type="button" @click="resetForm"
                                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Hủy
                            </button>
                            <button type="submit" :disabled="isUpdating"
                                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center gap-2">
                                <Loader2 v-if="isUpdating" class="w-4 h-4 animate-spin" />
                                {{ isUpdating ? 'Đang cập nhật...' : 'Cập nhật thông tin' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Change Password Section -->
            <div
                class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">Đổi mật khẩu</h3>
                </div>

                <div class="px-6 py-8">
                    <form @submit.prevent="changePassword" class="space-y-6">
                        <input type="text" name="username" autocomplete="username" v-model="passwordForm.first_name"
                            class="hidden" />
                        <!-- Mật khẩu hiện tại -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mật khẩu hiện tại *
                            </label>
                            <input v-model="passwordForm.current_password" type="password" required
                                autocomplete="current-password"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                        </div>

                        <!-- Mật khẩu mới -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mật khẩu mới *
                            </label>
                            <input v-model="passwordForm.new_password" type="password" required minlength="6"
                                autocomplete="new-password"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                        </div>

                        <!-- Xác nhận mật khẩu mới -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Xác nhận mật khẩu mới *
                            </label>
                            <input v-model="passwordForm.confirm_password" type="password" required minlength="6"
                                autocomplete="new-password"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                        </div>

                        <div class="flex justify-end">
                            <button type="submit" :disabled="isChangingPassword"
                                class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors flex items-center gap-2">
                                <Loader2 v-if="isChangingPassword" class="w-4 h-4 animate-spin" />
                                {{ isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu' }}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { User, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { computed } from 'vue'
import axios from 'axios'

const fullAddress = computed(() => {
    const address = profileForm.address
    if (!address) return ''
    return `${address.house_number}, ${address.commune}, ${address.district}, ${address.councious}, ${address.country}`
})

const authStore = useAuthStore()
const toastStore = useToastStore()

const isUpdating = ref(false)
const isChangingPassword = ref(false)

const profileForm = reactive({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: ''
})

const passwordForm = reactive({
    current_password: '',
    new_password: '',
    confirm_password: ''
})

const extractAddressParts = (addressString) => {
    if (!addressString) return {}

    const parts = addressString.split(',').map(part => part.trim())

    return {
        house_number: parts[0] || '',
        commune: parts[1] || '',
        district: parts[2] || '',
        councious: parts[3] || '',
        country: parts[4] || ''
    }
}

const initForm = () => {
    if (authStore.user) {
        profileForm.first_name = authStore.user.first_name || ''
        profileForm.last_name = authStore.user.last_name || ''
        profileForm.email = authStore.user.email || ''
        profileForm.phone_number = authStore.user.phone_number || ''
        profileForm.address = authStore.user.address || ''
    }
}

const resetForm = () => {
    initForm()
}

const updateProfile = async () => {
    isUpdating.value = true
    try {
        profileForm.address = extractAddressParts(fullAddress.value)
        await axios.put('/users/update-user?id=' + authStore.user.user_id, profileForm)

        toastStore.success('Cập nhật thông tin thành công!')
    } catch (error) {
        toastStore.error('Có lỗi xảy ra khi cập nhật thông tin')
        console.error('Error updating profile:', error)
    } finally {
        isUpdating.value = false
    }
}

const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
        toastStore.error('Mật khẩu xác nhận không khớp')
        return
    }

    isChangingPassword.value = true
    try {
        // Thực tế bạn sẽ gọi API để đổi mật khẩu
        const response = await axios.put('/accounts/change-password', {
            account_id: authStore.user.account_id,
            old_password: passwordForm.current_password,
            new_password: passwordForm.new_password
        })

        if (response.data.status !== 200) {
            toastStore.error(response.data.msg)
            return
        }
        // await authStore.changePassword(passwordForm)

        // Reset form
        passwordForm.current_password = ''
        passwordForm.new_password = ''
        passwordForm.confirm_password = ''

        toastStore.success('Đổi mật khẩu thành công!')
    } catch (error) {
        toastStore.error('Có lỗi xảy ra khi đổi mật khẩu')
        console.error('Error changing password:', error)
    } finally {
        isChangingPassword.value = false
    }
}

onMounted(() => {
    initForm()
})
</script>
<style>
.user-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}
</style>
