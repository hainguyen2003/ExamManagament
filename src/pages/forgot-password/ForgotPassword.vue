<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import * as authService from "@/services/authService";
import PopupNewPassword from "./PopupNewPassword.vue";
import Verify from "../verify/Verify.vue";

const email = ref("");
const loading = ref(false);
const generalError = ref("");
const errors = ref({});
const showVerifyPopup = ref(false);
const showNewPasswordPopup = ref(false);
const showSuccessAlert = ref(false);
const otpValue = ref("");

const router = useRouter();

const validateInput = () => {
  errors.value = {};
  if (!email.value) {
    errors.value.email = "Email không được để trống.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = "Email không đúng định dạng.";
  }
  return Object.keys(errors.value).length === 0;
};

const handleSubmitEmail = async () => {
  loading.value = true;
  generalError.value = "";

  if (!validateInput()) {
    loading.value = false;
    return;
  }

  try {
    await authService.regenerateOTP(email.value);
    showVerifyPopup.value = true;
  } catch (error) {
    generalError.value = error?.message || "Không tìm thấy email.";
  } finally {
    loading.value = false;
  }
};

const handleOtpVerified = (otp) => {
  otpValue.value = otp;
  showVerifyPopup.value = false;
  showNewPasswordPopup.value = true;
};

const handlePasswordChanged = () => {
  showNewPasswordPopup.value = false;
  showSuccessAlert.value = true;
  setTimeout(() => {
    router.push("/login");
  }, 1700);
};

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field];
  }
  generalError.value = "";
};
</script>

<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <h1>Đặt lại mật khẩu</h1>
      <p>Vui lòng nhập Email của bạn để lấy lại mật khẩu!</p>

      <form @submit.prevent="handleSubmitEmail" class="form-content">
        <!-- Email -->
        <div>
          <label for="email" class="required-label">Email</label>
          <input
            v-model="email"
            type="email"
            id="email"
            required
            @input="clearError('email')"
            class="input-field"
            placeholder="Nhập email"
          />
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>

        <p v-if="generalError" class="error-message center">{{ generalError }}</p>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="loader"></span>
          Xác nhận
        </button>
      </form>

      <div class="back-login">
        <router-link to="/login">Quay lại đăng nhập</router-link>
      </div>
    </div>

    <!-- Popup -->
    <transition name="fade">
      <div v-if="showVerifyPopup" class="popup-overlay">
        <Verify :email="email" @verified="handleOtpVerified" />
      </div>
    </transition>

    <div v-if="showNewPasswordPopup" class="popup-overlay">
      <PopupNewPassword :email="email" :otp="otpValue" @password-changed="handlePasswordChanged" />
    </div>

    <div v-if="showSuccessAlert" class="popup-overlay">
      <div class="success-box">
        <svg class="w-24 h-24 text-green-800 animate-draw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 13l4 4L19 7"></path>
        </svg>
        <p class="text-4xl font-extrabold text-green-900">Đổi mật khẩu thành công!</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f6fb;
  padding: 40px 16px;
  width: 100%;
}

.forgot-password-container {
  background: white;
  max-width: 500px;
  width: 100%;
  padding: 48px;
  border-radius: 20px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.08);
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
  animation: fadeIn 0.5s ease;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

p {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 24px;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 22px;
  text-align: left;
}

.required-label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #334155;
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #d1d5db;
  background-color: #f1f5f9;
  border-radius: 10px;
  font-size: 16px;
}

.input-field:focus {
  background: #fff;
  border-color: #3b82f6;
  outline: none;
}

.submit-btn {
  width: 35%;
  margin: 0 auto;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 10px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  cursor: pointer;
  transition: 0.3s;
}

.submit-btn:hover {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  font-size: 14px;
  color: #e11d48;
  margin-top: 4px;
}

.error-message.center {
  text-align: center;
}

.back-login {
  margin-top: 18px;
  font-size: 14px;
}

.back-login a {
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
}

.back-login a:hover {
  text-decoration: underline;
}

.popup-overlay {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.success-box {
  background: #bbf7d0;
  padding: 48px;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeIn 0.5s ease, scaleIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(1.2); }
  to { transform: scale(1); }
}
</style>
