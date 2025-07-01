import { defineStore } from "pinia";
import { loginUser } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    user: null,
    isAuthenticated: false,
  }),
  actions: {
    async login(email, password) {
      const userData = await loginUser(email, password);

      this.token = userData.token;
      this.user = userData;
      this.isAuthenticated = true;

      // Lưu full dữ liệu vào localStorage
      localStorage.setItem(
        "auth",
        JSON.stringify({ token: userData.token, user: userData })
      );

      return userData; // ✅ CẦN THIẾT để Login.vue nhận dữ liệu
    },

    restore() {
      const saved = localStorage.getItem("auth");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.token = parsed.token || parsed.user?.token;
          this.user = parsed.user;
          this.isAuthenticated = true;
        } catch (e) {
          localStorage.removeItem("auth");
        }
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem("auth");
    },
  },
});
