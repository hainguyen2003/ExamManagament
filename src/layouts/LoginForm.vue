<template>
  <div class="login-box">
    <h2>Đăng nhập</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" placeholder="Email" type="email" required />
      <input v-model="password" placeholder="Mật khẩu" type="password" required />
      <button type="submit">Đăng nhập</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/services/api'

const emit = defineEmits(['login-success'])
const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    const res = await axios.post('/auth/login', { email: email.value, password: password.value })
    emit('login-success', res.data)
  } catch (err) {
    alert('Sai tài khoản hoặc mật khẩu')
  }
}
</script>

<style scoped>
.login-box {
  background: white;
  padding: 32px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 0 12px rgba(0,0,0,0.2);
}
</style>
