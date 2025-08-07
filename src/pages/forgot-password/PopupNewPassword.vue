<script setup>
import { ref } from "vue";
import * as authService from "@/services/authService";

const props = defineProps({
  email: { type: String, required: true },
  otp: { type: String, required: true },
});
const emit = defineEmits(["password-changed"]);

const newPassword = ref("");
const loading = ref(false);
const errors = ref({});
const generalError = ref("");

const validateInput = () => {
  errors.value = {};
  if (!newPassword.value) {
    errors.value.newPassword = "Mật khẩu không được để trống.";
  } else if (newPassword.value.length < 6 || newPassword.value.length > 15) {
    errors.value.newPassword = "Mật khẩu phải từ 6-15 ký tự.";
  }
  return Object.keys(errors.value).length === 0;
};

const handleChangePassword = async () => {
  if (!validateInput()) return;
  loading.value = true;
  try {
    await authService.forgotPassword(props.email, newPassword.value, props.otp);
    emit("password-changed");
  } catch (error) {
    generalError.value = error?.message || "Đổi mật khẩu thất bại!";
  } finally {
    loading.value = false;
  }
};

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
  generalError.value = "";
};
</script>

<template>
  <div class="popup-container">
    <h2 class="popup-title">
      🔒 Nhập mật khẩu mới
    </h2>

    <form @submit.prevent="handleChangePassword" class="popup-form">
      <input
        v-model="newPassword"
        type="password"
        maxlength="15"
        class="otp-like-input"
        placeholder="••••••"
        @input="clearError('newPassword')"
      />

      <p v-if="errors.newPassword" class="error-text">{{ errors.newPassword }}</p>
      <p v-if="generalError" class="error-text">{{ generalError }}</p>

      <button type="submit" :disabled="loading" class="confirm-btn">
        <span v-if="loading" class="loader"></span>
        Xác nhận
      </button>
    </form>
  </div>
</template>

<style scoped>
/* Tổng thể popup */
.popup-container {
  width: 100%;
  max-width: 360px;
  background: #fff;
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  text-align: center;
}

/* Tiêu đề */
.popup-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

/* Input giống ô OTP */
.otp-like-input {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 4px;
  padding: 12px;
  width: 100%;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  outline: none;
  transition: all 0.3s ease;
}
.otp-like-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Nút xác nhận */
.confirm-btn {
  width: 100%;
  margin-top: 14px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 10px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  cursor: pointer;
  transition: 0.3s;
}
.confirm-btn:hover {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
}
.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loader */
.loader {
  border: 3px solid #fff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Thông báo lỗi */
.error-text {
  font-size: 14px;
  color: #e11d48;
  margin-top: 6px;
}
</style>
