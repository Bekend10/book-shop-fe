<template>
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <div class="modal-header">
                <h2 class="modal-title">
                    {{ isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới' }}
                </h2>
                <button @click="closeModal" class="close-btn">
                    <X class="close-icon" />
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="modal-body">
                <!-- Tên danh mục -->
                <div class="form-group">
                    <label for="categoryName" class="form-label required">Tên danh mục</label>
                    <input 
                        id="categoryName" 
                        v-model="form.name" 
                        type="text" 
                        placeholder="Nhập tên danh mục..."
                        class="form-input dark:bg-gray-700 dark:text-gray-200" 
                        :class="{ 'error': errors.name }" 
                        required 
                    />
                    <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
                </div>

                <!-- Mô tả -->
                <div class="form-group">
                    <label for="description" class="form-label">Mô tả</label>
                    <textarea 
                        id="description" 
                        v-model="form.description" 
                        placeholder="Nhập mô tả danh mục..." 
                        rows="4"
                        class="form-textarea  dark:bg-gray-700 dark:text-gray-200" 
                        :class="{ 'error': errors.description }"
                    ></textarea>
                    <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
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
import { X } from 'lucide-vue-next'
import { useCategoryStore } from '@/stores/categoryStore'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    category: {
        type: Object,
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

const categoryStore = useCategoryStore()
const toastStore = useToastStore()

const isEditing = computed(() => !!props.category)
const loading = ref(false)

const form = reactive({
    name: '',
    description: ''
})

const errors = reactive({
    name: '',
    description: ''
})

const clearErrors = () => {
    errors.name = ''
    errors.description = ''
}

const resetForm = () => {
    form.name = ''
    form.description = ''
}

// Watch for category prop changes
watch(
    () => props.category,
    (newCategory) => {
        if (newCategory) {
            form.name = newCategory.name || ''
            form.description = newCategory.description || ''
        } else {
            resetForm()
        }
        clearErrors()
    },
    { immediate: true }
)

// Watch for show prop changes
watch(
    () => props.show,
    (show) => {
        if (show && !props.category) {
            resetForm()
        }
        clearErrors()
    }
)

const validateForm = () => {
    clearErrors()
    let isValid = true

    // Validate name
    if (!form.name.trim()) {
        errors.name = 'Tên danh mục là bắt buộc'
        isValid = false
    } else if (form.name.trim().length < 2) {
        errors.name = 'Tên danh mục phải có ít nhất 2 ký tự'
        isValid = false
    } else if (form.name.trim().length > 100) {
        errors.name = 'Tên danh mục không được vượt quá 100 ký tự'
        isValid = false
    }

    // Validate description
    if (form.description && form.description.length > 500) {
        errors.description = 'Mô tả không được vượt quá 500 ký tự'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) return

    loading.value = true

    // Prepare form data
    const categoryData = {
        name: form.name.trim(),
        description: form.description?.trim() || ''
    }
    
    try {
        let result
        
        if (isEditing.value && props.category?.category_id) {
            // Edit existing category
            result = await categoryStore.updateCategory(props.category.category_id, categoryData)
        } else {
            // Create new category
            result = await categoryStore.createCategory(categoryData)
        }
        
        if (result.success) {
            toastStore.success(isEditing.value ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục mới thành công!')
            emit('close')
        } else {
            toastStore.error(result.error || 'Không thể lưu thông tin danh mục')
        }
    } catch (error) {
        console.error('Submit category error:', error)
        toastStore.error('Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
        loading.value = false
    }
}

const closeModal = () => {
    if (!loading.value) {
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
    max-width: 28rem;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #d1d5db;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    /* color: #111827; */
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
    /* background: #f3f4f6; */
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
    /* color: #374151; */
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

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
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
:global(.dark) .modal-container {
    background: #0f172a; /* Match dark background */
    color: #cbd5e1; /* Text color for better readability */
}

:global(.dark) .modal-header {
    background: #1e293b; /* Header background */
    color: #e2e8f0; /* Header text color */
}

:global(.dark) .modal-title {
    color: #f9fafb;
}

:global(.dark) .close-btn {
    background: #374151;
}

:global(.dark) .close-btn:hover {
    background: #4b5563;
}

:global(.dark) .close-icon {
    color: #d1d5db;
}

:global(.dark) .form-label {
    color: #d1d5db;
}

:global(.dark) .form-input {
    background: #1e293b; /* Input background */
    border-color: #334155; /* Input border */
    color: #cbd5e1; /* Input text */
}

:global(.dark) .form-textarea {
    background: #1e293b; /* Textarea background */
    border-color: #334155; /* Textarea border */
    color: #cbd5e1; /* Textarea text */
}

:global(.dark) .modal-footer {
    border-color: #374151;
}

:global(.dark) .btn-secondary {
    background: #374151;
    color: #d1d5db;
}

:global(.dark) .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
}

/* Responsive */
@media (max-width: 640px) {
    .modal-container {
        margin: 0.5rem;
        max-width: none;
    }
    
    .modal-footer {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
    }
}
</style>
