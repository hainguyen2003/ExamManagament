<template>
  <div class="layout-wrapper">
    <aside class="sidebar">
      <div class="logo"> EXAM</div>
      <nav class="sidebar-nav">
        <router-link to="/exam-manager" class="nav-item">Tạo kỳ thi</router-link>
        <router-link to="/question-manager" class="nav-item">Cập nhật đề & đáp án</router-link>
        <!-- <router-link to="/result-manager" class="nav-item">Thống kê kết quả</router-link> -->
      </nav>
    </aside>

    <div class="main-area">
      <header class="top-navbar">
        <div class="top-title">Trang cập nhật đề trắc nghiệm</div>
        <div class="top-actions">
          <span>.</span>
        </div>
      </header>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
html, body,
#app {
  height: 100%;
  width: 100%;

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
  width: 240px;
  background: #2c3e50;
  color: #b2f4bb;
  padding: 18px;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  border-radius: 8px 0px 0px 8px;
}

.logo {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 32px;
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
  font-size: 20px;
  font-weight: 600;
  color: #34495e;
}

.main-content {
  padding: 28px;
  flex: 1;
  background: #fcfbfb;
  overflow-y: auto;
  height: 100%;
}
</style>
