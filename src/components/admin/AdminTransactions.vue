<template>
    <div class="transactions-page">
        <!-- Header -->
        <div class="page-header">
            <h1 class="page-title">Quản lý giao dịch</h1>
            <div class="page-actions">
                <button @click="refreshTransactions" class="btn btn-secondary" :disabled="isLoading">
                    <RefreshCw class="btn-icon" :class="{ 'animate-spin': isLoading }" />
                    Làm mới
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <CreditCard />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Tổng giao dịch</h3>
                    <p class="stat-value">{{ transactionStats.total }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <Clock />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Đang chờ</h3>
                    <p class="stat-value">{{ transactionStats.pending }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Hoàn thành</h3>
                    <p class="stat-value">{{ transactionStats.completed }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <DollarSign />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Doanh thu</h3>
                    <p class="stat-value">{{ formatCurrency(transactionStats.revenue) }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <XCircle />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Thất bại</h3>
                    <p class="stat-value">{{ transactionStats.failed }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <RotateCcw />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Hoàn tiền</h3>
                    <p class="stat-value">{{ transactionStats.refunded }}</p>
                </div>
            </div>
        </div>

        <!-- Transactions Table -->
        <div class="table-container">
            <TransactionTable 
                :transactions="transactionStore.transactions" 
                :loading="isLoading" 
                @view-details="showTransactionDetails"
                @update-status="showStatusModal" 
                @delete-transaction="handleDeleteTransaction" 
            />
        </div>

        <!-- Modals -->
        <TransactionDetailsModal 
            :show="showDetailsModal" 
            :transaction="selectedTransaction" 
            @close="closeDetailsModal"
            @update-status="showStatusModal" 
        />

        <TransactionStatusModal 
            :show="showUpdateModal" 
            :transaction="selectedTransaction" 
            @close="closeStatusModal"
            @updated="handleStatusUpdate" 
        />

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
            <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <div class="modal-header">
                    <h3 class="modal-title">Xác nhận xóa</h3>
                    <button @click="closeDeleteModal" class="close-btn">
                        <X class="close-icon" />
                    </button>
                </div>
                <div class="modal-body">
                    <p class="delete-message">
                        Bạn có chắc chắn muốn xóa giao dịch 
                        <span class="font-semibold">#{{ transactionToDelete?.transaction_id }}</span>?
                    </p>
                    <p class="delete-warning">Hành động này không thể hoàn tác!</p>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteModal" class="btn btn-secondary">
                        Hủy
                    </button>
                    <button @click="confirmDeleteTransaction" class="btn btn-danger" :disabled="isDeleting">
                        <span v-if="isDeleting" class="loading-spinner"></span>
                        {{ isDeleting ? 'Đang xóa...' : 'Xóa' }}
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Toast Component -->
        <Toast />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
    RefreshCw,
    CreditCard,
    Clock,
    CheckCircle,
    DollarSign,
    XCircle,
    RotateCcw,
    X
} from 'lucide-vue-next'
import { useTransactionStore } from '@/stores/transactionStore'
import { useToastStore } from '@/stores/toastStore'
import TransactionTable from '@/components/admin/TransactionTable.vue'
import TransactionDetailsModal from '@/components/admin/TransactionDetailsModal.vue'
import TransactionStatusModal from '@/components/admin/TransactionStatusModal.vue'
import Toast from '@/components/Toast.vue'

// Store
const transactionStore = useTransactionStore()
const toastStore = useToastStore()

// State
const isLoading = ref(false)

// Modal states
const showDetailsModal = ref(false)
const showUpdateModal = ref(false)
const showDeleteModal = ref(false)
const selectedTransaction = ref(null)
const transactionToDelete = ref(null)
const isDeleting = ref(false)

// Computed
const transactionStats = computed(() => {
    const stats = transactionStore.transactionsByStatus
    return {
        total: transactionStore.totalTransactions,
        pending: stats.pending,
        completed: stats.completed,
        failed: stats.failed,
        refunded: stats.refunded,
        revenue: transactionStore.totalRevenue
    }
})

// Methods
const fetchTransactions = async () => {
    isLoading.value = true
    try {
        await transactionStore.fetchTransactions()
    } catch (error) {
        console.error('Error fetching transactions:', error)
        
        // Show error toast
        toastStore.addToast(
            'Có lỗi xảy ra khi tải danh sách giao dịch',
            'error',
            5000
        );
    } finally {
        isLoading.value = false
    }
}

const refreshTransactions = async () => {
    try {
        await fetchTransactions()
        
        // Show success toast for manual refresh
        toastStore.addToast(
            'Đã làm mới danh sách giao dịch',
            'success',
            2000
        );
    } catch (error) {
        console.error('Error refreshing transactions:', error)
    }
}

const showTransactionDetails = (transaction) => {
    selectedTransaction.value = transaction
    showDetailsModal.value = true
}

const closeDetailsModal = () => {
    showDetailsModal.value = false
    selectedTransaction.value = null
}

const showStatusModal = (transaction) => {
    selectedTransaction.value = transaction
    showUpdateModal.value = true
}

const closeStatusModal = () => {
    showUpdateModal.value = false
    selectedTransaction.value = null
}

const handleStatusUpdate = async ({ transactionId, updateData }) => {
    console.log('handleStatusUpdate called with:', { transactionId, updateData });
    
    try {
        const result = await transactionStore.updateTransactionStatus(transactionId, updateData);
        console.log('Update result:', result);
        
        if (result.success) {
            // Show success toast
            toastStore.addToast(
                'Cập nhật trạng thái giao dịch thành công!',
                'success',
                3000
            );
            
            // Refresh transactions after update
            await fetchTransactions();
        } else {
            console.error('Update failed:', result.error);
            
            // Show error toast
            toastStore.addToast(
                result.error || 'Có lỗi xảy ra khi cập nhật trạng thái giao dịch',
                'error',
                5000
            );
        }
    } catch (error) {
        console.error('Error updating transaction status:', error);
        
        // Show error toast
        toastStore.addToast(
            'Có lỗi xảy ra khi cập nhật trạng thái giao dịch',
            'error',
            5000
        );
    }
}

const handleDeleteTransaction = (transaction) => {
    transactionToDelete.value = transaction
    showDeleteModal.value = true
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    transactionToDelete.value = null
}

const confirmDeleteTransaction = async () => {
    if (!transactionToDelete.value) return

    isDeleting.value = true
    try {
        const result = await transactionStore.deleteTransaction(transactionToDelete.value.transaction_id)
        
        if (result.success) {
            // Show success toast
            toastStore.addToast(
                'Xóa giao dịch thành công!',
                'success',
                3000
            );
            
            closeDeleteModal()
            await fetchTransactions()
        } else {
            // Show error toast
            toastStore.addToast(
                result.error || 'Có lỗi xảy ra khi xóa giao dịch',
                'error',
                5000
            );
        }
    } catch (error) {
        console.error('Error deleting transaction:', error)
        
        // Show error toast
        toastStore.addToast(
            'Có lỗi xảy ra khi xóa giao dịch',
            'error',
            5000
        );
    } finally {
        isDeleting.value = false
    }
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

// Lifecycle
onMounted(() => {
    fetchTransactions()
})
</script>

<style scoped>
.transactions-page {
    /* padding: 1.5rem; */
    max-width: 1400px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.page-title {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0;
}

.page-actions {
    display: flex;
    gap: 0.75rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    /* background: white; */
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    flex-shrink: 0;
}

.stat-content {
    flex: 1;
}

.stat-title {
    font-size: 0.875rem;
    font-weight: 500;
    /* color: #6b7280; */
    margin: 0 0 0.25rem 0;
}

.stat-value {
    font-size: 1rem;
    font-weight: 700;
    /* color: #111827; */
    margin: 0;
}

.table-container {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-icon {
    width: 1rem;
    height: 1rem;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
}

.btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
}

.btn-danger {
    background: #dc2626;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #b91c1c;
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Modal styles */
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
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    font-size: 1.125rem;
    font-weight: 600;
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
}

.delete-message {
    margin: 0 0 0.5rem 0;
    color: #374151;
}

.delete-warning {
    margin: 0;
    font-size: 0.875rem;
    color: #dc2626;
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
}

/* Dark mode */
:global(.dark) .transactions-page {
    color: #f9fafb;
}

:global(.dark) .page-title {
    color: #f9fafb;
}

:global(.dark) .stat-card {
    background: #1f2937;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

:global(.dark) .stat-title {
    color: #9ca3af;
}

:global(.dark) .stat-value {
    color: #f9fafb;
}

:global(.dark) .table-container {
    background: #1f2937;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

:global(.dark) .modal-container {
    background: #1f2937;
}

:global(.dark) .modal-header {
    border-color: #374151;
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

:global(.dark) .delete-message {
    color: #d1d5db;
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
@media (max-width: 768px) {
    .transactions-page {
        padding: 1rem;
    }
    
    .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .stat-card {
        padding: 1rem;
    }
    
    .modal-container {
        margin: 0.5rem;
        max-width: none;
    }
    
    .modal-footer {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
