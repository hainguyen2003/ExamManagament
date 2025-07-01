<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import * as authService from "@/services/authService";

const props = defineProps({
  email: { type: String, required: true },
});

const emit = defineEmits(["verified"]);
const otpInputs = reactive(["", "", "", "", "", ""]);
const loading = ref(false);
const generalError = ref("");
const otpError = ref("");
const timer = ref("02:00");
const countdown = ref(120);
let timerInterval;

onMounted(() => startCountdown());
onUnmounted(() => clearInterval(timerInterval));

const startCountdown = () => {
  clearInterval(timerInterval);
  countdown.value = 120;
  timerInterval = setInterval(() => {
    countdown.value--;
    const minutes = String(Math.floor(countdown.value / 60)).padStart(2, "0");
    const seconds = String(countdown.value % 60).padStart(2, "0");
    timer.value = `${minutes}:${seconds}`;
    if (countdown.value <= 0) {
      clearInterval(timerInterval);
      alert("Hết thời gian! Vui lòng thử lại.");
    }
  }, 1000);
};

const focusNext = (index) => {
  if (index < otpInputs.length - 1) {
    document.getElementById(`otp-${index + 1}`)?.focus();
  }
};

const focusPrev = (index) => {
  if (index > 0) {
    document.getElementById(`otp-${index - 1}`)?.focus();
  }
};

const getOtp = () => otpInputs.join("");

const handleVerify = async () => {
  const otp = getOtp();
  if (otp.length !== 6) {
    otpError.value = "OTP phải đủ 6 ký tự.";
    return;
  }
  loading.value = true;
  try {
    await authService.verifyAccount(props.email, otp);
    emit("verified", otp);
    clearInterval(timerInterval);
  } catch (error) {
    generalError.value = error?.message || "Xác thực thất bại. Vui lòng thử lại!";
  } finally {
    loading.value = false;
  }
};

const handleRegenerateOTP = async () => {
  loading.value = true;
  try {
    await authService.regenerateOTP(props.email);
    alert("OTP mới đã được gửi!");
    startCountdown();
  } catch (error) {
    generalError.value = error?.message || "Không thể gửi lại OTP.";
  } finally {
    loading.value = false;
  }
};

const clearError = () => {
  otpError.value = "";
  generalError.value = "";
};
</script>

<template>
  <div class="verify-container">
    <div class="verify-box">
      <h2>XÁC THỰC TÀI KHOẢN</h2>
      <p>Mã OTP đã được gửi tới <strong>{{ email }}</strong></p>

      <form @submit.prevent="handleVerify">
        <div class="otp-inputs">
          <input
            v-for="(digit, index) in otpInputs"
            :key="index"
            :id="'otp-' + index"
            v-model="otpInputs[index]"
            maxlength="1"
            type="text"
            class="otp-box"
            @input="(e) => { clearError(); if (e.target.value) focusNext(index); }"
            @keydown.backspace="() => { if (!otpInputs[index]) focusPrev(index); }"
          />
        </div>

        <p v-if="otpError" class="error-text">{{ otpError }}</p>
        <p v-if="generalError" class="error-text">{{ generalError }}</p>

        <button type="submit" class="btn-confirm" :disabled="loading">
          <span v-if="loading" class="loader"></span>
          Xác nhận
        </button>
      </form>

      <div class="note">
        Mã có hiệu lực trong: <span class="countdown">{{ timer }}</span>
      </div>

      <div class="resend">
        Không nhận được mã?
        <button class="btn-resend" @click="handleRegenerateOTP" :disabled="loading">
          Gửi lại
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verify-container {
  width: 100%;
  height: 100vh;
  background: #f3f6fb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.verify-box {
  background: white;
  padding: 48px;
  border-radius: 24px;
  max-width: 520px;
  width: 100%;
  text-align: center;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
}

h2 {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.otp-inputs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
}

.otp-box {
  width: 52px;
  height: 58px;
  font-size: 22px;
  text-align: center;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background-color: #f8fafc;
  outline: none;
  transition: 0.2s ease;
}

.otp-box:focus {
  border-color: #2563eb;
  background: #fff;
}

.btn-confirm {
  background: #2563eb;
  color: white;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-bottom: 16px;
  width: 100%;
}

.btn-confirm:hover {
  background: #1d4ed8;
}

.note {
  font-size: 15px;
  color: #475569;
  margin-bottom: 10px;
}

.countdown {
  font-weight: bold;
  color: #1e293b;
}

.resend {
  font-size: 15px;
  color: #334155;
}

.btn-resend {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  margin-left: 6px;
  cursor: pointer;
  padding: 0;
}

.btn-resend:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #e11d48;
  margin-bottom: 12px;
  font-size: 14px;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
