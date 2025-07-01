import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // đổi nếu dùng domain khác
  timeout: 10000,
});

// ✅ Gắn token vào mỗi request nếu có
api.interceptors.request.use(
  (config) => {
    const auth = useAuthStore(); // pinia store
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  Xử lý response và lỗi rõ ràng
api.interceptors.response.use(
  (response) => response.data, // chỉ lấy phần data ra
  (error) => {
    const res = error.response;
    // Nếu lỗi 401 có thể logout hoặc xử lý thông báo
    if (res?.status === 401) {
      console.warn("🔒 Token hết hạn hoặc không hợp lệ");
      // Optional: gọi auth.logout() nếu muốn tự động đăng xuất
    }
    return Promise.reject(res?.data || error);
  }
);

export default api;
