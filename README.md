# BookShop - Cửa hàng sách trực tuyến

Một ứng dụng web bán sách trực tuyến được xây dựng với Vue 3, TailwindCSS và Pinia.

## Tính năng chính

- 🏠 **Trang chủ**: Hiển thị sách nổi bật và danh sách sách theo danh mục
- 🔍 **Tìm kiếm**: Tìm kiếm sách theo tên và tác giả
- 📚 **Chi tiết sách**: Xem thông tin chi tiết, đánh giá và mô tả sách
- 🛒 **Giỏ hàng**: Thêm/xóa sách, điều chỉnh số lượng
- 💳 **Thanh toán**: Quy trình thanh toán hoàn chỉnh với nhiều phương thức
- 🎯 **Quản lý sách**: Thêm, sửa, xóa sách (trang admin)
- 📱 **Responsive**: Tương thích trên mọi thiết bị

## Công nghệ sử dụng

- **Vue 3**: Framework JavaScript
- **Pinia**: State management
- **Vue Router**: Điều hướng
- **TailwindCSS**: Styling
- **Vite**: Build tool
- **Lucide Vue Next**: Icons

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
│   └── BookCard.vue
├── views/
│   ├── Home.vue
│   ├── BookDetail.vue
│   ├── Cart.vue
│   ├── Checkout.vue
│   └── Admin.vue
├── stores/
│   ├── bookStore.js
│   └── cartStore.js
├── router/
│   └── index.js
├── App.vue
├── main.js
└── style.css
```

## Tính năng chi tiết

### Trang chủ
- Hero section với call-to-action
- Danh sách sách nổi bật
- Bộ lọc theo danh mục
- Tìm kiếm sách
- Thống kê tổng quan

### Trang chi tiết sách
- Hình ảnh sách
- Thông tin chi tiết (tên, tác giả, giá, đánh giá)
- Điều chỉnh số lượng
- Thêm vào giỏ hàng
- Mô tả sách

### Giỏ hàng
- Hiển thị danh sách sách đã chọn
- Điều chỉnh số lượng
- Xóa sách khỏi giỏ
- Tính tổng tiền
- Chuyển đến thanh toán

### Thanh toán
- Form thông tin khách hàng
- Chọn phương thức thanh toán
- Xác nhận đơn hàng
- Thông báo thành công

### Quản lý sách (Admin)
- Danh sách tất cả sách
- Thêm sách mới
- Chỉnh sửa thông tin sách
- Xóa sách
- Quản lý trạng thái tồn kho

## Tùy chỉnh

### Thêm sách mới
Sách mặc định được lưu trong `src/stores/bookStore.js`. Bạn có thể:
- Thêm sách thông qua trang admin
- Chỉnh sửa trực tiếp trong store
- Kết nối với API backend

### Tùy chỉnh giao diện
- Màu sắc: Chỉnh sửa trong `tailwind.config.js`
- Component styling: Sử dụng TailwindCSS classes
- Layout: Chỉnh sửa trong các component layout

### Thêm tính năng
- Đánh giá sách
- Wishlist
- Lịch sử đơn hàng
- Tài khoản người dùng
- Tích hợp thanh toán thực tế

## Đóng góp

1. Fork dự án
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Liên hệ

- Email: your-email@example.com
- GitHub: [your-username](https://github.com/your-username)
- Website: [your-website.com](https://your-website.com)
