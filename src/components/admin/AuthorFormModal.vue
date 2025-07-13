<template>
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">
                    {{ isEditing ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới' }}
                </h2>
                <button @click="closeModal" class="close-btn">
                    <X class="close-icon" />
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="modal-body">
                <!-- Ảnh đại diện -->
                <div class="form-group">
                    <label class="form-label">Ảnh đại diện</label>
                    <div class="image-upload-section">
                        <div class="current-image">
                            <div class="image-preview">
                                <img v-if="previewImage" :src="previewImage" alt="Preview" class="preview-img" />
                                <div v-else class="preview-placeholder">
                                    <User class="placeholder-icon" />
                                    <span class="placeholder-text">Chưa có ảnh</span>
                                </div>
                            </div>
                        </div>

                        <div class="image-actions">
                            <input ref="imageInput" type="file" accept="image/*" @change="handleImageChange"
                                class="file-input" />
                            <button type="button" @click="$refs.imageInput.click()" class="btn btn-outline">
                                <Upload class="btn-icon" />
                                Chọn ảnh
                            </button>
                            <button v-if="form.image_url" type="button" @click="removeImage"
                                class="btn btn-outline-danger">
                                <Trash2 class="btn-icon" />
                                Xóa ảnh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tên tác giả -->
                <div class="form-group">
                    <label for="authorName" class="form-label required">Tên tác giả</label>
                    <input id="authorName" v-model="form.name" type="text" placeholder="Nhập tên tác giả..."
                        class="form-input" :class="{ 'error': errors.name }" required />
                    <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
                </div>

                <!-- Quốc tịch -->
                <div class="form-group">
                    <label for="nationality" class="form-label">Quốc tịch</label>
                    <input id="nationality" v-model="form.nationally" type="text" placeholder="Nhập quốc tịch..."
                        class="form-input" :class="{ 'error': errors.nationally }" />
                    <span v-if="errors.nationally" class="error-text">{{ errors.nationally }}</span>
                </div>

                <!-- Ngày sinh -->
                <div class="form-group">
                    <label for="birthDate" class="form-label">Ngày sinh</label>
                    <input id="birthDate" v-model="form.dob" type="date" class="form-input"
                        :class="{ 'error': errors.dob }" />
                    <span v-if="errors.dob" class="error-text">{{ errors.dob }}</span>
                </div>

                <!-- Tiểu sử -->
                <div class="form-group">
                    <label for="bio" class="form-label">Tiểu sử</label>
                    <textarea id="bio" v-model="form.bio" placeholder="Nhập tiểu sử tác giả..." rows="4"
                        class="form-textarea" :class="{ 'error': errors.bio }"></textarea>
                    <span v-if="errors.bio" class="error-text">{{ errors.bio }}</span>
                </div>
            </form>

            <div class="modal-footer">
                <button type="button" @click="closeModal" class="btn btn-secondary" :disabled="loading">
                    Hủy
                </button>
                <button type="submit" @click="handleSubmit" class="btn btn-primary" :disabled="loading">
                    <div v-if="loading" class="loading-spinner"></div>
                    {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { X, User, Upload, Trash2 } from 'lucide-vue-next'
import { useAuthorStore } from '@/stores/authorStore'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    author: {
        type: Object,
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

const authorStore = useAuthorStore()
const toastStore = useToastStore()

const isEditing = computed(() => !!props.author)

const form = reactive({
    name: '',
    nationally: '',
    dob: '',
    bio: '',
    image_url: '',
    image: null
})

const errors = reactive({
    name: '',
    nationally: '',
    dob: '',
    bio: '',
    image_url: '',
    image: null
})

const imageInput = ref(null)

// Reset form khi modal đóng/mở
watch(() => props.show, (newShow) => {
    if (newShow) {
        resetForm()
        if (props.author) {
            // Load dữ liệu author để edit
            Object.assign(form, {
                name: props.author.name || '',
                nationally: props.author.nationally || '', // Sửa: dùng nationality từ API
                dob: props.author.dob ? props.author.dob.split('T')[0] : '',
                bio: props.author.bio || '',
                image_url: props.author.image_url || ''
            })
            // Hiển thị preview image nếu có
            if (props.author.image_url) {
                previewImage.value = props.author.image_url
            }
        }
    }
})

const resetForm = () => {
    Object.assign(form, {
        name: '',
        nationally: '',
        dob: '',
        bio: '',
        image_url: '',
        image: null
    })
    previewImage.value = ''
    clearErrors()
}

const clearErrors = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })
}

const validateForm = () => {
    clearErrors()
    let isValid = true

    if (!form.name.trim()) {
        errors.name = 'Tên tác giả là bắt buộc'
        isValid = false
    } else if (form.name.trim().length < 2) {
        errors.name = 'Tên tác giả phải có ít nhất 2 ký tự'
        isValid = false
    }

    if (form.nationally && form.nationally.trim().length < 2) {
        errors.nationally = 'Quốc tịch phải có ít nhất 2 ký tự'
        isValid = false
    }

    if (form.dob) {
        const birthDate = new Date(form.dob)
        const today = new Date()
        if (birthDate > today) {
            errors.dob = 'Ngày sinh không thể lớn hơn ngày hiện tại'
            isValid = false
        }
    }

    if (form.bio && form.bio.trim().length > 1000) {
        errors.bio = 'Tiểu sử không được vượt quá 1000 ký tự'
        isValid = false
    }

    return isValid
}

const previewImage = ref('')

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errors.image_url = 'Vui lòng chọn file ảnh hợp lệ'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errors.image_url = 'Kích thước ảnh không được vượt quá 5MB'
    return
  }

  form.image = file
  form.image_url = file.name // chỉ để giữ tên file, không dùng cho preview

  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
    errors.image_url = ''
  }
  reader.readAsDataURL(file)
}



