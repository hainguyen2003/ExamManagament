<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { register } from "@/services/authService";
import Verify from "@/pages/verify/Verify.vue";

const email = ref("");
const password = ref("");
const fullName = ref("");
const address = ref("");
const phone = ref("");
const showPassword = ref(false);
const loading = ref(false);
const generalError = ref("");
const errors = ref({});
const showVerifyPopup = ref(false);
const showSuccessAlert = ref(false);
const agreeTerms = ref(false);

const router = useRouter();

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const clearError = (field) => {
  if (errors.value[field]) delete errors.value[field];
  generalError.value = "";
};

const validateInput = () => {
  errors.value = {};
  if (!email.value) errors.value.email = "Email không được để trống.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) errors.value.email = "Email không đúng định dạng.";

  if (!password.value) errors.value.password = "Mật khẩu không được để trống.";
  else if (password.value.length < 6 || password.value.length > 15)
    errors.value.password = "Mật khẩu phải từ 6-15 ký tự.";

  if (!fullName.value) errors.value.fullName = "Họ tên không được để trống.";
  if (!address.value) errors.value.address = "Địa chỉ không được để trống.";

  if (!phone.value) errors.value.phone = "Số điện thoại không được để trống.";
  else if (!/^[0-9]{10,11}$/.test(phone.value)) errors.value.phone = "Số điện thoại không hợp lệ.";

  return Object.keys(errors.value).length === 0;
};

const handleRegister = async () => {
  if (!validateInput()) return;

  loading.value = true;
  try {
    await register(email.value, password.value, fullName.value, address.value, phone.value);
    showVerifyPopup.value = true;
  } catch (err) {
    generalError.value = err?.message || "Đăng ký thất bại.";
  } finally {
    loading.value = false;
  }
};

const handleVerified = () => {
  showVerifyPopup.value = false;
  showSuccessAlert.value = true;
  setTimeout(() => {
    router.push("/login");
  }, 1700);
};
</script>

<template>
  <div class="register-container">
    <!-- Alert xác thực thành công -->
    <div
      v-if="showSuccessAlert"
      class="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-lg z-50"
    >
      <div
        class="bg-green-200 p-12 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-6 opacity-0 animate-fade-in scale-150"
      >
        <svg class="w-24 h-24 text-green-800 animate-draw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 13l4 4L19 7"></path>
        </svg>
        <p class="text-4xl font-extrabold text-green-900">Xác thực thành công!</p>
      </div>
    </div>

    <!-- Form đăng ký - chỉ hiển thị nếu chưa xác thực -->
    <form v-if="!showVerifyPopup" class="register-box" @submit.prevent="handleRegister">
      <h2>Đăng ký tài khoản</h2>

      <label class="required-label" for="fullName">Họ tên</label>
      <input id="fullName" v-model="fullName" type="text" required placeholder="Nhập họ tên" @input="clearError('fullName')" />
      <p v-if="errors.fullName" class="error-text">{{ errors.fullName }}</p>

      <label class="required-label" for="email">Email</label>
      <input id="email" v-model="email" type="email" required placeholder="Nhập email" @input="clearError('email')" />
      <p v-if="errors.email" class="error-text">{{ errors.email }}</p>

      <label class="required-label" for="password">Mật khẩu</label>
      <div class="password-wrapper">
        <input
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          placeholder="Nhập mật khẩu"
          @input="clearError('password')"
        />
        <span class="toggle-icon" @click="togglePassword">
          {{ showPassword ? '👁️' : '👁️' }}
        </span>
      </div>
      <p v-if="errors.password" class="error-text">{{ errors.password }}</p>

      <label class="required-label" for="address">Địa chỉ</label>
      <input id="address" v-model="address" type="text" required placeholder="Nhập địa chỉ" @input="clearError('address')" />
      <p v-if="errors.address" class="error-text">{{ errors.address }}</p>

      <label class="required-label" for="phone">Số điện thoại</label>
      <input id="phone" v-model="phone" type="tel" required placeholder="Nhập số điện thoại" @input="clearError('phone')" />
      <p v-if="errors.phone" class="error-text">{{ errors.phone }}</p>

      <div class="checkbox-container">
        <input type="checkbox" id="agree" v-model="agreeTerms" />
        <label for="agree">Tôi đồng ý với <a href="#">Điều khoản & Điều kiện</a></label>
      </div>

      <p v-if="generalError" class="error-text">{{ generalError }}</p>

      <button class="register-btn" type="submit" :disabled="loading || !agreeTerms">
        {{ loading ? "Đang đăng ký..." : "Đăng ký" }}
      </button>

      <div class="links">
        Đã có tài khoản?
        <router-link to="/login">Đăng nhập</router-link>
      </div>
    </form>

    <!-- Popup xác thực -->
    <transition name="fade">
      <div
        v-if="showVerifyPopup"
        class="fixed inset-0 flex items-center backdrop-blur-md justify-center z-50"
      >
        <Verify :email="email" @verified="handleVerified" />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f6fb;
  padding: 40px 16px;
  font-family: 'Segoe UI', sans-serif;
  width: 100%;
}

.register-box {
  background: white;
  padding: 64px 56px;
  border-radius: 24px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

h2 {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
  color: #1e293b;
}

label {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
  display: block;
  color: #334155;
  text-align: left;
}

.required-label::before {
  content: "* ";
  color: red;
}

input {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  background-color: #f1f5f9;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  margin-bottom: 8px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

input:focus {
  background: #fff;
  border-color: #3b82f6;
  outline: none;
}

.password-wrapper {
  position: relative;
}

.toggle-icon {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  font-size: 16px;
  cursor: pointer;
  color: #64748b;
}

.error-text {
  color: #e11d48;
  font-size: 14px;
  margin-top: -4px;
  margin-bottom: 6px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
}

.checkbox-container input {
  width: 18px;
  height: 18px;
}

.register-btn {
  width: 35%;
  margin: 0 auto;
  display: block;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 8px;
  transition: 0.3s;
}

.register-btn:hover {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.links {
  margin-top: 20px;
  font-size: 15px;
  text-align: center;
}

.links a {
  color: #2563eb;
  font-weight: 500;
  text-decoration: none;
}
</style>
  