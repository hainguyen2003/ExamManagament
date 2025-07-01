<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Đăng nhập</h1>
      <p>
        Chưa có tài khoản?
        <router-link to="/register">Đăng ký tại đây.</router-link>
      </p>

      <form @submit.prevent="handleLogin" class="form-content">
        <!-- Email -->
        <div>
          <label for="email" class="required-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="input-field"
            required
            @input="clearError('email')"
          />
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>

        <!-- Password -->
     <!-- Password -->
      <div>
        <label for="password" class="required-label">Mật khẩu</label>
        <div class="password-wrapper">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="input-field"
            required
            @input="clearError('password')"
          />
          <button type="button" class="toggle-icon" @click="togglePasswordVisibility">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
        <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
      </div>


        <!-- Error -->
        <p v-if="generalError" class="error-message center">{{ generalError }}</p>

        <!-- Submit -->
        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="loader"></span>
          Đăng nhập
        </button>

        <div class="forgot-password">
          <router-link to="/forgot-password">Quên mật khẩu?</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errors = ref({});
const generalError = ref('');

const router = useRouter();
const authStore = useAuthStore();

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const clearError = (field) => {
  if (errors.value[field]) errors.value[field] = '';
  generalError.value = '';
};

const validateInput = () => {
  errors.value = {};
  if (!email.value) {
    errors.value.email = 'Email không được để trống.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Email không đúng định dạng.';
  }

  if (!password.value) {
    errors.value.password = 'Mật khẩu không được để trống.';
  } else if (password.value.length < 6 || password.value.length > 15) {
    errors.value.password = 'Mật khẩu phải từ 6-15 ký tự.';
  }

  return Object.keys(errors.value).length === 0;
};

const handleLogin = async () => {
  isLoading.value = true;
  generalError.value = '';

  if (!validateInput()) {
    isLoading.value = false;
    return;
  }

  try {
    await authStore.login(email.value, password.value);
    router.push("/exam-manager"); // ✅ điều phối sang layout chính
  } catch (err) {
    generalError.value = err?.message || 'Đăng nhập thất bại!';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f6fb;
  padding: 40px 16px;
  width: 100%;
}

.login-container {
  background: white;
  max-width: 600px;
  width: 100%;
  padding: 64px 56px;
  border-radius: 24px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', sans-serif;
  animation: fadeIn 0.5s ease;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  color: #1e293b;
}

p {
  text-align: center;
  font-size: 16px;
  color: #64748b;
  margin-bottom: 30px;
}


.form-content {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.required-label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #334155;
  display: block;
  text-align: left;
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  background-color: #f1f5f9;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.input-field:focus {
  background: #fff;
  border-color: #3b82f6;
  outline: none;
}

.password-wrapper {
  position: relative;
}

.toggle-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none; 
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  outline: none; 
  padding: 0;    
}
.login-btn {
  width: 40%;
  margin: 0 auto;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 12px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  cursor: pointer;
  transition: 0.3s;
}

.login-btn:hover {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid white;
  border-top: 2px solid #1d4ed8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  font-size: 14px;
  color: #e11d48;
  margin-top: 4px;
}

.error-message.center {
  text-align: center;
}

.forgot-password {
  text-align: center;
  margin-top: 18px;
  font-size: 15px;
}
</style>
