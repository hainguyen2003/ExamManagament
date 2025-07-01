import api from "@/services/api"; // Đã cấu hình baseURL = http://localhost:8080/api

// Đăng nhập
export const loginUser = async (email, password) => {
  return api.post("/auth/login", { email, password }).then((res) => {
    if (res?.success) return res.data;
    throw new Error(res.error?.message || "Đăng nhập thất bại.");
  });
};

// Đăng xuất (nếu có API thì thêm sau)
export const logoutUser = async () => {
  localStorage.removeItem("auth"); // chỉ logout local
};

// Đăng ký
export const register = async (email, password, fullName, address, phone) => {
  return api
    .post("/auth/register", {
      email,
      password,
      fullName,
      address,
      phone,
    })
    .then((res) => {
      if (res?.success) return res.data;
      throw new Error(res.error?.message || "Đăng ký thất bại.");
    });
};

// Xác thực tài khoản
export const verifyAccount = async (email, otp) => {
  return api.put("/auth/verify-account", { email, otp }).then((res) => {
    if (res?.success) return res.data;
    throw new Error(res.error?.message || "Xác thực thất bại.");
  });
};

// Gửi lại OTP
export const regenerateOTP = async (email) => {
  return api.put("/auth/regenerate-otp", { email }).then((res) => {
    if (res?.success) return res.data;
    throw new Error(res.error?.message || "Gửi lại OTP thất bại.");
  });
};

// Quên mật khẩu
export const forgotPassword = async (email, password, otp) => {
  return api
    .put("/auth/forgot-password", { email, password, otp })
    .then((res) => {
      if (res?.success) return res.data;
      throw new Error(res.error?.message || "Xác thực OTP thất bại.");
    });
};

// Lấy token từ localStorage (key = "auth")
export const getToken = () => {
  const authData = localStorage.getItem("auth");
  return authData ? JSON.parse(authData)?.user?.token : null;
};

// Lấy thông tin hồ sơ
export const getProfile = async () => {
  return api
    .get("/auth/profile", {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    .then((res) => res.data);
};

// Cập nhật hồ sơ
export const updateProfile = async (data) => {
  return api
    .put("/auth/profile", data, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
    .then((res) => {
      if (res.success) return res.data;
      throw new Error(res.error?.message || "Cập nhật thất bại.");
    });
};

// Lấy avatar
export const getAvatar = async (id) => {
  if (!id) {
    const profile = await getProfile();
    id = profile.id;
  }
  return api.get(`/user/${id}/avatar`);
};

// Cập nhật avatar
export const postAvatar = async (id, avatarFile) => {
  if (!id) {
    const profile = await getProfile();
    id = profile.id;
  }
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  return api.post(`/user/${id}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
