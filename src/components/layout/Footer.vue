<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        
        <!-- Logo & Mô tả -->
        <div class="footer-brand">
          <div class="brand-logo">
            <BookOpen class="icon" />
            <span class="brand-text">BookShop</span>
          </div>
          <p class="description">
            Cửa hàng sách trực tuyến hàng đầu Việt Nam. Chúng tôi cung cấp những cuốn sách hay nhất
            với giá cả phải chăng và dịch vụ giao hàng nhanh chóng.
          </p>
          <div class="socials">
            <a href="#"><Facebook class="social-icon" /></a>
            <a href="#"><Instagram class="social-icon" /></a>
            <a href="#"><Twitter class="social-icon" /></a>
          </div>
        </div>

        <!-- Liên kết nhanh -->
        <div>
          <h3 class="footer-title">Liên kết nhanh</h3>
          <ul class="footer-links">
            <li><router-link to="/">Trang chủ</router-link></li>
            <li><router-link to="/cart">Giỏ hàng</router-link></li>
            <li><router-link to="/admin">Quản lý</router-link></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>

        <!-- Liên hệ -->
        <div>
          <h3 class="footer-title">Liên hệ</h3>
          <div class="contact-info">
            <p><Phone class="contact-icon" /> 0859 293 744</p>
            <p><Mail class="contact-icon" /> bookshop-service@gmail.com</p>
            <p><MapPin class="contact-icon" /> Nam Từ Liêm - Hà Nội</p>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2025 BookShop. Tất cả quyền được bảo lưu.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { BookOpen, Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-vue-next'
</script>

<style scoped>
/* Default styles (light mode) */
.footer {
  background: linear-gradient(to right, #f1f5f9 , #c3c3c3);
  color: #111827;
  padding-top: 4rem;
  margin-top: 4rem;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: 2fr 1fr 1fr;
  }
}

.footer-brand {
  max-width: 28rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.icon {
  width: 2rem;
  height: 2rem;
  color: #3b82f6;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.description {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.socials {
  display: flex;
  gap: 1rem;
}

.social-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: color 0.2s ease;
}

.social-icon:hover {
  color: #3b82f6;
}

.footer-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #3b82f6;
}

.contact-info p {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
}

.contact-icon {
  margin-right: 0.5rem;
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
}

.footer-bottom {
  border-top: 1px solid #e5e7eb;
  text-align: center;
  padding: 2rem 0 1rem;
  margin-top: 2rem;
  color: #6b7280;
}

/* Dark mode - class-based */
:global(.dark) .footer {
  background: linear-gradient(to right, #111827, #1f2937);
  color: #f9fafb;
}

:global(.dark) .brand-text {
  color: #f9fafb;
}

:global(.dark) .description {
  color: #d1d5db;
}

:global(.dark) .footer-title {
  color: #f9fafb;
}

:global(.dark) .footer-links a {
  color: #d1d5db;
}

:global(.dark) .footer-links a:hover {
  color: #fff;
}

:global(.dark) .contact-info p {
  color: #d1d5db;
}

:global(.dark) .social-icon {
  color: #9ca3af;
}

:global(.dark) .social-icon:hover {
  color: #fff;
}

:global(.dark) .footer-bottom {
  border-color: #374151;
  color: #9ca3af;
}

:global(.dark) .icon {
  color: #60a5fa;
}

:global(.dark) .contact-icon {
  color: #60a5fa;
}
</style>
