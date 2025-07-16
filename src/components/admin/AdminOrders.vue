<template>
    <div class="orders-page">
        <!-- Header -->
        <div class="page-header">
            <h1 class="page-title">Quản lý đơn hàng</h1>
            <div class="page-actions">
                <button @click="refreshOrders" class="btn btn-secondary" :disabled="isLoading">
                    <RefreshCw class="btn-icon" :class="{ 'animate-spin': isLoading }" />
                    Làm mới
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <ShoppingCart />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Tổng đơn hàng</h3>
                    <p class="stat-value">{{ orderStats.total }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <Clock />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Chờ xử lý</h3>
                    <p class="stat-value">{{ orderStats.pending }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Đã giao</h3>
                    <p class="stat-value">{{ orderStats.delivered }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <DollarSign />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">Doanh thu</h3>
                    <p class="stat-value">{{ formatCurrency(orderStats.revenue) }}</p>
                </div>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="table-container">
            <OrderTable :orders="orderStore.orders" :loading="isLoading" @view-details="showOrderDetails"
                @update-status="showStatusModal" @delete-order="handleDeleteOrder" />
        </div>

        <!-- Modals -->
        <OrderDetailsModal :show="showDetailsModal" :order="selectedOrder" @close="closeDetailsModal"
            @update-status="showStatusModal" />

        <OrderStatusModal :show="showUpdateModal" :order="selectedOrder" @close="closeStatusModal"
            @updated="handleStatusUpdate" />

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
            <div class="modal-container bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <div class="modal-header">
                    <h2 class="modal-title">Xác nhận xóa đơn hàng</h2>
                    <button @click="closeDeleteModal" class="close-btn">
                        <X class="close-icon" />
                    </button>
                </div>
                <div class="modal-body">
                    <p>Bạn có chắc chắn muốn xóa đơn hàng #{{ orderToDelete?.order_id }}?</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Hành động này không thể hoàn tác.</p>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteModal" class="btn btn-secondary">
                        Hủy
                    </button>
                    <button @click="confirmDeleteOrder" class="btn btn-danger" :disabled="isDeleting">
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
    ShoppingCart,
    Clock,
    CheckCircle,
    DollarSign,
    X
} from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'
import { useToastStore } from '@/stores/toastStore'
import OrderTable from '@/components/admin/OrderTable.vue'
import OrderDetailsModal from '@/components/admin/OrderDetailsModal.vue'
import OrderStatusModal from '@/components/admin/OrderStatusModal.vue'
import Toast from '@/components/Toast.vue'

// Store
const orderStore = useOrderStore()
const toastStore = useToastStore()

// State
const isLoading = ref(false)

// Modal states
const showDetailsModal = ref(false)
const showUpdateModal = ref(false)
const showDeleteModal = ref(false)
const selectedOrder = ref(null)
const orderToDelete = ref(null)
const isDeleting = ref(false)

// Computed
const orderStats = computed(() => {
    const orders = orderStore.orders
    return {
        total: orders.length,
        pending: orders.filter(o => o.status === 0).length,
        delivered: orders.filter(o => o.status === 3).length,
        revenue: orders
            .filter(o => o.status === 3)
            .reduce((sum, o) => sum + o.total_amount, 0)
    }
})

// Methods
const fetchOrders = async () => {
    isLoading.value = true
    try {
        await orderStore.fetchOrders()
    } catch (error) {
        console.error('Error fetching orders:', error)
        
        // Show error toast
        toastStore.addToast(
            'Có lỗi xảy ra khi tải danh sách đơn hàng',
            'error',
            5000
        );
    } finally {
        isLoading.value = false
    }
}

const refreshOrders = async () => {
    try {
        await fetchOrders()
        
        // Show success toast for manual refresh
        toastStore.addToast(
            'Đã làm mới danh sách đơn hàng',
            'success',
            2000
        );
    } catch (error) {
        console.error('Error refreshing orders:', error)
    }
}

const showOrderDetails = (order) => {
    selectedOrder.value = order
    showDetailsModal.value = true
}

const closeDetailsModal = () => {
    showDetailsModal.value = false
    selectedOrder.value = null
}

const showStatusModal = (order) => {
    selectedOrder.value = order
    showUpdateModal.value = true
    showDetailsModal.value = false
}

const closeStatusModal = () => {
    showUpdateModal.value = false
    selectedOrder.value = null
}

const handleStatusUpdate = async ({ orderId, updateData }) => {
    console.log('handleStatusUpdate called with:', { orderId, updateData });
    
    try {
        const result = await orderStore.updateOrderStatus(orderId, updateData);
        console.log('Update result:', result);
        
        if (result.success) {
            // Show success toast
            toastStore.addToast(
                'Cập nhật trạng thái đơn hàng thành công!',
                'success',
                3000
            );
            
            // Refresh orders after update
            await fetchOrders();
        } else {
            console.error('Update failed:', result.error);
            
            // Show error toast
            toastStore.addToast(
                result.error || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng',
                'error',
                5000
            );
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        
        // Show error toast
        toastStore.addToast(
            'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng',
            'error',
            5000
        );
    }
}

const handleDeleteOrder = (order) => {
    orderToDelete.value = order
    showDeleteModal.value = true
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    orderToDelete.value = null
}

const confirmDeleteOrder = async () => {
    if (!orderToDelete.value) return

    isDeleting.value = true
    try {
        const result = await orderStore.deleteOrder(orderToDelete.value.order_id)
        
        if (result.success) {
            // Show success toast
            toastStore.addToast(
                'Xóa đơn hàng thành công!',
                'success',
                3000
            );
            
            closeDeleteModal()
            await fetchOrders()
        } else {
            // Show error toast
            toastStore.addToast(
                result.error || 'Có lỗi xảy ra khi xóa đơn hàng',
                'error',
                5000
            );
        }
    } catch (error) {
        console.error('Error deleting order:', error)
        
        // Show error toast
        toastStore.addToast(
            'Có lỗi xảy ra khi xóa đơn hàng',
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
    fetchOrders()
})
</script>

<style scoped>
.orders-page {
    max-width: 100%;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.page-title {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0;
    color: #111827;
}

.page-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
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

.btn-icon {
    width: 1rem;
    height: 1rem;
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    /* background: white; */
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;
}

.stat-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
    /* color: #6b7280; */
    margin: 0 0 0.25rem 0;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    /* color: #111827; */
    margin: 0;
}

.table-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    overflow: hidden;
    margin-bottom: 2rem;
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
:global(.dark) .page-title {
    color: #f9fafb;
}

:global(.dark) .btn-secondary {
    background: #374151;
    color: #d1d5db;
}

:global(.dark) .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
}

:global(.dark) .stat-card {
    background: #1f2937;
    border-color: #374151;
}

:global(.dark) .stat-title {
    color: #9ca3af;
}

:global(.dark) .stat-value {
    color: #f9fafb;
}

:global(.dark) .table-container {
    background: #1f2937;
    border-color: #374151;
}

:global(.dark) .pagination-info {
    color: #9ca3af;
}

:global(.dark) .pagination-btn,
:global(.dark) .pagination-number {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
}

:global(.dark) .pagination-btn:hover:not(:disabled),
:global(.dark) .pagination-number:hover {
    background: #4b5563;
}

:global(.dark) .pagination-number.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
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

:global(.dark) .modal-footer {
    border-color: #374151;
}

/* Responsive */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: stretch;
    }

    .page-actions {
        flex-direction: column;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