const removeImage = () => {
    form.image_url = ''
    form.image = null
    previewImage.value = ''
    if (imageInput.value) {
        imageInput.value.value = ''
    }
}

const handleSubmit = async () => {
    if (!validateForm()) return

    // Tạo object data (theo cách authorStore)
    const authorData = {
        name: form.name,
        bio: form.bio || '',
        dob: form.dob || '',
        nationally: form.nationally || '', // form.nationally nhưng gửi là nationality
    }
    
    // Xử lý image: nếu có file mới thì gửi file, nếu không thì gửi image_url hiện tại
    if (form.image) {
        authorData.image_url = form.image
    } else if (form.image_url) {
        authorData.image_url = form.image_url
    }
    
    try {
        let result
        
        if (isEditing.value && props.author?.author_id) {
            // Edit existing author
            result = await authorStore.updateAuthor(props.author.author_id, authorData)
        } else {
            // Create new author
            result = await authorStore.createAuthor(authorData)
        }
        
        if (result.data.status === 200 || result.data.status === 201) {
            toastStore.success(isEditing.value ? 'Cập nhật tác giả thành công!' : 'Thêm tác giả mới thành công!')
            // Refresh lại danh sách authors
            await authorStore.fetchAuthors()
            emit('close')
        } else {
            toastStore.error(result.error || 'Không thể lưu thông tin tác giả')
        }
    } catch (error) {
        console.error('Submit author error:', error)
        toastStore.error('Đã có lỗi xảy ra. Vui lòng thử lại.')
    }
}

const closeModal = () => {
    if (!props.loading) {
        emit('close')
    }
}

</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
}

.modal-container {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 32rem;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    border: none;
    background: #f3f4f6;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.close-btn:hover {
    background: #e5e7eb;
}

.close-icon {
    width: 1rem;
    height: 1rem;
    color: #6b7280;
}

.modal-body {
    padding: 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
}

.form-label.required::after {
    content: ' *';
    color: #dc2626;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    outline: none;
    font-size: 0.875rem;
    transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-textarea.error {
    border-color: #dc2626;
}

.form-textarea {
    resize: vertical;
    min-height: 6rem;
}

.error-text {
    display: block;
    font-size: 0.75rem;
    color: #dc2626;
    margin-top: 0.25rem;
}

.image-upload-section {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.current-image {
    flex-shrink: 0;
}

.image-preview {
    width: 6rem;
    height: 6rem;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 2px dashed #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    color: #6b7280;
}

.placeholder-icon {
    width: 1.5rem;
    height: 1.5rem;
}

.placeholder-text {
    font-size: 0.75rem;
}

.image-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
}

.file-input {
    display: none;
}

.btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    min-height: 2.5rem;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #2563eb;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
}

.btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
}

.btn-outline {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-outline:hover {
    background: #f9fafb;
}

.btn-outline-danger {
    background: white;
    color: #dc2626;
    border: 1px solid #dc2626;
}

.btn-outline-danger:hover {
    background: #fef2f2;
}

.btn-icon {
    width: 1rem;
    height: 1rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Dark mode */
.dark .modal-overlay {
    background: rgba(0, 0, 0, 0.7);
}

.dark .modal-container {
    background: #1f2937;
    border: 1px solid #374151;
}

.dark .modal-header {
    border-bottom-color: #374151;
}

.dark .modal-title {
    color: #f3f4f6;
}

.dark .close-btn {
    background: #374151;
    color: #d1d5db;
}

.dark .close-btn:hover {
    background: #4b5563;
}

.dark .close-icon {
    color: #d1d5db;
}

.dark .form-label {
    color: #d1d5db;
}

.dark .form-input,
.dark .form-textarea {
    background: #374151;
    border-color: #4b5563;
    color: #f3f4f6;
}

.dark .form-input::placeholder,
.dark .form-textarea::placeholder {
    color: #9ca3af;
}

.dark .form-input:focus,
.dark .form-textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.dark .form-input.error,
.dark .form-textarea.error {
    border-color: #ef4444;
}

.dark .image-preview {
    border-color: #4b5563;
    background: #374151;
}

.dark .preview-placeholder {
    color: #9ca3af;
}

.dark .placeholder-icon {
    color: #6b7280;
}

.dark .btn-secondary {
    background: #374151;
    color: #d1d5db;
}

.dark .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
}

.dark .btn-outline {
    background: #374151;
    color: #d1d5db;
    border-color: #4b5563;
}

.dark .btn-outline:hover {
    background: #4b5563;
    border-color: #6b7280;
}

.dark .btn-outline-danger {
    background: #374151;
    color: #f87171;
    border-color: #dc2626;
}

.dark .btn-outline-danger:hover {
    background: #422006;
    border-color: #f87171;
}

.dark .modal-footer {
    border-top-color: #374151;
}

/* Responsive */
@media (max-width: 640px) {
    .modal-container {
        margin: 0.5rem;
        max-width: none;
    }

    .image-upload-section {
        flex-direction: column;
    }

    .modal-footer {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>
