# BookShop - Cửa hàng sách trực tuyến

Một ứng dụng web bán sách trực tuyến đầy đủ tính năng được xây dựng với Vue 3, TailwindCSS và Pinia.

## Tính năng chính

- 🏠 **Trang chủ**: Hiển thị sách nổi bật và sách bán chạy từ API
- 🔍 **Tìm kiếm**: Tìm kiếm sách theo tên, ## Đóng góp

1. Fork dự án
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Quy tắc đóng góp
- Tuân thủ Vue 3 Composition API
- Sử dụng TypeScript cho type safety (nếu có)
- Viết tests cho các tính năng mới
- Tuân thủ ESLint và Prettier configuration
- Cập nhật documentation khi cần thiết

## Roadmap

- [ ] **Mobile App**: React Native/Flutter version
- [ ] **PWA Enhancement**: Offline support, push notifications  
- [ ] **Real-time Features**: WebSocket integration cho live updates
- [ ] **AI Integration**: Recommendation system
- [ ] **Multi-language**: i18n support
- [ ] **Advanced Analytics**: User behavior tracking
- [ ] **Payment Expansion**: Thêm các gateway khác
- [ ] **Social Features**: Social login mở rộng, sharing

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Liên hệ

- **Email**: bekendwork@gmail.com
- **GitHub**: [bekend10](https://github.com/bekend10)
- **Project Link**: [https://github.com/bekend10/book-shop-fe](https://github.com/bekend10/book-shop-fe)

---

⭐ **Nếu dự án này hữu ích cho bạn, hãy cho một star nhé!** ⭐c nâng cao
- 📚 **Chi tiết sách**: Xem thông tin chi tiết, đánh giá và hệ thống review
- 🛒 **Giỏ hàng**: Thêm/xóa sách, điều chỉnh số lượng với persistence
- 💳 **Thanh toán**: Tích hợp VNPay và FE Home payment gateway
- 👤 **Xác thực**: Đăng nhập/đăng ký với Google, Facebook và refresh token tự động
- 📝 **Đánh giá sản phẩm**: Hệ thống review với upload hình ảnh
- 🎯 **Quản lý Admin**: Dashboard hoàn chỉnh với quản lý sách, danh mục, tác giả
- 📊 **Báo cáo doanh thu**: Thống kê và phân tích doanh thu chi tiết
- 👥 **Quản lý người dùng**: Quản lý tài khoản và phân quyền
- 🌙 **Dark mode**: Chế độ tối/sáng với persistence
- 📱 **Responsive**: Tương thích hoàn toàn trên mọi thiết bị

## Công nghệ sử dụng

- **Vue 3**: Framework JavaScript với Composition API
- **Pinia**: State management hiện đại
- **Vue Router**: Điều hướng với route guards
- **TailwindCSS**: Utility-first CSS framework
- **Vite**: Build tool nhanh và hiện đại
- **Lucide Vue Next**: Thư viện icon đẹp và nhẹ
- **Axios**: HTTP client với interceptors
- **VueUse**: Tập hợp composables hữu ích
- **Vue3 Google Login**: Tích hợp đăng nhập Google
- **Vue3 Datepicker**: Component chọn ngày

## Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js (phiên bản 16+)
- npm hoặc yarn

### Cài đặt dependencies

```bash
npm install
```

### Chạy ở môi trường development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Build cho production

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

## Cấu trúc dự án

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.vue
│   │   └── Footer.vue
│   ├── admin/
│   │   ├── AdminSidebar.vue
│   │   ├── BookTable.vue
│   │   ├── BookFormModal.vue
│   │   ├── CategoryTable.vue
│   │   ├── AuthorTable.vue
│   │   ├── UserTable.vue
│   │   ├── OrderTable.vue
│   │   ├── TransactionTable.vue
│   │   └── RevenueReport.vue
│   ├── reviews/
│   │   ├── ReviewsList.vue
│   │   ├── ReviewForm.vue
│   │   └── ReviewsContainer.vue
│   ├── modals/
│   │   ├── OrderDetailModal.vue
│   │   └── ConfirmCancelModal.vue
│   ├── BookCard.vue
│   ├── BookList.vue
│   └── Toast.vue
├── views/
│   ├── Home.vue
│   ├── BookDetail.vue
│   ├── Cart.vue
│   ├── Checkout.vue
│   ├── Login.vue
│   ├── Profile.vue
│   ├── Orders.vue
│   ├── Admin.vue
│   ├── Authors.vue
│   ├── Category.vue
│   ├── NotFound.vue
│   ├── admin/
│   │   ├── RevenueManagement.vue
│   │   └── UserManagement.vue
│   └── payment/
│       ├── VNPayCallback.vue
│       └── FEHomeCallback.vue
├── stores/
│   ├── authStore.js
│   ├── bookStore.js
│   ├── cartStore.js
│   ├── categoryStore.js
│   ├── authorStore.js
│   ├── orderStore.js
│   ├── userStore.js
│   ├── transactionStore.js
│   ├── revenueStore.js
│   ├── reviewStore.js
│   └── toastStore.js
├── utils/
│   ├── axios.js
│   ├── mockAuth.js
│   └── tokenRefresh.js
├── composables/
│   └── useTokenRefresh.js
├── router/
│   └── index.js
├── App.vue
├── main.js
└── style.css
```

## Tính năng chi tiết

### 🏠 Trang chủ
- Hero section với call-to-action
- Danh sách sách bán chạy từ API
- Bộ lọc theo danh mục động
- Tìm kiếm sách real-time
- Thống kê tổng quan
- Pagination và loading states

### 📚 Trang chi tiết sách
- Gallery hình ảnh với zoom
- Thông tin chi tiết (tên, tác giả, giá, đánh giá)
- Hệ thống đánh giá và review với hình ảnh
- Điều chỉnh số lượng và thêm vào giỏ
- Sách liên quan
- Breadcrumb navigation

### 🛒 Giỏ hàng
- Hiển thị danh sách sách đã chọn
- Điều chỉnh số lượng real-time
- Xóa sách khỏi giỏ với animation
- Tính tổng tiền tự động
- Persistence across sessions
- Empty state handling

### 💳 Thanh toán
- Form thông tin khách hàng với validation
- Tích hợp VNPay payment gateway
- Tích hợp FE Home payment
- Callback handling cho các payment methods
- Order confirmation và tracking
- Email notifications

### 👤 Xác thực & Tài khoản
- Đăng nhập/đăng ký truyền thống
- Đăng nhập Google OAuth2
- Đăng nhập Facebook
- Refresh token tự động
- Route guards và middleware
- Profile management
- Order history

### 📝 Hệ thống đánh giá
- Tạo review với rating 1-5 sao
- Upload hình ảnh cho review
- Hiển thị review với pagination
- Rating summary và statistics
- Authentication required
- Moderation system

### 🎯 Admin Dashboard
- **Quản lý sách**: CRUD operations với upload hình
- **Quản lý danh mục**: Category management
- **Quản lý tác giả**: Author management
- **Quản lý đơn hàng**: Order tracking và status updates
- **Quản lý người dùng**: User management và permissions
- **Báo cáo doanh thu**: Revenue analytics với charts
- **Quản lý giao dịch**: Transaction monitoring
- Bulk operations và data export

### 📊 Báo cáo & Thống kê
- Doanh thu theo thời gian
- Top sản phẩm bán chạy
- Phân tích theo danh mục
- Export Excel/PDF reports
- Interactive charts
- Filter và date range selection

## Cấu hình môi trường

Tạo file `.env` trong thư mục root với các biến sau:

```env
# API Configuration
VITE_API_URL=https://localhost:7096/api/v1

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Facebook OAuth  
VITE_FACEBOOK_APP_ID=your_facebook_app_id

# Payment Gateways
VITE_VNPAY_URL=your_vnpay_url
VITE_FE_HOME_URL=your_fe_home_url
```

## API Integration

Dự án này tích hợp với backend API với các endpoints:

- **Authentication**: `/accounts/login`, `/accounts/register`, `/accounts/refresh-token`
- **Books**: `/books`, `/books/{id}`, `/books/top-products`
- **Categories**: `/categories`
- **Authors**: `/authors`  
- **Orders**: `/orders`
- **Reviews**: `/bookreviews/create-review-book`, `/bookreviews/get-all-reviews`
- **Payments**: VNPay và FE Home integration

## Tùy chỉnh

### Thêm tính năng mới
Dự án có kiến trúc modular, dễ dàng mở rộng:
- Tạo store mới trong `src/stores/`
- Thêm component trong thư mục tương ứng
- Định nghĩa route trong `src/router/index.js`
- Sử dụng composables cho logic tái sử dụng

### Tùy chỉnh API
- Cấu hình endpoint trong `src/utils/axios.js`  
- Cập nhật stores để gọi API mới
- Implement error handling và loading states
- Thêm interceptors cho authentication

### Tùy chỉnh giao diện
- **Màu sắc**: Chỉnh sửa trong `tailwind.config.js`
- **Dark mode**: Tự động detect system preference
- **Component styling**: Sử dụng TailwindCSS classes
- **Layout**: Responsive design với mobile-first approach
- **Icons**: Thay thế hoặc thêm icon từ Lucide

## Tính năng bảo mật

- **JWT Authentication** với refresh token tự động
- **Route Guards** bảo vệ các trang yêu cầu đăng nhập
- **Role-based Access Control** cho admin
- **CSRF Protection** thông qua token validation
- **Input Validation** ở cả frontend và backend
- **Secure Token Storage** với automatic cleanup

## Performance & UX

- **Lazy Loading** cho các route và components
- **Image Optimization** với lazy loading
- **Loading States** cho tất cả async operations
- **Error Boundaries** với user-friendly messages
- **Caching Strategy** cho dữ liệu static
- **Progressive Web App** features
- **SEO Optimization** với meta tags động

## Đóng góp

1. Fork dự án
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Liên hệ

- Email: bekendwork@gmail.com
- GitHub: [bekend10](https://github.com/bekend10)
- Website: [bekend-dev.com](https:bekend-dev.com)
