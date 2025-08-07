<template>
  <div class="layout-wrapper">
    <aside class="sidebar">
      <div class="logo">EXAM</div>
      <nav class="sidebar-nav">
        <router-link to="/exam-manager" class="nav-item">Qlý môn & đề thi</router-link>
       <router-link to="/question" class="nav-item"> Thêm câu hỏi</router-link>
        <router-link to="/generated" class="nav-item"> Tạo đề thi</router-link>
        <router-link to="/result-manager" class="nav-item">Thống kê file kết quả</router-link>
      </nav>
    </aside>

    <div class="main-area">
      <header class="top-navbar">
        <div class="top-title">Trang cập nhật đề trắc nghiệm</div>
        <div class="top-actions">
          <template v-if="user">
            <span class="user-info"> {{ user.fullName }}</span>
            <button class="logout-btn" @click="logout">Đăng xuất</button>
          </template>
          <template v-else>
            <router-link to="/login" class="login-btn">Đăng nhập</router-link>
          </template>
        </div>
      </header>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const user = computed(() => authStore.user);

const logout = () => {
  if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
    authStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
html,
body,
#app {
  height: 100%;
  width: 98%;
}

.layout-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  background: #c2ddf7;
  font-family: 'Segoe UI', sans-serif;
  overflow: hidden;
  border-radius: 8px;
}

.sidebar {
  width: 19%;
  background: #2c3e50;
  color: #b2f4bb;
  padding: 18px;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  border-radius: 8px 0px 0px 8px;
}

.logo {
  font-size: 36px;
  font-weight: bold;
  margin: 32px 12px 32px 12px;
  text-align: center;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-item {
  color: #bfe8f3;
  text-decoration: none;
  font-weight: 500;
  font-size: 22px;
  padding: 10px 16px;
  border-radius: 8px;
  transition: background 0.3s;
}

.nav-item.router-link-exact-active,
.nav-item:hover {
  background: #1abc9c;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100vw - 240px);
  height: 100vh;
}

.top-navbar {
  background: #76e0f1;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 0px 8px 0px 0px;
}

.top-title {
  font-size: 25px;
  font-weight: 600;
  color: #34495e;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.login-btn,
.logout-btn {
  font-size: 15px;
  padding: 8px 16px;
  border-radius: 6px;
  color: #ffffff;
  background-color: #3b82f6;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover,
.logout-btn:hover {
  background-color: #2563eb;
}

.main-content {
  padding: 25px;
  flex: 1;
  background: #fcfbfb;
  overflow-y: auto;
  height: 100%;
  width: 100%;
}
</style>
