<!-- src/components/LoginModal.vue -->
<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <h2>Đăng nhập</h2>
      <form @submit.prevent="handleLogin">
        <label>Email</label>
        <input v-model="email" type="email" required />

        <label>Mật khẩu</label>
        <input v-model="password" type="password" required />

        <button type="submit">Đăng nhập</button>
        <p class="error" v-if="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits(['close', 'success']);
const email = ref('');
const password = ref('');
const error = ref('');
const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value);
    emit('success');
  } catch (e) {
    error.value = 'Sai email hoặc mật khẩu';
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex; justify-content: center; align-items: center;
}
.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  width: 360px;
}
input {
  width: 100%;
  margin-bottom: 12px;
  padding: 8px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
}
.error {
  margin-top: 10px;
  color: red;
}
</style>
